---
name: idea-teardown
description: |
  Разбор идеи до постройки: спрос, вердикт по каждому компоненту,
  контр-проект, kill-критерии. Triggers: «разбери идею», «оцени проект»,
  «есть идея», «будет ли спрос», «стоит ли это делать», «оцени рынок»,
  product teardown, evaluating a business or product idea before committing.
  SaaS, услуга в регионе, офлайн-точка, пилот, действующий проект. Уже
  существует готовое → `prior-art`; переговоры и личная стратегия →
  `strategic-advisory`.
---

# Idea Teardown

**Grade the bets, not the idea.** An idea is never wholly right or wrong — it is a handful of independent bets that usually have different answers. Graded as one thing it gets a vibe; graded bet by bet it gets a decision.

The deliverable is three things: a verdict per bet, the project you would build instead, and the one cheap experiment that settles the premise before anyone writes code or signs a lease.

Two rules bind every phase.

**Every claim carries an evidence tier.**

| Tier | Meaning |
|---|---|
| `[проверено]` | You ran the command, read the source, or opened the primary artifact yourself, in this session |
| `[измерено]` | A sub-agent measured it and returned a source and a date |
| `[вторичный]` | A secondhand claim nobody opened in the original |
| `[гипотеза]` | Reasoning, not fact |

**No verdict rests on `[вторичный]` or `[гипотеза]` alone.** Either promote it to a measurement or drop the conclusion leaning on it. This is the rule that separates a teardown from an opinion, and §6 exists to enforce it.

---

## 0. Frame before researching — STOP gate

Research aimed at the wrong question returns a good answer to something nobody asked. The most expensive failure in this workflow is a complete, well-evidenced teardown of a question the user did not have.

Settle four things, in the user's own words, before any agent runs:

| Question | What it changes |
|---|---|
| **Goal** — доход / публичный продукт / внутренний инструмент / репутационный актив / пилот | Which evidence counts. A reputational asset with no revenue path is a success; a business with the same numbers is a failure |
| **Scale** — глобальный / страна / регион / локальная ниша | Selects the research axes and which demand instruments exist at all |
| **Audience** — who specifically, and separately: who pays | "Teams" and "developers" are not buyers. A person with a budget is |
| **Falsifier** — what measurement would change your mind | Turns the teardown into something that can conclude rather than persuade |

Ask what is genuinely undetermined; skip what the user already stated. Where the request is one line and everything is open, run `grilling` to work down the branches.

Output the four answers as you understood them, then **🛑 STOP — жду подтверждения**.

When the user waves it through, write the four assumptions into the report header as assumptions and proceed — an unconfirmed frame that is *visible* can be corrected later; one that is implicit cannot.

**Completion criterion:** you can state the question in one sentence the user would sign, and it names goal, scale and payer.

## 1. Decompose into bets

Split the idea into the smallest set of pieces that could each be funded, cut, or reshaped independently. Name them in the user's own words, in their order — they must recognise their own idea in the list.

A typical idea yields three to six. Fewer means you are still grading a vibe; many more means you are grading features.

**Completion criterion:** cutting any one bet leaves the others still meaningful, and every part of the user's description lands in exactly one bet.

## 2. Read what the customer already owns

**The cheapest evidence is the evidence they already have and have never looked at.** Do this before spending a token on the outside world, because it is free, it is specific to them, and it routinely settles the question outright.

Depending on the idea: their own telemetry and logs, the config of the tool they already run, their sales and support history, their existing analytics, the corpus they think is an asset, the competitor they already buy from.

Two questions to put to it:

- **Have they ever been the customer of the thing they want to build?** A team that has never once used the category is proposing a shop they have never shopped in.
- **Does the asset they are counting on survive contact with a stranger?** Measure it rather than accept it — usage counts, revision counts, whether it works on a clean machine.

Everything found here is `[проверено]` and outranks everything gathered later.

## 3. Research fan-out

Spawn **one agent per axis that could independently kill the idea** — not a fixed number. Send them in a single message so they run concurrently, `subagent_type: general-purpose`, each brief capped at ~400 words.

Axis catalogues per idea type — technology and platform, regional service, local offline, internal tool, existing project — live in `references/research-axes.md`, together with the two axes that apply to every type, the demand instruments available at each scale, and the rule for borrowing an axis filed under a type that is not yours.

