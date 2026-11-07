# LSPD Rank Structure — FTO Classification Correction

## Formal rank hierarchy
- Removed Field Training Officer (FTO) from the formal Rank Structure list.
- The formal Rank Structure now contains 13 rank entries.
- Formal rank sequence and its rank insignia remain unchanged apart from renumbering after FTO's removal.
- The page wording now explicitly states that Rank Structure contains formal ranks only.

## FTO remains available as a special assignment
- FTO remains in Rank Categories as a separate personnel classification/assignment.
- FTO category information explains that FTO is a training designation, not a formal rank.
- The FTO category still lists officers whose stored `rankCategory` is `FTO`.
- A suitable officer (normally Police Officer III in this LSPD roleplay structure) can still be assigned the FTO category during registration.
- FTO's dedicated shield graphic remains available for the Rank Categories page.
- FTO is no longer present in the formal-rank reference dictionary, formal-rank modal, or rank hierarchy cards.

## Validation performed
- Formal `RANKS` array contains 13 entries and excludes FTO.
- Rank Structure markup contains 13 cards and no FTO card.
- Rank Categories retains the FTO category.
- All inline JavaScript blocks passed `node --check`.
- No duplicate HTML element IDs detected.
- ZIP integrity checked.
- Live browser/database verification was not performed in this workspace.
