# Directrices Base del Proyecto — UI/UX y Frontend

Propósito
- Establecer normas estrictas, repetibles y exigibles para diseño UI/UX y desarrollo frontend.
- Garantizar coherencia visual, accesibilidad, internacionalización y mantenibilidad en todo el producto.

Ámbito
- Aplicable a todo desarrollo nuevo y refactorizaciones: componentes, pages, layouts, estilos, iconografía y documentación del frontend (Next.js App Router, React, Tailwind).

Reglas obligatorias
1. Gestión de Colores
- Uso obligatorio y único de las variables de color definidas en `globals.css`. La paleta central se iterará desde ese archivo y todos los componentes deben consumir esos tokens.
- Prohibido el uso de colores hardcodeados en componentes (ej.: `text-blue-500`, `bg-red-600`, `#FFF`, `rgb(255,255,255)`).
- Implementación obligatoria: todas las referencias de color deben usar variables CSS o tokens nombrados. Ejemplos permitidos:
  ```tsx
  // permitido
  <button className="text-[var(--color-primary)] bg-[var(--color-surface)]">Aceptar</button>

  // prohibido
  <button className="text-blue-500 bg-white">Aceptar</button>
  ```
- Convención de nombres sugerida en `globals.css`: `--color-primary`, `--color-foreground`, `--color-muted`, `--color-surface`, `--color-glass`, `--glass-accent`.
- Verificación automática: integrar un linter/scrip de chequeo que detecte hex, rgb y utilidades Tailwind de color en PRs; fallar CI si se detectan.

2. Prioridad de Componentes
- Priorizar absoluta y sistemáticamente los componentes de Shadcn UI. Antes de crear un componente nuevo:
  - Buscar si existe un componente shadcn que cubra la necesidad.
  - Extender/componer el componente shadcn en lugar de copiar su implementación.
- Si se requiere un comportamiento o estilo no soportado, crear un "wrapper" que exponga props y mantenga compatibilidad con la API de shadcn.
- Evitar reimplementar UI común (botones, inputs, modales, popovers). La consistencia se logra mediante reutilización.

3. Iconografía
- Uso exclusivo de `lucide-react` para iconografía en el frontend.
- Estándar de uso:
  ```tsx
  import { Trash } from 'lucide-react'
  <Trash className="w-5 h-5" aria-hidden />
  ```
- Reglas:
  - Iconos siempre accesibles: si el icono transmite información, proporcionar `aria-label` o `sr-only` text.
  - Tamaños y stroke uniformes: definir utilidades/variantes en un wrapper (`<Icon name="Trash" />`) para normalizar `size` y `strokeWidth`.
- Si no existe el icono necesario en `lucide-react`, PAUSA y consulta con el Product/UX:
  - No instalar librerías alternativas (ej. `react-icons`) sin autorización explícita.
  - Documentar la necesidad, alternativas y coste antes de proponer una nueva dependencia.

4. Responsividad Total
- Enfoque Mobile-First: todas las vistas y componentes deben construirse primero para pantallas pequeñas y luego extenderse con breakpoints.
- Requerimiento: usar los breakpoints estándar de Tailwind: `sm`, `md`, `lg`, `xl`, `2xl`.
- Implementación:
  - Verificar visualización y comportamiento en cada breakpoint clave.
  - Los componentes que presentan datos (tablas, gráficas, cards) deben tener versiones/ajustes específicos para `sm` y `md`.
- Ejemplo:
  ```html
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">...</div>
  ```

5. Estilo Visual (Glassmorphism)
- Patrón visual obligatorio: glassmorphism controlado en componentes principales (cards, modals, sidebars).
- Requisitos de estilo:
  - Usar fondos con baja opacidad y variables (`--color-glass`), utilidades `backdrop-blur` (`backdrop-blur-sm`/`md`) y sombras suaves.
  - Adaptación a light/dark mode mediante tokens: `--glass-bg-light`, `--glass-bg-dark`.
  - Mantener bordes y contornos sutiles para separar contenido sin romper la fusión con el fondo.
- Ejemplo recomendado:
  ```css
  /* globals.css */
  :root {
    --glass-bg: 255 255 255; /* RGB base para composiciones con rgba(var(--glass-bg), 0.06) */
  }
  [data-theme="dark"] {
    --glass-bg: 18 18 20;
  }
  ```
  ```html
  <div className="bg-[rgba(var(--glass-bg),0.06)] backdrop-blur-sm shadow-[0_6px_24px_rgba(0,0,0,0.12)] rounded-lg">...</div>
  ```
