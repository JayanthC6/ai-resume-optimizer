import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin(email: string, pass: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`TEST_OUT: USER_NOT_FOUND`);
      return;
    }
    const valid = await bcrypt.compare(pass, user.hashedPassword);
    console.log(`TEST_OUT: RESULT=${valid ? 'SUCCESS' : 'FAILURE'}`);
  } catch (err) {
    console.log(`TEST_OUT: ERROR=${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin('jayanthjayanthc96@gmail.com', 'Password123!');
