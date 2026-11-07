# LSPD Portal — Shared Database Sync, Scroll Lock, and Persistent Photos

## 1. Department Guide modal scroll behavior
- The Department Guide modal now locks the underlying document using a fixed-body scroll lock and restores the exact previous scroll position when closed.
- The unit-detail body is the only scroll container (`overscroll-behavior: contain`, touch scrolling enabled, and stable scrollbar gutter).
- Removed the heavy backdrop blur from this modal and added layout/paint containment to reduce repaint work while scrolling.

## 2. Shared database synchronization
- Officer, attendance, announcement, fleet, and weapon records continue to use the shared `PortalRecord` database through `/api/portal-data`.
- The browser refresh interval is 8 seconds while the portal tab is visible; photo-gallery metadata refreshes every 10 seconds.
- Officer registration waits for the shared database write confirmation before showing a success message.
- Department Guide reads the same officer records used by Officer Directory and Chain of Command.

## 3. Persistent image assets
- The officer form and Photo Gallery now accept direct file uploads (JPG, PNG, WEBP).
- Images are compressed in the browser before upload. Original file size must be at most 15 MB; the compressed image must be at most 1.8 MB.
- The new `/api/media/upload` endpoint verifies image file signatures and stores the compressed file as a `PortalRecord` with kind `media-assets`.
- Each officer or gallery record stores a stable same-origin path such as `/api/media/media_<uuid>`, not a temporary third-party URL.
- `/api/media/[id]` serves the image from the shared database to authenticated portal users.
- Replacing or explicitly removing an officer photo removes its previous asset reference. Deleting an officer/photo record also deletes the associated asset.
- Existing direct external image URLs remain supported for compatibility, but their availability still depends on the original hosting provider. To make an existing URL-based photo persistent, re-upload its original image file through the new file-upload control.
- The solution uses the existing `PortalRecord` table; no Prisma schema migration is required.

## 4. Important deployment requirement
This project must run as the full Next.js application so the `/api/portal-data` and `/api/media/*` endpoints are available.
Do not open `public/portal.html` directly as a `file:///...` page from Downloads. A local file cannot reach the site's authenticated API routes and cannot synchronize with other users.
Deploy the complete project to one shared application URL and configure the same `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` for that deployment. All users must access that same hosted application backed by the same database.

## 5. Validation performed
- All inline JavaScript blocks pass `node --check`.
- Updated TypeScript API routes pass TypeScript transpile syntax validation.
- ZIP integrity checked.
- A live database upload/read/delete test and a production deployment test were not available in this workspace.
