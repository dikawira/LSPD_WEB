# LSPD Portal — Rank Insignias Replaced With User-Supplied PNGs

## Source image mapping

Each image is mapped to its corresponding formal rank using the uploaded filename:

| Formal rank | Uploaded image | Website asset |
|---|---|---|
| Commissioner | `Commissioner.png` | `commissioner.png` |
| Chief of Police | `Chief of Police.png` | `chief-of-police.png` |
| Assistant Chief | `Assistant Chief.png` | `assistant-chief.png` |
| Deputy Chief | `Deputy Chief.png` | `deputy-chief.png` |
| Commander | `Commander.png` | `commander.png` |
| Captain | `Captain.png` | `captain.png` |
| Lieutenant | `Lieutenant.png` | `lieutenant.png` |
| Detective | `Detective.png` | `detective.png` |
| Sergeant II | `Sergeant II.png` | `sergeant-ii.png` |
| Sergeant I | `Sergeant I.png` | `sergeant-i.png` |
| Police Officer III | `Police Officer III.png` | `police-officer-iii.png` |
| Police Officer II | `Police Officer II.png` | `police-officer-ii.png` |
| Police Officer I | `Police Officer I.png` | `police-officer-i.png` |
| Cadet / Probationary | `Cadet  Probationary.png` | `cadet-probationary.png` |

## Implementation

- The `LSPD_RANK_INSIGNIA` map now resolves each rank slug to its `.png` asset.
- The original transparent PNG images were resized only when needed to a maximum 1200-pixel long edge, retaining transparent backgrounds and visual proportions.
- The previous formal-rank SVG graphics were removed from `public/rank-insignia/` to avoid using outdated insignias.
- The FTO SVG remains because FTO is a special assignment, not a formal rank.
- The new PNG rank insignias are used in Rank Structure, rank-reference pop-ups, Officer Registration preview, Officer Profile, Officer Directory, Chain of Command, and rank-category detail chips.
- Image containers use `object-fit: contain` so horizontal star strips and vertical chevron/shield insignias keep their proportions.

## Validation

- 14 rank PNG assets are present, one per formal rank.
- All 14 assets retain an alpha channel with transparent pixels.
- Every `LSPD_RANK_REFERENCE` slug maps to an existing PNG.
- No formal rank points to the old SVG files.
- Seven inline JavaScript blocks pass `node --check`.
- No duplicate HTML IDs found.
- ZIP integrity checked.
- Live browser rendering and deployed CDN/cache validation were not performed in this workspace.
