# Localized Module Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize all public mega-menu module pages, render their supplied screenshots and credible highlights, and remove their create-account action.

**Architecture:** Keep `lib/modules.ts` as the canonical module catalog, but replace its Spanish-only `ModuleItem` data with locale-keyed content and an explicit screenshot path per slug. Expose locale-aware section and module lookup functions so the mega menu, page template, and metadata consume the same resolved model. Keep shared page chrome in the existing landing dictionaries.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Next.js `Image`, Tailwind CSS, Node test runner.

## Global Constraints

- Change only public landing module pages and their shared catalog/navigation content.
- Preserve all 15 existing slugs and the current mega-menu interaction behavior.
- Support exactly `es`, `en`, and `fr` using the existing `Locale` type.
- Keep three highlight cards per module, with a specific short description for every card.
- Use the supplied PNG files from `public` without renaming, cropping, stretching, or runtime filename inference.
- Keep the bottom informational banner but remove its registration link and arrow.
- Preserve unrelated changes in `pnpm-workspace.yaml` and all user-supplied untracked PNG files.
- Do not change dashboard modules, authentication, registration, sidebar navigation, or dashboard personalization.

## File Structure

- `lib/modules.ts`: canonical slug definitions, screenshot paths, localized module content, locale-aware lookup functions.
- `lib/i18n/en.ts`, `lib/i18n/es.ts`, `lib/i18n/fr.ts`: localized shared chrome for module pages.
- `components/landing/mega-menu.tsx`: consumes resolved localized sections; no language guessing or duplicate labels.
- `components/landing/module-page-template.tsx`: renders localized chrome, real screenshot, feature descriptions, and banner without a CTA.
- `app/[locale]/modules/[slug]/page.tsx`: locale-aware module lookup and localized metadata.
- `scripts/landing-theme.test.mjs`: focused static regression coverage for catalog, template, route, screenshots, localization, and CTA removal.

---

### Task 1: Define and Test the Locale-Aware Module Catalog

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `lib/modules.ts`

**Interfaces:**
- Consumes: `type Locale` from `lib/i18n.ts`.
- Produces: `type ModuleFeature`, `type ModuleItem`, `type ModuleSection`, `getMegaMenuSections(locale: Locale): ModuleSection[]`, `getModules(locale: Locale): ModuleItem[]`, `getModuleBySlug(slug: string, locale: Locale): ModuleItem | undefined`, and `moduleSlugs`.

- [ ] **Step 1: Write failing catalog tests**

Add `moduleRouteSource` and dictionary source reads beside the existing source reads, then add these tests:

```js
const moduleRouteSource = await readFile(
  new URL("../app/[locale]/modules/[slug]/page.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const enDictionarySource = await readFile(new URL("../lib/i18n/en.ts", import.meta.url), "utf8");
const esDictionarySource = await readFile(new URL("../lib/i18n/es.ts", import.meta.url), "utf8");
const frDictionarySource = await readFile(new URL("../lib/i18n/fr.ts", import.meta.url), "utf8");

test("public module catalog resolves content by locale", () => {
  assert.match(moduleDataSource, /import type \{ Locale \} from "@\/lib\/i18n"/);
  assert.match(moduleDataSource, /content:\s*Record<Locale, LocalizedModuleContent>/);
  assert.match(moduleDataSource, /getMegaMenuSections\(locale:\s*Locale\)/);
  assert.match(moduleDataSource, /getModuleBySlug\(slug:\s*string,\s*locale:\s*Locale\)/);
  assert.match(moduleDataSource, /description:\s*feature\.description/);
});

test("every public module has an explicit supplied screenshot", () => {
  const screenshots = [
    "Panel Op.png", "POS.png", "Gestion Membresias.png", "Access Control.png",
    "Product catalog.png", "Purchasing supply.png", "Warehouse Management.png",
    "Inventory Stock.png", "Finance Module.png", "Accounting.png", "HR attendance.png",
    "Payroll commissions.png", "Period Settlement.png", "Marketing retention.png",
    "Analytics Intelligence.png",
  ];

  for (const screenshot of screenshots) {
    assert.match(moduleDataSource, new RegExp(screenshot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("module highlights contain real descriptions in every locale", () => {
  assert.match(moduleDataSource, /features:\s*\[\s*\{\s*title:/);
  assert.match(moduleDataSource, /description:\s*"[^"]{24,}"/);
  assert.doesNotMatch(moduleDataSource, /Public preview copy for this capability/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: FAIL in the three new tests because `lib/modules.ts` is Spanish-only, has no screenshot paths, and stores features as strings.

- [ ] **Step 3: Replace the catalog types and lookup boundary**

Use these exact public types:

```ts
import type { Locale } from "@/lib/i18n";

