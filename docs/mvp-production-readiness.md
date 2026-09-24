# QA y salida del MVP (piloto local)

Corte **v0.4.55**. Producto: POS SaaS RestoOS (ADR-024), no ERP. Entorno de trabajo: **local (Docker)**.

Este archivo sustituye la auditoría de v0.4.9. Varios “P0” de entonces ya están en código (caja de turno, poll de cocina, volume de logos, reportes con rango).

Contrato: [functional-scope.md](functional/functional-scope.md), [user-stories.md](functional/user-stories.md), [10-devops/local-setup.md](10-devops/local-setup.md).

---

## Veredicto

El **turno de restaurante del MVP está construido**. Un local puede: entrar, armar mesa / llevar / domicilio, cocina, cobrar, imprimir recibo snapshot, abrir/cerrar caja, ver reportes del admin.

Eso es un **MVP de piloto en la máquina** (o LAN). **No** es un SaaS público en VPS.

QA: 🟡 — Jest **90/90**. Smoke API **2026-09-23**: mesa→cocina→CASH+factura+reportes; CASH sin turno 400. Login sin overlay. Next `localhost:3001`. Sin E2E UI.

Inventario, DIAN real, WhatsApp, menú público e impresora térmica **siguen fuera**. No bloquean sacar este MVP.

---

## 1. Qué sí funciona (código actual)

| Flujo | Estado | Evidencia |
|---|---|---|
| Plataforma: login, crear tenant, inhabilitar/activar | OK | API + UI `/platform/restaurants` |
| Login local (slug → personal; correo del restaurante como ADMIN) | OK | `restaurant-auth` + `staff-login` |
| Mesas: ocupar, retomar, liberar vacío, transferir | OK | `TablesService` + POS |
| Dine-in: ítems → cocina → listo → cobro | OK | E2E manual histórico |
| Pickup / domicilio (crear, retomar, despachar, cobro caja) | OK | v0.4.30–v0.4.46 |
| KDS: líneas del ticket + poll 8 s | OK | `kitchen-board.tsx` |
| Caja de turno: abrir, preview por medio, cerrar con snapshot | OK | `CashSession` + UI admin/cajero |
| Factura POS snapshot + imprimir + “aceptar” simulado | OK | no es DIAN |
| Reportes admin: rango de fechas, ventas, productos, canales, por estado | OK | `/reports/*` + UI |
| Roles/permisos + estaciones al crear tenant | OK | seed de plantillas |
| Logos en volume Docker (`api_uploads`) + backup/restore script | OK | compose MVP |
| Compose local `:80` + API `:3000` | **API + Next en host**, Postgres en Docker `nanaburguer_db` | Smoke 2026-09-21: health OK. Frontend `http://localhost:3001` |

---

## 2. Qué no funciona / no entra en este MVP

| Tema | Por qué no bloquea el piloto local |
|---|---|
| Inventario / recetas / kardex | Fuera del alcance funcional |
| Facturación electrónica DIAN/Factus | HU-026 tiene simulador local (v0.4.55); Factus real sigue fuera |
| WhatsApp, MercadoPago, app del cliente | HU-027/028 |
| Impresora térmica ESC/POS | Scaffold; hoy `window.print()` |
| Landing `/public/*` | “En construcción”; el local entra por `/restaurant/login` |
| Reportes/facturación/config de **plataforma** | No hay pantallas; el nav ya no las enlaza (v0.4.52) |
| Suite E2E (Playwright/Cypress) | QA manual + Jest |
| VPS / DNS / HTTPS público | Recorte: trabajo local |
| ERP / contabilidad / nómina | ADR-024 |

---

## 3. Huecos reales que sí importan para un día de Nana

Ordenados para **sacar el MVP local**, no para paridad Loggro.

### P0 — probar el turno en el stack levantado

