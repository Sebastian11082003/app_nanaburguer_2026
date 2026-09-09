# Backlog operativo (NanaBurguer / RestoOS)

Fuente viva del trabajo pendiente. GitHub Projects **no existe** todavía en esta cuenta (`projectsV2` vacío) y este agente **no puede crear** Project ni Issues (token de GitHub de solo lectura).

Para tener el tablero en GitHub:

1. En el repo: **Projects → New project** (tabla o board).
2. Activa **Issues** si están apagadas (Settings → Features).
3. Crea un issue por fila de abajo, o pega el título en el Project.

Rama de integración: `dev`.

## Ahora (turno / piloto local)

| ID | Estado | Qué |
|---|---|---|
| OPS-01 | hecho v0.4.56 | Liberar mesa vacía post-cocina; KDS sin tickets a $0; transferir mesa desde caja |
| OPS-02 | hecho v0.4.57 | Editar hora de recoger con el ticket ya en cocina |
| OPS-03 | hecho v0.4.57 | Tras cobrar, abrir recibo imprimible (caja y admin) |
| OPS-04 | hecho v0.4.57 | Aviso si se cobra sin turno de caja abierto (no bloquea) |
| OPS-05 | pendiente | ¿Exigir turno de caja abierto para cobrar? (hoy solo aviso) |
| OPS-06 | decidir | ¿El mesero cancela ítem después de cocina, o solo caja/admin? |
| OPS-07 | hecho v0.4.58 | Recibos en el chrome de caja (lista + imprimir, sin pasar por admin) |

## Después del piloto (no inventar ahora)

| ID | Qué | Por qué no ahora |
|---|---|---|
| OUT-01 | Inventario / recetas / stock | Fuera del MVP escrito |
| OUT-02 | Factus / DIAN real | HU-026 Planned |
| OUT-03 | Impresora térmica ESC/POS | Hoy `window.print()` |
| OUT-04 | Rappi / QR / Nequi / pagos online | Fuera de alcance |
| OUT-05 | WhatsApp / push | HU-027 |

## Plataforma

| ID | Qué |
|---|---|
| PLAT-01 | GitHub Project + Issues como tablero (hace falta permiso write) |
| PLAT-02 | VPS + DNS + secretos reales |
| PLAT-03 | Issues deshabilitadas o vacías en el repo hoy |
