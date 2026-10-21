# Session feedback evidence

Observed failures mined on 2026-10-11 from the owner's own messages in Claude Code, pi and Codex sessions (August 2025 to October 2026), with `session-messages` and nine extraction subagents. Each quote is verbatim from the owner's message, checked by script. Counts are distinct messages behind the merged rule. Agent-written subagent prompts were excluded.

Evidence limits: these are corrections the owner made during real work, not matched skill-absent runs. Every instruction below is an unpromoted candidate until a case and a bakeoff support it. Project-only rules such as Geoflow graph rendering stay in those projects. MUI and styled-components rules (the IOW `<Styles>` wrapper, MUI theme overrides, MUI Autocomplete pickers) are retired: the owner's frontends are moving to shadcn/ui and Tailwind.

## Reuse the existing pattern and fix every instance

Instruction: SKILL.md, Consistency. Support: 8 items, 54 messages; projects: IOW, app, geoflow-web, geoflow-webapp, iow_frontend.

- 2025-10-28 iow_frontend: "for the way to structure a form heavily immitate the src/components/form/MeasurementMethodForm.tsx"
- 2025-11-20 iow_frontend: "like same styling, same components used almos a copy paste only update the link and the items that are shown."
- 2026-06-01 iow_frontend: "make sure the app has conventions and recurring elmeents are styled / spaced / fonts the same. for example the headers, the action buttons, etc."
- 2026-07-09 iow_frontend: "consistency is very important for me."
- 2026-05-07 IOW: "most grids have a bold blue underlined text for linked primary ids and then just underlined for other links, but this is also not consistnet for all tables."
- 2026-06-02 geoflow-webapp: "all search bars/ inputs / filters should look like this and be consistent"

## Change only the requested area

Instruction: SKILL.md, opening. Support: 4 items, 22 messages; projects: core-derived-stages, frontend, geoflow-webapp, iow_frontend.

- 2026-09-28 frontend: "don't go too far it's just a few targeted fixes"
- 2026-09-30 frontend: "dont overdo it."
- 2025-10-20 iow_frontend: "holy you do not listen i asked you to log zod errors on validateion. please only do that that should be like 1 line of cod"
- 2025-10-20 iow_frontend: "dont change ANY functionality"
- 2025-10-29 iow_frontend: "sorry continue but only make the user select autocomplete. the role is fine as is"
- 2025-10-28 iow_frontend: "dont solve all issues i know there are a lot of errors now, it does not have to work, just do the abstraction"

## Compare switchable variants for open visual problems

Instruction: references/visual-design.md, Frame the job. Support: 4 items, 25 messages; projects: Retouch, frontend, geoflow-app, geoflow-webapp, iow_frontend, run-dag-view.

- 2026-09-18 geoflow-webapp: "we should prototype some alternative representations for this."
- 2026-09-18 geoflow-webapp: "can we prototype different varients to show the failures nicer?"
- 2026-09-28 run-dag-view: "no lets prototype on the html level. make prototypes in the app."
- 2026-10-03 run-dag-view: "Can you prototype like different implementations where I can just um, walk through so I can have some options?"
- 2026-10-05 Retouch: "we have to prototype different varients. which i can walk through."
- 2026-09-07 geoflow-webapp: "lets prototype. show me a huge variation of possiblilities for every state."

## Keep layout steady through selection and refresh

Instruction: references/visual-design.md, Continuity. Support: 6 items, 24 messages; projects: frontend, geoflow-app, geoflow-webapp, iow_sensor_data_platform, landgebruik_geoflow, waterprotecteu-importer-webapp.

- 2026-06-28 geoflow-webapp: "also why does everythign jump around on select?"
- 2026-09-18 geoflow-webapp: "please fix this inconsistency between tab switching it jumps vertically becuase some have title above and others below. i prefer below."
- 2026-06-15 geoflow-app: "it would also be cool to show live status (by periodic fetching of db state) for runs that are executing real time."
- 2026-06-28 geoflow-webapp: "stop polling if the flow is already in a terminal state"
- 2026-10-01 iow_sensor_data_platform: "there is still a flash its not very smooth."
- 2026-10-01 iow_sensor_data_platform: "i dont like the little 'jump' it makes. can we not animate the text only?"

