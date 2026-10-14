import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { BuildError } from "../src/agent-view.ts";
import { agentOutputs, configPathProblems } from "../src/paths.ts";

// Where the build may write. The lint keeps ids from naming paths (L10); these guards hold even if it did not.

const ROOT = "/srv/project/docs/blueprint";

test("agent/ files map to absolute paths inside agent/", () => {
  const files = new Map([["SPEC.md", "#"], ["calls/c.sum.result.json", "{}"], ["fixtures/s1.happy.json", "{}"]]);
  assert.deepEqual([...agentOutputs(ROOT, files).keys()], [
    join(ROOT, "agent", "SPEC.md"), join(ROOT, "agent", "calls", "c.sum.result.json"), join(ROOT, "agent", "fixtures", "s1.happy.json"),
  ]);
});

test("an agent/ file that resolves outside agent/ stops the build", () => {
  for (const rel of ["calls/../../../escape-call.json", "prompts/../../blueprint.html", "fixtures/../..", "calls/.."]) {
    assert.throws(() => agentOutputs(ROOT, new Map([[rel, "{}"]])), BuildError, rel);
  }
});

test("html and prompts_md: relative, and inside the blueprint directory's parent", () => {
  const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(ROOT, cfg, "blueprint.config.yaml");
  assert.deepEqual(problems({ html: "blueprint.html", prompts_md: "../prompts/01-PROMPTS-v0.md" }), []);
  assert.deepEqual(problems({ html: "out/blueprint.html" }), []);
  for (const [field, value] of [
    ["html", "/tmp/rv/abs-escape.html"], ["prompts_md", "/etc/prompts.md"], ["html", "../../escape.html"], ["prompts_md", ".."],
  ] as const) {
    const found = problems({ [field]: value });
    assert.equal(found.length, 1, `${field}: ${value}`);
    assert.match(found[0] ?? "", new RegExp(`^L0 blueprint\\.config\\.yaml: ${field} '`));
  }
});

test("html and prompts_md stay out of the blueprint's src/ and agent/", () => {
  const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(ROOT, cfg, "blueprint.config.yaml");
  for (const [field, value, dir] of [
    ["html", "src/page.html", "src"], ["html", "agent/SPEC.md", "agent"], ["prompts_md", "agent/prompts/x.md", "agent"],
    ["html", "agent", "agent"], ["prompts_md", "./out/../src/data/x.md", "src"],
  ] as const) {
    assert.deepEqual(problems({ [field]: value }), [
      `L0 blueprint.config.yaml: ${field} '${value}' points into ${dir}/ — the build ${dir === "src" ? "reads" : "writes"} that folder itself`,
    ], `${field}: ${value}`);
  }
  assert.deepEqual(problems({ html: "srcs/page.html", prompts_md: "agents.md" }), [], "a name that only starts like one");
});

test("html and prompts_md stay off blueprint.config.yaml: the build reads that file itself", () => {
  const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(ROOT, cfg, "blueprint.config.yaml");
  for (const [field, value] of [
    ["html", "blueprint.config.yaml"], ["prompts_md", "./blueprint.config.yaml"], ["html", "out/../blueprint.config.yaml"],
  ] as const) {
    assert.deepEqual(problems({ [field]: value }), [
      `L0 blueprint.config.yaml: ${field} '${value}' is blueprint.config.yaml — the build reads that file itself`,
    ], `${field}: ${value}`);
  }
  assert.deepEqual(problems({ html: "blueprint.config.yaml.html", prompts_md: "../blueprint.config.yaml" }), [],
    "a name that only starts like it, and a file of the same name in the parent");
});

test("html and prompts_md naming an existing folder are L0: the build writes one file there", () => {
  const parent = mkdtempSync(join(tmpdir(), "lb-paths-"));
  try {
    const root = join(parent, "blueprint");
    mkdirSync(join(root, "out"), { recursive: true });
    mkdirSync(join(parent, "prompts"));
    const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(root, cfg, "blueprint.config.yaml");
    for (const [field, value] of [["html", "."], ["html", "out"], ["prompts_md", "../prompts"], ["prompts_md", "out/"]] as const) {
      assert.deepEqual(problems({ [field]: value }), [
        `L0 blueprint.config.yaml: ${field} '${value}' is an existing folder — give it a file name`,
      ], `${field}: ${value}`);
    }
    assert.deepEqual(problems({ html: "out/page.html", prompts_md: "../prompts/01-PROMPTS.md" }), [], "a file inside those folders");
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("html and prompts_md ending in / name a folder, existing or not: L0", () => {
  const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(ROOT, cfg, "blueprint.config.yaml");
  for (const [field, value] of [["html", "out/"], ["prompts_md", "../prompts/"], ["html", "out/."], ["prompts_md", "out/x/.."]] as const) {
    assert.deepEqual(problems({ [field]: value }), [
      `L0 blueprint.config.yaml: ${field} '${value}' names a folder — give it a file name`,
    ], `${field}: ${value}`);
  }
  assert.deepEqual(problems({ html: "out/page.html", prompts_md: "../prompts/x.md" }), [], "a file name after the slash");
});

test("html and prompts_md naming the same file: L0, one would overwrite the other", () => {
  const problems = (cfg: { html?: string; prompts_md?: string }) => configPathProblems(ROOT, cfg, "blueprint.config.yaml");
  for (const [html, prompts] of [["page.html", "page.html"], ["out/page.html", "./out/../out/page.html"], [undefined, "blueprint.html"]] as const) {
    assert.deepEqual(problems({ html, prompts_md: prompts }), [
      `L0 blueprint.config.yaml: prompts_md '${prompts}' is the same file as html '${html ?? "blueprint.html"}' — give each its own`,
    ], `${html}: ${prompts}`);
  }
  assert.deepEqual(problems({ html: "page.html", prompts_md: "page.md" }), [], "two files");
  assert.deepEqual(problems({ prompts_md: "../blueprint.html" }), [], "the default html's name, elsewhere");
});
