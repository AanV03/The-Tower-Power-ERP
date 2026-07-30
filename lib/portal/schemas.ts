import { z } from "zod";

export const PortalTenantSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i);

export const PortalBookingSchema = z.object({
  classSessionId: z.string().trim().min(1).max(128),
});

export const PortalSettingsSchema = z
  .object({
    pushNotifications: z.boolean().optional(),
    reminders: z.boolean().optional(),
    darkMode: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Debe enviar al menos una preferencia.",
  });

export const PortalProgressSchema = z
  .object({
    measuredAt: z.coerce.date().max(new Date()).optional(),
    weight: z.number().positive().max(500).optional(),
    bodyFat: z.number().min(0).max(100).optional(),
    muscleMass: z.number().min(0).max(300).optional(),
  })
  .refine(
    (value) =>
      value.weight !== undefined ||
      value.bodyFat !== undefined ||
      value.muscleMass !== undefined,
    {
      message: "Debe enviar al menos una medicion.",
    },
  );

export const PortalTeamMembershipSchema = z.object({
  teamId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i, "El identificador del equipo no es valido."),
  joined: z.boolean(),
});

export type PortalSettingsInput = z.infer<typeof PortalSettingsSchema>;
export type PortalProgressInput = z.infer<typeof PortalProgressSchema>;

export function getPortalTenantSlug(request: Request) {
  const value = new URL(request.url).searchParams.get("tenantSlug");
  return PortalTenantSlugSchema.parse(value);
}
