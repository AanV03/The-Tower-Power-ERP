# Integracion Backend del Onboarding de Administrador

## Objetivo

Conectar el onboarding de administrador con backend para que la configuracion inicial del gimnasio deje de ser un flujo visual y pase a persistir datos reales del tenant, sucursal principal, plan seleccionado y estado de finalizacion.

El flujo actual vive en dos superficies:

- `components/layout/admin-onboarding-wrapper.tsx`: onboarding modal/gate que bloquea el Dashboard.
- `app/[locale]/onboarding/*`: rutas directas del onboarding.

La integracion backend debe mantener ambas superficies alineadas o consolidarlas sobre una unica fuente de estado.

## Alcance Funcional

El backend debe soportar:

- Guardar informacion fiscal y operativa del gimnasio.
- Crear o actualizar la sucursal principal.
- Guardar zona horaria de la sucursal.
- Asociar un plan SaaS al tenant.
- Registrar datos de pago de forma segura mediante proveedor externo, sin almacenar numero de tarjeta completo.
- Marcar el onboarding como completado.
- Evitar que el Dashboard muestre nuevamente el onboarding cuando ya este completo.
- Permitir retomar el onboarding si queda incompleto.

## Datos del Onboarding

### Informacion del Gimnasio

Campos capturados actualmente:

```ts
type GymInfo = {
  gymName: string;
  address: string;
  timeZone: string;
  curp: string;
  rfc: string;
};
```

Mapeo recomendado:

| Campo UI | Modelo Prisma | Campo |
| --- | --- | --- |
| `gymName` | `Tenant` | `name`, `legalName` |
| `rfc` | `Tenant` | `taxId` |
| `curp` | `Tenant.brandIdentity` | `ownerCurp` |
| `address` | `Branch` | `address` JSON |
| `timeZone` | `Branch` | `timezone` |

### Plan

Campos capturados actualmente:

```ts
type PlanSelection = {
  planId: "basic" | "pro" | "enterprise";
  planName: string;
  priceLabel: string;
  cardNumber?: string; // solo UI temporal
};
```

Mapeo recomendado:

| Campo UI | Modelo Prisma | Campo |
| --- | --- | --- |
| `planId` | `SaasPlan` | `id` o `name` normalizado |
| `planId` | `Tenant` | `planId` |
| tarjeta | proveedor de pagos | payment method token |

No se debe persistir `cardNumber` completo en base de datos.

## Estado del Onboarding

Actualmente el Dashboard decide mostrar el gate usando:

```ts
tenant.brandIdentity?.adminOnboardingCompleted
```

Se recomienda formalizar esta estructura dentro de `Tenant.brandIdentity`:

```json
{
  "adminOnboardingCompleted": true,
  "adminOnboardingCompletedAt": "2026-07-10T00:00:00.000Z",
  "adminOnboardingVersion": 1,
  "ownerCurp": "ABCD010101HDFRRN09",
  "onboarding": {
    "lastStep": "finish",
    "selectedPlanId": "pro",
    "primaryBranchId": "branch_id",
    "paymentMethodStatus": "attached"
  }
}
```

Si se prefiere mayor trazabilidad, crear una tabla dedicada:

```prisma
model TenantOnboarding {
  id          String   @id @default(cuid())
  tenantId    String   @unique
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  status      String   @default("IN_PROGRESS")
  currentStep String?
  payload     Json?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tenant_onboardings")
}
```

Para el alcance actual, `Tenant.brandIdentity` es suficiente. La tabla dedicada es mejor si se requiere auditoria, reintentos, historico o soporte.

## Endpoints Recomendados

### Obtener Estado

```http
GET /api/admin/onboarding
```

Respuesta:

```json
{
  "ok": true,
  "onboarding": {
    "completed": false,
    "currentStep": "gym-info",
    "gymInfo": {
      "gymName": "The Tower Power Fitness Center",
      "address": "Av. Principal 123",
      "timeZone": "America/Mexico_City",
      "curp": "ABCD010101HDFRRN09",
      "rfc": "XAXX010101000"
    },
    "plan": null
  }
}
```

Uso:

- Inicializar rutas `/[locale]/onboarding/*`.
- Inicializar `AdminOnboardingWrapper`.
- Permitir reanudar onboarding incompleto.

### Guardar Informacion del Gimnasio

