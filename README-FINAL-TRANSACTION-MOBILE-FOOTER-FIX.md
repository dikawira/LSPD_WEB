# LSPD Portal — Transaction Reliability, Mobile Chain of Command, Creator Footer

## 1. Prisma P2028 / closed transaction fix
- The portal-data API used interactive Prisma transactions with the default timeout.
- Officer, photo, fleet, weapon, attendance, and related payload writes can involve several sequential reads/upserts; local database requests shown in the supplied screenshot took around 6–7 seconds.
- Interactive write/delete transactions in `/api/portal-data` now use `maxWait: 10s` and `timeout: 45s`.
- Officer record CRUD transactions in `/api/records` now use `maxWait: 10s` and `timeout: 30s`.
- Officer album upload/delete transactions in `/api/officer-media` now use `maxWait: 10s` and `timeout: 30s`.
- The one-time legacy portal import uses `maxWait: 10s` and `timeout: 60s`.
- `P2028` and serialization conflict `P2034` trigger a single full-operation retry with a newly created transaction client. The expired transaction handle is never reused.
- If the API still receives P2028 after retry, it returns a clear 503 instead of a generic 500.
- This code change addresses the likely cause shown in the provided server log; the actual production database was not available for an end-to-end transaction test.

## 2. Chain of Command mobile layout
- Added explicit CSS hooks to officer cards, officer photos, card content, and tier headers.
- At phone widths, the portrait shrinks to 66x82px (56x72px on very narrow screens), leaving enough width for names, rank, category, multi-division badges, callsign, and profile action.
- Text and badges can wrap within the card; horizontal overflow is prevented.
- The responsive card grid uses one column on phones, two columns on medium screens, and up to three on wide desktop screens.
- Tier headers can wrap long names without colliding with the personnel count or chevron.
- Desktop/tablet photo proportions remain unchanged.

## 3. Footer creator attribution and logo gallery
- Added a footer showcase panel above the existing bottom footer.
- Added the seven uploaded emblem images, converted to optimized transparent WebP assets:
  - Professional Standards Bureau
  - Administrative Services Bureau
  - Patrol Division
  - Investigations Bureau
  - Special Operations Bureau
  - Chief's Office
  - Board of Commissioner
- Logo gallery layout: 7 columns on wide desktop, 4 on tablet, and 2 on phones.
- Added the creator attribution: “Portal designed & developed by BIG J”.
- Existing department footer identity and copyright line are preserved.

## 4. Validation performed
- Seven inline JavaScript blocks pass `node --check`.
- Four changed TypeScript files pass TypeScript `transpileModule` syntax validation.
- No duplicate HTML element IDs found.
- All seven uploaded logo assets exist and are readable as transparent WebP images.
- Static-background fix and the 14 current rank PNG insignia are retained from the source project.
- ZIP integrity checked.
- No live browser/responsive screenshot or authenticated production database test was performed.
