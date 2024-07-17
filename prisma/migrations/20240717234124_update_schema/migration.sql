/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `AIEscalatedTicket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignedToId]` on the table `AIEscalatedTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AIEscalatedTicket" DROP COLUMN "assignedTo",
ADD COLUMN     "assignedToId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AIEscalatedTicket_assignedToId_key" ON "AIEscalatedTicket"("assignedToId");

-- AddForeignKey
ALTER TABLE "AIEscalatedTicket" ADD CONSTRAINT "AIEscalatedTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
