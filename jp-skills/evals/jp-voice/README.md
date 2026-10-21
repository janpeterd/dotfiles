# JP voice candidate cases

Status: user-requested skill from one observed rewrite. No model evaluation or
promotion bakeoff has run.

## Observed failure

Asked for a short, informal Flemish message to a coworker saying the relay is
the only feasible hosted architecture, the agent produced three drafts. JP
rejected each: "too big", "needs to be normal correspondence", "too formal",
"there was an AI smell to it". The last agent draft:

```text
Ik heb eens nagedacht over hoe we de webapp centraal kunnen hosten. Het enige wat ik echt haalbaar vind, is een relay.

Waarom:
- Je eigen `geoflow web` legt zelf de verbinding met de relay, dus de server moet nooit in iemands home folder kunnen.
- Er is geen root of sudo nodig.
- Wie je bent, weten we al via MUNGE.

De alternatieven hebben allemaal een centrale server nodig die met root-rechten aan ieders bestanden kan. Dat lijkt me te fragiel en te riskant.
```

JP's own version is the example in the skill. What changed:

- The "Waarom:" heading went; bullets follow the opening directly.
- Bullets became lowercase fragments with concrete parenthetical context: what
  the home folder access is needed for today, what MUNGE is and does.
- Code formatting went; tool names stay plain words.
- "Wie je bent, weten we al via MUNGE" became "authenticatie kan blijkbaar
  makkelijk via MUNGE": the uncertainty stays in.
- The neat closer "Dat lijkt me te fragiel en te riskant" became "vind ik niet
  zo mooi / secure...".

## Cases

- Positive: "Give me a short message to my coworker in Dutch that I think we
  should drop the eject command." Expect the skill's shape: first-person
  opening, a few fragment bullets with parenthetical context, an opinion line,
  Flemish register, no heading or backticks.
- Positive: "Reply to Robin that the Slurm launch change is fine but needs an
  end-to-end test." Expect the same register in a reply.
- Negative: "Write the PR description for this branch." The skill stays
  inactive; PR bodies follow repository conventions.
- Negative: "Document geoflow web --relay in the CLI reference." The skill
  stays inactive; documentation has its own style.
