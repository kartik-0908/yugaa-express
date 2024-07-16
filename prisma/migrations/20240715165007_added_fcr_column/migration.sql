-- AlterTable
ALTER TABLE "AIEscalatedTicket" ADD COLUMN     "fcr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fcrBy" TEXT;
