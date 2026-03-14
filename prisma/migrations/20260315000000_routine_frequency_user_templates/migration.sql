ALTER TABLE "RoutineTemplate" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE "RoutineTemplate" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "RoutineTemplate" ADD COLUMN "targetHairTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "RoutineTemplate" ADD COLUMN "targetPorosities" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "RoutineTemplate" ADD COLUMN "targetGoals" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "RoutineTemplate" ADD COLUMN "estimatedMinutes" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "RoutineTemplate" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RoutineTemplate" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "UserRoutineTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoutineTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserRoutineTemplate_userId_templateId_key" ON "UserRoutineTemplate"("userId", "templateId");
CREATE INDEX "UserRoutineTemplate_userId_idx" ON "UserRoutineTemplate"("userId");

ALTER TABLE "UserRoutineTemplate" ADD CONSTRAINT "UserRoutineTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoutineTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
