# Internationalization Strategy (Multi-Tenant SaaS)

## 🌍 Scope

- **Backend (API):** English only (machine-readable)
- **Frontend (Web + Mobile):** Multi-language (EN default, ES supported)
- **Per-tenant customization supported (future-ready)**

---

# 🧠 Core Principles

1. Backend NEVER returns translated messages.
2. Backend returns stable, machine-readable `code`.
3. Frontend maps `code → translation key`.
4. Same `code` must work across:
   - REST responses
   - WebSocket events
   - Logs
5. Codes are immutable once published.

---

# 🧩 Response Structure

## ✅ Success Response

```json
{
  "code": "ORDER_CREATED",
  "data": {
    "orderId": "abc123"
  }
}
```

```json
{
  "code": "ORDER_INVALID_STATUS_TRANSITION",
  "error": {
    "details": "Cannot move from READY to CREATED"
  }
}
```

```json
{
  "code": "ORDER_READY",
  "data": {
    "orderId": "abc123"
  }
}
```
