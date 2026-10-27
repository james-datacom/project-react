# Design

## Context

The shell, light and dark themes, and client routes already exist. `src/shell/Sidebar.tsx` lists Home, Projects, and Settings as flat links with hand-written SVGs. `src/shell/Header.tsx` maps those paths, plus `/account`, to the header title. `src/App.tsx` renders those routes inside `AppShell`. Narrow viewports hide the sidebar behind a menu button; they do not collapse it to an icon rail. `src/main.tsx` uses `BrowserRouter` with a basename from `import.meta.env.BASE_URL`. The production build copies `index.html` to `dist/404.html`, which is how GitHub Pages serves a client path. There is no test script. `npm test --if-present` in the Pages workflow succeeds today because that script is absent. See proposal.md for why Health and the calculator are needed, and the delta specs for the behavior this design has to satisfy.

## Goals / Non-Goals

**Goals:**

- Model Health as a parent row whose only child is a real route.
- Keep protein math in one config and one pure function, with Vitest covering the spec cases.
- Draw every primary-nav icon, the Health chevron, and the page-title icon from one icon package.
- Leave the published path URL working through the existing Pages fallback.

**Non-Goals:**

- An icon rail, icon-only tooltips, or a new narrow-sidebar behavior.
- `HashRouter`, a new deploy workflow, or a change to the Vite base path.
- Using age or sex in the formula, storing a result, or testing the form in a browser runner.

## Decisions

### Health is a group, not a route

Replace the flat link list with two kinds of entry, still in this order: Home, Health, Projects, Settings.

- A link has a destination, a label, and an icon. Home stays `end` so only `/` selects it.
- Health is a group. Its row is a button, so activating it does not change the page. It shows a chevron and toggles whether its children are in the list. `aria-expanded` matches that state. The chevron rotates with a CSS transform.
- Protein Calculator is the only child. It is a `NavLink` to `/health/protein-calculator`, indented under the group. While that path is current, the child is selected and the header title is `Protein Calculator`.

Expanded state is component state, not a URL. The calculator path forces the group open, including after refresh, and the Health button does not collapse it while that path is current. On any other path the group starts collapsed and the button toggles it. The choice is not stored. Leaving the calculator and coming back without that path collapses it again until the user opens it.

A route for Health itself was rejected because the spec forbids Health from opening a page. Remembering the toggle in `localStorage` was rejected because refresh on the calculator must be open for that route, and no other persistence is required.

### Lucide for nav icons

Add `lucide-react`. Use `House`, `HeartPulse`, `Calculator`, `Folder`, and `Settings` for Home, Health, Protein Calculator, Projects, and Settings. The Health chevron and the icon before the page title come from the same package.

Existing `.nav-icon` rules use `fill`. Lucide icons are strokes, so those rules become a fixed `1.25rem` box, `currentColor` stroke, and no fill. The selected link already sets `color` to `var(--accent-text)`, which paints the icon. Hover scales the icon slightly (`transform: scale(1.08)` with a short transition). Alignment stays the current flex row and `0.75rem` gap, including the indented child.

The header menu button keeps its current SVG. It is not a primary-nav item. MUI icons were rejected because they pull in a second design system. Keeping hand-written SVGs was rejected because the new Health, calculator, and chevron icons would be a second drawing style.

### No icon rail

Below `48rem` the sidebar stays hidden until the menu button opens the overlay. This change does not add a mode that shows icons without labels, so the tooltip scenario in the menu-icons spec has nothing to attach to. Adding a 64px rail was rejected because the app-shell spec hides the sidebar on a narrow screen.

### Calculator route on the current router

Add one child route, `health/protein-calculator`, rendering `src/pages/ProteinCalculatorPage.tsx`. The unknown-path redirect to `/` stays.

Do not switch to `HashRouter`. A refresh of `/project-react/health/protein-calculator` on Pages already receives `404.html`, which is the built app, and `BrowserRouter` reads the path. The in-app path remains `/health/protein-calculator`. No Vite or workflow edit is required for that fallback.

### Pure estimate, config beside it

