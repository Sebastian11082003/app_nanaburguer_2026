# PROJECT STATE

## Estado General

🟢 MVP operativo verificado end-to-end (entorno local)

---

## Ciclo de Vida

✅ Análisis

✅ Requerimientos

✅ MVP

✅ Arquitectura

🟢 Backend (verificado contra BD real)

🟢 Frontend (build OK, verticales clave probados)

🟡 QA (pruebas manuales/API OK; falta suite automatizada)

🟡 Deployment (compose MVP local + overlay HTTPS/Caddy; secretos de example bloqueados en arranque público)

⬜ Producción (hace falta un VPS y DNS reales; no se provisionan desde aquí)

---

## Sprint Actual

Sprint 4 — Delivery + validación E2E local

---

## Agente Activo

Backend/Frontend Engineer (coordinado por Orchestrator)

---

## Último avance

### Huecos operativos (v0.4.9)

- Usuario: detalle + PATCH (rol, activo, password). No se puede desactivar a uno mismo.
- Productos: toggle disponible. Caja: POS pickup y link a despacho de domicilios.
- Plataforma: conteo de restaurantes. Stubs redirigidos. `passwordHash` fuera de `/users`.

### Dashboard, reportes y caja (v0.4.8)

- Admin home y `/reports` (ventas/productos/domicilios) dejan de ser stub: consumen el `ReportsService` existente.
- Caja (`/restaurant/admin/cash` y `/restaurant/cashier/cash`) registra INCOME/EXPENSE.
- `/reports` cerrado a ADMIN/CASHIER + `REPORTS_VIEW`. `/cash` añade `CASH_MANAGE`.

### Arranque sin secretos de example (v0.4.7)

- `ALLOW_INSECURE_DEFAULTS`: el compose local lo deja en `true`; el overlay HTTPS en `false`.
- Nest rechaza `JWT_SECRET` copiado de `.env.example` / `.env.https.example` si el flag es false (el Docker MVP usa `NODE_ENV=production`).
- Seed lee `PLATFORM_ADMIN_EMAIL` / `PLATFORM_ADMIN_PASSWORD` y se niega a crear `123456` sin el flag. `SEED_ON_BOOT=false` salta el seed.

### HTTPS overlay (v0.4.6)

- Caddy delante de API y frontend. DNS `app.` + `api.`, puertos 80/443.
- `docker compose -f docker-compose.yml` sigue siendo el MVP local.

### Despliegue MVP (v0.4.5)

- `docker compose -f docker-compose.yml up --build` levanta db + API + frontend.
- Seed de platform admin al arrancar. CORS y URL pública por variables.
- Runbook en `docs/10-devops/local-setup.md`. AWS sigue fuera; HTTPS es overlay Caddy.

### Adopción SDD / living-docs (v0.4.4)

- Inventario en `docs/sdd-mapping.md`. Las claves 00–15 apuntan a docs que ya existían.
- CI de documentación viva instalado contra esas rutas. Rama de integración: `dev`.
- No se reescribió ni se movió arquitectura, HUs ni ADRs.

### Backend (v0.3.1)

- Fix JWT `userId`, logs sensibles, rol KITCHEN.
- Verificado: `nest build` OK.

### Frontend estructura (v0.3.2)

- Layouts, rutas `[id]`, logins por rol, auth unificado.

### Frontend vertical MVP (v0.3.3)

- Mesero → cocina → caja operativo.

### Admin datos (v0.3.4)

- Menú y usuarios.

### Marca UI/UX (v0.3.5)

- Sistema visual NANA Burger (tokens, tipografías, motion).

### Delivery (v0.3.6)

- Servicio `/deliveries` en frontend (list, dispatch, deliver, markPrinted).
- Detalle de pedido delivery con acción "Marcar entregado".
- Despacho desde caja (`/restaurant/cashier/delivery`).
- Tipos `Order.delivery` con `status`.

### Validación E2E contra entorno local real (Docker + Postgres + API + Next dev)

Probado con datos reales, no solo build:

