# LSPD Portal — Scroll Performance Optimization

## Changes
- Removed three duplicate embedded copies of the same 1672×941 background PNG (3.17 MB each) from the HTML and replaced them with one optimized `lspd-photo-background.webp` asset.
- Replaced the large referenced hero PNG images with optimized WebP versions, preserving their original source PNG files in the project.
- Changed viewport-fixed page backgrounds to normal scrolling backgrounds to prevent repeated full-screen repaint during scroll.
- Disabled backdrop blur on large glass cards and the sticky header. Their dark surfaces, borders and shadows remain.
- Changed smooth-scroll interpolation to normal scrolling.
- Made database refresh polling visibility-aware and idle-scheduled, and reduced it from every 10 seconds to every 20 seconds.
- Preloaded the shared background image.

## Notes
These changes target the main paint/decode costs identified in the current portal source. Actual frame rate still depends on browser, GPU, device load and network; no software change can guarantee literally zero stutter on every device.


## Department Guide modal refinement
- The detail modal uses a fixed-body scroll lock and restores the user's original page scroll position on close.
- The modal's internal content is the only scrollable area, with overscroll containment for touch, wheel, and trackpad behavior.
- Heavy backdrop blur is disabled on the detail modal; layout/paint containment is applied to reduce scroll repaint work.
