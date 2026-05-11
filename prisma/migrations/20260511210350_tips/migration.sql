-- AlterTable
ALTER TABLE "RoutineTemplate" ALTER COLUMN "targetHairTypes" DROP DEFAULT,
ALTER COLUMN "targetPorosities" DROP DEFAULT,
ALTER COLUMN "targetGoals" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "HairTip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetHairTypes" JSONB NOT NULL,
    "targetGoals" JSONB NOT NULL,
    "targetPorosity" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HairTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentTip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HairTip_category_idx" ON "HairTip"("category");

-- CreateIndex
CREATE INDEX "HairTip_isActive_idx" ON "HairTip"("isActive");

-- CreateIndex
CREATE INDEX "SentTip_userId_idx" ON "SentTip"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SentTip_userId_tipId_key" ON "SentTip"("userId", "tipId");

-- AddForeignKey
ALTER TABLE "UserRoutineTemplate" ADD CONSTRAINT "UserRoutineTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentTip" ADD CONSTRAINT "SentTip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentTip" ADD CONSTRAINT "SentTip_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "HairTip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