1. Platform login → crear restaurante (+ admin default) → restaurant-auth login → admin login.
2. Crear mesa, categoría, producto.
3. Orden DINE_IN: crear → agregar item → cocina (SENT_TO_KITCHEN → IN_PREPARATION → READY) → cerrar (Sale) → pago CASH (Payment + Invoice snapshot con propina sugerida).
4. Orden DELIVERY: crear con datos de cliente → agregar item → listar en `/deliveries` → despachar → entregar.

Todos los pasos devolvieron 200/201 y datos consistentes en Postgres.

---

## Entorno de pruebas local

- Postgres vía Docker, puerto estándar **5432** (contenedor `nanaburguer_db`).
- Backend: `npm run start:dev` → `http://localhost:3000`.
- Frontend: `npm run dev` → `http://localhost:3001` (3000 puede quedar ocupado por el backend).
- Seed: platform admin `admin@nanaburger.com` / `123456`.

---

### Órdenes como documentación + comanda imprimible (v0.4.0)

Pedido del usuario: al entrar a una mesa se debe poder armar la orden y
enviarla (comanda) a impresión; y "Órdenes" debe funcionar como registro/
documentación (abiertas, cerradas, con la mesa y el mesero/cajero
asociados), similar a cómo se documentan las facturas.

**Backend:**

- Nueva constante `OrdersService.ORDER_INCLUDE` (única fuente de verdad
  del `include` de Prisma para Order): agrega `items.menuItem.name`
  (nombre real de producto, antes no venía en ningún endpoint de
  órdenes) y `createdBy`/`updatedBy` (`id, fullName, role` — nunca el
  hash de password) a **todas** las respuestas de órdenes
  (create/addItem/updateStatus/transferTable/closeOrder/findAll/findOne).
- `TablesService` también incluye `menuItem.name` en la orden activa de
  cada mesa.
- `InvoicesController` no tenía `@Roles` — cualquier rol autenticado
  podía leer facturas de cualquier orden. Ahora restringido a
  ADMIN/CASHIER.

**Frontend:**

- `Order.items[].menuItem`, `Order.createdBy`, `Order.updatedBy` en los
  tipos; helper `orderLineLabel()` para no repetir la lógica de
  fallback ("2x Hamburguesa" vs "2x item" si falta el nombre).
- `OrderDetailView` (compartido admin/caja/mesero) ahora muestra
  "Creada por" y, si está cerrada, "Cerrada/facturada por".
- Lista de órdenes del admin conectada a datos reales, con filtro por
  estado y "Creada por"/"Facturada por" visibles por fila.
- Listas de caja/mesero enlazan a `OrderDetailView`.
- Módulo de facturación completo: lista (`/restaurant/admin/invoices`) +
  detalle/impresión con formato de recibo desde el snapshot congelado
  de la factura + acción "Marcar como aceptada" (simulación DIAN).
- Nuevo `KitchenTicket`: comanda imprimible (`window.print()`) disparada
  automáticamente al enviar la orden a cocina desde el mesero, con
  botón "Ver comanda" para reimprimir. No es integración real con
  impresora térmica (ESC/POS) — depende de la impresora predeterminada
  del sistema operativo del dispositivo del mesero/cocina.

**Validado E2E contra API real:** `createdBy`/`updatedBy`/
`menuItem.name` confirmados en las respuestas; mesa se libera
correctamente tras cerrar la orden.

### Carga real de logo + branding dinámico en login (v0.4.3)

- **Backend**: nuevo endpoint `POST /restaurants/me/logo` (multipart,
  `multer` + `diskStorage`, solo JPG/PNG/WEBP/GIF, máx. 5MB). Los
  archivos se guardan en `backend/api/uploads/logos/` y se sirven como
  estáticos en `/uploads/*` (`main.ts`, `useStaticAssets`). Ojo: usa
  `process.cwd()` y NO `__dirname` para resolver la carpeta, porque el
  modo `--watch` de Nest empaqueta todo en memoria vía webpack y
  `__dirname` no apunta a la carpeta real del proyecto en ese modo.
  `helmet` con `crossOriginResourcePolicy: 'cross-origin'` (necesario
  porque el frontend y la API corren en orígenes distintos), registrado
  ANTES de `useStaticAssets` (el static handler termina la respuesta y
  el middleware registrado después nunca corre para esas rutas).
