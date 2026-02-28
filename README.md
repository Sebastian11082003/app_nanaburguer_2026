# 🍔 NanaBurguer 2026

Restaurant Operations System (Single-Tenant MVP, SaaS-Ready)

---

## 📌 Overview

NanaBurguer is a cloud-based restaurant operations platform designed to manage:

- Dine-in orders (tables)
- Delivery & pickup orders
- Order lifecycle management
- Cashier closure
- WhatsApp notifications
- AWS deployment with Docker

Built using a Modular Monolith + Clean Architecture approach.

---

## 🏗 Architecture

- Clean Architecture (Domain / Application / Infrastructure / Interfaces)
- Modular Monolith
- Dockerized production deployment
- Nginx Reverse Proxy
- AWS EC2 + RDS

See `/docs/architecture` for diagrams.

---

## 🛠 Tech Stack

### Backend
- Node.js
- NestJS
- Prisma ORM
- PostgreSQL (AWS RDS)
- JWT Authentication
- Docker

### Frontend
- Ionic (Web + Mobile)
- Angular
- i18n (EN / ES)

### DevOps
- Docker Compose
- Nginx
- GitHub Actions (CI/CD)
- AWS EC2
- AWS RDS
- CloudWatch

---

## 🔐 Security

- JWT authentication
- Role-based access control (RBAC)
- Rate limiting (Nginx)
- Secure headers
- Environment-based secrets

See `/docs/architecture/security-baseline.md`.

---

## 🌍 Internationalization

- Default language: English
- Optional: Spanish
- Backend returns stable codes
- UI handles translations

---

## 📊 Core Features (MVP)

- Authentication (Admin / Cashier / Waiter)
- Menu management
- Table management
- Create and update orders
- Order status lifecycle
- Close order with payment method
- Integration-ready architecture (WhatsApp / Siigo)

---

## 🚀 Deployment

Production architecture:

- EC2 (Docker)
- Nginx Reverse Proxy
- RDS PostgreSQL
- HTTPS

See `/docs/architecture/deployment-aws.md`.

---

## 📈 Roadmap

- Public ordering web
- WhatsApp confirmation automation
- Basic analytics dashboard
- SaaS multi-tenant evolution (Phase 2)

---

## 📄 Documentation

Full architecture documentation is available in:
