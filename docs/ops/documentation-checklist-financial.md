# Checklist de documentación — fases financieras / inventario

**Regla del product owner (ago 2026):** ninguna fase de caja, inventario,
costos, facturación avanzada o contabilidad se considera “lista” solo con
código. Hay que actualizar documentación en el mismo PR/entrega.

## Obligatorio por cada fase

| Artefacto | Qué actualizar |
|-----------|----------------|
| `.ai-engineering/PROJECT_STATE.md` | Avance + próxima fase |
| `.ai-engineering/PROJECT_CHANGELOG.md` | Entrada de versión |
| `.ai-engineering/PRODUCT_BACKLOG_PROFESSIONAL.md` | Estado ✅ / ← siguiente |
| `docs/functional/functional-scope.md` | Capacidades nuevas en alcance |
| `docs/functional/bussines-rules.md` | Reglas de negocio (invariantes) |
| `docs/architecture/domain-model.md` | Entidades y relaciones |
| `docs/architecture/er-diagram.md` | Tablas nuevas (si aplica) |
| `docs/architecture/module-boundaries.md` | Módulo Nest / límites |
| ADR nuevo o ampliación (`docs/ADR/`) | Decisiones no obvias |
| Comentarios en código | Propósito + porqué (convención v0.3.8) |

## Opcional según impacto

- `docs/functional/user-stories.md` — historias de usuario
- `docs/ops/` — guías operativas (staging, caja, inventario)
- `README.md` — solo si cambia cómo se corre o despliega el sistema

## Criterio de cierre de fase

1. Código + tests verdes  
2. Migración documentada / aplicada en entorno local  
3. Checklist de arriba marcado  
4. Smoke manual mínimo descrito en PROJECT_STATE o `docs/ops/`

Sin el punto 3, la fase **no** se marca como cerrada.
