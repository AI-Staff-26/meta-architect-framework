import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { humanView, readRenderer } from "../src/human-view.ts";
import { load } from "../src/load.ts";
import type { Blueprint } from "../src/model.ts";
import { isRecord } from "../src/py.ts";
import { CSS_COLOR } from "../src/schema.ts";
import type { Config } from "../src/schema.ts";
import { baseBlueprint, contractOf, transitionOf, writeBlueprint } from "./support.ts";
import type { BlueprintFiles } from "./support.ts";

// The human view: what the page's own script puts into the DOM, and how the data sits inside the page. app.js runs in
// node:vm against a stub of the few DOM calls it makes; every HTML string and attribute value it hands over is recorded.

const RENDERER = readRenderer(join(import.meta.dirname, "..", "renderer"));

test("the colour grammar is one: the build's L0 check and the page's cssColor use the same regex", () => {
  const declared = /^\s*var CSS_COLOR = \/(.+)\/([a-z]*);$/m.exec(RENDERER.app);
  assert.ok(declared, "app.js declares var CSS_COLOR = /…/;");
  assert.equal(declared[1], CSS_COLOR.source);
  assert.equal(declared[2], CSS_COLOR.flags);
});

// ---------------------------------------------------------------- the page around the data

const DATA_OPEN = "<script>\nwindow.BP = ";
const SCRIPT_OPEN = "<script>\n";
const SCRIPT_CLOSE = "</script";

/** The page's two scripts as the HTML parser splits them. Script data ends at the first "</script" — unless a "<!--"
 * came before it, after which a "<script" makes the parser swallow the next "</script>" too. So the data script is
 * checked to hold neither before the split is trusted. */
function scriptsOf(page: string): { data: string; app: string } {
  const lower = page.toLowerCase();
  const dataStart = page.indexOf(DATA_OPEN) + DATA_OPEN.length;
  const dataEnd = lower.indexOf(SCRIPT_CLOSE, dataStart);
  const data = page.slice(dataStart, dataEnd);
  assert.doesNotMatch(data, /<!--|<\/?script/i, "the data script holds no comment opener and no script tag");
  const appStart = page.indexOf(SCRIPT_OPEN, dataEnd) + SCRIPT_OPEN.length;
  return { data, app: page.slice(appStart, lower.indexOf(SCRIPT_CLOSE, appStart)) };
}