No hay job CI que recorra mesa → cocina → cobro. Antes de usar el POS en el local hay que pasar el [smoke](#8-smoke-mínimo-del-mvp-local) con Docker arriba.

### P1 — caja se puede saltar — **cerrado en v0.4.54**

Pago CASH y movimientos de caja requieren sesión `OPEN`. El POS consulta el turno **antes** de cerrar el ticket. CARD/TRANSFER no exigen caja.

### P1 — comanda e impresión

Cocina/recibo dependen de la impresora del navegador/OS. En un teléfono de mesero es “compartir / imprimir”, no ticket térmico.

### P1 — seguridad de piloto, no de SaaS público

- JWT staff ~1 día, platform ~7 días; sin refresh (baseline pedía 15 min).
- `@nestjs/throttler` está en `package.json` y **no** está cableado en `AppModule`.
- Email de usuario único **global** (dos tenants no pueden repetir correo).
- `@Permissions` no cubre todos los controllers (mucho sigue en `@Roles` de estación).

Aceptable en local con `ALLOW_INSECURE_DEFAULTS=true`. No publicar así a internet.

### P2 — contrato vs código (no paran un turno)

| ID | Nota |
|---|---|
| HU-012 | Cancelar ítem post-cocina existe (ADMIN/CASHIER + motivo). Anular **ticket con productos** solo ADMIN. |
| HU-017 | 5% en mesa va en `taxCents` (servicio). Propina sugerida al cobrar sigue aparte. |
| HU-014 | `pickupAt` existe en POS mostrador y alta delivery. |
| HU-010 | Ítems se pueden agregar después de cocina. Qty/notas y borrar línea solo en CREATED. |
| HUs 001–025 | Marcadas Implemented; el happy path cubre el piloto. 026–028 Planned / fuera. |

---

## 4. Cobertura de pruebas

| Capa | Qué hay | Qué falta |
|---|---|---|
| API Jest | 10 suites / **90 tests passing** (v0.4.55): caja + facturación electrónica simulada | Pagos, platform, KDS |
| API e2e Nest | no hay carpeta `test/` e2e | — |
| Frontend | 0 specs | POS, login, caja |
| Manual | E2E dine-in + delivery documentado (v0.3.6) | Repetir smoke post v0.4.50 |

---

## 5. Cómo sacar el MVP (local)

1. Levantar `docker compose -f docker-compose.yml up --build` **o** `docker-compose.dev.yml`.
2. Pasar el smoke de la sección 8.
3. Operar el turno en el navegador del teléfono/PC de la casa (LAN si hace falta `NEXT_PUBLIC_API_URL`).
4. Backup: `docker/backup.sh` cuando haya datos reales.

No hace falta VPS, inventario ni DIAN para declarar el MVP de salón listo.

---

## 6. Fuera de alcance (no implementar para “sacar el MVP”)

- Inventario, compras, proveedores.
- Factus / DIAN real.
- WhatsApp, MercadoPago, menú digital público.
- Print-agent USB.
- Multi-sede.
- Paridad visual Loggro.
- Convertir el POS en ERP (ADR-024).

---

## 7. Orden si el smoke falla o el turno se traba

1. Stack / seed / login (P0).
2. Vertical mesa → cocina → cobro → cierre de caja.
3. Domicilio despacho + cobro.
4. Recién ahí: impresora / LAN / credenciales del piloto Nana.
5. Impresora térmica: solo si el usuario la pide.

---

## 8. Smoke mínimo del MVP local

Credenciales seed (`ALLOW_INSECURE_DEFAULTS=true`):

- Plataforma: `admin@nanaburger.com` / `123456` → `/platform/login`
- Tenant demo `nana-neiva` (si existe): `admin@nana-neiva.test` / `123456` y `kitchen@nana-neiva.test` / `123456` → `/restaurant/login`

| # | Paso | OK si |
|---|---|---|
| 1 | `GET /health` | `{"ok":true}` |
| 2 | Platform login → lista restaurantes | 200; inhabilitar no borra datos |
| 3 | Identificar slug + login admin del local | Chrome con logo/nombre/slug |
| 4 | Abrir caja (fondo) | Sesión OPEN. Sin esto, cobro CASH y movimientos → 400 |
| 5 | Mesa: producto → enviar cocina | Ticket en KDS con nombre de producto |
| 6 | Cocina: cola → preparando → listo (esperar poll o avanzar) | Caja ve Listo |
| 7 | Cobrar CASH | Sale + invoice snapshot (exige paso 4) |
| 8 | Pickup o domicilio: crear, despachar, cobrar | Canal etiquetado (no “Mesa —”) |
| 9 | Cerrar caja con contado | Snapshot en historial |
| 10 | Reportes admin con rango de hoy | Números coherentes con el cobro |

Si 1–7 y 9 pasan, el MVP de salón se puede usar. 8 es el segundo canal. 10 es control, no bloquea el primer turno.
