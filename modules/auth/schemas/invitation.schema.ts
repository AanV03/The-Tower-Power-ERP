import { z } from "zod";

import { isPasswordValid } from "@/lib/auth/password";

export const acceptInvitationSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(1, "El token de invitacion es obligatorio")
      .max(2048, "El token de invitacion no es valido"),
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres")
      .max(128, "La contrasena no puede exceder 128 caracteres")
      .refine(
        isPasswordValid,
        "La contrasena debe incluir mayuscula, numero y simbolo",
      ),
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(160, "El nombre no puede exceder 160 caracteres")
      .optional(),
  })
  .strict();

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
