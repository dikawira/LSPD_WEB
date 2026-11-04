# LSPD Portal – Cinematic Reference UI

This revision applies the supplied LSPD cinematic reference to the existing portal while preserving the existing modules and API routes.

## UI updates
- Single-row desktop navigation with a unified Media Center dropdown.
- Cinematic Los Santos dusk hero image.
- Media Center video cards and category / playlist / upload actions.
- Five-part dashboard strip with personnel metrics, live Los Santos clock, and operational status.
- Responsive layout for tablet and mobile widths.
- Exact-match one-time copy translation; the recursive translation observer was removed.
- Legacy `Divisionononon...` text fragments are repaired in the rendered UI to prevent horizontal overflow.

## Run locally
1. Copy `.env.example` to `.env` and fill in your own credentials.
2. Install dependencies with `npm install`.
3. Run `npx prisma generate`.
4. Start the development server with `npm run dev`.

Do not share `.env` or production secrets.

## Notes
- Existing API routes, Discord OAuth, Prisma schema, and portal modules are retained.
- The Media Center Upload Video action continues to submit hosted video URLs and metadata through the existing `/api/portal-data` endpoint. It does not upload raw MP4 files directly.
- A full Next.js production build was not run in this environment because dependency installation timed out. Inline browser scripts and CSS syntax were checked independently.
