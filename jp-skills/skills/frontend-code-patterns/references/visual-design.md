# Application visual design

Use this reference when creating a screen, substantially changing its layout, or performing visual refinement. Preserve the product's established design system. Make application work clearer rather than borrowing another company's brand.

## Frame the job

Privately name the user, the immediate job, the primary object, and the action or decision the screen must make easy. The first viewport should reveal that object and action without requiring the user to reconstruct them from summaries.

Choose geometry before components. Map importance, comparison, sequence, hierarchy, and state to position, alignment, scale, density, or proximity. Use a table for exact lookup and a visualization only when a relationship becomes materially faster to understand.

Compose the screen as one field, not a stack of interchangeable components. Give each reading moment one focal relationship and a small number of supporting objects. Vary density deliberately while keeping one alignment and spacing grammar.

When the right composition is genuinely open, build switchable variants inside the real application on a throwaway route, let the user compare them, then implement the chosen one.

Default page headers to one title and the actions that genuinely belong at page scope. Add orientation copy only when the title cannot explain an unfamiliar task or a material consequence. Generic subtitles, product breadcrumbs presented as decoration, and eyebrow labels dilute the first read.

## Establish hierarchy

Use typography, spacing, alignment, and density before surfaces, borders, badges, icons, or color. A surface is earned by interaction, selection, warning, contrast, or grouping that spacing cannot express. Lists, filters, summary values, and ordinary page sections default to an open canvas with separators. Do not put a rounded box or background around them merely to make a container visible.

Cap content width on wide screens. Size inputs, selects, and buttons to their content, not to the page width.

Give each gap one owner. Let a parent stack or grid establish spacing for its children. Size gaps by relationship: tight within one control or datum, moderate within a group, and clearly larger between separate tasks. Repair the grouping rather than adding one-off margins.

Repeated peers share type roles, baselines, value positions, internal spacing, and action alignment. Do not force unequal content into equal cards. Give the decisive object more consequence when its importance is genuinely different.

Use sentence case and concrete product language. A heading states the user's object, question, or current condition. A control names the action it performs. Reserve all caps for language conventions such as units, language codes, and standards. Remove labels, captions, icons, and copy that repeat information without helping a new task.

## Operational data

Make urgent or exceptional state findable without turning the entire screen loud. Color reinforces a label, icon, position, or other non-color cue. Keep status meaning exhaustive and consistent through the shared state definition.

Align comparable values and use tabular numerals when scanning numbers matters. Put units, time bases, and qualifiers beside the values they govern. Preserve exact data for lookup without giving every datum equal visual weight.

Do not lead with a stat or KPI strip by default. A summary value belongs only when it changes the user's next decision, and it sits beside the object it qualifies instead of occupying a ceremonial row. Counts that merely restate the visible collection stay subordinate near the collection title.

Keep opaque machine identifiers and raw serialized objects out of the normal reading path. Show an identifier only when users must distinguish, copy, audit, or search by it, and provide an explicit interaction for that job. Render structured values decoded.

Treat remote strings as adversarial layout input. Constrain single-line values through every flex or grid ancestor, truncate at the displayed boundary, and retain access to the complete value. Prefer reordering, stacking, or changing density before shrinking text.

Repeated scanning rows have a stable height. Prefer one-line truncation for the primary label. When the product genuinely needs a two-line label, reserve the same line block for every peer so short and long values do not create uneven rows.

## Continuity

Use morphing or shared-element transitions to show how connected steps in a flow relate. Keep frequently used controls fixed in position and hit area, animating surrounding content while keeping the next action available.

Match motion to frequency. Actions repeated many times a day or started from the keyboard get no animation or the shortest token. Once one tooltip is open, its neighbours open at once. A hover popup waits briefly before its first appearance. Choose durations, easing, and interruptibility with the `emil-design-eng` skill when it is installed.

Selection, tab switches, polling, and background refreshes keep layout and content in place, without jumps, flashes, or skeleton flicker. Shape loading placeholders like the loaded layout.

## Responsive themes

Design desktop and mobile as equivalent compositions, not a wide layout and its compressed remainder. Reorder or stack around the same primary job. Keep controls reachable, values comparable, and rows actionable without horizontal page scrolling.

Light and dark themes preserve the same hierarchy and state meaning. Use the application's semantic tokens so contrast, surfaces, separators, focus, and muted text remain intentional in both themes. Do not invent a page-specific accent palette when established product tokens already express the required meaning.

Check brand marks, favicons, accents, and canvases in both themes. Give dark mode crisp separators where light mode uses elevation, and keep its surfaces off near-black.

## Render and revise

Render real data, including the longest supplied values. Inspect every materially changed live screen at desktop and mobile widths in light and dark themes. Do not substitute evidence from the easiest route for screens changed elsewhere in the same refactor.

Review in this order:

1. **First read:** The primary object, state, and action are obvious in the first viewport.
2. **Composition:** Each section advances the user's job and accidental empty space is absent.
3. **Hierarchy:** Typography, alignment, and density do the work before decoration.
4. **Peers:** Repeated rows and values share exact visual structure.
5. **Restraint:** Every surface, border, badge, icon, color, and sentence earns its presence.
6. **Reflow:** Mobile recomposes without overflow, clipping, or character-level wrapping.
7. **Trust:** Focus, labels, contrast, full remote values, and non-color state cues remain available.

Use a squint test: the dominant action and reading path remain visible without reading the words. Use a text-mask test: blurred text still leaves hierarchy and grouping understandable. Fix the highest-impact systemic defect, render again, and stop when no known material visual or usability defect remains.
