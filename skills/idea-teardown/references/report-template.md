# Report Template

Russian prose — the reader is human. English for code, identifiers, tool names, SQL, file paths.

Each section below names what it must contain and the failure it prevents. Drop a section only when it is genuinely empty, and say that it is.

---

## Header table

| Поле | Значение |
|---|---|
| Дата | |
| Автор | model + brief path |
| Вопрос | **The framed question from §0, in one sentence.** If the user waved the frame through, the assumptions go here, marked as assumptions |
| Метод | Agent count by phase, findings count by severity, what was verified first-hand, and any axes borrowed from another idea type with the row each came from — or a line saying none translated |
| Вердикт одной строкой | The whole answer, before any evidence. A reader who stops here must not be misled |

Follow with the evidence-tier legend — `[проверено]` / `[измерено]` / `[вторичный]` / `[гипотеза]` — and the rule that no verdict rests on the last two alone.

## 1. Ответ на вопрос

The verdict, then the **decisive measurements** that produce it — three to five, numbered, each with its tier and source. Not everything found: only what would change the answer if it were different.

*Prevents:* a report whose conclusion is buried under its research.

## 2. Вердикт по компонентам

One table row per bet from §1 of the method:

| # | Компонент | Вердикт | Почему |
|---|---|---|---|
| | in the user's words | ✅ строить / ⚠️ переформулировать / ❌ убрать | The **mechanism**, with the number that carries it |

Then one paragraph per ⚠️ and ❌ giving the mechanism in full. A ⚠️ must say what the reshaped version is, or it is an ❌ avoiding the word.

*Prevents:* a global thumbs-down that the user cannot act on.

## 3. Что вы уже держите и недооцениваете

Everything §2 of the method found in the customer's own data. This is usually the section they quote back, because it is specific to them and cost nothing.

Include the asset that turned out weaker than assumed, measured — not only the pleasant findings.

## 4. Что в идее верно

The parts that survive and carry into the counter-project, stated as claims rather than consolation. A teardown with no such section reads as motivated and gets discounted whole.

## 5. Где критика перегнула

From the honesty audit: where your own analysis proved less than it claimed, used a number two ways, or read an absence as evidence. Plus the strongest honest case *for* the original idea and the observation that would vindicate it.

*Prevents:* the reader finding the weak link before you name it, and discounting everything else.

## 6. Контр-проект

The project you would build instead. Sections, in order:

- **Переформулировка** — the job to be done, in one sentence, and how it differs from the original framing
- **Позиционирование** — who it is for, against whom, and the one thing incumbents structurally will not do
- **Что строим** — the minimum architecture or operating model; components and why each exists
- **Чего не строим** — the explicit cut list, with the reason per item. As load-bearing as the build list
- **GTM** — channels ranked by expected yield with the reasoning per channel, the cold-start plan, and the first concrete move
- **Деньги** — who pays, how much, at what conversion; or the honest statement that there is no revenue path and what the thing is worth anyway
- **Дорожная карта** — phases, each with effort, deliverable, observable acceptance, and a **kill criterion**: the specific observation that stops the project rather than escalating it
- **Рассмотренные альтернативы** — the designs that lost, in a line each, and what was grafted from them

## 7. Самый дешёвый эксперимент

**One person-week or less, no code retained, run before anything is built.** State: what it does, what each outcome means, and — critically — the clean negative that kills the premise.

An experiment with no failing outcome is a formality. Name the number that would end it.

## 8. Первые 30 дней

Concrete actions in order, separating what is worth doing regardless of the decision from what waits on the blocking questions. Give the user something to start on Monday.

## 9. Вопросы, блокирующие старт

Only questions where different answers produce materially different work. For each: the question, why it matters, and **the default you will assume if unanswered** — so silence does not stall the work.

## 10. Где я могу ошибаться

Load-bearing claims still at `[вторичный]` or `[гипотеза]`, what would promote them, numbers that were soft or inconsistent across sources, and the axes that could not be measured with the reason.

*Prevents:* false precision, and the credibility loss when one soft number is found later.

---

Close with **🛑 STOP — жду подтверждения** and the questions from §9 restated in one line.
