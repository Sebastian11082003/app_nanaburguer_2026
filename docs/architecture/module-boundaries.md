
---

## ✅ `/docs/architecture/module-boundaries.md`

```markdown
# Module Boundaries (Backend)

## Purpose
Define clear module ownership to enforce SOLID and prevent god-modules.
```
---

## Modules (NestJS)

### 1) Auth Module
**Owns**
- User authentication (login/register)
- JWT issuing/verification
- Password hashing
- RBAC guards (role checks)

**Does NOT own**
- Order logic
- Menu logic

---

### 2) Users Module
**Owns**
- User CRUD (Admin only)
- Activate/deactivate users
- Role assignment

---

### 3) Menu Module
**Owns**
- Category CRUD
- MenuItem CRUD
- Availability toggling
- Pricing rules (price > 0)

---

### 4) Tables Module
**Owns**
- Table CRUD
- Table activation/deactivation
- Optional occupancy logic (future)

---

### 5) Orders Module (Core)
**Owns**
- Create order (dine-in, delivery, pickup)
- Add/remove/update items
- Calculate totals server-side
- Status transitions + transition validation
- Close sale + Payment record
- Audit + optional status history

**Does NOT own**
- WhatsApp/Siigo protocol details (delegates to Integrations)

---

### 6) Integrations Module
**Owns**
- WhatsApp adapter (best-effort notifications)
- Siigo adapter (future, async outbox)
- Retry logic and integration states (PENDING/SENT/FAILED) when implemented

---

## Clean Architecture Mapping

### Domain
- Entities: Order, OrderItem, MenuItem, Category, Table, Payment
- Value Objects (optional): Money, PhoneNumber
- Business rules: status transitions map, totals rules

### Application
- Use Cases: CreateOrder, UpdateOrderStatus, CloseOrder, ManageMenuItems, etc.
- Ports (interfaces): OrderRepository, MenuRepository, TableRepository, NotificationPort

### Infrastructure
- Prisma implementations of repositories
- External HTTP clients for WhatsApp/Siigo
- Config loading

### Interfaces
- Controllers
- DTO validation
- Guards

---

## Cross-Cutting Rules
- Controllers are thin. No business logic.
- Use cases enforce business rules.
- Infrastructure depends on Application; Application depends on Domain.
- No direct Prisma calls inside controllers.