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

Identidad de tenant obligatoria (ERP multi-tenant)

Después del login del restaurante, toda superficie `/restaurant/*` **ya autenticada** muestra **logotipo + nombre + slug**. Si hay `logoUrl`, el mark es esa imagen, no la letra del nombre.

La puerta de `/restaurant/login` es de **plataforma (RestoOS)** hasta que el operador escribe un slug que el API reconoce (el slug es opcional: solo pinta logo y nombre). `/restaurant/local-login` redirige a esa misma pantalla: no hay un segundo login de “rol”. El persist de un local anterior no pinta NanaBurguer (ni ningún tenant) en esa pantalla. Nombre y logo del local aparecen solo tras ese lookup público.

El chrome compartido (`PosShell`, admin, hubs) lee `restaurant-auth` **después** de identificar el tenant. Una pantalla nueva no “elige” si pinta el local: lo hereda.

Motivo:

Esto es un ERP profesional, no un login suelto. El operador debe ver en qué tenant está. El dueño no debería tener que cazar huecos de marca en cada pantalla.

---

## DEC-008

Tipo de producto

Clase: **ERP vertical de restaurantes** (SaaS multi-tenant).

Hoy cubre el núcleo operativo: autenticación por tenant, RBAC, mesas/POS, KDS, domicilio/recoger, caja y reportes.

Fuera del MVP (no inventar): inventario, contabilidad, nómina, Factus/DIAN, Rappi, app de cliente, sucursales reales.

Motivo:

Un ERP se reconoce por tenant, roles, trazabilidad y módulos que no se pisan. Un POS suelto no exige eso. La visión es ERP; el incremento actual no debe fingir módulos que aún no existen.

---

## DEC-009

Mobile-first en operación (`/restaurant/*`)

El POS se usa en teléfono. Toda superficie `/restaurant/*` se diseña primero a ~390px (tap ≥ 44px, header sticky, acciones de cobro/cocina fijas abajo, sin scroll horizontal). Escritorio es el caso amplio, no el único.

No bloquear zoom (`maximumScale`) por accesibilidad.

Motivo:

Mesero y caja trabajan de pie, con una mano. Una UI que solo cabe en laptop no es operable en el local.

---

## DEC-010

Cancelar ítem después de cocina

Permiso `ORDERS_CANCEL_ITEM`. Por defecto ON en ADMIN y CASHIER, OFF en mesero/cocina/domicilio. El admin lo enciende o apaga en Configuración → Roles. Quitar un producto en CREATED (aún no va a cocina) sigue siendo `removeItem` y no usa este permiso.

Las plantillas de sistema ya no se resetean en cada carga: un código nuevo del catálogo se otorga una vez a las estaciones por defecto; después mandan los toggles.

Motivo:

HU-012 pedía autorización. OPS-06: no darlo al mesero de fábrica, pero sí poder habilitarlo sin otro deploy.