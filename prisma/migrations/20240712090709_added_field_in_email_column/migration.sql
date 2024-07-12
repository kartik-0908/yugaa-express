/*
  Warnings:

  - Added the required column `from` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;
