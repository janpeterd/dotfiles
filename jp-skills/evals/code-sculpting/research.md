# Code sculpting research

Read on 2026-09-11. This is bounded design-method research for the first candidate skill, not a literature review or evidence of an industry-wide consensus.

## Beck and Cunningham: scenario-driven collaboration

Kent Beck and Ward Cunningham's [A Laboratory for Teaching Object-Oriented Thinking](https://c2.com/doc/oopsla89/paper.html), OOPSLA 1989, describes CRC cards through responsibilities and collaborators. Responsibilities name the problems an object handles, leaving room for different implementations.

Their design process advances from known decisions toward unknown ones. They report two teams reaching essentially the same design in opposite orders. Execution scenarios expose missing responsibilities, which designers assign to an existing object or a new one. An overcrowded card first prompts clearer expression of its responsibilities, then a split if the complexity remains. Designers physically take an object's role while tracing a scenario.

This was a teaching experience report. The authors explicitly had no follow-up studies and did not claim a complete methodology. They also report that a client could not understand finished cards without the discussion that produced them. Read sections 2 through 4, especially the discussion following Figure 2.

## Wirfs-Brock: responsibilities before implementation details

Rebecca Wirfs-Brock's [A Brief Tour of Responsibility-Driven Design](https://www.wirfs-brock.com/PDFs/A_Brief-Tour-of-RDD.pdf), copyright 2006, treats design as iterative. Early commitment to details can close useful options. Her starting designer's story captures purpose, success, known ideas, and what needs discovery. Candidate objects can come from behavior, architecture, performance constraints, mechanisms, or domain concepts. There is no required file-layout-first step.

The tutorial compares centralized, delegated, and dispersed control as a continuum. It discusses where decisions and exception handling belong, including the costs of excessive coordination and forwarding chains. Wirfs-Brock prefers delegation but explicitly says no style is inherently good and recommends fitting control style to the situation. Multiple styles can coexist. Read PDF pages 1, 9 through 12, and 79 through 81, using zero-based page numbering.

This is an experienced designer's object-oriented method and teaching material. It does not establish Python-specific conventions, or prove that every owner should become a class.

## Parnas: hide decisions, not processing stages

David Parnas's [On the Criteria To Be Used in Decomposing Systems into Modules](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html), CACM 1972, compares two decompositions of the same KWIC system. He recommends identifying difficult or changeable design decisions and hiding each behind a module interface. A module is a responsibility assignment, not necessarily a subprogram. A processing sequence alone is a poor guide to these boundaries. Read "What Is Modularization?", "The Criteria", and the conclusion. This university-hosted transcription warns that it is not guaranteed accurate to the original.

Consequence: compare which knowledge each proposed boundary hides and which callers would change when that knowledge changes. File names alone cannot establish this.

## Ousterhout: useful interfaces and revision

John Ousterhout's [Designing Abstractions](https://web.stanford.edu/~ouster/CS349W/lectures/abstraction.html), Stanford 2008 lecture notes, recommends inspecting code and common tasks, making common usage simple, defining useful high-level interfaces before unnecessary intermediate ones, and planning revisions. A small interface should hide substantial implementation work.

His [2021 course introduction](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter21/lecture.php?topic=intro) explicitly combines limited design, implementation, evaluation, and refactoring. Consequence: caller usage is a useful starting sketch; pseudocode agreement cannot validate runtime behavior. These are design teachings, not comparative experimental results. The book excerpt failed to open, so this note does not rely on its "design it twice" chapter.

## Fowler: sketches within evolutionary design

Martin Fowler's [Is Design Dead?](https://martinfowler.com/articles/designDead.html), originally 2000 and revised 2004, argues that testing, continuous integration, and disciplined refactoring enable evolutionary design. In "UML and XP" he supports short collaborative design sessions focused on important details, with sketches treated as provisional. "Patterns and XP" emphasizes paying for a pattern only when its benefit warrants it.

Consequence: established practice already joined deliberate design with inexpensive revision before coding agents. Our pseudocode process should expose important choices and preserve open implementation questions, rather than promise a design that never needs refactoring.

## Synthesis for this candidate

These are adaptations for code sculpting, not instructions quoted from the sources:

- Choose the next sketch from what is understood and what the scenario needs. File layout, state ownership, and function shape can each be a useful entry point.
- Exercise alternatives with the same concrete scenario. Show who knows, decides, and acts so the user can compare behavior through the code.
- Keep the accepted sketch and its reasons together. A final arrangement alone can lose the conversation needed to understand it.
- Use the expert mentor role to explain a recommendation and its tradeoff. Scenario role-play is a separate technique for tracing cooperating parts.
- Treat OO responsibility language as a lens. Translate it into suitable functions, modules, or objects after examining the actual Python design.
- The sources support several compatible starting points, not an industry-wide prescribed order. Use concrete behavior to judge a sketch, difficult decisions to assess boundaries, and caller usage to assess interface burden. Descend wherever understanding is missing.

## Manual trial observation

The first Herdr trial used the initial candidate on gpt-6-astra with medium reasoning, session `01a09168-325e-72e1-9296-93f48797905b`, tab `w3H:t6`. It produced two ownership alternatives, gave a recommendation and tradeoff, and waited for the user. It also included transaction-body detail in the opening round and did not cite established design guidance in its final recommendation. These remain observations for user review, not a passed depth or teaching rubric. The mentor wording and subsequent scenario clarification were added after that response and have not been evaluated.
