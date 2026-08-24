# 🔧 AI Failure Modes

<purpose>
A reference for recognising and clearing the common failure modes of AI agents.
Use it when the agent loops, degrades, or behaves unexpectedly.
</purpose>

---

## Quick Diagnosis

| Symptom | Likely cause | Action |
|---------|-------------------|----------|
| Repeats the same mistakes | Context Overflow | → Session restart |
| Forgets constraints | Lost in the Middle | → Move them to the start and the end |
| Ignores requirements | Prompt Overload | → Shorten the prompt |
| Adds things nobody asked for | Scope Drift | → Explicit ❌ boundaries |
| Hallucinates APIs and functions | Knowledge Cutoff | → Supply the context explicitly |
| Loops on patches | Patch Loop | → `debug` + restart |

---

## 🔴 Critical Failure Modes

### 1. Context Overflow

**Symptoms:**
- Forgets information from the start of the session
- Confuses files, variables, names
- Contradicts itself
- More than 10–15 steps into the session

**Root cause:**
The context window is full and the model is evicting the older material.

**Remedy:**
```
1. STOP the current work
2. Write a Context.md snapshot
3. Start a new session
4. Load only Context.md and the target files
5. Continue from a clean state
```

**Prevention:**
- [ ] The 10–15 step rule
- [ ] Keep the context under 50% full
- [ ] Regular Context.md snapshots

---

### 2. Lost in the Middle

**Symptoms:**
- Honours the constraints at the start of the prompt
- Honours the constraints at the end of the prompt
- IGNORES the constraints in the middle

**Root cause:**
A property of the Transformer architecture — attention is strongest at the edges.

**Remedy:**
```
Prompt structure:

┌─────────────────────────────┐
│ 🔴 CRITICAL (start)         │
├─────────────────────────────┤
│ 🟡 Context (middle)         │
├─────────────────────────────┤
│ 🔴 CRITICAL (end)           │
│ ❌ BOUNDARIES (last)        │
└─────────────────────────────┘
```

**Prevention:**
- [ ] Repeat the critical constraints in both positions
- [ ] ❌ boundaries always last
- [ ] Acceptance criteria before the output format

---

### 3. Patch Loop

**Symptoms:**
- Fixing one thing breaks another
- Workarounds accumulate
- More than two iterations with no progress
- The code keeps getting more complicated

**Root cause:**
The problem is not understood, so the symptoms are being treated.

**Remedy:**
```
1. STOP — no more patches
2. Call `debug` for root cause analysis
3. Produce Research.md with the findings
4. Revise Plan.md from those findings
5. Restart in a clean session
6. `code` with the new understanding
7. `review` to verify
```

**Prevention:**
- [ ] Understand the "why" before the "how"
- [ ] At most two attempts at a fix
- [ ] Cause unclear → `debug`

---

### 4. Scope Drift

**Symptoms:**
- Adds "improvements" nobody asked for
- Touches unrelated files
- Offers to refactor "while we are here"
- Does more than was requested

**Root cause:**
The agent trying to be helpful, optimising past the edge of the scope.

**Remedy:**
```markdown
❌ Out of bounds:
- Changing files outside the scope
- Adding functionality that was not requested
- Refactoring "while we are here"
- Improving what is not broken
```

**Prevention:**
- [ ] An explicit list of files to change
- [ ] An explicit ❌ section in every prompt
- [ ] "ONLY the following changes" in the prompt

---

### 5. Hallucination

**Symptoms:**
- Uses APIs and functions that do not exist
- Cites files that do not exist
- Invents libraries and methods
- Is confidently wrong

**Root cause:**
Knowledge cutoff, and no current context to correct it.

**Remedy:**
```
1. Supply the context explicitly (files, API docs)
2. State the library versions
3. Give examples of the existing code
4. Ask for verification before use
```

**Prevention:**
- [ ] Load the project's current files
- [ ] State dependency versions explicitly
- [ ] "Use ONLY existing APIs" in the prompt

---

### 6. Prompt Overload

**Symptoms:**
- Completes part of the work
- Skips requirements
- Confuses the priorities
- Does something other than the main thing

**Root cause:**
Too many requirements in a single prompt.

**Remedy:**
```
Decompose:
1. Split into 2–3 subtasks
2. One prompt per subtask
3. At most 5–7 requirements per prompt
4. Explicit priority (1. essential, 2. important, 3. desirable)
```

**Prevention:**
- [ ] One prompt, one focused task
- [ ] Max 5–7 concrete requirements
- [ ] Numbered by priority

---

## 🟠 Moderate Failure Modes

### 7. Eager Execution

**Symptom:** Starts acting before the task is fully understood.

**Remedy:** Add an explicit step — "Before implementation, confirm understanding…"

---

### 8. Overconfidence

**Symptom:** Assumes rather than asking when something is ambiguous.

**Remedy:** "If unclear, STOP and ask. Do NOT assume."

---

### 9. Verbosity Explosion

**Symptom:** Explains the obvious, inflates the answer.

**Remedy:** "Be concise. Code only. No explanations unless asked."

---

### 10. Tool Fumbling

**Symptom:** Uses tools incorrectly, passes wrong arguments.

**Remedy:** Explicit examples of the tool calls in the prompt.

---

## Diagnostic Protocol

On suspicion of an AI failure:

```
1. IDENTIFY the symptom
   ↓
2. FIND the failure mode in the table
   ↓
3. APPLY the remedy
   ↓
4. 🔴 Critical → restart is mandatory
   🟠 Moderate → fix in the current session
   ↓
5. DOCUMENT it in Context.md / Research.md
   ↓
6. Continue, with the prevention in place
```

---

## Decision Tree

```
Trouble with the agent?
    │
    ├─ Forgets or confuses things → Context Overflow
    │   └→ Restart + Context.md
    │
    ├─ Ignores some requirements → Lost in the Middle
    │   └→ Restructure the prompt
    │
    ├─ Patch → regression → patch → Patch Loop
    │   └→ `debug` + Research.md
    │
    ├─ Does more than asked → Scope Drift
    │   └→ Explicit ❌ boundaries
    │
    ├─ Uses things that do not exist → Hallucination
    │   └→ Supply the context
    │
    └─ Completes only part → Prompt Overload
        └→ Decompose
```

---

## Quick Reference

```
AI failure triage:

🔴 Restart required:
   - Context Overflow (>15 turns)
   - Patch Loop (>2 failed fixes)
   - Complete confusion

🟠 Fix in-session:
   - Lost in the Middle → restructure
   - Scope Drift → add an ❌ section
   - Hallucination → add context
   - Prompt Overload → decompose

Golden rule:
Three clean sessions of five steps
beat one dirty session of fifteen.
```

---

**Related files:**
- `../../architectural-planning/SKILL.md` — prompts, decomposition, context passthrough
- `../../workflow-ai-session/SKILL.md` — the session recovery protocol
- `../SKILL.md` — diagnosing an agent that keeps failing
