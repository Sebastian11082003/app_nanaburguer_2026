# Functional Scope

---

# Project Overview

NanaBurguer is a multi-role restaurant operations SaaS platform designed to centralize restaurant workflows including dine-in orders, delivery management, pickup orders, payments, reports, and operational administration.

The system follows a modular monolith architecture using Clean Architecture principles and is designed for future SaaS scalability.

---

# Current MVP Scope

The MVP includes:

- User authentication and authorization
- Role-based access control
- User management
- Menu and category management
- Dine-in order management
- Delivery order management
- Pickup order management
- Kitchen ticket generation
- Payment processing
- POS receipt generation
- Daily cash register closing
- Operational reports
- Shared database tenant strategy

---

# User Roles

## Admin

Full system access.

Responsibilities:

- Manage users
- Assign roles
- Manage menu
- Manage categories
- View reports
- Authorize item cancellations
- Configure restaurant operations

---

## Cashier

Responsible for sales and payment operations.

Responsibilities:

- Create orders
- Register payments
- Close orders
- Generate receipts
- Perform daily cash closing

---

## Waiter

Responsible for dine-in customer operations.

Responsibilities:

- Create table orders
- Send orders to kitchen
- Move orders between tables

---

## Delivery

Responsible for delivery and pickup operations.

Responsibilities:

- Register delivery orders
- Register pickup orders
- Update delivery order states

---

## Kitchen

Receives kitchen tickets for food preparation.

Responsibilities:

- Receive kitchen orders
- Print kitchen tickets

---

# Order Types

The platform supports:

- DINE_IN
- DELIVERY
- PICKUP

---

# Payment Methods

The platform supports:

- Cash
- Card
- Transfer

---

# Reports Included

- Daily sales reports
- Monthly sales reports
- Delivery reports
- Pickup reports
- Payment method reports
- Best selling products
- Orders by status
- Daily cash closing reports

---

# Current Technical Limitations

The current MVP does not include:

- Inventory management
- Multi-branch management
- Real electronic billing
- Customer mobile applications
- Online payments
- Advanced kitchen workflow
- Real-time notifications

---

# Planned Future Features

Planned future integrations include:

- DIAN electronic billing
- WhatsApp notifications
- MercadoPago integration
- Push notifications
- Cloud storage integration
- Multi-branch support
- Subdomain-based tenant isolation

---

# Architecture Summary

The system is implemented as a modular monolith using Clean Architecture principles.

Current architecture includes:

- Shared database strategy
- JWT authentication
- RBAC authorization
- Prisma ORM
- REST API architecture
- AWS deployment readiness

---

# Deployment Environment

The platform is designed for AWS deployment and future SaaS scalability.
