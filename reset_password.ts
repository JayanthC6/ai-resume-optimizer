import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(email: string, newPass: string) {
  console.log(`--- Password Reset Utility ---`);
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    console.log(`SUCCESS: Password for ${email} has been reset to: ${newPass}`);
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = 'jayanthjayanthc96@gmail.com';
const temporaryPassword = 'Password123!';

resetPassword(targetEmail, temporaryPassword);
