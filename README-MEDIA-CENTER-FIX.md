# LSPD Portal — Media Center Reliability Update

This update improves the Media Center upload, thumbnail, gallery, filtering, playlist, and delete flows.

## Thumbnail behavior
- Typing a direct public image URL into Thumbnail Image URL immediately displays a live preview in the upload form.
- The preview uses the same URL that will be stored on the video record and rendered in the gallery.
- YouTube video URLs automatically generate a YouTube thumbnail preview when no custom thumbnail is supplied.
- Public Google Drive share links and Dropbox share links are normalized to direct-view links where possible.
- The form checks that the image actually loads before publishing. If the link is a webpage instead of an image, the form shows an error and prevents publishing.
- Use a public, direct JPG, PNG, or WEBP image URL. A private or login-protected image cannot be previewed.

## Upload behavior
- Validates the title, category, video URL, and optional thumbnail URL.
- Saves the video to the shared `PortalRecord` database.
- Reloads the complete video list after the database confirms a successful save.
- Displays every database-backed video; the former eight-video display cap has been removed.

## Delete behavior
- Delete controls are shown only to authenticated users with the existing Media Center / announcement management role.
- The UI asks for confirmation and waits for a successful server response before removing the card.
- Uploaded video records are physically deleted from `PortalRecord` in the database.
- Built-in featured cards are stored in the HTML template, so their removal is persisted with a shared database marker. They stay hidden for all portal users after reload.
- The API returns the actual count of stored video rows deleted.
- Categories, playlists, and the full gallery refresh after a deletion.

## Database
- Reuses the existing `PortalRecord` table.
- No Prisma schema change or database migration is required.
- Existing video rows are not overwritten by this UI update.

## Run locally
1. Extract the ZIP.
2. Copy your current `.env` into the project root. Do not share it.
3. Install dependencies if needed with `npm install`.
4. Run `npm run dev`.
5. Sign in using an account that has the configured Media Center management role to upload or delete videos.

## Verification
- All inline JavaScript blocks passed `node --check`.
- The updated API route passed TypeScript syntax transpilation.
- ZIP archive integrity was verified.
- A full Next.js build and live Supabase/browser integration test were not run in this environment.
