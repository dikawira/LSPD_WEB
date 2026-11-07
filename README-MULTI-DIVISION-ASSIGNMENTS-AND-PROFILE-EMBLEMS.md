# LSPD Portal — Multi Department / Division Assignments

## What changed

### Officer Registration
- The single-selection Department & Division picker is now a multi-select visual gallery.
- All 18 current LSPD unit logos and labels are available.
- Selecting a card toggles it on/off; the dialog remains open so an officer can select more than one unit.
- A search field filters the unit cards.
- Apply Selection commits the choices; Cancel closes without applying draft changes.
- The registration form shows the selected unit logos and names before saving.
- At least one unit must be selected.

### Shared officer data model and backward compatibility
- New records save both:
  - `divisions: string[]` — all department/division assignments.
  - `division: string` — first selected assignment, retained as the legacy primary unit for older features and existing data.
- Existing officer records that only have `division: string` continue to work; the portal reads them as a one-item `divisions` list.
- Editing an older record converts its single field into the new multi-select state; saving writes both fields.
- No Prisma schema migration is required because officer payloads remain JSON records in the existing PortalRecord table.

### Officer Profile
- All assigned units display as emblem cards near the rank insignia in the profile header.
- The Department & Divisions profile data section also displays the logo/name chips.
- The primary portrait and Personal Photo Album remain separate.

### Connected unit views
- Chain of Command shows all assigned unit logos and labels for each officer.
- Officer Directory and Recent Registrations show all assigned unit chips.
- Directory Division filter matches any assigned division.
- Department Guide unit counts/personnel lists include officers assigned to that unit, even when it is not their primary assignment.
- Division Personnel modal and unit counts include multi-assigned officers.
- Rank detail personnel and profile detail views show all assigned units.
- CSV export includes all assignments separated by semicolons.
- Fleet/weapon/attendance integrations that historically use a single division continue using the `division` primary value for compatibility.

## Validation
- 7 inline JavaScript blocks passed `node --check`.
- No duplicate HTML element IDs found.
- All 18 division choices map to the 18 existing department logo assets.
- Officer create and update payloads both include `divisions` and legacy `division`.
- Static source checks confirm that unit-member counts and unit filtering use the multi-division helper.
- ZIP integrity was checked.
- Browser interaction and live shared-database verification were not run in this workspace.
