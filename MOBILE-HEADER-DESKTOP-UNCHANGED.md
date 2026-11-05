# Mobile header spacing patch

The desktop header is intentionally unchanged. The existing desktop mega-dropdown navigation remains in place. On viewports below 1024px, hamburger, theme toggle and Discord avatar are one flex group with `gap: 1.5rem`; notification remains separate. On viewports at least 1024px, the group wrapper is `display: contents`, so its children continue participating in the same desktop flex row with the existing desktop spacing.
