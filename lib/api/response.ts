import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status = 500,
    code = "INTERNAL_ERROR",
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type StructuredApiError = Error & {
  status: number;
  code: string;
};

function isStructuredApiError(error: unknown): error is StructuredApiError {
  return (
    error instanceof Error &&
    typeof (error as { status?: unknown }).status === "number" &&
    typeof (error as { code?: unknown }).code === "string"
  );
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

  if (isStructuredApiError(error)) {
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
