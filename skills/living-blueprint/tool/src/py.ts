// Python semantics the output follows (see build.ts). Every value it prints goes through
// str(), json.dumps() or a truthiness test, and JavaScript differs from Python in each of them.

export type Dict = Record<string, unknown>;

export function isRecord(x: unknown): x is Dict {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Python truthiness: None, False, 0, "", [] and {} are false. NaN is true in Python. */
export function truthy(x: unknown): boolean {
  if (x === null || x === undefined || x === false) return false;
  if (typeof x === "number") return x !== 0;
  if (typeof x === "string") return x.length > 0;
  if (Array.isArray(x)) return x.length > 0;
  if (isRecord(x)) return Object.keys(x).length > 0;
  return true;
}

/** `as_list`: None → [], a list → itself, anything else → [x]. */
export function asList<T>(x: T | readonly T[] | null | undefined): T[] {
  if (x === null || x === undefined) return [];
  return Array.isArray(x) ? [...(x as readonly T[])] : [x as T];
}

/** Order-preserving dedupe. */
export function dedupe<T>(xs: readonly T[]): T[] {
  const out: T[] = [];
  for (const x of xs) if (!out.includes(x)) out.push(x);
  return out;
}

/** `key in dict` for a plain object parsed from YAML; never consults the prototype. */
export function has(o: unknown, key: unknown): boolean {
  return isRecord(o) && typeof key === "string" && Object.hasOwn(o, key);
}

/** dict.get(key, default): the default only when the key is absent — a key present with null yields null. */
export function get(o: unknown, key: string, dflt?: unknown): unknown {
  return has(o, key) ? (o as Dict)[key] : dflt;
}

/** Python sorted() on strings. The default comparator compares UTF-16 code units; Python compares code points.
 * They agree everywhere outside the astral planes, which is where every id and key of a blueprint lives. */
export function sorted<T extends string>(xs: Iterable<T>): T[] {
  return [...xs].sort();
}

// ---------------------------------------------------------------- whitespace

/** The characters Python's str.isspace() accepts. JavaScript's trim() and \s differ: they add U+FEFF and drop
 * U+001C–U+001F and U+0085. */
export const PY_WHITESPACE = "\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const WS_CHAR = new RegExp(`^[${PY_WHITESPACE}]$`);
// Every Python whitespace character is in the BMP, so testing one UTF-16 unit at a time is exact.
const isWs = (s: string, i: number) => WS_CHAR.test(s.charAt(i));

/** str.strip() */
export function strip(s: string): string {
  const end = rstrip(s).length;
  let start = 0;
  while (start < end && isWs(s, start)) start++;
  return s.slice(start, end);
}

/** str.rstrip() */
export function rstrip(s: string): string {
  let end = s.length;
  while (end > 0 && isWs(s, end - 1)) end--;
  return s.slice(0, end);
}

// ---------------------------------------------------------------- equality

/** Python ==: None equals None whether the key was missing or null; dicts and lists compare by value. */
export function pyEq(a: unknown, b: unknown): boolean {
  if (a === undefined) a = null;
  if (b === undefined) b = null;
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => pyEq(x, b[i]));
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((k) => Object.hasOwn(b, k) && pyEq(a[k], b[k]));
  }
  return false;
}

// ---------------------------------------------------------------- str() and repr()

const NON_PRINTABLE = /[\p{C}\p{Z}]/u;

/** Python repr() of a str: single quotes unless the text holds a single quote and no double one. */
function strRepr(s: string): string {
  const quote = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = quote;
  for (const ch of s) {
    if (ch === quote || ch === "\\") out += "\\" + ch;
    else if (ch === "\t") out += "\\t";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch !== " " && NON_PRINTABLE.test(ch)) {
      const cp = ch.codePointAt(0) ?? 0;
      const hex = cp.toString(16);
      out += cp < 0x100 ? "\\x" + hex.padStart(2, "0") : cp < 0x10000 ? "\\u" + hex.padStart(4, "0") : "\\U" + hex.padStart(8, "0");
    } else out += ch;
  }
  return out + quote;
}

// Python prints an integer in full; a double at or above 1e21 prints in exponent form in JavaScript.
const EXPONENT_FROM = 1e21;

