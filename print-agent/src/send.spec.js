const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  healthSnapshot,
  parsePrinterNames,
  pickOutput,
  sendBuffer,
  withTimeout,
  resetPrinterCacheForTests,
  PS_TIMEOUT_MS,
} = require("./send");

test("withTimeout returns fallback when the promise never settles", async () => {
  const hung = new Promise(() => {});
  const started = Date.now();
  const result = await withTimeout(hung, 40, []);
  assert.deepEqual(result, []);
  assert.ok(Date.now() - started < 400);
});

test("withTimeout returns the resolved value when it is fast", async () => {
  const result = await withTimeout(Promise.resolve("POS-80"), 200, "");
  assert.equal(result, "POS-80");
});

test("parsePrinterNames splits CIM stdout", () => {
  assert.deepEqual(parsePrinterNames("POS-80\r\nMicrosoft Print to PDF\r\n\r\n"), [
    "POS-80",
    "Microsoft Print to PDF",
  ]);
});

test("healthSnapshot is sync and ok without WMI cache", () => {
  resetPrinterCacheForTests();
  const previous = process.env.PRINT_PRINTER;
  const previousHost = process.env.PRINT_HOST;
  delete process.env.PRINT_PRINTER;
  delete process.env.PRINT_HOST;
  try {
    const body = healthSnapshot();
    assert.equal(body.ok, true);
    assert.equal(body.service, "restoos-print-agent");
    assert.equal(body.printer, "file");
    assert.deepEqual(body.printers, []);
  } finally {
    if (previous === undefined) delete process.env.PRINT_PRINTER;
    else process.env.PRINT_PRINTER = previous;
    if (previousHost === undefined) delete process.env.PRINT_HOST;
    else process.env.PRINT_HOST = previousHost;
  }
});

test("healthSnapshot prefers PRINT_PRINTER over cache", () => {
  resetPrinterCacheForTests({ printers: ["PDF"], defaultName: "PDF" });
  const previous = process.env.PRINT_PRINTER;
  process.env.PRINT_PRINTER = "D300";
  try {
    const body = healthSnapshot();
    assert.equal(body.printer, "D300");
    assert.deepEqual(body.printers, ["PDF"]);
  } finally {
    if (previous === undefined) delete process.env.PRINT_PRINTER;
    else process.env.PRINT_PRINTER = previous;
    resetPrinterCacheForTests();
  }
});

test("PowerShell lookup timeout stays under the POS 4s abort", () => {
  assert.ok(PS_TIMEOUT_MS < 4000);
});

test("pickOutput auto on Windows without a named printer looks up default then can fall to file", () => {
  const pending = pickOutput("auto", "", "", "", "win32");
  assert.equal(pending.kind, "windows");
  assert.equal(pending.lookupDefault, true);
  const named = pickOutput("auto", "POS-80", "", "", "win32");
  assert.equal(named.kind, "windows");
  assert.equal(named.printer, "POS-80");
});

test("pickOutput file never selects Windows USB", () => {
  const chosen = pickOutput("file", "POS-80", "192.168.1.50", "PDF", "win32");
  assert.equal(chosen.kind, "file");
});

test("sendBuffer with PRINT_TARGET=file writes bytes without WMI", async () => {
  const dest = path.join(os.tmpdir(), `restoos-hu034-${Date.now()}.bin`);
  const previousTarget = process.env.PRINT_TARGET;
  const previousFile = process.env.PRINT_FILE;
  process.env.PRINT_TARGET = "file";
  process.env.PRINT_FILE = dest;
  try {
    const sent = await sendBuffer(Buffer.from("ESC/POS"));
    assert.equal(sent.mode, "file");
    assert.equal(fs.readFileSync(dest).toString(), "ESC/POS");
  } finally {
    if (previousTarget === undefined) delete process.env.PRINT_TARGET;
    else process.env.PRINT_TARGET = previousTarget;
    if (previousFile === undefined) delete process.env.PRINT_FILE;
    else process.env.PRINT_FILE = previousFile;
    fs.unlink(dest, () => undefined);
  }
});
