# PROJECT CHANGELOG

## v0.1

- Arquitectura inicial.

## v0.2

- Backend inicial.

## v0.3

- Frontend inicial.

## v0.3.1

- Estabilización crítica Backend:
  - Fix identidad JWT (`userId`) en controllers operativos.
  - Remoción de logs sensibles en login y guards.
  - Permiso `KITCHEN` en transición de estado de órdenes.

## v0.3.2

- Higiene estructural Frontend:
  - Layouts App Router activos (`layout.tsx`).
  - Rutas dinámicas `[id]` corregidas.
  - Logins por rol (cashier/waiter/kitchen/delivery).
  - Auth staff/platform con persist + cookies + Bearer en `api.ts`.
  - Middleware de protección admin/platform.

## v0.3.3

- Vertical operativo Frontend (mesero → cocina → caja):
  - Services orders/menu/payments + tables con `label`.
  - UI mesero: mesas, crear orden, enviar a cocina.
  - UI cocina: cola, preparando, listas.
  - UI cajero: cerrar orden READY + pago CASH.

## v0.3.4

- Admin restaurante: UI menú (categorías/productos) y usuarios (listar/crear).

## v0.3.5

- Sistema visual de marca NANA Burger:
  - Tokens CSS, tipografías, atmósfera y motion.
  - Landing, logins, portal de roles, home restaurante.
  - Shells admin/platform y hubs operativos.

## v0.3.6

- Delivery end-to-end:
  - Servicio frontend `/deliveries` (list, dispatch, deliver, markPrinted).
  - Detalle de pedido delivery con acción de entrega.
  - Despacho de domicilios desde caja.
- Validación E2E completa en entorno local (Docker + Postgres + API + Next):
  onboarding SaaS, vertical DINE_IN completo (orden→cocina→cierre→pago con
  invoice snapshot), vertical DELIVERY completo (orden→despacho→entrega).

## v0.3.7

- Suite de tests unitarios backend (Jest + mocks de Prisma):
  AuthService, OrdersService, TenantGuard, RolesGuard.
  36/36 tests passing. Cubre auth, ciclo de vida de órdenes y aislamiento
  de tenant (multi-tenant security).

## v0.4.0

- Órdenes como documentación: toda respuesta de órdenes incluye ahora
  `items.menuItem.name`, `createdBy` y `updatedBy` (fuente única
  `ORDER_INCLUDE` en `OrdersService`).
- Detalle de orden (admin/caja/mesero) muestra quién la creó y, si está
  cerrada, quién la cerró/facturó.
- Lista de órdenes admin conectada a datos reales con filtro de estado.
- Módulo de facturación completo: lista + detalle/impresión (recibo) +
  aceptar (simulación DIAN). `InvoicesController` ahora restringido a
  ADMIN/CASHIER (antes sin `@Roles`).
- Comanda imprimible (`KitchenTicket`) al enviar la orden a cocina desde
  el mesero.

## v0.4.1

- Separación marca de plataforma (genérica) vs. marca de tenant
  (dinámica, por restaurante). Nuevo `config/platform-brand.ts`.
- `BrandMark` generalizado (props `name`/`logoUrl` + fallback monograma).
- Fix de seguridad: `RestaurantController` sin tenant scoping →
  reemplazado por `/restaurants/me` (siempre el propio tenant del JWT).
- Nueva pantalla Admin → Restaurante para gestionar logo/nombre/contacto
  por tenant (autoservicio, sin intervención manual en BD).

## v0.3.9

- Responsive/mobile crítico: el panel admin no tenía navegación visible
  en pantallas pequeñas (sidebar `hidden lg:flex` sin alternativa).
- Nuevo `MobileNavDrawer`/`MobileNavTrigger` reutilizable (hamburguesa +
  drawer), conectado en admin y plataforma.
- Plataforma: sidebar ahora se oculta en móvil en vez de exprimir el
  contenido.
- `flex-wrap`, tipografía responsiva y `overflow-x-hidden` en pantallas
  de mesero, cocina, delivery y hubs de rol.

## v0.3.8

- Fix: mesas no mostraban ocupación (sin `activeOrder`); orden cancelada
  bloqueaba la mesa permanentemente; transferencia de mesa no validaba
  destino libre. Ver `PROJECT_STATE.md` para el detalle completo.
- Nueva constante compartida `ACTIVE_ORDER_STATUSES` como fuente única
  de verdad de qué estados de orden "ocupan" una mesa.
- Frontend: ocupación visible en `TableCard`, modal de transferencia de
  mesa funcional, detalle de mesa en admin implementado.
- 5 tests de regresión nuevos (41/41 passing en total).
- Comentarios de documentación agregados a los archivos tocados
  (servicios, componentes, tipos) explicando propósito e invariantes.






## v0.4.0

- Admin opera mesas/ordenes como mesero (CreateOrderScreen compartido).
- Cerrar y cobrar con modal de metodo (efectivo con cambio).

## v0.4.1

- Metodos de pago por restaurante (RestaurantPaymentMethod).
- Admin Configuracion: activar/renombrar metodos.
- Validacion de metodo activo al pagar; methodLabel en factura.

## v0.4.2

- Editar cantidad/notas de items (CREATED); agregar post-cocina.
- Opcion No imprimir comanda.
- Descuento a nivel orden + cortesia por linea (admin).
- Scaffold print-agent/ para impresora termica USB (Fase 2).

## v0.4.3

- Fase 3: roles custom + matriz de permisos (Permission, Role, RolePermission).
- 5 plantillas de sistema por tenant; JWT incluye permissions.
- Admin: /restaurant/admin/roles + alta de usuarios por roleId.
- PermissionsGuard en endpoints sensibles (users, roles).

## v0.4.5

- Compose de MVP desplegable: sin IP de AWS muerta; `NEXT_PUBLIC_API_URL` en build; CORS por env.
- API en Docker: `prisma migrate deploy` + seed idempotente al arrancar.
- Create/list de restaurantes de platform ya no serializa hashes ni `factusApiKey`.
- Runbook: `docs/10-devops/local-setup.md`.

## v0.4.4

- Adopción SDD sin reescribir: `docs/sdd-mapping.md` inventaría 00–15 sobre las rutas actuales.
- Job **Documentación viva** (`.github/workflows/living-docs.yml`) mapeado a `docs/` y `.ai-engineering/`, no a carpetas 00–15 inexistentes.
- No se movió documentación histórica.
