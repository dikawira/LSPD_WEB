# LSPD Department Guide — Organizational Hierarchy Layout

Updated `public/portal.html`.

## Layout changes
- Executive Leadership is presented as a three-level chart:
  1. Board of Commissioner
  2. Chief's Office
  3. Office of Operations and Office of Support Services
- Each Bureau is displayed as the parent card at the top of its group.
- The divisions belonging to that Bureau are displayed below it as separate child cards, connected with visual lines.
- Patrol Division is identified as a standalone division because it is not nested under a Bureau in the supplied LSPD structure.
- The same layout is responsive for desktop, tablet, and mobile screens.
- Each card keeps its own emblem, description, assigned-personnel count, and detail action.
- Clicking any card continues to open the existing detail modal with duties, rank requirements, and live assigned personnel.

## Validation
- 18 unit cards retained.
- 18 emblem mappings point to existing image files.
- Inline JavaScript passes `node --check`.
- ZIP integrity checked after packaging.
