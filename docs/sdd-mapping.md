# Mapa SDD (proyecto existente)

Índice de adopción de AI Engineering OS. Las carpetas `00`–`15` son **claves de inventario**, no una migración de archivos.

Nada de lo listado aquí se movió en este incremento. Los documentos nuevos sí deben nacer en la convención SDD. Playbook: `playbooks/existing-project-adoption-playbook.md` en `ai-engineering-os`.

| SDD | Estado | Ruta actual |
|---|---|---|
| 00-governance | mapeado | `.ai-engineering/`, `CLAUDE.md`, `AGENTS.md` |
| 01-context | mapeado | [vision_alcance_actores.md](vision_alcance_actores.md), [functional/functional-scope.md](functional/functional-scope.md), `.ai-engineering/PROJECT_CONTEXT.md` |
| 01-context / glosario | faltante | No hay `glossary.md`. Diferido: los términos viven en el schema Prisma y en las HUs. |
| 02-domain | mapeado | [functional/bussines-rules.md](functional/bussines-rules.md), [architecture/domain-model.md](architecture/domain-model.md) |
| 03-product | mapeado | POS SaaS restaurantes (DEC-008 / [ADR-024](ADR/ADR-024.md)). [vision_alcance_actores.md](vision_alcance_actores.md), [README.md](../README.md), `.ai-engineering/PROJECT_MANIFEST.md` |
| 04-requirements | mapeado | [functional/user-stories.md](functional/user-stories.md), [functional/storymap.md](functional/storymap.md) |
| 04-requirements / NFR y trazabilidad | parcial | NFR en visión y security-baseline. No hay matriz formal. |
| 05-architecture | mapeado | [architecture/](architecture/), [ADR/](ADR/) |
| 06-data | mapeado | [architecture/er-diagram.md](architecture/er-diagram.md), [architecture/domain-model.md](architecture/domain-model.md), `backend/api/prisma/schema.prisma` |
| 07-api | diferido | Contrato en Swagger de Nest (`/api` en runtime). No hay `docs/07-api/contracts/`. No se exporta OpenAPI a disco hasta que un consumidor externo lo exija. |
| 08-uml | mapeado | [architecture/runtime-view.md](architecture/runtime-view.md), C4 context/container, [architecture/er-diagram.md](architecture/er-diagram.md) |
| 09-microservices | mapeado (monolito) | [architecture/module-boundaries.md](architecture/module-boundaries.md) — un módulo de catálogo, no microservicios. |
| 10-devops | mapeado | [10-devops/local-setup.md](10-devops/local-setup.md), [architecture/deployment-aws.md](architecture/deployment-aws.md), `docker/` |
| 11-quality | parcial | Jest en backend (auth, roles, órdenes, guards, caja, delivery, users, reportes, env, alta de estaciones). Sin E2E. Corte de piloto: [mvp-production-readiness.md](mvp-production-readiness.md). |
| 12-ux-ui | parcial | Login único; Cambiar local vs cerrar sesión (HU-029). Cancelar ítem (`ORDERS_CANCEL_ITEM`). Liberar mesa vacía post-cocina. Recoge en KDS/comanda. Cobro con Servicio 5% y Recibos en chrome de caja. Cajero no cobra sin turno. Despachar saca el ticket del KDS. Rider en cola, no en mesas. Plataforma: Dashboard + Restaurantes. |
| 13-operations | parcial | Runbook MVP + HTTPS/Caddy + secretos, volume de logos y backup/restore en [10-devops/local-setup.md](10-devops/local-setup.md). Piloto = Docker local; VPS fuera. [mvp-production-readiness.md](mvp-production-readiness.md). |
| 14-training | parcial | Setup en [README.md](../README.md). No hay onboarding técnico aparte. |
| 15-project-control | mapeado | `.ai-engineering/PROJECT_STATE.md`, `PROJECT_DECISIONS.md`, `PROJECT_CHANGELOG.md`, [BACKLOG.md](../.ai-engineering/BACKLOG.md). GitHub Projects todavía no está creado (token del agente es solo lectura). |
| 99-archive | no aplica aún | No se ha deprecado documentación. |

## Living-docs

El mapa de CI está en [`.living-docs.json`](../.living-docs.json) y apunta a estas rutas reales. `docs/10-devops/` ya existe (setup del MVP). No se usa `docs/07-api/**`.

Rama de integración actual: `dev`.
