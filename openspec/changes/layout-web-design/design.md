# Design

## Context

The running app is the Vite starter. `src/App.tsx` renders the demo screen, and `src/index.css` sets `color-scheme: light dark` and swaps colors under `prefers-color-scheme: dark`. Runtime dependencies are React and React DOM only. See proposal.md for why the shell is needed, and the delta specs for the behavior this design has to satisfy.

## Goals / Non-Goals

**Goals:**

- One shell component owns the sidebar, header, and scrolling body for every route.
- Destinations are real URLs so the header title and selected nav item follow the address.
- Light theme is the only theme, expressed as CSS variables, including when the OS prefers dark.
- Product copy and the placeholder account live in one module.

**Non-Goals:**

- A 64px icon rail. On a narrow viewport the sidebar is hidden, not shrunk to icons.
- An icon library, a CSS framework, a test runner, or account editing.
- Remembering whether the narrow sidebar was open.

## Decisions

### Client routes with React Router

Add `react-router` as the only new runtime dependency. Wrap the app in its browser router and declare these paths:

| Path | Header title | Sidebar selection | Body |
| --- | --- | --- | --- |
| `/` | Home | Home | Welcome panel |
| `/projects` | Projects | Projects | Empty. Home copy is not mounted |
| `/settings` | Settings | Settings | Empty. Home copy is not mounted |
| `/account` | Account settings | None | Name, email, and profile representation |

Any other path redirects to `/`. Account settings is reached from the profile menu, not from the nav list, so no nav item is current there.

`BrowserRouter` is enough. There is no loader, action, or server render. A `useState` page switch was rejected because refresh and the back button would drop the destination the specs treat as current. A hand-rolled hash router was rejected because it would duplicate what the library already does.

Vite's default SPA fallback already serves `index.html` for unknown paths in dev. No `vite.config.ts` change is required for local development. A static host must apply that same fallback.

### Shell grid, with the narrow sidebar as an overlay

The shell fills the viewport (`100dvh`) and does not scroll. On a wide viewport it is a two-column grid: a 240px sidebar on the left spanning both rows, and a content column whose first row is the header and whose second row is the body. Only the body uses `overflow-y: auto`.

Below `48rem`, the grid becomes one column. The sidebar is hidden on load. A header button labeled as a menu control toggles it. While open, the sidebar is a fixed 240px layer over the content, with a backdrop. It closes when the user activates the menu button again, clicks the backdrop, presses Escape, or navigates. The header then spans the full width, which is the content area once the sidebar is no longer beside it.

A persistent icon rail was rejected because the app-shell spec requires the sidebar to be hidden until the menu button opens it.

### Placeholder content in one module

`src/content/placeholders.ts` holds the first-build copy and account. No logo file exists, so the sidebar mark is a text monogram of the product initials next to the product name.

- Product name: `Project React`. Monogram: `PR`. Description: `A shared place for the first layout.`
- Account name: `Alex Rivera`. Email: `alex@example.com`. `imageUrl: null`, so the circular control and the account page show initials `AR`.

The profile component still renders `imageUrl` when it is set, which covers the spec scenario without shipping a dummy image. Sign out only closes the menu and leaves the current route and placeholder account unchanged. There is no session to clear.

The sidebar account row is display-only. It uses the same name and profile representation as the header control and does not open a second menu.

### Light tokens replace the starter theme

Replace the starter rules in `src/index.css`, including the dark `prefers-color-scheme` block. Set `color-scheme: light` so controls stay light when the OS is dark. One accent is used for the selected nav item's text and icon, `:focus-visible` outlines, and the background of an initials circle. Suggested tokens, adjustable without changing structure:

- Page `#f6f6f4`, surfaces `#ffffff`, text `#1a1a1a`, muted text `#6b6b6b`, border `#e4e4e4`, accent `#3b5bdb`.

Selected nav also gets a translucent accent background so the current item is visible, while the accent itself remains the one color the spec requires. Initials use white text on the accent circle.

Nav icons are inline SVGs for Home, Projects, and Settings. That avoids a second dependency.

### Component split

- `src/main.tsx` wraps `App` in the browser router.
- `src/App.tsx` declares the routes and renders the shell as the layout parent.
- `src/shell/AppShell.tsx` owns the grid, narrow-sidebar state, and the body outlet.
- `src/shell/Sidebar.tsx` renders the monogram, product name, nav links with `aria-current`, and the account row.
- `src/shell/Header.tsx` renders the menu button (narrow viewports only), the current title, and the profile control.
- `src/shell/ProfileMenu.tsx` is a button-triggered menu, not a route. Account settings navigates to `/account`. Sign out closes the menu.
- `src/pages/HomePage.tsx`, an empty destination page for Projects and Settings, and `src/pages/AccountPage.tsx`.

Remove the starter render path and `src/App.css`. Starter assets that nothing imports after that can be deleted.

## Risks / Trade-offs

- [48rem is the wrong width for "narrow"] → The breakpoint is one custom property, so it can move without changing the shell structure.
- [Placeholder name and description ship as if they were final] → They live only in `placeholders.ts`.
- [Sign out appears to do nothing] → It closes the menu and stays on the current page, which is the specified behavior until a session exists.
- [Direct visits to `/projects` fail on a static host] → Dev already falls back to `index.html`. Production hosting needs that same fallback; this repo has no deploy config to change.
- [Replacing `index.css` drops starter tokens other files might use] → Only `main.tsx` imports it today, and `App.css` leaves with the starter screen.

## Migration Plan

1. Add `react-router`.
2. Replace the starter screen and global CSS with the shell, routes, and light tokens.
3. Confirm Home, Projects, Settings, Account settings, the profile menu, and the narrow sidebar in the browser.

Rollback is reverting the change. There is no stored data and no API to migrate.
