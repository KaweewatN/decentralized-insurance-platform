/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `HealthPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `hospital` on the `HealthPolicy` table. All the data in the column will be lost.
  - Added the required column `emergencyCoverage` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exerciseFrequency` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalCoverage` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicalCoverage` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smokingStatus` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HealthPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('NEVER', 'FORMER', 'CURRENT');

-- CreateEnum
CREATE TYPE "ExerciseFrequency" AS ENUM ('NONE', 'LIGHT', 'MODERATE', 'HEAVY');

-- CreateEnum
CREATE TYPE "LifePolicyType" AS ENUM ('TERM', 'WHOLE', 'UNIVERSAL', 'VARIABLE');

-- CreateEnum
CREATE TYPE "LifestyleRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "HealthPolicy" DROP COLUMN "diagnosis",
DROP COLUMN "hospital",
ADD COLUMN     "bmi" DECIMAL(5,2),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emergencyCoverage" DECIMAL(10,5) NOT NULL,
ADD COLUMN     "exerciseFrequency" "ExerciseFrequency" NOT NULL,
ADD COLUMN     "hospitalCoverage" DECIMAL(10,5) NOT NULL,
ADD COLUMN     "medicalCoverage" DECIMAL(10,5) NOT NULL,
ADD COLUMN     "preExistingConditions" TEXT,
ADD COLUMN     "smokingStatus" "SmokingStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userWalletAddress" TEXT;

-- CreateTable
CREATE TABLE "LifePolicy" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryRelation" TEXT NOT NULL,
    "beneficiaryContact" TEXT NOT NULL,
    "policyTerm" INTEGER NOT NULL,
    "policyType" "LifePolicyType" NOT NULL,
    "medicalHistory" TEXT,
    "lifestyleRisk" "LifestyleRisk" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userWalletAddress" TEXT,

    CONSTRAINT "LifePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifePolicy_policyId_key" ON "LifePolicy"("policyId");

-- CreateIndex
CREATE INDEX "LifePolicy_policyId_idx" ON "LifePolicy"("policyId");

-- CreateIndex
CREATE INDEX "HealthPolicy_policyId_idx" ON "HealthPolicy"("policyId");

-- AddForeignKey
ALTER TABLE "HealthPolicy" ADD CONSTRAINT "HealthPolicy_userWalletAddress_fkey" FOREIGN KEY ("userWalletAddress") REFERENCES "User"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifePolicy" ADD CONSTRAINT "LifePolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifePolicy" ADD CONSTRAINT "LifePolicy_userWalletAddress_fkey" FOREIGN KEY ("userWalletAddress") REFERENCES "User"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;
