import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleLoginDto,
} from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';

const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        hashedPassword,
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message:
          'If the account exists, a password reset link will be sent shortly.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(resetToken);
    const resetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: resetTokenHash,
        resetPasswordTokenExpiresAt: resetTokenExpiresAt,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    await this.deliverResetLink(user.email, resetUrl);

    const response: {
      message: string;
      resetToken?: string;
      resetUrl?: string;
    } = {
      message:
        'If the account exists, a password reset link will be sent shortly.',
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = resetToken;
      response.resetUrl = resetUrl;
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = this.hashResetToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: hashedToken,
        resetPasswordTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    return {
      message: 'Password has been reset successfully. Please log in.',
    };
  }

  async googleLogin(dto: GoogleLoginDto) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new BadRequestException('Google sign-in is not configured');
    }

    try {
      if (!this.googleClient) {
        this.googleClient = new OAuth2Client(googleClientId);
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      const email = payload?.email?.toLowerCase();
      const isEmailVerified = payload?.email_verified === true;

      if (!email || !isEmailVerified) {
        throw new UnauthorizedException('Google account could not be verified');
      }

      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new UnauthorizedException(
          'Google sign-in is only available for existing HiredLens accounts',
        );
      }

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Google sign-in failed');
    }
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscription: user.subscription,
      },
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async deliverResetLink(email: string, resetUrl: string) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPortRaw = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass || !smtpFrom) {
      const message = 'SMTP is not fully configured. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.';

      if (process.env.NODE_ENV === 'production') {
        this.logger.error(message);
        throw new InternalServerErrorException(
          'Password reset email service is unavailable. Please try again later.',
        );
      }

      this.logger.warn(`${message} Using dev fallback log for reset link.`);
      this.logger.log(`[Auth] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    const smtpPort = Number(smtpPortRaw);
    if (Number.isNaN(smtpPort)) {
      this.logger.error(`Invalid SMTP_PORT value: ${smtpPortRaw}`);
      throw new InternalServerErrorException(
        'Password reset email service is unavailable. Please try again later.',
      );
    }

    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Reset your HiredLens password',
        text: `We received a request to reset your HiredLens password.\n\nUse this link to reset your password:\n${resetUrl}\n\nThis link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.\n\nIf you did not request this, you can safely ignore this email.`,
        html: `<p>We received a request to reset your HiredLens password.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.</p><p>If you did not request this, you can safely ignore this email.</p>`,
      });

      this.logger.log(`[Auth] Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `[Auth] Failed to send password reset email to ${email}: ${error?.message || error}`,
      );
      throw new InternalServerErrorException(
        'Password reset email service is unavailable. Please try again later.',
      );
    }
  }
}
