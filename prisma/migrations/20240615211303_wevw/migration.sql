-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerEmail" TEXT,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "unanswered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketConversation" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "email_address" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "storage_ref" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "password" TEXT,
    "shopDomain" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "role" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "id_token" TEXT,
    "refresh_token" TEXT,
    "session_state" TEXT,
    "token_type" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "InvitedUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "invitationToken" TEXT NOT NULL,
    "invitationSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitationExpires" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InvitedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyInstalledShop" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "adminInviteCode" TEXT NOT NULL,
    "memberInviteCode" TEXT NOT NULL,

    CONSTRAINT "ShopifyInstalledShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDetails" (
    "shopify_domain" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    "planStartDate" TIMESTAMP(3) NOT NULL,
    "convleft" INTEGER NOT NULL,
    "shopifyid" TEXT NOT NULL DEFAULT 'nothing',
    "eventTimestamp" TEXT NOT NULL DEFAULT 'default',

    CONSTRAINT "PlanDetails_pkey" PRIMARY KEY ("shopify_domain")
);

-- CreateTable
CREATE TABLE "ChatbotCustomization" (
    "shop_domain" TEXT NOT NULL,
    "selectedColor" TEXT NOT NULL,
    "botName" TEXT NOT NULL,
    "greetingMessage" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL,
    "widgetPosition" TEXT NOT NULL,
    "toneAndStyle" TEXT NOT NULL,
    "userGuidance" TEXT NOT NULL,
    "positiveReinforcement" TEXT NOT NULL,
    "errorHandling" TEXT NOT NULL,
    "politeness" TEXT NOT NULL,
    "clarityAndSimplicity" TEXT NOT NULL,
    "personalization" TEXT NOT NULL,
    "responseLength" TEXT NOT NULL,
    "clarificationPrompt" TEXT NOT NULL,
    "apologyAndRetryAttempt" TEXT NOT NULL,
    "errorMessageStyle" TEXT NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "logo_filename" TEXT NOT NULL DEFAULT 'default',

    CONSTRAINT "ChatbotCustomization_pkey" PRIMARY KEY ("shop_domain")
);

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredWebhooks" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shop_domain" TEXT NOT NULL,

    CONSTRAINT "RegisteredWebhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "shop_domain" TEXT NOT NULL,
    "faq_url" TEXT,
    "terms_and_conditions_url" TEXT,
    "help_url" TEXT,
    "video_link_urls" TEXT[],
    "documents" JSONB[],

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("shop_domain")
);

-- CreateIndex
CREATE INDEX "Conversation_shopDomain_idx" ON "Conversation"("shopDomain");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "TicketConversation_ticketId_idx" ON "TicketConversation"("ticketId");

-- CreateIndex
CREATE INDEX "Email_ticketId_idx" ON "Email"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_invitationToken_key" ON "InvitedUser"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_shopDomain_email_key" ON "InvitedUser"("shopDomain", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyInstalledShop_shop_key" ON "ShopifyInstalledShop"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_shopDomain_email_key" ON "Customer"("shopDomain", "email");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketConversation" ADD CONSTRAINT "TicketConversation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketConversation" ADD CONSTRAINT "TicketConversation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