- **Backend**: nuevo endpoint público `GET /restaurant-auth/branding?slug=`
  que devuelve SOLO `{ name, logoUrl }` de un restaurante activo (o
  `null`), pensado para mostrar el logo del restaurante como "foto de
  perfil" en la pantalla de login antes de autenticarse.
- **Fix de seguridad encontrado y corregido de paso**: `GET/PATCH
  /restaurants/me` devolvía el registro crudo de Prisma, filtrando
  `restaurantPasswordHash` y `factusApiKey` al navegador del ADMIN.
  Ahora usa un `select` explícito (`SAFE_RESTAURANT_SELECT`).
- **Frontend**: página de configuración del restaurante con selector de
  archivo real (sube inmediatamente al elegir el archivo, sin paso de
  "guardar" aparte). `resolveAssetUrl()` (`src/lib/resolve-asset-url.ts`)
  resuelve rutas `/uploads/...` contra `NEXT_PUBLIC_API_URL`, usado por
  `BrandMark` y por el detalle de factura. `next.config.ts` con
  `images.remotePatterns` apuntando a `localhost:3000/uploads/**`.
- **Frontend**: pantalla `/restaurant/login` ahora busca el branding del
  slug con debounce (400ms) mientras el usuario escribe, y muestra el
  logo/nombre del restaurante en vez de la marca genérica de la
  plataforma — sin depender de `useRestaurantStore` (no hay tenant
  resuelto todavía en esa pantalla).
- **Factura**: el snapshot de pago (`PaymentsService.buildInvoice`)
  ahora captura `restaurant.logoUrl` y el detalle de factura lo muestra
  como masthead.
- Probado end-to-end manualmente contra un restaurante de prueba
  (login admin → subir logo → servir archivo estático → branding
  público por slug) y limpiado después (datos y contraseña de prueba
  restaurados).

### Nombre de plataforma confirmado + referencia de producto (v0.4.2)

- El usuario confirmó **"RestoOS"** como nombre de la plataforma (ya no
  es solo un placeholder, ver `config/platform-brand.ts`).
- Referencia de producto compartida por el usuario: **Loggro Restobar**
  (SaaS comercial que usan actualmente mientras se termina RestoOS).
  Estructura de Configuración observada (para inspirar, NO copiar):
  Información del negocio (nombre, NIT, contacto, email, dirección,
  país/departamento/ciudad, teléfono, web, toggles de facturación
  electrónica/ingredientes/mesas/domicilio), y submenú con: Documento,
  Resoluciones, Medios de pago, Objetivos, Avanzado, Moneda,
  Integraciones, Roles, Usuarios, Menú Digital, Mesas, Configuración de
  Comanda, Zonas de impresión de comandas, Acceso de usuarios/productos
  a Mesas, Eventos, Tienda. También Dashboard con métricas de
  facturación/objetivos y gráficas, Cajas con desglose de cuadre por
  medio de pago (Efectivo, Nequi, tarjetas, QR), grid de Mesas, y
  listado de Productos con categorías/costo/impuestos/utilidad.
- Logo de factura implementado: el snapshot de pago (`buildInvoice`)
  ahora captura `restaurant.logoUrl` y el detalle de factura lo muestra
  como masthead sobre el nombre del restaurante.
- Pendiente de decisión del usuario: alcance y prioridad del resto de
  "Configuración" (ver preguntas en la conversación).

### Marca por tenant vs. marca de plataforma (v0.4.1)

Reportado por el usuario: la pantalla inicial del SaaS mostraba la marca
de un solo cliente (Nana Burger), incorrecto para un producto
multi-tenant que se vende a otros restaurantes/gastrobares.

**Arquitectura implementada:**

- `config/platform-brand.ts`: identidad genérica del SOFTWARE (nombre
  placeholder `RestoOS`, cámbialo aquí cuando haya nombre comercial).
  Usada en `/`, `/platform/*`, `/restaurant/login` (antes de resolver
  el tenant).
