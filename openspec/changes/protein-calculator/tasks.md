# Tasks

## 1. Formula

- [ ] 1.1 Add `vitest` as a dev dependency with a `test` script of `vitest run`, and add `src/health/protein-config.ts` exporting the pound factor `0.453592`, the cap `2.2`, activity bases Sedentary `0.8`, Lightly Active `1.0`, Moderately Active `1.3`, Very Active `1.6`, and Athlete `1.8`, and goal adjustments Maintain Weight `0`, Lose Fat `0.3`, and Build Muscle `0.4`, and verify `package.json` has that script and the module exports those values
- [ ] 1.2 Implement `calculateProtein` and `clampProteinMultiplier` in `src/health/protein.ts`, ignoring age and sex, converting pounds before multiplying, rounding daily grams with `Math.round`, and returning the multiplier plus the daily total divided by 3 and by 4, and verify `src/health/protein.test.ts` passes `npm test` for every activity base, every goal adjustment, 80 kg moderate maintain equaling 104 g at 1.3, 200 lb sedentary maintain equaling 73 g at 0.8, 70 kg athlete build muscle equaling 154 g at 2.2, `clampProteinMultiplier(2.3)` equaling 2.2, a half that rounds up, and two calls that differ only by age or sex

## 2. Calculator page

- [ ] 2.1 Build `src/pages/ProteinCalculatorPage.tsx` as a `.panel` with an `h2` of Protein Calculator preceded by the Lucide calculator icon, and controlled fields for body weight, weight unit defaulting to kg, age, sex, activity level, and goal, with the selects offering only the spec choices plus an empty first option, and verify the first paint shows kg, a message and `aria-invalid` under each empty or invalid field, and a disabled Calculate button
- [ ] 2.2 Submit the valid form through `calculateProtein` with no server request, show grams per day, the multiplier in g/kg, the 3-meal and 4-meal amounts to one decimal, and the disclaimer "This is an estimate only. Consult a healthcare professional for personalized advice.", hide that card before the first success, leave it in place while inputs change, and make Reset clear the inputs, return the unit to kg, and remove the card, and verify 80 kg, age 30, Male, Moderately Active, and Maintain Weight shows 104 grams, 1.3 g/kg, 34.7, and 26, then Reset removes the card and restores kg, with nothing written to storage

## 3. Sidebar, icons, and route

- [ ] 3.1 Add `lucide-react` and use `House`, `HeartPulse`, `Folder`, and `Settings` before Home, Health, Projects, and Settings, switch `.nav-icon` from fill to a `1.25rem` `currentColor` stroke with a `0.75rem` gap and a hover scale of `1.08`, keep the header menu-button SVG, and verify each labeled primary item shows its icon before the name, the selected icon uses the accent text color, and hover scales the icon in light and dark mode
- [ ] 3.2 Render Health as a button directly under Home and before Projects and Settings, with `aria-expanded` and a Lucide chevron that rotates, collapsed until toggled, listing Protein Calculator indented beneath it, and verify activating Health does not change the current page and that expand then collapse shows and hides that child
- [ ] 3.3 Add the `health/protein-calculator` route to `ProteinCalculatorPage`, set the header title to Protein Calculator, link the indented child there, force Health to stay expanded and the child selected on that path, and verify a direct visit and a refresh keep Health open, keep the child selected, show that header title, and ignore a collapse click while the path is current
- [ ] 3.4 Leave `BrowserRouter` and the production `404.html` copy in place, and verify `src/main.tsx` does not use `HashRouter` and `npm run build` still writes `dist/404.html`

## 4. Layout check

- [ ] 4.1 Lay the calculator out as one column with a max width using the existing theme variables, keep the narrow sidebar as a hidden overlay below `48rem` with no icon rail, and verify in the browser that desktop, tablet, and mobile widths keep the fields readable in light and dark mode, and that the narrow menu button still opens the overlay instead of icon-only tooltips
