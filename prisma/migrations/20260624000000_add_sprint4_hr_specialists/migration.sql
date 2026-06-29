CREATE TABLE IF NOT EXISTS "time_clocks" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "clockIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clockOut" TIMESTAMP(3),
  "source" "AttendanceSource" NOT NULL DEFAULT 'APP',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "time_clocks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "time_clocks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "time_clocks_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "time_clocks_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "time_clocks_tenantId_employeeId_idx" ON "time_clocks"("tenantId", "employeeId");
CREATE INDEX IF NOT EXISTS "time_clocks_tenantId_branchId_idx" ON "time_clocks"("tenantId", "branchId");
CREATE INDEX IF NOT EXISTS "time_clocks_tenantId_clockIn_idx" ON "time_clocks"("tenantId", "clockIn");
CREATE INDEX IF NOT EXISTS "time_clocks_tenantId_clockOut_idx" ON "time_clocks"("tenantId", "clockOut");

CREATE TABLE IF NOT EXISTS "branch_budgets" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "payrollBudget" DECIMAL(12, 2) NOT NULL,
  "specialistBudget" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "operationsBudget" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_budgets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "branch_budgets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "branch_budgets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "branch_budgets_tenantId_branchId_periodStart_periodEnd_key" ON "branch_budgets"("tenantId", "branchId", "periodStart", "periodEnd");
CREATE INDEX IF NOT EXISTS "branch_budgets_tenantId_branchId_idx" ON "branch_budgets"("tenantId", "branchId");
CREATE INDEX IF NOT EXISTS "branch_budgets_tenantId_periodStart_periodEnd_idx" ON "branch_budgets"("tenantId", "periodStart", "periodEnd");

CREATE TABLE IF NOT EXISTS "specialist_commissions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "specialistId" TEXT NOT NULL,
  "contractId" TEXT,
  "sessionId" TEXT,
  "settlementId" TEXT,
  "grossAmount" DECIMAL(12, 2) NOT NULL,
  "commissionRate" DECIMAL(5, 2),
  "rentProration" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "commissionAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "netAmount" DECIMAL(12, 2) NOT NULL,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "specialist_commissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "specialist_commissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "specialist_commissions_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "specialist_commissions_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "specialist_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "specialist_commissions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "specialist_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "specialist_commissions_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "specialist_settlements"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "specialist_commissions_tenantId_sessionId_key" ON "specialist_commissions"("tenantId", "sessionId");
CREATE INDEX IF NOT EXISTS "specialist_commissions_tenantId_specialistId_idx" ON "specialist_commissions"("tenantId", "specialistId");
CREATE INDEX IF NOT EXISTS "specialist_commissions_tenantId_settlementId_idx" ON "specialist_commissions"("tenantId", "settlementId");
