import Link from "next/link";
import type { Route } from "next";
import { Clock, Dumbbell } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";

function homeHref(locale?: string) {
  return (locale ? `/${locale}` : "/") as Route;
}

export function EmailValidationPlaceholder({ locale }: { locale?: string }) {
  return (
    <AuthShell>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="auth-icon-tile flex size-14 items-center justify-center rounded-2xl shadow-lg"
          >
            <Dumbbell className="size-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="auth-heading text-2xl font-bold tracking-tight">
              Email Validation
            </h1>
            <p className="auth-muted mt-1 text-sm">
              This feature will be enabled once the backend is ready.
            </p>
          </div>
        </div>

        <div className="auth-card overflow-hidden rounded-2xl border ring-1 ring-[color:var(--auth-card-border)] backdrop-blur-xl">
          <div className="h-1 w-full bg-primary" />
          <div className="space-y-5 px-8 py-8 text-center">
            <div className="auth-card-rule auth-field-icon mx-auto flex size-12 items-center justify-center rounded-xl border">
              <Clock className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="auth-heading text-sm font-semibold">
                Email validation is not available yet.
              </p>
              <p className="auth-muted mt-2 text-sm leading-6">
                This page is intentionally disabled and does not call any API.
              </p>
            </div>
            <Link
              href={homeHref(locale)}
              className="auth-primary-button inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-200 hover:brightness-110"
            >
              Back to The Tower Power
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
