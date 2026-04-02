ALTER TABLE "User"
ADD COLUMN "resetPasswordTokenHash" TEXT,
ADD COLUMN "resetPasswordTokenExpiresAt" TIMESTAMP(3);
