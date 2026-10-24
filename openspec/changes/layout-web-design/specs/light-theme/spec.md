# Spec Delta

## Purpose

Make a light appearance the default look of the shell, with off-white and white surfaces, dark text, light borders, and one accent for selection, focus, and initials.

## ADDED Requirements

### Requirement: Light theme is the default
The app SHALL use the light theme when it first loads. The user SHALL NOT need to choose a theme to see it.

#### Scenario: First load uses the light theme
- **WHEN** the user opens the app
- **THEN** the shell is shown in the light theme without a theme choice

### Requirement: Light surfaces and text
The page background SHALL be slightly off-white. The sidebar, header, and body panel SHALL be white. Primary text SHALL be near-black. Secondary labels SHALL be a muted gray. Borders SHALL be a light gray.

#### Scenario: Shell colors stay light
- **WHEN** the user views the shell
- **THEN** the page background is slightly off-white
- **THEN** the sidebar, header, and body panel are white
- **THEN** primary text is near-black and secondary labels are muted gray
- **THEN** visible borders are light gray

### Requirement: Single accent
The selected navigation item, keyboard focus rings, and the fallback behind profile initials SHALL use the same accent color.

#### Scenario: Accent marks selection, focus, and initials
- **WHEN** a navigation item is selected
- **THEN** that item uses the accent color
- **WHEN** a control in the shell has keyboard focus
- **THEN** its focus ring uses the same accent color
- **WHEN** a profile control shows initials
- **THEN** the circle behind those initials uses the same accent color
