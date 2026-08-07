---
name: onboarding
description: >
  Project initialization and memory bootstrap. Activated when memory/PROFILE.md
  does not exist. Conducts a conversational discovery to understand the project,
  then generates the complete memory structure (PROFILE, CHRONICLE, FACTS,
  DECISIONS, CONTEXT, INSIGHTS, SUMMARY). May create project-specific agents,
  rules, or skills based on project type. Triggers: first interaction with
  no PROFILE.md, "start onboarding", "initialize project", "setup framework".
---

# SKILL: ONBOARDING

**Purpose:** Initialize the Project Memory Framework for a new project by discovering its nature, goals, and context — then generating the complete memory structure.

This skill is activated **once per project**, when `memory/PROFILE.md` does not exist. All generated files follow the schemas in `memory-keeping`.

---

## PRINCIPLES

### 1. Conversational, Not a Form

**DO NOT** present a rigid questionnaire:
```
"Please fill in:
1. Project name: ___
2. Type: ___
3. Stack: ___"
```

**DO** have a natural conversation:
```
"Let's get to know your project. I'll ask some questions to understand what
we're working with, then I'll set up the memory structure so I can maintain
full context across all our sessions.

What are we building?"
```

### 2. Adaptive Depth

Adjust the depth and focus of questions based on the project type:
- **Software project** → deep dive into tech stack, architecture, dev workflow
- **Business project** → focus on goals, constraints, stakeholders, timelines
- **Creative project** → focus on vision, audience, style, deliverables
- **Research project** → focus on hypothesis, methodology, data sources
- **Personal project** → keep it light, focus on goals and constraints

### 3. Graceful Uncertainty

If the user is unsure about something, mark it as `TBD` in the relevant file and move on. These can be revisited later. Never block onboarding on missing information.

### 4. Language Adaptation

The skill instructions are in English, but the **onboarding conversation must adapt to the user's preferred language**. If the user responds in Russian, continue in Russian. If in English, continue in English. Ask about preferred language if unclear, and record it in PROFILE.md.

---

## PHASE 1 — DISCOVERY

