/*
  Warnings:

  - The primary key for the `ChatbotCustomization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `shop_domain` on the `ChatbotCustomization` table. All the data in the column will be lost.
  - You are about to drop the column `email_address` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `storage_ref` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `Email` table. All the data in the column will be lost.
  - The primary key for the `KnowledgeBase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `faq_url` on the `KnowledgeBase` table. All the data in the column will be lost.
  - You are about to drop the column `help_url` on the `KnowledgeBase` table. All the data in the column will be lost.
  - You are about to drop the column `shop_domain` on the `KnowledgeBase` table. All the data in the column will be lost.
  - You are about to drop the column `terms_and_conditions_url` on the `KnowledgeBase` table. All the data in the column will be lost.
  - You are about to drop the column `video_link_urls` on the `KnowledgeBase` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `unanswered` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `PlanDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `shopify_domain` on the `PlanDetails` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketConversation` table. If the table is not empty, all the data it contains will be lost.
  - The required column `shopDomain` was added to the `ChatbotCustomization` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `shopDomain` was added to the `KnowledgeBase` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `message` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyDomain` to the `PlanDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "TicketConversation" DROP CONSTRAINT "TicketConversation_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "TicketConversation" DROP CONSTRAINT "TicketConversation_ticketId_fkey";

-- DropIndex
DROP INDEX "Email_ticketId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- AlterTable
ALTER TABLE "ChatbotCustomization" DROP CONSTRAINT "ChatbotCustomization_pkey",
DROP COLUMN "shop_domain",
ADD COLUMN     "shopDomain" TEXT NOT NULL,
ADD CONSTRAINT "ChatbotCustomization_pkey" PRIMARY KEY ("shopDomain");

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "email_address",
DROP COLUMN "sent_at",
DROP COLUMN "storage_ref",
DROP COLUMN "subject",
DROP COLUMN "ticketId";

-- AlterTable
ALTER TABLE "KnowledgeBase" DROP CONSTRAINT "KnowledgeBase_pkey",
DROP COLUMN "faq_url",
DROP COLUMN "help_url",
DROP COLUMN "shop_domain",
DROP COLUMN "terms_and_conditions_url",
DROP COLUMN "video_link_urls",
ADD COLUMN     "faqUrl" TEXT,
ADD COLUMN     "helpUrl" TEXT,
ADD COLUMN     "shopDomain" TEXT NOT NULL,
ADD COLUMN     "termsAndConditionsUrl" TEXT,
ADD COLUMN     "videoLinkUrls" TEXT[],
ADD CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("shopDomain");

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "conversationId",
DROP COLUMN "senderId",
DROP COLUMN "senderType",
DROP COLUMN "text",
DROP COLUMN "timestamp",
DROP COLUMN "unanswered",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "sender" TEXT NOT NULL,
ADD COLUMN     "ticketId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlanDetails" DROP CONSTRAINT "PlanDetails_pkey",
DROP COLUMN "shopify_domain",
ADD COLUMN     "shopifyDomain" TEXT NOT NULL,
ADD CONSTRAINT "PlanDetails_pkey" PRIMARY KEY ("shopifyDomain");

-- AlterTable
ALTER TABLE "ShopifyInstalledShop" ADD COLUMN     "email" TEXT[];

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "TicketConversation";

-- CreateTable
CREATE TABLE "AIConversationTicket" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL DEFAULT 'default',
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversationTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEscalatedTicket" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "aiConversationTicketId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unassigned',
    "priority" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIEscalatedTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEscalatedTicketEvent" (
    "id" TEXT NOT NULL,
    "aiEscalatedTicketId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "changedBy" TEXT,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "newPriority" TEXT,
    "newCategory" TEXT,
    "emailId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEscalatedTicketEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "AIConversationTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEscalatedTicket" ADD CONSTRAINT "AIEscalatedTicket_aiConversationTicketId_fkey" FOREIGN KEY ("aiConversationTicketId") REFERENCES "AIConversationTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEscalatedTicketEvent" ADD CONSTRAINT "AIEscalatedTicketEvent_aiEscalatedTicketId_fkey" FOREIGN KEY ("aiEscalatedTicketId") REFERENCES "AIEscalatedTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEscalatedTicketEvent" ADD CONSTRAINT "AIEscalatedTicketEvent_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;
