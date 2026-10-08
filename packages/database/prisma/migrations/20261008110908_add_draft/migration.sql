-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Draft_userId_idx" ON "Draft"("userId");

-- CreateIndex
CREATE INDEX "Draft_analysisId_idx" ON "Draft"("analysisId");

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
