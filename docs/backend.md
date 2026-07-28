# Analisis de Backend - ERP The Tower Power

Fecha de analisis: 2026-05-29  
Documento base: `C:\Users\aaron\Desktop\workplan.pdf`  
Repositorio: `C:\Dev\School\The Tower Power`

## Resumen ejecutivo

El backend de The Tower Power ya supera el alcance tecnico esperado para el Sprint 1 del workplan y contiene bases adelantadas para los Sprints 2 a 5. La aplicacion usa Next.js App Router con rutas API server-side, Auth.js/NextAuth, Prisma sobre PostgreSQL, Mongoose sobre MongoDB, validacion con Zod y guardas multi-tenant por modulo, permiso y sucursal.

El estado actual es una base SaaS ERP robusta pero todavia no es un ERP operacional completo. Hay endpoints GET/POST para muchos recursos, autenticacion funcional, bootstrap de tenant, resumenes por modulo y una estructura de seguridad consistente. Sin embargo, faltan operaciones de actualizacion/eliminacion en la mayoria de recursos, reglas de negocio profundas, procesamiento transaccional completo entre modulos, workers reales, integraciones externas, CI visible en el repo y flujos frontend CRUD completos.

## Arquitectura backend actual

### Stack y runtime

- Framework: Next.js 15 con App Router.
- Lenguaje: TypeScript.
- Runtime API: Node.js en rutas que requieren Prisma/Mongoose.
- Autenticacion: Auth.js / NextAuth beta con Prisma Adapter.
- Validacion: Zod en rutas de escritura.
- Base transaccional: Prisma Client + `@prisma/adapter-pg`.
- Base documental: Mongoose.
- Respuestas API: utilidades centralizadas `ok`, `created`, `fail` y `ApiError`.
- Seguridad funcional: contexto de tenant, permisos, modulos y sucursal en JWT/session.

### Patron de ruta API

Las rutas API siguen un patron uniforme:

1. Resolver contexto con `requireApiContext`.
2. Validar modulo y permiso segun `MODULE_ACCESS`.
3. Validar sucursal cuando aplica.
4. Parsear paginacion o payload.
5. Consultar Prisma o Mongoose.
6. Responder con formato JSON estandar.
7. Convertir errores a codigos HTTP mediante `fail`.

Este patron esta bien alineado con un SaaS multi-tenant porque evita que cada endpoint implemente su propia seguridad de forma manual.

## Autenticacion, tenant y RBAC

### Funcionalidad implementada

- Login por credenciales con email/password.
- OAuth con Google y Discord.
- Adaptador Prisma para persistir usuarios, cuentas, sesiones y verification tokens.
- Sesiones JWT enriquecidas con:
  - `user.id`
  - `tenantId`
  - `branchId`
  - `roles`
  - `permissions`
  - `modules`
- Registro propio en `/api/auth/register`.
- Bootstrap automatico de tenant para usuarios nuevos:
  - Tenant activo.
  - Sucursal principal.
  - Plan Starter.
  - Modulos habilitados.
  - Rol Owner.
  - Permisos por modulo.
- Guardas:
  - `requireTenantContext`
  - `requirePermission`
  - `requireModuleAccess`
  - `requireBranchAccess`

### Evaluacion frente al workplan

El workplan pedia para Sprint 1 un mock de middleware por `tenant_id`. El proyecto ya implementa una version real basada en Auth.js session/JWT, no solo un mock por header. Esto es mas maduro y menos fragil que confiar en un parametro enviado por el cliente.

La tarea de roles y permisos tambien esta cubierta a nivel de modelo y helpers. Existen roles, permisos, relacion usuario-rol y relacion rol-permiso.

### Gaps importantes

