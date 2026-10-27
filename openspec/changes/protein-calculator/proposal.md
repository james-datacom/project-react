# Proposal

## Why

People can move between Home, Projects, and Settings, but there is no place to estimate daily protein and the sidebar gives little visual help when scanning destinations. A Health section and clearer menu icons make that estimate reachable without adding accounts or stored health data.

## What Changes

- Add a **Health** parent directly under **Home**. It expands and collapses its children, with a chevron that shows and rotates with that state.
- Add a **Protein Calculator** child under Health. Selecting it opens `/health/protein-calculator`. While that page is current, Health stays expanded and Protein Calculator is the selected item.
- Show an icon before every sidebar menu name, including existing items, in the form icon then label. Icons come from one library, react on hover, use the accent color when selected, stay aligned with labels, and read clearly in light and dark mode. If the sidebar can collapse to icons only, the label is available as a tooltip.
- Add a Protein Calculator page titled with an icon. Required inputs are body weight (greater than 0), weight unit (kg or lb, default kg), age (18–100), sex, activity level, and goal. Calculate stays disabled until every field is valid. Invalid fields show a message under the field. Reset clears inputs and results.
- Calculate on the client: convert pounds to kilograms, then daily protein as weight in kg times a multiplier. The multiplier starts from activity level, then adjusts for goal, and is capped at 2.2 g/kg. Multipliers live in one config so they can change without hunting through the page.
- Show the result as whole grams per day, the multiplier used, and a per-meal split for 3 meals and 4 meals, plus a short estimate-only disclaimer.
- The page works on desktop, tablet, and mobile, and in light and dark mode. The new route must still load on the existing GitHub Pages site.
- Out of scope: saved history, user health profiles, and other calculators such as BMI or calories.

## Capabilities

### New Capabilities

- `health-menu`: Health as an expandable parent under Home, the Protein Calculator child, and selection that keeps Health open on `/health/protein-calculator`.
- `menu-icons`: An icon before every sidebar menu name, including hover, selected color, alignment, light and dark mode, and icon-only collapse when the shell supports it.
- `protein-calculator`: The calculator page, its inputs and validation, the client-side protein estimate, and the result card.

### Modified Capabilities

None. `openspec list --specs` is empty. Sidebar behavior for Home, Projects, and Settings lives only on the in-progress `layout-web-design` change (`navigation`), not under `openspec/specs/`.

## Impact

- Extends the sidebar in `src/shell/Sidebar.tsx` and adds the `/health/protein-calculator` route beside the routes in `src/App.tsx`. A new page module owns the form and result. Calculation rules and multipliers stay in a small config, covered by unit tests for each activity level, goal, unit conversion, and the 2.2 g/kg cap.
- Adds one icon set as a dependency if the current inline SVGs are not kept. No backend, database, or API.
- Light and dark mode already exist; the new menu and page use them. Narrow layouts already hide the sidebar; icon-only collapse is only in scope if that collapsed mode exists.
- Publishing stays on the GitHub Pages workflow. This change does not add a deploy pipeline. The design chooses how `/health/protein-calculator` survives a refresh on that site.
