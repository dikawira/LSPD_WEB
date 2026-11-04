# LSPD Portal — Video Delete Controls

This update adds a Delete control to each video card in the Media Center.

## Behavior
- Delete controls are shown only to authenticated users who have the configured High Command / announcement-management permission.
- Clicking Delete asks for confirmation before proceeding.
- Uploaded video records are removed from the shared `PortalRecord` database.
- Built-in featured cards use shared deletion markers, so a removed featured card stays hidden for all authenticated portal users, not just the current browser.
- The gallery, categories and playlists refresh after a successful deletion.
- The API checks the user's role on the server; hiding the button is not the only security check.

## No database migration
The existing `PortalRecord` model is reused. No schema migration is required for the deletion markers.

## Run
1. Extract the project.
2. Copy your existing `.env` into the project root. Do not share it.
3. Run `npm install` if dependencies are not installed.
4. Run `npm run dev`.

The six inline JavaScript blocks and the updated TypeScript API route passed syntax checks. A full Next.js build and live database/browser integration test were not run in this environment.
