"use client";

import { useEffect, useState } from "react";

import { getPrintAgentStatus, sendTestPrint } from "@/src/lib/print-agent";

export function ThermalPrinterPanel() {
  const [printer, setPrinter] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPrintAgentStatus().then((status) => {
      if (cancelled) return;
      setOnline(Boolean(status?.ok));
      setPrinter(status?.printer ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleTest() {
    try {
      setBusy(true);
      setError("");
      setMessage("");
      const result = await sendTestPrint();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Ticket de prueba enviado a la térmica");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div>
        <h2 className="text-2xl font-bold">Impresora térmica</h2>
        <p className="text-sm text-zinc-400">
          Comanda y recibo 80mm (ESC/POS). En este PC: carpeta print-agent, npm start (puerto 19100).
        </p>
      </div>
      <p className={online ? "text-sm text-emerald-400" : "text-sm text-amber-400"}>
        {online
          ? `Agente listo · ${printer ?? "impresora"}`
          : "Agente apagado. Arráncalo en este PC o usa el diálogo del navegador (elige la térmica)."}
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}
      <button
        type="button"
        disabled={busy || !online}
        onClick={() => void handleTest()}
        className="min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
      >
        {busy ? "Imprimiendo..." : "Imprimir prueba"}
      </button>
    </section>
  );
}
