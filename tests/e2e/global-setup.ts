type DevelopmentSeedResult = {
  email: string;
  password: string;
  employeeEmail: string;
  employeePassword: string;
  tenantIds: string[];
  payrollPeriodId: string;
};

type DevelopmentSeedModule = {
  runSeed(): Promise<DevelopmentSeedResult>;
};

export async function resetE2ESeed() {
  const moduleUrl = new URL("../../scripts/seed-dev.mjs", import.meta.url).href;
  const seedModule = await import(moduleUrl) as DevelopmentSeedModule;
  const result = await seedModule.runSeed();

  if (result.tenantIds.length < 2) {
    throw new Error("E2E_SEED_REQUIRES_TWO_TENANTS");
  }

  process.env.E2E_ADMIN_EMAIL = result.email;
  process.env.E2E_ADMIN_PASSWORD = result.password;
  process.env.E2E_EMPLOYEE_EMAIL = result.employeeEmail;
  process.env.E2E_EMPLOYEE_PASSWORD = result.employeePassword;
  process.env.E2E_TENANT_A_ID = result.tenantIds[0];
  process.env.E2E_TENANT_B_ID = result.tenantIds[1];
  process.env.E2E_PAYROLL_PERIOD_ID = result.payrollPeriodId;

  return result;
}

export default async function globalSetup() {
  await resetE2ESeed();
}
