# Auditoría: MVP funcional vs salida a producción

Revisión cruzada de código (`dev` @ v0.4.9) contra el contrato escrito:

- [functional-scope.md](functional/functional-scope.md)
- [user-stories.md](functional/user-stories.md)
- [bussines-rules.md](functional/bussines-rules.md)
- [vision_alcance_actores.md](vision_alcance_actores.md)
- [security-baseline.md](architecture/security-baseline.md)
- [10-devops/local-setup.md](10-devops/local-setup.md)

No es una propuesta de features nuevas. Es qué falta **respecto de lo ya prometido** y qué falta **para poner un piloto en un VPS**.

---

## Veredicto

El vertical operativo del MVP **existe**: login por rol, mesas, menú, órdenes DINE_IN / DELIVERY / PICKUP, cocina, cobro, factura POS (snapshot), domicilios, usuarios/roles, dashboard/reportes básicos, movimientos de caja, compose local + overlay HTTPS.

Eso es un **MVP de piloto local**, no un **SaaS listo para producción pública**.

Las HUs 001–025 están marcadas `Implemented`. Varias cumplen el flujo feliz; **no todas cumplen sus criterios de aceptación**. Las HUs 026–028 (Factus/DIAN, WhatsApp, pagos online) siguen `Planned` y el alcance funcional las deja **fuera**.

**Inventario no está implementado.** Tampoco está en el MVP. No hay modelo, API ni pantalla.

---

## 1. Qué el contrato incluye y excluye

### Dentro del MVP (hay que poder operar un turno)

Autenticación y RBAC, usuarios, menú/categorías, órdenes dine-in, delivery y pickup, comanda de cocina, cobro, recibo POS, cierre de caja del día, reportes operativos, tenant en BD compartida.

### Fuera del MVP (no bloquear el piloto)

| Tema | Dónde lo dice el contrato |
|---|---|
| Inventario / insumos / recetas / stock | `functional-scope.md` → Current Technical Limitations |
| Multi-sede | mismo + visión |
| Facturación electrónica real (DIAN/Factus) | HU-026 Planned; `factusApiKey` existe y no se usa |
| App del cliente / menú público / pedidos online | visión: Customer = Future |
| Pagos online / MercadoPago | HU-028 Planned |
| WhatsApp / push / notificaciones en tiempo real | HU-027 + limitaciones técnicas |
| Impresora térmica ESC/POS | diferido a propósito; hoy `window.print()` |

---

## 2. Inventario (respuesta directa)

No hay nada que “ya funcione”:

- Prisma: no hay `Ingredient`, `Recipe`, `Stock`, `Purchase`, `Supplier`, ni campo `stock` en `MenuItem`.
- Backend: no hay módulo.
- Frontend: no hay ítem de nav.
- Las ventas **no descuentan** insumos. `isAvailable` es un 86 manual (toggle), no stock.

Si Nana Burger necesita saber “quedan 12 panes”, eso es **módulo nuevo**, no un hueco del MVP actual. Priorizarlo ahora contradice el alcance escrito y la regla 12 (no inventar features grandes).

---

## 3. Qué sí está implementado (y se validó E2E local)

