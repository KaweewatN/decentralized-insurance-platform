/*
  Warnings:

  - A unique constraint covering the columns `[policyIdOnchain]` on the table `Policy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "policyIdOnchain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyIdOnchain_key" ON "Policy"("policyIdOnchain");
