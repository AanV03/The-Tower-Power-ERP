CREATE TABLE "tenant_billing_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentMethodToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_billing_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_billing_profiles_tenantId_key"
    ON "tenant_billing_profiles"("tenantId");

ALTER TABLE "tenant_billing_profiles"
    ADD CONSTRAINT "tenant_billing_profiles_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "tenants"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