- `BrandMark` (antes hardcodeado a Nana): ahora recibe `name`/`logoUrl`
  por props y cae a un monograma genérico si el tenant no tiene logo.
  Usada en `/restaurant/home`, `/roles`, logins de rol, sidebar admin —
  siempre leyendo de `useRestaurantStore` (tenant ya resuelto).
- Backend: `restaurant-auth` expone `logoUrl` del tenant en el login.

**Fix de seguridad de paso:** `RestaurantController` no tenía
`TenantGuard` ni scoping — cualquier ADMIN podía leer/editar/borrar
CUALQUIER restaurante adivinando su id. Reemplazado por
`GET/PATCH /restaurants/me`, resuelto siempre desde el JWT — ya no hay
id que adivinar.

**Pantalla nueva:** Admin → Restaurante (`/restaurant/admin/restaurant`)
para que cada tenant gestione su propio nombre/logo/color/contacto.

**Nota operativa:** el logo real de Nana Burguer no aparecía porque su
`logoUrl` nunca se había guardado en BD (recreada varias veces durante
las pruebas de esta sesión). Se corrigió manualmente vía SQL para el
tenant real (`Nana-neiva`) y queda editable desde la nueva pantalla de
ahora en adelante.

### Responsive / mobile-first (v0.3.9)

Reportado por QA manual: en móvil no aparecía la navegación de
Órdenes/Mesas/etc en el panel admin — el sidebar usaba `hidden lg:flex`
sin ninguna alternativa por debajo de `lg`, dejando el panel
inutilizable en pantallas pequeñas. El panel de plataforma tenía el
problema inverso: el sidebar de 256px siempre visible, exprimiendo el
contenido en móvil.

**Corrección:**

- Nuevo componente reutilizable `MobileNavDrawer` + `MobileNavTrigger`
  (`components/layaout/mobile-nav-drawer.tsx`): botón hamburguesa +
  panel deslizable con overlay, reutilizado por admin y plataforma para
  que ambas navegaciones de móvil no puedan desincronizarse.
- Admin: sidebar de escritorio intacta en `lg+`; por debajo, drawer con
  los mismos `restaurantAdminNavigation`.
- Plataforma: sidebar ahora `hidden lg:flex` (antes siempre visible);
  `PlatformTopbar` añade el trigger + drawer con `platformNavigation`.
- Ajustes de `flex-wrap`, tamaños de texto responsivos y
  `overflow-x-hidden` en pantallas operativas (mesero, cocina, delivery,
  hubs de rol) para evitar scroll horizontal y encabezados que se
  rompían en pantallas angostas.

**Pendiente para una siguiente pasada:** auditoría visual real en
dispositivo/DevTools de cada pantalla operativa (no solo las tocadas
aquí) — esta corrección se enfocó en el bloqueador reportado
(navegación admin/plataforma) y los puntos de mayor riesgo visual.

### Fix crítico: mesas + órdenes canceladas (v0.3.8)

Reportado por QA manual del usuario: "falta arreglar el tema de asignar
una orden a una mesa".

**Causa raíz encontrada:**

1. `TablesService` nunca exponía si una mesa tenía una orden activa → ni
   el mesero ni el admin podían saber si una mesa estaba ocupada.
2. El dedupe de `OrdersService.create` usaba `status !== CLOSED`, lo cual
   trataba una orden **CANCELED** como si siguiera ocupando la mesa →
   una mesa con una orden cancelada quedaba bloqueada para siempre.
3. `transferTable` no validaba que la mesa destino estuviera libre →
   podían quedar dos órdenes activas apuntando a la misma mesa.

**Corrección:**

- Nueva constante compartida `ACTIVE_ORDER_STATUSES`
  (`common/constants/order-status.constants.ts`) como única fuente de
  verdad de qué estados "ocupan" una mesa. Usada tanto en `TablesService`
  como en `OrdersService`.
- `TablesService.findAll/findOne` ahora devuelven `activeOrder` por mesa.
- `OrdersService.create` ya no bloquea mesas con orden cancelada.
- `OrdersService.transferTable` rechaza mover una orden a una mesa que
  ya tiene otra orden activa (`400 Destination table is already occupied`).
