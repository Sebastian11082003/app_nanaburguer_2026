import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isStaffCredentialRequest,
  shouldExpireStaffSession,
} from "./staff-auth-expired.ts";

describe("shouldExpireStaffSession", () => {
  it("expires a POS 401 from floor/tables", () => {
    assert.equal(shouldExpireStaffSession(401, "/tables/floor"), true);
    assert.equal(shouldExpireStaffSession(401, "http://localhost:3000/orders"), true);
  });

  it("does not expire login or recover 401", () => {
    assert.equal(isStaffCredentialRequest("/auth/staff-login"), true);
    assert.equal(shouldExpireStaffSession(401, "/auth/staff-login"), false);
    assert.equal(
      shouldExpireStaffSession(401, "/auth/forgot-password"),
      false,
    );
    assert.equal(
      shouldExpireStaffSession(401, "/auth/reset-password?token=x"),
      false,
    );
  });

  it("ignores other HTTP errors", () => {
    assert.equal(shouldExpireStaffSession(403, "/tables/floor"), false);
    assert.equal(shouldExpireStaffSession(500, "/tables/floor"), false);
    assert.equal(shouldExpireStaffSession(undefined, "/tables/floor"), false);
  });
});
