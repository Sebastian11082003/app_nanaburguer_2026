/**
 * Minimal ESC/POS for 80mm (Font A, 48 columns). Spanish via CP850.
 * Epson-compatible: Digital POS D300/D200 and most POS-80 USB printers.
 */

const COLS = 48;

const CP850 = {
  Á: 0xb5,
  É: 0x90,
  Í: 0xd6,
  Ó: 0xe0,
  Ú: 0xe9,
  Ñ: 0xa5,
  Ü: 0x9a,
  á: 0xa0,
  é: 0x82,
  í: 0xa1,
  ó: 0xa2,
  ú: 0xa3,
  ñ: 0xa4,
  ü: 0x81,
  "°": 0xf8,
  "¿": 0xa8,
  "¡": 0xad,
};

function encode(text) {
  const chars = String(text ?? "");
  const out = Buffer.alloc(chars.length);
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const mapped = CP850[ch];
    if (mapped != null) {
      out[i] = mapped;
      continue;
    }
    const code = ch.charCodeAt(0);
    out[i] = code < 128 ? code : 0x3f;
  }
  return out;
}

function concat(parts) {
  return Buffer.concat(parts.map((p) => (Buffer.isBuffer(p) ? p : encode(p))));
}

const ESC = {
  init: Buffer.from([0x1b, 0x40]),
  cp850: Buffer.from([0x1b, 0x74, 0x02]),
  alignLeft: Buffer.from([0x1b, 0x61, 0x00]),
  alignCenter: Buffer.from([0x1b, 0x61, 0x01]),
  boldOn: Buffer.from([0x1b, 0x45, 0x01]),
  boldOff: Buffer.from([0x1b, 0x45, 0x00]),
  doubleOn: Buffer.from([0x1d, 0x21, 0x11]),
  doubleOff: Buffer.from([0x1d, 0x21, 0x00]),
  cut: Buffer.from([0x1d, 0x56, 0x41, 0x10]),
  lf: Buffer.from([0x0a]),
};

function line(text = "") {
  return concat([encode(String(text).slice(0, COLS)), ESC.lf]);
}

function wrap(text, width = COLS) {
  const words = String(text).split(/\s+/);
  const rows = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
    } else {
      if (current) rows.push(current);
      current = word.slice(0, width);
    }
  }
  if (current) rows.push(current);
  return rows;
}

function money(cents) {
  const n = Number(cents) || 0;
  return `$ ${Math.round(n / 100).toLocaleString("es-CO")}`;
}

function pair(left, right) {
  const L = String(left);
  const R = String(right);
  const gap = Math.max(1, COLS - L.length - R.length);
  return line(`${L}${" ".repeat(gap)}${R}`);
}

function dash() {
  return line("-".repeat(COLS));
}

function renderKitchen(job) {
  const parts = [
    ESC.init,
    ESC.cp850,
    ESC.alignCenter,
    ESC.boldOn,
    ESC.doubleOn,
    line(job.title || "COMANDA"),
    ESC.doubleOff,
    ESC.boldOff,
    line(job.at || new Date().toLocaleString("es-CO")),
    ESC.alignLeft,
    dash(),
    ESC.boldOn,
    ESC.doubleOn,
    ...wrap(job.channel || "Pedido").map(line),
    ESC.doubleOff,
    ESC.boldOff,
    line(`Orden #${job.orderNumber ?? ""}`),
  ];
  if (job.pickupAt) {
    parts.push(ESC.boldOn, line(`Recoge ${job.pickupAt}`), ESC.boldOff);
  }
  parts.push(dash());
  for (const item of job.lines ?? []) {
    const qty = item.qty ?? item.quantity ?? 1;
    const name = item.name ?? "item";
    const prefix = item.canceled ? "CANCELADO " : "";
    parts.push(ESC.boldOn, ...wrap(`${prefix}${qty}x ${name}`).map(line), ESC.boldOff);
    if (item.notes && !item.canceled) {
      parts.push(...wrap(`  Nota: ${item.notes}`).map(line));
    }
  }
  if (!(job.lines ?? []).length) {
    parts.push(line("Sin productos"));
  }
  parts.push(ESC.lf, ESC.lf, ESC.cut);
  return concat(parts);
}

function renderReceipt(job) {
  const r = job.restaurant ?? {};
  const inv = job.invoice ?? {};
  const order = job.order ?? {};
  const totals = job.totals ?? {};
  const pay = job.payment ?? {};
  const parts = [
    ESC.init,
    ESC.cp850,
    ESC.alignCenter,
    ESC.boldOn,
    ESC.doubleOn,
    ...wrap(r.name || "Restaurante").map(line),
    ESC.doubleOff,
    ESC.boldOff,
  ];
  if (r.nit) parts.push(line(`NIT ${r.nit}`));
  if (r.address) parts.push(...wrap(r.address).map(line));
  parts.push(
    ESC.alignLeft,
    dash(),
    pair(inv.number || "RECIBO", inv.date || ""),
    line(
      `Orden #${order.number ?? ""}${order.table ? `  Mesa ${order.table}` : ""}`,
    ),
  );
  if (order.type) parts.push(line(String(order.type)));
  if (job.delivery?.customerName) {
    parts.push(line(`Cliente: ${job.delivery.customerName}`));
    if (job.delivery.phone) parts.push(line(job.delivery.phone));
  }
  parts.push(dash());
  for (const item of job.items ?? []) {
    parts.push(
      pair(
        `${item.quantity}x ${item.name}`,
        money(item.total ?? item.totalCents),
      ),
    );
  }
  parts.push(dash(), pair("Subtotal", money(totals.subtotal)));
  if ((totals.discount ?? 0) > 0) {
    parts.push(pair("Descuento", `-${money(totals.discount)}`));
  }
  if ((totals.service ?? 0) > 0) {
    parts.push(pair("Servicio 5%", money(totals.service)));
  }
  if ((totals.tip ?? 0) > 0) {
    parts.push(pair("Propina", money(totals.tip)));
  }
  parts.push(
    ESC.boldOn,
    pair("TOTAL", money(totals.total)),
    ESC.boldOff,
    line(
      `Pago: ${pay.methodLabel ?? pay.method ?? ""}${
        pay.received != null
          ? `  Recibido ${money(pay.received)}  Cambio ${money(pay.change ?? 0)}`
          : ""
      }`,
    ),
  );
  if (job.legal?.tipDisclaimer) {
    parts.push(ESC.lf, ...wrap(job.legal.tipDisclaimer).map(line));
  }
  parts.push(ESC.lf, ESC.alignCenter, line("Gracias"), ESC.lf, ESC.cut);
  return concat(parts);
}

function renderJob(job) {
  if (job?.type === "receipt") return renderReceipt(job);
  return renderKitchen(job);
}

module.exports = { renderJob, renderKitchen, renderReceipt, COLS };
