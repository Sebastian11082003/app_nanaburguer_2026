# Roadmap profesional — módulos posteriores del POS

**Clase de producto (DEC-008 / ADR-024):** RestoOS es un **POS SaaS**
(tipo Loggro Restobar). No es un ERP. Este backlog lista *módulos
opcionales* (caja avanzada, inventario, facturación), no un cambio de
categoría.

Fuente: feedback de product owner + revisión con colega senior (ago 2026).
Objetivo: profundizar el POS (más locales / verticales gastronómicas),
sin convertirlo en ERP, nómina ni software administrativo de Pyme.

La impresora térmica sigue siendo **última** en la cola de hardware.

---

## Veredicto honesto del estado actual

Hoy el producto cubre bien el **ciclo operativo diario**:

mesas → órdenes → cocina → cobro → factura snapshot → reportes básicos →
roles/permisos → delivery.

Eso cubre el **ciclo operativo diario**. Inventario o facturación
electrónica, si se piden, son módulos de un Restobar — no un ERP.

---

## Capas que faltan (prioridad de negocio)

### P0 — Caja y movimientos (base de contabilidad operativa)

| Capacidad | Por qué importa |
|-----------|-----------------|
| Ingresos / egresos tipados (no solo pago de venta) | Compra de insumos, propinas retiradas, gastos del día |
| Apertura / cierre de caja con arqueo | Cuadrar efectivo vs sistema |
| Multi-caja / multi-turno | Escalabilidad a locales con varias estaciones |
| Conciliación de métodos de pago | Efectivo vs tarjeta vs transferencia |

*Hoy (v0.5.0):* `CashSession` + movimientos tipados + arqueo ✅  
Docs: `docs/ops/cash-sessions.md`, `docs/ADR/ADR-021.md`.  
Pendiente futuro: multi-caja / multi-turno paralelo.

### P0 — Inventario y costos

| Capacidad | Por qué importa |
|-----------|-----------------|
| Insumos / recetas (BOM) por producto | Saber costo real de un plato |
| Kardex / movimientos de stock | Entradas, salidas, mermas, ajustes |
| Costos al por mayor / proveedores | Precio de compra ≠ precio de venta |
| Alertas de stock mínimo | Evitar quiebres en servicio |
| Margen por producto / categoría | Decisiones de menú basadas en datos |

*Hoy (v0.5.1):* insumos + BOM + kardex + consumo al cerrar + margen
por última compra ✅ — sin proveedores/OC formales aún.  
Docs: `docs/ops/inventory.md`, `docs/ADR/ADR-022.md`.

### P0 — Facturación avanzada

| Capacidad | Por qué importa |
|-----------|-----------------|
| Anulación / nota crédito de facturas | Errores, devoluciones, cumplimiento |
| Facturas a crédito (cuenta por cobrar) | Clientes corporativos / fiados controlados |
| Estados fiscales (borrador, emitida, anulada, NC) | Contabilidad y DIAN/Factus a futuro |
| Numeración legal / resoluciones | Requisitos Colombia |

*Hoy (v0.5.2):* anulación + NC + CREDIT/CxC ✅ — sin DIAN real ni resoluciones.  
Docs: `docs/ops/advanced-invoicing.md`, `docs/ADR/ADR-023.md`.

### P1 — Contabilidad (libro mayor ligero o exportación)

| Capacidad | Por qué importa |
|-----------|-----------------|
| Plan de cuentas simplificado (ingresos, costos, gastos, IVA) | Hablar el idioma del contador |
| Asientos automáticos desde ventas/compras/caja | Menos digitación manual |
| Exportación CSV / Contai / Siigo / etc. | Integración, no convertir el POS en ERP |
| Pérdidas y ganancias por período | Dashboard financiero real |

No hace falta un ERP. Si un contador pide trazabilidad, se exporta;
no se reconstruye Siigo dentro de RestoOS.

### P1 — Compras y proveedores

Órdenes de compra → recepción → factura de proveedor → impacto en
inventario y cuentas por pagar.

### P2 — Multi-sucursal / multi-vertical

Misma plataforma, configuración por tipo de negocio (restobar vs dark kitchen
vs panadería): impuestos, unidades de medida, recetas, mesas opcionales.

### Diferidos (ya acordados)

- Metas de venta, menú digital, CRM profundo
- Impresora térmica USB (último)
- Factus / DIAN electrónico (después de ciclo de vida de factura sólido)

---

## Orden de fases propuesto (post-MVP operativo)

1. **Caja profesional** — sesión, arqueo, egresos/ingresos tipados ✅ v0.5.0  
2. **Inventario + costos + recetas** — margen real ✅ v0.5.1  
3. **Facturación avanzada** — anulación, NC, crédito / CxC ✅ v0.5.2  
4. **Compras / proveedores** ← siguiente  
5. **Exportación contable + P&L**  
6. **Hardware impresión** (último)  
7. **Facturación electrónica DIAN/Factus**

Cada fase: modelo de datos → API → UI admin → tests → smoke staging
→ **documentación obligatoria** (ver checklist abajo).

---

## Documentación obligatoria (pedido explícito del PO)

Ninguna fase de inventario / costos / facturación / contabilidad se marca
cerrada sin actualizar docs. Checklist:

→ `docs/ops/documentation-checklist-financial.md`

Borrador inventario (rellenar al implementar):

→ `docs/functional/inventory-costs-spec.md`

---

## Qué NO hacer ahora

- No mezclar impresora con módulos financieros.
- No copiar Loggro visualmente; sí cubrir **capacidades** de un Restobar.
- No construir un ERP. Inventario o facturas, si se priorizan, siguen
  siendo módulos de POS.

---

## Preguntas abiertas para el product owner

1. ¿Prioridad inmediata: **caja/arqueo** o **inventario/costos**?  
2. ¿Facturación electrónica (DIAN) es requisito legal en el primer piloto?  
3. ¿Multi-sucursal en el mismo tenant o un restaurante = un tenant por ahora?
