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
- Removed Detective I, Detective II, and Detective III from the visible Rank Structure, rank selector, category rank list, and Chain of Command.
- The Detective rank detail modal retains one description and one responsibilities list.
- Criminal Investigations Division's rank requirements now show Lieutenant and Detective.

## Chain of Command and other views
- Chain of Command order now follows the formal progression from highest to lowest:
  - Executive High Command & Board of Commissioners
  - Command Staff (Commander, Captain, Lieutenant)
  - Detective & Investigative Personnel (Detective)
  - Supervisory Staff (Sergeant II, Sergeant I)
  - Patrol Officers (Police Officer III, II, I)
  - Probationary & Cadets
- Officer Directory and rank filters use the single Detective value.
- Officer Profile and rank detail views show Detective as one rank/category.
- Department Guide and Criminal Investigations Division roster requirements use one Detective position.
- CSV export continues to use the current officer rank value.

## Shared database migration
- Legacy officer records with rank `Detective I`, `Detective II`, or `Detective III` are normalized to `Detective` after the shared database hydrates.
- The rank category is normalized to `Detective` at the same time.
- The migration is persisted through the existing `LSPD_OFFICERS_DATA_V2` local-storage sync queue to the shared `PortalRecord` database.
- The compatibility mapping exists only to migrate old saved values; these former labels are not available as new rank choices.
- Existing single Detective records remain unchanged except for ensuring the category is `Detective`.
- No Prisma migration is required because the same JSON officer record is updated.

## FTO
- Field Training Officer remains a special assignment category, not a formal rank.
- Eligible Police Officer III personnel may still be assigned the FTO category as before.

## Validation
- 14 rank options match 14 visible Rank Structure entries.
- Rank reference keys match the dropdown rank options.
- Detective category contains one rank only.
- Chain of Command contains one Detective tier between Command Staff and Supervisory Staff.
- Criminal Investigations Division requirements contain one Detective position.
- 7 inline JavaScript blocks passed `node --check`.
- No duplicate HTML IDs found.
- SVG assets referenced by every formal rank exist and parse successfully.
- ZIP integrity checked.
- A live database migration test and browser interaction test were not available in this workspace.
