# Security Baseline (Multi-Tenant SaaS)

## Purpose

Define the minimum security posture for a production-ready multi-tenant SaaS platform.

---

# CORE PRINCIPLE

Tenant isolation is mandatory.

- Every request MUST include `restaurant_id`
- No cross-tenant data access is allowed
- All queries MUST be scoped by tenant

---

# 1. Authentication

- JWT-based authentication
- Password hashing (bcrypt or argon2)

## JWT Payload (REQUIRED)

{
"userId": "uuid",
"role": "ADMIN | CASHIER | WAITER",
"restaurant_id": "uuid"
}

## Rules

- Access tokens must be short-lived (15 minutes)
- Refresh tokens recommended for production
- Tokens MUST always include tenant context

---

# 2. Authorization (RBAC)

## Roles

- ADMIN
- CASHIER
- WAITER
- KITCHEN (optional but recommended)

## Rules

- All permissions are tenant-scoped
- No cross-tenant access allowed

## Permissions Matrix

| Action                | Role             |
| --------------------- | ---------------- |
| Create Order          | WAITER           |
| Update Order          | WAITER           |
| Kitchen Status Update | KITCHEN / WAITER |
| Close Sale            | CASHIER          |
| Manage Menu           | ADMIN            |
| Manage Users          | ADMIN            |

---

# 3. Multi-Tenant Isolation (CRITICAL)

## Rules

- Every database query MUST include:
  WHERE restaurant_id = ?

- Tenant must be resolved from JWT and injected into request context

## Forbidden Pattern

SELECT \* FROM orders;

## Correct Pattern

SELECT \* FROM orders WHERE restaurant_id = ?;

---

# 4. External API Security (Factus)

## Rules

- Each restaurant has its own Factus credentials
- Credentials must be securely stored
- Never expose credentials to frontend

## Flow

1. Load credentials per tenant
2. Call Factus securely
3. Store response (CUFE, status)

---

# 5. Input Validation

- Use DTO validation (class-validator)
- Validate:
  - phone numbers
  - addresses
  - quantities
  - enums (status/type)

## Rule

- Never trust client totals
- All monetary values must be calculated server-side

---

# 6. CORS

- Allow only trusted domains
- Separate:
  - Admin panel
  - Public ordering

---

# 7. Rate Limiting

- Apply rate limiting at Nginx level
- Optional: NestJS throttler

---

# 8. Security Headers

- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Basic Content-Security-Policy

---

# 9. Database Security

- Use AWS RDS
- Restrict inbound access (only backend)
- Use private subnet if possible
- Enable automatic backups
- Apply migrations via CI/CD

---

# 10. WebSocket Security

## Rules

- JWT required on connection
- Validate restaurant_id
- Only emit events to same tenant

## Example

- Order READY → only that restaurant receives event

---

# 11. Logging & Audit

## Must Log

- requestId
- userId
- restaurant_id
- action
- result

## Order Tracking

- created_by / updated_by
- timestamps
- status history

---

# 12. Threats & Mitigations

## SQL Injection

- Use Prisma (parameterized queries)
- Avoid raw queries

## Broken Access Control

- Enforce RBAC + tenant filtering

## Data Leakage

- Always filter by restaurant_id

## Secrets Leakage

- .env never committed
- Use secure secret storage

## DoS Attacks

- Rate limiting
- Security groups
- Reverse proxy

---

# FINAL RULE

If a request does NOT validate tenant context → REJECT immediately.
