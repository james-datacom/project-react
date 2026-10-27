# Spec Delta

## Purpose

Let people scan the sidebar by icon as well as by name, including Health and Protein Calculator, in both light and dark mode.

## ADDED Requirements

### Requirement: Every menu item has an icon
Every primary navigation item SHALL show an icon immediately before its text label, including Home, Health, Protein Calculator, and the other existing destinations. Those icons SHALL share one icon style.

#### Scenario: Icons precede labels
- **WHEN** the sidebar shows primary navigation with labels
- **THEN** each item shows an icon and then its name
- **THEN** the icons share one visual style

### Requirement: Icons respond and stay aligned
Pointing at a menu item SHALL change its icon by scale or color. The selected item's icon SHALL use the accent color. Icons SHALL stay aligned with each other and evenly spaced from their labels.

#### Scenario: Hover changes the icon
- **WHEN** the user points at a menu item
- **THEN** that item's icon changes scale or color

#### Scenario: Selected icon uses the accent
- **WHEN** a menu item is selected
- **THEN** its icon uses the accent color

#### Scenario: Icons line up with labels
- **WHEN** the sidebar shows labeled menu items
- **THEN** the icons share one vertical alignment
- **THEN** the space between each icon and its label is even

### Requirement: Icons remain visible in both themes
Menu icons SHALL stay distinguishable from the sidebar background in light mode and in dark mode.

#### Scenario: Light mode
- **WHEN** the app is in light mode
- **THEN** each menu icon is visible against the sidebar

#### Scenario: Dark mode
- **WHEN** the app is in dark mode
- **THEN** each menu icon is visible against the sidebar

### Requirement: Icon-only collapse
If the shell collapses the sidebar to icons only, the sidebar SHALL hide menu text labels, keep the menu icons visible, and provide each menu name as a tooltip.

#### Scenario: Collapsed sidebar keeps names available
- **WHEN** the sidebar is collapsed to icons only
- **THEN** menu text labels are hidden
- **THEN** each menu icon remains visible
- **THEN** pointing at an icon shows that menu's name
