import { z } from 'zod';

export const registerSchema = z.object({
  gymName: z.string().min(3, "El nombre del gimnasio debe tener al menos 3 caracteres").optional(),
  name: z.string().min(2, "El nombre de usuario es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Correo electronico invalido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
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
