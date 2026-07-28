# Analisis de Database - ERP The Tower Power

Fecha de analisis: 2026-05-29  
Documento base: `C:\Users\aaron\Desktop\workplan.pdf`  
Repositorio: `C:\Dev\School\The Tower Power`

## Resumen ejecutivo

La capa de base de datos es la parte mas avanzada del ERP The Tower Power. El schema Prisma contiene 48 modelos y 29 enums, cubriendo multi-tenancy, sucursales, usuarios, roles/permisos, membresias, accesos, finanzas, pagos, facturacion, POS, inventario, compras, almacenes, contabilidad, RH, nomina, especialistas, integraciones y outbox.

Ademas, existe una capa MongoDB/Mongoose para datos flexibles o de alto volumen: auditoria, branding, CRM, telemetria de acceso, snapshots analiticos, logs de integracion y tickets de mantenimiento.

El diseno confirma una decision arquitectonica clara: PostgreSQL es la fuente transaccional de verdad y MongoDB se reserva para documentos flexibles, auditoria, eventos y analitica. Esta decision es coherente con un ERP multi-tenant. El principal pendiente no es el modelado, sino conectar los modelos con reglas de negocio, migraciones/versionado operativo, seeds completos, jobs y garantias de integridad a nivel aplicacion.

## Arquitectura de datos

### PostgreSQL + Prisma

PostgreSQL concentra entidades transaccionales:

- Tenants y planes SaaS.
- Sucursales.
- Usuarios, auth, roles y permisos.
- Miembros y suscripciones.
- Dispositivos de acceso.
- Proveedores.
- Facturas, pagos y eventos de pasarela.
- Catalogo, productos, almacenes, stock y movimientos.
- POS, cajas, sesiones y ventas.
- Empleados, contratos, asistencia y nomina.
- Especialistas, contratos, sesiones y liquidaciones.
- Contabilidad y polizas.
- Outbox.

### MongoDB + Mongoose

MongoDB concentra entidades documentales:

- `audit_events`.
- `tenant_branding_configs`.
- `crm_profiles`.
- `access_telemetry_events`.
- `analytics_snapshots`.
- `integration_event_logs`.
- `maintenance_tickets`.

Este hibrido esta bien orientado: SQL protege consistencia financiera/operativa y Mongo absorbe documentos flexibles y alto volumen.

## Modelos Prisma principales

### Multi-tenancy y plataforma

- `Tenant`: cliente SaaS principal.
- `SaasPlan`: plan contratado.
- `TenantModule`: modulos habilitados por tenant.
- `Branch`: sucursal con codigo unico por tenant.

Fortalezas:

- `tenantId` aparece de forma transversal.
- Hay indices por tenant/status/sucursal.
- `TenantModule` permite feature gating modular.

Pendientes:

- No existe modelo explicito de plan tier Basic/Pro/Enterprise con matriz de capacidades.
- `SaasPlan.limits` es JSON flexible, pero falta enforcement formal.
- No hay metadata de dominio/logo en SQL; branding vive modelado en Mongo pero no integrado al frontend server-side.

### Auth y RBAC

- `User`, `Account`, `Session`, `VerificationToken`.
- `Role`, `Permission`, `UserRole`, `RolePermission`.

Fortalezas:

- Compatible con Auth.js.
- Roles por tenant.
- Permisos normalizados.
- Relacion usuario-rol con `branchId` opcional para scope.

Pendientes:

- `UserRole` usa id compuesto `[userId, roleId]`; si se requiere mismo rol en multiples sucursales para el mismo usuario, el `branchId` no participa en la llave.
- Faltan seeds formales de Branch Manager, Trainer, Cashier y Auditor.
- Falta UI/API para administrar roles personalizados.

### Membresias

- `Member`.
- `MembershipPlan`.
- `Subscription`.
- `SubscriptionPause`.
- `SubscriptionCancellation`.

Fortalezas:

- Cubre estados de miembro y suscripcion.
- Soporta pausas, cancelaciones, autorrenovacion y billing date.
- Relaciona pagos con suscripcion.

Pendientes:

- Falta motor de renovacion/cobro.
- Falta historial detallado de cambios de plan.
- Falta enforcement de cancelacion/pausa desde endpoints.

### Acceso

- `AccessDevice`.

Fortalezas:

