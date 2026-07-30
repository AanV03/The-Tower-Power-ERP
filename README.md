# The-Tower-Power-ERP

The-Tower-Power-ERP, anteriormente Gerpy, es un ERP financiero y operativo
multi-tenant construido con Next.js App Router, TypeScript, Prisma ORM,
Supabase PostgreSQL y MongoDB. Su arquitectura combina sesiones revocables
mediante JTI, RBAC por tenant y sucursal, Row-Level Security, gamificación
aislada, contabilización idempotente y procesamiento asíncrono mediante
Outbox.

## Arquitectura

La especificación técnica oficial se encuentra en
[ARCHITECTURE.md](ARCHITECTURE.md). Incluye:

- Modelo multi-tenant y RBAC.
- Aislamiento PostgreSQL RLS y guards de sucursal.
- Sesiones, 2FA, rate limiting y auditoría.
- Estrategia dual PostgreSQL/MongoDB.
- Mandamientos y checklist de integración frontend.
- Flujo transaccional de nómina a contabilidad.
- Idempotencia, Outbox, cron y webhooks HMAC.
- Estrategia de pruebas y pipeline de CI.

## Validación

| Objetivo | Comando |
| --- | --- |
| Typecheck | `npm run typecheck` |
| Autenticación y RBAC | `npm run test:auth` |
| Servicios y APIs | `npm run test:api` |
| Revocación de sesión | `npm run test:session` |
| End-to-End | `npm run test:e2e` |

Las instrucciones de migración y despliegue están en
[docs/workplan2/release-phase-evidence.md](docs/workplan2/release-phase-evidence.md).