- No hay endpoints administrativos completos para crear roles personalizados, asignar permisos o editar scope de usuarios.
- No se observan roles semilla explicitos para Branch Manager, Trainer, Cashier y Auditor; el bootstrap crea principalmente `Owner`.
- El control de licenciamiento por plan existe parcialmente via `TenantModule`, pero no hay una matriz formal Basic/Pro/Enterprise ni bloqueo por limites de plan.
- No hay pruebas E2E de login real ni de rutas protegidas con un navegador.

## Inventario de endpoints

| Ruta | Metodos | Estado funcional |
|---|---:|---|
| `/api/auth/[...nextauth]` | Auth.js handlers | Implementado por NextAuth |
| `/api/auth/register` | POST | Registro con tenant bootstrap |
| `/api/admin/tenant` | GET, PATCH | Lee/actualiza tenant y modulos |
| `/api/branches` | GET, POST | Sucursales tenant-scoped |
| `/api/modules/[moduleId]/summary` | GET | Resumen dinamico por modulo |
| `/api/analytics/summary` | GET | Resumen especifico de analytics |
| `/api/memberships/members` | GET, POST | Miembros |
| `/api/memberships/plans` | GET, POST | Planes de membresia |
| `/api/access/devices` | GET, POST | Dispositivos de acceso |
| `/api/finance/invoices` | GET, POST | Facturas cobrables/pagables |
| `/api/finance/payments` | GET, POST | Pagos |
| `/api/pos/registers` | GET, POST | Cajas POS |
| `/api/pos/sales` | GET, POST | Ventas POS |
| `/api/inventory/products` | GET, POST | Productos, duplicado funcional con catalogo |
| `/api/inventory/warehouses` | GET, POST | Almacenes |
| `/api/catalog/products` | GET, POST | Catalogo de productos |
| `/api/catalog/categories` | GET, POST | Categorias |
| `/api/purchases/invoices` | GET, POST | Facturas proveedor |
| `/api/warehouse/items` | GET, POST | Stock por almacen/producto |
| `/api/warehouse/movements` | GET, POST | Movimientos de inventario |
| `/api/accounting/accounts` | GET, POST | Catalogo contable |
| `/api/accounting/journal-entries` | GET, POST | Polizas/asientos |
| `/api/hr/employees` | GET, POST | Empleados |
| `/api/payroll/periods` | GET, POST | Periodos de nomina |
| `/api/payroll/items` | GET, POST | Items de nomina |
| `/api/specialists` | GET, POST | Especialistas |
| `/api/integrations/events` | GET | Eventos de pasarela |
| `/api/integrations/outbox` | GET | Outbox |
| `/api/maintenance/tickets` | GET, POST | Tickets MongoDB |

### Madurez de endpoints

Los endpoints estan en nivel CRUD inicial:

- Lectura paginada: implementada en la mayoria.
- Creacion: implementada en la mayoria.
- Actualizacion: limitada; destaca `PATCH /api/admin/tenant`.
- Eliminacion/cancelacion: no generalizada.
- Validaciones de negocio: basicas.
- Transacciones compuestas: presentes en bootstrap de tenant; escasas en procesos ERP operativos.
- Idempotencia: modelada para pagos/eventos, pero no aplicada ampliamente en handlers.

## Analisis por modulo backend

### Dashboard

Funcion: consolidar KPIs de miembros, suscripciones, ingresos e inventario bajo el scope del usuario.  
Estado: implementado como resumen server-side desde Prisma.  
Gap: aun no hay alertas reales, drill-down, ni agregaciones historicas avanzadas.

### Memberships

Funcion: administrar miembros, planes, suscripciones, pausas y cancelaciones.  
Estado: hay modelos completos y endpoints para miembros/planes; los summaries cuentan miembros, planes y suscripciones.  
Gap: no hay endpoints completos para crear suscripciones, pausar, cancelar, renovar o recalcular ciclos de cobro.

### Access

Funcion: administrar dispositivos QR, biometricos y torniquetes.  
Estado: endpoints para dispositivos y modelos de dispositivo.  
Gap: no existe aun endpoint ligero de validacion true/false por usuario y estado de pago, que es el entregable especifico del Sprint 3.

