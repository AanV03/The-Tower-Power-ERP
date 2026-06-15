import { NextResponse } from "next/server";
import { z } from "zod";
import { createUserWithTenant } from "@/lib/auth/tenant-context";
import { isPasswordValid, normalizeEmail } from "@/lib/auth/password";

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform(normalizeEmail),
  password: z.string().refine(isPasswordValid, "Password does not meet requirements."),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  try {
    await createUserWithTenant(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { ok: false, error: "USER_ALREADY_EXISTS" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "REGISTER_FAILED" },
      { status: 500 },
    );
  }
}