```http
PATCH /api/admin/onboarding/gym-info
```

Body:

```json
{
  "gymName": "The Tower Power Fitness Center",
  "address": "Av. Principal 123, Col. Centro",
  "timeZone": "America/Mexico_City",
  "curp": "ABCD010101HDFRRN09",
  "rfc": "XAXX010101000"
}
```

Acciones backend:

- Validar `gymName`, `address`, `timeZone`, `curp`, `rfc`.
- Actualizar `Tenant.name`.
- Actualizar `Tenant.legalName`.
- Actualizar `Tenant.taxId`.
- Guardar `ownerCurp` en `Tenant.brandIdentity`.
- Crear o actualizar la sucursal principal en `Branch`.
- Guardar `Branch.address`.
- Guardar `Branch.timezone`.
- Guardar avance de onboarding.

### Guardar Plan

```http
PATCH /api/admin/onboarding/plan
```

Body:

```json
{
  "planId": "pro",
  "paymentMethodToken": "pm_xxx"
}
```

Acciones backend:

- Validar que el plan exista en `SaasPlan`.
- Asociar `Tenant.planId`.
- Guardar estado de metodo de pago en `Tenant.brandIdentity.onboarding`.
- No guardar numero de tarjeta.

### Finalizar Onboarding

```http
POST /api/admin/onboarding/complete
```

Acciones backend:

- Validar que `Tenant.name`, `Tenant.taxId`, sucursal principal y `Tenant.planId` existan.
- Marcar `brandIdentity.adminOnboardingCompleted = true`.
- Guardar `adminOnboardingCompletedAt`.
- Guardar `adminOnboardingVersion`.
- Retornar estado final.

Respuesta:

```json
{
  "ok": true,
  "redirectTo": "/es/dashboard"
}
```

## Validaciones Backend

Las validaciones del frontend deben duplicarse en backend.

### RFC

Regex actual:

```ts
const rfcRegex = /^([A-ZÑ&]{3,4})\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/;
```

### CURP

Regex actual:

```ts
const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
```

### Zona Horaria

Validar contra una lista IANA. Ejemplos:

- `America/Mexico_City`
- `America/Monterrey`
- `America/Cancun`
- `America/Tijuana`
- `America/Hermosillo`

En runtime moderno puede validarse con:

```ts
Intl.supportedValuesOf("timeZone").includes(timeZone)
```

Si el runtime no soporta `supportedValuesOf`, usar una lista permitida propia.

### Direccion

Para el modelo actual `Branch.address` es `Json?`. Estructura recomendada:

```json
{
  "line1": "Av. Principal 123",
  "line2": "Local 4",
  "city": "Ciudad de Mexico",
  "state": "CDMX",
  "postalCode": "01000",
  "country": "MX",
  "raw": "Av. Principal 123, Col. Centro"
}
```

Si el frontend mantiene un solo campo `address`, guardar inicialmente:

```json
{
  "raw": "Av. Principal 123, Col. Centro",
  "country": "MX"
}
```

## Integracion con Signup

El Signup actual no debe romperse. La integracion recomendada es:

1. Registro exitoso.
2. Creacion de tenant y usuario administrador.
3. Inicializacion de `Tenant.brandIdentity.adminOnboardingCompleted = false`.
4. Redirect a:

```ts
router.push(`/${locale}/onboarding`);
```

o directo al Dashboard si se quiere usar el gate:

```ts
router.push(`/${locale}/dashboard`);
```

El Dashboard ya puede mostrar `AdminOnboardingGate` si el tenant es elegible y no ha completado onboarding.

## Integracion con Dashboard Gate

Archivo actual:

```text
app/[locale]/(dashboard)/layout.tsx
```

Condicion actual:

```ts
onboardingCompleted = Boolean((tenant.brandIdentity as any)?.adminOnboardingCompleted);
```

Recomendacion:

- Remover checks temporales por fecha cuando el feature sea oficial.
- Mostrar onboarding si:

```ts
Boolean(tenantId && !tenant.brandIdentity?.adminOnboardingCompleted)
```

Evitar depender de:

```ts
tenant.createdAt >= new Date("2026-07-05T00:00:00.000Z")
```

cuando el rollout ya este completo.

## Pago y Seguridad

El frontend actual captura `cardNumber` solo para validar UI. Para backend real:

