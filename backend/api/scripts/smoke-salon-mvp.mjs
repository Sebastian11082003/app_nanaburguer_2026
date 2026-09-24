const API = "http://localhost:3000";

async function req(path, { method = "GET", token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function msg(data) {
  if (data && typeof data === "object" && "message" in data) return data.message;
  return typeof data === "string" ? data.slice(0, 160) : "";
}

const health = await req("/health");
console.log("1 health", health.status, JSON.stringify(health.data));

const platform = await req("/platform/login", {
  method: "POST",
  body: { email: "admin@nanaburger.com", password: "123456" },
});
console.log("2 platform", platform.status, platform.data?.accessToken ? "token" : msg(platform.data));

const staff = await req("/auth/staff-login", {
  method: "POST",
  body: {
    email: "admin@smoke-cash-922.test",
    password: "123456",
  },
});
console.log("3 staff", staff.status, staff.data?.accessToken ? "token" : msg(staff.data));
if (!staff.data?.accessToken) process.exit(1);
const tok = staff.data.accessToken;

let tables = await req("/tables", { token: tok });
let tableId = Array.isArray(tables.data) ? tables.data[0]?.id : null;
if (!tableId) {
  const createdTable = await req("/tables", {
    method: "POST",
    token: tok,
    body: { label: "M1", capacity: 4 },
  });
  console.log("table create", createdTable.status, createdTable.data?.id ? "ok" : msg(createdTable.data));
  tableId = createdTable.data?.id;
} else {
  console.log("table", tables.status, "existing");
}

const items = await req("/menu/items", { token: tok });
const menuItemId = Array.isArray(items.data) ? items.data[0]?.id : null;
if (!menuItemId) {
  console.log("menu empty");
  process.exit(1);
}

const session = await req("/cash/sessions/current", { token: tok });
if (!session.data?.session) {
  const opened = await req("/cash/sessions", {
    method: "POST",
    token: tok,
    body: { openingCents: 50000 },
  });
  console.log("4 caja", opened.status, opened.data?.id ? "OPEN" : msg(opened.data));
} else {
  console.log("4 caja", session.status, "OPEN");
}

const order = await req("/orders", {
  method: "POST",
  token: tok,
  body: { type: "DINE_IN", source: "WAITER", tableId },
});
console.log("5 order", order.status, order.data?.id ? order.data.status : msg(order.data));
const orderId = order.data?.id;
if (!orderId) process.exit(1);

const added = await req(`/orders/${orderId}/items`, {
  method: "POST",
  token: tok,
  body: { menuItemId, quantity: 1 },
});
const lineName = added.data?.items?.[0]?.menuItem?.name;
console.log("5 item", added.status, lineName || msg(added.data));

const toKitchen = await req(`/orders/${orderId}/status`, {
  method: "PATCH",
  token: tok,
  body: { status: "SENT_TO_KITCHEN" },
});
console.log("5 kitchen", toKitchen.status, toKitchen.data?.status || msg(toKitchen.data));

const prep = await req(`/orders/${orderId}/status`, {
  method: "PATCH",
  token: tok,
  body: { status: "IN_PREPARATION" },
});
const ready = await req(`/orders/${orderId}/status`, {
  method: "PATCH",
  token: tok,
  body: { status: "READY" },
});
console.log("6 kds", prep.status, prep.data?.status, ready.status, ready.data?.status);

const closed = await req(`/orders/${orderId}/close`, {
  method: "PATCH",
  token: tok,
});
const saleId = closed.data?.sale?.id;
const totalCents = closed.data?.totalCents;
console.log("7 close", closed.status, saleId ? `sale ${totalCents}` : msg(closed.data));

const pay = await req(`/sales/${saleId}/payments`, {
  method: "POST",
  token: tok,
  body: {
    method: "CASH",
    amountCents: totalCents,
    receivedCents: totalCents + 10000,
  },
});
console.log(
  "7 cash",
  pay.status,
  pay.data?.payment?.id ? "paid" : msg(pay.data),
  pay.data?.invoice?.id ? "invoice" : "",
);

const reports = await req("/reports/summary", { token: tok });
console.log(
  "10 reports",
  reports.status,
  reports.data?.totalRevenue != null
    ? `revenue=${reports.data.totalRevenue} sales=${reports.data.totalSales} orders=${reports.data.totalOrders}`
    : msg(reports.data) || Object.keys(reports.data || {}).slice(0, 8).join(","),
);
