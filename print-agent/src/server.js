/**
 * Local print agent scaffold.
 *
 * Listens only on 127.0.0.1 so the restaurant POS can POST tickets without
 * exposing USB printing to the LAN. Real ESC/POS USB output comes next;
 * for now jobs are logged so the web app integration can be developed.
 */

const http = require("http");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PRINT_AGENT_PORT || 9100);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "restoos-print-agent",
      printer: "not-connected",
    });
    return;
  }

  if (req.method === "POST" && req.url === "/print") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = {};
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON" });
      return;
    }

    // TODO: render ESC/POS and write to USB Digital POS D300/D200.
    console.log("[print-agent] job received", {
      type: body.type ?? "unknown",
      lines: Array.isArray(body.lines) ? body.lines.length : 0,
      at: new Date().toISOString(),
    });

    sendJson(res, 202, {
      ok: true,
      queued: true,
      mode: "log-only",
      message:
        "Job accepted (scaffold). Connect ESC/POS USB driver in a later iteration.",
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`RestoOS print-agent listening on http://${HOST}:${PORT}`);
});
