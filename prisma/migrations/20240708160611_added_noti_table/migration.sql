-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT,
    "operatorName" TEXT,
    "newAssignee" TEXT,
    "changedBy" TEXT,
    "newPriority" TEXT,
    "newStatus" TEXT,
    "maintenanceDate" TIMESTAMP(3),
    "maintenanceStartTime" TIMESTAMP(3),
    "maintenanceEndTime" TIMESTAMP(3),
    "newTicketsCount" INTEGER,
    "resolvedTicketsCount" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