| Dominio | Qué hay | Límite real |
|---|---|---|
| Plataforma | Login, crear tenant + admin, conteo de restaurantes | Sin ingresos consolidados, sin suspender tenant desde UI rica |
| Auth | JWT staff + restaurant + platform; usuario inactivo no entra | Token 1 día (staff) / 7 días (platform). Sin refresh. Baseline pide 15 min |
| Usuarios | CRUD, rol, activo, reset password por admin | Email `@unique` **global** + único por tenant: dos restaurantes no pueden compartir email |
| Roles | 5 plantillas + matriz; JWT `permissions[]` | `@Permissions` solo en users/roles/reports/cash. El resto es `@Roles` de estación |
| Menú | Categorías, productos, precio, disponible | Sin foto, sin costo, sin impuesto por ítem |
| Mesas | CRUD, ocupación, transferir | — |
| Mesero | Tomar/continuar, enviar cocina, comanda browser | Cocina no se actualiza sola (carga al entrar, sin poll) |
| Cocina | Cola → preparando → listo | Sin poll; visión dice “solo ver”, el código sí cambia estado (correcto operativamente) |
| Caja | Cobrar READY, POS pickup, despacho delivery, movimientos INCOME/EXPENSE | No hay **cierre de turno** (ver §4) |
| Delivery | Alta con cliente/dirección, despachar, entregar | Pickup **sin hora estimada** (BR-017 / HU-014) |
| Pagos | CASH/CARD/TRANSFER/OTHER configurables; cambio en efectivo; propina opcional | El 5% es **propina sugerida**, no recargo de servicio (BR-020 / HU-017) |
| Factura POS | Snapshot + imprimir + “aceptar” (simula DIAN) | No es factura fiscal |
| Reportes | Dashboard, ventas/día, top productos, mix de pago, resumen delivery | Sin filtro de fechas en UI; sin reporte por estado de orden; sin reporte pickup aparte; `salesByDay` agrupa por UTC |
| Caja (libro) | Lista + alta de movimientos; saldo en UI | No hay sesión, arqueo, ni snapshot histórico de cierre |
| Branding | Logo/nombre/color por tenant; login por slug | Logos en disco del contenedor API: **compose sin volume** `uploads/` → se pierden al recrear |
| Deploy | Compose local :80/:3000; overlay Caddy HTTPS; gate de secretos de example | Falta VPS + DNS + secretos reales + backups |

---

## 4. Huecos del MVP **documentado** (HUs “Implemented” incompletas)

Estos sí cuentan como “hace falta implementar” para un MVP fiel al contrato. Ordenados por impacto en un turno real.

### P0 — el restaurante no puede cerrar el día como promete el contrato

**HU-025 / BR-022 / BR-023 — Cierre de caja**

Criterio: totales del día, totales por medio de pago, resumen de cierre, **histórico de cierres**.

Hoy: `CashMovement` es un libro manual (ingresos/egresos). Las ventas **no** generan movimiento automático. No hay `CashSession` / `CashClosing`. El “cuadre por medio de pago” vive en reportes **históricos de toda la vida**, no del turno.

Sin esto, el cajero de Nana no puede hacer el arqueo de fin de jornada que el propio alcance lista.

### P0 — persistencia y backup si se sube a un VPS

- Logos: `uploads/` no está en un volume de Docker → se pierden al redeploy.
- Postgres sí tiene volume; **no hay backup automatizado ni runbook de restore**.
- Baseline de seguridad pide backups; el compose no los tiene.

Sin backup + volume de uploads, un piloto en VPS es frágil el primer día que se recrea el contenedor.

### P1 — criterios de aceptación que el código no cumple

| ID | Promesa | Realidad |
|---|---|---|
| HU-014 / BR-017 | Pickup con hora estimada | No hay campo ni UI |
| HU-017 / BR-020 | Recargo de servicio 5% en el total y el recibo | `taxCents` siempre 0. El 5% es propina **sugerida** y opcional |
| HU-023 | Órdenes agrupadas por estado, filtrable por fecha | No hay endpoint ni pantalla |
| HU-012 | Cancelar **ítem** con autorización admin + motivo + auditoría | En `CREATED` se **borra**. Después de cocina el código dice “future per-item cancel”. Cortesía no es cancelación |
| HU-020 / HU-021 / HU-022 | Filtro de fechas / tendencia mensual | `GET /reports/revenue-range` existe; la UI de ventas/productos/domicilios **no lo usa**. `salesByDay` es all-time en UTC |
| Story map | Reporte de pickup | No existe; delivery summary mezcla o ignora pickup |
| HU-010 / BR-010 | Tras enviar a cocina, la orden no se modifica | Luego se relajó a propósito (agregar ítems post-cocina). El contrato no se actualizó |
| Visión Delivery vs HU-015 | Visión: delivery no actualiza logística. HU: sí | El código sigue la HU (despachar/entregar). La visión está desactualizada |

