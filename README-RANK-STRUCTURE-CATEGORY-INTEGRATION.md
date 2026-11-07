# LSPD Rank Structure & Rank Category Integration

## Rank Structure
- The Rank Structure page is now a single vertical hierarchy list of 14 ranks/assignments.
- Every row uses a custom LSPD rank insignia image and is clickable.
- Clicking a rank opens a detail modal with its meaning, responsibilities, category, and officers registered under that rank.
- FTO is shown as a special assignment rather than a separate formal rank.
- Detective is retained as the investigative rank/assignment used by the existing LSPD roster.

## Rank Categories
- All 7 category cards are clickable: High Command, Command, Supervisor, FTO, Detective, Officer, and Cadet.
- Each category modal shows its purpose, responsibilities, related ranks/assignments, and registered personnel.

## Officer Registration & Directory
- Added a required Rank Category field to Officer Registration.
- Rank selection suggests the default category:
  - Commissioner, Chief of Police, Assistant Chief, Deputy Chief, Commander → High Command
  - Captain, Lieutenant → Command
  - Sergeant → Supervisor
  - Detective → Detective
  - Police Officer III, II, I → Officer
  - Cadet / Probationary → Cadet
- Police Officer III can be assigned to FTO when the member is designated as a Field Training Officer.
- The selected rank category is stored in the officer record as `rankCategory` and uses the existing PortalRecord shared database sync.
- Existing officer records with no `rankCategory` continue to display through an inferred category based on rank and existing FTO certification.
- Added category visibility to Officer Profile, Officer Directory, recent registration log, Chain of Command, and Department Guide personnel cards.
- Added a Rank Category filter to Officer Directory.

## Rank insignia assets
- 14 transparent PNG insignias supplied by the user are included in `public/rank-insignia/`; FTO retains its separate SVG assignment badge.
- Commissioner uses a five-star insignia; Chief of Police four stars; Assistant Chief three; Deputy Chief two; Commander an eagle mark; Captain a leaf; Lieutenant bars; Detective a magnifier; Sergeant chevrons; Officer III/II/I graduated stripes; Cadet a chevron; and FTO a dedicated FTO shield.
- These are original LSPD roleplay rank graphics, not official insignia issued by a real U.S. police agency.

## Validation
- 7 inline JavaScript blocks passed `node --check`.
- 14 rank rows, 7 category cards, 14 PNG rank insignias plus the FTO assignment badge, and no duplicate HTML IDs.
- Officer Directory and recent-registration table column counts match their rendered row cells.
- No Prisma migration is required: `rankCategory` is an additional property in the existing PortalRecord JSON payload.
- A live production database and browser interaction test were not run in this workspace.
