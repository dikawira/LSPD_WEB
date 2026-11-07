# LSPD Rank Sorting & Officer Directory Alignment

## Shared rank order
All roster views now use the formal `RANKS` array as the single seniority source, from Commissioner at the top to Cadet / Probationary at the bottom.

## Updated views
- Chain of Command: each command tier's officers are sorted by formal rank; officers with the same rank are sorted alphabetically by name, then by badge/batch number.
- Officer Directory: the full list and every filtered list are sorted by the same rank sequence, not registration date.
- Department Guide unit personnel, division personnel modal, Rank Detail personnel, and Rank Category personnel also use the same order.
- Legacy labels (Sergeant, Detective I/II/III, Cadet, Probationary) map to their current formal rank for display ordering only.
- No officer records are rewritten or deleted by this display-only sorting update.

## Officer Directory rank cell layout
- Desktop/tablet: contained horizontal scrolling on the table; the insignia and rank badge remain beside each other.
- Mobile: each officer's rank field spans the full card row, preserving a consistent icon + label layout and preventing wrapping above/below the icon.

## Validation
- 14 formal ranks remain unchanged.
- Sorting helper references the same canonical `RANKS` array used by Officer Registration.
- Chain of Command and Directory both call `sortOfficersByRank`.
- Department Guide, division personnel, rank detail, and category personnel lists also use the same sort helper.
- All inline JavaScript blocks passed `node --check`.
- No duplicate HTML IDs found.
- ZIP integrity checked.
- No database records are modified by this view-ordering change.