Every brief carries: the framed question from §0, the bet list, the evidence-tier rule, an instruction to return a source and date per claim, and the demand instruments to try. Require each agent to report what it **could not** measure, and why.

Three disciplines the briefs must impose:

- **Measure demand, not supply.** Counting how many of a thing exist measures suppliers. Buyers show up as downloads, bookings, search volume, upvoted requests, repeat purchases, money.
- **Existence is not occupancy.** A crowded shelf with no traffic and an empty shelf in an empty aisle look identical in a supply count and are opposite conclusions.
- **Find the closest thing that already shipped, and price it.** Someone has usually built the nearest version. Its actual usage numbers price the category better than any estimate you can construct.

**Completion criterion:** every axis reports, each load-bearing number carries a tier and a source, and the axes that returned nothing say so explicitly instead of silently dropping out.

## 4. Adversarial critique

Run a second fan-out whose job is to **kill the idea**, one agent per axis — demand reality, differentiation and platform risk, distribution and cold start, trust and abuse, economics and capacity. Give each the research output and the bet list.

Ask each for: findings with severity, the **mechanism** of failure rather than a worry, a concrete failure scenario, and what to do instead. Also require a fairness section — what the idea genuinely gets right — because a critique with none is not calibrated.

A finding that names no mechanism is a hypothesis; label it one.

## 5. Counter-design

Commission **two or three independent designs from scratch**, each with a deliberately different wedge, then judge them against fixed scales — demand evidence, defensibility, time to first value, cold-start solvability, fit to the team's real capacity.

Independent designs beat one design iterated: they surface the trade you would otherwise never see, and the judge can graft the best parts of the losers onto the winner.

The winner is the counter-project in the report. Say plainly which parts came from which design.

## 6. Honesty audit

One final agent, and it is the one that earns the document's credibility. Its only job is to attack the work you just did:

- **Unverified claims** — every load-bearing fact that is `[вторичный]` or `[гипотеза]`, and what it would take to promote it.
- **Overreach** — where the critique proved less than it claimed, used a number two different ways, or read an absence as evidence.
- **Missing dimensions** — legal, licensing, capacity, seasonality, the thing nobody costed.
- **The steelman** — the strongest honest case *for* the original idea, and what observation would show the critics measured the wrong population.

Fold its corrections into the report rather than appending them. When it overturns something, say so in the text at the point of the claim.

**Completion criterion:** no verdict in the report still rests on a claim the audit flagged, or the report says out loud that it does.

## 7. Assemble

Write the report to the path the user named, in Russian prose (the reader is human), keeping code, identifiers, SQL and tool names in English. Section order and the header table are in `references/report-template.md`.

Then a short chat summary: the verdict, the two or three decisive measurements, the counter-project in a sentence, and the blocking questions.

## Anti-patterns

| Pattern | Why it fails | Instead |
|---|---|---|
| **Answering before framing** | A complete teardown of the wrong question, and the cost is the whole run | §0, with the STOP |
| **Grading the idea whole** | Produces a vibe; the useful answer is that bet 2 is real and bets 1, 3, 4 are not | Verdict per bet |
| **Supply count as demand** | Measures how many people want to sell, which is the opposite signal | Demand instruments per scale |
| **Stars, followers, funding as demand** | Attention metrics; they move for reasons unrelated to buying | Downloads, bookings, revenue, repeat use |
| **Load-bearing secondhand facts** | The document tells the user to trust only measurement while resting on unread blog posts | Tier every claim; §6 enforces |
| **Critique with no fairness section** | Reads as motivated, and the user discounts the whole thing | Name what the idea gets right |
| **Verdict without a counter-project** | "No" is not a deliverable; the user still has the problem that produced the idea | §5 |
| **Phases with no kill criterion** | A roadmap nobody can ever stop executing | Each phase names the observation that stops it |
| **Recommending what the customer's own data refutes** | Available for free in §2, and fatal to credibility when they find it later | §2 before §3 |

## Related

- `prior-art` — whether this specific capability already exists in code, before building it
- `grilling` — the interview loop §0 uses when the request is one line
- `strategic-advisory` — negotiation, crisis, pricing and personal strategy, not idea validation
- `workflow-new-project` — building the thing, once the teardown says build
- `architectural-planning` — turning the counter-project into delegated work
