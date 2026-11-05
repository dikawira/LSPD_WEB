# LSPD Command Portal — Next.js migration foundation

This is the migration foundation for the existing static LSPD portal. It establishes:
- Next.js App Router
- Prisma ORM + Supabase PostgreSQL
- Discord OAuth2 login
- Server-side guild membership and role verification
- Separate High Command permission for Announcements
- Prisma models for officers/users, announcements, attendance, fleet and weapons

## Discord access policy

- Guild ID: `1559511669892186113`
- Login role: `1559517381422874705`
- Announcements role: `1559517530312278036`

A user must have the login role to enter the portal. The Announcements permission is an additional permission: the user must also have the Announcements role. All checks are server-side and fail closed.

## Local setup

1. Copy `.env.example` to `.env` and fill in credentials.
2. Create a Discord application at https://discord.com/developers/applications.
3. Add the exact redirect URL: `http://localhost:3000/api/auth/discord/callback`.
4. Enable the OAuth2 scopes `identify` and `guilds.members.read` in the authorization flow.
5. Create a Supabase project. Use its pooled connection URL as `DATABASE_URL` and direct connection URL as `DIRECT_URL`.
6. Run:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

## Vercel deployment

Import this repository into Vercel and add all variables from `.env.example` in Project Settings → Environment Variables. Change:
- `DISCORD_REDIRECT_URI` to `https://YOUR-DOMAIN/api/auth/discord/callback`
- `APP_URL` to `https://YOUR-DOMAIN`

Add the same production redirect URI in Discord Developer Portal. Never commit `.env`.

## Feature parity plan

The source portal contains these feature groups, which must be migrated without dropping behavior:
- Dashboard/homepage and analytics
- Chain of Command
- Officer registration/profile and directory
- Officer attendance (clock in/out, timestamps, notes)
- Fleet CRUD
- Weapon inventory CRUD
- High Command announcements CRUD and homepage synchronization
- Handbook external link
- User profile/logout

The main portal screens and workflows now use the shared PostgreSQL `PortalRecord` store through the portal APIs. See the final shared-data architecture below for synchronized collections, permissions, legacy-table import behavior, and remaining production checks.

## Migrating existing browser data

For a manual backup before switching production users, export these localStorage keys from the old portal. The current code also merges local-only records on authenticated startup when the user is allowed to write that collection:
- `LSPD_OFFICERS_DATA_V2`
- `LSPD_CHIEF_ANNOUNCEMENTS_V1`
- `LSPD_OFFICER_ATTENDANCE_V1`
- `LSPD_FLEET_DATA_V1`
- `LSPD_WEAPON_DATA_V1`

Do not overwrite or remove the old static portal until imported records and feature parity have been verified.


## Portal UI reference migration (4 Nov 2026)

- The authenticated `/` route now opens `public/portal.html`, based on the supplied `LSPD_Portal_Local_Login_Registration_Announcement_Sync_Fix(2).html` reference.
- The Discord OAuth entry point is isolated on `/login` (`/api/auth/discord`). The portal itself has no Discord login button or local-account login gate.
- The original portal's browser-side workflows and visual layout are retained inside the reference portal, including Chain of Command, Analytics, Officer Registration, Attendance, Directory/Roster, Fleet, Weapons, High Command Announcements, filters, record detail/edit/delete dialogs, and CSV export.
- The announcement menu/form is hidden unless the Discord session has `canManageAnnouncements`.

### Important data note
The reference HTML portal keeps its original localStorage interface, but its officers, attendance, announcements, fleet, weapons, photos, hidden-photo markers, and legacy media video records are synchronized through the shared PostgreSQL `PortalRecord` table. Browser-local records are merged on authenticated startup when permitted; existing records with matching IDs use the server version. Legacy typed Prisma tables are imported once into `PortalRecord` on the first authenticated API read.

### Authentication
- `/login` is the only place with the Discord login button.
- `DISCORD_ALLOWED_ROLE_IDS` controls who may enter the portal.
- Announcement management is restricted to the exact role ID `1559517530312278036` in `src/lib/auth.ts`.
- Configure the Discord OAuth redirect URI as `https://YOUR_DOMAIN/api/auth/discord/callback` in the Discord Developer Portal.


## Shared database synchronization (4 Nov 2026)

The reference portal now hydrates these shared collections from PostgreSQL before its original UI initializes:
- Officers / roster (`LSPD_OFFICERS_DATA_V2`)
- Officer attendance (`LSPD_OFFICER_ATTENDANCE_V1`)
- High Command announcements (`LSPD_CHIEF_ANNOUNCEMENTS_V1`)
- Fleet (`LSPD_FLEET_DATA_V1`)
- Weapons (`LSPD_WEAPON_DATA_V1`)

