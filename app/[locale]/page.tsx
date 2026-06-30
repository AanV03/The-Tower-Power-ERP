import Link from "next/link";
import type { Route } from "next";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dictionary = getDictionary(locale as Locale);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase text-foreground">
            {dictionary.landing.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Gerpy ERP
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {dictionary.landing.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/dashboard` as Route}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            {dictionary.landing.primaryAction}
          </Link>
          <Link
            href={`/${locale}/inventory` as Route}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {dictionary.modules.inventory}
          </Link>
        </div>
      </section>
    </main>
  );
}
