const { execFile } = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

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

async function listWindowsPrinters() {
  if (process.platform !== "win32") return [];
  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name",
      ],
      { windowsHide: true },
    );
    return stdout
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function defaultWindowsPrinter() {
  if (process.platform !== "win32") return "";
  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "(Get-CimInstance Win32_Printer | Where-Object { $_.Default -eq $true }).Name",
      ],
      { windowsHide: true },
    );
    return stdout.trim();
  } catch {
    return "";
  }
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
  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `(Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq '${name.replace(/'/g, "''")}' }).PortName`,
      ],
      { windowsHide: true },
    );
    return stdout.trim();
  } catch {
    return "";
  }
}

async function copyRaw(tmp, dest) {
  await execFileAsync("cmd.exe", ["/c", "copy", "/B", tmp, dest], {
    windowsHide: true,
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

async function sendBuffer(buffer) {
  const mode = target();
  const named = printerName();
  const host = tcpHost();

  if (mode === "tcp" || (mode === "auto" && host)) {
    return sendTcp(buffer, host, tcpPort());
  }
  if (mode === "windows" || (mode === "auto" && process.platform === "win32")) {
    const printer = named || (await defaultWindowsPrinter());
    return sendWindows(buffer, printer);
  }
  if (mode === "file") {
    return sendFile(buffer);
  }
  if (host) {
    return sendTcp(buffer, host, tcpPort());
  }
  return sendFile(buffer);
}

async function status() {
  const printers = await listWindowsPrinters();
  const named = printerName();
  const host = tcpHost();
  const mode = target();
  return {
    ok: true,
    service: "restoos-print-agent",
    target: mode,
    printer: named || (await defaultWindowsPrinter()) || host || "file",
    printers,
    tcp: host ? `${host}:${tcpPort()}` : null,
  };
}

module.exports = { sendBuffer, status, listWindowsPrinters };
