# Static Viewport Wallpaper Fix

- Moved the page wallpaper off the document-height-sized `body` background.
- `body::before` now paints the wallpaper as one fixed viewport layer.
- The layer uses `position: fixed; inset: 0` and a stable `cover` size based on the viewport.
- Body background images are disabled so earlier `background-size: cover` rules cannot recalculate against the growing/collapsing document.
- Chain of Command accordions can expand and collapse without changing the wallpaper scale or position.
- No JavaScript or database behavior was changed.

Validation: inline JavaScript syntax, duplicate HTML IDs, fixed-layer CSS declarations, and ZIP integrity were checked. A live browser visual interaction test was not available.
