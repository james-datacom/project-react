# Spec Delta

## Purpose

Let people see which product they are in and move between the first destinations, with the current page named in the header and indicated in the sidebar.

## ADDED Requirements

### Requirement: Product identity
The top of the sidebar SHALL show the product name and a logo. When no logo is available, it SHALL show a wordmark in place of the logo.

#### Scenario: Name and mark are visible
- **WHEN** the sidebar is visible
- **THEN** the product name is shown at the top of the sidebar
- **THEN** a logo or a wordmark is shown with that name

### Requirement: Navigation list
The sidebar SHALL list Home, Projects, and Settings. Each item SHALL show a label, an icon, and lead to a destination.

#### Scenario: First destinations are listed
- **WHEN** the sidebar is visible
- **THEN** Home, Projects, and Settings are listed in that order
- **THEN** each item shows a label and an icon

### Requirement: Home is selected by default
When the app opens, Home SHALL be the selected navigation item.

#### Scenario: Initial selection
- **WHEN** the user opens the app
- **THEN** Home is shown as the selected navigation item

### Requirement: Current page title
The left side of the header SHALL show the title of the current page. The selected navigation item SHALL match the current destination when that destination is Home, Projects, or Settings.

#### Scenario: Title and selection follow the destination
- **WHEN** the user selects Home, Projects, or Settings
- **THEN** that item is shown as selected
- **THEN** the header title is that destination's page title

### Requirement: Projects and Settings are destinations only
Selecting Projects or Settings SHALL change the current destination. Their page content is out of scope, and the Home empty state SHALL NOT remain on screen.

#### Scenario: Leaving Home
- **WHEN** the user selects Projects or Settings
- **THEN** the header title matches the selected destination
- **THEN** the Home welcome line and product description are not shown