- Modela QR scanner, biometricos y torniquetes.
- Status online/offline/maintenance.
- Scope por tenant y sucursal.

Pendientes:

- No hay modelo SQL de access check-in/check-out; existe telemetria Mongo pero no esta conectada a endpoint de validacion.
- Falta relacion directa entre credencial de acceso y miembro.

### Finanzas, facturacion y pagos

- `Supplier`.
- `Invoice`.
- `InvoiceItem`.
- `Payment`.
- `PaymentGatewayEvent`.

Fortalezas:

- Distingue receivable/payable.
- Estados de factura y pago.
- Relaciones con miembro, proveedor, suscripcion y venta.
- Idempotencia potencial con `provider` + `externalReference` y `externalEventId`.

Pendientes:

- No hay modelo de conciliacion bancaria.
- No hay impuestos/facturacion electronica fiscal.
- Falta enforcement de cambios de status.
- Falta integracion transaccional desde POS y billing recurrente.

### Contabilidad

- `ChartAccount`.
- `JournalEntry`.
- `JournalEntryLine`.

Fortalezas:

- Catalogo jerarquico.
- Polizas con lineas debito/credito.
- Fuente contable por `sourceType/sourceId`.

Pendientes criticos:

- El schema permite debitos y creditos, pero la API no valida que la suma cuadre.
- Falta contabilizacion automatica de ventas, pagos, compras y nomina.
- Falta periodos contables/cierres.

### Catalogo, inventario, compras y almacenes

- `ProductCategory`.
- `Product`.
- `Warehouse`.
- `InventoryItem`.
- `InventoryMovement`.

Fortalezas:

- Catalogo por tenant.
- Stock por warehouse/producto.
- Puntos de reorden.
- Movimientos con tipo, cantidad, costo y source.
- Unicidad por sku y por warehouse/product.

Pendientes:

- Falta transaccion atomica para actualizar `InventoryItem` al crear `InventoryMovement`.
- Falta bloqueo de stock negativo.
- Falta proveedor como endpoint CRUD.
- Falta flujo de recepcion de compra conectado a movimiento/stock.

### POS

- `PosRegister`.
- `CashSession`.
- `Sale`.
- `SaleItem`.

Fortalezas:

- Cajas por sucursal.
- Sesiones de caja abiertas/cerradas.
- Ventas con items y pagos.

Pendientes:

- Falta decremento de inventario.
- Falta creacion automatica de Payment.
- Falta control de cash session abierta por caja.
- Falta manejo de devoluciones/refunds.

### RH y nomina

- `Position`.
- `Employee`.
- `EmployeeContract`.
- `AttendanceRecord`.
- `PayrollPeriod`.
- `PayrollItem`.

Fortalezas:

- Modela empleados, contratos, asistencia y periodos.
- Soporta salario, hourly rate y comisiones.
- Items de nomina con base, horas extra, comisiones, deducciones y neto.

Pendientes:

- Falta endpoint para asistencia.
- Falta motor de calculo desde contratos/asistencia/sesiones.
- Falta proteccion de doble clock-in.
- Falta historico de recibos/approval trail.

### Especialistas

- `Specialist`.
- `SpecialistContract`.
- `SpecialistService`.
- `SpecialistSession`.
- `SpecialistSettlement`.
- `SpecialistSettlementItem`.

Fortalezas:

- Cubre especialista interno/externo/clinica.
- Contratos de renta fija, comision o hibrido.
- Servicios, sesiones y liquidaciones.

Pendientes:

- Falta motor financiero de renta/comision.
- Falta generacion automatica de liquidaciones.
- Falta conexion con facturas/pagos/contabilidad.

### Integraciones y outbox

- `OutboxEvent`.

Fortalezas:

- Incluye status, attempts, availableAt, processedAt.
- Indices por tenant/status/availableAt y aggregate.
- Buena base para procesamiento eventual.

Pendientes:

- Falta worker.
- Falta claim/lock seguro.
- Falta tabla/config de integraciones por tenant.
- Falta reintento con backoff implementado.

## Modelos MongoDB

### AuditEvent

Uso esperado: bitacora append-only de acciones criticas.  
Estado: schema e indices definidos.  
Pendiente: utilidad global que escriba eventos en cada cambio critico.

### TenantBrandingConfig

