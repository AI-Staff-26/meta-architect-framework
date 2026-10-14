import { createHash } from "node:crypto";
import { pyJson } from "./py.ts";

// Hashes are the first 12 hex characters of SHA-256 over canonical JSON: keys sorted, no whitespace, UTF-8, integral
// floats written as integers (SCHEMA.md, "Reverse drift"), so the hash does not depend on how a YAML parser types 1.0;
// a JavaScript number has no separate float type, so pyJson already prints 1.

const HASH_LENGTH = 12;

export function canonicalJson(obj: unknown): string {
  return pyJson(obj, { sortKeys: true, compact: true });
}

export function shortHash(obj: unknown): string {
  return createHash("sha256").update(canonicalJson(obj), "utf8").digest("hex").slice(0, HASH_LENGTH);
}