function intText(x: number): string {
  return Math.abs(x) < EXPONENT_FROM ? String(x === 0 ? 0 : x) : BigInt(x).toString();
}

/** Python repr() of a float: the same shortest digits, but exponent form below 1e-4 and from 1e16, written `1e-05`. */
function floatRepr(x: number): string {
  const [mantissa = "", expText = "0"] = x.toExponential().split("e");
  const exp = Number(expText);
  if (exp < -4 || exp >= 16) {
    return `${mantissa}e${exp < 0 ? "-" : "+"}${String(Math.abs(exp)).padStart(2, "0")}`;
  }
  return String(x);
}

/** A number as Python prints it. YAML 1.2 has one number type in JavaScript, so `2.0` reads as the integer 2. */
function numberText(x: number, json: boolean): string {
  if (Number.isNaN(x)) return json ? "NaN" : "nan";
  if (x === Infinity) return json ? "Infinity" : "inf";
  if (x === -Infinity) return json ? "-Infinity" : "-inf";
  return Number.isInteger(x) ? intText(x) : floatRepr(x);
}

export function pyRepr(x: unknown): string {
  if (x === null || x === undefined) return "None";
  if (x === true) return "True";
  if (x === false) return "False";
  if (typeof x === "number") return numberText(x, false);
  if (typeof x === "string") return strRepr(x);
  if (Array.isArray(x)) return "[" + x.map(pyRepr).join(", ") + "]";
  if (isRecord(x)) return "{" + Object.entries(x).map(([k, v]) => `${strRepr(k)}: ${pyRepr(v)}`).join(", ") + "}";
  return String(x);
}

/** Python str(): a string is itself, everything else is its repr — `True`, `None`, `['a', 'b']`. */
export function pyStr(x: unknown): string {
  return typeof x === "string" ? x : pyRepr(x);
}

/** An f-string: every interpolated value goes through str(), so `true` prints `True` and a missing key prints `None`. */
export function py(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = strings[0] ?? "";
  values.forEach((v, i) => {
    out += pyStr(v) + (strings[i + 1] ?? "");
  });
  return out;
}

/** `fmt`: None → —, a list joined with `, ` (— when empty), anything else str(). */
export function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.map(pyStr).join(", ") || "—";
  return pyStr(v);
}

// ---------------------------------------------------------------- json.dumps

export interface JsonOptions {
  /** json.dumps(indent=N); omitted for one-line output. */
  indent?: number;
  sortKeys?: boolean;
  /** separators=(",", ":") — the canonical form the hashes are computed over. */
  compact?: boolean;
}

/** json.dumps(x, ensure_ascii=False, ...). JSON.stringify escapes strings exactly as Python does without ensure_ascii,
 * but drops keys whose value is undefined and prints numbers differently — a missing value here is Python's None. */
export function pyJson(x: unknown, opts: JsonOptions = {}): string {
  const { indent, sortKeys = false, compact = false } = opts;
  const itemSep = compact || indent !== undefined ? "," : ", ";
  const keySep = compact ? ":" : ": ";
  const enc = (v: unknown, level: number): string => {
    if (v === null || v === undefined) return "null";
    if (v === true) return "true";
    if (v === false) return "false";
    if (typeof v === "number") return numberText(v, true);
    if (typeof v === "string") return JSON.stringify(v);
    let parts: string[];
    let open: string;
    let close: string;
    if (Array.isArray(v)) {
      if (v.length === 0) return "[]";
      parts = v.map((item) => enc(item, level + 1));
      [open, close] = ["[", "]"];
    } else if (isRecord(v)) {
      const keys = Object.keys(v);
      if (keys.length === 0) return "{}";
      if (sortKeys) keys.sort();
      parts = keys.map((k) => JSON.stringify(k) + keySep + enc(v[k], level + 1));
      [open, close] = ["{", "}"];
    } else {
      throw new TypeError(`Object of type ${typeof v} is not JSON serializable`);
    }
    if (indent === undefined) return open + parts.join(itemSep) + close;
    const inner = "\n" + " ".repeat(indent * (level + 1));
    return open + inner + parts.join(itemSep + inner) + "\n" + " ".repeat(indent * level) + close;
  };
  return enc(x, 0);
}
