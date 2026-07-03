// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

/** Monorepo root when API runs from services/api, else cwd. */
function repoRootCandidates(): string[] {
  const cwd = process.cwd();
  return [resolve(cwd, "../.."), cwd, resolve(cwd, "..")];
}

function resolveCredentialsPath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (isAbsolute(trimmed)) {
    return existsSync(trimmed) ? trimmed : null;
  }

  const candidates = [
    resolve(process.cwd(), trimmed),
    ...repoRootCandidates().map((root) => resolve(root, trimmed)),
  ];

  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

/**
 * Resolve GOOGLE_APPLICATION_CREDENTIALS to an absolute path.
 * Relative paths in .env are resolved from monorepo root (not services/api cwd).
 */
export function resolveGoogleApplicationCredentials(): string | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!raw?.trim()) return null;

  const resolved = resolveCredentialsPath(raw);
  if (resolved) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolved;
    return resolved;
  }
  return null;
}
