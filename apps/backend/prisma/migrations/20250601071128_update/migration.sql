/*
  Warnings:

  - You are about to alter the column `premium` on the `Policy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,5)` to `Decimal(15,2)`.
  - You are about to alter the column `sumAssured` on the `Policy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,5)` to `Decimal(15,2)`.
  - You are about to alter the column `coverageAmount` on the `Policy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,5)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "Policy" ALTER COLUMN "premium" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "sumAssured" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "coverageAmount" SET DATA TYPE DECIMAL(15,2);
