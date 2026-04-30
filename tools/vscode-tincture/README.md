# vscode-tincture

VSCode extension stub. Future implementation:

- Hover preview: hovering `var(--ink)` shows a 2-color swatch (light + dark resolved values)
- Autocomplete: typing `var(--` suggests semantic tokens from the registry
- Mood quick-pick: command palette → "Tincture: Apply Mood" → list of moods → apply
- Token impact: right-click → "Show Tincture impact" → inline panel with components + pages

Implementation deferred. The extension manifest exists so cycle 20's npm publish can include it as a sibling package or workspace member.
