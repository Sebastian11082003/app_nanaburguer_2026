# PROJECT DECISIONS

## ADR-001

Arquitectura:

Modular Monolith

Motivo:

Reducir complejidad del MVP.

---

## ADR-002

ORM

Prisma

Motivo:

Productividad y tipado.

---

## ADR-003

Autenticación

JWT

Motivo:

Compatibilidad con API REST.

---

## DEC-004

Identidad en request autenticado

El usuario JWT se expone como `request.user.userId` (desde `payload.sub`).

Motivo:

Alinear controllers con `JwtStrategy.validate` y evitar FKs/`createdBy` nulos.

---

## DEC-005

Rol KITCHEN en status de órdenes

`PATCH /orders/:id/status` incluye `UserRole.KITCHEN`.

Motivo:

Alinear RBAC con security baseline (actualización de estado de cocina).

---

## DEC-006

Dirección visual de marca (UI/UX)

Base: logo NANA Burger (badge monocromo + ribbon script).

Tokens:

- Ink / panel oscuro (operación nocturna tipo cocina)
- Paper / cream para contraste
- Flame ámbar solo como acento (no púrpura)
- Display: Archivo Black
- Body: Outfit
- Script: Pacifico (wordmark “Burger” / acentos)

Motivo:

Unificar SaaS operativo + futuro landing de pedidos online bajo la misma identidad.

---

## DEC-007

Identidad de tenant obligatoria (POS SaaS multi-tenant)

Después del login del restaurante, toda superficie `/restaurant/*` **ya autenticada** muestra **logotipo + nombre + slug**. Si hay `logoUrl`, el mark es esa imagen, no la letra del nombre.

La puerta de `/restaurant/login` (y el slug de `/restaurant/local-login`) es de **plataforma (RestoOS)** hasta que el operador escribe un slug que el API reconoce. El persist de un local anterior no pinta NanaBurguer (ni ningún tenant) en esa pantalla. Nombre y logo del local aparecen solo tras ese lookup público.

El chrome compartido (`PosShell`, admin, hubs) lee `restaurant-auth` **después** de identificar el tenant. Una pantalla nueva no “elige” si pinta el local: lo hereda.

Motivo:

Esto es un POS SaaS de varios locales, no un login suelto ni la marca de un solo cliente. El operador debe ver en qué tenant está. El dueño no debería tener que cazar huecos de marca en cada pantalla.

---

## DEC-008

Tipo de producto

Clase: **POS SaaS para restaurantes y gastrobares** (multi-tenant).

Nombre de plataforma: **RestoOS**. Primer tenant piloto: Nana Burger (`nana-neiva`).

Referencia comercial: **Loggro Restobar** (en Loggro vive bajo “POS para bares y restaurantes”, no bajo “ERP para grandes empresas”).

Hoy cubre el núcleo de salón: autenticación por tenant, RBAC, mesas/POS, KDS, domicilio/recoger, caja y reportes.

Fuera del tipo de sistema (no fingir): ERP, contabilidad, nómina, plan de cuentas, software administrativo de Pyme.

Fuera del MVP (módulos posteriores, si se piden): inventario, menú digital público, Factus/DIAN, Rappi, app de cliente, sucursales reales.

Motivo:

Un POS multi-tenant sigue siendo POS. Tenant, roles y trazabilidad no convierten el producto en ERP. Inventario o facturación electrónica, si llegan, son módulos de un Restobar — no un cambio de categoría. Ver [ADR-024](../docs/ADR/ADR-024.md).

---

## DEC-009

Mobile-first en operación (`/restaurant/*`)

El POS se usa en teléfono. Toda superficie `/restaurant/*` se diseña primero a ~390px (tap ≥ 44px, header sticky, acciones de cobro/cocina fijas abajo, sin scroll horizontal). Escritorio es el caso amplio, no el único.

No bloquear zoom (`maximumScale`) por accesibilidad.

Motivo:

Mesero y caja trabajan de pie, con una mano. Una UI que solo cabe en laptop no es operable en el local.