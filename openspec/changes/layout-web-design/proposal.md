# Proposal

## Why

The app is still the Vite starter screen, so there is no product shell to navigate or a place for account information. The first layout has to land now so later screens share one sidebar, header, and body instead of each inventing their own chrome.

## What Changes

- Replace the starter screen with an app shell: a left sidebar, a header across the top of the content area, and a body that fills the remaining space.
- Keep the sidebar and header fixed while the body scrolls.
- Stay desktop-first. On a narrow screen, collapse the sidebar behind a menu button in the header.
- Show the product name and a logo, or a simple wordmark when no logo exists yet. Exact name and one-line description stay placeholder copy until those inputs are locked.
- Add a short navigation list. Each item has a label, an icon, and a destination. The first items are Home, Projects, and Settings. Home is selected by default.
- Show the current page title on the left of the header.
- Add a circular profile on the right of the header. Use the profile image when one exists; otherwise show the user's initials. Clicking it opens a small menu with Account settings and Sign out. The sidebar ends with a compact account row that matches that profile.
- Make Home the first screen: a padded panel, not edge-to-edge content, with a short welcome and the product's one-line description.
- Open Account settings as its own page in the body. The first version shows name, email, and profile image only, using placeholder display values.
- Make light theme the default appearance: a slightly off-white page, white sidebar, header, and body panels, near-black text, muted gray secondary labels, light gray borders, and one accent color for the selected nav item, focus rings, and the initials fallback.
- This change does not add authentication, password changes, billing, or team management. Projects and Settings are navigation destinations only; their page content is out of scope.

## Capabilities

### New Capabilities

- `app-shell`: Sidebar, header, and body regions, fixed chrome while the body scrolls, and collapse of the sidebar on a narrow screen.
- `navigation`: Product identity in the sidebar, the nav list and its selected state, and the current page title in the header.
- `home`: The Home screen empty state in a padded content panel.
- `account`: Header profile control, profile menu, sidebar account row, and the Account settings page.
- `light-theme`: Default light appearance for the shell, text, borders, accent, and profile fallback.

### Modified Capabilities

None. The project has no existing specs.

## Impact

- Replaces the Vite starter UI in `src/`, including `src/App.tsx` and the starter styles.
- The app stays a React, TypeScript, and Vite client. There is no backend or API in this change.
- Client navigation between Home, Projects, Settings, and Account settings is new behavior. How routes are implemented belongs in the design.
- Placeholder identity (product name, description, user name, email, and avatar) is display-only until real values are chosen.
