# Inventario y recetas — guía operativa

## Rutas UI (admin)

- Insumos / movimientos: `/restaurant/admin/inventory`
- Recetas (BOM) y margen: `/restaurant/admin/inventory/recipes`

## Permisos

| Código | Uso |
|--------|-----|
| `INVENTORY_VIEW` | Listar insumos, movimientos, ver recetas |
| `INVENTORY_MANAGE` | Crear/editar insumos y movimientos de stock |
| `RECIPES_MANAGE` | Guardar BOM (también acepta `INVENTORY_MANAGE`) |

ADMIN de sistema recibe todos por defecto. Tras cambiar permisos:
**re-login** para refrescar JWT.

## API

- `GET/POST /inventory/items`, `PATCH /inventory/items/:id`
- `GET /inventory/items/low-stock`
- `GET/POST /inventory/movements` (`SALE_CONSUME` no se acepta por API)
- `GET/PUT /inventory/recipes/:menuItemId`

## Reglas clave

1. Stock no puede quedar negativo (compra/ajuste/merma/consumo).
2. Costo unitario = última compra (ADR-022).
3. Al cerrar orden se descuenta BOM; sin receta → no hay consumo.
4. Productos sin receta se pueden vender sin tocar inventario.

## Migración

`prisma/migrations/20260812230000_inventory_recipes`

```bash
cd backend/api
npx prisma migrate deploy
npx prisma generate
```

Requiere Postgres (Docker `nanaburguer_db`) arriba.

## Smoke mínimo

1. Crear insumo + compra con costo.
2. Asignar receta a un producto del menú; ver margen.
3. Abrir caja (si cobro CASH), vender y cerrar orden → stock baja.
4. Intentar cerrar con stock insuficiente → error claro.
