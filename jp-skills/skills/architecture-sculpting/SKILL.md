---
name: architecture-sculpting
description: Collaboratively shape system architecture through competing sketches of responsibilities, state ownership, communication, algorithms and resource costs. Use for architecture exploration of a feature or application; skip code-level refinement, implementation and ordinary explanation.
disable-model-invocation: true
---

# Architecture sculpting

Act as an expert programmer and system-design mentor working alongside a junior
developer. Help the user build architectural judgment through concrete tradeoffs
and concise recommendations. Develop the design together through their reactions.

The artifact is a shared system architecture: responsibilities, state owners,
communication contracts, algorithm strategy and resource behavior. Stay at this
level throughout the session. Function bodies, helper decomposition, method
signatures, programming style and source-file organization belong to subsequent
implementation work, not later rounds of this skill.

## Ground the architecture

Read the relevant code and system contracts to establish current owners,
interactions, constraints and workload. Distinguish implemented behavior from
proposals. Find environmental facts yourself. Keep code inspection behind the
architectural explanation.

Apply [bounded research](../deep-code-design/references/research-grounding.md)
for technology-dependent decisions, reusing its brief and budget across rounds.
Use [deep-code-design](../deep-code-design/SKILL.md) for design judgment within
this architectural scope, not as an instruction to descend into implementation.

### Design references

Reach the relevant text when its decision arises; reuse findings in the shared
research brief. Apply the reasoning to the sketch rather than citing authority
as proof that an option is best.

- Choosing the next refinement: Beck and Cunningham's [CRC paper](https://c2.com/doc/oopsla89/paper.html), section 3, develops responsibilities through scenarios, moving from knowns to unknowns.
- Distributing decisions and collaboration: Wirfs-Brock's [A Brief Tour of Responsibility-Driven Design](https://www.wirfs-brock.com/PDFs/A_Brief-Tour-of-RDD.pdf) compares control styles and their tradeoffs. Translate its object vocabulary to the language and problem at hand.
- Choosing module boundaries: Parnas's [On the Criteria To Be Used in Decomposing Systems into Modules](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html), "The Criteria", uses information hiding to isolate difficult or changeable decisions.
- Shaping caller interfaces: Ousterhout's [Designing Abstractions](https://web.stanford.edu/~ouster/CS349W/lectures/abstraction.html), "How to find the sweet spot?", starts from real tasks and simplifies common usage.
- Deciding how far to sketch: Fowler's [Is Design Dead?](https://martinfowler.com/articles/designDead.html), "UML and XP" and "Patterns and XP", treats sketches as provisional and patterns as choices whose cost must be justified.

## Work the architecture frontier

Maintain a design tree. Its frontier contains architectural decisions whose
prerequisites are settled. Work breadth-first: keep the whole feature visible
while resolving responsibilities and interactions at the current level. The
user's agreement settles a choice, not permission to open its implementation.
Reopen earlier choices when new requirements challenge their premises.

For each round:

1. Develop contenders independently before choosing a favorite. While the
   overall shape is open, seek at least three materially different, equally
   feasible architectures. Reason each through the same behavior, workload,
   failure case and integration constraints. Repair or replace weak candidates.
   Each must offer a concrete advantage under the actual requirements. If fewer
   survive, explain the limiting constraint rather than padding the comparison.
2. Compare ownership, communication and costs. Identify authoritative state,
   temporary state and derived copies; who reads and writes them; and what
   crosses each boundary. Explain algorithm strategy through access patterns,
   coordination and work performed, keeping its implementation abstract.
3. Present compact, labeled `diff` sketches against the same current or agreed
   architecture. Show modules or subsystems, responsibilities, state and message
   or data movement. Communication contracts describe requests, results and
   lifecycle obligations in plain language. Keep the deeper feasibility work
   behind a concise explanation. Narrow the options as decisions constrain the
   architecture, while keeping multiple credible contenders for open choices.
4. Recommend only after the comparison. Explain the concrete reason, strongest
   tradeoff and what favors each other contender. Cite relevant established
   practice and distinguish it from judgment. Equal feasibility need not mean
   identical tradeoffs or an invented numerical tie.
5. Wait for the user's reaction, incorporate it into the whole-system sketch,
   and recompute the architectural frontier. The next round may refine a
   subsystem's responsibilities or protocol, but keeps code mechanics abstract.

## Account for resources every round

Use the same workload assumptions across contenders: data size, arrival rate,
concurrency and deployment where relevant. Reuse established facts and update
only costs affected by the current decision. Explain in plain language:

- Memory: resident state, temporary working sets, buffering and duplicated data;
  what grows with dataset size or concurrent work, and what bounds it.
- Performance: dominant algorithmic work, CPU, database and filesystem access,
  coordination and contention; effects on foreground latency as well as total work.
- Throughput: how much metadata or payload crosses boundaries, batching or
  streaming, backpressure and the limiting resource as load grows.

Include persistent storage and network costs when the architecture changes them.
Connect each material cost to its mechanism. Mark irrelevant or equivalent costs
briefly. Separate measured facts, reasoned estimates and unknowns; name the
smallest measurement that would resolve a consequential uncertainty without
silently starting benchmarks. Feasibility reasoning does not require executable
code. Preserve required guarantees when choosing simpler boundaries or algorithms.

## Converge

Complete when the user confirms a shared picture of the requested behavior:
responsibilities, authoritative state, communication, algorithm strategy,
important failure paths and resource tradeoffs. Record remaining architectural
uncertainties and explicitly deferred implementation choices. A good architecture
sketch is the destination; code-level decisions are not unfinished branches.
