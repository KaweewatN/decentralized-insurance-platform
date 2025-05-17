/*
  Warnings:

  - You are about to drop the column `documentHash` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the `OracleRate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transactionHash]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionHash` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('HEALTH', 'FLIGHT', 'RAINFALL');

-- DropIndex
DROP INDEX "Claim_documentHash_key";

-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "documentHash",
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "transactionHash" TEXT NOT NULL,
ADD COLUMN     "type" "ClaimType" NOT NULL DEFAULT 'HEALTH';

-- DropTable
DROP TABLE "OracleRate";

-- CreateTable
CREATE TABLE "FlightClaim" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "depAirport" TEXT NOT NULL,
    "arrAirport" TEXT NOT NULL,
    "depTime" TEXT NOT NULL,
    "flightDate" TIMESTAMP(3) NOT NULL,
    "depCountry" TEXT NOT NULL,
    "arrCountry" TEXT NOT NULL,
    "coverageAmount" DECIMAL(10,2) NOT NULL,
    "numPersons" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlightClaim_claimId_key" ON "FlightClaim"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_transactionHash_key" ON "Claim"("transactionHash");

-- AddForeignKey
ALTER TABLE "FlightClaim" ADD CONSTRAINT "FlightClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