- Frontend: `Table.activeOrder`, `TableCard` muestra Disponible/Ocupada
  con número de orden, mesero navega correctamente a mesas ocupadas
  (resume la misma orden), modal de transferencia de mesa implementado
  y conectado, detalle de mesa en admin ya no es un stub.
- 5 tests de regresión nuevos (cancelación no bloquea mesa, transfer a
  mesa ocupada rechazado, transfer a mesa libre exitoso).

**Validado E2E contra API real:** mesa libre → ocupada → cancelada →
libre otra vez → nueva orden exitosa. Transferencia a mesa ocupada
rechazada (400); transferencia a mesa libre exitosa.

### Tests automatizados backend (v0.3.7)

Suite Jest unitaria (mocks de Prisma, sin depender de BD real):

- `auth.service.spec.ts`: login por rol (restaurante/usuario/password/rol
  incorrecto), scoping de credenciales por tenant, register (email
  duplicado, hash de password).
- `orders.service.spec.ts`: reglas de negocio de creación (DINE_IN sin mesa,
  mesa inexistente/inactiva, dedupe de orden abierta), numeración
  secuencial, creación de Delivery vinculado, addItem (cerrada, item no
  disponible, cálculo de totales), updateStatus, closeOrder (crea Sale una
  sola vez), y aislamiento de tenant en `findAll`/`findOne`.
- `tenant.guard.spec.ts`: rutas públicas, sin usuario, sin `restaurantId`,
  inyección correcta del tenant desde el JWT (no desde el request crudo).
- `roles.guard.spec.ts`: rutas sin restricción, sin usuario, rol no
  permitido, rol permitido.

**Resultado:** 5 suites Jest (env de arranque + auth/órdenes/guards). `nest build` sigue OK.

---

## Convención de documentación en código (a partir de v0.3.8)

Por pedido explícito del usuario, todo archivo nuevo o corregido debe
llevar comentarios que expliquen el **propósito** de cada servicio/
componente y el **porqué** de la lógica no obvia (invariantes, bugs que
se están evitando, decisiones de diseño) — no comentarios que solo
repitan literalmente lo que la línea de código ya dice. Ver
`tables.service.ts` y `orders.service.ts` como referencia de estilo.

---

## Último avance (operación Loggro-parity + pagos)

### Admin opera mesas (Fase 1–2 UX)

- `CreateOrderScreen` compartido mesero/admin.
- Admin: tomar/continuar orden, cerrar/cobrar, cancelar, cortesía, descuento.
- Modal de cobro con métodos activos del restaurante.

### Métodos de pago configurables (Fase 0)

- Modelo `RestaurantPaymentMethod` + `GET/PATCH /payment-methods`.
- Seed automático de CASH/CARD/TRANSFER/OTHER por tenant.
- Admin → Configuración: activar/renombrar métodos.
- Validación al crear pago; etiqueta congelada en factura (`methodLabel`).

### Edición de orden (Fase 1A/1B)

- `PATCH /orders/:id/items/:itemId` (cantidad/notas/cortesía).
- `PATCH /orders/:id/discount`.
- UI: +/− cantidad, no imprimir comanda, agregar ítems post-cocina,
  descuento y cortesía (admin).

### Print agent (Fase 2)

- Scaffold en `print-agent/README.md` (USB ESC/POS D300/D200).

### Roles custom + permisos (Fase 3 / v0.4.3)

- Modelos `Permission`, `Role`, `RolePermission`; `User.roleId`.
- 5 plantillas por tenant; JWT con `permissions[]`.
- Admin UI `/restaurant/admin/roles` + usuarios por `roleId`.
- `PermissionsGuard` en users/roles.

## Próxima Fase

- Impresora térmica USB (print-agent ESC/POS real) — diferido: el resto del vertical operativo ya no muestra “En construcción”.
- Ampliar `@Permissions` al resto de controllers (users/roles/reports/cash ya cubiertos).
- Tests de roles/permisos + e2e.
- HTTPS + dominio + secretos reales en un VPS (overlay Caddy + gate de defaults listos; hace falta DNS y máquina).
- Huecos SDD del mapa (glosario, testing-strategy, runbook): solo cuando un cambio de código los obligue, no como migración de árbol.
