const AGENT_URL =
  process.env.NEXT_PUBLIC_PRINT_AGENT_URL ?? "http://127.0.0.1:19100";

export type PrintAgentStatus = {
  ok: boolean;
  service?: string;
  printer?: string;
  printers?: string[];
  target?: string;
  tcp?: string | null;
  error?: string;
};

export type KitchenPrintJob = {
  type: "kitchen";
  title: string;
  channel: string;
  orderNumber: number;
  pickupAt?: string | null;
  at: string;
  lines: Array<{
    qty: number;
    name: string;
    notes?: string | null;
    canceled?: boolean;
  }>;
};

export type ReceiptPrintJob = {
  type: "receipt";
  restaurant: {
    name: string;
    nit?: string | null;
    address?: string | null;
  };
  invoice: { number: string; date: string };
  order: { number: number; type?: string; table?: string | null };
  delivery?: { customerName?: string; phone?: string } | null;
  items: Array<{ quantity: number; name: string; total: number }>;
  totals: {
    subtotal: number;
    discount?: number;
    service?: number;
    tip?: number;
    total: number;
  };
  payment: {
    method?: string;
    methodLabel?: string;
    received?: number | null;
    change?: number;
  };
  legal?: { tipDisclaimer?: string };
};

async function agentFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${AGENT_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(4000),
  });
}

export async function getPrintAgentStatus(): Promise<PrintAgentStatus | null> {
  try {
    const res = await agentFetch("/health");
    if (!res.ok) return null;
    return (await res.json()) as PrintAgentStatus;
  } catch {
    return null;
  }
}

export async function sendPrintJob(
  job: KitchenPrintJob | ReceiptPrintJob,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await agentFetch("/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "La térmica no imprimió" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No hay agente de impresión en este PC" };
  }
}

export async function sendTestPrint(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await agentFetch("/print/test", { method: "POST" });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "La prueba no salió" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Arranca el print-agent en este PC (puerto 19100)" };
  }
}
