# LSPD Portal — Photo Gallery & Database Fix

## What changed
- Replaced the video Media Center with an LSPD Photo Gallery.
- Photo upload accepts a public direct image URL (JPG, PNG, or WEBP).
- A live preview appears while entering the image URL.
- The main photo URL is checked before publishing; an optional alternative preview URL is checked too.
- Gallery cards display the submitted image and open the full image when clicked.
- Delete buttons are visible on photo cards. The API still checks the existing Discord management role before deleting.
- Uploaded photos are physically deleted from `PortalRecord`; a shared hidden marker keeps built-in photos hidden after reload.
- Uses the existing `PortalRecord` table. No new Prisma model or migration is needed beyond the existing PortalRecord migration.

## Why the generic database error appeared
The previous API caught every Prisma exception and returned one generic message. A common cause is that the `PortalRecord` migration has not been applied to Supabase. The actual Prisma error was hidden from the browser.

This update:
- Returns a more specific message for missing tables/columns and database connection errors.
- Logs the full Prisma error in the deployment server logs.
- Runs `prisma migrate deploy` before the production build, so pending migrations are applied during deployment.

## Required Vercel environment variables
Confirm these exist in the correct Vercel environment (Production and Preview if used):
- `DATABASE_URL` — pooled PostgreSQL connection string.
- `DIRECT_URL` — direct/session PostgreSQL connection string used by Prisma migrations.
- `AUTH_SECRET` — existing session signing secret.

For Supabase pooler setups, use the transaction pooler for `DATABASE_URL` and the session/direct connection for `DIRECT_URL`. URL-encode special characters in the database password.

## Deploy steps
1. Replace the deployed project with this ZIP.
2. In Vercel → Project → Settings → Environment Variables, confirm `DATABASE_URL` and `DIRECT_URL` are set.
3. Redeploy. The updated build script runs `prisma migrate deploy && prisma generate && next build`.
4. Check deployment logs and confirm the `portal_records` migration completed before the Next.js build.
5. Log in with the Discord account that has the configured Photo Gallery management role to upload/delete photos.

If deployment reports that a table already exists but migration history is missing, do not delete tables. Inspect the Supabase schema and Prisma migration history first; the database may need a safe baseline operation.

## Photo URL requirements
Use a publicly accessible direct image URL. A normal webpage URL, private Discord attachment, or private Drive file will not load as an image. Public Google Drive and Dropbox share links are normalized where possible, but direct image hosting is most reliable.

## Verification
- All inline JavaScript blocks passed `node --check`.
- API route passed TypeScript syntax transpilation.
- ZIP integrity was verified.
- A full Next.js production build and live Supabase write/delete test were not run in this environment.


## Persistent image file uploads (latest update)
- The uploader now accepts a local JPG, PNG, or WEBP file in addition to an external image URL.
- Local files are compressed in the browser and sent to `/api/media/upload`.
- The API stores each file as a `media-assets` PortalRecord in the same shared database and returns a stable `/api/media/<asset-id>` URL.
- Gallery metadata points to that internal URL. Deleting the gallery record removes its associated media asset.
- External links are still supported for legacy compatibility, but an external host can expire or remove them. Re-upload existing images as files to create a permanent database copy.
- The new file-upload path requires the full Next.js app and authenticated API routes; opening `portal.html` from a local `file:///` path cannot access the database.