## Check both themes, and give dark mode its own surfaces

Instruction: references/visual-design.md, Responsive themes. Support: 5 items, 14 messages; projects: core-derived-stages, geoflow, geoflow-core, geoflow-webapp, iow_sensor_data_platform.

- 2026-06-28 geoflow-webapp: "change the lime theme color in the light mode to something with more contrast because now the labels and icons that have the accent color are hard to read."
- 2026-07-06 geoflow-webapp: "the geoflow logo is black and inviible on the dark blue background now."
- 2026-10-01 iow_sensor_data_platform: "the dark mode is way too dark in my opinion."
- 2026-10-01 iow_sensor_data_platform: "I don't know, can you look at the dark mode? It still feels a bit off."
- 2026-06-24 geoflow-core: "now i cant see the logo at all... in light mode. again dark mode its fine..."
- 2026-10-10 core-derived-stages: "And the Geoflow logo is messed up in light mode."

## Cap content width and size controls to their content

Instruction: references/visual-design.md, Establish hierarchy. Support: 4 items, 23 messages; projects: app, geoflow-webapp, iow_frontend.

- 2026-06-01 iow_frontend: "these links are taking full width (which is weird)"
- 2026-06-01 iow_frontend: "Reduce the giant horizontal spread"
- 2026-07-10 app: "This search input is way too wide. It's taking up the full width of the page. Please fix this"
- 2026-07-10 app: "This input is too wid it takes almost the entire width of the page. Please fix it"
- 2026-09-08 geoflow-webapp: "can you add a bit more space between the, like, dotted line and the date? Because now it's, like, directly hitting it."
- 2026-09-08 geoflow-webapp: "The button is right up against the inputs. It should be on its own line. It should be its own div."

## One icon per entity kind

Instruction: SKILL.md, Consistency. Support: 3 items, 11 messages; projects: chezmoi, iow_frontend, iow_sensor_data_platform, redesign.

- 2026-06-02 iow_frontend: "add icon here. and text shouldnt take up full container width."
- 2026-06-02 iow_frontend: "add a location icon"
- 2026-09-08 chezmoi: "Be consistent, use the same icons"
- 2026-10-01 iow_sensor_data_platform: "can you use these icons also for the inputs that set these values?"
- 2026-07-06 redesign: "i prefer icons in buttons"
- 2026-07-09 redesign: "can you add icon ifit is sensor / device standardize same icons used as in other models pages."

## Route every visible string through i18n

Instruction: SKILL.md, Consistency. Support: 5 items, 31 messages; projects: IOW, iow_frontend, iow_sensor_data_platform, waterprotecteu-importer-webapp.

- 2025-11-12 iow_frontend: "for the translations, dont use defaultvalue but always create translation strings in english and dutch"
- 2026-03-02 iow_frontend: "can you check all files and remove the defaultValue in the i18n t functisons. and for each that you remove ensure there is an english and dutch translations."
- 2025-10-20 iow_frontend: "dont use defaultValue thats a hack, actually create the labels in the localisation json"
- 2025-09-30 iow_frontend: "you broke the title and descripiobn now they just say label.monitor"
- 2026-08-08 iow_sensor_data_platform: "ou have to translate it to Dutch though. There is no Dutch translation in the UI. Make sure you use I18n"
- 2026-08-07 iow_frontend: "Dutch must read naturally, not as a literal English translation."

## Render large data realistically and fix measured lag

Instruction: SKILL.md, Completion. Support: 4 items, 25 messages; projects: frontend, geoflow-app, geoflow-webapp.

- 2026-08-10 geoflow-webapp: "We shouldn't have too heavy algorithms and we should really performance optimize everything."
- 2026-09-18 geoflow-webapp: "in the profiler dragging when the timeline is getting long is very laggy plesae fix this."
- 2026-06-15 geoflow-app: "it should be possible to load ALL data too!"
- 2026-08-09 geoflow-webapp: "we should avoid loading entire files immediately because it would make the browser load and they require a secondary like explicit button press from the user to actually start the loading."
- 2026-08-14 geoflow-webapp: "please show some interesting stuff."
- 2026-09-18 geoflow-webapp: "you might have to create some mock data for it to work. lets try a couple different ones. and ones with subflows etc. are quite interesting."

