-- AlterTable: add isSuspended to User
ALTER TABLE "User" ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: add status to Review
ALTER TABLE "Review" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
