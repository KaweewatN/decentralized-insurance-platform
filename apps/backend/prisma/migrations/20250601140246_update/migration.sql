/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `Claim` table. All the data in the column will be lost.
  - The `status` column on the `Claim` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[claimedTransactionHash]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfIncident` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Claim_transactionHash_key";

-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "transactionHash",
ADD COLUMN     "claimedTransactionHash" TEXT,
ADD COLUMN     "dateOfIncident" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimedTransactionHash_key" ON "Claim"("claimedTransactionHash");
