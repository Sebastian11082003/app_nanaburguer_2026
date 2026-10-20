# Inventario, costos y recetas — especificación

**Estado:** Accepted (v0.5.1)  
**ADR:** [ADR-022](../ADR/ADR-022.md)  
**Ops:** [inventory.md](../ops/inventory.md)

---

## Objetivo

Saber el **costo real** de cada plato y el stock de insumos, para margen
y alertas de quiebre — requisito de SaaS profesional.

## Entidades

| Entidad | Responsabilidad |
|---------|-----------------|
| `InventoryItem` | Insumo con unidad, stock, costo unitario, mínimo |
| `RecipeLine` | BOM: `MenuItem` ← cantidad de insumo por porción |
| `StockMovement` | Entrada, ajuste, merma, consumo por venta |

Proveedores / OC formales → fase Compras (no en v0.5.1).

## Reglas

- Stock nunca negativo (salvo que no se permita; se bloquea el movimiento).
- Al cerrar una orden: descontar insumos según receta (`SALE_CONSUME`).
- Costo de plato = suma(costo unitario × cantidad receta) con
  **última compra** (`costCentsPerUnit`).
- `SALE_CONSUME` solo lo genera el cierre de orden (idempotente por
  `reference = orderId`).

## Fuera de alcance de la fase 2

- Facturación electrónica DIAN  
- Multi-sucursal de bodegas / FIFO  
- Impresora  
- Módulo de proveedores

## Checklist de cierre

- [x] Schema + migración  
- [x] API + permisos  
- [x] UI admin  
- [x] Tests  
- [x] Spec Accepted + ADR-022  
- [x] domain-model, module-boundaries, functional-scope, business-rules,
      CHANGELOG, PROJECT_STATE, backlog  