### Finance

Funcion: facturacion, pagos, CxC/CxP y base de conciliacion.  
Estado: endpoints para facturas y pagos, status e importes; summaries de receivable/payable/collected/overdue.  
Gap: no hay conciliacion bancaria, pasarela real, cambio automatico de estados ni generacion fiscal/electronica.

### POS

Funcion: ventas de productos desde caja.  
Estado: endpoints para cajas y ventas; calcula subtotal, impuestos y total.  
Gap critico: `POST /api/pos/sales` crea venta e items, pero no descuenta inventario ni crea pago/corte de caja automaticamente. Esto deja incompleto el entregable de Sprint 4.

### Inventory / Warehouse / Catalog / Purchases

Funcion: catalogo maestro, stock, almacenes, compras y movimientos.  
Estado: modelos y endpoints existen; compras crean facturas proveedor; movimientos registran entradas/salidas.  
Gap: falta orquestacion entre compra -> movimiento -> stock, POS -> decremento, transferencias atomicas y proveedor CRUD completo.

### Accounting

Funcion: catalogo de cuentas y polizas contables.  
Estado: endpoints para cuentas y asientos.  
Gap critico: no se valida que debitos y creditos cuadren antes de crear una poliza; tampoco hay contabilizacion automatica desde ventas, pagos o facturas.

### HR

Funcion: empleados, contratos, asistencia.  
Estado: endpoint para empleados; modelos de contratos y asistencia.  
Gap: no hay endpoints para clock-in/clock-out ni proteccion contra doble entrada sin salida.

### Payroll

Funcion: periodos e items de nomina.  
Estado: endpoints para crear periodos e items con neto calculado desde payload.  
Gap: no existe motor que agregue salario, asistencia, horas extra y comisiones para generar nomina mensual automaticamente.

### Specialists

Funcion: modelos de especialistas internos/externos, servicios, sesiones y liquidaciones.  
Estado: modelo de datos completo y endpoint base para especialistas.  
Gap: falta motor de renta fija/comision 85/15, liquidaciones automaticas e invoicing asociado.

### Marketing

Funcion: CRM, campanas, retencion y churn.  
Estado: summary deriva audiencia/riesgo desde SQL; modelos Mongo para CRM profile.  
Gap: no hay endpoints de CRM, campanas, embudos ni automatizaciones.

### Analytics

Funcion: BI, retencion, churn y comparativos.  
Estado: summary basico calcula retencion/churn a partir de suscripciones.  
Gap: no hay snapshots historicos generados, reportes exportables ni pipeline analitico.

### Integrations

Funcion: eventos de pasarela, outbox y auditoria tecnica.  
Estado: modelos SQL de `PaymentGatewayEvent` y `OutboxEvent`, endpoints GET.  
Gap: no hay webhooks reales, worker outbox, reintentos, firma de proveedor ni procesamiento externo.

### Maintenance

Funcion: tickets de mantenimiento de instalaciones/equipo.  
Estado: implementado con Mongoose para crear/listar tickets.  
Gap: no hay flujo de cambio de estado, asignacion avanzada, SLAs ni auditoria append-only.

## Evaluacion por sprints del workplan

### Sprint 1 - Architecture & Setup Kickoff

Estado general: muy alto cumplimiento tecnico.

| Tarea | Estado | Evidencia | Pendiente |
|---|---|---|---|
| Multi-tenancy data models | Cumplida en implementacion | `tenantId` en modelos, `Tenant`, `Branch`, guardas | Falta documento formal de recomendacion, si no cuenta `plan.md` |
| Tenant middleware mockup | Superada | Auth session -> tenant context; guards por modulo/sucursal | No existe mock simple por header, pero la solucion real es mejor |
| Git repos + CI/CD | Parcial/no verificable | Git local existe; scripts de test/build existen | No se observa `.github/workflows` ni regla CI en repo |
| Roles/permissions schema | Cumplida parcialmente | `Role`, `Permission`, `UserRole`, `RolePermission` | Faltan roles especificos Branch Manager/Trainer/Cashier/Auditor como seeds |

