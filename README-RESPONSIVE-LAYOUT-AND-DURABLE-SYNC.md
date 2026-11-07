# LSPD Portal — Responsive Layout, Text Wrapping, and Durable Shared Data

## UI corrections
- Officer Directory cells now wrap long names, rank labels, callsigns, division assignments, and certifications instead of clipping text.
- Desktop and tablet keep horizontal scrolling inside the roster/log panel when the full table needs more space; the page itself does not overflow horizontally.
- Phone layouts convert roster and recent registration logs into labelled cards, with single-column fallbacks on narrow screens.
- Dashboard division counts use responsive 3/2/1-column layouts and wrap long unit names.
- Rank Categories cards are text-only. Their embedded images and category icon elements have been removed; rank insignias remain available in rank/profile-specific areas where appropriate.
- Category insignia paths used elsewhere in profiles now point to existing PNG assets (FTO retains its dedicated SVG assignment shield).

## Shared database and no-rollback behavior
- The existing `/api/portal-data` shared `PortalRecord` database remains the canonical source for officers, attendance, announcements, fleet, and weapons.
- A new `LSPD_SYNC_OUTBOX_V1` browser outbox stores pending upserts and deletions before network requests are sent.
- Pending changes are replayed after reload/reconnection. The UI cache continues to show pending local changes while server confirmation is outstanding.
- Deletion markers on the shared database prevent an older browser cache from restoring a deleted record.
- Officer deletion now waits for shared database confirmation before showing a success message. If the request fails, the deletion stays queued locally and is retried rather than being presented as confirmed.
- A cache-only helper is used after dedicated transactional photo endpoints, preventing a stale full-officer snapshot from being unnecessarily written back over newer profile changes.

## Officer photo persistence
- Main officer photo uploads use the shared media asset API and persist image bytes in `PortalRecord` media assets. A main photo is only removed by an explicit remove action followed by saving the officer record.
- Officer album additions and removals use the dedicated `/api/officer-media` route. Each photo addition is committed transactionally with the officer's album metadata and media asset.
- Album deletion removes the selected media asset and writes a durable deletion marker in the same transaction.
- Ordinary officer profile updates preserve the existing main photo and album entries. An explicit album deletion marker wins over stale caches.
- Uploads that succeeded remain stored even if a later file in the same batch fails. The limit remains 12 album photos per officer.
- Uploaded files are stored permanently in the shared database until explicitly removed. A third-party URL pasted into the profile link field is only a reference and can still disappear if its external host removes it; use the file-upload control for permanent storage.

## Validation performed
- All inline JavaScript blocks passed `node --check`.
- Updated API TypeScript files passed TypeScript transpile syntax validation.
- No duplicate HTML element IDs were found.
- CSS braces are balanced.
- Rank Category page contains no image elements in its cards.
- ZIP integrity is checked after packaging.
- No live authenticated browser test or production database test was run in this workspace.