- No enviar PAN completo al backend propio.
- No almacenar tarjeta completa.
- Integrar un proveedor PCI-compliant.
- Usar tokenizacion en frontend.
- Enviar al backend solo `paymentMethodToken`.
- Guardar en DB solo:
  - `provider`
  - `customerId`
  - `paymentMethodId`
  - `brand`
  - `last4`
  - `expMonth`
  - `expYear`

Modelo sugerido:

```prisma
model TenantBillingProfile {
  id                    String   @id @default(cuid())
  tenantId              String   @unique
  provider              String
  providerCustomerId    String
  providerPaymentMethodId String?
  cardBrand             String?
  cardLast4             String?
  cardExpMonth          Int?
  cardExpYear           Int?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("tenant_billing_profiles")
}
```

## Plan de Implementacion

### Fase 1: Contratos y Validacion

- Crear schemas compartidos en `modules/onboarding/schemas`.
- Incluir `address` y `timeZone` en `onboardingGymInfoSchema`.
- Alinear regex y mensajes de error.
- Crear tipos:
  - `OnboardingGymInfo`
  - `OnboardingPlanSelection`
  - `OnboardingState`

### Fase 2: API de Onboarding

- Crear `app/api/admin/onboarding/route.ts` para `GET`.
- Crear `app/api/admin/onboarding/gym-info/route.ts` para `PATCH`.
- Crear `app/api/admin/onboarding/plan/route.ts` para `PATCH`.
- Crear `app/api/admin/onboarding/complete/route.ts` para `POST`.
- Reusar contexto de tenant existente desde cookies/session.
- Validar permisos de administrador.

### Fase 3: Persistencia

- Actualizar `Tenant`.
- Crear/actualizar `Branch` principal.
- Asociar `SaasPlan`.
- Guardar progreso en `Tenant.brandIdentity.onboarding`.
- Marcar `adminOnboardingCompleted`.

### Fase 4: Frontend

- Sustituir estado local en `AdminOnboardingWrapper` por estado inicial desde `GET /api/admin/onboarding`.
- Guardar cada paso con los endpoints.
- Mostrar loading y errores por paso.
- Deshabilitar avance cuando el guardado falle.
- Mantener rutas directas `/[locale]/onboarding/*` sincronizadas con el mismo contrato.

### Fase 5: Signup

- Al terminar registro y 2FA, redirigir a onboarding o Dashboard gate.
- No alterar validacion actual de Signup.
- Inicializar `adminOnboardingCompleted = false`.

### Fase 6: Pagos

- Elegir proveedor.
- Tokenizar tarjeta en frontend.
- Reemplazar `cardNumber` por `paymentMethodToken`.
- Guardar solo datos seguros del metodo de pago.

## Criterios de Aceptacion

- Un administrador nuevo ve onboarding antes de usar el Dashboard.
- El formulario rechaza CURP/RFC invalidos en frontend y backend.
- El backend persiste nombre, RFC, CURP, direccion y zona horaria.
- Se crea o actualiza una sucursal principal.
- Se asocia un plan al tenant.
- El numero de tarjeta no se almacena en DB.
- Al completar onboarding, `adminOnboardingCompleted` queda en `true`.
- Al recargar Dashboard, el onboarding ya no aparece.
- Si el onboarding queda incompleto, se puede retomar.
- `pnpm run typecheck` pasa.
- `pnpm run lint` no introduce errores nuevos.

## Riesgos y Decisiones Pendientes

- Definir si `CURP` pertenece al dueño/persona fisica o al tenant como entidad legal.
- Definir si `address` sera campo libre o estructura completa.
- Definir proveedor de pagos y estrategia PCI.
- Definir si el onboarding se mantiene en `brandIdentity` o se migra a tabla dedicada.
- Definir si el Dashboard gate o las rutas `/onboarding` seran la experiencia principal.

## Archivos Relevantes

- `components/layout/admin-onboarding-wrapper.tsx`
- `app/[locale]/onboarding/gym-info/page.tsx`
- `app/[locale]/onboarding/plans/page.tsx`
- `app/[locale]/onboarding/finish/page.tsx`
- `app/[locale]/(dashboard)/layout.tsx`
- `modules/onboarding/schemas/onboarding.schema.ts`
- `app/api/admin/tenant/route.ts`
- `prisma/schema.prisma`
