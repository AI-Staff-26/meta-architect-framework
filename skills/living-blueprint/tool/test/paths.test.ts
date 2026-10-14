import assert from "node:assert/strict";
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
