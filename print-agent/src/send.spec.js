const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  healthSnapshot,
  parsePrinterNames,
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
