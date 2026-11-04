# LSPD Portal — Menu Transition Update

This update adds subtle animated transitions to the existing portal navigation while preserving the menu structure and page content.

## Included
- Current view fades/slides out, followed by the selected view fading/sliding up.
- Active navigation state updates with the selected section.
- Handles rapid consecutive menu clicks safely using a transition sequence token.
- Media Center collection panels and visible video cards animate in.
- Upload Video modal uses a short fade/scale entrance.
- Respects the user's `prefers-reduced-motion` accessibility setting.
- Splash screen behavior and header gating remain unchanged.

## Run
1. Copy the existing `.env` file into the extracted project root. Do not share it.
2. Run `npm install` if dependencies have not already been installed.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

JavaScript syntax was checked. A full Next.js build and in-browser visual test were not run in this environment.
