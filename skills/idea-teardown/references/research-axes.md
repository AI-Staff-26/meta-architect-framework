# Research Axes and Demand Instruments

Pick the row that matches the idea and run **one agent per axis that could independently kill it**.

**The type gives a starting hand, not the enumeration.** Every axis here is a mechanism of death, and a mechanism does not respect the row it is filed under — the row selects the *instrument*, not the membership. `Platform risk` reads as a SaaS concern until an agency turns out to live on one page builder and one lead channel.

So the selection rule runs both ways:

- **Drop** axes from your own row that cannot kill this particular idea, rather than running them for completeness.
- **Borrow** axes from any other row that can — provided you can name the instrument that would measure it *here*. That test is the whole counterweight: it admits the axis that is load-bearing and refuses the one added for symmetry. An axis you want but cannot measure is a stated gap in §10 of the report, not an agent.

**The cross-check.** Having picked your row, read the others once and ask of each axis: *does this have a translation into my idea, and could that translation kill it?* Carry over what passes. The report names the borrowed axes and the row each came from, or says that none translated.

**When borrowing stops being optional.** An idea that is non-standard *for its type* blinds its own row: a positioning nobody local runs returns an empty `Local competitors`; a format with no precedent leaves `Catchment` unmeasurable. The native axes go dark exactly where the idea is most interesting, and the borrowed ones carry the verdict. A novel form inside a familiar type is the signal to work the other rows hard.

**Completion criterion:** every axis you run names the instrument that measures it, and the rows you did not draw from were read and rejected rather than never opened.

## Applies to every type

Whatever the idea is, someone has built the nearest version of it, and someone has built the same *shape* in an adjacent domain. Both are measurable, and both price the category better than any estimate built from first principles.

| Axis | The question that kills it |
|---|---|
| **Closest shipped analogue** | Someone built the nearest version — the studio in another city running this exact positioning, the tool one ecosystem over. What are its real numbers: usage, price, load, how long it has lasted? |
| **Prior art by analogy** | The same product or business *shape* in an adjacent domain — what made the winners win, and what is the survival rate of everyone who tried it? |

`SKILL.md` §3 imposes the first as a discipline on every brief; it is an axis of its own when the analogue is close enough to measure directly.

## Axes by idea type

### Technology, platform, developer tool, SaaS

| Axis | The question that kills it |
|---|---|
| **Incumbents** | Who already serves this job, at what price, and what do they deliberately refuse to do? A refusal by a better-resourced player is a considered negative judgement — read it before treating the gap as an opening |
| **Demand** | Do the people who would use it ask for it anywhere, in their own words, unprompted? |
| **Platform risk** | If it sits on someone's runtime, API or store: how cheaply can the vendor absorb it, and is it on their roadmap or in their repo already? |
| **Trust and abuse** | What can a hostile publisher or user do through it, and who is liable? |
| **Economics** | Who pays, how much, and does anyone in this category charge at all? |

### Service business in a region — studio, agency, contractor

| Axis | The question that kills it |
|---|---|
| **Local competitors** | How many, at what price, how busy, and how long have they lasted? |
| **Demand channels** | Where do clients actually come from here — search, marketplaces, referral, tenders — and what does a lead cost in each? |
| **Unit economics** | Price per project, delivery hours, acquisition cost, realistic utilisation. The margin, not the revenue |
| **Supply capacity** | Who delivers, at what quality, and what happens during holidays, illness and the second simultaneous client? |
| **Switching cost** | Why would a client leave the contractor they already have? Inertia is the real competitor |
| **Regulatory and tax** | Registration form, taxation, licences, contracts, payment routes |
| **Seasonality and concentration** | The annual curve, and what share of revenue sits with the largest client |

### Local offline business — point of sale, workshop, studio

| Axis | The question that kills it |
|---|---|
| **Catchment** | Who lives or passes within realistic reach, how many, and how often would they buy? |
| **Competitor density** | How many within the catchment, their price band, their review velocity — and what has closed there recently |
| **Location economics** | Rent, fit-out, equipment, payback period at a defensible traffic and conversion estimate |
| **Staffing** | Who works the hours, at what wage, and how replaceable |
| **Permits and compliance** | Licences, inspections, fire, sanitary, signage |
| **Seasonality** | The annual curve and whether the low season is survivable on the reserve |

### Internal tool

| Axis | The question that kills it |
|---|---|
| **Does the stack already do it** | Read the config and the CLI of what is already installed before designing a replacement |
| **Cost of the status quo** | Frequency × people × minutes. If the workaround costs less than the tool, stop |
| **Who is the user** | A tool for "the team" with no named first user does not get adopted |
| **Adoption mechanism** | What causes someone to use it on a normal working day, rather than intending to |

### Evaluating an existing project

| Axis | The question that kills it |
|---|---|
| **Actual vs assumed metrics** | Pull the real numbers. Most assumed metrics turn out to be unmeasured |
| **Retention and repeat** | Does anyone come back? One-time usage with high acquisition is a treadmill |
| **The counterfactual** | What would have happened without it? Attribution is where projects flatter themselves |
| **Concentration** | Share of value from the top customer, the top feature, the one person who knows it |
| **Cost to keep** | The recurring hours and money it takes just to stand still, and who is paying them |

---

## Demand instruments by scale

Reach for instruments that count **buyers**, not sellers.

| Scale | Instruments that measure demand | Instruments that lie |
|---|---|---|
| **Global / open source / dev tool** | Package downloads over time (npm, PyPI, crates), reactions on feature requests, issue and thread volume with dates, registry install counts, forum thread views, job postings naming the tool, whether competitors charge | Stars, followers, funding raised, "indexed items", press coverage |
| **Country / online service** | Keyword search volume and its trend, cost per click in the ad auction, listing and response counts on the marketplaces this niche uses, competitor price pages, review velocity on competitor profiles, hiring ads for the role | Population size, "market volume" reports, competitor headcount |
| **Region / city** | Local search volume, competitor density and review dates on maps, waiting times when you call as a customer, marketplace lead prices in that city, recent closures | Total city population, generic industry growth rates |
| **Local offline** | Foot traffic at hours you actually observe, competitor review velocity, rent per square metre as a proxy for commercial value, seasonal booking patterns | Anything derived from national statistics |
| **Internal** | Frequency × people × minutes of the current workaround, support tickets, the number of times it has been asked for | "It would be nice if" |

**The strongest demand instrument is money already moving.** Someone paying today for a worse version outranks every proxy above.

---

## Reading the results

- **Unprompted beats prompted.** A request nobody solicited outranks any survey answer.
- **Derivative beats level.** A small number growing is a different conclusion from the same number flat. Where you can get a time series, get one.
- **Absence of complaint is not absence of pain** when the degradation is invisible to the user. Check whether they could have noticed before reading silence as satisfaction.
- **Absence of signal is evidence of absence** only at a sample size where the signal would have shown. Say which case you are in.
- **Record what you could not measure.** Some sources block automated access; some numbers do not exist. An unmeasurable axis is a stated gap, not a silent pass.
