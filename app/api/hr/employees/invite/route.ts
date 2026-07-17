import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { EmailService } from "@/lib/mail/email.service";

const InviteEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email().transform(normalizeEmail),
  roleId: z.string().min(1),
});

function generateToken(userId: string, expires: number): string {
  const secret = process.env.AUTH_SECRET || "default_auth_secret_key_12345";
  const payload = `${userId}:${expires}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export async function POST(request: NextRequest) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const body = await request.json();
    const data = InviteEmployeeSchema.parse(body);

    // 1. Verify role belongs to tenant
    const roleExists = await prisma.role.findFirst({
      where: { id: data.roleId, tenantId: context.tenantId },
    });
    if (!roleExists) {
      return fail(new ApiError("INVALID_ROLE", 400, "BAD_REQUEST"));
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, tenantId: context.tenantId },
    });
    if (existingUser) {
      return fail(new ApiError("EMAIL_ALREADY_EXISTS", 400, "BAD_REQUEST"));
    }

    // 3. Create Employee, User, and UserRole atomically
    const result = await prisma.$transaction(async (tx) => {
      // Find or create default Matriz branch if context has none
      const branchId = context.branchId || (
        await tx.branch.findFirst({
          where: { tenantId: context.tenantId, status: "ACTIVE" },
        })
      )?.id;

      if (!branchId) {
        throw new ApiError("NO_ACTIVE_BRANCH", 400, "BAD_REQUEST");
      }

      const employee = await tx.employee.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          status: "ACTIVE",
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          status: "INVITED",
          employeeId: employee.id,
        },
      });

      await tx.userRole.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          roleId: data.roleId,
          branchId,
        },
      });

      return { user, employee };
    });

    // 4. Generate token (expires in 7 days)
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = generateToken(result.user.id, expires);

    // 5. Construct URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const inviteUrl = `${protocol}://${host}/es/invite/accept?token=${token}`;

    // 6. Send email
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
    });
    const tenantName = tenant?.name || "The Tower Power";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #ff3366; text-align: center;">¡Te han invitado a unirte a ${tenantName}!</h2>
        <p>Hola <strong>${data.firstName} ${data.lastName}</strong>,</p>
        <p>Has sido registrado como colaborador en <strong>${tenantName}</strong>. Para configurar tu cuenta y comenzar a utilizar la plataforma, haz clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #ff3366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activar mi Cuenta</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #ff3366; word-break: break-all;">${inviteUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Este enlace vencerá en 7 días.</p>
      </div>
    `;

    await EmailService.sendMail({
      to: data.email,
      subject: `Invitación para unirte a ${tenantName}`,
      html: emailHtml,
    });

    return ok({ ok: true, message: "Invitación enviada correctamente." });
  } catch (error) {
    return fail(error);
  }
}
