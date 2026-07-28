import assert from "node:assert/strict";
import test from "node:test";

const onboardingSchemaModule = await import(
  new URL(
    "../modules/onboarding/schemas/onboarding.schema.ts",
    import.meta.url,
  ).href
) as typeof import("../modules/onboarding/schemas/onboarding.schema");
const {
  onboardingGymInfoSchema,
  onboardingPlanSelectionSchema,
} = onboardingSchemaModule;

test("normalizes and validates Mexican onboarding identity data", () => {
  const result = onboardingGymInfoSchema.parse({
    gymName: "  Gerpy Fitness  ",
    address: "Av. Reforma 123, CDMX",
    timeZone: "America/Mexico_City",
    curp: "gode561231hdfmrs09",
    rfc: "xaxx010101000",
  });

  assert.equal(result.gymName, "Gerpy Fitness");
  assert.equal(result.curp, "GODE561231HDFMRS09");
  assert.equal(result.rfc, "XAXX010101000");
});

test("rejects malformed CURP, RFC and non-IANA time zones", () => {
  const result = onboardingGymInfoSchema.safeParse({
    gymName: "Gerpy Fitness",
    address: "Av. Reforma 123, CDMX",
    timeZone: "Mexico/Unknown",
    curp: "INVALID",
    rfc: "XAXX019901000",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path[0]);
    assert.deepEqual(new Set(paths), new Set(["timeZone", "curp", "rfc"]));
  }
});

test("accepts provider tokens and rejects card data", () => {
  assert.equal(
    onboardingPlanSelectionSchema.safeParse({
      planId: "pro",
      paymentMethodToken: "pm_xxx",
    }).success,
    true,
  );

  assert.equal(
    onboardingPlanSelectionSchema.safeParse({
      planId: "pro",
      paymentMethodToken: "card_4242-4242-4242-4242",
    }).success,
    false,
  );

  assert.equal(
    onboardingPlanSelectionSchema.safeParse({
      planId: "pro",
      cardNumber: "4242424242424242",
    }).success,
    false,
  );
});
