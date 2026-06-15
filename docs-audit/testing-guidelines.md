# Testing Guidelines — QA & Accessibility

Propósito
- Documentar las herramientas, scripts y procesos para auditorías de accesibilidad y testing en local y CI.
- Servir como referencia operativa para desarrolladores y QA.

Ámbito
- Auditorías automáticas y manuales de accesibilidad (Lighthouse, Pa11y, axe-core).
- Scripts locales y de CI para ejecutar comprobaciones periódicas.

1) Herramientas y dependencias
- `eslint-plugin-jsx-a11y` — reglas de accesibilidad a nivel de código (integrado en ESLint).
- `pa11y` — auditoría rápida y reportes (usa puppeteer/Chromium para render headless).
- `@lhci/cli` — Lighthouse CI para aserciones estrictas en integración continua.
- `axe-core` — librería para checks unitarios y e2e.
- `puppeteer` / `puppeteer-core` — requerido por `pa11y` para controlar Chromium. Instala Chromium con:

```powershell
pnpm dlx puppeteer@latest browsers install chrome
```

2) Archivos y scripts importantes (ubicación en repo)
- `scripts/urls.txt` — lista canónica de URLs críticas a auditar (incluye variantes `es`/`en`).
- `scripts/update-lhci-urls.js` — genera `lighthouserc.json` desde `scripts/urls.txt`.
- `scripts/run-pa11y.js` — ejecuta `pa11y` para cada URL de `scripts/urls.txt` y guarda reportes HTML en `reports/`.
- `lighthouserc.json` — configuración usada por LHCI; se puede regenerar con `pnpm run lhci:update-urls`.
- `package.json` scripts relevantes:
  - `pnpm run check:accessibility` → Pa11y para `http://localhost:3000` (rápido).
  - `pnpm run check:accessibility:all` → ejecuta `node scripts/run-pa11y.js` y genera reportes en `./reports`.
  - `pnpm run lhci:update-urls` → actualiza `lighthouserc.json` desde `scripts/urls.txt`.
  - `pnpm run lhci:mobile` → `lhci autorun` con `formFactor=mobile` (usa `lighthouserc.json`).
  - `pnpm run lhci:all` → ejecuta `lhci:update-urls` y luego `lhci:mobile`.

3) Flujo recomendado (local)
1. Levantar servidor local (producción o dev según necesidad):

```powershell
pnpm run build
pnpm run start
# o para entorno dev:
pnpm run dev
```

2. Regenerar `lighthouserc.json` desde la lista de URLs:

```powershell
pnpm run lhci:update-urls
```

3. Ejecutar Pa11y contra todas las URLs y revisar reportes HTML:

```powershell
pnpm run check:accessibility:all
# reportes generados en ./reports/pa11y-*.html
```

4. Ejecutar LHCI (Lighthouse CI) para aplicar aserciones estrictas:

```powershell
pnpm run lhci:all
```

4) Flujo recomendado (CI)
- Añadir un step/post-build que:
  1. Ejecute `pnpm run lhci:update-urls` (si `scripts/urls.txt` forma parte del commit/PR).
  2. Ejecute `pnpm run lhci:mobile` y falle el job si LHCI no cumple las aserciones.
- Configurar `LHCI_GITHUB_APP_TOKEN` o `LHCI_GITHUB_COMMRAPTOR_TOKEN` si quieres integrar resultados en PRs (opcional y seguro).

Ejemplo mínimo (GitHub Actions) — sólo ilustrativo:

```yaml
name: accessibility
on: [pull_request]
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: pnpm install
      - name: Build
        run: pnpm run build
      - name: Update LHCI URLs
        run: pnpm run lhci:update-urls
      - name: Run LHCI (mobile)
        run: pnpm run lhci:mobile
```

5) Mantenimiento de `scripts/urls.txt`
- `scripts/urls.txt` es la fuente de verdad para auditorías automáticas. Debe contener las rutas críticas en producción relativas al host (ej. `http://localhost:3000/es/dashboard`).
- Al añadir o remover módulos, actualiza esta lista y ejecuta localmente `pnpm run lhci:update-urls` y `pnpm run check:accessibility:all` antes de abrir la PR.

6) Interpretación de fallos y acciones
- Pa11y suele reportar problemas concretos (contraste, labels faltantes, roles, etc.). Cada fallo debe tener una justificación en la PR y, si es corrección de diseño, un ticket asociado.
- LHCI fallará si la puntuación de `accessibility` no alcanza la meta establecida (por defecto `1.0` / 100%). Requerimos remediar los problemas o justificar la excepción y obtener aprobación de Tech Lead.

7) Troubleshooting común
- Error "Could not find Chrome": ejecutar

```powershell
pnpm dlx puppeteer@latest browsers install chrome
```

- Problemas de certificados en entornos corporativos: trabaja con IT para permitir la descarga de paquetes o ejecuta las instalaciones en un entorno con acceso sin proxy.

8) Reportes y seguimiento
- LHCI sube un reporte público temporal (configuración `temporary-public-storage`) y devuelve un enlace en la salida del comando.
- Pa11y genera reportes HTML (script `run-pa11y.js`) en la carpeta `reports/` del repo local.

9) Checklist de PR sugerido (testing)
- Asegurar que `scripts/urls.txt` contiene las nuevas rutas si aplica.
- Ejecutar `pnpm run check:accessibility:all` y adjuntar reportes Pa11y relevantes si hubo cambios.
- Ejecutar `pnpm run lhci:mobile` o dejar la validación para CI según política del equipo.

10) Escalado y excepciones
- Si una comprobación necesita una excepción documentada (por diseño, branding o dependencia externa), crear un issue con: captura de pantalla, motivo, riesgo de accesibilidad y plan de mitigación. Obtener aprobación del Tech Lead.

---

Mantén `testing-guidelines.md` como la referencia operativa para todo lo relacionado con QA, auditorías y reporting de accesibilidad.
