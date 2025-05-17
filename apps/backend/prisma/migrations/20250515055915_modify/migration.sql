/*
  Warnings:

  - You are about to drop the column `expiry` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Policy` table. All the data in the column will be lost.
  - Added the required column `contractAddress` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageAmount` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageEndDate` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageStartDate` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionHash` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('All', 'Active', 'Expired', 'PendingPayment', 'Claimed');

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "contractAddress" TEXT;

-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "expiry",
DROP COLUMN "isActive",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "coverageAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "coverageEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "coverageStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "status" "PolicyStatus" NOT NULL,
ADD COLUMN     "transactionHash" TEXT NOT NULL;
