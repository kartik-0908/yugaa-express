/*
  Warnings:

  - You are about to drop the column `availableForDist` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `unAvailableDays` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "availableForDist",
DROP COLUMN "unAvailableDays",
ADD COLUMN     "unavailableTill" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
