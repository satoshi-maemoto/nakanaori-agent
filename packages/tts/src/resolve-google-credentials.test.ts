// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveGoogleApplicationCredentials } from "./resolve-google-credentials.js";

describe("resolveGoogleApplicationCredentials", () => {
  const original = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalCwd = process.cwd();

  afterEach(() => {
    if (original === undefined) {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = original;
    }
    process.chdir(originalCwd);
  });

  it("resolves relative path from monorepo root when cwd is services/api", () => {
    const dir = mkdtempSync(join(tmpdir(), "nakanaori-tts-"));
    const creds = join(dir, "google-tts-service-account.json");
    writeFileSync(creds, "{}");
    mkdirSync(join(dir, "services", "api"), { recursive: true });
    process.chdir(resolve(dir, "services/api"));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "./google-tts-service-account.json";

    const resolved = resolveGoogleApplicationCredentials();

    expect(resolved).not.toBeNull();
    expect(resolved).toMatch(/google-tts-service-account\.json$/);
    expect(existsSync(resolved!)).toBe(true);
  });

  it("returns null when file is missing", () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "./missing-credentials.json";
    expect(resolveGoogleApplicationCredentials()).toBeNull();
  });

  it("accepts absolute paths", () => {
    const dir = mkdtempSync(join(tmpdir(), "nakanaori-tts-abs-"));
    const creds = join(dir, "key.json");
    writeFileSync(creds, "{}");
    process.env.GOOGLE_APPLICATION_CREDENTIALS = creds;

    expect(resolveGoogleApplicationCredentials()).toBe(creds);
    expect(existsSync(creds)).toBe(true);
  });
});
