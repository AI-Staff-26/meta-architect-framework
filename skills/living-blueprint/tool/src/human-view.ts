import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BuildError } from "./agent-view.ts";
import { GENERATOR } from "./model.ts";
import type { Blueprint } from "./model.ts";
import { get, pyJson, pyStr, truthy } from "./py.ts";
import type { Config } from "./schema.ts";

// The human view: one HTML file — template.html with the stylesheet, the data and the app inlined.

export interface Renderer {
  template: string;
  css: string;
  app: string;
}

export function readRenderer(dir: string): Renderer {
  const read = (name: string) => readFileSync(join(dir, name), "utf8");
  return { template: read("template.html"), css: read("styles.css"), app: read("app.js") };
}

function htmlEscape(s: unknown): string {
  return pyStr(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** JSON that stays data inside <script>. Every "<" becomes \u003c, so no string can end the element ("</script") or
 * switch the parser into a state where the next "</script>" does not end it ("<!--<script"); U+2028 and U+2029 are
 * escaped for JavaScript engines older than ES2019, which read them as line breaks. `<` only occurs inside JSON strings,
 * where the escape means the same character. */
function scriptJson(json: string): string {
  return json.replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

/** Every marker of the template in one pass: substituted text is never scanned again, so data that contains
 * `__APP__` stays data. A replacer function also keeps app.js's `$&` literal. */
function fill(template: string, values: Readonly<Record<string, string>>): string {
  const markers = new RegExp(Object.keys(values).join("|"), "g");
  return template.replace(markers, (marker) => values[marker] ?? marker);
}

export function humanView(bp: Blueprint, cfg: Config, renderer: Renderer): string {
  const data = scriptJson(pyJson(bp));
  if (renderer.app.toLowerCase().includes("</script")) throw new BuildError("app.js contains </script");
  const title = truthy(cfg.page_title) ? cfg.page_title : get(bp.meta, "title", "Blueprint");
  return fill(renderer.template, {
    __TITLE__: htmlEscape(title),
    __GENERATOR__: GENERATOR,
    __CSS__: renderer.css,
    __DATA__: data,
    __APP__: renderer.app,
  });
}
