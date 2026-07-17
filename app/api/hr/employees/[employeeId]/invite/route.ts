import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { EmailService } from "@/lib/mail/email.service";

function generateToken(userId: string, expires: number): string {
  const secret = process.env.AUTH_SECRET || "default_auth_secret_key_12345";
  const payload = `${userId}:${expires}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const { employeeId } = await params;

    // 1. Fetch employee
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: context.tenantId,
      },
    });

    if (!employee) {
      return fail(new ApiError("EMPLOYEE_NOT_FOUND", 404, "NOT_FOUND"));
    }

    if (!employee.email) {
      return fail(new ApiError("EMPLOYEE_HAS_NO_EMAIL", 400, "BAD_REQUEST"));
    }

    // 2. Parse request body for optional roleId
    const body = await request.json().catch(() => ({}));
    const { roleId } = body;

    let selectedRoleId = roleId;
    if (!selectedRoleId) {
      const firstRole = await prisma.role.findFirst({
        where: { tenantId: context.tenantId },
        orderBy: { name: "asc" },
      });
      if (!firstRole) {
        return fail(new ApiError("TENANT_ROLE_MISSING", 400, "BAD_REQUEST"));
      }
      selectedRoleId = firstRole.id;
    } else {
      const roleExists = await prisma.role.findFirst({
        where: { id: selectedRoleId, tenantId: context.tenantId },
      });
      if (!roleExists) {
        return fail(new ApiError("INVALID_ROLE", 400, "BAD_REQUEST"));
      }
    }

    // 3. Check or create User
    let user = await prisma.user.findFirst({
      where: {
        email: employee.email,
        tenantId: context.tenantId,
      },
    });

    if (user) {
      if (user.status === "ACTIVE") {
        return fail(new ApiError("USER_ALREADY_ACTIVE", 400, "BAD_REQUEST"));
      }
    } else {
      // Create user and UserRole in a transaction
      user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            tenantId: context.tenantId,
            branchId: employee.branchId,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            status: "INVITED",
            employeeId: employee.id,
          },
        });

        await tx.userRole.create({
          data: {
            id: crypto.randomUUID(),
            userId: createdUser.id,
            roleId: selectedRoleId,
            branchId: employee.branchId,
          },
        });

        return createdUser;
      });
    }

    // 3. Generate token (expires in 7 days)
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = generateToken(user.id, expires);

    // 4. Construct URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const inviteUrl = `${protocol}://${host}/es/invite/accept?token=${token}`;

    // 5. Send invitation email
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
    });
    const tenantName = tenant?.name || "The Tower Power";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
        <h2 style="color: #ff3366; text-align: center;">¡Te han invitado a unirte a ${tenantName}!</h2>
        <p>Hola <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
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
      to: employee.email,
      subject: `Invitación para unirte a ${tenantName}`,
      html: emailHtml,
    });

    return ok({ ok: true, message: "Invitación enviada correctamente." });
  } catch (error) {
    return fail(error);
  }
}
