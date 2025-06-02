/*
  Warnings:

  - The primary key for the `Claim` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FlightPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HealthPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Policy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RainfallPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EventLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_policyId_fkey";

-- DropForeignKey
ALTER TABLE "EventLog" DROP CONSTRAINT "EventLog_walletAddress_fkey";

-- DropForeignKey
ALTER TABLE "FlightPolicy" DROP CONSTRAINT "FlightPolicy_policyId_fkey";

-- DropForeignKey
ALTER TABLE "HealthPolicy" DROP CONSTRAINT "HealthPolicy_policyId_fkey";

-- DropForeignKey
ALTER TABLE "RainfallPolicy" DROP CONSTRAINT "RainfallPolicy_policyId_fkey";

-- AlterTable
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "policyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Claim_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Claim_id_seq";

-- AlterTable
ALTER TABLE "FlightPolicy" DROP CONSTRAINT "FlightPolicy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "policyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FlightPolicy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FlightPolicy_id_seq";

-- AlterTable
ALTER TABLE "HealthPolicy" DROP CONSTRAINT "HealthPolicy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "policyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "HealthPolicy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HealthPolicy_id_seq";

-- AlterTable
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Policy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Policy_id_seq";

-- AlterTable
ALTER TABLE "RainfallPolicy" DROP CONSTRAINT "RainfallPolicy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "policyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RainfallPolicy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RainfallPolicy_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nonce";

-- DropTable
DROP TABLE "EventLog";

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightPolicy" ADD CONSTRAINT "FlightPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthPolicy" ADD CONSTRAINT "HealthPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RainfallPolicy" ADD CONSTRAINT "RainfallPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
