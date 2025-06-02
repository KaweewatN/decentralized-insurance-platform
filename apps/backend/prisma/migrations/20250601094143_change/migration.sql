/*
  Warnings:

  - You are about to drop the column `sumAssured` on the `Policy` table. All the data in the column will be lost.
  - Added the required column `totalPremium` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "sumAssured",
ADD COLUMN     "totalPremium" DECIMAL(15,2) NOT NULL;
