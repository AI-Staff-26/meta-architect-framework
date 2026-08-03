# IDE Compatibility & Limitations

## Supported IDEs

### ✅ Fully Supported

**Claude Code (Antigravity)**

- Skills: Native support
- Auto-activation: ✅ Excellent
- Folder: `.claude/skills/`
- Rules: `.claude/rules/`
- Version: Latest

**Google Antigravity**

- Skills: Native support (same as Claude Code)
- Auto-activation: ✅ Excellent
- Same folder structure

---

**Cursor**

- Skills: Via Custom Instructions
- Auto-activation: ⚠️ Good (may need explicit @role-name)
- Folder: `.claude/skills/` or `.cursor/skills/`
- Setup: Enable Custom Instructions in settings
- Version: 0.40+

---

**Windsurf (Codeium)**

- Skills: Via agent mode
- Auto-activation: ⚠️ Good
- Folder: `.claude/skills/` or `.windsurf/skills/`
- Setup: Enable agent mode
- Version: Latest

---

### ⚠️ Partial Support

**VS Code with Continue**

- Skills: Manual loading via context
- Auto-activation: ❌ No (manual @role selection)
- Workaround: Use `.continue/config.json` with context files

**Zed with AI assistant**

- Skills: Experimental
- Auto-activation: ❌ Limited
- Status: Check Zed docs for latest

---

### ❌ Not Supported

- IDEs without Skills/agent architecture
- Plain ChatGPT (no file system access)
- GitHub Copilot (no multi-agent support)

---

## Feature Matrix

| Feature | Claude Code | Cursor | Windsurf | VS Code+Continue |
|---------|-------------|--------|----------|------------------|
| Auto skill activation | ✅ | ⚠️ | ⚠️ | ❌ |
| YAML frontmatter | ✅ | ✅ | ✅ | ⚠️ |
| Progressive Disclosure | ✅ | ⚠️ | ⚠️ | ❌ |
| Multi-agent coordination | ✅ | ✅ | ✅ | ⚠️ |
| File system access | ✅ | ✅ | ✅ | ✅ |
| /docs/* updates | ✅ | ✅ | ✅ | ✅ |

---

## Known Limitations

### Description Budget (All IDEs)

- Total: ~15KB for all skill descriptions
- Current usage: ~5.3KB (35%)
- Limit: ~250-450 chars per skill recommended

### Context Window (IDE-dependent)

- Claude Code: ~200K tokens
- Cursor: Varies by model (Claude/GPT-4)
- Windsurf: ~100K tokens
- Recommendation: Keep sessions <50% capacity

### File Operations

- All: Can read/write files in project
- Limitation: Cannot execute shell commands (security)
- Workaround: Generate scripts, user executes

### Simultaneous Skills

- No hard limit (Progressive Disclosure manages)
- Practical: 3-5 skills active simultaneously
- IDE handles loading/unloading automatically

---

## Setup Instructions by IDE

### Claude Code / Antigravity

```bash
# No special setup needed
# Just add files to:
project/.claude/
├── rules/meta-architect-framework.md
└── skills/*/SKILL.md
```

---

### Cursor

```bash
# 1. Enable Custom Instructions
Settings → Features → Custom Instructions: ON

# 2. Add framework
project/.claude/
# or
project/.cursor/

# 3. May need explicit invocation
User: @role-meta-architect
```

---

### Windsurf

```bash
# Similar to Cursor
Settings → Agent Mode: ON

project/.claude/
# or
project/.windsurf/
```

---

### VS Code + Continue

```bash
# Add to .continue/config.json
{
  "contextProviders": [
    {
      "name": "meta-architect",
      "params": {
        "files": [
          ".claude/rules/meta-architect-framework.md",
          ".claude/skills/role-meta-architect/SKILL.md"
        ]
      }
    }
  ]
}

# Manual role selection in chat
User: @role-meta-architect
```

---

## Migration Between IDEs

**From Claude Code → Cursor:**

- Copy `.claude/` folder unchanged
- Enable Custom Instructions
- Test with simple task

**From Cursor → Windsurf:**

- Copy `.claude/` → `.windsurf/` (or keep .claude)
- Enable Agent Mode
- May need to adjust activation commands

**Universal:**

- `/docs/*` folder works everywhere
- Always-On Rules may need IDE-specific tweaks
- Test delegation flow after migration

---

## Future Compatibility

**Expected to add support:**

- Zed (planned)
- JetBrains IDEs (if they add Skills)
- More Codeium products

**Unlikely to support:**

- Plain text editors (Vim, Emacs) — no agent architecture
- Web-only tools without file access

---

**Check IDE version:** Skills support evolves rapidly  
**Best practice:** Use Claude Code/Antigravity for full feature set