Writes from the original forms are sent to `/api/portal-data`; records are stored in the `PortalRecord` table and become visible to other authenticated users. The portal refreshes these collections every 20 seconds. Announcement reads are available to every authenticated portal user; create/update/delete require the exact Discord High Command role `1559517530312278036`. Photo reads require the gallery viewer or manager role; photo/video upload and delete require manager role `1559517530312278036`. Other core portal collections require an authenticated portal session.

### Apply the database migration
Run:
```bash
bun install
bunx prisma generate
bunx prisma migrate deploy
bun run build
```
The `DIRECT_URL` must point to a Supabase connection usable for migrations; `DATABASE_URL` is used by the app at runtime.

### Important
- The shared portal database table stores each legacy portal record as JSON so the existing reference UI can keep its original field names and workflows.
- This avoids silently dropping legacy fields such as officer photos, badge/batch numbers, callsigns, division, attendance action, fleet model/unit, and weapon serial/assignment.
- Demo fallback officers are not automatically seeded into a successfully connected empty database. Only records actually present in a user's local browser or the database are shown.
- The client refresh interval is 20 seconds. A change is queued and sent as soon as the original portal saves it; failed writes remain pending and are retried on the next refresh.
- Concurrent edits to the exact same record are last-write-wins; separate record changes are merged independently.
- When an authenticated browser opens the portal, local-only records are uploaded if that session is allowed to write the collection. For Announcement, only the manager role can migrate old local-only items; viewer accounts still hydrate the shared server copy. For records that exist on multiple devices with different content but the same ID, the server copy wins.


## High Command Announcements access gate

The **Pengumuman** navigation item remains visible to all logged-in personnel. Clicking it opens an access-denied popup unless the authenticated Discord guild member has the exact role ID `1559517530312278036`.

The same role check is enforced server-side on announcement create/update/delete APIs, not just in the browser. Announcement read access is available to every authenticated portal user. The write check uses Discord role IDs captured during OAuth guild-member verification, so users without the role cannot bypass it by calling the API directly.

After changing this code, redeploy the application to Vercel. Users should sign out and sign in again so their session is refreshed with current Discord roles. Ensure the Discord bot/OAuth member lookup still returns the user's current guild roles.


## Final shared-data architecture (5 Nov 2026)

`PortalRecord` is the canonical shared store for the legacy portal collections. The main portal mirrors these collections into browser storage for UI compatibility, but successful writes are sent to the server API and stored centrally:
- `officers` — roster, officer profile fields, divisions, callsigns, certifications
- `attendance` — officer attendance actions and timestamps
- `announcements` — High Command notices
- `fleet` — fleet vehicles and officer assignments
- `weapons` — weapon inventory and officer assignments
- `photos` — shared Photo Gallery records (with `photo-hidden` markers)
- `videos` — legacy Media Center records

The `/api/records` compatibility API now reads and writes the same `PortalRecord` collections; it no longer creates a second copy in the legacy `FleetVehicle`, `Weapon`, `Announcement`, or `Attendance` tables. Analytics and Chain of Command routes also read the shared officer/fleet/weapon/attendance records and refresh while visible. Module pages refresh every 15 seconds. The static portal refreshes its shared collections every 20 seconds, and the Photo Gallery refreshes every 20 seconds without repainting unchanged cards.

Local-only records from a browser are merged into the central store at sign-in/initialization when their IDs are not already present remotely. If a record ID exists both locally and remotely, the server copy wins. This prevents an older browser copy from overwriting a shared record. Concurrent edits to the same record remain last-write-wins; use separate record IDs for separate vehicles, weapons, attendance events, and announcements.

### Roles
- Portal login is fail-closed and controlled by `DISCORD_ALLOWED_ROLE_IDS`.
- Photo viewing is granted to role `1559517381422874705` and the upload manager role.
- Photo/video upload and deletion are granted to role `1559517530312278036`.
- Announcement create/edit/delete is granted to role `1559517530312278036`; authenticated users may read announcements and the notification popup.
- Officer roster, attendance, Fleet, and Weapon API operations are available to authenticated portal users. Add additional server-side role gates before production if these operational edits should be limited to a narrower command role.

The photo and announcement role IDs are enforced in server routes in `src/lib/auth.ts` and `src/app/api/portal-data/route.ts`; hiding a button in the browser is not the only security check.

### Post-deployment checks
1. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, Discord OAuth credentials, guild ID, and `DISCORD_ALLOWED_ROLE_IDS` in Vercel Production and Preview as applicable.
2. Run the build/deploy with the `PortalRecord` migrations applied (`prisma migrate deploy`). The production build script runs migrations before `next build`.
3. Sign in, then open `/api/health`. It should return `ok: true`, `database: "connected"`, and `portalRecordsTable: "available"`.
4. Test one controlled change in each collection from one account and confirm a second logged-in account sees it after refresh/polling. Verify viewer role cannot upload/delete photos/videos and non-High-Command users cannot mutate announcements.
5. Keep `.env` private and never upload it into the project ZIP or Git repository.

A source-level audit cannot verify live Supabase credentials, live Discord role membership, or Vercel production settings. Those require the post-deployment checks above.
