# Code Search Engines

Four engines, four query languages that look alike. A qualifier that is load-bearing in one is a literal search term in the next — which is why a query copied between them fails silently rather than erroring.

Everything marked **verified** below was run from a Linux host on 2026-08-24 with an authenticated `gh`. Re-check anything that stops behaving as described; public endpoints move.

## Qualifier correspondence

| Need | Sourcegraph | GitHub code search (web) | Legacy REST — `gh search code`, MCP `search_code` | Repo search — `gh search repos`, MCP `search_repositories` |
|---|---|---|---|---|
| One repository | `repo:^github\.com/o/r$` | `repo:o/r` | `repo:o/r` | — |
| One org | `repo:^github\.com/org/` | `org:name` | `org:name` | `org:name` |
| Language | `lang:go` | `language:go` | `language:go` | `language:go` |
| Directory | `file:^src/` | `path:/src/**/*.go` | `path:src` — prefix, no globs | — |
| Exact filename | `file:(^\|/)Dockerfile$` | `path:/(^\|\/)Dockerfile$/` | `filename:Dockerfile` | — |
| Extension | `file:\.tf$` | `path:*.tf` | `extension:tf` | — |
| Symbol definition | `type:symbol Foo` | `symbol:Foo` | **unsupported — HTTP 422** | — |
| Regular expression | native | `/pattern/` | **matched literally** | — |
| Content, not path | default | `content:"…"` | `in:file` | `in:readme`, `in:name` |
| Skip forks and archives | default | `NOT is:fork NOT is:archived` | `is:fork` filter only | `fork:false archived:false` |
| Result cap | `count:N` | 100, no sorting | `--limit` 1..1000 | `--limit` 1..1000 |
| Auth | none | none | token required | token required |

**`filename:` and `extension:` do not exist in GitHub's current code search.** Its qualifier list is `repo` `org` `user` `enterprise` `language` `license` `path` `symbol` `content` `is`. Both qualifiers are alive and correct in the legacy REST API — which is what `gh search code` and the github MCP `search_code` tool call — so the same string is right in one place and wrong in the other.

## Sourcegraph stream API

The strongest option for *find me a working implementation*: public code across GitHub, GitLab and others, real regex, symbol search, and no authentication. Results carry the matched line, the repository's star count, and when it was last fetched — enough to judge a candidate without a second call.

```bash
curl -sS -G "https://sourcegraph.com/.api/search/stream" \
  --data-urlencode 'q=context:global "X-Hub-Signature-256" lang:python count:5' \
  --data-urlencode 'v=V3' \
  -H "Accept: text/event-stream"
```

The response is SSE: `event:` lines naming a payload type, `data:` lines carrying JSON. Verified parser for the `content` matches:

```bash
… | python3 -c '
import sys, json
for ln in sys.stdin:
    if not ln.startswith("data: "):
        continue
    try:
        items = json.loads(ln[6:])
    except Exception:
        continue
    if not isinstance(items, list):
        continue
    for m in items:
        if m.get("type") != "content":
            continue
        hit = (m.get("lineMatches") or [{}])[0].get("line", "").strip()
        print("%s  *%s  %s" % (m["repository"], m.get("repoStars", 0), m["path"]))
        print("    " + hit)
'
```

Query elements worth knowing:

| Element | Effect |
|---|---|
| `context:global` | Search all indexed public code — without it the scope is narrower |
| `"exact phrase"` | Literal match |
| `/regex/` or a bare pattern | Regular expression, **multiline patterns work** (verified) |
| `type:symbol Foo` | Definitions rather than call sites (verified) |
| `lang:` `file:` `repo:` | Language, path regex, repository regex |
| `count:N` | Results to return; the default stops early |
| `fork:yes` `archived:yes` | Opt back in — both are excluded by default |

## GitHub code search

No API worth using: the modern engine is the web interface, reachable with `WebFetch` against `https://github.com/search?q=…&type=code`. `cs.github.com` is a 301 redirect to exactly that (verified), not a separate index — as is `github.com/OWNER/REPO/search`, which 302s to a global search scoped with `repo:` (verified).

```text
"nginx.ingress.kubernetes.io/rewrite-target" NOT is:fork
language:go symbol:NewController path:controller
path:/(^|\/)Dockerfile$/ "HEALTHCHECK"
/(password|secret)\s*[:=]\s*"/ language:yaml NOT is:archived
language:python AND (flask OR fastapi) NOT path:tests
```

- Terms, operators, qualifiers and parentheses must be **space-separated**; `AND` is implicit between bare terms.
- Regex goes between slashes, in bare terms and inside most qualifiers. Look-around is unsupported.
- `path:` takes globs — `*` stops at `/`, `**` crosses directories, a leading `/` anchors to the repository root.
- `NOT is:vendored NOT is:generated` is redundant: both are already out of default results, and `is:` opts them back **in**.

## Legacy REST — `gh search code`, MCP `search_code`

Fine for a literal string or a filename hit, and it is the only one of the two GitHub engines an agent can call directly. Two failure modes, both verified:

```bash
# Works
gh search code 'FROM python' --filename Dockerfile --limit 5 --json repository,path

# Silently wrong — searches for the literal characters, slashes included
gh search code '/signal\.NotifyContext/'

# Errors: HTTP 422 ERROR_TYPE_QUERY_PARSING_FATAL
gh search code 'symbol:NotifyContext language:go'
```

The literal-regex case is the dangerous one: it returns plausible results — mostly test files that contain the regex as a string — and nothing signals that the search did not mean what it said. Queries cap at 256 characters.

## Repository search — choosing a dependency

```bash
gh search repos "mcp server" --language=python --stars=">200" \
  --sort=updated --limit 20 --json fullName,stargazersCount,updatedAt,license,isArchived
```

One call returns everything the judgement in `SKILL.md` needs. Web equivalent: `topic:devops stars:>100 pushed:>2026-01-01 archived:false license:mit`. This engine negates with `-`, not `NOT`, and knows nothing about file contents — `in:name` and `in:readme` are the whole of its text reach.

## Reading a candidate

```bash
# One file, no HTML
curl -sS https://raw.githubusercontent.com/OWNER/REPO/TAG/path/to/file.py

# Same, through the API — works for private repositories
gh api repos/OWNER/REPO/contents/path/to/file.py --jq .content | base64 -d

# The whole thing, cheaply, then search it properly
git clone --depth 1 --filter=blob:none --branch v1.4.2 https://github.com/OWNER/REPO /tmp/cand
rg -n 'retry|backoff' /tmp/cand
```

Use a tag or commit in the path rather than `main`. Once a repository is on disk, `rg` and the language server beat every web search — `github.dev` and the browser file finder solve a problem an agent does not have.

## Index limits

These make "no results" a statement about the index rather than about the world:

- Default branches only.
- Files over 350 KiB, binaries, and non-UTF-8 files are excluded; so are vendored and generated files.
- Very large repositories may not be indexed at all.
- Code search returns at most 100 results, unsorted.
- Queries cap at 1000 characters on the web, 256 through the REST API.

## Not agent-reachable

**grep.app** sits behind a bot checkpoint — a plain `curl` from a server returns `429` and a Vercel interstitial (verified). It is a good tool to hand a human as a link, and it does not understand GitHub qualifiers: `filename:Dockerfile` there searches for that literal string.

**`github.dev`**, the `.` keyboard shortcut, and `github.com/search/advanced` are browser interfaces. The shallow clone above covers what they offer.
