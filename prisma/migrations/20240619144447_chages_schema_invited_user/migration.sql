/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `InvitedUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_email_key" ON "InvitedUser"("email");
