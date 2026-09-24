# Facturación avanzada — guía operativa

## Capacidades (v0.5.2)

| Acción | Endpoint | UI |
|--------|----------|-----|
| Listar | `GET /invoices` | `/restaurant/admin/invoices` |
| CxC abiertas | `GET /invoices/ar/open` | `/restaurant/admin/invoices/ar` |
| Anular | `POST /invoices/:id/void` | Detalle factura |
| Nota crédito | `POST /invoices/:id/credit-notes` | Detalle factura |
| Cobrar CxC | `POST /invoices/:id/ar-collect` | Lista CxC |
| Aceptar (sim DIAN) | `POST /invoices/:id/accept` | Detalle |

## Cobro a crédito (fiado)

1. Activar método **Crédito / fiado** en Configuración (se siembra solo).
2. Al cerrar/cobrar, elegir CREDIT e indicar nombre del cliente.
3. No mueve caja; queda `arBalanceCents`.
4. Cobrar después en **CxC abiertas** (CASH exige caja abierta).

## Reglas

- No anular si ya hay NC o cobros CxC.
- NC no puede superar el monto restante (total − NC previas).
- Anulación/NC en efectivo revierten caja solo si hay sesión OPEN.
- Re-login tras cambios de permisos (`INVOICES_MANAGE`).

## Migración

`prisma/migrations/20260812240000_advanced_invoicing`

```powershell
cd C:\Users\USER\App_NanaBurguer\backend\api
npx prisma migrate deploy
npx prisma generate
```

## Smoke

1. Venta CASH → anular con caja abierta → ver egreso en sesión.
2. Venta CREDIT → cobrar parcial en CxC.
3. Venta → emitir NC parcial → listar NC en facturas.
