import { IsString, IsEnum, MaxLength, IsOptional } from 'class-validator';

export enum OutreachType {
  COVER_LETTER = 'cover_letter',
  RECRUITER_MESSAGE = 'recruiter_message',
  FOLLOW_UP_EMAIL = 'follow_up_email',
}

export enum OutreachTone {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  CONFIDENT = 'confident',
}

export enum OutreachLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export class GenerateOutreachDto {
  @IsString()
  analysisId!: string;

  @IsEnum(OutreachType)
  type!: OutreachType;

  @IsEnum(OutreachTone)
  tone!: OutreachTone;

  @IsEnum(OutreachLength)
  length!: OutreachLength;
}

export class UpdateOutreachDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;
}