`src/health/protein-config.ts` holds the pound factor `0.453592`, the cap `2.2`, the five activity bases, and the three goal adjustments. `src/health/protein.ts` exports `calculateProtein` and `clampProteinMultiplier`.

`calculateProtein` accepts weight, unit, age, sex, activity, and goal. It converts pounds with the config factor, then multiplies kilograms by `clampProteinMultiplier(base + adjustment)`. Daily grams are `Math.round` of that product, which rounds halves up for these positive values. It does not round the kilogram weight first. Age and sex are accepted and ignored, so the form can require them without changing grams. The function returns the rounded daily grams, the multiplier used, and the daily total divided by 3 and by 4.

`clampProteinMultiplier` is `Math.min(2.2, value)`. The published table never exceeds the cap (`1.8 + 0.4` is `2.2`), so the cap test calls this function with `2.3` and expects `2.2`. Folding the clamp into the table was rejected because that test would have nothing above the cap to assert.

The page displays per-meal values to one decimal gram. The function still returns the exact quotients.

### Form and result

The page is a `.panel`. An `h2` shows the Calculator icon and the title Protein Calculator. The header `h1` repeats that title, which matches how other destinations name the current page.

Fields are controlled. Weight unit is a select defaulting to `kg`. Sex, activity, and goal are selects with an empty first option. Weight and age are number inputs. A field is invalid when it is empty, weight is not greater than 0, or age is not an integer from 18 through 100. Each invalid field shows its message underneath and sets `aria-invalid`. Messages are visible on first paint, because the spec shows a message for every invalid field, including an empty one. Calculate is disabled until all six are valid. Reset clears the fields, sets the unit back to `kg`, and removes the result.

Calculate runs `calculateProtein` in the submit handler and stores the result in state. Nothing is sent to a server. The result card shows grams per day, the multiplier in g/kg, the 3-meal and 4-meal lines, and the disclaimer text from the spec. No card is rendered before the first success. Editing the form leaves the last result in place until the next success or Reset.

Colors, borders, and text use the existing theme variables, so light and dark come from `data-theme` without a second palette. The form is one column with a max width inside the scrolling body, so tablet and mobile stack instead of growing a side-by-side layout.

### Vitest for the formula only

Add `vitest` as a dev dependency and a `test` script of `vitest run`. Tests live next to the function in `src/health/protein.test.ts`. They cover each activity base, each goal adjustment, the 200 lb sedentary example (73 grams), the 80 kg moderate maintain example (104 grams at 1.3), athlete plus build muscle (154 grams at 2.2), the clamp of a value above 2.2, half-up rounding, and two calls that differ only by age or sex. No React Testing Library or browser runner. The Pages workflow will start running this script because `npm test --if-present` is already there.

## Risks / Trade-offs

- [Empty fields show errors immediately] → The spec requires a message under each invalid field before Calculate is enabled. The messages stay short. A touched-only rule was rejected because it would hide those messages on first paint.
- [A result can disagree with edited inputs] → The card updates only on Calculate or Reset. The disabled button is the signal that the visible card is not from the current form. Clearing on every keystroke was rejected because the spec does not ask for a live result.
- [The cap is invisible with the current table] → `clampProteinMultiplier(2.3)` is the test. Changing the config later cannot skip the cap if calculation goes through that function.
- [Adding `npm test` makes a failing formula block Pages] → That is the point of the existing `--if-present` step. A failed test does not deploy. Rollback remains reverting `main`.
- [Lucide stroke icons ignore the old fill rule] → The nav icon CSS is updated in the same change. Selected color still comes from the link's text color.
- [The icon-only tooltip scenario is not exercised] → This shell has no icon-only sidebar. Building one would conflict with the narrow overlay.

## Migration Plan

1. Add the icon package, the health module and its tests, the page, the route, the header title, and the sidebar group.
2. Confirm `npm test` and `npm run build` succeed. The build still emits `dist/404.html`.
3. Merging to `main` publishes through the existing workflow. No Pages setting changes.
4. To roll back, revert the commit. There is no stored health data to migrate. A failed test or build leaves the last good Pages deploy in place.

## Open Questions

None. The icon package, the router, the cap test, and the error timing are decided above.