- Restricción: si el glassmorphism reduce contraste, ajustar opacidad o añadir overlay para cumplir accesibilidad (ver sección 6).

6. Accesibilidad Implacable
- Objetivo: cumplimiento WAI-ARIA/WCAG y Lighthouse Accessibility → meta: 100.
- Reglas mínimas:
  - Contraste: mínimo 4.5:1 para texto normal; 3:1 para texto grande; preferir 7:1 en componentes críticos.
  - Semántica: usar etiquetas HTML semánticas (`button`, `nav`, `main`, `header`, `footer`, `form`, `label`, `fieldset`).
  - Roles y ARIA: aplicar solo cuando la semántica no sea suficiente; evitar uso redundante o incorrecto de ARIA.
  - Foco visible y navegabilidad por teclado: asegurar `:focus-visible` claramente visible; componentes interactivos deben ser alcanzables por teclado.
  - Live regions: para actualizaciones asíncronas que deben ser anunciadas, usar `aria-live` apropiado.
  - Modales y diálogos: trap de foco, restauración del foco y `aria-labelledby`/`aria-describedby`.
- Pruebas obligatorias en cada PR:
  - Autotest de contraste (axe-core / pa11y).
  - Lighthouse Accessibility report mínimo local antes de merge.
  - Revisión manual de keyboard flows para nuevas interacciones.
- Nota: Glassmorphism nunca es excusa para romper contraste o navegación.

7. Internacionalización (i18n)
- Prohibido el uso de textos estáticos en la interfaz. TODO texto visible debe provenir del sistema i18n y respetar las rutas `[locale]`.
- Reglas:
  - Usar el hook/context `useI18n()` o la utilidad de traducción central del repo.
  - En components clientes, añadir `"use client"` donde se use el hook.
  - No concatenar strings traducibles en tiempo de render; usar placeholders y parámetros.
- Ejemplo:
  ```tsx
  'use client'
  import { useI18n } from '@/lib/i18n'

  export default function Welcome() {
    const { t } = useI18n()
    return <h1>{t('dashboard.welcome', { name: userName })}</h1>
  }
  ```
- Gestión de claves:
  - Mantener claves explícitas y anidar por dominio: `dashboard.title`, `user.invite.sent`.
  - Documentar nuevas claves en su archivo de locale correspondiente (`en.ts`, `es.ts`).

8. Manejo de Estados UI
- Obligatorio manejar:
  - Estados de carga (Loading / Skeletons)
  - Estados de error (Error Boundaries / mensajes de feedback)
  - Estados vacíos (Empty states con CTA)
- Reglas:
  - Cada vista que dependa de datos asincrónicos debe mostrar un skeleton o placeholder significativo.
  - Error boundaries globales y por ruta: mostrar UI amigable con opciones de retry y log del error.
  - Empty states deben incluir microcopy y acción recomendada (ej.: botón para crear recurso).
- Ejemplo:
  ```tsx
  // patrón recomendado
  if (isLoading) return <SkeletonList />
  if (error) return <ErrorCard onRetry={fetchData} />
  if (!items?.length) return <EmptyState title={t('items.empty')} action={<Button>{t('items.create')}</Button>} />
  ```

**Verificación y cumplimiento (Enforcement)**
- **Checklist de PR obligatorio (cada PR debe incluir):**
  - ✅ `pnpm lint` sin errores relevantes; `eslint-plugin-jsx-a11y` debe estar activo y sin fallos.
  - ✅ `pnpm typecheck` sin errores.
  - ✅ Pruebas unitarias relevantes pasan.
  - ✅ Comprobación automática de colores (no hex ni utilidades Tailwind de color hardcodeadas).
  - ✅ `pnpm run check:accessibility` (pa11y) ejecutado localmente sin bloquearse en problemas críticos.
  - ✅ Validación de accesibilidad estricta en CI mediante `@lhci/cli` (assert `accessibility >= 1.0`).
  - ✅ Revisar uso de `lucide-react` (si se añadieron iconos nuevos, documentar decisión en la PR).
  - ✅ Confirmación de que todos los textos provienen de i18n.

    - ✅ Confirmación de que las nuevas rutas o módulos han sido añadidos a `scripts/urls.txt` y que `pnpm run lhci:update-urls` se ha ejecutado cuando aplique.

