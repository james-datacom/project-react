## User Story: Health Menu with Protein Calculator and Interactive Sidebar Icons

**As a** user of the web app,
**I want** a new "Health" menu in the sidebar with a "Protein Calculator" page, and an icon on every menu item,
**So that** I can work out my daily protein intake and move around the app more easily.

---

### Scope

1. Add a new parent menu named **Health** directly under **Home** in the sidebar.
2. Add a child menu named **Protein Calculator** inside **Health**.
3. Create a **Protein Calculator** page with inputs that calculate daily protein intake.
4. Update **all** sidebar menu items to show an interactive icon before the menu name, using the format `[ Icon ] Menu Name`.

---

### Sidebar Structure

| Order | Menu               | Type             | Icon (suggested) | Route                     |
|-------|--------------------|------------------|------------------|---------------------------|
| 1     | Home               | Item             | House            | `/`                       |
| 2     | Health             | Parent (expand)  | Heart / Pulse    | —                         |
| 2.1   | Protein Calculator | Child            | Calculator       | `/health/protein-calculator` |
| …     | Existing menus     | Item             | Matching icon    | Existing routes           |

---

### Acceptance Criteria

#### Sidebar – Health Menu
- [ ] The **Health** menu appears directly below **Home**.
- [ ] Clicking **Health** expands or collapses its child items.
- [ ] A chevron shows the expanded or collapsed state and rotates when toggled.
- [ ] **Protein Calculator** appears indented under **Health**.
- [ ] Clicking **Protein Calculator** goes to `/health/protein-calculator`.
- [ ] When the Protein Calculator page is active, **Health** stays expanded and **Protein Calculator** is highlighted as active.

#### Sidebar – Interactive Icons (All Menus)
- [ ] Every menu item shows an icon before its name in the format `[ Icon ] Menu Name`.
- [ ] All icons come from one consistent icon library (e.g., Lucide or MUI Icons).
- [ ] Icons react on hover with a subtle animation (e.g., a slight scale or color change).
- [ ] The active menu icon uses the primary or accent color.
- [ ] Icons stay aligned and evenly spaced with the menu labels.
- [ ] When the sidebar is collapsed (if supported), only the icons show, with a tooltip showing the menu name.
- [ ] Icons display correctly in both **Light** and **Dark** mode.

#### Protein Calculator Page – Inputs
- [ ] Page title: **Protein Calculator**, with an icon before it.
- [ ] The page has the following inputs:

| Field           | Type            | Options / Rules                                                         | Required |
|-----------------|-----------------|-------------------------------------------------------------------------|----------|
| Body Weight     | Number          | Must be greater than 0                                                  | Yes      |
| Weight Unit     | Toggle/Dropdown | kg / lb (default: kg)                                                   | Yes      |
| Age             | Number          | 18–100                                                                  | Yes      |
| Sex             | Dropdown        | Male / Female                                                           | Yes      |
| Activity Level  | Dropdown        | Sedentary, Lightly Active, Moderately Active, Very Active, Athlete      | Yes      |
| Goal            | Dropdown        | Maintain Weight, Lose Fat, Build Muscle                                 | Yes      |

#### Protein Calculator Page – Calculation
- [ ] If the unit is **lb**, the weight is converted to kg (`kg = lb × 0.453592`).
- [ ] Daily protein is calculated as `Weight (kg) × Protein Multiplier (g/kg)`.
- [ ] The multiplier depends on Activity Level, then gets adjusted by Goal:

| Activity Level    | Base (g/kg) |
|-------------------|-------------|
| Sedentary         | 0.8         |
| Lightly Active    | 1.0         |
| Moderately Active | 1.3         |
| Very Active       | 1.6         |
| Athlete           | 1.8         |

| Goal            | Adjustment (g/kg) |
|-----------------|-------------------|
| Maintain Weight | +0.0              |
| Lose Fat        | +0.3              |
| Build Muscle    | +0.4              |

- [ ] The final multiplier is capped at **2.2 g/kg**.
- [ ] The multipliers are kept in a single config file so they're easy to change.

#### Protein Calculator Page – Actions & Results
- [ ] **Calculate** button: runs the calculation. It's disabled until all required fields are valid.
- [ ] **Reset** button: clears all inputs and results.
- [ ] The result card shows:
  - Daily protein intake in **grams/day** (rounded to whole number)
  - Multiplier used (**g/kg**)
  - Per-meal breakdown for **3 meals** and **4 meals**
- [ ] Invalid inputs show inline validation messages under the field.
- [ ] A short disclaimer appears below the result: *"This is an estimate only. Consult a healthcare professional for personalized advice."*

#### General
- [ ] The page is responsive on desktop, tablet, and mobile.
- [ ] The page supports **Light** and **Dark** mode.
- [ ] All calculation is done client-side (no backend or database needed).
- [ ] The route works on GitHub Pages (use HashRouter or a 404 redirect fallback).

---

### Out of Scope
- Saving calculation history
- User profiles or stored health data
- Other health calculators (BMI, calories), which can come in a future story

---

### Definition of Done
- [ ] The Health menu and Protein Calculator are added and navigable.
- [ ] All sidebar menus have interactive icons.
- [ ] The calculation logic has unit tests covering each activity level, goal, and unit conversion.
- [ ] Light and Dark mode are both verified.
- [ ] The app is deployed to GitHub Pages through GitHub Actions.