# LSPD Command Portal – Rockstar-inspired UI update

This update refreshes the existing portal presentation while preserving the existing module IDs, navigation actions, officer workflows, attendance, directory, fleet, weapons, announcements, handbook, and Discord authentication.

## Included
- English interface labels and updated document language metadata.
- Rockstar-inspired horizontal navigation and cinematic Los Santos hero treatment.
- Unified **Media Center** navigation dropdown: All Videos, Video Categories, Playlists, Upload Video.
- Responsive video gallery section on the homepage.
- Existing light/dark theme toggle and Los Santos clock retained.
- Video metadata persistence through the existing `PortalRecord` database model (`kind: videos`).
- Video publishing restricted to the existing High Command announcements role; authenticated officers can view published video metadata.

## Video publishing note
The upload form currently registers a hosted video URL and optional thumbnail URL in the shared database. It does not upload raw video files to Supabase Storage. To support direct MP4 uploads visible to all officers, configure a Supabase Storage bucket and a signed-upload endpoint before enabling file uploads.

## Deployment
1. Merge this project into the existing Vercel project.
2. Keep the existing environment variables and database configuration.
3. Deploy the existing Prisma schema/migrations as already required by the portal.
4. Ensure the Discord role configured as the announcements/High Command access role is assigned to authorized video publishers.

Do not upload `.env` files or secrets to source control.
