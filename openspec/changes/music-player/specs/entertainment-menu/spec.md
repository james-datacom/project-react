# Spec Delta

## Purpose

Let people open an Entertainment section in the sidebar and reach Music without losing their place in the rest of the menu.

## ADDED Requirements

### Requirement: Entertainment sits under Health
The primary navigation SHALL list Entertainment immediately after the Health group and before Projects. Entertainment SHALL be a parent item and SHALL NOT navigate to its own page. Home, Health, Protein Calculator, Projects, Settings, and Account SHALL keep their existing labels, order relative to each other, and routes.

#### Scenario: Entertainment follows Health
- **WHEN** the sidebar lists primary navigation
- **THEN** Home is first
- **THEN** Health and its Protein Calculator child come next
- **THEN** Entertainment is the next item
- **THEN** Projects follows Entertainment

#### Scenario: Entertainment does not open a page
- **WHEN** the user activates Entertainment
- **THEN** the current page does not change

### Requirement: Entertainment expands and collapses
Activating Entertainment SHALL toggle its children between visible and hidden. A chevron SHALL show whether Entertainment is expanded or collapsed and SHALL rotate when that state changes.

#### Scenario: Expand shows the child
- **WHEN** Entertainment is collapsed and the user activates it
- **THEN** its child items are shown
- **THEN** the chevron indicates the expanded state

#### Scenario: Collapse hides the child
- **WHEN** Entertainment is expanded and the user activates it
- **THEN** its child items are hidden
- **THEN** the chevron indicates the collapsed state

### Requirement: Music is the Entertainment child
Entertainment SHALL contain one child, named Music, shown indented under Entertainment with an icon immediately before the label. Activating Music SHALL open `/entertainment/music`.

#### Scenario: Child is indented under Entertainment
- **WHEN** Entertainment is expanded
- **THEN** Music is listed under Entertainment
- **THEN** Music is indented relative to Entertainment
- **THEN** an icon is shown immediately before the Music label

#### Scenario: Child opens Music
- **WHEN** the user activates Music
- **THEN** the app shows the Music page at `/entertainment/music`

### Requirement: Active Music keeps Entertainment open
While `/entertainment/music` is the current page, Entertainment SHALL stay expanded and Music SHALL be shown as the selected navigation item. The header SHALL show Music as the current page title.

#### Scenario: Direct visit selects the child
- **WHEN** the current page is `/entertainment/music`
- **THEN** Entertainment is expanded
- **THEN** Music is shown as selected
- **THEN** the header title is Music

#### Scenario: Selection survives refresh
- **WHEN** the user refreshes `/entertainment/music`
- **THEN** Entertainment is expanded
- **THEN** Music is shown as selected

### Requirement: Entertainment icons match the existing menu
The Entertainment and Music icons SHALL come from the same icon library as the other menu items. They SHALL use the same hover behavior, the same active color, and SHALL stay distinguishable from the sidebar in light mode and in dark mode.

#### Scenario: Hover and active color match the other items
- **WHEN** the user points at Entertainment or Music, and when Music is selected
- **THEN** those icons follow the same hover behavior and active color as the other menu icons

#### Scenario: Icons stay visible in both themes
- **WHEN** the app is in light mode and in dark mode
- **THEN** the Entertainment and Music icons remain visible against the sidebar

### Requirement: Collapsed sidebar shows the Entertainment icon
When the sidebar is collapsed to icons only, the sidebar SHALL show the Entertainment icon without its text label and SHALL provide the name Entertainment as a tooltip.

#### Scenario: Collapsed Entertainment keeps its name available
- **WHEN** the sidebar is collapsed to icons only
- **THEN** the Entertainment text label is hidden
- **THEN** the Entertainment icon remains visible
- **THEN** pointing at that icon shows the name Entertainment
