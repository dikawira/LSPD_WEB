# LSPD Portal — Rank Order Correction (Highest to Lowest)

The formal rank hierarchy is presented from the highest position at the top to the entry-level position at the bottom. The same sequence is used in the Rank Structure page and Officer Registration rank selector.

1. Commissioner
2. Chief of Police
3. Assistant Chief
4. Deputy Chief
5. Commander
6. Captain
7. Lieutenant
8. Detective
9. Sergeant II
10. Sergeant I
11. Police Officer III
12. Police Officer II
13. Police Officer I
14. Cadet / Probationary

The Chain of Command follows the same seniority direction:
- Executive High Command & Board of Commissioners: Commissioner, Chief of Police, Assistant Chief, Deputy Chief
- Command Staff: Commander, Captain, Lieutenant
- Detective & Investigative Personnel: Detective
- Supervisory Staff: Sergeant II, Sergeant I
- Patrol Officers: Police Officer III, Police Officer II, Police Officer I
- Probationary & Cadets: Cadet / Probationary

Rank Categories also present their associated ranks in descending seniority:
- High Command: Commissioner, Chief of Police, Assistant Chief, Deputy Chief, Commander
- Command: Captain, Lieutenant
- Supervisor: Sergeant II, Sergeant I
- Detective: Detective

FTO remains a special assignment, not a formal rank.
The Detective rank remains singular. No Detective I, Detective II, or Detective III rank choices are offered. Existing records with those retired values are normalized to Detective through the existing shared officer data sync.

## Validation
- 14 Rank Structure cards match the 14 Officer Registration dropdown options in descending order.
- Rank reference object keys use the same sequence.
- Chain of Command tiers are ordered from top command to Cadet.
- Rank-category membership arrays are ordered from senior to junior.
- Seven inline JavaScript blocks passed `node --check`.
- No duplicate HTML IDs found.
- ZIP integrity checked.
- Live production database and browser interaction tests were not run.
