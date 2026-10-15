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

const staff = await req("/auth/staff-login", {
  method: "POST",
  body: {
    email: "admin@smoke-cash-922.test",
    password: "123456",
  },
});
if (!staff.data?.accessToken) {
  console.log("staff login", staff.status, staff.data);
  process.exit(1);
}
const tok = staff.data.accessToken;
console.log("staff login", staff.status, "token");

const list = await req("/invoices", { token: tok });
const invoices = Array.isArray(list.data) ? list.data : [];
const pending = invoices.find((row) => row.status === "PENDING");
console.log("invoices", list.status, invoices.length, pending ? "has PENDING" : "no PENDING");

if (!pending) {
  process.exit(pending ? 0 : 2);
}

const printedBefore = await req(`/invoices/${pending.id}/print`, { token: tok });
console.log(
  "print before",
  printedBefore.status,
  printedBefore.data?.items ? "receipt" : "no items",
  printedBefore.data?.electronicBilling ? "LEAK" : "no fiscal leak",
);

const accepted = await req(`/invoices/${pending.id}/accept`, {
  method: "POST",
  token: tok,
});
console.log(
  "accept",
  accepted.status,
  accepted.data?.status,
  typeof accepted.data?.cufe === "string" && accepted.data.cufe.startsWith("SIM-")
    ? "SIM cufe"
    : accepted.data?.cufe,
  accepted.data?.responseJson?.electronicBilling?.provider,
);

const printedAfter = await req(`/invoices/${pending.id}/print`, { token: tok });
console.log(
  "print after",
  printedAfter.status,
  printedAfter.data?.items ? "receipt" : "no items",
  printedAfter.data?.electronicBilling ? "LEAK" : "no fiscal leak",
);

const again = await req(`/invoices/${pending.id}/accept`, {
  method: "POST",
  token: tok,
});
console.log("accept twice", again.status, again.data?.message);

const other = invoices.find(
  (row) => row.status === "PENDING" && row.id !== pending.id,
);
if (other) {
  const rejected = await req(`/invoices/${other.id}/reject`, {
    method: "POST",
    token: tok,
    body: { reason: "QA" },
  });
  console.log("reject", rejected.status, rejected.data?.status, rejected.data?.cufe);
} else {
  console.log("reject skipped (no second PENDING)");
}
