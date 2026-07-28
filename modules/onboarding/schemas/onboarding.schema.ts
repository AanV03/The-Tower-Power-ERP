import { z } from "zod";

export const onboardingPlanIds = ["basic", "pro", "enterprise"] as const;
export const onboardingSteps = ["welcome", "gym-info", "plan", "finish"] as const;

export const curpRegex =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

export const rfcRegex =
  /^[A-Z\u00D1&]{3,4}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[A-Z0-9]{2}[0-9A]$/;

export const paymentMethodTokenRegex =
  /^[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9][A-Za-z0-9_-]*$/;

function isLuhnValid(value: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function containsPaymentCardNumber(value: string) {
  const candidates = value.replaceAll("-", "").match(/\d{13,19}/g) ?? [];
  return candidates.some(isLuhnValid);
}

const fallbackTimeZones = new Set([
  "America/Cancun",
  "America/Chihuahua",
  "America/Hermosillo",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Merida",
  "America/Mexico_City",
  "America/Monterrey",
  "America/Ojinaga",
  "America/Tijuana",
  "Etc/UTC",
  "UTC",
]);

function loadSupportedTimeZones() {
  try {
    return typeof Intl.supportedValuesOf === "function"
      ? new Set(Intl.supportedValuesOf("timeZone"))
      : fallbackTimeZones;
  } catch {
    return fallbackTimeZones;
  }
}

const supportedTimeZones = loadSupportedTimeZones();

export function isSupportedTimeZone(value: string) {
  return supportedTimeZones.has(value) || fallbackTimeZones.has(value);
}

export const onboardingGymInfoSchema = z
  .object({
    gymName: z
      .string()
      .trim()
      .min(3, "El nombre del gimnasio debe tener al menos 3 caracteres")
      .max(120, "El nombre del gimnasio no puede exceder 120 caracteres"),
    address: z
      .string()
      .trim()
      .min(5, "La direccion debe tener al menos 5 caracteres")
      .max(500, "La direccion no puede exceder 500 caracteres"),
    timeZone: z
      .string()
      .trim()
      .refine(isSupportedTimeZone, "La zona horaria debe ser un identificador IANA valido"),
    curp: z
      .string()
      .trim()
      .toUpperCase()
      .regex(curpRegex, "La CURP no tiene un formato valido"),
    rfc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(rfcRegex, "El RFC no tiene un formato valido"),
  })
  .strict();

export const onboardingPlanSelectionSchema = z
  .object({
    planId: z
      .string()
      .trim()
      .min(1, "El plan es obligatorio")
      .max(191, "El identificador del plan no es valido"),
    paymentMethodToken: z
      .string()
      .trim()
      .min(6, "El token del metodo de pago no es valido")
      .max(255, "El token del metodo de pago no es valido")
      .regex(
        paymentMethodTokenRegex,
        "Se requiere un token del proveedor; no se aceptan numeros de tarjeta",
      )
      .refine(
        (value) => !containsPaymentCardNumber(value),
        "El token no puede contener un numero de tarjeta",
      ),
  })
  .strict();

export const onboardingDraftSchema = z
  .object({
    gymInfo: onboardingGymInfoSchema,
    plan: onboardingPlanSelectionSchema.nullable(),
  })
  .strict();

export type OnboardingGymInfo = z.infer<typeof onboardingGymInfoSchema>;
export type OnboardingPlanId = (typeof onboardingPlanIds)[number];
export type OnboardingPlanSelection = z.infer<typeof onboardingPlanSelectionSchema>;
export type OnboardingStep = (typeof onboardingSteps)[number];
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;
