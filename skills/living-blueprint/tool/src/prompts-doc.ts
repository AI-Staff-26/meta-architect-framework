import type { Blueprint } from "./model.ts";
import { get, py, pyStr, rstrip, strip, truthy } from "./py.ts";
import type { Config } from "./schema.ts";

// The prompt catalog as one Markdown document for people (config `prompts_md`).

const NO_VERSION = "v0";

const fence = (lang: string, t: unknown) => (truthy(t) ? `\`\`\`${lang}\n${rstrip(pyStr(t))}\n\`\`\`\n` : "");

export function promptsDoc(bp: Blueprint, cfg: Config): string {
  const names = new Map<string, unknown>(bp.models.map((m) => [m.key, m.name]));
  const modelName = (key: unknown) => (typeof key === "string" && names.has(key) ? names.get(key) : key);
  const out: string[] = [
    py`# ${get(cfg, "prompts_md_title", "Промпты")}\n`,
    py`*Собрано из \`src/prompts/*.yaml\` сборкой блюпринта. Тот же каталог — во вкладке «Промпты» файла \`${cfg.html}\`. `
      + "`{{переменная}}` подставляет код. Примеры ответов — иллюстрация, не результат модели.*\n",
    "| Шаг | Что делает | Модель | Где в пути |", "|---|---|---|---|",
  ];
  const prompts = Object.values(bp.prompts);
  for (const p of prompts) out.push(py`| \`${p.step}\` | ${p.title} | ${modelName(p.model)} | ${get(p, "stage", "")} |`);
  out.push("");
  for (const p of prompts) {
    out.push(py`## ${p.title} — \`${p.step}\`\n`);
    out.push(py`- **Модель:** ${modelName(p.model)}; версия ${get(p, "version", NO_VERSION)}; язык промпта — ${get(p, "lang", "ru")}.`);
    if (truthy(p.stage)) out.push(py`- **Где в пути:** ${p.stage}.`);
    out.push("");
    if (truthy(p.purpose)) out.push(strip(pyStr(p.purpose)) + "\n");
    for (const [k, title, lang] of [
      ["system", "System", "text"], ["user", "User (задание)", "text"], ["output", "Формат ответа", "json"],
    ] as const) {
      if (truthy(p[k])) out.push(`### ${title}\n`, fence(lang, p[k]));
    }
    if (truthy(p.vars)) {
      out.push("### Переменные\n", "| Переменная | Откуда берётся |", "|---|---|");
      for (const v of p.vars ?? []) out.push(py`| \`{{${v[0]}}}\` | ${v[1]} |`);
      out.push("");
    }
    const ex = p.example;
    if (ex && truthy(ex)) {
      out.push("### Пример (иллюстрация)\n");
      if (truthy(ex.note)) out.push(strip(pyStr(ex.note)) + "\n");
      if (truthy(ex.input)) out.push("**Что уходит в модель:**\n", fence("text", ex.input));
      if (truthy(ex.output)) out.push("**Что возвращается:**\n", fence("json", ex.output));
    }
    if (truthy(p.notes)) out.push("### Заметки\n", strip(pyStr(p.notes)) + "\n");
    if (truthy(p.source)) out.push(py`*Источник: ${p.source}*\n`);
  }
  return out.join("\n");
}
