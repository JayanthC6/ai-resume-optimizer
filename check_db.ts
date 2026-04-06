import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Integrity Check ---');
  try {
    const userCount = await prisma.user.count();
    const resumeCount = await prisma.resume.count();
    const interviewCount = await prisma.interviewSession?.count() || 0;
    
    console.log(`Users: ${userCount}`);
    console.log(`Resumes: ${resumeCount}`);
    console.log(`Interview Sessions: ${interviewCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 5, select: { email: true } });
      console.log('Sample User Emails:');
      users.forEach(u => console.log(` - ${u.email}`));
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
