# Tasks

## 1. Foundation

- [ ] 1.1 Add `react-router` as the only new runtime dependency and verify it is listed in `package.json` and `npm run build` succeeds
- [ ] 1.2 Add `src/content/placeholders.ts` with product name `Project React`, monogram `PR`, description `A shared place for the first layout.`, and account `Alex Rivera` / `alex@example.com` / `imageUrl: null`, and verify the module exports those values and `npm run build` succeeds

## 2. Light theme

- [ ] 2.1 Replace the starter rules in `src/index.css`, including the `prefers-color-scheme: dark` block, with `color-scheme: light` and tokens for page `#f6f6f4`, surface `#ffffff`, text `#1a1a1a`, muted text `#6b6b6b`, border `#e4e4e4`, and accent `#3b5bdb`, and verify the dark media query is gone
- [ ] 2.2 Add shell layout rules for a `100dvh` grid, a 240px sidebar, a scrolling body, a `--shell-break` of `48rem`, and a `:focus-visible` outline in the accent color, and verify those rules are in the stylesheet

## 3. Shell and routes

- [ ] 3.1 Wrap the app in the React Router browser router from `src/main.tsx` and declare `/`, `/projects`, `/settings`, and `/account` in `src/App.tsx`, with any other path redirecting to `/`, and verify each path renders inside the shell and an unknown path ends on Home
- [ ] 3.2 Build `src/shell/AppShell.tsx` so a wide viewport shows the sidebar on the left, the header across the top of the content area, and the body filling the remaining space, and verify scrolling the body leaves the sidebar and header in place

## 4. Navigation

- [ ] 4.1 Show the `PR` monogram and the product name at the top of `src/shell/Sidebar.tsx`, and verify both are visible when the sidebar is visible
- [ ] 4.2 List Home, Projects, and Settings in that order, each with a label, an inline SVG icon, and a destination, with Home current on `/`, and verify the order, the icons, and the initial selection
- [ ] 4.3 Show the current page title on the left of the header, and verify that choosing Projects or Settings updates the title and the selected item and does not leave the Home welcome or product description on screen
- [ ] 4.4 Show a display-only account row at the bottom of the sidebar with the same name and initials as the header profile, and verify it matches the header and does not navigate

## 5. Account

- [ ] 5.1 Render a circular header profile that shows `imageUrl` when set and initials `AR` when it is null, and verify the running app shows `AR`, then that a temporary image URL shows that image, then restore `imageUrl: null`
- [ ] 5.2 Open a profile menu with Account settings and Sign out, and verify that choosing either item closes the menu and that Account settings opens `/account` in the body, not a modal, showing name, email, and initials only
- [ ] 5.3 Make Sign out leave the user in the shell on the current route, and verify that choosing it from Home stays on `/` with the menu closed and without password, billing, or team fields

## 6. Home and narrow sidebar

- [ ] 6.1 Show the Home welcome and product description in a padded white panel inset from the body edges, and verify on `/` that the copy sits in that panel and the panel is not edge to edge
- [ ] 6.2 Below `48rem`, hide the sidebar until the header menu button opens it, and verify the button is absent on a wide viewport and that the sidebar closes again from the button, the backdrop, Escape, and navigation

## 7. Starter removal and integration

- [ ] 7.1 Remove the starter render path, `src/App.css`, and starter assets that nothing imports, and verify `npm run build` succeeds and the "Get started" screen is gone
- [ ] 7.2 Walk the shell in the browser at a wide viewport and below `48rem`, and verify Home, Projects, Settings, Account settings, Sign out, the narrow sidebar, and the light surfaces, text, borders, and single accent on the selected item, focus ring, and initials
