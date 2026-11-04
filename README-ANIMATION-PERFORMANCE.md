# LSPD Portal — Animation Performance Update

This update optimizes the existing menu transitions to reduce visual jank on slower devices.

## Performance changes
- Removed blur filters and scale effects from full page panels.
- Main menu transitions now use short opacity + translate3d animations.
- Exit duration reduced to 105ms; entrance duration reduced to 220ms.
- Removed permanent `will-change` hints so the browser does not keep large layers promoted after transitions.
- Removed staggered animation delays from the Media Center cards.
- Reduced nav/modal/media animation durations.
- Replaced smooth scrolling during a menu change with an immediate scroll-to-top, avoiding overlapping animations.
- Uses `requestAnimationFrame` instead of forcing synchronous layout with `offsetWidth`.
- Handles rapid repeated menu clicks and clicking the currently exiting menu.
- Respects `prefers-reduced-motion`.

## Preserved
- Existing menu navigation and active-state styling.
- Splash screen gate and English `ENTER LSPD PORTAL` button.
- Wallpaper and typography.
- Media Center upload/delete functionality.
- Existing API and database structure.

## Run
1. Extract this project.
2. Copy the existing `.env` file into the project root. Do not share it.
3. Run `npm install` if dependencies are not installed.
4. Run `npm run dev`.

All six inline JavaScript blocks passed `node --check`. This environment did not run a full Next.js build or browser frame-rate test.
