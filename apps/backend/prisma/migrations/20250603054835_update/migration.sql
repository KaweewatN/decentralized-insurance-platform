/*
  Warnings:

  - A unique constraint covering the columns `[policyIdOnchain]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "policyIdOnchain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Claim_policyIdOnchain_key" ON "Claim"("policyIdOnchain");
