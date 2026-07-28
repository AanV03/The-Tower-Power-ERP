CREATE TYPE "NotificationPriority" AS ENUM (
    'INFO',
    'WARNING',
    'CRITICAL'
);

CREATE TYPE "NotificationCategory" AS ENUM (
    'FINANCE',
    'ACCESS',
    'MEMBERSHIPS',
    'SYSTEM',
    'HR',
    'ADMIN'
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL DEFAULT 'SYSTEM',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'INFO',
    "targetRoleId" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_recipients" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notifications_tenantId_id_key"
    ON "notifications"("tenantId", "id");

CREATE INDEX "notifications_tenantId_idx"
    ON "notifications"("tenantId");

CREATE INDEX "notifications_tenantId_createdAt_idx"
    ON "notifications"("tenantId", "createdAt");

CREATE INDEX "notifications_tenantId_branchId_createdAt_idx"
    ON "notifications"("tenantId", "branchId", "createdAt");

CREATE INDEX "notifications_tenantId_targetRoleId_idx"
    ON "notifications"("tenantId", "targetRoleId");

CREATE UNIQUE INDEX "notification_recipients_notificationId_userId_key"
    ON "notification_recipients"("notificationId", "userId");

CREATE INDEX "notification_recipients_tenantId_userId_deleted_read_idx"
    ON "notification_recipients"("tenantId", "userId", "deleted", "read");

CREATE INDEX "notification_recipients_userId_read_idx"
    ON "notification_recipients"("userId", "read");

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "tenants"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_tenantId_branchId_fkey"
    FOREIGN KEY ("tenantId", "branchId")
    REFERENCES "branches"("tenantId", "id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_tenantId_targetRoleId_fkey"
    FOREIGN KEY ("tenantId", "targetRoleId")
    REFERENCES "roles"("tenantId", "id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "notification_recipients"
    ADD CONSTRAINT "notification_recipients_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "tenants"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "notification_recipients"
    ADD CONSTRAINT "notification_recipients_tenantId_notificationId_fkey"
    FOREIGN KEY ("tenantId", "notificationId")
    REFERENCES "notifications"("tenantId", "id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "notification_recipients"
    ADD CONSTRAINT "notification_recipients_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "users"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
