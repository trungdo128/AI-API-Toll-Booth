-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "WalletIdentity" (
    "id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthChallenge" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "nonceHash" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "metadataHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderApplication" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "statement" TEXT NOT NULL,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiProduct" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "providerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "upstreamUrlEncrypted" TEXT NOT NULL,
    "credentialEncrypted" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiPlan" (
    "id" UUID NOT NULL,
    "apiProductId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentChallenge" (
    "id" UUID NOT NULL,
    "apiProductId" UUID NOT NULL,
    "requestHash" TEXT NOT NULL,
    "nonceHash" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "ledger" INTEGER NOT NULL,
    "payerAddress" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" UUID NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "receiptId" UUID NOT NULL,
    "fundedAmount" BIGINT NOT NULL,
    "consumedAmount" BIGINT NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "settlementTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRequest" (
    "id" UUID NOT NULL,
    "apiProductId" UUID NOT NULL,
    "receiptId" UUID,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" UUID NOT NULL,
    "apiRequestId" UUID NOT NULL,
    "paymentSessionId" UUID,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "walletId" UUID,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" UUID NOT NULL,
    "adminAddress" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletIdentity_address_key" ON "WalletIdentity"("address");

-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_nonceHash_key" ON "AuthChallenge"("nonceHash");

-- CreateIndex
CREATE INDEX "AuthChallenge_walletId_expiresAt_idx" ON "AuthChallenge"("walletId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");

-- CreateIndex
CREATE INDEX "UserSession_walletId_expiresAt_idx" ON "UserSession"("walletId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_walletId_key" ON "Provider"("walletId");

-- CreateIndex
CREATE INDEX "ProviderApplication_status_createdAt_idx" ON "ProviderApplication"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiProduct_slug_key" ON "ApiProduct"("slug");

-- CreateIndex
CREATE INDEX "ApiProduct_active_category_createdAt_idx" ON "ApiProduct"("active", "category", "createdAt");

-- CreateIndex
CREATE INDEX "ApiProduct_providerId_active_idx" ON "ApiProduct"("providerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ApiPlan_apiProductId_name_key" ON "ApiPlan"("apiProductId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentChallenge_nonceHash_key" ON "PaymentChallenge"("nonceHash");

-- CreateIndex
CREATE INDEX "PaymentChallenge_status_expiresAt_idx" ON "PaymentChallenge"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "PaymentChallenge_apiProductId_createdAt_idx" ON "PaymentChallenge"("apiProductId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_challengeId_key" ON "PaymentReceipt"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_transactionHash_key" ON "PaymentReceipt"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSession_receiptId_key" ON "PaymentSession"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSession_settlementTxHash_key" ON "PaymentSession"("settlementTxHash");

-- CreateIndex
CREATE INDEX "PaymentSession_walletAddress_expiresAt_idx" ON "PaymentSession"("walletAddress", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiRequest_idempotencyKey_key" ON "ApiRequest"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ApiRequest_apiProductId_createdAt_idx" ON "ApiRequest"("apiProductId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_apiRequestId_key" ON "UsageRecord"("apiRequestId");

-- CreateIndex
CREATE INDEX "UsageRecord_paymentSessionId_createdAt_idx" ON "UsageRecord"("paymentSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_subjectType_subjectId_createdAt_idx" ON "AuditLog"("subjectType", "subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actor_createdAt_idx" ON "AuditLog"("actor", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAction_adminAddress_createdAt_idx" ON "AdminAction"("adminAddress", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAction_targetType_targetId_idx" ON "AdminAction"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AuthChallenge" ADD CONSTRAINT "AuthChallenge_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApplication" ADD CONSTRAINT "ProviderApplication_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiProduct" ADD CONSTRAINT "ApiProduct_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiPlan" ADD CONSTRAINT "ApiPlan_apiProductId_fkey" FOREIGN KEY ("apiProductId") REFERENCES "ApiProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentChallenge" ADD CONSTRAINT "PaymentChallenge_apiProductId_fkey" FOREIGN KEY ("apiProductId") REFERENCES "ApiProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "PaymentChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PaymentReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequest" ADD CONSTRAINT "ApiRequest_apiProductId_fkey" FOREIGN KEY ("apiProductId") REFERENCES "ApiProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequest" ADD CONSTRAINT "ApiRequest_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PaymentReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_apiRequestId_fkey" FOREIGN KEY ("apiRequestId") REFERENCES "ApiRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_paymentSessionId_fkey" FOREIGN KEY ("paymentSessionId") REFERENCES "PaymentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
