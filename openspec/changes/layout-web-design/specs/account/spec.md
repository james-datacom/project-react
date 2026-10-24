# Spec Delta

## Purpose

Give the signed-in placeholder identity a circular profile control, a small menu, a matching sidebar row, and an Account settings page that shows only name, email, and profile image.

## ADDED Requirements

### Requirement: Header profile control
The right side of the header SHALL show a circular profile control. It SHALL show the account profile image when one is available, and the account initials when no image is available.

#### Scenario: Profile image is shown
- **WHEN** the account has a profile image
- **THEN** the header profile control is circular and shows that image

#### Scenario: Initials are shown when no image is available
- **WHEN** the account has no profile image
- **THEN** the header profile control is circular and shows the account initials

### Requirement: Profile menu
Activating the header profile control SHALL open a small menu with Account settings and Sign out. Choosing either item SHALL close the menu.

#### Scenario: Menu offers account actions
- **WHEN** the user activates the header profile control
- **THEN** a menu opens with Account settings and Sign out

#### Scenario: Choosing an item closes the menu
- **WHEN** the user chooses Account settings or Sign out from the profile menu
- **THEN** the profile menu closes

### Requirement: Sidebar account row
The bottom of the sidebar SHALL show a compact account row that uses the same account name and the same profile image or initials as the header profile control.

#### Scenario: Sidebar row matches the header profile
- **WHEN** the sidebar is visible
- **THEN** a compact account row is shown at the bottom of the sidebar
- **THEN** the row shows the same account name and the same profile image or initials as the header profile control

### Requirement: Account settings page
Account settings SHALL open as its own page in the body, not as a modal. The page SHALL show the account name, email, and profile image or initials. It SHALL NOT show password, billing, or team fields.

#### Scenario: Account settings replaces the body
- **WHEN** the user chooses Account settings from the profile menu
- **THEN** the body shows the Account settings page
- **THEN** the page is not a modal
- **THEN** the page shows the account name, email, and profile image or initials
- **THEN** the page does not show password, billing, or team fields

### Requirement: Sign out does not open account management
Choosing Sign out SHALL leave the user in the app shell. It SHALL NOT open Account settings and SHALL NOT present password, billing, or team fields.

#### Scenario: Sign out stays in the shell
- **WHEN** the user chooses Sign out from the profile menu
- **THEN** the app remains in the shell
- **THEN** Account settings is not opened
- **THEN** no password, billing, or team fields are shown