Conduct a conversational discovery. Ask questions in natural groups, adapting based on answers. Do not ask irrelevant questions (e.g., don't deep-dive into tech stack for a pure business project).

### Question Areas

**1. Project Identity**
- What is this project? What's its name?
- Brief description — what does it do or what is it about?
- What type of project is it? (Suggest types if helpful: SaaS, API, library, mobile app, business plan, creative portfolio, research paper, personal tool, education course, etc.)

**2. Goals**
- What is the primary goal? What does success look like?
- Any secondary goals or nice-to-haves?
- Timeline — any deadlines or milestones?

**3. Current State**
- Where is the project right now? (Greenfield / existing codebase / migration / ongoing / planning phase)
- What has been done so far? What's next?

**4. Stack & Tools** *(skip or minimize for non-technical projects)*
- Languages, frameworks, libraries?
- Database, infrastructure, hosting?
- External services or APIs?
- Dev tools, CI/CD, testing frameworks?

**5. Team & Roles**
- Solo developer or team?
- If team — who does what? Any external stakeholders?

**6. Constraints**
- Budget limitations?
- Time constraints or hard deadlines?
- Technical constraints (legacy systems, specific platforms)?
- Regulatory or compliance requirements?

**7. Communication Preferences**
- Preferred language for communication? (English, Russian, etc.)
- Communication style? (Formal/informal, concise/detailed, with examples, etc.)
- Level of detail expected in reports and explanations?

### Conversation Flow

Ask 2-3 related questions at a time. Wait for answers before continuing. Adapt:

- If the user gives long, detailed answers → ask fewer follow-ups
- If the user gives short answers → probe deeper where needed
- If the user says "I don't know yet" → mark as TBD, move on
- If the user is in a hurry → switch to Quick Mode (see Special Cases below)

---

## PHASE 2 — CLASSIFICATION & RECOMMENDATION

After gathering information, analyze and classify the project. Present your findings to the user for confirmation.

### Determine Project Type

Classify into one or more:
- `saas` — SaaS product or web application
- `api` — API or backend service
- `library` — Reusable library or package
- `mobile` — Mobile application
- `cli` — Command-line tool
- `business` — Business planning, strategy, operations
- `creative` — Design, writing, content creation
- `research` — Academic or applied research
- `personal` — Personal project or tool
- `education` — Course, tutorial, learning material
- `devops` — Infrastructure, deployment, automation
- `data` — Data engineering, analytics, ML/AI
- `mixed` — Combination of above

### Recommend Agent Configuration

Based on project type, recommend which core agents should be active:

| Project Type | Recommended Agents |
|---|---|
| **Dev projects** (saas, api, library, mobile, cli, devops, data) | `code`, `review`, `debug`, `devops`, `vibe-mentor` |
| **Business** | `consilium`, `advisor` + custom agents as needed |
| **Creative** | `advisor` + custom agents as needed |
| **Research** | `advisor`, `consilium` + custom agents as needed |
| **Personal** | Minimal — `advisor`, and `code` where the work is technical |
| **Education** | `advisor`, `consilium` + custom agents as needed |
| **Mixed** | Appropriate combination based on components |

The architect orchestrates in every case and is not listed — it is the entry point, not an option.

### Recommend Custom Extensions

Suggest whether the project would benefit from:
- **Custom agents** (e.g., `presenter` for business pitches, `researcher` for academic work, `designer` for UI-heavy projects)
- **Custom rules** (e.g., specific coding standards, branch naming conventions, documentation requirements)
- **Existing skills** that would be useful (e.g., week rotation, specific workflows)

### Present for Confirmation

```
Based on what you've told me, here's my assessment:

**Project Type**: [type]
**Active Agents**: [list]
**Custom Recommendations**: [if any]

Does this look right? Anything you'd like to change?
```

Wait for user confirmation before proceeding to Phase 3.

---

## PHASE 3 — GENERATION

Create all memory files following the schemas in `memory-keeping`. Use today's date and current ISO week for all timestamps.

### File 1: `memory/PROFILE.md`

Populate with all gathered information:

```markdown
# Project Profile

## Identity
- **Name**: [Project name]
- **Type**: [Classified type]
- **Description**: [One-paragraph summary from discovery]
- **Started**: [Today's date, YYYY-MM-DD]

## Goals
- **Primary**: [Main objective]
- **Secondary**:
  - [Secondary goal 1]
  - [Secondary goal 2]

## Stack & Tools
- [Language/framework 1]
- [Language/framework 2]
- [Database, infra, etc.]
<!-- For non-technical projects, list relevant tools: spreadsheets, design tools, etc. -->

## Team & Roles
- [Person/role 1]
- [Person/role 2]
<!-- For solo projects: "Solo developer" or "Solo creator" -->

## Constraints
- [Constraint 1]
- [Constraint 2]
<!-- Mark unknowns as TBD -->

## Communication
- **Language**: [Preferred language]
- **Style**: [Communication preferences]

## Custom Framework Config
- **Active Agents**: [List of active agents]
- **Custom Rules**: [Any project-specific rules, or "None"]
- **Custom Skills**: [Any project-specific skills, or "None"]
```

### File 2: `memory/weeks/YYYY-WNN/CHRONICLE.md`

Create for the current ISO week with the initialization milestone:

```markdown
# Chronicle — Week YYYY-WNN (Mon Date – Sun Date)

## YYYY-MM-DD

### [milestone] Project initialized
Onboarding completed. Framework memory structure created.
Project type: [type]. Goals: [primary goal summary].
```

### File 3: `memory/FACTS.md`

Pre-populate with all facts discovered during onboarding, organized by category:

```markdown
# Project Facts

## Technical
- [Tech fact 1] [source: onboarding, date: YYYY-MM-DD]
- [Tech fact 2] [source: onboarding, date: YYYY-MM-DD]

## Business
- [Business fact 1] [source: onboarding, date: YYYY-MM-DD]

## Constraints
- [Constraint fact 1] [source: onboarding, date: YYYY-MM-DD]

## People
- [Team fact 1] [source: onboarding, date: YYYY-MM-DD]

## [Additional categories as discovered]
```

Omit empty categories. Only include facts that were actually discovered.

### File 4: `memory/DECISIONS.md`

Create with empty template:

```markdown
# Decisions

<!-- Decisions are numbered sequentially: #001, #002, etc. -->
<!-- Each decision records: Context, Options, Chosen, Consequences, Status -->
```

### File 5: `memory/CONTEXT.md`

Create with initial state reflecting the onboarding results:

```markdown
# Current Context (updated: YYYY-MM-DD)

## State
- **Working on**: Project just initialized via onboarding.
- **Last completed**: Framework memory structure created.

## Active Tasks
- [Based on what the user said about current state and next steps]

## Recent Decisions
- None yet

## Watch Out
- [Any constraints or risks discovered during onboarding]
- [Any TBD items that need revisiting]
```

### File 6: `memory/INSIGHTS.md`

Create with empty template:

```markdown
# Insights

## What Works

## What Doesn't Work

## Patterns
```

### File 7: `memory/SUMMARY.md`

Create with empty template:

```markdown
# Project Weekly Summaries

<!-- Weekly summaries are added automatically during week rotation -->
<!-- Each entry includes: Focus, Key outcomes, Decisions made, Open issues, Next week priority -->
```

### File 8: `memory/repo-wiki/meta.json`

Create the repo wiki directory and initial meta.json:

```json
{
  "files": {}
}
```

The repo wiki will be populated as agents work with the codebase. If the project already has code, create an initial `overview.md` with a basic architecture description and mermaid diagram, and register it in meta.json.

### File 9 (Optional): Project-specific agents

If recommended in Phase 2, create agent files in the agents directory. Each agent file should follow the standard agent format with:
- Name, description, role definition
- What memory files it reads/writes
- Its specific responsibilities

### File 10 (Optional): Project-specific rules

If recommended in Phase 2, create rule files in the rules directory. Each should define clear, actionable rules for the project.

---

## PHASE 3.5 — GREENFIELD SETUP (only for new software projects)

If the project is a **greenfield software project** (new codebase from scratch), extend the onboarding with project initialization steps. Skip this phase entirely for non-technical projects, existing codebases, or business/creative projects.

### Step 3.5.1: Stack Selection

**Actions:**

1. Propose 2-3 technology stack options based on:
   - Project requirements (from Phase 1)
   - Team skills and preferences
   - Long-term support and community
   - Hosting/deployment constraints

2. For each option, provide:
   - **Pros** and **Cons**
   - **Complexity** assessment (Low/Medium/High)
   - **Effort** estimate

3. Give a recommendation with justification.

**Artifact (🟡🔴):**

```markdown
## Stack Options

### Option A: [Name]
**Pros:** ...
**Cons:** ...
**Complexity:** Low/Medium/High

### Option B: [Name]
**Pros:** ...
**Cons:** ...

**Recommendation:** Option A, because [justification]
```

**STOP Gate (🟡🔴):** Get user approval on stack before proceeding.

### Step 3.5.2: Architecture Definition

**Actions:**

1. Select architectural pattern based on Requirements:
   - `pattern-clean-architecture` — layered architecture
   - `pattern-modular-monolith` — modular monolith
   - Microservices — for 🔴 projects

2. Define components:
   - Name and responsibility
   - Dependencies (what it depends on / what depends on it)
   - Public interfaces/contracts

3. Create `memory/repo-wiki/overview.md` with:
   - Component diagram (Mermaid)
   - Description of each layer/module
   - Data flow
   - Key technical decisions

4. Register `overview.md` in `memory/repo-wiki/meta.json`.

**STOP Gate (🟡🔴):** Get user approval on architecture before scaffolding.

### Step 3.5.3: Project Scaffolding

**Delegate to `code`:**

Create a prompt for `code` with:
- Project initialization (npm init / cargo new / etc.)
- Directory structure matching chosen architecture
- Base configuration (tsconfig, eslint, etc.)
- Git init + .gitignore
- Package manager + core dependencies
- Linter + formatter setup
- Basic scripts (dev, build, test)

**Infrastructure by complexity:**

| Level | Setup |
|-------|-------|
| 🟢 | Package manager + deps + linter + basic scripts |
| 🟡 | + CI config (GitHub Actions / GitLab CI) + Docker (optional) + pre-commit hooks |
| 🔴 | + Full CI/CD pipeline + Docker Compose + IaC + monitoring setup |

**Smoke Test after scaffolding:**

- [ ] Project runs (`npm run dev` / etc.)
- [ ] Linter passes without errors
- [ ] Tests run (empty test suite OK)
- [ ] Structure matches architecture

### Step 3.5.4: First Deliverable

**Select minimal working slice:**

- One endpoint / one page / one command
- End-to-end path (from input to output)
- Validates architectural decisions

**Protocol:**

1. Create `/docs/prompt-first-deliverable.md` with spec
2. Delegate to `code`
3. `review` verifies
4. Update `memory/*` based on results

**After first deliverable:**

- Update `memory/CONTEXT.md` with current state
- Add [milestone] to CHRONICLE.md
- Update `memory/repo-wiki/` with actual implementation details

---

## PHASE 4 — CONFIRMATION

Present the generated structure to the user and get approval.

### Summary Template

```
Memory structure created! Here's what was generated:

📁 **Files created:**
  - `memory/PROFILE.md` — Project DNA (identity, goals, stack, constraints)
  - `memory/CONTEXT.md` — Current state snapshot
  - `memory/FACTS.md` — [N] facts recorded from onboarding
  - `memory/DECISIONS.md` — Decision log (empty, ready for use)
  - `memory/INSIGHTS.md` — Patterns & learnings (empty, ready for use)
  - `memory/SUMMARY.md` — Weekly summaries (empty, ready for use)
  - `memory/weeks/YYYY-WNN/CHRONICLE.md` — This week's event log (initialized)
  - `memory/repo-wiki/meta.json` — Repo wiki index (empty, ready for use)
  [If custom agents/rules were created, list them here]

🎯 **Project type**: [type]
🤖 **Active agents**: [list]

Would you like to adjust anything? I can modify any of these files.
```

### After Confirmation

Once the user approves (or after making requested adjustments):

1. Add a final chronicle entry:

```markdown
### [milestone] Onboarding confirmed by user
Memory structure reviewed and approved. Framework is ready for use.
```

2. Inform the user the framework is ready and briefly explain how it works:
   - Memory is maintained automatically across sessions
   - Facts, decisions, and events are logged as work progresses
   - Weekly summaries are generated during week rotation
   - They can ask any agent for help and context will be preserved

### Next Steps Suggestion

If the project is a **greenfield software project**, suggest continuing with project initialization:

```
Your project memory is set up! If you're ready to start building, I can guide you
through project initialization using the `workflow-new-project` skill:
- Tech stack selection
- Architecture definition
- Project scaffolding
- First deliverable

Just say "let's start building" or "initialize the project" when you're ready.
```

This is a suggestion only — the user may want to do other things first.

---

## SPECIAL CASES

### Quick Mode (user is in a hurry)

```
Got it — let's do a quick setup. I just need the essentials:

1. What's the project? (name + one sentence)
2. What's the main goal?
3. What tech/tools are involved? (if applicable)
4. Any hard constraints I should know about?

I'll set up the memory structure with this and we can flesh it out later.
```

Generate files with available info, mark everything else as TBD.

### Profile Update (PROFILE.md already exists)

```
I see this project already has a memory structure (memory/PROFILE.md exists).

This skill is for initial setup only. If you need to update the profile,
just tell me what changed and I'll update the relevant memory files directly.
```

Do NOT re-run full onboarding. Direct the user to simply tell you what changed.

### User Unsure About Answers

For any question where the user is uncertain:
- Accept "I don't know yet" or "TBD" gracefully
- Record the field as `TBD` in PROFILE.md
- Add a note in CONTEXT.md under "Watch Out": `TBD: [field] needs to be determined`
- Move on without pressure

### Non-English Projects

If the user responds in a non-English language:
- Continue the conversation in that language
- Record `Communication > Language` in PROFILE.md
- All memory file **headers and structure** remain in English (for consistency)
- **Content** within the files should be in the user's preferred language
- Structural elements (section names, tags like `[milestone]`, field labels) stay in English

---

## EXECUTION CHECKLIST

Use this checklist to ensure nothing is missed:

- [ ] Phase 1: Asked about project identity, goals, state, stack, team, constraints, communication
- [ ] Phase 2: Classified project type, recommended agents, presented for confirmation
- [ ] Phase 3: Created all memory files + repo wiki
  - [ ] `memory/PROFILE.md` — populated with all gathered info
  - [ ] `memory/weeks/YYYY-WNN/CHRONICLE.md` — with initialization milestone
  - [ ] `memory/FACTS.md` — pre-populated with discovered facts
  - [ ] `memory/DECISIONS.md` — empty template
  - [ ] `memory/CONTEXT.md` — initial state
  - [ ] `memory/INSIGHTS.md` — empty template
  - [ ] `memory/SUMMARY.md` — empty template
  - [ ] `memory/repo-wiki/meta.json` — empty wiki index
  - [ ] Optional: initial `repo-wiki/overview.md` if codebase exists
  - [ ] Optional: custom agents, rules, skills
- [ ] Phase 3.5 (greenfield only): Stack selected, architecture defined, scaffolded, first deliverable
  - [ ] Stack selection proposed and approved (🟡🔴)
  - [ ] Architecture defined in `memory/repo-wiki/overview.md`
  - [ ] Project scaffolded via `code`
  - [ ] Smoke test passed
  - [ ] First deliverable implemented and reviewed
- [ ] Phase 4: Presented summary, got confirmation, added final chronicle entry
