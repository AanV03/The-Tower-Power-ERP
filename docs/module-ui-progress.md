# Progreso de mejoras UI/UX por modulo

Fecha de referencia: 2026-06-09  
Repositorio: `C:\Dev\School\Gerpy`  
Rama actual al crear este documento: `especialistas`

## Objetivo

Este documento sirve como contexto rapido para continuar el rediseño frontend de Gerpy en nuevos chats. La meta es identificar que modulos ya dejaron de ser pantallas genericas basadas en `ModulePage`, cuales estan parcialmente personalizados y cuales siguen pendientes.

## Criterio de estado

- `Mejorado`: el modulo tiene una vista propia, componentes especificos del dominio y no depende solo de `ModulePage`.
- `Parcial`: conserva `ModulePage`, pero agrega una seccion o flujo propio.
- `Pendiente`: sigue usando el molde generico `ModulePage` con KPIs, grafica, tabla y auditoria compartida.

## Modulos mejorados

| Modulo | Ruta | Estado | Notas |
|---|---|---|---|
| Nomina y comisiones | `/[locale]/payroll` | Mejorado | Usa `PayrollDashboard` y componentes propios en `components/modules/payroll/`. Ya no depende de `ModulePage`. |
| Especialistas | `/[locale]/specialists` | Mejorado | Rediseñado en rama `especialistas`. Incluye control center, dialogs de acciones, modelos de contrato, KPIs compactos y tabs para agenda/liquidaciones/directorio. |
| Punto de venta | `/[locale]/pos` | Mejorado | Pantalla de caja operativa: caja activa, búsqueda de productos, carrito de compras, cálculo de cambio, comisión de tarjeta, checkout en tiempo real y decremento de stock. |
| Membresias | `/[locale]/memberships` | Mejorado | CRUD completo para miembros, planes, renovaciones y suspensiones. Incorpora simulador interactivo de molinete y dropdowns responsivos de sucursales. |
| Control de acceso | `/[locale]/access` | Mejorado | Monitor de accesos en tiempo real con estados online/offline de dispositivos y validador de suscripción activa. |
| Finanzas | `/[locale]/finance` | Mejorado | Listado de facturas y transacciones con controles de scroll fijos en modales y paginación responsiva de tarjetas. |
| RH | `/[locale]/hr` | Mejorado | Expedientes de colaboradores, control de asistencia time clock manual y listado de contratos vigentes/vencidos. |
| Inventario | `/[locale]/inventory` | Mejorado | Control de existencias físicas por almacén, tablero Kanban de niveles críticos (Suficiente, Bajo, Sin Stock), gráficos de distribución con Recharts e impacto transaccional atómico en el Kardex. |
| Almacenes | `/[locale]/warehouse` | Mejorado | CRUD completo de almacenes/bodegas físicas, vinculación por sucursal, KPIs consolidados, gráficos de capacidad y paginación unificada. |
| Catálogo | `/[locale]/catalog` | Mejorado | CRUD completo de productos y categorías con biblioteca de imágenes deportivas predefinidas, vista de catálogo visual en tarjetas e integración de gráficos y KPIs. |

## Modulos parcialmente personalizados

| Modulo | Ruta | Estado | Notas |
|---|---|---|---|
| SaaS Admin | `/[locale]/admin` | Parcial | Usa `ModulePage`, pero agrega `BrandingPanel`. Pendiente convertirlo en consola SaaS completa para tenants, plan, modulos y white-label persistente. |

## Modulos pendientes

Estos modulos siguen usando `ModulePage` directamente y por eso se ven estandarizados:

| Modulo | Ruta | Prioridad sugerida | Rediseño recomendado |
|---|---|---:|---|
| Compras | `/[locale]/purchases` | Media | Flujo proveedor -> factura -> recepcion -> stock. |
| Contabilidad | `/[locale]/accounting` | Media | Editor de polizas con debito/credito, cuadre y estados. |
| Marketing | `/[locale]/marketing` | Media | Embudo CRM, segmentos, campanas y churn/intervenciones. |
| Analytics | `/[locale]/analytics` | Media | BI con filtros, comparativos, reportes y snapshots. |
| Integraciones | `/[locale]/integrations` | Baja-media | Consola tecnica de eventos, outbox, reintentos y webhooks. |
| Mantenimiento | `/[locale]/maintenance` | Baja-media | Tablero de tickets, prioridad, asignacion y estados. |
| Panel operativo | `/[locale]/dashboard` | Media | Dashboard ejecutivo con alertas reales, drill-downs y comparativos por sucursal. |

## Contexto de la rama `especialistas`

Commit de referencia: `e591e6a Redesign specialists dashboard`

Cambios principales:

- `app/[locale]/(dashboard)/specialists/page.tsx` deja de usar `ModulePage`.
- `components/modules/specialists/specialist-action-dialogs.tsx` agrega dialogs para:
  - Generar liquidacion.
  - Registrar sesion.
  - Nuevo empleado/especialista.
- `components/ui/tabs.tsx` se agrego desde shadcn y se ajusto para el layout actual.
- La seccion de especialistas usa:
  - Header operativo de liquidacion del periodo.
  - KPIs compactos.
  - Panel de modelos de contrato.
  - Tabs: Agenda del dia, Liquidaciones pendientes, Directorio de especialistas.

## Notas funcionales para continuar

- `Registrar sesion` significa capturar una cita o servicio realizado por un especialista a un miembro. Esa sesion alimenta agenda, comisiones y liquidaciones.
- Los dialogs actuales son formularios frontend/prototipo; muestran feedback con toast, pero todavia no persisten datos en endpoints especificos.
- Si se conectan datos reales, preferir endpoints separados:
  - `/api/specialists/sessions`
  - `/api/specialists/contracts`
  - `/api/specialists/settlements`
- Evitar sobrecargar `/api/specialists`, que hoy funciona como listado/alta base de especialistas.

## Reglas para siguientes mejoras

1. No seguir duplicando `ModulePage` para modulos que requieran operacion diaria.
2. Cada modulo mejorado debe tener componentes bajo `components/modules/<modulo>/`.
3. Mantener `pnpm build` como verificacion obligatoria despues de cambios UI.
4. Usar `lucide-react` para iconos y evitar emojis.
5. Reducir scroll en pantallas bajas usando grids compactos, tabs y paneles por flujo.
6. Mantener rutas bajo `app/[locale]/(dashboard)` con soporte de locale y auth existente.

## Siguiente modulo recomendado

Recomendacion: `/pos`.

Motivo: es un modulo con alta diferencia visual esperada frente al resto del ERP. Debe sentirse como una caja operativa, no como dashboard generico. La mejora deberia enfocarse en checkout rapido, carrito, totales, pago y recibo.
