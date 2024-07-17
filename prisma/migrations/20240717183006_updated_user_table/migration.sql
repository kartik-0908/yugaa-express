/*
  Warnings:

  - You are about to drop the `NotificationSent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotificationSent" DROP CONSTRAINT "NotificationSent_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastNotifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "NotificationSent";
