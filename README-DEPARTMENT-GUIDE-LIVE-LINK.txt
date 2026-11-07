DEPARTMENT GUIDE — LIVE PERSONNEL LINK UPDATE

Changes in public/portal.html:
- Each of the 18 Department Guide cards is clickable.
- Clicking a unit opens a unit-detail modal.
- The modal shows the unit overview, required ranks drawn from the LSPD ROSTER 2026 structure,
  current assignment counts per rank, and registered officer profiles for that unit.
- Officer data is read from the existing `officers` array used by Officer Directory and Chain of Command.
- Each officer profile button opens the existing personnel detail modal.
- The Department Guide refreshes after officer registration/edit/delete saves and after cloud sync.
- The Department Guide remains a submenu inside the existing Operations dropdown and mobile accordion.
- No new personnel database or manually duplicated roster was created.

Validation performed:
- 18 interactive unit cards are present.
- 18 unit rank requirement configurations are present.
- JavaScript inline scripts passed `node --check`.
