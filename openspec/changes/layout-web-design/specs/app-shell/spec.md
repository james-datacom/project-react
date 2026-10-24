# Spec Delta

## Purpose

Give every screen one shared shell: a left sidebar, a header, and a body that fills the remaining space, with fixed chrome and a sidebar that collapses on a narrow screen.

## ADDED Requirements

### Requirement: Shell regions
The app SHALL present three regions at once: a sidebar on the left, a header across the top of the content area, and a body that fills the remaining space.

#### Scenario: Regions are visible on a wide screen
- **WHEN** the user opens the app on a viewport wide enough to show the sidebar beside the content
- **THEN** the sidebar is on the left
- **THEN** the header spans the top of the content area
- **THEN** the body occupies the space below the header and to the right of the sidebar

### Requirement: Fixed chrome while the body scrolls
The sidebar and the header SHALL stay in place while the user scrolls content in the body.

#### Scenario: Body content scrolls independently
- **WHEN** the body content is taller than the visible body region and the user scrolls it
- **THEN** the body content moves
- **THEN** the sidebar and the header remain in place

### Requirement: Narrow-screen sidebar
On a viewport too narrow to show the sidebar beside the content, the sidebar SHALL be hidden until the user opens it from a menu button in the header. The user SHALL be able to hide it again.

#### Scenario: Sidebar starts hidden on a narrow screen
- **WHEN** the user opens the app on a narrow viewport
- **THEN** the header shows a menu button
- **THEN** the sidebar is not visible beside the body

#### Scenario: Menu button reveals and hides the sidebar
- **WHEN** the user activates the header menu button on a narrow viewport
- **THEN** the sidebar becomes visible
- **WHEN** the user hides the sidebar again
- **THEN** the sidebar is no longer visible and the body remains available
