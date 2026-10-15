import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalJson, shortHash } from "../src/canon.ts";

// Expected values were computed once by the prototype at port time (see build.ts; schema 1.2) and pasted
// here; the tests never call Python. The canonical text is pasted too, so a mismatch says where the two serialisers part.

interface Vector {
  what: string;
  value: unknown;
  canonical: string;
  hash: string;
}

const VECTORS: Vector[] = [
  {
    what: "keys sorted, null, true, an integral float written as an integer (Python read 1.0)",
    value: { b: 1, a: [1.0, 2.5, "ё"], c: null, d: true },
    canonical: '{"a":[1,2.5,"ё"],"b":1,"c":null,"d":true}',
    hash: "81bd3b4b277b",
  },
  {
    what: "nested sorting, escapes, non-ASCII kept as UTF-8, empty containers",
    value: { z: { y: "«текст» — \"q\"\n\t\\", x: [{ b: 2, a: 1 }] }, A: [], é: {} },
    canonical: '{"A":[],"z":{"x":[{"a":1,"b":2}],"y":"«текст» — \\"q\\"\\n\\t\\\\"},"é":{}}',
    hash: "8f1a6aa0f8d6",
  },
  {
    what: "Python float text: 1e-05 and 1.5e-07, and 1e21 as a whole integer",
    value: { f: 1e-5, g: 0.7, h: 1e21, i: -3, j: 1.5e-7 },
    canonical: '{"f":1e-05,"g":0.7,"h":1000000000000000000000,"i":-3,"j":1.5e-07}',
    hash: "a6eead8c7d12",
  },
  {
    what: "a transition as the lock hashes it",
    value: {
      id: "O02", from: ["draft"], to: "paying", step: "s2", event: "PaymentStarted",
      fired_by: { kind: "endpoint", ref: "POST /orders/{id}:pay" }, writes: { ref: "provider ref" }, local: true,
    },
    canonical: '{"event":"PaymentStarted","fired_by":{"kind":"endpoint","ref":"POST /orders/{id}:pay"},"from":["draft"],'
      + '"id":"O02","local":true,"step":"s2","to":"paying","writes":{"ref":"provider ref"}}',
    hash: "8b165d64485a",
  },
];

for (const v of VECTORS) {
  test(`canonical hash: ${v.what}`, () => {
    assert.equal(canonicalJson(v.value), v.canonical);
    assert.equal(shortHash(v.value), v.hash);
  });
}

test("canonical hash does not depend on key order", () => {
  assert.equal(shortHash({ a: 1, b: { d: 2, c: 3 } }), shortHash({ b: { c: 3, d: 2 }, a: 1 }));
});
