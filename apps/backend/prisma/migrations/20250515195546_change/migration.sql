/*
  Warnings:

  - You are about to drop the `FlightClaim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HealthClaim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RainfallClaim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FlightClaim" DROP CONSTRAINT "FlightClaim_claimId_fkey";

-- DropForeignKey
ALTER TABLE "HealthClaim" DROP CONSTRAINT "HealthClaim_claimId_fkey";

-- DropForeignKey
ALTER TABLE "RainfallClaim" DROP CONSTRAINT "RainfallClaim_claimId_fkey";

-- DropTable
DROP TABLE "FlightClaim";

-- DropTable
DROP TABLE "HealthClaim";

-- DropTable
DROP TABLE "RainfallClaim";

-- CreateTable
CREATE TABLE "FlightPolicy" (
    "id" SERIAL NOT NULL,
    "policyId" INTEGER NOT NULL,
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

    CONSTRAINT "FlightPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthPolicy" (
    "id" SERIAL NOT NULL,
    "policyId" INTEGER NOT NULL,
    "hospital" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,

    CONSTRAINT "HealthPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RainfallPolicy" (
    "id" SERIAL NOT NULL,
    "policyId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "rainfall" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "RainfallPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlightPolicy_policyId_key" ON "FlightPolicy"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthPolicy_policyId_key" ON "HealthPolicy"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "RainfallPolicy_policyId_key" ON "RainfallPolicy"("policyId");

-- AddForeignKey
ALTER TABLE "FlightPolicy" ADD CONSTRAINT "FlightPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthPolicy" ADD CONSTRAINT "HealthPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RainfallPolicy" ADD CONSTRAINT "RainfallPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
