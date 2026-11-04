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

The schema is prepared for the main data groups. The current starter is **not yet a complete feature-parity migration**: the remaining work is to port each screen, validation, search/filter, edit/delete behavior, and old localStorage data into the database.

## Migrating existing browser data

Before switching production users, export these localStorage keys from the old portal:
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
This compatibility pass preserves the supplied HTML portal's existing browser-side data behavior (localStorage). It does not yet convert every one of those legacy browser records into Supabase-backed records. Existing Prisma API/module work remains in the project, but the reference portal's legacy actions are not yet wired one-by-one to those APIs. Do not treat this as a verified production data migration.

### Authentication
- `/login` is the only place with the Discord login button.
- `DISCORD_ALLOWED_ROLE_IDS` controls who may enter the portal.
- `DISCORD_ANNOUNCEMENT_ROLE_IDS` controls High Command announcement management.
- Configure the Discord OAuth redirect URI as `https://YOUR_DOMAIN/api/auth/discord/callback` in the Discord Developer Portal.
