/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CommunityGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `RoutineTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommunityGroup_name_key" ON "CommunityGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineTemplate_name_key" ON "RoutineTemplate"("name");