### P1 — operación de cocina en un turno real

`KitchenBoard` carga al montar. No hay poll ni websocket. El cocinero tiene que recargar la página para ver pedidos nuevos. El alcance lista “notificaciones en tiempo real” como **fuera**; un poll de 5–10 s **sí** es razonable para el MVP (no es WhatsApp ni push).

### P1 — seguridad que el baseline exige y el código no tiene

| Baseline | Estado |
|---|---|
| JWT 15 min + refresh | Staff 1d, platform 7d, sin refresh |
| Rate limiting | No hay (ni Nest throttler ni proxy) |
| `@Permissions` en todos los endpoints sensibles | Solo users/roles/reports/cash |
| Email único por tenant, no global | `User.email @unique` global |
| HSTS (HTTPS) | Caddy lo puede dar; el compose local no |
| Logs con requestId / audit de acciones | Hay `OrderStatusHistory` + createdBy; no hay audit log general |

Ampliar `@Permissions` a **todo** el monolito en un PR viola la regla 12. Cubrir solo lo que el siguiente incremento toque.

---

## 5. Qué hace falta para **salir a producción** (ops, no producto)

El overlay Caddy + gate de secretos **ya está escrito**. Falta trabajo de operador + un par de endurecimientos de artefacto:

1. VPS con Docker Compose ≥ 2.24, puertos 80/443.
2. DNS `app.` + `api.` al VPS.
3. `.env` real: `JWT_SECRET`, `POSTGRES_PASSWORD`, `PLATFORM_ADMIN_*`, `ALLOW_INSECURE_DEFAULTS=false`. Nunca los valores de example.
4. Rebuild del frontend si cambia `NEXT_PUBLIC_API_URL`.
5. Volume de `uploads/` + backup/restore de Postgres documentado y probado.
6. Healthcheck ya existe (`/health`); falta alerta si cae (opcional en piloto de un tenant).
7. No se provisiona VPS/DNS/Let’s Encrypt desde este agente.

AWS (`deployment-aws.md`) **no** es requisito del MVP. El runbook lo dice.

---

## 6. Fuera de alcance (no implementar para “sacar el MVP”)

- Inventario, compras, proveedores, recetas, merma.
- Factus / DIAN real (el “aceptar factura” es simulación).
- WhatsApp, MercadoPago, app del cliente, menú digital público.
- Print-agent ESC/POS (scaffold en `print-agent/`; el usuario lo aplazó).
- Multi-sede / subdominio por tenant.
- Suite e2e automatizada (48 tests Jest unitarios; QA es 🟡).
- Paridad Loggro (resoluciones, NIT fiscal, zonas de impresión, objetivos, etc.).

---

## 7. Orden recomendado (estabilidad → clean → patrones)

Si el objetivo es **Nana Burger operando un día real en un VPS**:

1. **Cierre de caja de turno** (sesión: apertura → ventas del turno por medio → egresos → snapshot de cierre). Eso cierra HU-025 de verdad.
2. **Volume de uploads + backup/restore** en el runbook. Sin esto no se sube a VPS.
3. **Poll de cocina** (intervalo corto). Desbloquea el KDS en un turno real sin websockets.
4. Operador: VPS + DNS + secretos + HTTPS.
5. Recién ahí, si el usuario lo pide: impresora térmica.

Si el objetivo es **cerrar el contrato de HUs** (después del piloto):

6. Hora estimada de pickup.
7. Decidir: ¿el 5% es propina sugerida (actualizar BR-020) o recargo de servicio (implementarlo)?
8. Cancelar ítem post-cocina con motivo (no borrar).
9. Filtro de fechas en reportes + reporte por estado + pickup.
10. Alinear visión Delivery y BR-010 con el código actual.

Si el objetivo es **paridad Loggro / inventario**: módulo nuevo, alcance y HUs nuevas. No es el siguiente paso del MVP escrito.