- **Hooks de pre-commit / CI (recomendado):**
  - Ejecutar `pnpm format`, `pnpm lint`, `pnpm test`, y script `lint:colors`.
  - Incluir paso de accesibilidad en CI que ejecute `lhci autorun` y falle si la aserción de `accessibility` no se cumple.
  - Mantener `scripts/urls.txt` actualizado: cada nuevo módulo/ruta debe añadirse a `scripts/urls.txt`. Añadir el cambio en la PR y ejecutar `pnpm run lhci:update-urls` en el pipeline antes de ejecutar `pnpm run lhci:mobile`.
  - Si `lint:colors` o las reglas de `eslint-plugin-jsx-a11y` fallan, bloquear merge y exigir corrección.

Ejemplos rápidos — Buenas vs Malas
- Colores
  ```tsx
  // Malo
  <span className="text-blue-500">Activo</span>

  // Bueno
  <span className="text-[var(--color-success)]">Activo</span>
  ```
- Iconos
  ```tsx
  // Malo (instalación externa no autorizada)
  import { FaTrash } from 'react-icons/fa'

  // Bueno (lucide-react)
  import { Trash } from 'lucide-react'
  <Trash className="w-4 h-4" />
  ```
- i18n
  ```tsx
  // Malo
  <h1>Welcome back</h1>

  // Bueno
  <h1>{t('welcome.back')}</h1>
  ```

Tokens y variables recomendadas (ejemplos)
- `--color-primary`
- `--color-secondary`
- `--color-foreground`
- `--color-muted`
- `--color-surface`
- `--color-glass` (RGB triplet base)
- `--glass-opacity` (value used in rgba)
- `--radius-sm`, `--radius-md`, `--radius-lg`

Patrones de componentes y extensibilidad
- Wrapper de iconos: crear `components/Icon.tsx` que normalice tamaño, aria y stroke.
- Wrapper de botón: extender `shadcn` Button para exponer variantes composables y tokens.
- Evitar estilos inline y clases duplicadas; preferir utilidades y tokens centralizados.

Procedimiento para excepciones y nuevas dependencias
- Si se solicita añadir nueva librería (UI/Iconografía/estilos):
  - Documentar la necesidad en la issue/PR.
  - Incluir análisis de alternativas y coste (bundle, mantenimiento).
  - Obtener aprobación explícita de Tech Lead/PM antes de merge.
- Para iconos ausentes en `lucide-react`: abrir issue interno indicando icono requerido y razón de negocio; no añadir librerías ad-hoc.

- **Testing y QA**
- La documentación y procedimientos de testing (Pa11y, LHCI, scripts, checklist de PR, ejecución local y CI) han sido movidos a `testing-guidelines.md`.
- Sigue `testing-guidelines.md` para ejecutar auditorías locales y en CI, y para el procedimiento completo de generación de reportes.
 - `scripts/urls.txt` (lista canónica de URLs críticas que deben auditarse; mantener actualizada)
- `axe-core` (unit & e2e checks cuando se integre con test runners)
- Lighthouse (automatizado en CI para accesibilidad, con aserciones mediante LHCI)
- Pa11y o Storybook snapshots con accessibility checks
- Script de lint personalizado para detectar colores y strings hardcodeadas

Notas finales — Mentalidad y disciplina
- La coherencia visual y la accesibilidad valen más que la velocidad de entrega inmediata. Si una decisión rompe cualquiera de las reglas críticas (colores, i18n, accesibilidad, iconografía), detenerse y elevar la issue.
- Documentar cualquier adición de token, clave i18n o excepción en el PR y en la documentación de diseño del repo.

Regla de creación de módulos
- Al crear un nuevo módulo o ruta pública (por ejemplo, agregar una carpeta en `app/[locale]/(dashboard)/<module>/page.tsx`), **es obligatorio**:
  1. Añadir la(s) URL(s) correspondiente(s) a `scripts/urls.txt` (incluir ambas variantes de idioma si aplica).
  2. Ejecutar `pnpm run lhci:update-urls` localmente para actualizar `lighthouserc.json`.
  3. Ejecutar `pnpm run check:accessibility:all` y resolver cualquier issue antes de abrir la PR.
  4. Incluir en la PR la actualización a `scripts/urls.txt` y un comentario que confirme que las comprobaciones de accesibilidad pasan.

--- 

Estas directrices son vinculantes: todo nuevo cambio de UI/UX o componente debe adherirse a ellas. Si surge una situación excepcional, documenta, solicita aprobación y registra la decisión.
