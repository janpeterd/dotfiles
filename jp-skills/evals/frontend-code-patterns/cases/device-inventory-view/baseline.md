# Skill-absent baseline

Run: `runs/20260901T095608Z-device-inventory-view-single-openai-codex-gpt-5.6-sol-1-9d60`

The agent implemented the controls and preserved selector behavior, but stored every page-defining value in local React state. Refreshing, history navigation, and copying the URL lose the inventory view. It also used casts for both select controls.