/** The base blueprint, loaded as the build loads it. */
function loaded(b: BlueprintFiles = baseBlueprint()): { bp: Blueprint; cfg: Config } {
  const root = writeBlueprint(b);
  try {
    const { bp, cfg, shapeBroken, problems } = load(root);
    assert.ok(!shapeBroken, problems.join("\n"));
    return { bp, cfg };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** The data the page embeds, parsed back. */
function embedded(page: string): Blueprint {
  const { data, app } = scriptsOf(page);
  assert.equal(app, `${RENDERER.app}\n`, "the app script is app.js, whole");
  return JSON.parse(data.replace(/;\n$/, "")) as Blueprint;
}

test("data with «<!--<script» leaves the app script intact; the JSON parses and keeps every character", () => {
  const { bp, cfg } = loaded();
  const title = "Начало <!--<script> </script> середина\u2028конец\u2029";
  Object.assign(bp.journeys[0] ?? {}, { title });
  const page = humanView(bp, cfg, RENDERER);
  const { data } = scriptsOf(page);
  assert.ok(!data.includes("\u2028") && !data.includes("\u2029"), "U+2028 and U+2029 are escaped");
  assert.ok(!data.includes(" ") && !data.includes(" "), "U+2028 and U+2029 are escaped");
  assert.equal(embedded(page).journeys[0]?.title, title);
});

test("data with «__APP__» stays data: markers are filled in one pass", () => {
  const { bp, cfg } = loaded();
  const title = "см. __APP__ и __CSS__ здесь";
  Object.assign(bp.journeys[0] ?? {}, { title });
  cfg.page_title = "Блюпринт __DATA__ & <__APP__>";
  const page = humanView(bp, cfg, RENDERER);
  assert.equal(embedded(page).journeys[0]?.title, title);
  assert.ok(page.includes("<title>Блюпринт __DATA__ &amp; &lt;__APP__&gt;</title>"), page.slice(0, 300));
});

test("the page loads nothing from elsewhere: no <link>, no @import, no url(), no remote address", () => {
  const { bp, cfg } = loaded();
  const page = humanView(bp, cfg, RENDERER);
  // url(#marker) points into the page itself.
  assert.doesNotMatch(page, /<link\b|@import|url\(\s*['"]?[^#)'"\s]/i);
  // The SVG namespace is a name, not a request.
  assert.deepEqual(page.match(/https?:\/\/[^\s"')]+/g)?.filter((url) => url !== "http://www.w3.org/2000/svg") ?? [], []);
});

// ---------------------------------------------------------------- what app.js puts into the DOM

/** Dangerous only when it arrives unescaped: it closes an attribute and opens a tag, or ends the script and starts one. */
const MARK = "\"><img src=x onerror=alert(1)></script><script>alert(2)</script>";
const RAW_MARKS = ["<img src=x onerror=", "<script>alert(2)"];
const ESCAPED_MARK = "&quot;&gt;&lt;img src=x onerror=alert(1)&gt;";
/** A colour that is valid CSS and still fetches from elsewhere: only the colour grammar keeps it out. */
const REMOTE_COLOR = "red;background:url(https://evil.example/x)";

/** Every optional field the renderer prints, so each of its branches has something to print. */
function richBlueprint(): BlueprintFiles {
  const b = baseBlueprint();
  Object.assign(b.meta.meta ?? {}, {
    status: "черновик", rules: ["Правило **одно**"], promptsLead: "Промпты", modelsLead: "Модели", divLead: "Расхождения",
    labels: {
      div_tab: "Расхождения", div_title: "Бриф ↔ ТЗ", div_owner: "Бриф", div_spec: "ТЗ", div_proposal: "Предложение",
      example_of: "на примере",
    },
    as_is: { title: "Как сейчас", body: "- пункт" },
  });
  b.meta.lanes = [
    { id: "user", title: "Человек", hint: "делает", color: "var(--lane-user)" },
    { id: "screen", title: "Экран", hint: "видит", color: "#abc" },
    { id: "engine", title: "Движок", hint: "считает", color: "teal" },
    { id: "models", title: "Модели", hint: "отвечают", color: "#a1b2c3d4" },
    { id: "data", title: "Данные", hint: "пишутся", color: "var(--lane-data)" },
  ];
  b.meta.models = [{
    key: "llm", name: "LLM", provider: "google", used_for: "сводка", where: "облако", params: "t=0", cost: "$1", note: "—",
    external: true, slow: true,
  }];
  Object.assign(b.journey, {
    tab: "Оплата", lead: "Путь **оплаты**", check: ["проверить `код`"],
    seq: {
      title: "Вызовы",
      actors: [{ id: "u", label: "Человек", color: "var(--lane-user)" }, { id: "s", label: "Сервер", color: "#15171c" }],
      msgs: [{ from: "u", to: "s", text: "платит" }, { from: "s", to: "s", text: "проверяет", dashed: true }],
    },
  });
  Object.assign(b.journey.steps[0] ?? {}, {
    cells: { user: "создаёт", screen: "форма", engine: "пишет", models: "—", data: "строка" },
    models: ["llm"], prompts: ["p1"], refs: ["ТЗ 1.1"],
    detail: {
      user: "Нажимает\n- кнопку", hood: "Код **пишет**", data: "orders", states: "ошибки", divergence: "расхождение", calls: ["c1"],
      mock: "# Заказ\n[Создать] [(Отмена)]\n[Одна]\n[(Призрак)]\n{сумма}\n☑ согласен\n> подсказка\nтекст",
    },
  });
  Object.assign(contractOf(b, "s1"), {
    journal: ["запись"], budget: "1 ₽",
    also: [{
      id: "list", method: "GET", path: "/orders", purpose: "список", actor: ["customer"], flag: "payments",
      responses: { "200": "[…]" }, errors: { "404": "нет — «Не нашли»" },
    }],
    ui: { empty: "пусто", loading: "ждём", error: "ошибка", disabled_when: [{ when: "нет денег", says: "Пополните" }] },
  });
  Object.assign((contractOf(b, "s2").fixtures as object[])[0] ?? {}, { provider_response: "c1" });
  Object.assign(transitionOf(b, "order", "O02"), {
    guard: "сумма > 0", may_write: { ref: "ссылка" }, with: ["order.O03"], saves_previous: true, says: "Ждём", compensation: "—",
  });
  transitionOf(b, "order", "O03").failures = [{
    class: "timeout", detect: "нет колбэка", to: "failed", says: "Не дождались", compensation: "вернуть", event: "PayFailed",
    retry: "worker", attempts: 3, backoff: "1m", retry_via: "POST /orders/{id}:pay", retry_note: "вручную",
  }];
  Object.assign(b.entities.order ?? {}, { note: "Заметка о **заказе**" });
  Object.assign(b.calls.calls?.c1 ?? {}, {
    when: "при оплате", params: "t=0", latency: "2 с", cost: "$0.01", failure: "- повтор", requestNote: "как в журнале",
  });
  b.calls.divergences = [
    { id: "d1", area: "Оплата", status: "keep", owner: "—", tz: "—", proposal: "—" },
    { id: "d2", area: "Возврат", status: "discuss", owner: "владелец", tz: "ТЗ", proposal: "иначе" },
  ];
  b.calls.notes = [{
    id: "n1", tab: "Заметки", title: "Заметка", lead: "Вводная", cards: [{ title: "Карточка", body: "- пункт" }],
    seq: { title: "Колбэк", actors: [{ id: "p", label: "Провайдер", color: "#fff" }], msgs: [{ from: "p", to: "p", text: "шлёт" }] },
  }];
  Object.assign(b.prompts.p1 ?? {}, {
    version: "v2", lang: "ru", stage: "оплата", purpose: "Сводка", user: "Документ {{doc}}", output: "{\"summary\": \"…\"}",
    example: { note: "пример", input: "Документ", output: "{\"summary\": \"…\"}" }, notes: "заметки", source: "чат",
  });
  return b;
}

/** Map fields whose keys the renderer prints or matches against values: they get the mark too, so a reference still
 * finds its target. Entity names keep theirs — a contract names a transition as `<entity>.<id>`, and a mark after the id
 * keeps that reference whole. */
const MAP_FIELDS = new Set([
  "contracts", "calls", "prompts", "states", "fields", "writes", "may_write", "responses", "errors", "params", "flags",
  "before", "after",
]);

/** `value` with MARK after every string, and after the keys of MAP_FIELDS maps. */
function marked(value: unknown, field = ""): unknown {
  if (typeof value === "string") return value + MARK;
  if (Array.isArray(value)) return value.map((item) => marked(item));
  if (!isRecord(value)) return value;
  const rename = MAP_FIELDS.has(field);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [rename ? k + MARK : k, marked(v, k)]));
}

/** The rich blueprint with MARK in every string — and in an entity name and a lane id, the keys `marked` leaves alone.
 * Two colours fetch from elsewhere: the build refuses them (L0), so they are set after the load, as a page built by an
 * older tool would hold them. */
function markedBlueprint(): { bp: Blueprint; cfg: Config } {
  const { bp, cfg } = loaded(richBlueprint());
  Object.assign(bp.lanes.at(-1) ?? {}, { color: REMOTE_COLOR });
  Object.assign(bp.journeys[0]?.seq?.actors[0] ?? {}, { color: REMOTE_COLOR });
  const out = marked(bp) as Blueprint;
  // Lane ids pick the cells and the chips of a lane: they stay, and one more lane carries the mark.
  out.lanes.forEach((lane, i) => Object.assign(lane, { id: bp.lanes[i]?.id }));
  out.lanes.push({ id: `lane${MARK}`, title: "Ещё", hint: "—", color: REMOTE_COLOR });
  const order = out.entities.order;
  assert.ok(order);
  out.entities[`order${MARK}`] = order;
  return { bp: out, cfg };
}

type Listener = (event: { target: StubElement }) => void;

/** The part of a DOM element app.js touches. Records every HTML string and every attribute value it is given. */
class StubElement {
  textContent = "";
  readonly classList = { add: () => {}, remove: () => {}, contains: () => false };
  readonly children: StubElement[] = [];
  readonly listeners: Listener[] = [];
  readonly sinks: string[];
  #html = "";

  constructor(sinks: string[]) {
    this.sinks = sinks;
  }

  get innerHTML(): string {
    return this.#html;
  }

  set innerHTML(html: string) {
    this.#html = html;
    this.children.length = 0;
    this.sinks.push(html);
  }

  /** el(): the markup was recorded when it was set; the element it makes only needs to take listeners. */
  get firstElementChild(): StubElement {
    return new StubElement(this.sinks);
  }

  appendChild(child: StubElement): StubElement {
    this.children.push(child);
    return child;
  }

  setAttribute(_name: string, value: unknown): void {
    this.sinks.push(String(value));
  }

  getAttribute(): null {
    return null;
  }

  addEventListener(_type: string, listener: Listener): void {
    this.listeners.push(listener);
  }

  click(): void {
    for (const listener of this.listeners) listener({ target: this });
  }

  querySelectorAll(): StubElement[] {
    return [];
  }

  closest(): null {
    return null;
  }

  contains(): boolean {
    return false;
  }

  focus(): void {}

  scrollIntoView(): void {}
}

/** A window for the page's scripts: the DOM stub, a location and a history. It has no localStorage and no matchMedia —
 * a browser that offers neither — unless a test adds them to `context`. */
interface PageWindow {
  context: vm.Context;
  /** <html>: the head script puts the theme on its dataset. */
  root: { dataset: Record<string, string> };
  element: (selector: string) => StubElement;
  /** Sets the hash and fires hashchange, as following a link does. */
  go: (hash: string) => void;
}

function pageWindow(sinks: string[]): PageWindow {
  const elements = new Map<string, StubElement>();
  const element = (selector: string) => {
    const found = elements.get(selector) ?? new StubElement(sinks);
    elements.set(selector, found);
    return found;
  };
  const root = { dataset: {} };
  const location = { hash: "" };
  let onHashChange = () => {};
  const context = vm.createContext({
    document: {
      documentElement: root,
      body: new StubElement(sinks), activeElement: null, querySelector: element, querySelectorAll: () => [],
      getElementById: (id: string) => element(`#${id}`), createElement: () => new StubElement(sinks), addEventListener: () => {},
    },
    location,
    history: { replaceState: (_state: unknown, _title: string, url: string) => { location.hash = url; } },
    navigator: {},
    setTimeout: (fn: () => void) => fn(),
    addEventListener: (type: string, fn: () => void) => { if (type === "hashchange") onHashChange = fn; },
  });
  context.window = context;
  const go = (hash: string) => {
    location.hash = hash;
    onHashChange();
  };
  return { context, root, element, go };
}

/** Runs the page's data and app scripts in `win` — not the head script. */
function runApp(page: string, win: PageWindow): void {
  const { data, app } = scriptsOf(page);
  vm.runInContext(`window.BP = ${data}`, win.context);
  vm.runInContext(app, win.context);
}

/** Runs the page's scripts, opens every view, drawer, prompt and call, and returns what reached the DOM. */
function renderEverything(page: string): string[] {
  const sinks: string[] = [];
  const win = pageWindow(sinks);
  const { context, element, go } = win;
  runApp(page, win);
  // No head script ran, so there is no window.LB_THEME: the theme button takes a click and nothing throws.
  element("#theme").click();

  const id = (x: unknown) => encodeURIComponent(String(x));
  const bp = context.BP as Blueprint;
  for (const j of bp.journeys) {
    go(`#j=${id(j.id)}`);
    for (const s of j.steps) go(`#j=${id(j.id)}&s=${id(s.id)}`);
  }
  for (const view of ["states", "prompts", "models", "div", "agent"]) go(`#t=${view}`);
  for (const name of Object.keys(bp.entities)) go(`#t=states&e=${id(name)}`);
  for (const d of bp.divergences) go(`#t=div&d=${id(d.id)}`);
  for (const n of bp.notes) go(`#n=${id(n.id)}`);
  for (const [kind, ids] of [["p", Object.keys(bp.prompts)], ["c", Object.keys(bp.calls)]] as const) {
    for (const x of ids) {
      go(`#${kind}=${id(x)}`);
      for (const tab of [...element("#modal-tabs").children]) tab.click();
    }
  }
  return sinks;
}

test("no data value reaches the DOM unescaped: text and ids are escaped, colours pass the colour grammar or fall back", () => {
  const { bp, cfg } = markedBlueprint();
  const sinks = renderEverything(humanView(bp, cfg, RENDERER));

  const raw = sinks.flatMap((html) => RAW_MARKS.filter((m) => html.includes(m))
    .map((m) => html.slice(Math.max(0, html.indexOf(m) - 60), html.indexOf(m) + m.length)));
  assert.deepEqual(raw, [], "markup the data opened");
  assert.deepEqual(sinks.filter((html) => html.includes("evil.example")), [], "a colour outside the colour grammar");

  // Every view was drawn, and the marks reached the renderer through each place the review found unescaped.
  const all = sinks.join("\n");
  for (const [where, expected] of [
    ["drawer", "Контракт шага"], ["state machines", "Машина состояний"], ["sequence diagram", "Диаграмма последовательности"],
    ["prompt catalog", "Каталог промптов"], ["prompt modal tabs", "Переменная</th>"], ["call modal", "Ответ провайдера"],
    ["note", "grid-cards"], ["agent view", "Вид для агентов"],
    ["text", ESCAPED_MARK],
    ["journey tab id", `data-view="j:checkout${ESCAPED_MARK}`],
    ["note tab id", `data-view="n:n1${ESCAPED_MARK}`],
    ["divergences tab caption", `>Расхождения${ESCAPED_MARK}`],
    ["lane id in a class", `class="lane-label lane-lane${ESCAPED_MARK}`],
    ["lane colour falls back", "--lane-color:var(--muted)"],
    ["seq actor colour falls back", 'style="stroke:var(--ink)"'],
    ["provider colour falls back", "--c:var(--p-code)"],
  ] as const) {
    assert.ok(all.includes(expected), `${where}: ${expected}`);
  }
});

// ---------------------------------------------------------------- the theme

const THEME_KEY = "living-blueprint:theme";

/** The page's script in <head>, the one that runs before the stylesheet applies. */
function headScriptOf(page: string): string {
  const head = page.slice(0, page.indexOf("<style>"));
  const start = head.indexOf(SCRIPT_OPEN);
  assert.ok(start >= 0, "a script in <head>, before <style>");
  return head.slice(start + SCRIPT_OPEN.length, head.toLowerCase().indexOf(SCRIPT_CLOSE, start));
}

/** A system that prefers dark, as matchMedia answers it. */
function darkSystem(query: string): { matches: boolean; addEventListener: () => void; removeEventListener: () => void } {
  return { matches: query === "(prefers-color-scheme: dark)", addEventListener: () => {}, removeEventListener: () => {} };
}

/** A system whose colour scheme the test switches: matchMedia's answer to the dark query, and the change listeners the
 * page holds on it. */
function switchableSystem(): { matchMedia: (query: string) => unknown; listeners: Set<() => void>; prefer: (dark: boolean) => void } {
  const listeners = new Set<() => void>();
  const darkQuery = {
    matches: false,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  return {
    matchMedia: (query: string) => (query === "(prefers-color-scheme: dark)" ? darkQuery : darkSystem(query)),
    listeners,
    prefer: (dark: boolean) => {
      darkQuery.matches = dark;
      for (const listener of listeners) listener();
    },
  };
}

/** Opens the page as a browser does — the head script, then the data and the app — with `storage` read on every access
 * to window.localStorage, on a system that prefers dark unless `matchMedia` says otherwise. `read()` gives the theme on
 * <html> and the button's caption. */
function openThemed(
  page: string, storage: () => unknown, matchMedia: (query: string) => unknown = darkSystem,
): { read: () => { theme?: string; caption: string }; click: () => void } {
  const win = pageWindow([]);
  Object.defineProperty(win.context, "localStorage", { get: storage });
  win.context.matchMedia = matchMedia;
  vm.runInContext(headScriptOf(page), win.context);
  runApp(page, win);
  const button = win.element("#theme");
  return {
    read: () => ({ theme: win.root.dataset.theme, caption: button.textContent }),
    click: () => button.click(),
  };
}

test("storage that throws on access: the page opens without an error, in auto, and the mode still cycles for the session", () => {
  const { bp, cfg } = loaded();
  const page = humanView(bp, cfg, RENDERER);
  const view = openThemed(page, () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  });
  assert.deepEqual(view.read(), { theme: "dark", caption: "Тема: авто" }, "auto resolves to the system's dark");
  view.click();
  assert.deepEqual(view.read(), { theme: "light", caption: "Тема: светлая" });
  view.click();
  assert.deepEqual(view.read(), { theme: "dark", caption: "Тема: тёмная" });
});

test("a stored value other than light or dark counts as auto and never reaches data-theme", () => {
  const { bp, cfg } = loaded();
  const page = humanView(bp, cfg, RENDERER);
  const asked = new Set<string>();
  const storage = {
    getItem: (key: string) => {
      asked.add(key);
      return "evil";
    },
    setItem: () => {},
    removeItem: () => {},
  };
  const view = openThemed(page, () => storage);
  assert.deepEqual([...asked], [THEME_KEY]);
  assert.deepEqual(view.read(), { theme: "dark", caption: "Тема: авто" });
});

test("an explicit mode does not follow the system; auto follows it, and only auto listens", () => {
  const { bp, cfg } = loaded();
  const page = humanView(bp, cfg, RENDERER);
  const stored = new Map([[THEME_KEY, "light"]]);
  const storage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
    removeItem: (key: string) => stored.delete(key),
  };
  const system = switchableSystem();
  const view = openThemed(page, () => storage, system.matchMedia);

  // Light is stored: the system turning dark changes nothing, and nothing listens to it.
  system.prefer(true);
  assert.deepEqual(view.read(), { theme: "light", caption: "Тема: светлая" });
  assert.equal(system.listeners.size, 0, "no change listener while a mode is stored");

  // light → dark → auto: the key goes, the page listens, and it follows the system both ways.
  view.click();
  view.click();
  assert.equal(stored.has(THEME_KEY), false);
  assert.equal(system.listeners.size, 1, "one change listener in auto");
  assert.deepEqual(view.read(), { theme: "dark", caption: "Тема: авто" });
  system.prefer(false);
  assert.equal(view.read().theme, "light");

  // auto → light: explicit again, so it stops listening, and the system turning dark leaves it light.
  view.click();
  assert.equal(system.listeners.size, 0, "the listener goes with auto");
  system.prefer(true);
  assert.deepEqual(view.read(), { theme: "light", caption: "Тема: светлая" });
});

/** The declarations of the first rule `opener` finds in `css`, by property. Values hold no braces, so the rule ends at
 * the first "}". */
function declarationsAfter(css: string, opener: RegExp): Map<string, string> {
  const found = opener.exec(css);
  assert.ok(found, `a rule matching ${opener}`);
  const start = found.index + found[0].length;
  const body = css.slice(start, css.indexOf("}", start)).replace(/\/\*[\s\S]*?\*\//g, "");
  return new Map(body.split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
    const colon = d.indexOf(":");
    return [d.slice(0, colon).trim(), d.slice(colon + 1).trim()] as const;
  }));
}

test("print is light in either theme: the print copy restores every declaration the dark block overrides, to its light value", () => {
  const css = RENDERER.css;
  // JS resolves auto, so the stylesheet holds one dark block and no prefers-color-scheme copy of it.
  assert.doesNotMatch(css, /prefers-color-scheme/);
  const light = declarationsAfter(css, /^:root \{/m);
  const dark = declarationsAfter(css, /^:root\[data-theme="dark"\] \{/m);
  const print = declarationsAfter(css, /@media print \{\s*:root\[data-theme="dark"\] \{/);
  assert.ok(dark.size > 0);
  assert.deepEqual([...print.keys()].sort(), [...dark.keys()].sort(), "the same declarations in the dark block and its print copy");
  for (const [name, value] of print) assert.equal(value, light.get(name), `${name} in print is its light value`);
});

test("app.js writes no literal colour outside its comments: SVG colours come from classes, data colours pass cssColor", () => {
  // app.js has a block comment at the top and whole-line // comments; the only "//" inside code is the SVG namespace.
  const code = RENDERER.app.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const LITERAL_COLOUR =
    /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(?:white|black)(?![\w-])/gi;
  assert.deepEqual(code.match(LITERAL_COLOUR) ?? [], []);
});

// ---------------------------------------------------------------- the copy button

/** Enough of a DOM for the copy button: the element tree app.js wrote, closest(), querySelector() and textContent. */
class ParsedElement {
  readonly tagName: string;
  readonly attributes: ReadonlyMap<string, string>;
  readonly parentElement: ParsedElement | null;
  readonly nodes: (ParsedElement | string)[] = [];
  onclick: (() => void) | null = null;

  constructor(tagName: string, attributes: ReadonlyMap<string, string>, parentElement: ParsedElement | null) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.parentElement = parentElement;
  }

  /** A tag name or an attribute selector, "[name]" — the two kinds app.js asks for here. */
  matches(selector: string): boolean {
    const attribute = /^\[([\w-]+)\]$/.exec(selector)?.[1];
    return attribute === undefined ? this.tagName === selector : this.attributes.has(attribute);
  }

  closest(selector: string): ParsedElement | null {
    return this.matches(selector) ? this : (this.parentElement?.closest(selector) ?? null);
  }

  querySelectorAll(selector: string): ParsedElement[] {
    return this.nodes.flatMap((node) =>
      typeof node === "string" ? [] : [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]);
  }

  querySelector(selector: string): ParsedElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  get textContent(): string {
    return this.nodes.map((node) => (typeof node === "string" ? node : node.textContent)).join("");
  }
}

const VOID_TAGS = new Set(["br", "hr", "img", "input"]);
const ENTITIES: Readonly<Record<string, string>> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/** Parses the markup app.js writes, which is well-formed: tags, double-quoted attributes, and text whose only entities
 * are the five esc() makes. */
function parseHtml(html: string): ParsedElement {
  const root = new ParsedElement("#root", new Map(), null);
  let open = root;
  for (const [token] of html.matchAll(/<\/?[a-z][^>]*>|[^<]+/gi)) {
    if (token.startsWith("</")) {
      open = open.parentElement ?? root;
    } else if (!token.startsWith("<")) {
      open.nodes.push(token.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity));
    } else {
      const [, tag = "", rest = ""] = /^<([a-z0-9]+)([^>]*?)\/?>$/i.exec(token) ?? [];
      const attributes = new Map([...rest.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1] ?? "", m[2] ?? ""] as const));
      const element = new ParsedElement(tag.toLowerCase(), attributes, open);
      open.nodes.push(element);
      if (!VOID_TAGS.has(element.tagName) && !token.endsWith("/>")) open = element;
    }
  }
  return root;
}

test("«Скопировать» copies the text of its own block and says so", () => {
  const b = baseBlueprint();
  const system = "Кратко перескажи {{doc}}\n// без оценок";
  const user = 'Документ <{{doc}}> & "кавычки"';
  Object.assign(b.prompts.p1 ?? {}, { system, user });
  const { bp, cfg } = loaded(b);
  const win = pageWindow([]);
  const copied: string[] = [];
  win.context.navigator = {
    clipboard: {
      writeText: (text: string) => {
        copied.push(text);
        return { then: (done: () => void) => done() };
      },
    },
  };
  // bindCopy() looks for the buttons in the document, right after the modal body is written: they come from that body.
  let buttons: ParsedElement[] = [];
  win.context.document.querySelectorAll = (selector: string) =>
    (buttons = parseHtml(win.element("#modal-body").innerHTML).querySelectorAll(selector));
  runApp(humanView(bp, cfg, RENDERER), win);
  win.go("#p=p1");

  assert.equal(buttons.length, 2, "a button for System and one for User");
  for (const button of buttons) button.onclick?.();
  assert.deepEqual(copied, [system, user]);
  assert.equal(win.element("#toast").textContent, "Скопировано");
});
