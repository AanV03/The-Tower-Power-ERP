import { z } from 'zod';

export const registerSchema = z.object({
  gymName: z.string().min(3, "El nombre del gimnasio debe tener al menos 3 caracteres"),
  name: z.string().min(2, "El nombre de usuario es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;