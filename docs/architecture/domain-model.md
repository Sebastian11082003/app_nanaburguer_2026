# Domain Model (Conceptual)

## Purpose
Define the core business concepts (entities, aggregates, invariants) for the MVP:
- Dine-in (tables)
- Delivery
- Pickup
- Cashier close sale

---

## Core Aggregates

### 1) Order Aggregate (Root: Order)
**Why an aggregate?** Orders are transactional and must maintain strict consistency:
- items, totals, status transitions, close sale

**Entities inside**
- Order (aggregate root)
- OrderItem (child entity)
- OrderStatusHistory (optional in MVP but recommended)

**Key fields**
- type: DINE_IN | DELIVERY | PICKUP
- status: CREATED | IN_PREPARATION | READY | OUT_FOR_DELIVERY | DELIVERED | CLOSED | CANCELED
- money: subtotal, taxes, total (server-calculated)
- customer snapshot (for delivery/pickup): name, phone, address
- audit: createdBy, updatedBy, timestamps

**Invariants**
- Totals are calculated server-side; client totals are never trusted.
- Status transitions follow an allowed transition map.
- CLOSED orders cannot be modified (except admin correction flow if later).
- DELIVERY requires address and phone.
- DINE_IN requires table assignment (tableId not null).
- Order must have at least one OrderItem.

---

### 2) Menu Aggregate (Root: MenuItem)
- Category (grouping)
- MenuItem (product)
- Price and availability

**Invariants**
- Price must be positive.
- MenuItem can be disabled (soft availability).

---

### 3) Table Aggregate (Root: Table)
- Table number/name
- Status: AVAILABLE | OCCUPIED (optional) | RESERVED (future)

**Invariants**
- A table can have multiple orders over time.
- For MVP, you may allow multiple open orders per table or restrict to one (decide later).

---

### 4) User / Auth Aggregate
- Users with roles: ADMIN | CASHIER | WAITER
- Authentication handled by Auth module
- Authorization enforced at use-case level

---

## Conceptual Relationships
- User creates/updates Orders.
- Orders contain OrderItems.
- OrderItems reference MenuItems.
- DINE_IN Orders are linked to Tables.
- DELIVERY/PICKUP Orders store customer snapshot.
---



## Mermaid Diagram (Conceptual)

```mermaid

flowchart TB

  %% Auth Aggregate
  subgraph Auth["Auth Aggregate"]
    User[User]
    Role[Role - ADMIN / CASHIER / WAITER]
  end

  %% Menu Aggregate
  subgraph Menu["Menu Aggregate"]
    Category[Category]
    MenuItem[MenuItem]
  end

  %% Tables Aggregate
  subgraph Tables["Table Aggregate"]
    Table[Table]
  end

  %% Orders Aggregate
  subgraph Orders["Order Aggregate"]
    Order[Order]
    OrderItem[OrderItem]
    Payment[Payment]
    StatusHistory[OrderStatusHistory]
  end

  %% Relationships
  User --> Order
  Role --> User

  Category --> MenuItem

  Order --> OrderItem
  OrderItem --> MenuItem

  Table --> Order

  Order --> Payment
  Order --> StatusHistory