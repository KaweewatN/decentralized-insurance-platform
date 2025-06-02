/*
  Warnings:

  - You are about to drop the column `emergencyCoverage` on the `HealthPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalCoverage` on the `HealthPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `userWalletAddress` on the `HealthPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `userWalletAddress` on the `LifePolicy` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `Policy` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ClaimType" ADD VALUE 'LIFE';

-- DropForeignKey
ALTER TABLE "HealthPolicy" DROP CONSTRAINT "HealthPolicy_userWalletAddress_fkey";

-- DropForeignKey
ALTER TABLE "LifePolicy" DROP CONSTRAINT "LifePolicy_userWalletAddress_fkey";

-- AlterTable
ALTER TABLE "HealthPolicy" DROP COLUMN "emergencyCoverage",
DROP COLUMN "hospitalCoverage",
DROP COLUMN "userWalletAddress",
ADD COLUMN     "expectedNumber" INTEGER,
ALTER COLUMN "medicalCoverage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LifePolicy" DROP COLUMN "userWalletAddress";

-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "transactionHash",
ADD COLUMN     "contractCreationHash" TEXT,
ADD COLUMN     "purchaseTransactionHash" TEXT;
