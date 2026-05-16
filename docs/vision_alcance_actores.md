# Actors Vision & Scope

# 📌 Objective

Clearly define the actors interacting with NanaBurger SaaS, including their responsibilities, functional scope, and operational restrictions.

---

# 👥 System Actors

| Actor         | Type            |
| ------------- | --------------- |
| Administrator | Internal        |
| Cashier       | Internal        |
| Waiter        | Internal        |
| Delivery      | Internal        |
| Kitchen       | Internal        |
| Customer      | Future External |

---

# 🧠 Administrator (ADMIN)

## Description

User with full system access responsible for overall platform configuration and administration.

## Responsibilities

- Create users
- Edit users
- Disable users
- Assign roles
- Manage menu
- Manage categories
- Access reports
- Configure restaurant
- Supervise sales
- Reset passwords
- Full module access

## Restrictions

None.

## Access Level

FULL ACCESS

---

# 💰 Cashier (CASHIER)

## Description

Responsible for restaurant financial operations and sales closing.

## Responsibilities

- Process payments
- Generate POS invoices
- Close cash register
- Register payments
- Manage pickup orders
- Manage delivery orders
- View sales reports

## Restrictions

- Cannot manage users
- Cannot modify global configuration

## Access Level

FINANCIAL OPERATIONS

---

# 🍽 Waiter (WAITER)

## Description

Responsible for table service and order management.

## Responsibilities

- Create orders
- Assign orders to tables
- Transfer tables
- Add products to orders
- Send orders to kitchen

## Restrictions

- Cannot process payments
- Cannot close cash register
- Cannot modify menu
- Cannot cancel orders without ADMIN authorization

## Access Level

RESTAURANT OPERATIONS

---

# 🛵 Delivery

## Description

Responsible for registering delivery and pickup orders.

## Responsibilities

- Register delivery orders
- Register pickup orders
- View active orders

## Restrictions

- Does not manage deliveries
- Does not update logistics statuses
- Does not manage payments

## Access Level

DELIVERY OPERATIONS

---

# 👨‍🍳 Kitchen (KITCHEN)

## Description

Actor responsible only for viewing kitchen orders.

## Responsibilities

- View incoming orders
- View active kitchen tickets

## Restrictions

- Cannot modify orders
- Cannot manage sales
- Cannot manage payments

## Access Level

OPERATIONAL VIEW ONLY

---

# 👤 Customer (Future)

## Status

Not implemented in current MVP.

## Future Features

- Online ordering
- Online payments
- Order tracking
- MercadoPago integration
- Public landing page

---

# 📌 Current MVP Scope

## Included

- Restaurant POS
- Table management
- Order management
- Manual delivery registration
- POS invoicing
- Reports
- JWT security
- Swagger documentation

## Not Included

- DIAN electronic invoicing
- External integrations
- Multi-branch support
- Full multi-tenant architecture
- Mobile application
- Online payments

---

# 🎯 Strategic Goal

Build a scalable SaaS platform for restaurants capable of evolving from an operational MVP into an enterprise-grade multi-tenant cloud solution.