export type ModuleFeature = {
  title: string;
  description: string;
};

export type ModuleItem = {
  label: string;
  slug: string;
  category: string;
  description: string;
  features: ModuleFeature[];
  imageSrc: string;
  imageAlt: string;
};

export type ModuleSection = {
  title: string;
  items: ModuleItem[];
};

type LocalizedModuleContent = Omit<ModuleItem, "slug" | "category" | "imageSrc">;

type ModuleDefinition = {
  slug: string;
  section: "operations" | "logistics" | "finance" | "people" | "growth";
  imageSrc: string;
  content: Record<Locale, LocalizedModuleContent>;
};
```

Define `sectionLabels` as `Record<Locale, Record<ModuleDefinition["section"], string>>` with these exact values:

```ts
const sectionLabels = {
  es: { operations: "Operación", logistics: "Logística", finance: "Finanzas", people: "Personas", growth: "Crecimiento" },
  en: { operations: "Operations", logistics: "Logistics", finance: "Finance", people: "People", growth: "Growth" },
  fr: { operations: "Opérations", logistics: "Logistique", finance: "Finance", people: "Équipe", growth: "Croissance" },
} satisfies Record<Locale, Record<ModuleDefinition["section"], string>>;
```

Resolve definitions only through these functions:

```ts
const sectionOrder: ModuleDefinition["section"][] = ["operations", "logistics", "finance", "people", "growth"];

function resolveModule(definition: ModuleDefinition, locale: Locale): ModuleItem {
  const content = definition.content[locale];
  return {
    slug: definition.slug,
    category: sectionLabels[locale][definition.section],
    imageSrc: definition.imageSrc,
    ...content,
    features: content.features.map((feature) => ({
      title: feature.title,
      description: feature.description,
    })),
  };
}

export const moduleSlugs = moduleDefinitions.map(({ slug }) => slug);

export function getMegaMenuSections(locale: Locale): ModuleSection[] {
  return sectionOrder.map((section) => ({
    title: sectionLabels[locale][section],
    items: moduleDefinitions
      .filter((definition) => definition.section === section)
      .map((definition) => resolveModule(definition, locale)),
  }));
}

export function getModules(locale: Locale): ModuleItem[] {
  return moduleDefinitions.map((definition) => resolveModule(definition, locale));
}

