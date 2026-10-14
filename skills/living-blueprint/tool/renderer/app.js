/* Living blueprint renderer (schema v1.2).
 * Content lives in src/data/*.js and fills window.BP:
 *   BP.meta        {title, subtitle, version, date, status}
 *   BP.lanes       [{id, title, hint, color}]          ids: user, screen, engine, models, data
 *   BP.models      [{key, name, provider, where, params, cost, used_for, note}]
 *   BP.journeys    [{id, title, lead, check[], steps[], seq}]
 *       step: {id, title, cells:{user,screen,engine,models,data}, models[], prompts[], div[], refs[],
 *              detail:{user, mock, hood, calls[], states, divergence}}
 *   BP.calls       {id: {title, step, model, params, prompt, when, request, response, cost, latency, failure}}
 *   BP.prompts     {id: {title, step, model, version, lang, purpose, system, user, vars[[n,d]], example{input,output}, notes, source}}
 *   BP.divergences [{id, area, owner, tz, proposal, status}]
 *   BP.notes       [{id, title, lead, cards[{title, body}]}]
 * Text fields are a small markdown subset: paragraphs, "- " lists, **bold**, `code`, [label](#hash).
 */
(function () {
  "use strict";
  var BP = window.BP;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var state = { view: null, filter: "all", query: "", opener: null, baseHash: "#" };

  // ---------- text helpers ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function inline(s) {
    var t = esc(s);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    t = t.replace(/\[([^\]]+)\]\((#[^)\s]+)\)/g, '<a href="$2">$1</a>');
    if (state.query) t = markQuery(t);
    return t;
  }
  function markQuery(html) {
    var q = state.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!q) return html;
    var re = new RegExp("(" + q + ")", "gi");
    return html.split(/(<[^>]+>)/).map(function (part) {
      return part.charAt(0) === "<" ? part : part.replace(re, "<mark>$1</mark>");
    }).join("");
  }
  function md(s) {
    if (!s) return "";
    var lines = String(s).replace(/\r/g, "").split("\n");
    var out = [], para = [], stack = [];
    function flushPara() { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } }
    function closeTo(indent) {
      while (stack.length && stack[stack.length - 1].indent > indent) out.push("</li></" + stack.pop().type + ">");
    }
    function closeAll() { closeTo(-1); }
    lines.forEach(function (line) {
      if (!line.trim()) { flushPara(); closeAll(); return; }
      var m = /^(\s*)([-•]|\d+\.)\s+(.*)$/.exec(line);
      if (m) {
        flushPara();
        var indent = m[1].length, type = /\d/.test(m[2]) ? "ol" : "ul", text = inline(m[3]);
        closeTo(indent);
        var top = stack[stack.length - 1];
        if (!top || indent > top.indent) {
          out.push("<" + type + "><li>" + text); stack.push({ type: type, indent: indent });
        } else if (top.type !== type) {
          out.push("</li></" + stack.pop().type + "><" + type + "><li>" + text); stack.push({ type: type, indent: indent });
        } else {
          out.push("</li><li>" + text);
        }
        return;
      }
      if (/^\s+\S/.test(line) && stack.length) { out.push(" " + inline(line.trim())); return; }
      closeAll(); para.push(line);
    });
    flushPara(); closeAll();
    return out.join("");
  }
  function codeHtml(s, kind) {
    var t = esc(s || "");
    if (kind === "json") {
      t = t.replace(/(&quot;[^&\n]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2');
    }
    t = t.replace(/\{\{([^}]+)\}\}/g, '<span class="v">{{$1}}</span>');
    t = t.replace(/^(\s*(#|\/\/).*)$/gm, '<span class="c">$1</span>');
    return t;
  }
  function mock(s) {
    if (!s) return "";
    return '<div class="mock">' + String(s).trim().split("\n").map(function (l) {
      var x = l.trim();
      if (!x) return "";
      if (/^# /.test(x)) return '<div class="m-title">' + inline(x.slice(2)) + "</div>";
      var btns = x.match(/\[\([^\]]*?\)\]|\[[^\]]+?\]/g);
      if (btns && btns.length > 1 && btns.join("").replace(/\s/g, "") === x.replace(/\s/g, "")) {
        return "<div>" + btns.map(function (b) {
          return /^\[\(/.test(b) ? '<span class="m-btn ghost">' + inline(b.slice(2, -2)) + "</span>" : '<span class="m-btn">' + inline(b.slice(1, -1)) + "</span>";
        }).join(" ") + "</div>";
      }
      if (/^\[\(.+\)\]$/.test(x)) return '<span class="m-btn ghost">' + inline(x.slice(2, -2)) + "</span> ";
      if (/^\[.+\]$/.test(x)) return '<span class="m-btn">' + inline(x.slice(1, -1)) + "</span> ";
      if (/^\{.+\}$/.test(x)) return '<div class="m-field">' + inline(x.slice(1, -1)) + "</div>";
      if (/^[☑☐]/.test(x)) return '<div class="m-check">' + inline(x) + "</div>";
      if (/^> /.test(x)) return '<div class="m-note">' + inline(x.slice(2)) + "</div>";
      return "<div>" + inline(x) + "</div>";
    }).join("") + "</div>";
  }
  // A colour from the data lands in a style or SVG attribute: only a hex colour, var(--name) or a colour keyword passes,
  // so no value can close the attribute or pull in url(). The build checks the same grammar (L0, src/schema.ts).
  var CSS_COLOR = /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|var\(--[A-Za-z0-9_-]+\)|[A-Za-z]+)$/;
  var DEFAULT_LANE_COLOR = "var(--muted)", DEFAULT_ACTOR_COLOR = "#15171c", DEFAULT_PROVIDER_COLOR = "var(--p-code)";
  function cssColor(value, fallback) { return typeof value === "string" && CSS_COLOR.test(value) ? value : fallback; }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function modelByKey(k) { return (BP.models || []).filter(function (m) { return m.key === k; })[0]; }
  function provColor(p) { return cssColor("var(--p-" + (p || "code") + ")", DEFAULT_PROVIDER_COLOR); }
  function modelChip(k) {
    var m = modelByKey(k);
    var name = m ? m.name : k;
    return '<span class="chip dot" style="--c:' + provColor(m && m.provider) + '">' + esc(name) + "</span>";
  }
  function promptChip(id) {
    var p = BP.prompts[id];
    return '<a class="chip prompt" href="#p=' + esc(id) + '">промпт · ' + esc(p ? p.step : id) + "</a>";
  }
  function divChip(id) { return '<a class="chip div" href="#t=div&d=' + esc(id) + '">расхождение</a>'; }
  function refChip(r) { return '<span class="chip ref">' + esc(r) + "</span>"; }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 1400);
  }
  function copy(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Скопировано"); });
  }

  // ---------- contracts and state machines ----------
  function transIndex() {
    if (state.trans) return state.trans;
    var out = {};
    Object.keys(BP.entities || {}).forEach(function (name) {
      (BP.entities[name].transitions || []).forEach(function (t) { out[name + "." + t.id] = { name: name, e: BP.entities[name], t: t }; });
    });
    state.trans = out;
    return out;
  }
  function list(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function label(k, dflt) { return ((BP.meta || {}).labels || {})[k] || dflt; }
  function epIndex() {
    if (state.eps) return state.eps;
    var out = {};
    Object.keys(BP.contracts || {}).forEach(function (sid) {
      var c = BP.contracts[sid];
      if (c.endpoint && typeof c.endpoint === "object") out[c.endpoint.method + " " + c.endpoint.path] = { step: sid, ep: c.endpoint };
      list(c.also).forEach(function (a) { out[a.method + " " + a.path] = { step: sid, ep: a, id: a.id }; });
    });
    state.eps = out;
    return out;
  }
  function withIndex() {
    if (state.withs) return state.withs;
    var out = {};
    Object.keys(BP.entities || {}).forEach(function (name) {
      (BP.entities[name].transitions || []).forEach(function (t) {
        list(t["with"]).forEach(function (w) {
          var a = name + "." + t.id;
          (out[a] = out[a] || []).indexOf(w) < 0 && out[a].push(w);
          (out[w] = out[w] || []).indexOf(a) < 0 && out[w].push(a);
        });
      });
    });
    state.withs = out;
    return out;
  }
  function retryVia(f, t) {
    if (f.retry_via) return list(f.retry_via);
    if (f.retry === "user") return list(t.fired_by).filter(function (fb) { return fb.kind === "endpoint"; }).map(function (fb) { return fb.ref; });
    return [];
  }
  function epBlock(ep, title) {
    var rr = [];
    if (ep.request) rr.push("запрос: " + esc(ep.request));
    Object.keys(ep.responses || {}).forEach(function (k) { rr.push("<b>" + esc(k) + "</b> " + esc(ep.responses[k])); });
    Object.keys(ep.errors || {}).forEach(function (k) { rr.push('<span class="err-line"><b>' + esc(k) + "</b> " + esc(ep.errors[k]) + "</span>"); });
    return (title ? title + "<br>" : "") + rr.join("<br>");
  }
  function epHead(ep) {
    return "<code>" + esc(ep.method + " " + ep.path) + "</code>" + (ep.idempotency ? " · Idempotency-Key" : "") + (ep.price ? " · цена " + esc(ep.price) : " · бесплатно");
  }
  function stateLabel(e, st) {
    if (st === "∅") return "∅";
    var l = (e.states || {})[st];
    return st + (l ? " · " + l : "");
  }
  function transChip(id) {
    var r = transIndex()[id];
    if (!r) return "";
    var t = r.t, to = t.to === "same" ? list(t.from)[0] : t.to;
    return '<a class="chip trans" href="#t=states&e=' + esc(r.name) + '">' + esc(r.name) + ": " + esc(list(t.from).join("/")) + " → " + esc(to) + "</a>";
  }
  function fireText(t) {
    return list(t.fired_by).map(function (f) { return esc({ endpoint: "запрос", event: "событие", timer: "дедлайн", poll: "опрос", callback: "коллбэк" }[f.kind] || f.kind) + " <code>" + esc(f.ref) + "</code>"; }).join(" · ") || "—";
  }
  function failText(f, t) {
    var to = f.to === "same" ? "(остаётся как было)" : f.to === "previous" ? "(возврат в прежнее состояние)" : f.to;
    var via = retryVia(f, t || {});
    var retry = f.retry ? ' <span class="muted">· повтор:</span> ' + esc({ user: "человек", worker: "воркер", none: "нет" }[f.retry] || f.retry) +
      (f.retry === "worker" ? " ×" + esc(f.attempts) + (f.backoff ? ", пауза " + esc(f.backoff) : "") : "") +
      (via.length ? (f.retry === "worker" ? ", затем человек: " : " через ") + via.map(function (v) { return "<code>" + esc(v) + "</code>"; }).join(" или ") : "") +
      (f.retry_note ? " (" + inline(f.retry_note) + ")" : "") : "";
    return '<div class="small err-line"><span class="muted">сбой ' + esc(f["class"]) + ":</span> → " + esc(to) + " · «" + inline(f.says || "") + "»" +
      (f.detect ? ' <span class="muted">· как распознать:</span> ' + inline(f.detect) : "") +
      (f.compensation ? ' <span class="muted">· возврат:</span> ' + inline(f.compensation) : "") + retry +
      (f.event ? ' <span class="muted">· событие</span> <code>' + esc(list(f.event).join(", ")) + "</code>" : "") + "</div>";
  }
  function writesText(t) {
    var w = Object.keys(t.writes || {}).map(function (k) { return "<code>" + esc(k) + "</code> = " + inline(t.writes[k]); });
    var m = Object.keys(t.may_write || {}).map(function (k) { return "<code>" + esc(k) + "</code> = " + inline(t.may_write[k]); });
    return w.join("; ") + (m.length ? (w.length ? "; " : "") + '<span class="muted">может записать:</span> ' + m.join("; ") : "");
  }
  function contractSections(step) {
    var c = step.contract;
    if (!c) return "";
    var out = [], idx = transIndex(), eps = epIndex();
    var ep = c.endpoint, epRef = null;
    if (typeof ep === "string") { epRef = eps[ep]; ep = epRef ? epRef.ep : null; }
    var flag = c.flag ? ((BP.meta.flags || {})[c.flag] || {}) : null;
    var rows = [
      ["Запускает", inline(c.trigger || "—")],
      ["Кто может", esc(list(c.actor).join(", ") || "—")],
      ["Эндпоинт", ep ? epHead(ep) + (epRef ? ' <span class="muted">· описан в шаге <a href="#s=' + esc(epRef.step) + '">' + esc(epRef.step) + "</a></span>" : "") : "—"],
      ["Доставка", '<span class="chip ref">' + esc(c.delivery || "—") + "</span> " + ({ sync: "быстрый запрос-ответ", stream: "поток строк (SSE)", async_job: "фоновая задача, прогресс по SSE", none: "без запроса" }[c.delivery] || "")],
      ["События", list(c.events).map(function (x) { return "<code>" + esc(x) + "</code>"; }).join(" ") || "—"],
      ["Журнал", esc(list(c.journal).join("; ") || "—")],
      ["Бюджет", esc(c.budget || "—")],
      ["Выключатель", c.flag ? "<code>" + esc(c.flag) + "</code>" + (flag.off ? ' <span class="muted">· выключен:</span> ' + inline(flag.off) : "") : "—"]
    ];
    if (ep && !epRef && (ep.request || ep.responses || ep.errors)) rows.push(["Ответы", epBlock(ep)]);
    list(c.also).forEach(function (a) {
      rows.push(["Ещё · " + esc(a.id), epHead(a) + " — " + inline(a.purpose || "") + (a.actor ? ' <span class="muted">· кто: ' + esc(list(a.actor).join(", ")) + "</span>" : "") +
        '<details class="code"><summary>запрос и ответы</summary><div class="small" style="margin-top:6px">' + epBlock(a) + "</div></details>"]);
    });
    list(c.inbound).forEach(function (ib) {
      rows.push(["Входящий", "<code>" + esc(ib.method + " " + ib.path) + "</code><br>авторизация: " + esc(ib.auth) + "<br>тело: " + esc(ib.payload) + "<br>дедупликация: " + esc(ib.dedupe)]);
    });
    if (list(c.params).length) rows.push(["Параметры", list(c.params).map(function (k) { var v = (BP.meta.params || {})[k] || {}; return "<code>" + esc(k) + "</code> = " + esc(v.value) + ' <span class="muted">(' + esc(v.source || "") + ")</span>"; }).join("<br>")]);
    out.push('<section class="sec boxed"><h4>Контракт шага — для агентов</h4><table class="kv">' + rows.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") + "</table></section>");
    var tr = list(c.transitions).filter(function (id) { return idx[id]; });
    if (tr.length) {
      out.push('<section class="sec"><h4>Переходы состояний</h4><div style="display:flex;flex-direction:column;gap:8px">' + tr.map(function (id) {
        var r = idx[id], t = r.t, to = t.to === "same" ? "(то же)" : t.to === "previous" ? "(прежнее)" : t.to;
        var h = '<div class="tcard"><div class="call-head"><b>' + esc(id) + "</b>" + (t.event ? '<span class="chip ref">' + esc(t.event) + "</span>" : "") + (t.local ? '<span class="chip ref">локально</span>' : "") + "</div>";
        h += '<div class="small" style="margin-top:4px">' + esc(r.name) + ": <b>" + esc(list(t.from).join(" / ")) + "</b> → <b>" + esc(to) + "</b></div>";
        h += '<div class="small"><span class="muted">запускает:</span> ' + fireText(t) + "</div>";
        if (t.guard) h += '<div class="small"><span class="muted">условие:</span> ' + inline(t.guard) + "</div>";
        if (t.writes || t.may_write) h += '<div class="small"><span class="muted">пишет:</span> ' + writesText(t) + "</div>";
        if ((withIndex()[id] || []).length) h += '<div class="small"><span class="muted">в одной транзакции с:</span> ' + withIndex()[id].map(function (w) { return "<code>" + esc(w) + "</code>"; }).join(", ") + "</div>";
        if (t.saves_previous) h += '<div class="small muted">запоминает прежнее состояние — для возврата при сбое</div>';
        if (t.says) h += '<div class="small err-line"><span class="muted">человек видит:</span> «' + inline(t.says) + "»" + (t.compensation ? ' <span class="muted">· возврат:</span> ' + inline(t.compensation) : "") + "</div>";
        list(t.failures).forEach(function (f) { h += failText(f, t); });
        return h + "</div>";
      }).join("") + "</div></section>");
    }
    var locks = [];
    tr.forEach(function (id) { var t = idx[id].t; if (t.guard) locks.push(inline(t.guard)); });
    list((c.ui || {}).disabled_when).forEach(function (d) { locks.push("<b>" + inline(d.when) + "</b> → кнопка неактивна: «" + inline(d.says) + "»"); });
    if (locks.length) out.push('<section class="sec boxed lock"><h4>Блокировки и лимиты</h4><ul>' + locks.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></section>");
    var ui = c.ui || {}, uiRows = ["empty", "loading", "partial", "success", "error", "conflict"].filter(function (k) { return ui[k]; });
    if (uiRows.length) out.push('<section class="sec"><h4>Состояния экрана</h4><table class="kv">' + uiRows.map(function (k) {
      return "<tr><th>" + ({ empty: "пусто", loading: "загрузка", partial: "частично", success: "успех", error: "ошибка", conflict: "конфликт" }[k]) + "</th><td>" + inline(ui[k]) + "</td></tr>";
    }).join("") + "</table></section>");
    list(c.fixtures).forEach(function (fx) {
      out.push('<section class="sec"><h4>Фикстура «' + esc(fx.name) + "»: " + esc(fx.entity) + (fx.via ? " · " + esc(list(fx.via).join(" → ")) : "") + (fx.failure ? ' · <span class="err-line">сбой ' + esc(fx.failure) + "</span>" : "") + "</h4>" +
        '<div class="two"><div><div class="small muted">до</div><pre>' + codeHtml(fx.before == null ? "— (создаётся)" : JSON.stringify(fx.before, null, 2), "json") + '</pre></div><div><div class="small muted">после' + (fx.mode === "patch" ? " — только изменённое" : "") + '</div><pre>' +
        codeHtml(JSON.stringify(fx.after, null, 2), "json") + "</pre></div></div>" +
        (fx.provider_response ? '<p class="small"><a href="#c=' + esc(fx.provider_response) + '">Ответ провайдера для этой фикстуры</a></p>' : "") + "</section>");
    });
    return out.join("");
  }

  // ---------- state machine diagram (SVG) ----------
  function stateSvg(name, e) {
    var states = Object.keys(e.states || {}), rank = {}, order = [];
    var q = [e.initial]; rank[e.initial] = 0;
    while (q.length) {
      var cur = q.shift(); order.push(cur);
      (e.transitions || []).forEach(function (t) {
        if (list(t.from).indexOf(cur) < 0) return;
        [t.to].concat(list(t.failures).map(function (f) { return f.to; })).forEach(function (nx) {
          if (!nx || nx === "same" || nx === "previous" || rank[nx] != null) return;
          rank[nx] = rank[cur] + 1; q.push(nx);
        });
      });
    }
    states.forEach(function (st) { if (rank[st] == null) { rank[st] = 0; order.push(st); } });
    var cols = {}, pos = {}, W = 156, H = 46, GX = 74, GY = 62, PAD = 30;
    order.forEach(function (st) { var r = rank[st]; cols[r] = (cols[r] || 0) + 1; pos[st] = { x: PAD + r * (W + GX), y: PAD + 36 + (cols[r] - 1) * (H + GY) }; });
    var maxCol = Math.max.apply(null, Object.keys(cols).map(Number)), maxRows = Math.max.apply(null, Object.keys(cols).map(function (k) { return cols[k]; }));
    var SW = PAD * 2 + (maxCol + 1) * (W + GX), SH = PAD * 2 + 56 + maxRows * (H + GY) + 40;
    var sv = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + SW + '" height="' + SH + '" viewBox="0 0 ' + SW + " " + SH + '" role="img" aria-label="Машина состояний ' + esc(name) + '">',
      '<defs><marker id="sa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#15171c"/></marker>' +
      '<marker id="se" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b5463a"/></marker></defs>'];
    var selfN = {};
    function edge(a, b, label, err, k) {
      var A = pos[a], B = pos[b]; if (!A || !B) return;
      var col = err ? "#b5463a" : "#15171c", dash = err ? ' stroke-dasharray="5 4"' : "", mk = err ? "url(#se)" : "url(#sa)", d, lx, ly;
      if (a === b) {
        var n = selfN[a] = (selfN[a] || 0) + 1, off = (n - 1) * 22, hgt = 30 + (n - 1) * 10;
        var sx = A.x + 18 + off;
        d = "M" + sx + "," + A.y + " C" + (sx - 10) + "," + (A.y - hgt) + " " + (sx + 22) + "," + (A.y - hgt) + " " + (sx + 14) + "," + A.y;
        lx = sx + 6; ly = A.y - hgt + 2 - (n - 1) * 12;
      } else if (rank[b] > rank[a]) {
        var y1 = A.y + H / 2 + (k % 3 - 1) * 8, y2 = B.y + H / 2 + (k % 3 - 1) * 8;
        d = "M" + (A.x + W) + "," + y1 + " C" + (A.x + W + GX / 2) + "," + y1 + " " + (B.x - GX / 2) + "," + y2 + " " + B.x + "," + y2;
        lx = (A.x + W + B.x) / 2; ly = (y1 + y2) / 2 - 5;
      } else {
        var bx = Math.max(A.y, B.y) + H + 30 + (k % 3) * 10;
        d = "M" + (A.x + W / 2 + 10) + "," + (A.y + H) + " C" + (A.x + W / 2 + 10) + "," + bx + " " + (B.x + W / 2 - 10) + "," + bx + " " + (B.x + W / 2 - 10) + "," + (B.y + H);
        lx = (A.x + B.x + W) / 2; ly = bx - 4;
      }
      sv.push('<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1.3" marker-end="' + mk + '"' + dash + "/>");
      sv.push('<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="11" fill="' + col + '" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">' + esc(label) + "</text>");
    }
    // One arrow per (from, to, kind): parallel transitions share it and list their ids. Exits to "previous" become a ↩ note.
    var groups = {}, gorder = [], prevOut = {};
    function add(a, b, lab, err) {
      var key = a + "→" + b + (err ? "✗" : "");
      if (!groups[key]) { groups[key] = { a: a, b: b, err: err, labels: [] }; gorder.push(key); }
      if (groups[key].labels.indexOf(lab) < 0) groups[key].labels.push(lab);
    }
    function addPrev(fr, lab) { var l = prevOut[fr] = prevOut[fr] || []; if (l.indexOf(lab) < 0) l.push(lab); }
    var bornFailed = {};
    (e.transitions || []).forEach(function (t) {
      list(t.from).forEach(function (fr) {
        if (fr === "∅") {
          list(t.failures).forEach(function (f) { if (f.to && f.to !== "same" && f.to !== "previous") { var l = bornFailed[f.to] = bornFailed[f.to] || []; if (l.indexOf(t.id) < 0) l.push(t.id); } });
          return;
        }
        if (t.to === "previous") addPrev(fr, t.id); else add(fr, t.to === "same" ? fr : t.to, t.id, false);
        list(t.failures).forEach(function (f) {
          if (f.to === "previous") addPrev(fr, t.id + "✗"); else if (f.to) add(fr, f.to === "same" ? fr : f.to, t.id, true);
        });
      });
    });
    var k = 0;
    gorder.forEach(function (key) { var g = groups[key]; edge(g.a, g.b, (g.err ? "✗ " : "") + g.labels.join(", "), g.err, k++); });
    var init = pos[e.initial];
    if (init) sv.push('<circle cx="' + (init.x - 14) + '" cy="' + (init.y + H / 2) + '" r="6" fill="#15171c"/><line x1="' + (init.x - 8) + '" y1="' + (init.y + H / 2) + '" x2="' + init.x + '" y2="' + (init.y + H / 2) + '" stroke="#15171c" stroke-width="1.3" marker-end="url(#sa)"/>');
    states.forEach(function (st) {
      var P = pos[st], term = list(e.terminal).indexOf(st) >= 0;
      sv.push('<rect x="' + P.x + '" y="' + P.y + '" width="' + W + '" height="' + H + '" rx="10" fill="#fff" stroke="#15171c" stroke-width="' + (term ? 2.4 : 1.2) + '"/>');
      sv.push('<text x="' + (P.x + W / 2) + '" y="' + (P.y + 19) + '" text-anchor="middle" font-size="12.5" font-weight="600" fill="#15171c" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">' + esc(st) + "</text>");
      sv.push('<text x="' + (P.x + W / 2) + '" y="' + (P.y + 35) + '" text-anchor="middle" font-size="11" fill="#5b6270">' + esc(String((e.states || {})[st] || "").slice(0, 26)) + "</text>");
      if (prevOut[st]) sv.push('<text x="' + (P.x + W / 2) + '" y="' + (P.y + H + 13) + '" text-anchor="middle" font-size="10.5" fill="#b5463a" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">↩ прежнее: ' + esc(prevOut[st].join(", ")) + "</text>");
      if (bornFailed[st]) sv.push('<text x="' + (P.x + W / 2) + '" y="' + (P.y - 6) + '" text-anchor="middle" font-size="10.5" fill="#b5463a" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">✗ при создании: ' + esc(bornFailed[st].join(", ")) + "</text>");
    });
    sv.push("</svg>");
    return sv.join("");
  }
  function renderEntities(focus) {
    var names = Object.keys(BP.entities || {});
    var out = ['<div class="view-head"><div><h2>Машины состояний</h2><div class="lead md">' + md("Каждая сущность — какие у неё состояния и какой шаг её переводит. Сплошная стрелка — нормальный путь, красная пунктирная — что будет при сбое; одна стрелка несёт все переходы между двумя состояниями. «↩ прежнее» — возврат туда, откуда началась активность. Жирная рамка — конечное состояние. Это же уходит агентам в `agent/STATE-MACHINES.md` (Mermaid).") + '</div></div><aside class="panel"><h3>Сущности</h3><ul>' +
      names.map(function (n) { return '<li><a href="#t=states&e=' + esc(n) + '">' + esc(n) + "</a> — " + esc(BP.entities[n].title || "") + "</li>"; }).join("") + "</ul></aside></div>"];
    names.forEach(function (n) {
      var e = BP.entities[n];
      out.push('<section class="ent" id="ent-' + esc(n) + '"' + (focus === n ? ' style="outline:2px solid var(--focus);outline-offset:4px"' : "") + "><h3>" + esc(n) + ' <span class="muted small">' + esc(e.title || "") + " · таблица <code>" + esc(e.table) + "</code>, поле <code>" + esc(e.field) + "</code></span></h3>");
      var savers = (e.transitions || []).filter(function (t) { return t.saves_previous; });
      var meta = [];
      if (list(e.waiting).length) meta.push("ждёт внешнюю сторону: " + list(e.waiting).map(function (x) { return "<code>" + esc(x) + "</code>"; }).join(", ") + " — у каждого есть дедлайн");
      if (savers.length) meta.push("«прежнее» запоминают " + savers.map(function (t) { return "<code>" + esc(t.id) + "</code>"; }).join(", ") + " в <code>prev_" + esc(e.field) + "</code>");
      if (meta.length) out.push('<p class="small muted">' + meta.join(" · ") + "</p>");
      if (e.note) out.push('<div class="md small" style="margin-bottom:8px">' + md(e.note) + "</div>");
      out.push('<div class="seq-scroll">' + stateSvg(n, e) + "</div>");
      if (e.fields) out.push('<details class="code"><summary>Поля, которые читает и пишет поток (' + Object.keys(e.fields).length + ')</summary><table class="t" style="margin-top:6px">' +
        Object.keys(e.fields).map(function (k) { return '<tr><td class="mono">' + esc(k) + "</td><td>" + inline(e.fields[k]) + "</td></tr>"; }).join("") + "</table></details>");
      out.push('<table class="t" style="margin-top:10px"><tr><th>id</th><th>переход</th><th>шаг · запускает</th><th>событие</th><th>условие</th><th>сбои</th></tr>' + (e.transitions || []).map(function (t) {
        var steps = list(t.step).map(function (sid) { return sid === "*" ? "все" : '<a href="#s=' + esc(sid) + '">' + esc(sid) + "</a>"; }).join(", ");
        return '<tr><td class="mono">' + esc(t.id) + "</td><td>" + esc(list(t.from).join("/")) + " → <b>" + esc(t.to === "same" ? "(то же)" : t.to === "previous" ? "(прежнее)" : t.to) + "</b>" + (t.local ? ' <span class="chip ref">локально</span>' : "") + "</td><td>" + steps + '<div class="small">' + fireText(t) + '</div></td><td class="mono">' + esc(t.event || "—") + "</td><td>" + inline(t.guard || "—") + "</td><td>" +
          (list(t.failures).map(function (f) { return failText(f, t); }).join("") || (t.says ? '<div class="small err-line">«' + inline(t.says) + "»" + (t.compensation ? " · возврат: " + inline(t.compensation) : "") + "</div>" : "—")) +
          (t.writes || t.may_write ? '<div class="small"><span class="muted">пишет:</span> ' + writesText(t) + "</div>" : "") + "</td></tr>";
      }).join("") + "</table></section>");
    });
    return out.join("");
  }
  function renderAgent() {
    var b = BP.build || {};
    var files = [
      ["agent/SPEC.md", "контракт каждого шага по путям + диаграммы последовательности (Mermaid)"],
      ["agent/STATE-MACHINES.md", "машины состояний (Mermaid stateDiagram) и таблицы переходов"],
      ["agent/fixtures/<шаг>.json", "фикстуры: сущность до и после шага, ответ провайдера — моки для экранов, заглушек и тестов"],
      ["agent/blueprint-lock.json", "id и хэши шагов, переходов, эндпоинтов, событий, версии промптов"],
      ["agent/ACCEPTANCE.md", "заготовки тестов: шаг (BP:k1), доп. эндпоинт (BP:k1.takes), фикстура (BP:k1:happy), переход (SM:song.S08) и его сбой"],
      ["agent/prompts/<id>.md", "каждый промпт целиком: system, user, формат ответа, переменные, пример"],
      ["agent/SCHEMA.md", "как читать вид для агентов: поля схемы v1.2 и правила проверки"]
    ];
    return '<div class="view-head"><div><h2>Вид для агентов</h2><div class="lead md">' + md("Тот же источник, что и этот лист, собирается в сухую спецификацию для агентов-кодеров. Сборка **падает** и ничего не пишет, если данные противоречивы: шаг без эндпоинта, переход без пути сбоя, состояние ожидания без дедлайна, сбой без способа его распознать или кнопки «Повторить», синхронный вызов долгого провайдера, фикстура не совпадает с машиной состояний, у промпта не объявлена переменная.\n\n**Обратный дрейф.** Тесты в коде носят id из `ACCEPTANCE.md`. CI падает, если у id из `blueprint-lock.json` нет теста или хэш шага изменился, а тест — нет.") +
      '</div></div><aside class="panel"><h3>Последняя сборка</h3><ul><li>ошибок: <b>' + esc(b.errors) + "</b>, предупреждений: " + esc(b.warnings) + "</li><li>контрактов шагов: " + esc(b.steps_locked) + "</li><li>переходов: " + esc(b.transitions_locked) + "</li><li>эндпоинтов: " + esc(b.endpoints) + "</li><li>событий: " + esc(b.events) + "</li></ul></aside></div>" +
      '<table class="t"><tr><th>Файл</th><th>Что внутри</th></tr>' + files.map(function (f) { return '<tr><td class="mono">' + esc(f[0]) + "</td><td>" + esc(f[1]) + "</td></tr>"; }).join("") + "</table>" +
      (list(BP.meta.rules).length ? '<h3 style="margin-top:20px">Общие правила для агентов</h3><ul class="md">' + list(BP.meta.rules).map(function (r) { return "<li>" + inline(r) + "</li>"; }).join("") + "</ul>" : "") +
      (BP.meta.flags ? '<h3 style="margin-top:20px">Выключатели</h3><table class="t"><tr><th>Флаг</th><th>Что будет, если выключить</th></tr>' + Object.keys(BP.meta.flags).map(function (k) { return '<tr><td class="mono">' + esc(k) + "</td><td>" + inline(BP.meta.flags[k].off || "") + "</td></tr>"; }).join("") + "</table>" : "");
  }

  // ---------- header ----------
  function renderHeader() {
    var m = BP.meta;
    $("#brand").textContent = (BP.config || {}).brand || "";
    $("#doc-title").textContent = m.title;
    $("#doc-sub").innerHTML = '<span class="badge warn">' + esc(m.status) + '</span> <span class="badge">' + esc(m.version) +
      " · " + esc(m.date) + "</span>";
    var tabs = $("#tabs"); tabs.innerHTML = "";
    BP.journeys.forEach(function (j) {
      tabs.appendChild(el('<button role="tab" data-view="j:' + esc(j.id) + '">' + esc(j.tab || j.title) + "</button>"));
    });
    tabs.appendChild(el('<span class="sep" aria-hidden="true"></span>'));
    [["states", "Состояния"], ["prompts", "Промпты"], ["models", "Модели и параметры"], ["div", label("div_tab", "Расхождения")], ["agent", "Для агентов"]].forEach(function (t) {
      tabs.appendChild(el('<button role="tab" data-view="t:' + t[0] + '">' + esc(t[1]) + "</button>"));
    });
    (BP.notes || []).forEach(function (n) {
      tabs.appendChild(el('<button role="tab" data-view="n:' + esc(n.id) + '">' + esc(n.tab || n.title) + "</button>"));
    });
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-view]"); if (!b) return;
      var v = b.getAttribute("data-view").split(":");
      location.hash = v[0] === "j" ? "j=" + v[1] : v[0] === "t" ? "t=" + v[1] : "n=" + v[1];
    });
    $("#filter").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]"); if (!b) return;
      state.filter = b.getAttribute("data-f");
      document.body.setAttribute("data-filter", state.filter);
      Array.prototype.forEach.call($("#filter").children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
    $("#q").addEventListener("input", function (e) { state.query = e.target.value.trim(); renderView(); });
  }
  function selectTab(key) {
    Array.prototype.forEach.call($("#tabs").querySelectorAll("button[data-view]"), function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-view") === key ? "true" : "false");
    });
  }

  // ---------- journey ----------
  function renderJourney(j) {
    var lanes = BP.lanes;
    var out = [];
    out.push('<div class="view-head"><div><h2>' + inline(j.title) + '</h2><div class="lead md">' + md(j.lead) + "</div></div>");
    if (j.check && j.check.length) {
      out.push('<aside class="panel"><h3>Что проверить</h3><ul>' + j.check.map(function (c) { return "<li>" + inline(c) + "</li>"; }).join("") + "</ul></aside>");
    }
    out.push("</div>");
    out.push('<nav class="stepper" aria-label="Шаги">' + j.steps.map(function (s, i) {
      return '<button data-step="' + esc(s.id) + '"><span class="num">' + (i + 1) + "</span>" + inline(s.title) + "</button>";
    }).join("") + "</nav>");
    var cols = "grid-template-columns: 172px repeat(" + j.steps.length + ", 250px)";
    var g = ['<div class="bp-wrap"><div class="bp" style="' + cols + '">'];
    g.push('<div class="corner"></div>');
    j.steps.forEach(function (s, i) {
      g.push('<button class="col-head" data-step="' + esc(s.id) + '" id="col-' + esc(s.id) + '"><span class="num">' + (i + 1) + "</span><b>" + inline(s.title) + "</b></button>");
    });
    lanes.forEach(function (lane) {
      var laneCls = esc("lane-" + lane.id), laneColor = cssColor(lane.color, DEFAULT_LANE_COLOR);
      g.push('<div class="lane-label ' + laneCls + '" style="--lane-color:' + laneColor + '"><b>' + esc(lane.title) + "</b><span>" + esc(lane.hint) + "</span></div>");
      j.steps.forEach(function (s) {
        var txt = (s.cells || {})[lane.id];
        var chips = "";
        if (lane.id === "models") {
          chips = (s.models || []).map(modelChip).join("") + (s.prompts || []).map(promptChip).join("");
        }
        if (lane.id === "user" && s.div && s.div.length) chips += s.div.map(divChip).join("");
        if (lane.id === "engine" && s.refs && s.refs.length) chips += s.refs.map(refChip).join("");
        if (lane.id === "data" && s.contract) chips += list(s.contract.transitions).map(transChip).join("");
        if (lane.id === "engine" && s.contract && s.contract.delivery && s.contract.delivery !== "none") chips += '<span class="chip ref">' + esc(s.contract.delivery) + "</span>";
        if (!txt && !chips) {
          g.push('<div class="cell empty ' + laneCls + '" style="--lane-color:' + laneColor + '">—</div>');
        } else {
          g.push('<button class="cell ' + laneCls + '" data-step="' + esc(s.id) + '" style="--lane-color:' + laneColor + '"><div class="md">' + md(txt) + "</div>" +
            (chips ? '<div class="chips">' + chips + "</div>" : "") + "</button>");
        }
      });
      if (lane.id === "screen") g.push('<div class="visibility"><span>линия видимости · ниже — под капотом</span></div>');
    });
    g.push("</div></div>");
    out.push(g.join(""));
    if (j.seq) out.push('<details class="seq-block" open><summary>' + esc(j.seq.title || "Последовательность вызовов") + '</summary><div class="seq-scroll">' + seqSvg(j.seq) + "</div></details>");
    return out.join("");
  }

  // ---------- sequence diagram (SVG) ----------
  function wrap(text, max) {
    var words = String(text).split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function seqSvg(seq) {
    var colW = 168, top = 46, rowH = 50, padX = 90;
    var idx = {}; seq.actors.forEach(function (a, i) { idx[a.id] = i; });
    var W = padX * 2 + colW * (seq.actors.length - 1);
    var H = top + 30 + seq.msgs.length * rowH + 20;
    var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Диаграмма последовательности">'];
    s.push('<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#15171c"/></marker></defs>');
    seq.actors.forEach(function (a, i) {
      var x = padX + i * colW;
      s.push('<line x1="' + x + '" y1="' + (top + 14) + '" x2="' + x + '" y2="' + (H - 6) + '" stroke="#c9ced6" stroke-dasharray="3 4"/>');
      var lines = wrap(a.label, 18);
      var bw = 150, bh = 16 + lines.length * 15;
      s.push('<rect x="' + (x - bw / 2) + '" y="4" width="' + bw + '" height="' + bh + '" rx="8" fill="#fff" stroke="' + cssColor(a.color, DEFAULT_ACTOR_COLOR) + '" stroke-width="1.5"/>');
      lines.forEach(function (l, k) {
        s.push('<text x="' + x + '" y="' + (22 + k * 15) + '" text-anchor="middle" font-size="12.5" font-weight="600" fill="#15171c">' + esc(l) + "</text>");
      });
    });
    seq.msgs.forEach(function (m, i) {
      var y = top + 40 + i * rowH;
      var a = idx[m.from], b = idx[m.to];
      if (a == null || b == null) return;
      var x1 = padX + a * colW, x2 = padX + b * colW;
      var dash = m.dashed ? ' stroke-dasharray="5 4"' : "";
      if (a === b) {
        s.push('<path d="M' + x1 + "," + (y - 10) + " h36 v18 h-34" + '" fill="none" stroke="#15171c" stroke-width="1.3" marker-end="url(#ah)"' + dash + "/>");
        wrap(m.text, 30).forEach(function (l, k) {
          s.push('<text x="' + (x1 + 44) + '" y="' + (y - 6 + k * 13) + '" font-size="12" fill="#15171c">' + esc(l) + "</text>");
        });
      } else {
        s.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + (x2 + (x2 > x1 ? -2 : 2)) + '" y2="' + y + '" stroke="#15171c" stroke-width="1.3" marker-end="url(#ah)"' + dash + "/>");
        var mid = (x1 + x2) / 2;
        var lines = wrap(m.text, Math.max(22, Math.floor(Math.abs(x2 - x1) / 7)));
        lines.forEach(function (l, k) {
          s.push('<text x="' + mid + '" y="' + (y - 8 - (lines.length - 1 - k) * 13) + '" text-anchor="middle" font-size="12" fill="#15171c">' + esc(l) + "</text>");
        });
      }
    });
    s.push("</svg>");
    return s.join("");
  }

  // ---------- drawer (step details) ----------
  function findStep(stepId) {
    for (var i = 0; i < BP.journeys.length; i++) {
      var j = BP.journeys[i];
      for (var k = 0; k < j.steps.length; k++) if (j.steps[k].id === stepId) return { j: j, s: j.steps[k], n: k + 1 };
    }
    return null;
  }
  function callCard(id) {
    var c = BP.calls[id];
    if (!c) return '<div class="call">Вызов ' + esc(id) + " не описан</div>";
    var m = modelByKey(c.model);
    var h = ['<div class="call" style="--c:' + provColor(m && m.provider) + '">'];
    h.push('<div class="call-head"><b>' + esc(c.step) + "</b>" + modelChip(c.model) + "</div>");
    h.push('<div class="meta">' + inline(c.title) + "</div>");
    if (c.when) h.push('<div class="md small" style="margin-top:6px">' + md(c.when) + "</div>");
    if (c.params) h.push('<div class="small" style="margin-top:6px"><b>Параметры:</b> ' + inline(c.params) + "</div>");
    var meta = [];
    if (c.latency) meta.push("время: " + c.latency);
    if (c.cost) meta.push("стоимость: " + c.cost);
    if (meta.length) h.push('<div class="meta">' + inline(meta.join(" · ")) + "</div>");
    h.push('<div class="btn-row">');
    if (c.prompt) h.push('<a class="btn primary" href="#p=' + esc(c.prompt) + '">Открыть промпт</a>');
    h.push('<a class="btn" href="#c=' + esc(id) + '">Запрос и ответ целиком</a></div>');
    if (c.failure) h.push('<details class="code"><summary>Если сбой</summary><div class="md small" style="margin-top:6px">' + md(c.failure) + "</div></details>");
    h.push("</div>");
    return h.join("");
  }
  function openStep(stepId, opener) {
    var f = findStep(stepId); if (!f) return;
    var s = f.s, d = s.detail || {};
    var body = [];
    if (d.user || d.mock) {
      body.push('<section class="sec"><h4>Что видит и делает человек</h4>' + (d.user ? '<div class="md">' + md(d.user) + "</div>" : "") + (d.mock ? '<div style="margin-top:8px">' + mock(d.mock) + "</div>" : "") + "</section>");
    }
    if (d.hood) body.push('<section class="sec boxed"><h4>Под капотом</h4><div class="md">' + md(d.hood) + "</div></section>");
    if (d.calls && d.calls.length) body.push('<section class="sec"><h4>Вызовы моделей и провайдеров</h4><div style="display:flex;flex-direction:column;gap:10px">' + d.calls.map(callCard).join("") + "</div></section>");
    if (d.data) body.push('<section class="sec boxed"><h4>Что записывается</h4><div class="md">' + md(d.data) + "</div></section>");
    body.push(contractSections(s));
    if (d.states) body.push('<section class="sec boxed"><h4>Состояния и ошибки</h4><div class="md">' + md(d.states) + "</div></section>");
    if (d.divergence) body.push('<section class="sec boxed" style="border-color:var(--warn)"><h4>Расхождение со сверкой</h4><div class="md">' + md(d.divergence) + "</div></section>");
    if (s.refs && s.refs.length) body.push('<section class="sec"><h4>Требования ТЗ</h4><div class="chips">' + s.refs.map(refChip).join("") + "</div></section>");
    var dr = $("#drawer");
    $("#drawer-title").innerHTML = inline(s.title);
    $("#drawer-sub").innerHTML = inline(f.j.title + " · шаг " + f.n + " из " + f.j.steps.length);
    $("#drawer-body").innerHTML = body.join("");
    state.opener = opener || document.activeElement;
    dr.classList.add("open"); dr.setAttribute("aria-hidden", "false"); $("#scrim").classList.add("open");
    $("#drawer-close").focus();
  }
  function closeDrawer() {
    $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true");
    if (!$("#modal").classList.contains("open")) $("#scrim").classList.remove("open");
  }

  // ---------- modal (prompt / call) ----------
  function openModal(title, sub, tabs) {
    var mo = $("#modal");
    $("#modal-title").innerHTML = inline(title);
    $("#modal-sub").innerHTML = sub || "";
    var tb = $("#modal-tabs"); tb.innerHTML = "";
    tabs.forEach(function (t, i) {
      var b = el('<button role="tab" aria-selected="' + (i === 0) + '">' + esc(t[0]) + "</button>");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(tb.children, function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        $("#modal-body").innerHTML = t[1]; bindCopy();
      });
      tb.appendChild(b);
    });
    $("#modal-body").innerHTML = tabs[0][1]; bindCopy();
    mo.classList.add("open"); $("#scrim").classList.add("open");
    $("#modal-close").focus();
  }
  function closeModal() {
    $("#modal").classList.remove("open");
    if (!$("#drawer").classList.contains("open")) $("#scrim").classList.remove("open");
  }
  function bindCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
      b.onclick = function () { copy(b.parentElement.querySelector("pre").textContent); };
    });
  }
  function preBlock(label, text, kind) {
    if (!text) return "";
    return '<section class="sec" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px"><h4 style="margin:0">' + esc(label) +
      '</h4><button class="btn" data-copy>Скопировать</button></div><pre>' + codeHtml(text, kind) + "</pre></section>";
  }
  function openPrompt(id) {
    var p = BP.prompts[id]; if (!p) return;
    var sub = '<div class="chips" style="margin-top:6px">' + modelChip(p.model) + '<span class="chip ref">' + esc(p.step) + '</span><span class="chip ref">' + esc(p.version || "v0") + '</span><span class="chip ref">язык промпта: ' + esc(p.lang || "ru") + "</span></div>";
    var tpl = (p.purpose ? '<div class="md" style="margin-bottom:14px">' + md(p.purpose) + "</div>" : "") +
      preBlock("System", p.system) + preBlock("User (задание)", p.user) +
      (p.output ? preBlock("Формат ответа", p.output, "json") : "");
    var tabs = [["Шаблон", tpl]];
    if (p.example) {
      tabs.push(["Пример", (p.example.note ? '<div class="md small muted" style="margin-bottom:10px">' + md(p.example.note) + "</div>" : "") +
        preBlock("Что уходит в модель (заполнено)", p.example.input) + preBlock("Что возвращается", p.example.output, "json")]);
    }
    if (p.vars && p.vars.length) {
      tabs.push(["Переменные", '<table class="t"><tr><th>Переменная</th><th>Откуда берётся</th></tr>' + p.vars.map(function (v) {
        return "<tr><td class=\"mono\">{{" + esc(v[0]) + "}}</td><td>" + inline(v[1]) + "</td></tr>";
      }).join("") + "</table>"]);
    }
    if (p.notes || p.source) tabs.push(["Заметки", '<div class="md">' + md(p.notes || "") + "</div>" + (p.source ? '<p class="small muted">Источник: ' + inline(p.source) + "</p>" : "")]);
    openModal(p.title, sub, tabs);
  }
  function openCall(id) {
    var c = BP.calls[id]; if (!c) return;
    var sub = '<div class="chips" style="margin-top:6px">' + modelChip(c.model) + '<span class="chip ref">' + esc(c.step) + "</span></div>";
    var tabs = [["Сырой запрос", '<div class="md small muted" style="margin-bottom:10px">' + md(c.requestNote || "Так запись выглядит в журнале вызовов (`llm_call.request_body`). Ключей нет — только псевдоним.") + "</div>" + preBlock("Запрос", c.request, "json")]];
    if (c.response) tabs.push(["Ответ", preBlock("Ответ", c.response, "json")]);
    if (c.prompt) tabs.push(["Промпт", '<p><a class="btn primary" href="#p=' + esc(c.prompt) + '">Открыть промпт целиком</a></p>']);
    openModal(c.title, sub, tabs);
  }

  // ---------- other tabs ----------
  function renderPrompts() {
    var ids = Object.keys(BP.prompts);
    var q = state.query.toLowerCase();
    var rows = ids.filter(function (id) {
      if (!q) return true;
      var p = BP.prompts[id];
      return [p.title, p.step, p.system, p.user, p.purpose].join(" ").toLowerCase().indexOf(q) >= 0;
    }).map(function (id) {
      var p = BP.prompts[id];
      return '<tr class="clickable" data-p="' + esc(id) + '"><td class="mono">' + esc(p.step) + "</td><td>" + inline(p.title) + "</td><td>" + modelChip(p.model) +
        "</td><td>" + esc(p.version || "v0") + "</td><td>" + inline(p.stage || "") + "</td></tr>";
    }).join("");
    return '<div class="view-head"><div><h2>Каталог промптов</h2><div class="lead md">' + md(BP.meta.promptsLead || "") +
      '</div></div><aside class="panel"><h3>Как читать</h3><ul><li>Клик по строке — промпт целиком.</li><li><code>{{переменная}}</code> — подставляет код.</li><li>Вкладка «Пример» — заполненный промпт и ответ ' + esc(label("example_of", "на сквозном примере")) + '.</li></ul></aside></div>' +
      '<table class="t"><tr><th>Шаг</th><th>Что делает</th><th>Модель</th><th>Версия</th><th>Где в пути</th></tr>' + rows + "</table>";
  }
  function renderModels() {
    var rows = BP.models.map(function (m) {
      return "<tr><td>" + modelChip(m.key) + "</td><td>" + inline(m.used_for || "") + "</td><td>" + inline(m.where || "") + "</td><td>" + inline(m.params || "") + "</td><td>" + inline(m.cost || "") + "</td><td>" + inline(m.note || "") + "</td></tr>";
    }).join("");
    return '<div class="view-head"><div><h2>Модели и параметры</h2><div class="lead md">' + md(BP.meta.modelsLead || "") + "</div></div></div>" +
      '<table class="t"><tr><th>Модель</th><th>Шаги</th><th>Где работает</th><th>Параметры</th><th>Цена</th><th>Заметки</th></tr>' + rows + "</table>";
  }
  var statusLabel = { accept: "принято", discuss: "обсудить", design: "продумать", keep: "как в ТЗ" };
  function renderDiv(focus) {
    var rows = BP.divergences.map(function (d) {
      return '<tr id="div-' + esc(d.id) + '"' + (focus === d.id ? ' style="outline:2px solid var(--warn)"' : "") + "><td><b>" + inline(d.area) + '</b><div style="margin-top:6px"><span class="pill ' + esc(d.status) + '">' + esc(statusLabel[d.status] || d.status) +
        '</span></div></td><td class="md">' + md(d.owner) + '</td><td class="md">' + md(d.tz) + '</td><td class="md">' + md(d.proposal) + "</td></tr>";
    }).join("");
    var asIs = BP.meta.as_is ? '<details class="seq-block"><summary>' + esc(BP.meta.as_is.title || "Как сейчас") + '</summary><div class="panel md" style="margin-top:8px">' + md(BP.meta.as_is.body || "") + "</div></details>" : "";
    return '<div class="view-head"><div><h2>' + esc(label("div_title", "Расхождения: бриф владельца ↔ ТЗ")) + '</h2><div class="lead md">' + md(BP.meta.divLead || "") +
      '</div></div><aside class="panel"><h3>Статусы</h3><ul><li><span class="pill accept">принято</span> — берём как в сверке</li><li><span class="pill discuss">обсудить</span> — предлагаю иначе, нужно решение</li><li><span class="pill design">продумать</span> — открытый вопрос из сверки</li><li><span class="pill keep">как в ТЗ</span> — совпадает</li></ul></aside></div>' +
      asIs + '<table class="t" style="margin-top:16px"><tr><th style="width:16%">Тема</th><th>' + esc(label("div_owner", "Бриф владельца")) + "</th><th>" + esc(label("div_spec", "ТЗ сейчас")) + "</th><th>" + esc(label("div_proposal", "Предложение архитектора")) + "</th></tr>" + rows + "</table>";
  }
  function renderNote(n) {
    return '<div class="view-head"><div><h2>' + inline(n.title) + '</h2><div class="lead md">' + md(n.lead || "") + "</div></div></div>" +
      '<div class="grid-cards">' + (n.cards || []).map(function (c) { return '<article class="card"><h4>' + inline(c.title) + '</h4><div class="md">' + md(c.body) + "</div></article>"; }).join("") + "</div>" +
      (n.seq ? '<details class="seq-block" open><summary>' + esc(n.seq.title) + '</summary><div class="seq-scroll">' + seqSvg(n.seq) + "</div></details>" : "");
  }

  // ---------- routing ----------
  function parseHash() {
    var h = location.hash.replace(/^#/, ""), o = {};
    h.split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) o[p[0]] = decodeURIComponent(p[1] || ""); });
    return o;
  }
  function renderView() {
    var h = parseHash();
    var view = state.view || "j:" + BP.journeys[0].id;
    if (h.j) view = "j:" + h.j; else if (h.t) view = "t:" + h.t; else if (h.n) view = "n:" + h.n;
    state.view = view;
    selectTab(view);
    var main = $("#main"), kind = view.split(":")[0], id = view.split(":")[1];
    if (kind === "j") {
      var j = BP.journeys.filter(function (x) { return x.id === id; })[0] || BP.journeys[0];
      main.innerHTML = renderJourney(j);
    } else if (kind === "t") {
      main.innerHTML = id === "prompts" ? renderPrompts() : id === "models" ? renderModels() : id === "states" ? renderEntities(h.e) : id === "agent" ? renderAgent() : renderDiv(h.d);
      if (id === "states" && h.e) { setTimeout(function () { var en = document.getElementById("ent-" + h.e); if (en) en.scrollIntoView({ block: "start" }); }, 0); }
      if (id === "div" && h.d) { var r = document.getElementById("div-" + h.d); if (r) r.scrollIntoView({ block: "center" }); }
    } else if (kind === "n") {
      var n = BP.notes.filter(function (x) { return x.id === id; })[0];
      main.innerHTML = n ? renderNote(n) : "";
    }
  }
  function route() {
    var h = parseHash();
    if (h.p || h.c) {
      if (!state.view) renderView();
      if (h.p) openPrompt(h.p); else openCall(h.c);
      return;
    }
    state.baseHash = location.hash || "#";
    if (h.s && !h.j) {
      var fs = findStep(h.s);
      if (fs) { history.replaceState(null, "", "#j=" + fs.j.id + "&s=" + h.s); h = parseHash(); }
    }
    closeModal();
    renderView();
    if (h.s) openStep(h.s); else closeDrawer();
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (b && $("#main").contains(b)) {
      var j = state.view.split(":")[1];
      var sid = b.getAttribute("data-step");
      if (b.closest(".stepper")) {
        var col = document.getElementById("col-" + sid);
        if (col) col.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
      history.replaceState(null, "", "#j=" + j + "&s=" + sid);
      openStep(sid, b);
      return;
    }
    var r = e.target.closest("tr[data-p]");
    if (r) { location.hash = "p=" + r.getAttribute("data-p"); }
  });
  $("#drawer-close").addEventListener("click", function () {
    closeDrawer();
    if (state.view && state.view.indexOf("j:") === 0) history.replaceState(null, "", "#j=" + state.view.split(":")[1]);
    if (state.opener && state.opener.focus) state.opener.focus();
  });
  function dismissModal() {
    closeModal();
    history.replaceState(null, "", state.baseHash || "#");
  }
  $("#modal-close").addEventListener("click", dismissModal);
  $("#scrim").addEventListener("click", function () {
    if ($("#modal").classList.contains("open")) dismissModal();
    else $("#drawer-close").click();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if ($("#modal").classList.contains("open")) dismissModal();
    else if ($("#drawer").classList.contains("open")) $("#drawer-close").click();
  });
  window.addEventListener("hashchange", route);

  renderHeader();
  route();
})();
