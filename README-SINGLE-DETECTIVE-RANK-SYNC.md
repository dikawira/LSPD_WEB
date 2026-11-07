# LSPD Portal — Single Detective Rank & Cross-Portal Synchronization

## Final formal rank progression
The Rank Structure and Officer Registration use one formal Detective rank only:

1. Cadet / Probationary
2. Police Officer I
3. Police Officer II
4. Police Officer III
5. Sergeant I
6. Sergeant II
7. Detective
8. Lieutenant
9. Captain
10. Commander
11. Deputy Chief
12. Assistant Chief
13. Chief of Police
14. Commissioner

## Detective classification
- Detective is a single formal rank under the Detective Rank Category.
- The previous Detective I, Detective II, and Detective III choices are removed from visible rank lists.
- The Detective rank detail modal contains one description and one responsibilities list.
- Criminal Investigations Division rank requirements show Lieutenant and Detective.

## Chain of Command and connected views
- Chain of Command follows the rank progression from highest to lowest:
  - Executive High Command & Board of Commissioners
  - Command Staff (Commander, Captain, Lieutenant)
  - Detective & Investigative Personnel (Detective)
  - Supervisory Staff (Sergeant II, Sergeant I)
  - Patrol Officers (Police Officer III, II, I)
  - Probationary & Cadets
- Officer Registration, Officer Directory, Officer Profile, Rank Categories, Department Guide, rank filters, personnel pop-ups, and CSV export use the single Detective rank.

## Shared database migration
- Legacy records with rank `Detective I`, `Detective II`, or `Detective III` are normalized to `Detective` after the shared database hydrates.
- Their `rankCategory` is normalized to `Detective`.
- The migrated records are saved through the existing officers sync queue to the shared `PortalRecord` database.
- The migration compatibility mapping is not exposed as a new rank option.
- Existing records already using `Detective` remain as Detective.
- No Prisma schema migration is required because the current officer JSON payload is updated.

## FTO
- FTO remains a separate special assignment category, not a formal rank.
- Eligible Police Officer III personnel can still be assigned FTO when designated as a Field Training Officer.

## Validation
- 14 rank options match 14 visible Rank Structure entries.
- Rank reference keys match the dropdown rank options.
- Detective category contains exactly one rank.
- Chain of Command contains one Detective tier between Command Staff and Supervisory Staff.
- Criminal Investigations Division requirements contain one Detective position.
- Seven inline JavaScript blocks pass `node --check`.
- No duplicate HTML IDs found.
- All 14 formal-rank PNG assets supplied by the user exist, preserve transparency, and are mapped to the corresponding rank.
- ZIP integrity checked.
- A live production database migration and browser interaction test were not run in this workspace.