### Sprint 2 - Core SaaS Infrastructure & Admin Control

Estado general: adelantado parcialmente.

- Tenant management: existe endpoint de tenant y pagina admin, pero no dashboard completo de super admin multi-tenant.
- Feature gating: existe por modulo habilitado y permiso; no hay Basic/Pro/Enterprise real.
- White-label: existe seleccion local de colores en frontend; no esta persistida por tenant en backend/DB operacional.
- Audit log: existe modelo Mongo `audit_events`, pero no se ve utilidad global que registre automaticamente acciones criticas.

### Sprint 3 - Memberships & Access

Estado general: base creada, entregables funcionales incompletos.

- Membership plan CRUD: solo GET/POST; faltan update/cancel.
- Member management: GET/POST existe.
- Access validation API: no se encontro endpoint true/false para hardware.

### Sprint 4 - Checkout & Billing

Estado general: estructura presente, logica clave incompleta.

- Billing mock: facturas/pagos existen, pero no hay ciclo simulado que cambie cuentas Paid/Overdue automaticamente.
- POS quick checkout: venta existe, pero falta decremento de inventario y flujo de pago/caja completo.

### Sprint 5 - Advanced Business Logic & Automation

Estado general: modelos adelantados, motores pendientes.

- Specialist engine: modelos completos, motor pendiente.
- Personnel profiles: empleados implementados; asistencia como modelo, sin endpoint clock-in.
- Payroll calculation: modelos y endpoints base, motor pendiente.
- Notification automation: no se encontro job/script de renovaciones.

### Sprint 6 - Integration, Debugging & Final Submission

Estado general: aun no aplica por calendario. Hay scripts de pruebas unitarias/integracion ligera, build y Lighthouse/pa11y, pero falta bateria E2E integral y freeze.

## Calidad backend

Fortalezas:

- Separacion clara de contexto, respuestas, paginacion y acceso por modulo.
- Uso consistente de Zod para payloads.
- Tenant scoping aplicado de forma transversal.
- Modelado ERP amplio desde fases tempranas.
- Tests Node enfocados para RBAC, API utils, navegacion y mantenimiento.

Riesgos:

- La existencia de endpoints POST puede dar falsa sensacion de modulo terminado; muchos procesos no ejecutan efectos colaterales ERP.
- Falta `PATCH/DELETE` en entidades operativas.
- Falta idempotencia en ventas, facturas, pagos y webhooks.
- Falta validacion de integridad de negocio, por ejemplo polizas balanceadas y stock suficiente.
- Duplicidad conceptual entre `inventory/products` y `catalog/products`.
- El mantenimiento depende de MongoDB; summaries toleran ausencia de Mongo, pero el endpoint real falla sin `MONGODB_URI`.
- No se observa CI/CD configurado en repo.

## Recomendaciones backend prioritarias

1. Implementar CI real con `pnpm test:auth`, `pnpm test:api`, `pnpm test:db-env`, `pnpm typecheck` y `pnpm build`.
2. Completar CRUD de memberships, subscriptions, members, employees, devices, products, invoices y payments.
3. Crear endpoint de validacion de acceso para hardware: input miembro/credencial, output `{ allowed, reason }`.
4. Hacer POS transaccional: venta + items + pago + decremento de stock + outbox.
5. Validar polizas contables balanceadas antes de guardar.
6. Agregar motores de negocio: billing recurrente mock, payroll, specialist settlement y notificaciones.
7. Persistir white-label en DB/Mongo por tenant y dejar de depender solo de `localStorage`.
8. Implementar audit logger global y outbox worker.
9. Agregar pruebas con mocks de Prisma/Mongoose para reglas financieras y stock.
10. Documentar contratos API por modulo para que frontend y tester tengan criterios claros.
