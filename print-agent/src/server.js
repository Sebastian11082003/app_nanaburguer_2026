/**
 * Local print agent: ESC/POS comanda + recibo on the POS PC.
 * Binds 127.0.0.1 only.
 */

const http = require("http");
const { renderJob } = require("./escpos");
const { sendBuffer, status } = require("./send");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PRINT_AGENT_PORT || 19100);

function sendJson(res, code, body) {
  const payload = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, await status());
      return;
    }

    if (req.method === "POST" && (req.url === "/print" || req.url === "/print/test")) {
      const body =
        req.url === "/print/test"
          ? {
              type: "kitchen",
              title: "PRUEBA TERMICA",
              channel: "RestoOS",
              orderNumber: 0,
              at: new Date().toLocaleString("es-CO"),
              lines: [{ qty: 1, name: "Ticket de prueba", notes: "Digital POS 80mm" }],
            }
          : await readJson(req);

      const bytes = renderJob(body);
      const sent = await sendBuffer(bytes);
      console.log("[print-agent] printed", {
        type: body.type ?? "kitchen",
        bytes: bytes.length,
        ...sent,
      });
      sendJson(res, 200, { ok: true, bytes: bytes.length, ...sent });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  } catch (err) {
    console.error("[print-agent]", err);
    sendJson(res, 500, {
      ok: false,
      error: err instanceof Error ? err.message : "Print failed",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`RestoOS print-agent http://${HOST}:${PORT}`);
});
