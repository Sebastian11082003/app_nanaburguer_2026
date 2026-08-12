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