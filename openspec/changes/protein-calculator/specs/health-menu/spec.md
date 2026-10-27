# Spec Delta

## Purpose

Let people open a Health section in the sidebar and reach the Protein Calculator without losing their place in the rest of the menu.

## ADDED Requirements

### Requirement: Health sits under Home
The primary navigation SHALL list Health immediately after Home and before the other existing destinations. Health SHALL be a parent item and SHALL NOT navigate to its own page.

#### Scenario: Health follows Home
- **WHEN** the sidebar lists primary navigation
- **THEN** Home is first
- **THEN** Health is the next item
- **THEN** Projects and Settings keep their existing order after Health

#### Scenario: Health does not open a page
- **WHEN** the user activates Health
- **THEN** the current page does not change

### Requirement: Health expands and collapses
Activating Health SHALL toggle its children between visible and hidden. A chevron SHALL show whether Health is expanded or collapsed and SHALL rotate when that state changes.

#### Scenario: Expand shows the child
- **WHEN** Health is collapsed and the user activates it
- **THEN** its child items are shown
- **THEN** the chevron indicates the expanded state

#### Scenario: Collapse hides the child
- **WHEN** Health is expanded and the user activates it
- **THEN** its child items are hidden
- **THEN** the chevron indicates the collapsed state

### Requirement: Protein Calculator is the Health child
Health SHALL contain a child named Protein Calculator, shown indented under Health. Activating that child SHALL open `/health/protein-calculator`.

#### Scenario: Child is indented under Health
- **WHEN** Health is expanded
- **THEN** Protein Calculator is listed under Health
- **THEN** Protein Calculator is indented relative to Health

#### Scenario: Child opens the calculator
- **WHEN** the user activates Protein Calculator
- **THEN** the app shows the Protein Calculator page at `/health/protein-calculator`

### Requirement: Active calculator keeps Health open
While the Protein Calculator page is the current page, Health SHALL stay expanded and Protein Calculator SHALL be shown as the selected navigation item. The header SHALL show Protein Calculator as the current page title.

#### Scenario: Direct visit selects the child
- **WHEN** the current page is `/health/protein-calculator`
- **THEN** Health is expanded
- **THEN** Protein Calculator is shown as selected
- **THEN** the header title is Protein Calculator

#### Scenario: Selection survives refresh
- **WHEN** the user refreshes `/health/protein-calculator`
- **THEN** Health is expanded
- **THEN** Protein Calculator is shown as selected
