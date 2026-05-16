# 🍔 NanaBurguer SaaS Platform

<div align="center">

Enterprise Restaurant Management & POS SaaS Platform

Cloud-Native • Multi-Tenant Ready • Modular Architecture • API-First

</div>

---

# 📚 Table of Contents

- [1. Project Vision](#1-project-vision)
- [2. Business Problem](#2-business-problem)
- [3. System Objectives](#3-system-objectives)
- [4. Platform Scope](#4-platform-scope)
- [5. Actors & Roles](#5-actors--roles)
- [6. Architecture Overview](#6-architecture-overview)
- [7. Technology Stack](#7-technology-stack)
- [8. Project Structure](#8-project-structure)
- [9. Documentation Index](#9-documentation-index)
- [10. Architecture Decision Records (ADR)](#10-architecture-decision-records-adr)
- [11. Deployment Strategy](#11-deployment-strategy)
- [12. Security](#12-security)
- [13. Current MVP Status](#13-current-mvp-status)
- [14. Future Roadmap](#14-future-roadmap)
- [15. Local Development](#15-local-development)
- [16. Final Architecture Vision](#16-final-architecture-vision)

---

# 🧠 1. Project Vision

NanaBurguer is a modern SaaS platform designed to digitalize restaurant operations through scalable backend architecture, modular domain separation, and enterprise-grade documentation practices.

The platform evolves from an MVP architecture toward a cloud-native scalable SaaS ecosystem.

Main architectural goals:

- Restaurant operational centralization
- Scalable modular backend
- SaaS-ready architecture
- Multi-tenant evolution
- Cloud deployment readiness
- Clean architecture principles
- Future external integrations

---

# ⚠️ 2. Business Problem

Many restaurants still rely on:

- Paper workflows
- WhatsApp coordination
- Manual order tracking
- Spreadsheet accounting
- Non-centralized operations

This creates:

- Order mistakes
- Lack of traceability
- Poor reporting
- Operational inefficiency
- No scalability

---

# 🎯 3. System Objectives

- Centralize restaurant operations
- Improve order management
- Enable reporting & analytics
- Support multiple order flows
- Provide scalable SaaS architecture
- Prepare future cloud deployment
- Support future external integrations

---

# 📦 4. Platform Scope

## Included in MVP

- Authentication & Authorization
- RBAC Roles
- Table management
- Dine-in orders
- Pickup orders
- Delivery registration
- POS receipts
- Reports
- Swagger API Documentation
- Dockerized environment
- Prisma ORM
- PostgreSQL

## Planned Future Features

- DIAN electronic invoicing
- Factus integration
- MercadoPago
- WhatsApp notifications
- Public Landing Page
- Online ordering
- AWS deployment
- Multi-branch support
- Real multi-tenant isolation
- Mobile applications

---

# 👥 5. Actors & Roles

| Role     | Responsibilities                 |
| -------- | -------------------------------- |
| ADMIN    | Full platform administration     |
| CASHIER  | Payments, invoices, cash closing |
| WAITER   | Orders and table management      |
| DELIVERY | Delivery & pickup registration   |
| KITCHEN  | Kitchen ticket visualization     |

---

# 🏗 6. Architecture Overview

Current architecture style:

- Modular Monolith
- Domain-Oriented Modules
- API-First Backend
- SaaS-ready structure
- Cloud-ready deployment

Main modules:

- Auth
- Users
- Orders
- Menu
- Payments
- Reports
- Tables
- Delivery
- Sales
- Restaurant

---

# ⚙️ 7. Technology Stack

| Layer           | Technology        |
| --------------- | ----------------- |
| Backend         | NestJS            |
| Language        | TypeScript        |
| ORM             | Prisma ORM        |
| Database        | PostgreSQL        |
| Security        | JWT + RBAC        |
| Validation      | DTO Validation    |
| Documentation   | Swagger/OpenAPI   |
| Containers      | Docker            |
| Cloud Target    | AWS               |
| Deployment      | Railway / AWS ECS |
| Future Frontend | Next.js           |

---

# 📂 8. Project Structure

```text
backend/api/
│
├── prisma/
│
├── src/
│   ├── common/
│   ├── config/
│   ├── infrastructure/
│   ├── interfaces/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── reports/
│   │   ├── menu/
│   │   ├── delivery/
│   │   ├── sales/
│   │   ├── tables/
│   │   └── restaurant/
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── docker/
├── docs/
└── README.md
```

---

# 📖 9. Documentation Index

| Documentation         | Path                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- |
| Functional Scope      | [functional/functional-scope.md](./docs/functional/functional-scope.md)             |
| Business Rules        | [functional/business-rules.md](./docs/functional/business-rules.md)                 |
| User Stories          | [functional/user-stories.md](./docs/functional/user-stories.md)                     |
| StoryMap              | [functional/storymap.md](./docs/functional/storymap.md)                             |
| Actors Vision & Scope | [functional/vision_alcance_actores.md](./docs/functional/vision_alcance_actores.md) |
| C4 Context Diagram    | [architecture/c4-context.md](./docs/architecture/c4-context.md)                     |
| C4 Container Diagram  | [architecture/c4-container.md](./docs/architecture/c4-container.md)                 |
| Time line Diagram     | [time-line.md](./docs/architecture/time-line.md.md)                                 |
| Deployment AWS        | [architecture/deployment-aws.md](./docs/architecture/deployment-aws.md)             |
| Domain Model          | [architecture/domain-model.md](./docs/architecture/domain-model.md)                 |
| Runtime View          | [architecture/runtime-view.md](./docs/architecture/runtime-view.md)                 |
| Security Baseline     | [architecture/security-baseline.md](./docs/architecture/security-baseline.md)       |
| ER Diagram            | [architecture/er-diagram.md](./docs/architecture/er-diagram.md)                     |

---

# 🧾 10. Architecture Decision Records (ADR)

| ADR                              | Description                         |
| -------------------------------- | ----------------------------------- |
| [ADR-000](./docs/ADR/ADR-000.md) | ADR Index & Architecture Governance |
| [ADR-001](./docs/ADR/ADR-001.md) | Modular Monolith Architecture       |
| [ADR-002](./docs/ADR/ADR-002.md) | NestJS Backend Framework            |
| [ADR-003](./docs/ADR/ADR-003.md) | Prisma ORM                          |
| [ADR-004](./docs/ADR/ADR-004.md) | PostgreSQL Database                 |
| [ADR-005](./docs/ADR/ADR-005.md) | JWT + RBAC Security                 |
| [ADR-006](./docs/ADR/ADR-006.md) | Dockerized Development              |
| [ADR-007](./docs/ADR/ADR-007.md) | Swagger/OpenAPI                     |
| [ADR-008](./docs/ADR/ADR-008.md) | SaaS Architecture                   |
| [ADR-009](./docs/ADR/ADR-009.md) | Domain Separation                   |
| [ADR-010](./docs/ADR/ADR-010.md) | DTO Validation                      |
| [ADR-011](./docs/ADR/ADR-011.md) | AWS Deployment Strategy             |
| [ADR-012](./docs/ADR/ADR-012.md) | Config Management                   |
| [ADR-013](./docs/ADR/ADR-013.md) | Guards & Decorators                 |
| [ADR-014](./docs/ADR/ADR-014.md) | Reporting Module                    |
| [ADR-015](./docs/ADR/ADR-015.md) | Future Integrations                 |
| [ADR-016](./docs/ADR/ADR-016.md) | Multi-Tenant Preparation            |

---

# ☁️ 11. Deployment Strategy

Current:

- Local Docker Environment

Target:

- AWS ECS
- AWS RDS PostgreSQL
- AWS CloudWatch
- AWS Load Balancer
- CI/CD Pipelines

---

# 🔐 12. Security

Implemented:

- JWT Authentication
- Role-Based Authorization
- Protected Endpoints
- DTO Validation
- Guards
- Decorators

Future:

- API Gateway
- WAF
- Audit Logs
- Security Monitoring

---

# 📊 13. Current MVP Status

| Area             | Status      |
| ---------------- | ----------- |
| Backend API      | Completed   |
| Swagger          | Completed   |
| RBAC             | Completed   |
| Prisma ORM       | Completed   |
| Docker           | Completed   |
| Reports          | In Progress |
| AWS Deployment   | Planned     |
| DIAN Integration | Future      |
| MercadoPago      | Future      |

---

# 🚀 14. Future Roadmap

Phase 1:

- Production deployment
- Reports & analytics
- Infrastructure stabilization

Phase 2:

- Factus integration
- MercadoPago
- WhatsApp notifications

Phase 3:

- Multi-tenant architecture
- Multi-branch support
- Analytics dashboards
- Mobile app

---

# 🐳 15. Local Development

## Install dependencies

```bash
npm install
```

## Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

## Docker

```bash
docker-compose up --build
```

## Run backend

```bash
npm run start:dev
```

---

# 🌎 16. Final Architecture Vision

NanaBurguer aims to evolve into a fully scalable SaaS ecosystem capable of supporting multiple restaurants under a centralized cloud infrastructure with isolated tenant operations and enterprise-grade architecture.
