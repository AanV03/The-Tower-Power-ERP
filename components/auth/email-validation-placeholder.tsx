import Link from "next/link";
import type { Route } from "next";
import { Clock, Dumbbell } from "lucide-react";

import BackgroundGrid from "@/components/BackgroundGrid";

function homeHref(locale?: string) {
  return (locale ? `/${locale}` : "/") as Route;
}

export function EmailValidationPlaceholder({ locale }: { locale?: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      <BackgroundGrid />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
          >
            <Dumbbell className="size-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Email Validation
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              This feature will be enabled once the backend is ready.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />
          <div className="space-y-5 px-8 py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-400">
              <Clock className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Email validation is not available yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This page is intentionally disabled and does not call any API.
              </p>
            </div>
            <Link
              href={homeHref(locale)}
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: "var(--brand-orange)" }}
            >
              Back to Gerpy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
