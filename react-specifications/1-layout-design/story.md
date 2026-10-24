# Story

Layout web design

## Acceptance Criteria

- The layout includes a sidebar, a header, and a body.
- The header includes a circular profile icon for account settings.
- Light theme is the default appearance.

## Suggested inputs

Details to lock in before building the first layout.

### App identity

- Product name shown in the sidebar.
- Logo or a simple wordmark if no logo exists yet.
- One-line description used only as the empty-state copy in the body.

### Shell

- Sidebar on the left, header across the top, body filling the remaining space.
- Sidebar stays fixed while the body scrolls.
- Header stays fixed at the top of the content area.
- Desktop-first. On a narrow screen, the sidebar collapses behind a menu button in the header.

### Sidebar

- Width about 240px, with a collapsed width of about 64px.
- Top: logo and product name.
- Middle: a short navigation list. Each item needs a label, an icon, and a destination.
- Suggested first items: Home, Projects, Settings.
- Home is selected by default.
- Bottom: a compact account row that matches the header profile.

### Header

- Left: the title of the current page.
- Right: a circular profile image. If no image is available, show the user's initials.
- Clicking the profile opens a small menu with Account settings and Sign out.
- Suggested display values for the first build: name, email, and a placeholder avatar.

### Body

- First screen is Home.
- Empty state: a short welcome line and the product description.
- Content sits in a padded panel with a light surface, not edge to edge.

### Account settings

- Opens as its own page in the body, not a modal.
- First version shows name, email, and profile image only.
- No password, billing, or team fields yet.

### Light theme

- Page background slightly off-white.
- Sidebar, header, and body panels are white.
- Text is near-black, with a muted gray for secondary labels.
- Borders are a light gray.
- One accent color for the selected nav item and focus rings.
- Profile circle uses the accent as a fallback behind initials.
