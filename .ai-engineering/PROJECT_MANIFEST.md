# PROJECT MANIFEST

## Información General

**Nombre del Proyecto:** NanaBurguer / RestoOS

**Versión:** 0.4.55

**Estado:** MVP / beta en `dev` (trabajo local)

**Tipo de Proyecto:** POS SaaS para restaurantes y gastrobares (multi-tenant)

**Dominio:** Operación de salón (mesas, cocina, caja, domicilio, admin del local + plataforma)

---

# Objetivo

Construir un POS SaaS (RestoOS) para que varios restaurantes operen pedidos, cocina, caja y domicilio. No es un ERP ni un software contable.

---

# Arquitectura

- Modular Monolith
- Clean Architecture
- Domain Driven Design (cuando aplique)
- SOLID
- Repository Pattern
- Dependency Injection

---

# Stack Tecnológico

Frontend:

- Next.js

Backend:

- NestJS

Base de datos:

- PostgreSQL

ORM:

- Prisma

Infraestructura:

- Docker

---

# Equipos Activos

- Product Manager
- Software Architect
- Backend Engineer
- Frontend Engineer
- UI Designer
- QA Engineer
- Documentation Engineer
- Code Reviewer

---

**Punto de entrada del Framework**

AI Engineering OS `main` `b71085f` — `C:/Users/USER/projects/AI_ENGINEERING_OS/MASTER.md`

Regla 13 (UI): no implementar interfaz genérica. Dirección en `docs/12-ux-ui/` antes del código.

---

# Documentación del Proyecto

README.md

docs/

.ai-engineering/

---

# Estado Actual

Consultar:

.ai-engineering/PROJECT_STATE.md

---

# Decisiones Arquitectónicas

Consultar:

.ai-engineering/PROJECT_DECISIONS.md

---

# Restricciones

- Mantener arquitectura modular.
- No introducir deuda técnica.
- Documentar cambios importantes.
- Mantener compatibilidad entre módulos.
- `/restaurant/*` es mobile-first (DEC-009).
- El producto es POS SaaS (DEC-008 / ADR-024), no ERP.
- UI: DEC-011 / regla 13. No código de interfaz sin dirección evaluada.