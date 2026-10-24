# Spec Delta

## Purpose

Make Home the first screen, with a short welcome and the product description inside a padded panel instead of content running to the edges.

## ADDED Requirements

### Requirement: Home is the first screen
The app SHALL open on the Home screen.

#### Scenario: Initial screen
- **WHEN** the user opens the app
- **THEN** the body shows the Home screen

### Requirement: Home empty state
The Home screen SHALL show a short welcome line and the product's one-line description. That content SHALL sit in a padded panel with a light surface, inset from the edges of the body.

#### Scenario: Empty state copy is inset
- **WHEN** the user is on the Home screen
- **THEN** the body shows a welcome line and the product's one-line description
- **THEN** that content is inside a padded panel
- **THEN** the panel does not run edge to edge in the body
