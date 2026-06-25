import { z } from 'zod';

export const registerSchema = z.object({
  gymName: z.string().min(3, "El nombre del gimnasio debe tener al menos 3 caracteres"),
  name: z.string().min(2, "El nombre de usuario es obligatorio"),
  email: z.string().email("Correo electrónico inválido").toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[\W_]/, "Debe contener al menos un carácter especial (!@#$%^&*)"),
});

export const loginSchema = z.object({
  email: z.string().email("Correo electronico invalido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
  enable2FA: z.boolean().optional().default(false),
});

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El codigo 2FA debe tener 6 digitos"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type TwoFactorVerifyDTO = z.infer<typeof twoFactorVerifySchema>;