Uso esperado: white-label por tenant.  
Estado: schema con dominio, theme, modules, legal y version.  
Pendiente: endpoints y conexion con layout/frontend.

### CrmProfile

Uso esperado: CRM, segmentos, scoring y campanas.  
Estado: schema e indices por lifecycle, segments y churnRisk.  
Pendiente: API/worker que lo alimente desde membresias/pagos/accesos.

### AccessTelemetryEvent

Uso esperado: eventos de acceso, latencia y decision.  
Estado: schema con TTL de 180 dias aproximadamente.  
Pendiente: endpoint de validacion que escriba telemetria.

### AnalyticsSnapshot

Uso esperado: snapshots BI por scope/periodo.  
Estado: schema unico por tenant/scope/granularity/date.  
Pendiente: job generador.

### IntegrationEventLog

Uso esperado: payloads/logs externos.  
Estado: schema con idempotencia por tenant/provider/externalEventId.  
Pendiente: webhooks y outbox worker.

### MaintenanceTicket

Uso esperado: tickets de mantenimiento.  
Estado: schema conectado a API GET/POST.  
Pendiente: updates, asignaciones, auditoria y cierre.

## Evaluacion por sprints del workplan

### Sprint 1

Estado database: cumplido y superado.

- Multi-tenancy: implementado con tenantId y Branch.
- Roles/permisos: modelos completos.
- Tenant isolation: aplicado por schema y queries.
- Entregable ERD/script: Prisma schema funciona como script fuente, aunque falta ERD visual si el profesor lo pide explicitamente.

### Sprint 2

Estado database: parcialmente adelantado.

- Tenant table: implementado.
- Plan level: `SaasPlan` existe; falta `plan_level` explicito o matriz Basic/Pro/Enterprise.
- White-label fields: no estan en SQL; existe Mongo schema de branding.
- Audit log: Mongo schema existe; falta escritura automatica.

### Sprint 3

Estado database: adelantado.

- Membership plans: implementado.
- Members/subscriptions: implementado.
- Access devices: implementado.
- Indices de status: existen en miembros/suscripciones/dispositivos.
- Falta: modelo o flujo de validacion de entrada y eventos de acceso conectados.

### Sprint 4

Estado database: estructura lista, flujo pendiente.

- Invoice records: implementado.
- POS tables: implementado.
- Inventory tables: implementado.
- Falta: transacciones que modifiquen stock e invoice/status automaticamente.

### Sprint 5

Estado database: muy adelantado en modelado.

- Specialist config: implementado.
- Personnel/time clock: implementado.
- Payroll storage: implementado.
- Expiration dates: `Subscription.nextBillingDate/endDate` existen.
- Falta: motores/jobs que usen estos datos.

### Sprint 6

No aplica todavia, aunque el schema ya tiene amplitud para integracion final.

## Calidad de datos

Fortalezas:

- Uso amplio de `@@unique` para claves de negocio.
- Indices por tenant, branch, status y fechas.
- Separacion razonable SQL/Mongo.
- OnDelete Cascade en muchas relaciones tenant-owned.
- Decimal para montos financieros.
- Enums para estados principales.

Riesgos:

- Faltan constraints de negocio que Prisma/DB no puede garantizar solo con tipos.
- Algunas relaciones permiten referencias opcionales que deben validarse por regla de negocio.
- Duplicidad conceptual entre catalogo e inventario puede confundir ownership.
- Falta migracion/CI visible para garantizar que schema y DB remota esten sincronizados.
- Falta seed formal que represente los roles/personas del workplan.
- Mongo no tiene migraciones versionadas equivalentes a Prisma.

## Recomendaciones database prioritarias

1. Crear ERD exportable desde Prisma para cumplir Sprint 1 formalmente.
2. Agregar seeds de roles: Branch Manager, Trainer, Cashier, Auditor.
3. Definir matriz Basic/Pro/Enterprise y enforcement de limites en `SaasPlan.limits`.
4. Persistir branding por tenant y conectar `TenantBrandingConfig`.
5. Implementar audit logger y politica append-only.
6. Agregar transacciones para POS, compras, inventario y contabilidad.
7. Validar polizas balanceadas a nivel servicio.
8. Crear worker outbox con claim seguro y backoff.
9. Agregar endpoints/jobs para snapshots analytics y telemetria de acceso.
10. Documentar ownership de cada tabla por modulo para evitar duplicidad futura.
