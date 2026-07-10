import { z } from "zod";

export const onboardingPlanIds = ["basic", "pro", "enterprise"] as const;

export const curpRegex =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])([0-2][1-9]|3[0-1])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}[A-Z\d]{3}$/;

export const onboardingGymInfoSchema = z.object({
  gymName: z.string().trim().min(3, "El nombre del gimnasio debe tener al menos 3 caracteres"),
  curp: z
    .string()
    .trim()
    .toUpperCase()
    .regex(curpRegex, "El CURP no tiene un formato valido"),
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(rfcRegex, "El RFC no tiene un formato valido"),
});

export const onboardingPlanSelectionSchema = z.object({
  planId: z.enum(onboardingPlanIds),
  planName: z.string().trim().min(1, "El plan es obligatorio"),
  priceLabel: z.string().trim().min(1, "El precio del plan es obligatorio"),
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{13,19}$/, "El numero de tarjeta debe tener entre 13 y 19 digitos"),
});

export const onboardingDraftSchema = z.object({
  gymInfo: onboardingGymInfoSchema,
  plan: onboardingPlanSelectionSchema.nullable(),
});

export type OnboardingGymInfo = z.infer<typeof onboardingGymInfoSchema>;
export type OnboardingPlanId = (typeof onboardingPlanIds)[number];
export type OnboardingPlanSelection = z.infer<typeof onboardingPlanSelectionSchema>;
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;