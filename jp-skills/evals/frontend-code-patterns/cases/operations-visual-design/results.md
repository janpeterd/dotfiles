# Initial matched visual results

Read this after completing the blinded review in `review.html`.

## Boundary

One trial per arm was run at high thinking on GLM 5.3 Flash through OpenCode Go and GPT-5.6 Sol through OpenAI Codex. Every trial used the same fixture, prompt, production build, viewport sizes, theme requests, and overflow check. One trial per arm is directional evidence, not a stable promotion result.

## GLM 5.3 Flash

All three arms built and produced distinct light and dark screenshots without horizontal overflow.

The candidate produced the most restrained mobile composition and removed all-caps table headings. It used fewer badge surfaces and clearer responsive row grouping than the prior arm. The skill-absent result was also strong and visually more expressive in places.

All three variants retained a prominent `Create run` action even though the prompt framed investigation as the operator's immediate job. None made the failed run sufficiently dominant in the first read. The candidate therefore shows useful influence, but not a complete solution to the job-framing criterion.

## GPT-5.6 Sol

The candidate produced the clearest open layout, removed the large enclosing data surface, and supported distinct light and dark themes. The prior arm highlighted the failed row more strongly but remained more surface-led. The skill-absent arm was polished but rendered byte-identical light and dark screenshots, so it fails the theme criterion despite passing the original file-existence gate.

The identical-theme finding caused the screenshot harness to gain a deterministic light-versus-dark comparison after the runs. No model was retried.

The Sol candidate still used all-caps section and column labels and did not give the failed run enough first-read consequence. These remain observed failures for the next candidate iteration.

## Status

The visual-design reference remains a candidate. The results suggest that it improves restraint, open composition, theme fidelity, and mobile structure, but the single-trial evidence is too small and the primary-job behavior remains incomplete. Do not promote it until blinded human review and a matched multi-model bakeoff with additional trials support promotion.
