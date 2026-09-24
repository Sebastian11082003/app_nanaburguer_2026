# Caja profesional (CashSession) — guía operativa

Versión: v0.5.0  
Módulo: `backend/api/src/modules/cashMovement`

## Qué resuelve

Una sesión de caja = un turno de cajón:

1. **Abrir** con base (fondo / float)  
2. Registrar **ingresos/egresos** manuales y cobros en efectivo  
3. **Cerrar** con arqueo (efectivo contado vs esperado del sistema)

## Reglas de negocio

- Solo **una** sesión `OPEN` por restaurante.
- Movimientos manuales requieren sesión abierta.
- Pagos con método `CASH` **exigen** sesión abierta; el movimiento
  `SALE_PAYMENT` queda ligado a esa sesión.
- Pagos CARD/TRANSFER no mueven el cajón (no crean `CashMovement`).
- Al cerrar:
  - `expectedCashCents` = base + ingresos − egresos  
  - `differenceCents` = contado − esperado (negativo = faltante)

## Conceptos de movimiento

| Código | Uso |
|--------|-----|
| `SALE_PAYMENT` | Cobro de venta en efectivo (automático) |
| `MANUAL_INCOME` | Ingreso manual |
| `MANUAL_EXPENSE` | Egreso manual |
| `PURCHASE` | Compra / suministro pagado en efectivo |
| `WITHDRAWAL` | Retiro de efectivo |
| `OTHER` | Otros |

## API

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/cash/sessions/current` | `CASH_MANAGE` |
| GET | `/cash/sessions` | `CASH_MANAGE` |
| GET | `/cash/sessions/:id` | `CASH_MANAGE` |
| POST | `/cash/sessions/open` | `CASH_MANAGE` |
| POST | `/cash/sessions/:id/close` | `CASH_MANAGE` |
| POST | `/cash/movements` | `CASH_MANAGE` |
| GET | `/cash/movements` | `CASH_MANAGE` |

Roles estación: `ADMIN`, `CASHIER`.

## UI

- Cajero: `/restaurant/cashier/cash`
- Admin: `/restaurant/admin/cash` (mismo flujo)

## Migración

`prisma/migrations/20260812220000_cash_sessions`

```bash
# Con Docker/DB arriba
cd backend/api
npx prisma migrate deploy
```

## Fuera de alcance (siguientes fases)

- Multi-caja / multi-turno paralelo  
- Inventario y costos  
- Anulación de facturas / notas crédito  
- Impresora térmica
