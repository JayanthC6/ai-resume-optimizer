-- CreateTable
CREATE TABLE "ReverseQuestionSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReverseQuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReverseQuestionSet_userId_idx" ON "ReverseQuestionSet"("userId");

-- CreateIndex
CREATE INDEX "ReverseQuestionSet_analysisId_idx" ON "ReverseQuestionSet"("analysisId");

-- AddForeignKey
ALTER TABLE "ReverseQuestionSet" ADD CONSTRAINT "ReverseQuestionSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReverseQuestionSet" ADD CONSTRAINT "ReverseQuestionSet_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
