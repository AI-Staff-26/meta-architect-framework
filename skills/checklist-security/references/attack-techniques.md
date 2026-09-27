# Attack techniques — verifying security by running

Reading a diff finds the defects that are visible in the diff. The ones that reach
production are usually elsewhere: on a neighbouring path, in a race, inside a library
that is configured correctly and still behaves otherwise. These are found by running
the change against a test instance and attacking it.

Run against a **test instance** — its own port and database — never production.
Reproduce every finding; a finding you could not reproduce is labelled a hypothesis.
Report, next to the findings, what you attacked and what **held**: the next round
does not re-spend effort on what is already proven.

## Techniques

| Technique | How | What it catches |
|---|---|---|
| **CSRF matrix** | State-changing request with a cookie and: foreign `Origin`, `Origin: null`, a sibling subdomain, trailing slash, uppercase, duplicate `Origin` headers, missing custom header, `Content-Type: text/plain`, method-override headers | Gaps in cookie-authenticated write protection; `SameSite=Lax` does not stop sibling subdomains |
| **Mixed credentials** | Cookie and `Authorization` together; empty `Authorization` | A path that silently falls back to the cookie |
| **Concurrency** | 20–30 parallel requests at limits, single-use tokens, max-uses invites, "last owner" rules, counter reservations | Check-then-act races; limiters that count after the slow step |
| **Header forgery** | `Host`, `X-Forwarded-Host/Proto/For`, the app's own trusted headers (e.g. a client-IP header the edge sets) | Links built from request headers; rate limits keyed on spoofable input |
| **Path tricks** | `..`, `%2F`, `//`, case changes, trailing `/`, `;` on closed or proxied endpoints | Allowlists and log redaction matched on the raw path |
| **Timing and body diff** | Same request for an existing vs. a missing object/account; compare status, body bytes, latency | Enumeration; 404 vs 403 leaking existence |
| **Missing helper state** | Requests without the helper cookie/header the official client always sends | "Protections" that live only on the client (e.g. a session refreshed when a helper cookie is absent) |
| **Token confusion** | A token of one purpose at the endpoint of another; token in query vs body | Shared token tables without purpose binding; tokens leaking into URLs |
| **IDOR by path** | An id from tenant A under the path of tenant B | Authorisation checked on the path object, not on the target |
| **Neighbouring paths** | The same effect through every other entry: change vs. reset password, register-via-invite vs. sign-in, CLI vs. HTTP, API vs. web | A check present on the main path and absent on a sibling |
| **Chains** | Several harmless steps in order: register on someone's address → trigger a mail → the victim clicks → an invitation arrives | Trust granted by a weak step and consumed by a strong one |
| **Races with slow steps** | Start an action whose slow step (password hashing, remote call) overlaps a revocation, reset or role change | Sessions or grants created after the revocation they should have lost to |
| **Log sweep** | After full flows, search the logs for every issued token — tokens written to a 0600 file, `grep -F -f <file>` | Secrets in request logs, access logs, error logs |
| **Control run** | Temporarily revert the fix (or disable the check) and rerun its tests, then restore | Tests that pass whether or not the protection exists |

## Hygiene while attacking

- Secrets and tokens never go into command arguments — not even into a `grep`/`sed`
  filter meant to hide them; `ps` shows argv to every local user. Use the environment
  or a 0600 file.
- Clean up what you created: test users, schemas, temporary files with credentials.
- Rate-limit state from your probes can lock the instance for the implementer; clear
  it on the test database only, and say so in the report.
