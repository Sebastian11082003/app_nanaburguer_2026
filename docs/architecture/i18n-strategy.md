
---

## ✅ `/docs/architecture/i18n-strategy.md`

```markdown
# Internationalization Strategy (EN/ES)

## Scope
- **Documentation and codebase:** English.
- **User Interface (Ionic Web + Mobile):** English (default) + Spanish toggle.

## Design Principles
1. Backend does not return localized UI messages.
2. Backend returns stable machine-readable `code` fields.
3. Frontend maps `code` → translation keys.
```
### Example API Response
```json
{
  "code": "ORDER_CREATED",
  "data": { "orderId": "abc123" }
}