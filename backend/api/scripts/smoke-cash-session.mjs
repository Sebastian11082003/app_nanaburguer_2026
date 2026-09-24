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
  return typeof data === "string" ? data.slice(0, 180) : JSON.stringify(data)?.slice(0, 180);
}

const slug = "smoke-cash-922";

const health = await req("/health");
console.log("health", health.status, JSON.stringify(health.data));

const platform = await req("/platform/login", {
  method: "POST",
  body: { email: "admin@nanaburger.com", password: "123456" },
});
console.log("platform login", platform.status, platform.data?.accessToken ? "token" : msg(platform.data));
if (!platform.data?.accessToken) process.exit(1);
const ptok = platform.data.accessToken;

let created = await req("/platform/restaurants", {
  method: "POST",
  token: ptok,
  body: {
    name: "Smoke Cash 922",
    slug,
    nit: "900922001",
    restaurantEmail: "local@smoke-cash-922.test",
    restaurantPassword: "123456",
    adminName: "Admin Smoke",
    adminEmail: "admin@smoke-cash-922.test",
    adminPassword: "123456",
  },
});
console.log("create tenant", created.status, created.data?.slug || msg(created.data));

const staff = await req("/auth/staff-login", {
  method: "POST",
  body: {
    email: "admin@smoke-cash-922.test",
    password: "123456",
  },
});
console.log("staff login", staff.status, staff.data?.accessToken ? "token" : msg(staff.data));
if (!staff.data?.accessToken) process.exit(1);
const tok = staff.data.accessToken;

const current = await req("/cash/sessions/current", { token: tok });
let openId = current.data?.session?.id;
console.log("current session", current.status, openId ? "OPEN" : "none");

if (openId) {
  const closedShift = await req(`/cash/sessions/${openId}/close`, {
    method: "POST",
    token: tok,
    body: { countedCents: 50000, notes: "smoke reset" },
  });
  console.log("close existing session", closedShift.status, msg(closedShift.data));
}

const moveNo = await req("/cash", {
  method: "POST",
  token: tok,
  body: { type: "INCOME", concept: "propina", amountCents: 1000 },
});
console.log("move without session", moveNo.status, msg(moveNo.data));

let items = await req("/menu/items", { token: tok });
let menuItemId = Array.isArray(items.data) ? items.data[0]?.id : items.data?.[0]?.id;
if (!menuItemId) {
  const cat = await req("/menu/categories", {
    method: "POST",
    token: tok,
    body: { name: "Smoke" },
  });
  console.log("category", cat.status, cat.data?.id ? "ok" : msg(cat.data));
  const item = await req("/menu/items", {
    method: "POST",
    token: tok,
    body: {
      categoryId: cat.data.id,
      name: "Burger smoke",
      priceCents: 15000,
    },
  });
  console.log("menu item", item.status, item.data?.id ? "ok" : msg(item.data));
  menuItemId = item.data?.id;
}

const order = await req("/orders", {
  method: "POST",
  token: tok,
  body: {
    type: "PICKUP",
    source: "CASHIER",
    customerName: "Smoke",
    customerPhone: "3100000000",
  },
});
console.log("create order", order.status, order.data?.id ? "ok" : msg(order.data));
const orderId = order.data.id;

const added = await req(`/orders/${orderId}/items`, {
  method: "POST",
  token: tok,
  body: { menuItemId, quantity: 1 },
});
console.log("add item", added.status, added.data?.id || added.data?.items ? "ok" : msg(added.data));

const closed = await req(`/orders/${orderId}/close`, {
  method: "PATCH",
  token: tok,
});
const saleId = closed.data?.sale?.id;
const totalCents = closed.data?.totalCents ?? closed.data?.sale?.totalCents;
console.log("close order", closed.status, saleId ? `sale ${totalCents}` : msg(closed.data));

const payNo = await req(`/sales/${saleId}/payments`, {
  method: "POST",
  token: tok,
  body: {
    method: "CASH",
    amountCents: totalCents,
    receivedCents: totalCents,
  },
});
console.log("CASH pay without session", payNo.status, msg(payNo.data));

const opened = await req("/cash/sessions", {
  method: "POST",
  token: tok,
  body: { openingCents: 50000 },
});
console.log("open session", opened.status, opened.data?.id ? "OPEN" : msg(opened.data));

const payYes = await req(`/sales/${saleId}/payments`, {
  method: "POST",
  token: tok,
  body: {
    method: "CASH",
    amountCents: totalCents,
    receivedCents: totalCents + 1000,
  },
});
console.log("CASH pay with session", payYes.status, payYes.data?.id ? "ok" : msg(payYes.data));
