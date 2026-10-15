# Module Boundaries (Backend - Multi-Tenant SaaS)

## Purpose

Define clear module ownership enforcing:

- Clean Architecture
- Multi-tenant isolation
- Domain separation (Order vs Sale vs Invoice)
- Scalability for SaaS

---

# 🧠 GLOBAL RULE

All modules MUST be tenant-aware:

- Every request includes `restaurant_id`
- All repositories filter by tenant
- No cross-tenant data access

---

# 🧩 MODULES (NestJS)

---

## 1) Auth Module

### Owns

- Authentication (login)
- JWT issuing (includes `restaurant_id`)
- Password hashing

### Does NOT own

- Business logic
- Tenant resolution logic (delegated)

---

## 2) Users Module

### Owns

- User CRUD
- Role assignment (ADMIN, CASHIER, WAITER)
- Activation/deactivation

### Rules

- Users belong to ONE restaurant
- No cross-tenant user access

---

## 3) Restaurant Module (NEW - CRITICAL)

### Owns

- Tenant configuration
- Factus credentials
- Business info (name, NIT, etc.)

### Why it exists

👉 This is the ROOT of SaaS

---

## 4) Menu Module

### Owns

- Category CRUD
- MenuItem CRUD
- Availability
- Pricing rules

### Rules

- All menu items are tenant-scoped

---

## 5) Tables Module

### Owns

- Table CRUD
- Table assignment
- Optional occupancy logic

---

## 6) Orders Module (Operational Core)

### Owns

- Create Order
- Manage OrderItems
- Status transitions:
  - CREATED
  - SENT_TO_KITCHEN
  - IN_PREPARATION
  - READY
  - DELIVERED

### Does NOT own

- Payments
- Invoicing

---

## 7) Kitchen Module (NEW - CRITICAL)

### Owns

- Kitchen state transitions:
  - SENT_TO_KITCHEN
  - IN_PREPARATION
  - READY
- Kitchen display logic (KDS)
- Printer integration trigger

### Why it exists

👉 Separates operational flow from UI

---

## 8) Sales Module (NEW - CRITICAL)

### Owns

- Create Sale from Order
- Payment processing
- Closing financial transaction

### Rules

- One Sale per Order
- Immutable after closing

---

## 9) Payments Module

### Owns

- Payment records
- Payment validation

---

## 10) Invoice Module (Factus)

### Owns

- Electronic invoicing
- Factus integration
- CUFE storage
- Invoice status:
  - PENDING
  - ACCEPTED
  - REJECTED

### Rules

- Invoice is optional
- Depends on Sale

---

## 11) Integrations Module

### Owns

- WhatsApp adapter (notifications)
- External API abstraction

### Does NOT own

- Business logic

---

# 🧠 CLEAN ARCHITECTURE MAPPING

---

## Domain Layer

- Entities:
  - Restaurant
  - Order
  - OrderItem
  - Sale
  - Payment
  - Invoice
  - User
  - MenuItem
  - Table

- Business rules:
  - Order lifecycle
  - Sale invariants
  - Invoice rules

---

## Application Layer

- Use Cases:
  - CreateOrder
  - SendToKitchen
  - UpdateKitchenStatus
  - CloseSale
  - CreateInvoice

- Interfaces (Ports):
  - OrderRepository
  - SaleRepository
  - InvoiceRepository
  - NotificationPort

---

## Infrastructure Layer

- Prisma repositories (tenant-aware)
- Factus HTTP client
- WhatsApp adapter
- Queue / retry system

---

## Interface Layer

- Controllers
- DTOs
- Guards (JWT + tenant validation)

---

# 🔐 CROSS-CUTTING RULES

- Controllers MUST be thin
- No business logic outside Use Cases
- All queries include `restaurant_id`
- No direct Prisma usage in controllers
- Tenant isolation is mandatory