export function getModuleBySlug(slug: string, locale: Locale) {
  const definition = moduleDefinitions.find((module) => module.slug === slug);
  return definition ? resolveModule(definition, locale) : undefined;
}
```

- [ ] **Step 4: Add all 15 definitions with exact screenshot mappings and localized copy**

Keep the existing Spanish labels, descriptions, and feature titles as the semantic source. For every definition, add English and French equivalents and turn each feature into `{ title, description }`. Each description must be one sentence of 8–18 words and name the actual operation, for example:

```ts
{
  slug: "panel-operativo",
  section: "operations",
  imageSrc: "/Panel Op.png",
  content: {
    es: {
      label: "Panel operativo",
      description: "Visualiza métricas clave, actividad reciente y accesos rápidos desde un solo lugar.",
      imageAlt: "Panel operativo con métricas y actividad reciente",
      features: [
        { title: "Resumen general del negocio", description: "Reúne ventas, membresías y actividad diaria en una vista clara." },
        { title: "Indicadores importantes", description: "Destaca métricas prioritarias para detectar cambios y actuar a tiempo." },
        { title: "Accesos rápidos a módulos", description: "Abre las herramientas más utilizadas sin recorrer menús adicionales." },
      ],
    },
    en: {
      label: "Operations dashboard",
      description: "See key metrics, recent activity, and shortcuts from one central workspace.",
      imageAlt: "Operations dashboard with metrics and recent activity",
      features: [
        { title: "Business overview", description: "Bring sales, memberships, and daily activity into one clear view." },
        { title: "Key indicators", description: "Surface priority metrics to spot changes and respond on time." },
        { title: "Module shortcuts", description: "Open frequently used tools without navigating through additional menus." },
      ],
    },
    fr: {
      label: "Tableau opérationnel",
      description: "Consultez les indicateurs clés, l’activité récente et les raccourcis depuis un espace central.",
      imageAlt: "Tableau opérationnel avec indicateurs et activité récente",
      features: [
        { title: "Vue globale de l’activité", description: "Réunissez ventes, abonnements et activité quotidienne dans une vue claire." },
        { title: "Indicateurs clés", description: "Mettez en avant les mesures prioritaires pour réagir au bon moment." },
        { title: "Raccourcis vers les modules", description: "Ouvrez les outils fréquents sans parcourir de menus supplémentaires." },
      ],
    },
  },
}
```

Use the design’s filename table for the remaining definitions and the following exact English/French labels and page descriptions. Retain the existing Spanish label and page description for each slug.

| Slug | English label and description | French label and description |
| --- | --- | --- |
| `punto-de-venta` | **Point of sale** — Run sales, tills, products, and daily payments through a fast front-desk experience. | **Point de vente** — Gérez les ventes, les caisses, les produits et les paiements quotidiens depuis une interface rapide. |
| `suscripciones` | **Memberships** — Manage plans, renewals, recurring payments, and membership status in one place. | **Abonnements** — Gérez les offres, les renouvellements, les paiements récurrents et le statut des adhésions. |
| `acceso` | **Access control** — Monitor entries, connected devices, and member validation across the operation. | **Contrôle d’accès** — Suivez les entrées, les appareils connectés et la validation des membres. |
| `catalogo` | **Product catalog** — Organize products, categories, prices, and variants for sales and inventory. | **Catalogue produits** — Organisez les produits, les catégories, les prix et les variantes pour la vente et le stock. |
| `compras` | **Purchasing** — Centralize suppliers, purchase orders, invoices, and traceable goods receiving. | **Achats** — Centralisez les fournisseurs, les commandes, les factures et la réception traçable des marchandises. |
| `almacenes` | **Warehouse management** — Track locations, transfers, movements, and stock by branch or warehouse. | **Gestion des entrepôts** — Suivez les emplacements, les transferts, les mouvements et le stock par site. |
| `inventario` | **Inventory** — Control stock, minimum-level alerts, and movements to prevent operational shortages. | **Inventaire** — Contrôlez le stock, les seuils minimums et les mouvements pour éviter les ruptures. |
| `finanzas` | **Finance** — Review revenue, payments, invoices, and balances for daily financial visibility. | **Finance** — Consultez les revenus, les paiements, les factures et les soldes au quotidien. |
| `contabilidad` | **Accounting** — Organize journals, accounts, and accounting records for a reliable financial operation. | **Comptabilité** — Organisez les journaux, les comptes et les écritures pour une gestion financière fiable. |
| `rh-y-nomina` | **HR and attendance** — Bring employee records, attendance, contracts, and shifts into one view. | **RH et présence** — Réunissez les dossiers, la présence, les contrats et les horaires des employés. |
| `nomina` | **Payroll** — Prepare pay with clear periods, receipts, commissions, and payroll summaries. | **Paie** — Préparez les paiements avec des périodes, reçus, commissions et résumés clairs. |
| `especialistas` | **Specialists** — Manage coaches, sessions, commissions, settlements, and individual performance. | **Spécialistes** — Gérez les coachs, les séances, les commissions, les règlements et la performance individuelle. |
| `marketing` | **Marketing** — Build campaigns, audience segments, and automations for retention and growth. | **Marketing** — Créez des campagnes, des segments et des automatisations pour fidéliser et développer l’activité. |
| `analytics` | **Analytics** — Turn operating data into reports, trends, and comparisons for better decisions. | **Analytique** — Transformez les données opérationnelles en rapports, tendances et comparaisons utiles. |

For feature copy, translate the existing three Spanish feature titles faithfully and use these exact description triplets in feature order:

| Slug | Spanish descriptions | English descriptions | French descriptions |
| --- | --- | --- | --- |
| `punto-de-venta` | Supervisa aperturas, cierres y movimientos de cada caja.; Registra ventas al instante y mantiene existencias e ingresos alineados.; Consulta cobros, devoluciones y métodos de pago desde un historial ordenado. | Monitor openings, closings, and movements for every till.; Record sales instantly while keeping stock and revenue aligned.; Review payments, refunds, and payment methods in an organized history. | Suivez les ouvertures, fermetures et mouvements de chaque caisse.; Enregistrez les ventes instantanément tout en synchronisant stock et revenus.; Consultez paiements, remboursements et moyens de paiement dans un historique clair. |
| `suscripciones` | Configura opciones de membresía adaptadas a distintos perfiles y periodos.; Identifica próximas renovaciones y evita interrupciones en el servicio.; Distingue membresías activas, pausadas, vencidas o pendientes de pago. | Configure membership options for different customer profiles and billing periods.; Identify upcoming renewals and prevent avoidable service interruptions.; Distinguish active, paused, expired, and payment-pending memberships. | Configurez des abonnements adaptés aux différents profils et cycles de facturation.; Repérez les renouvellements à venir et évitez les interruptions de service.; Distinguez les adhésions actives, suspendues, expirées ou en attente de paiement. |
| `acceso` | Confirma el estado de la membresía antes de autorizar cada entrada.; Supervisa lectores y terminales conectados desde una vista central.; Conserva una bitácora consultable de accesos permitidos y rechazados. | Confirm membership status before authorizing each entry.; Monitor connected readers and terminals from one central view.; Keep a searchable log of approved and rejected entry attempts. | Confirmez le statut de l’adhésion avant d’autoriser chaque entrée.; Surveillez les lecteurs et terminaux connectés depuis une vue centrale.; Conservez un journal consultable des accès acceptés et refusés. |
| `catalogo` | Agrupa productos de forma consistente para facilitar búsqueda y reportes.; Mantén descripción, código e información comercial en una ficha central.; Administra precios y opciones sin duplicar productos en el catálogo. | Group products consistently to simplify search and reporting.; Keep descriptions, codes, and commercial details in one product record.; Manage prices and options without duplicating products in the catalog. | Regroupez les produits de façon cohérente pour simplifier recherche et rapports.; Centralisez descriptions, codes et informations commerciales dans chaque fiche.; Gérez prix et options sans dupliquer les produits du catalogue. |
| `compras` | Centraliza contactos, condiciones y desempeño de cada proveedor.; Da seguimiento a solicitudes, aprobaciones y entregas de cada orden.; Confirma cantidades recibidas y conserva evidencia para futuras revisiones. | Centralize contacts, terms, and performance for every supplier.; Track requests, approvals, and deliveries for each purchase order.; Confirm received quantities and retain evidence for future reviews. | Centralisez contacts, conditions et performance de chaque fournisseur.; Suivez demandes, validations et livraisons de chaque commande.; Confirmez les quantités reçues et conservez les preuves pour les contrôles. |
| `almacenes` | Consulta stock disponible por almacén, zona o sucursal.; Registra envíos y recepciones entre ubicaciones con seguimiento completo.; Conserva responsables, fechas y motivos de cada movimiento de mercancía. | Review available stock by warehouse, zone, or branch.; Record shipments and receipts between locations with complete tracking.; Preserve owners, dates, and reasons for every goods movement. | Consultez le stock disponible par entrepôt, zone ou site.; Enregistrez expéditions et réceptions entre sites avec un suivi complet.; Conservez responsables, dates et motifs de chaque mouvement de marchandises. |
| `inventario` | Detecta productos próximos a agotarse antes de afectar la operación.; Registra cada ajuste, recepción o consumo con su motivo correspondiente.; Compara existencias entre sucursales desde una vista consolidada. | Detect products approaching depletion before operations are affected.; Record every adjustment, receipt, or consumption with its reason.; Compare stock across branches from one consolidated view. | Détectez les produits proches de la rupture avant tout impact opérationnel.; Enregistrez chaque ajustement, réception ou consommation avec son motif.; Comparez les stocks des différents sites depuis une vue consolidée. |
| `finanzas` | Organiza facturas emitidas y su estado de cobro.; Relaciona pagos con clientes, facturas y métodos utilizados.; Resume ingresos, saldos y movimientos para una lectura financiera diaria. | Organize issued invoices and their collection status.; Connect payments with customers, invoices, and methods used.; Summarize revenue, balances, and movements for daily financial visibility. | Organisez les factures émises et leur statut de règlement.; Reliez paiements, clients, factures et moyens utilisés.; Résumez revenus, soldes et mouvements pour une vision financière quotidienne. |
| `contabilidad` | Mantén cuentas ordenadas por naturaleza y uso contable.; Registra cargos y abonos con referencias y periodos definidos.; Sigue cada registro hasta su documento y operación de origen. | Keep accounts organized by accounting nature and purpose.; Record debits and credits with defined references and periods.; Trace every entry back to its source document and operation. | Classez les comptes selon leur nature et leur usage comptable.; Enregistrez débits et crédits avec références et périodes définies.; Retracez chaque écriture jusqu’à son document et son opération d’origine. |
| `rh-y-nomina` | Reúne datos laborales, contacto y documentación de cada colaborador.; Consulta entradas, salidas, incidencias y ausencias por periodo.; Organiza condiciones laborales, horarios y vigencia de cada contrato. | Combine employment, contact, and document data for every team member.; Review arrivals, departures, incidents, and absences by period.; Organize employment terms, schedules, and contract validity. | Réunissez données professionnelles, coordonnées et documents de chaque collaborateur.; Consultez arrivées, départs, incidents et absences par période.; Organisez conditions d’emploi, horaires et validité de chaque contrat. |
| `nomina` | Organiza cada ciclo de pago con fechas y estado claramente visibles.; Genera comprobantes con percepciones, deducciones y totales comprensibles.; Revisa importes y variaciones antes de confirmar el pago del equipo. | Organize every pay cycle with clearly visible dates and status.; Generate receipts with understandable earnings, deductions, and totals.; Review amounts and changes before confirming team payment. | Organisez chaque cycle de paie avec dates et statut clairement visibles.; Générez des bulletins présentant gains, retenues et totaux lisibles.; Vérifiez montants et variations avant de confirmer le paiement de l’équipe. |
| `especialistas` | Registra servicios realizados y vincúlalos con clientes y horarios.; Calcula comisiones según reglas claras y actividad confirmada.; Compara sesiones, ingresos y cumplimiento de cada especialista. | Record delivered services and connect them to customers and schedules.; Calculate commissions from clear rules and confirmed activity.; Compare sessions, revenue, and goal completion for every specialist. | Enregistrez les services réalisés et reliez-les aux clients et horaires.; Calculez les commissions selon des règles claires et l’activité confirmée.; Comparez séances, revenus et objectifs de chaque spécialiste. |
| `marketing` | Planifica acciones con objetivos, canales, fechas y resultados medibles.; Agrupa audiencias por comportamiento, estado o características compartidas.; Activa comunicaciones recurrentes según eventos del ciclo del cliente. | Plan initiatives with measurable goals, channels, dates, and results.; Group audiences by behavior, status, or shared characteristics.; Trigger recurring communications from events in the customer lifecycle. | Planifiez des actions avec objectifs, canaux, dates et résultats mesurables.; Regroupez les audiences par comportement, statut ou caractéristiques communes.; Déclenchez des communications récurrentes selon le cycle de vie client. |
| `analytics` | Reúne indicadores relevantes de cada área en un tablero consistente.; Contrasta periodos, sucursales o segmentos para entender variaciones.; Genera archivos listos para compartir y continuar el análisis. | Bring relevant indicators from every area into one consistent dashboard.; Compare periods, branches, or segments to understand changes.; Generate shareable files for reporting and continued analysis. | Réunissez les indicateurs de chaque domaine dans un tableau cohérent.; Comparez périodes, sites ou segments pour comprendre les variations.; Générez des fichiers partageables pour poursuivre l’analyse. |

For each row, split the semicolon-delimited triplet into three objects paired with the localized titles. Use `satisfies ModuleDefinition[]` on the finished array so missing locales or fields fail type checking.

- [ ] **Step 5: Run tests and type checking to verify GREEN**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: PASS for the catalog tests; older tests referring to removed exports may still fail until Task 2 and must be updated there.

Run: `pnpm run typecheck`

Expected: Type errors identify the existing mega menu and route callers that still use the old API. Record them as the expected RED state for Tasks 2 and 4.

- [ ] **Step 6: Commit the catalog and test boundary**

```bash
git add scripts/landing-theme.test.mjs lib/modules.ts
git commit -m "feat: localize public module catalog"
```

---

### Task 2: Make the Mega Menu Consume the Localized Catalog

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `components/landing/mega-menu.tsx`

**Interfaces:**
- Consumes: `getMegaMenuSections(locale: Locale): ModuleSection[]` from Task 1.
- Produces: unchanged `LandingMegaMenu({ locale, mode })` component behavior with catalog-backed labels.

- [ ] **Step 1: Replace the old mega-menu localization assertion with a failing boundary test**

```js
test("landing mega menu consumes the localized module catalog", () => {
  assert.match(megaMenuSource, /getMegaMenuSections\(safeLocale\)/);
  assert.doesNotMatch(megaMenuSource, /localizedModuleLabel/);
  assert.doesNotMatch(megaMenuSource, /const labels:\s*Record<string, string>/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: FAIL because `mega-menu.tsx` still imports `megaMenuSections` and guesses labels from dictionary values.

- [ ] **Step 3: Replace duplicate localization logic**

Change the import and memoized sections to:

```ts
import { getMegaMenuSections } from "@/lib/modules";

const localizedSections = useMemo(
  () => getMegaMenuSections(safeLocale),
  [safeLocale],
);
```

Delete the `localizedModuleLabel` function and remove the now-unused dictionary section mapping. Keep `getDictionary(safeLocale)` because the mega-menu button, eyebrow, and description still use it.

- [ ] **Step 4: Run tests and type checking to verify GREEN**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: PASS for all mega-menu tests.

Run: `pnpm run typecheck`

Expected: mega-menu errors are gone; route errors from the old lookup remain until Task 4.

- [ ] **Step 5: Commit**

```bash
git add scripts/landing-theme.test.mjs components/landing/mega-menu.tsx
git commit -m "refactor: share localized module menu content"
```

---

### Task 3: Localize Shared Page Chrome and Render Real Screenshots

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `lib/i18n/en.ts`
- Modify: `lib/i18n/es.ts`
- Modify: `lib/i18n/fr.ts`
- Modify: `components/landing/module-page-template.tsx`

**Interfaces:**
- Consumes: localized `ModuleItem`, `Locale`, and `getDictionary(locale)`.
- Produces: `dictionary.landing.modulePage` and a CTA-free real-image page template.

- [ ] **Step 1: Add failing template and dictionary tests**

```js
test("module page dictionaries localize all shared page chrome", () => {
  for (const source of [enDictionarySource, esDictionarySource, frDictionarySource]) {
    assert.match(source, /modulePage:\s*\{/);
    assert.match(source, /back:/);
    assert.match(source, /featuresEyebrow:/);
    assert.match(source, /featuresTitle:/);
    assert.match(source, /bannerEyebrow:/);
    assert.match(source, /bannerTitle:/);
  }
});

test("public module template renders supplied images and real highlights", () => {
  assert.match(moduleTemplateSource, /import Image from "next\/image"/);
  assert.match(moduleTemplateSource, /src=\{module\.imageSrc\}/);
  assert.match(moduleTemplateSource, /alt=\{module\.imageAlt\}/);
  assert.match(moduleTemplateSource, /feature\.description/);
  assert.doesNotMatch(moduleTemplateSource, /Screenshot preview coming soon/);
  assert.doesNotMatch(moduleTemplateSource, /Public preview copy for this capability/);
});

test("public module page has no create-account action", () => {
  assert.doesNotMatch(moduleTemplateSource, /href=\{"\/register"/);
  assert.doesNotMatch(moduleTemplateSource, /Create account/);
  assert.doesNotMatch(moduleTemplateSource, /ArrowRight/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: FAIL because dictionaries lack `modulePage`, the template shows a placeholder, features are strings, and the registration CTA exists.

- [ ] **Step 3: Add exact dictionary chrome**

Add beside `landing.megaMenu` in each dictionary:

```ts
// en.ts
modulePage: {
  back: "Back",
  featuresEyebrow: "Key features",
  featuresTitle: "What this module highlights",
  bannerEyebrow: "Built for connected operations",
  bannerTitle: "Explore The Tower Power with your team",
},

// es.ts
modulePage: {
  back: "Volver",
  featuresEyebrow: "Funciones clave",
  featuresTitle: "Lo más destacado de este módulo",
  bannerEyebrow: "Creado para operaciones conectadas",
  bannerTitle: "Explora The Tower Power con tu equipo",
},

// fr.ts
modulePage: {
  back: "Retour",
  featuresEyebrow: "Fonctions clés",
  featuresTitle: "Les points forts de ce module",
  bannerEyebrow: "Conçu pour des opérations connectées",
  bannerTitle: "Explorez The Tower Power avec votre équipe",
},
```

- [ ] **Step 4: Replace the screenshot placeholder and hard-coded template copy**

Import `Image` from `next/image`, remove `ArrowRight` and `ImageIcon`, then begin the component with:

```ts
const dictionary = getDictionary(locale);
const pageCopy = dictionary.landing.modulePage;
```

Use `href={\`/${locale}\` as Route}` for the back link and render `{pageCopy.back}`. Replace all shared headings with their `pageCopy` values.

Replace the placeholder’s inner dashed panel with:

```tsx
<div className="relative min-h-[24rem] overflow-hidden border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)]">
  <Image
    src={module.imageSrc}
    alt={module.imageAlt}
    fill
    priority
    sizes="(min-width: 1024px) 55vw, 100vw"
    className="object-contain"
  />
</div>
```

Render feature cards with `key={feature.title}`, `{feature.title}`, and `{feature.description}`. Delete the registration `Link` completely and keep only the localized banner text in the final section.

- [ ] **Step 5: Run tests and type checking to verify GREEN**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: PASS for template and dictionary tests.

Run: `pnpm run typecheck`

Expected: template and dictionary types pass; only old route API usage may remain.

- [ ] **Step 6: Commit**

```bash
git add scripts/landing-theme.test.mjs lib/i18n/en.ts lib/i18n/es.ts lib/i18n/fr.ts components/landing/module-page-template.tsx
git commit -m "feat: render localized public module previews"
```

---

### Task 4: Localize Route Lookup and Metadata

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `app/[locale]/modules/[slug]/page.tsx`

**Interfaces:**
- Consumes: `moduleSlugs`, `getModuleBySlug(slug, locale)`, `isLocale`, and `locales`.
- Produces: localized static params, metadata, and template props.

- [ ] **Step 1: Add a failing route-localization test**

```js
test("public module route localizes lookup and metadata", () => {
  assert.match(moduleRouteSource, /moduleSlugs\.map/);
  assert.match(moduleRouteSource, /if \(!isLocale\(locale\)\)/);
  assert.match(moduleRouteSource, /getModuleBySlug\(slug, locale\)/);
  assert.doesNotMatch(moduleRouteSource, /getModuleBySlug\(slug\);/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: FAIL because route metadata ignores locale and static params use Spanish-resolved modules.

- [ ] **Step 3: Update static params, metadata, and page lookup**

Import `moduleSlugs` instead of `modules`. Generate params with:

```ts
return locales.flatMap((locale) =>
  moduleSlugs.map((slug) => ({ locale, slug })),
);
```

In `generateMetadata`, await both `locale` and `slug`; return the not-found title when `!isLocale(locale)` or lookup fails. Otherwise call `getModuleBySlug(slug, locale)` and use its localized `label` and `description`.

In the page function, keep the locale guard before lookup, then call:

```ts
const moduleItem = getModuleBySlug(slug, locale);
```

Pass `locale` directly to the template without a redundant cast.

- [ ] **Step 4: Run focused tests and type checking to verify GREEN**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: all tests PASS.

Run: `pnpm run typecheck`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/landing-theme.test.mjs 'app/[locale]/modules/[slug]/page.tsx'
git commit -m "feat: localize public module metadata"
```

---

### Task 5: Verify the Complete Public Module Experience

**Files:**
- Verify only; do not modify unrelated files.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: fresh evidence that the finished change meets the design.

- [ ] **Step 1: Verify supplied files and mappings**

Run:

```powershell
$screenshots = @(
  'Panel Op.png','POS.png','Gestion Membresias.png','Access Control.png',
  'Product catalog.png','Purchasing supply.png','Warehouse Management.png',
  'Inventory Stock.png','Finance Module.png','Accounting.png','HR attendance.png',
  'Payroll commissions.png','Period Settlement.png','Marketing retention.png',
  'Analytics Intelligence.png'
)
$screenshots | ForEach-Object { Test-Path -LiteralPath (Join-Path 'public' $_) }
```

Expected: fifteen `True` lines.

- [ ] **Step 2: Run the focused regression suite**

Run: `node --test scripts/landing-theme.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 3: Run TypeScript checking**

Run: `pnpm run typecheck`

Expected: exit 0 with no errors.

- [ ] **Step 4: Run lint if the configured Next.js command is supported**

Run: `pnpm run lint`

Expected: exit 0. If Next.js 15 reports that `next lint` is unavailable, record that configuration limitation rather than changing lint configuration in this feature.

- [ ] **Step 5: Run a production build**

Run: `pnpm run build`

Expected: exit 0 and successful static generation for every locale/module route. If Prisma or external environment configuration blocks the build, report the exact blocker and retain the passing focused test/typecheck evidence.

- [ ] **Step 6: Inspect the final diff and workspace state**

Run: `git diff --check HEAD~4..HEAD` and `git status --short`.

Expected: no whitespace errors; the pre-existing `pnpm-workspace.yaml` modification and user PNGs remain preserved.
