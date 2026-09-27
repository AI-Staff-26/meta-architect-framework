---
name: prior-art
description: |
  Prior art: whether the thing already exists before you build it, and how to
  judge what you find. Use before a new service, integration, tool, parser,
  scheduler, or other self-contained capability; on "уже есть готовое?", "не
  изобретаем ли велосипед", "find an existing implementation"; and when an
  error string or symbol might already be diagnosed in public code. Choosing
  between stacks you already know →
  `workflow-new-project/references/tech-stack-selection.md`.
---

# Prior Art

Most of what you are about to build has been built. The useful question is not *does something exist* — something always does — but **which of three things it is**: a dependency you take, an implementation you read and then write your own from, or a genuine gap.

Both ways of getting that wrong are expensive. A week spent on what one package already solves is the obvious one. The quieter one is a dependency on a repository with fourteen stars and no commits since 2023, which becomes someone's maintenance burden long after the person who chose it has moved on.

**Start at home.** Methods already proven in our own projects — with working examples and the traps they hit — are indexed in `/opt/hermes-paperclip/profiles/ai-staff/pipelines/AGENTS.md`. Read the index before searching outside; a match there is the "Read it" outcome with the edge cases already paid for.

## The three outcomes

| Outcome | When it is the right one | What you carry forward |
|---|---|---|
| **Take it** — dependency | Solved problem, still maintained, license fits how you ship, and the surface you need is roughly the surface it offers | Package name and a pinned version |
| **Read it** — reference implementation | The shape is right but the fit is wrong: too much surface, wrong stack, blocking license, or you need a third of it | The URL at a pinned commit, and the specific decisions you are copying |
| **Build it** — genuine gap | Nothing exists, or everything that does costs more to adopt than to write | The queries you ran, and why each candidate lost |

**The middle outcome is the most common and the most often skipped.** Even when every line ends up your own, an hour spent reading two working implementations tells you which edge cases are real, which sequence of calls the API actually requires, and which obvious-looking approach everyone abandoned. That is the cheapest hour in the project.

## Name the artifact

**Search for a string a working implementation must contain, not for the technology it belongs to.** A bare term matches file paths as well as content, so a technology name mostly returns files *named* after the technology — tutorials, awesome-lists, and READMEs.

| Searching for | Search instead |
|---|---|
| `kubernetes ingress` | `"nginx.ingress.kubernetes.io/rewrite-target"` |
| `python retry library` | `symbol:retry_with_backoff` or `"tenacity.retry"` |
| `fastapi rate limiting` | `"RateLimitExceeded" language:python` |
| `webhook signature verification` | `"X-Hub-Signature-256"` |
| `parse this proprietary format` | The magic bytes, or one literal header line from a real file |

The artifact is a symbol name, a config key, an HTTP header, an error message, an import line, or a magic constant — something that is *in the file* when the thing works and absent when it does not.

Cannot name one? That is the signal to keep reading documentation, not to start searching. Not knowing what the implementation looks like is exactly why the search would come back empty.

## Pick the engine for the question

`references/code-search-engines.md` holds the syntax, the verified traps, and copy-paste invocations. The choice itself:

| Engine | Best for | Note |
|---|---|---|
| **Sourcegraph stream API** — `curl`, no auth | Finding an implementation. Regex, including multiline, plus `type:symbol` | Returns matched lines with repo stars and last-fetch date in one response |
| **GitHub code search** via `WebFetch` | The same, scoped to GitHub default branches | Regex, `symbol:`, `path:` globs |
| **`gh search code`** / github MCP `search_code` | A quick literal or filename hit | Legacy engine: regex is matched **literally**, `symbol:` errors, 256-char queries |
| **`gh search repos`** / MCP `search_repositories` | Choosing a dependency | Stars, `pushed`, license, and archived state in one call |
| **`git clone --depth 1 --filter=blob:none`** + `rg` | Reading a candidate properly | Once the repository is found, local `rg` beats every web search |

The trap is that these are four query languages wearing similar syntax. A qualifier that is load-bearing in one is a literal search term in the next.

## Judge what you found

- **Pushed within 12 months.** Stars record a moment in the past; `pushed` records whether anyone is still there. An abandoned repository can still be an excellent reference implementation — it just cannot be a dependency.
- **Stars against the size of the niche.** Fifty stars on a Kafka client is nothing. Fifty on a driver for one laboratory instrument is the entire field.
- **License against how you ship.** MIT and Apache-2 are fine. **AGPL is a stop for anything served over a network** — its network-use clause reaches SaaS. Plain GPL is fine for something you run and never distribute, so check how the thing ships before treating it as a blocker.
- **Open issues describing your use case.** The bug you would hit next week is often already filed, with a workaround.
- **Dependency weight.** Forty transitive packages to save thirty lines is a trade, not a win.
- **Tests.** Without them you own correctness whether or not you wrote the code.

`search_repositories` returns stars, `pushed`, license, and archived state in a single call — one check rather than six.

**Read the tag, not `main`.** The default branch may already belong to the next major version. Pin whatever you read, and whatever you cite, to a tag or a commit.

## "Nothing found" is a claim about the index

Code search indexes are narrower than they look. Default branches only; files over 350 KiB, binaries, and non-UTF-8 excluded; vendored and generated content excluded from results by default; very large repositories sometimes not indexed at all; 100 results maximum with no sorting; queries capped at 1000 characters on the web and 256 through the REST API.

So: **before concluding that nothing exists, rename the artifact at least once and run a second engine.** Two empty searches with the same phrasing are one search.

## Where the result goes

A find that stays in the architect's context changed nothing.

| Outcome | Destination |
|---|---|
| Taken as a dependency | `memory/DECISIONS.md` — the choice, the alternatives, and why they lost |
| Read as a reference | The `## Reference` section of the prompt to `code` — URL at a pinned commit, plus the specific decisions being copied |
| Nothing found | The queries and artifact names, in the same decision entry — otherwise the next session runs them again from scratch |

## Completion criterion

One of the three outcomes is named, with the evidence behind it: the candidate and how it was judged, or the queries run and the artifact names they used. "Looked, found nothing" without the queries is not a finding — it is a gap wearing the shape of one.

## Related

- `references/code-search-engines.md` — syntax per engine, verified traps, invocations
- `workflow-new-project` — the stack decision this runs before
- `architectural-planning` — the `## Reference` slot a found implementation travels in
- `workflow-debugging` — searching an error string as a hypothesis source
- `codebase-design` — judging whether a candidate's surface is a deep module or a wrapper
