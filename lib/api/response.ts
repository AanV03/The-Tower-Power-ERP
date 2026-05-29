import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code = "INTERNAL_ERROR",
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: error.code, message: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", issues: error.issues },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { ok: false, error: "INTERNAL_ERROR", message: "Unexpected API error." },
    { status: 500 },
  );
}
