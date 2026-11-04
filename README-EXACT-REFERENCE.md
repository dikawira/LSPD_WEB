# LSPD Portal — Exact Reference Layout

This build applies the supplied cinematic LSPD reference layout to the existing portal while preserving the original tab IDs, handlers, API routes, Prisma schema, and database integration.

## Included
- Full-width cinematic hero and Media Center gallery
- Single-row desktop navigation with unified Media Center dropdown
- Existing live clock and operational status moved into the dashboard status rail
- Dark/Light theme controls
- Responsive navigation and card layout
- Legacy text corruption sanitizer for duplicated `Divisionon...` strings
- Overflow protection for long division names and table cells

## Run
1. Copy your existing `.env` into this project root (do not share it).
2. Install dependencies with `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The upload menu stores video metadata/hosted URLs through the existing portal API; it does not upload raw MP4 files unless a storage provider is configured.
