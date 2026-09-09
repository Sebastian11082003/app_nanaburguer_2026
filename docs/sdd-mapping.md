# Mapa SDD (proyecto existente)

Índice de adopción de AI Engineering OS. Las carpetas `00`–`15` son **claves de inventario**, no una migración de archivos.

Nada de lo listado aquí se movió en este incremento. Los documentos nuevos sí deben nacer en la convención SDD. Playbook: `playbooks/existing-project-adoption-playbook.md` en `ai-engineering-os`.

| SDD | Estado | Ruta actual |
|---|---|---|
| 00-governance | mapeado | `.ai-engineering/`, `CLAUDE.md`, `AGENTS.md` |
| 01-context | mapeado | [vision_alcance_actores.md](vision_alcance_actores.md), [functional/functional-scope.md](functional/functional-scope.md), `.ai-engineering/PROJECT_CONTEXT.md` |
| 01-context / glosario | faltante | No hay `glossary.md`. Diferido: los términos viven en el schema Prisma y en las HUs. |
| 02-domain | mapeado | [functional/bussines-rules.md](functional/bussines-rules.md), [architecture/domain-model.md](architecture/domain-model.md) |
| 03-product | mapeado | ERP vertical gastronómico (DEC-008). [vision_alcance_actores.md](vision_alcance_actores.md), [README.md](../README.md), `.ai-engineering/PROJECT_MANIFEST.md` |
| 04-requirements | mapeado | [functional/user-stories.md](functional/user-stories.md), [functional/storymap.md](functional/storymap.md) |
| 04-requirements / NFR y trazabilidad | parcial | NFR en visión y security-baseline. No hay matriz formal. |
| 05-architecture | mapeado | [architecture/](architecture/), [ADR/](ADR/) |
| 06-data | mapeado | [architecture/er-diagram.md](architecture/er-diagram.md), [architecture/domain-model.md](architecture/domain-model.md), `backend/api/prisma/schema.prisma` |
| 07-api | diferido | Contrato en Swagger de Nest (`/api` en runtime). No hay `docs/07-api/contracts/`. No se exporta OpenAPI a disco hasta que un consumidor externo lo exija. |
| 08-uml | mapeado | [architecture/runtime-view.md](architecture/runtime-view.md), C4 context/container, [architecture/er-diagram.md](architecture/er-diagram.md) |
| 09-microservices | mapeado (monolito) | [architecture/module-boundaries.md](architecture/module-boundaries.md) — un módulo de catálogo, no microservicios. |
| 10-devops | mapeado | [10-devops/local-setup.md](10-devops/local-setup.md), [architecture/deployment-aws.md](architecture/deployment-aws.md), `docker/` |
| 11-quality | parcial | Jest en backend (roles, órdenes, caja, cierre de turno, reportes con rango). Reportes/caja tienen UI sobre el API existente. No hay `testing-strategy.md`. Huecos de HU vs código en [mvp-production-readiness.md](mvp-production-readiness.md). |
| 12-ux-ui | parcial | Login único + chrome de tenant (logotipo/nombre/slug) en personal, POS, admin y hubs. Nav por rol. Piso: ocupada a $0 muestra “Sin cuenta”; salir de ticket vacío libera solo mesa. Llevar/domicilio se retoman; un CREATED vacío se descarta a mano. Pedidos activos es cola DELIVERY. Caja cobra domicilio en camino/entregado. Ventas y cocina nombran mesa/Llevar/Domicilio. Llevar abierto dice En cocina/Listo. Despachar saca el ticket del KDS (`OUT_FOR_DELIVERY`). Rider no ve Llevar en el piso ni Pickup al crear. KDS con líneas y poll. Caja/admin en `restaurant-navigation.ts`. |
| 13-operations | parcial | Runbook MVP + HTTPS/Caddy + secretos, volume de logos y backup/restore en [10-devops/local-setup.md](10-devops/local-setup.md). Lista de salida a producción en [mvp-production-readiness.md](mvp-production-readiness.md). Sin AWS. |
| 14-training | parcial | Setup en [README.md](../README.md). No hay onboarding técnico aparte. |
| 15-project-control | mapeado | `.ai-engineering/PROJECT_STATE.md`, `PROJECT_DECISIONS.md`, `PROJECT_CHANGELOG.md` |
| 99-archive | no aplica aún | No se ha deprecado documentación. |

## Living-docs

El mapa de CI está en [`.living-docs.json`](../.living-docs.json) y apunta a estas rutas reales. `docs/10-devops/` ya existe (setup del MVP). No se usa `docs/07-api/**`.

Rama de integración actual: `dev`.
