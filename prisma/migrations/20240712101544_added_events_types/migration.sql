/*
  Warnings:

  - You are about to drop the column `eventType` on the `AIEscalatedTicketEvent` table. All the data in the column will be lost.
  - Added the required column `type` to the `AIEscalatedTicketEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('EMAIL_RECEIVED', 'EMAIL_SENT', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'CATEGORY_CHANGED', 'ASSIGNED', 'REOPENED', 'CREATED');

-- AlterTable
ALTER TABLE "AIEscalatedTicketEvent" DROP COLUMN "eventType",
ADD COLUMN     "type" "EventType" NOT NULL;
