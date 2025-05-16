-- CreateTable
CREATE TABLE "HealthClaim" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "hospital" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,

    CONSTRAINT "HealthClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RainfallClaim" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "rainfall" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "RainfallClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthClaim_claimId_key" ON "HealthClaim"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "RainfallClaim_claimId_key" ON "RainfallClaim"("claimId");

-- AddForeignKey
ALTER TABLE "HealthClaim" ADD CONSTRAINT "HealthClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RainfallClaim" ADD CONSTRAINT "RainfallClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
