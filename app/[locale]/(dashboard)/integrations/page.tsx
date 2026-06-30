import { getDictionary, type Locale } from "@/lib/i18n";
import { requireApiContext } from "@/lib/api/context";
import { IntegrationsConsole } from "@/components/integrations/integrations-console";
import { Webhook } from "lucide-react";

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  
  // Enforce session check and RBAC validation for integrations module
  await requireApiContext({ moduleId: "integrations" });
  
  const dictionary = getDictionary(l);
  const t = dictionary.integrations;

  return (
    <section 
      className="erp-section space-y-6" 
      role="main" 
      aria-label={t.title}
    >
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Webhook className="size-7 text-primary" aria-hidden="true" />
          {t.title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {t.subtitle}
        </p>
      </div>

      <IntegrationsConsole locale={l} dictionary={dictionary} />
    </section>
  );
}