## Keep raw serialized values out of the reading path

Instruction: references/visual-design.md, Operational data. Support: 3 items, 13 messages; projects: geoflow-webapp.

- 2026-06-30 geoflow-webapp: "this is not deserialized properly geoflow core uses special serialization for some things. with markers like $geoflow_type etc."
- 2026-06-30 geoflow-webapp: "unit and property stilln ot legible"
- 2026-08-05 geoflow-webapp: "Is it possible for these Kanban implementation agents to produce visual evidence"
- 2026-08-08 geoflow-webapp: "The evidence should actually be legible to me to see it at a glance. So, formatted in tables"
- 2026-09-08 geoflow-webapp: "Why are there JSON objects just printed like that? That's bad."
- 2026-09-09 geoflow-webapp: "It's all JSON blocks. It's because you need to use the tooling to deserialize this stuff."
## Motion tokens

Instruction: SKILL.md, Consistency. Support: the owner's request on 2026-10-11 ("we need animation/transition tokens") after the 2026-10-10 "What would Emil Kowalski do?" polish of the Geoflow web app (`feat/design-polish`). Every motion defect in that branch was token drift:

- `fb576e0`: group chevrons referenced the removed `--motion-tab-indicator` token and snapped instead of rotating.
- `6849278`: Tailwind's `transition-colors` fell back to its own 150 ms curve, so controls eased unlike the rest of the app.
- `d748873`: `transition-all` also animated focus rings and size changes on buttons and badges.
- `0a054e6`: reduced motion froze popups and the spinner, so loading looked hung.
- `c4dec5c`: a minified `.18s` was read as 0.18 ms, so Catalog rows jumped instead of sliding.

`scripts/token-audit.py` on the merged polish branch still finds `--motion-pane-offset` used in two files and defined nowhere, plus four literal durations in the canvas CSS.

## Motion by frequency

Instruction: references/visual-design.md, Continuity. The owner on 2026-10-11: "Some situations are better off to have fast transitions or almost no transitions." `ba0514e` opens neighbouring tooltips instantly after the first.

- 2026-09-25 geoflow-webapp: "i dont like the open / close transition feels too slow / unresponsive. mainly the close annoys me"
- 2026-07-10 app: "also the transition is super slow to open it and close it it's too slow please fix that"
- 2026-09-16 geoflow-webapp: "I just think a really fast animation could still be nice. Maybe not on closing, but only on showing."
- 2026-09-16 geoflow-webapp: "just initially a bit of time before the pop-up works in the details pane. Because currently that one is instant, and it sometimes is annoying"
- 2026-10-01 iow_sensor_data_platform: "i dont like the little 'jump' it makes. can we not animate the text only?"

## Consistency as a hill climb

Instruction: SKILL.md, Completion, with `scripts/token-audit.py`. The owner on 2026-10-11: "Consistency is everything. Consistency stacks. That is a hill climb too." Calibrated on two shadcn and Tailwind projects: 6 findings on the Geoflow polish branch (all real), 41 on the IOW shadcn worktree (mostly generated shadcn defaults such as `duration-200 ease-linear` and `transition-all`).

- 2026-07-09 iow_frontend: "consistency is very important for me."
- 2026-06-02 geoflow-webapp: "all search bars/ inputs / filters should look like this and be consistent"

Follow-up on 2026-10-11: the audit also counts numeric timing props and `setTimeout` waits in TSX after the polish branch showed hover delays (450 ms and 180 ms, each written twice), a duplicated 2 s "Copied" hold and a loading reveal repeating the pending delay, none visible to the CSS-only patterns. Fixing all findings took `feat/design-polish` from 16 to 0 in three commits (`d5c5ec1`, `5090ab8`, `515aa89`) with unchanged behaviour, checked in the browser.
