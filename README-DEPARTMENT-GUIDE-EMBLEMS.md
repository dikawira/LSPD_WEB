# LSPD Department Guide — Unit Emblems

## What changed
- Added 18 matching LSPD unit emblems supplied for this update.
- Each emblem is mapped to its matching office, bureau, or division.
- Emblems appear on each Department Guide unit card.
- The matching emblem also appears in the header of that unit's detail pop-up.
- Images are transparent WebP assets, resized to a maximum 1000 px edge and optimized for web delivery.
- Emblems use lazy loading on cards and async decoding to reduce initial page work.
- Existing text descriptions, rank requirements, officer assignments, data synchronization, and menu placement are unchanged.

## Asset location
`public/department-logos/`

## Mapping
Board of Commissioner → board-of-commissioner.webp
Chief's Office → chiefs-office.webp
Office of Operations → office-of-operations.webp
Office of Support Services → office-of-support-services.webp
Special Operations Bureau → special-operations-bureau.webp
Air Support Division → air-support-division.webp
SWAT Division → swat-division.webp
Speed Hunter Division → speed-hunter-division.webp
Patrol Division → patrol-division.webp
Investigations Bureau → investigations-bureau.webp
Criminal Investigations Division → criminal-investigations-division.webp
Gang & Narcotics Division → gang-narcotics-division.webp
Administrative Services Bureau → administrative-services-bureau.webp
Firearms Licensing Division → firearms-licensing-division.webp
Media & Relations Division → media-relations-division.webp
Professional Standards Bureau → professional-standards-bureau.webp
Human Resource & Training Division → human-resource-training-division.webp
Internal Affairs Division → internal-affairs-division.webp

## Validation
- 18 unit cards detected.
- 18 emblem paths verified to exist and support alpha transparency.
- All 7 inline JavaScript blocks passed `node --check`.
- ZIP archive integrity will be checked after packaging.
