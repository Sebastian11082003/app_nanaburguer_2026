/**
 * Send ESC/POS bytes to a Windows USB printer, TCP :9100, or a file.
 *
 * Windows WMI (Get-CimInstance Win32_Printer) can hang for tens of seconds.
 * /health must never wait on that: the POS abort is 4s and the Configuración
 * panel looked "offline" even when the agent was up. Printer discovery is
 * cached in the background with a hard timeout.
 */

const { execFile } = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

/** Kill hung PowerShell before the POS 4s AbortSignal.timeout. */
const PS_TIMEOUT_MS = 1500;

const printerCache = {
  printers: [],
  defaultName: "",
  updatedAt: 0,
};

function target() {
  return (process.env.PRINT_TARGET || "auto").toLowerCase();
}

function printerName() {
  return (process.env.PRINT_PRINTER || "").trim();
}

function tcpHost() {
  return (process.env.PRINT_HOST || "").trim();
}

function tcpPort() {
  return Number(process.env.PRINT_PORT || 9100);
}

function filePath() {
  return process.env.PRINT_FILE || path.join(os.tmpdir(), "restoos-last-ticket.bin");
}

function withTimeout(promise, ms, fallback) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout])
    .catch(() => fallback)
    .finally(() => clearTimeout(timer));
}

function parsePrinterNames(stdout) {
  return String(stdout || "")
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
}

async function runPowerShell(command) {
  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-Command", command],
    { windowsHide: true, timeout: PS_TIMEOUT_MS },
  );
  return stdout;
}

async function listWindowsPrinters() {
  if (process.platform !== "win32") return [];
  const stdout = await withTimeout(
    runPowerShell("Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"),
    PS_TIMEOUT_MS,
    "",
  );
  return parsePrinterNames(stdout);
}

async function defaultWindowsPrinter() {
  if (process.platform !== "win32") return "";
  const stdout = await withTimeout(
    runPowerShell(
      "(Get-CimInstance Win32_Printer | Where-Object { $_.Default -eq $true }).Name",
    ),
    PS_TIMEOUT_MS,
    "",
  );
  return String(stdout || "").trim();
}

function sendTcp(buffer, host, port) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port }, () => {
      socket.write(buffer, (err) => {
        if (err) {
          socket.destroy();
          reject(err);
          return;
        }
        socket.end();
      });
    });
    socket.setTimeout(5000);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("La impresora de red no respondió"));
    });
    socket.on("error", reject);
    socket.on("close", () => resolve({ mode: "tcp", host, port }));
  });
}

async function printerPort(name) {
  const stdout = await withTimeout(
    runPowerShell(
      `(Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq '${name.replace(/'/g, "''")}' }).PortName`,
    ),
    PS_TIMEOUT_MS,
    "",
  );
  return String(stdout || "").trim();
}

async function copyRaw(tmp, dest) {
  await execFileAsync("cmd.exe", ["/c", "copy", "/B", tmp, dest], {
    windowsHide: true,
    timeout: 8000,
  });
}

async function sendWindows(buffer, name) {
  if (!name) {
    throw new Error("Define PRINT_PRINTER o deja una impresora predeterminada en Windows");
  }
  const tmp = path.join(os.tmpdir(), `restoos-ticket-${Date.now()}.bin`);
  fs.writeFileSync(tmp, buffer);
  try {
    try {
      await copyRaw(tmp, `\\\\localhost\\${name}`);
      return { mode: "windows", printer: name };
    } catch {
      const port = await printerPort(name);
      if (!port) throw new Error(`No se pudo enviar a ${name}. Compártela o usa PRINT_HOST.`);
      await copyRaw(tmp, port);
      return { mode: "windows", printer: name, port };
    }
  } finally {
    fs.unlink(tmp, () => undefined);
  }
}

function sendFile(buffer) {
  const dest = filePath();
  fs.writeFileSync(dest, buffer);
  return { mode: "file", path: dest };
}

/**
 * Decide USB / TCP / file without talking to WMI.
 * `lookupDefault` means auto on Windows with no env/cache name: try the
 * default printer with timeout, then file so /print does not hang like /health used to.
 */
function pickOutput(mode, named, host, cacheDefault, platform) {
  if (mode === "tcp" || (mode === "auto" && host)) {
    return { kind: "tcp", host, port: tcpPort() };
  }
  if (mode === "file") {
    return { kind: "file" };
  }
  if (mode === "windows") {
    return { kind: "windows", printer: named || cacheDefault };
  }
  if (mode === "auto" && platform === "win32") {
    const printer = named || cacheDefault;
    if (printer) return { kind: "windows", printer };
    return { kind: "windows", printer: "", lookupDefault: true };
  }
  if (host) {
    return { kind: "tcp", host, port: tcpPort() };
  }
  return { kind: "file" };
}

async function sendBuffer(buffer) {
  const chosen = pickOutput(
    target(),
    printerName(),
    tcpHost(),
    printerCache.defaultName,
    process.platform,
  );

  let kind = chosen.kind;
  let printer = chosen.printer;
  if (chosen.lookupDefault) {
    printer = await defaultWindowsPrinter();
    kind = printer ? "windows" : "file";
  }

  if (kind === "tcp") {
    return sendTcp(buffer, chosen.host, chosen.port);
  }
  if (kind === "windows") {
    return sendWindows(buffer, printer);
  }
  return sendFile(buffer);
}

/**
 * Immediate /health body. Never calls WMI.
 * printer comes from env, then last successful discovery, then TCP host.
 */
function healthSnapshot() {
  const named = printerName();
  const host = tcpHost();
  const mode = target();
  return {
    ok: true,
    service: "restoos-print-agent",
    target: mode,
    printer: named || printerCache.defaultName || host || "file",
    printers: printerCache.printers,
    tcp: host ? `${host}:${tcpPort()}` : null,
  };
}

async function refreshPrinterCache() {
  const printers = await listWindowsPrinters();
  const defaultName = await defaultWindowsPrinter();
  printerCache.printers = printers;
  printerCache.defaultName = defaultName;
  printerCache.updatedAt = Date.now();
  return { printers, defaultName };
}

function resetPrinterCacheForTests(next = {}) {
  printerCache.printers = next.printers || [];
  printerCache.defaultName = next.defaultName || "";
  printerCache.updatedAt = next.updatedAt || 0;
}

module.exports = {
  PS_TIMEOUT_MS,
  sendBuffer,
  healthSnapshot,
  refreshPrinterCache,
  listWindowsPrinters,
  parsePrinterNames,
  pickOutput,
  withTimeout,
  resetPrinterCacheForTests,
};
