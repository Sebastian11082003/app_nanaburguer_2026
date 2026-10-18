const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createServer } = require("./server");

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

test("GET /health is immediate and does not require a printer", async () => {
  const server = createServer();
  const port = await listen(server);
  try {
    const started = Date.now();
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, "restoos-print-agent");
    assert.ok(Date.now() - started < 1000);
  } finally {
    await close(server);
  }
});

test("POST /print/test with PRINT_TARGET=file returns 200 without WMI", async () => {
  const dest = path.join(os.tmpdir(), `restoos-print-test-${Date.now()}.bin`);
  const previousTarget = process.env.PRINT_TARGET;
  const previousFile = process.env.PRINT_FILE;
  process.env.PRINT_TARGET = "file";
  process.env.PRINT_FILE = dest;
  const server = createServer();
  const port = await listen(server);
  try {
    const res = await fetch(`http://127.0.0.1:${port}/print/test`, { method: "POST" });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.mode, "file");
    assert.ok(body.bytes > 0);
    assert.ok(fs.existsSync(dest));
  } finally {
    await close(server);
    if (previousTarget === undefined) delete process.env.PRINT_TARGET;
    else process.env.PRINT_TARGET = previousTarget;
    if (previousFile === undefined) delete process.env.PRINT_FILE;
    else process.env.PRINT_FILE = previousFile;
    fs.unlink(dest, () => undefined);
  }
});
