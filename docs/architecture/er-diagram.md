

```markdown
# ER Diagram (MVP)

## Purpose
Define the database model for Prisma/PostgreSQL. This is the physical view that supports the domain model.

---
```
## Mermaid ER Diagram

```mermaid
erDiagram
  USER {
    uuid id PK
    string email "unique"
    string password_hash
    string role "ADMIN|CASHIER|WAITER"
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  CATEGORY {
    uuid id PK
    string name
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  MENU_ITEM {
    uuid id PK
    uuid category_id FK
    string name
    string description
    int price_cents
    boolean is_available
    datetime created_at
    datetime updated_at
  }

  TABLE_ENTITY {
    uuid id PK
    string label "e.g., T1, Table 7"
    int capacity
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  ORDER_ENTITY {
    uuid id PK
    string type "DINE_IN|DELIVERY|PICKUP"
    string status "CREATED|IN_PREPARATION|READY|OUT_FOR_DELIVERY|DELIVERED|CLOSED|CANCELED"
    uuid table_id FK "nullable for non-dine-in"
    string customer_name "nullable"
    string customer_phone "nullable"
    string delivery_address "nullable"
    int subtotal_cents
    int tax_cents
    int total_cents
    uuid created_by FK
    uuid updated_by FK
    datetime created_at
    datetime updated_at
    datetime closed_at "nullable"
  }

  ORDER_ITEM {
    uuid id PK
    uuid order_id FK
    uuid menu_item_id FK
    int quantity
    int unit_price_cents
    int line_total_cents
    string notes "nullable"
    datetime created_at
  }

  PAYMENT {
    uuid id PK
    uuid order_id FK "unique (1:1 for MVP)"
    string method "CASH|CARD|TRANSFER|OTHER"
    int amount_cents
    string currency "COP"
    datetime paid_at
    uuid created_by FK
  }

  ORDER_STATUS_HISTORY {
    uuid id PK
    uuid order_id FK
    string from_status
    string to_status
    uuid changed_by FK
    datetime changed_at
  }

  %% Relationships
  CATEGORY ||--o{ MENU_ITEM : contains
  TABLE_ENTITY ||--o{ ORDER_ENTITY : assigned_to
  USER ||--o{ ORDER_ENTITY : creates
  USER ||--o{ ORDER_STATUS_HISTORY : changes
  ORDER_ENTITY ||--o{ ORDER_ITEM : has
  MENU_ITEM ||--o{ ORDER_ITEM : referenced_by
  ORDER_ENTITY ||--|| PAYMENT : closed_with
  ORDER_ENTITY ||--o{ ORDER_STATUS_HISTORY : tracks