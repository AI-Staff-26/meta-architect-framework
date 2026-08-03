# Troubleshooting Common Issues

## Skill Activation Issues

### Wrong skill activates

**Symptom:** IDE loads incorrect role  
**Solution:**

1. Use explicit invocation: `architect`
2. Check if commands overlap (use more specific)
3. Verify YAML descriptions don't conflict

---

### Skills don't activate at all

**Symptom:** No role responds  
**Diagnosis:**

- Check `.claude/skills/*/SKILL.md` files exist
- Verify YAML frontmatter syntax (---...---)
- Test with explicit `@role-name`

**Solution:**

1. Validate YAML with online validator
2. Restart IDE
3. Check IDE supports Skills

---

## Workflow Issues

### Meta-architect skips planning for 🟡🔴

**Symptom:** Delegates directly without Plan.md  
**Root cause:** Misclassified as 🟢  
**Solution:**

```
User: "STOP — это 🟡 Medium, нужен Plan.md"
```

Meta-architect will reclassify and create plan

---

### Coder improvises beyond scope

**Symptom:** Implementation adds unrequested features  
**Root cause:** Weak constraints in prompt  
**Solution:**

- Meta-architect: Revise prompt with explicit ❌ constraints
- Add to memory/FACTS.md if pattern repeats

---

### Reviewer always FAILs

**Symptom:** >3 FAIL reports on same code  
**Root cause:** Fundamental misunderstanding in Plan.md  
**Solution:**

```
User: "Начни расследование почему fails повторяются"
```

Invoke `debug` to analyze assumptions

---

## Context Issues

### AI starts repeating

**Symptom:** Same responses, circular logic  
**Root cause:** Context degradation (>50% full)  
**Solution:**

1. Create Context.md
2. Restart session
3. Resume with Context.md

---

### AI forgets earlier decisions

**Symptom:** Contradicts previous statements  
**Root cause:** Context "lost in the middle"  
**Solution:**

- Update /docs/* with decisions
- Reference docs explicitly
- Restart if >15 turns

---

## Quality Issues

### Tests fail after implementation

**Symptom:** `review` finds breaking changes  
**Root cause:** Insufficient acceptance criteria  
**Solution:**

- Meta-architect: Add explicit test requirements to Plan.md
- Include "all existing tests must pass" in constraints

---

### Security issues found late

**Symptom:** checklist-security FAIL after deployment  
**Root cause:** Checklist not loaded during review  
**Prevention:**

- Meta-architect: Mark task as security-critical
- Reviewer will auto-load checklist-security

---

## Performance Issues

### Slow skill loading

**Symptom:** Delays before response  
**Root cause:** Too many large skills active  
**Solution:**

- Normal for first activation (IDE caches after)
- If persistent: Restart IDE

---

### Description budget exceeded

**Symptom:** Some skills not activating  
**Diagnosis:** Total descriptions >15KB  
**Solution:**

- Check skill descriptions total
- Trim less-used skills to 150 chars
- Prioritize role skills (400 chars OK)

---

## IDE-Specific Issues

### Claude Code / Antigravity

- Skills work natively
- No known issues

### Cursor

- May need explicit @role-name more often
- Enable "Custom Instructions" in settings

### Windsurf

- Same as Cursor
- Check both `.claude/` and `.windsurf/` folders

---

## Emergency Recovery

### Complete framework failure

**Symptoms:** Nothing works, random behavior  
**Solution:**

1. Clear `.claude/` folder
2. Re-install framework files
3. Verify YAML in all SKILL.md files
4. Restart IDE
5. Test with simple task

---

### Lost project context

**Symptoms:** AI doesn't know project structure  
**Solution:**

1. Check memory/repo-wiki/overview.md exists
2. Regenerate if missing:

   ```
   User: "Создай Architecture.md на основе текущего кода"
   ```

3. Update Context.md for session

---

**Still having issues?** Ask role-guide: "Помощь с проблемой X"
