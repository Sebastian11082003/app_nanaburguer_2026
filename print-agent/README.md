# RestoOS Print Agent (Phase 2 — scaffold)

Local bridge between the RestoOS web app and a USB ESC/POS thermal
printer (Digital POS D300 / D200, 80mm).

## Status

Scaffold only. The web app currently prints comandas via the browser
(`KitchenTicket`). This agent will:

1. Run on the restaurant POS PC (Windows).
2. Expose `POST http://127.0.0.1:9100/print` with ESC/POS payload or
   structured ticket JSON.
3. Talk to the printer over USB using `node-escpos` (or equivalent).

## Planned next steps

- [ ] `npm init` + Express (or Fastify) listener on localhost only
- [ ] ESC/POS renderer for kitchen ticket + invoice
- [ ] Frontend toggle: browser print vs local agent
- [ ] Auto-discovery / health check from the admin Settings page

Do not expose this agent on the public network.
