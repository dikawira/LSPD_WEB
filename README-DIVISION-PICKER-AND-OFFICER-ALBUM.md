# LSPD Portal — Division Logo Picker & Officer Personal Photo Album

## 1. Officer Registration: Division logo picker
- Replaced the plain Departments & Divisions select control with a visual picker dialog.
- The dialog lists all 18 current department, bureau, office, and division entries.
- Every card displays the existing department emblem, official unit name, hierarchy type (Executive Leadership / Bureau Command / Command Office / Division), a brief unit description, and live registered-personnel count.
- Selecting a card writes the corresponding unit name to the existing `selectDivision` value used by officer registration and the existing shared officers record.
- The currently selected emblem and unit name are shown in the registration form.
- Added a searchable list.
- Normalized the old typo `Administrative Standard Bureau` to `Administrative Services Bureau` when editing legacy officer records; the existing Department Guide lookup still recognizes the old label for compatibility.

## 2. Officer Profile: Personal Photo Album
- Added a Personal Photo Album section to each Officer Profile modal, separate from the primary profile photo.
- Upload supports multiple JPG, PNG, and WEBP files in one selection.
- Album limit: 12 photos per officer.
- Original image file limit: 15 MB; browser compression prepares a smaller image before upload.
- Each photo is stored by the shared authenticated `/api/media/upload` endpoint using purpose `officer-album-photo`.
- Permanent image bytes are saved as a `media-assets` record in the same shared `PortalRecord` database. The officer record stores an `albumPhotos` array of `{ id, url, caption, uploadedAt }`.
- Photos remain available to all authorized portal users until a photo is explicitly removed from the album or its officer record is deleted.
- Opening an album photo opens its original stored image in a new tab.
- Removing an album photo updates the officer record. The API's asset-reference cleanup removes unreferenced media assets after the officer record update is committed.

## 3. Existing integrations retained
- Existing officer data, rank category, department assignment, photo URL, profile photo upload, Department Guide, Rank Structure, Rank Categories, Officer Directory, and Chain of Command remain in the same application.
- The new Division picker writes into the same `division` field.
- The photo album is stored inside the same officer JSON record in `PortalRecord`; no new Prisma model or migration is required.
- All users must access the same deployed Next.js application and shared database. Opening `public/portal.html` with `file:///` does not provide authenticated API access or cross-user synchronization.

## 4. API changes
- `/api/media/upload` now accepts the `officer-album-photo` purpose in addition to existing `officer-photo` and `gallery-photo`.
- `/api/portal-data` asset reference collection now scans `albumPhotos` URLs in addition to primary photos and photo-gallery/video thumbnails, allowing album media cleanup when a photo or officer is deleted.

## 5. Validation performed
- All inline JavaScript blocks passed `node --check`.
- Updated TypeScript API routes passed TypeScript `transpileModule` syntax validation.
- The 18 division selections map to all 18 department logo assets.
- Album modal, file input, grid, and API purpose are present.
- No duplicate HTML IDs were found.
- ZIP integrity checked.
- A live authenticated database upload, cross-user synchronization, and browser interaction test were not performed in this workspace.
