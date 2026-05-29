import { BrandingPanel } from "@/components/branding/branding-panel";
import { ModulePage } from "@/components/shared/module-page";
import type { Locale } from "@/lib/i18n";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;

  return (
    <ModulePage moduleId="admin" locale={l} chartType="bar">
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {l === "es" ? "Personalizacion de identidad" : l === "en" ? "Brand customization" : "Personnalisation"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {l === "es"
              ? "Ajusta los colores del sidebar y topbar para cada tenant. Los cambios se aplican en tiempo real."
              : l === "en"
                ? "Adjust sidebar and topbar colors per tenant. Changes apply in real time."
                : "Ajustez les couleurs du sidebar et du topbar. Les modifications s'appliquent en temps reel."}
          </p>
        </div>
        <BrandingPanel locale={l} />
      </div>
    </ModulePage>
  );
}
