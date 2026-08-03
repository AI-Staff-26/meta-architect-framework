# Best Practices for Users

## Starting Tasks

✅ **DO:**

- Start with clear, actionable request
- Let meta-architect classify complexity
- Provide context if task is ambiguous

❌ **DON'T:**

- Skip planning for 🟡🔴 tasks
- Try to implement directly without orchestrator
- Ignore STOP gates

---

## Using Commands

✅ **DO:**

- Use structured commands: "Выполни реализацию", "Проверь код"
- Follow commands suggested by agents
- Use explicit @role-name if auto-activation fails

❌ **DON'T:**

- Use vague commands: "сделай", "go", "давай"
- Skip intermediate steps
- Expect IDE to always guess correctly

---

## Working with Plans

✅ **DO:**

- Review Plan.md before approval
- Ask clarifying questions if unclear
- Trust the STOP gate process

❌ **DON'T:**

- Approve without reading
- Pressure skip planning for "quick" 🟡🔴 tasks
- Modify plan mid-implementation without updating Plan.md

---

## Managing Sessions

✅ **DO:**

- Create Context.md after >10 turns
- Restart session when context feels heavy
- One task per session for 🔴 Complex

❌ **DON'T:**

- Continue when AI starts repeating
- Mix multiple unrelated tasks in one session
- Ignore degradation signs

---

## Handling Failures

✅ **DO:**

- Let meta-architect analyze FAIL reports
- Trust Two Steps Back rule (>2 failures → @expert)
- Update Plan.md with lessons learned

❌ **DON'T:**

- Immediately retry same approach
- Ignore repeated failures
- Bypass quality gates to "save time"

---

## Working with Documentation

✅ **DO:**

- Check /docs/* before starting
- Update docs after completion
- Use /docs/* as single source of truth

❌ **DON'T:**

- Skip Architecture.md updates
- Rely on code comments as documentation
- Let docs drift from reality

---

## Skill Management

✅ **DO:**

- Trust Progressive Disclosure
- Let IDE auto-load skills
- Use @role-name as fallback

❌ **DON'T:**

- Try to manually "load" skills
- Worry about "too many skills active"
- Override IDE semantic matching without reason

---

## Communication

✅ **DO:**

- Be specific about requirements
- Provide examples when helpful
- Confirm understanding before proceeding

❌ **DON'T:**

- Assume AI knows unstated requirements
- Use ambiguous pronouns ("it", "that", "this")
- Rush through critical decisions

---

## Common Patterns

**When to ask role-guide:**

- "Как работает X?"
- "Где находится код для Y?"
- "Нужна ли функция Z?"

**When to start with meta-architect:**

- "Добавь..."
- "Исправь..."
- "Улучши..."

**When to invoke expert:**

- After meta-architect suggests investigation
- When >2 fixes failed
- When root cause unclear
