# Spec Delta

## Purpose

Serve the built app on this repository's GitHub Pages project path so its assets load and a client route still renders when that route is opened or refreshed.

## ADDED Requirements

### Requirement: Host the app on the project site
GitHub Pages SHALL serve the application at `https://james-datacom.github.io/project-react/`. The home screen SHALL render at that address.

#### Scenario: Open the project site
- **WHEN** a visitor opens `https://james-datacom.github.io/project-react/`
- **THEN** the application renders its home screen

### Requirement: Production assets use the project path
The production build SHALL load its scripts and styles from under `/project-react/`. A visitor SHALL receive those assets from the project site rather than from the domain root.

#### Scenario: Assets resolve on the project site
- **WHEN** a visitor opens the hosted application
- **THEN** the page's scripts and styles are requested under `/project-react/`
- **THEN** those assets load successfully

### Requirement: Client routes survive a direct load
Opening or refreshing a client route on the hosted site SHALL render that route in the application. The address SHALL remain a path URL under `https://james-datacom.github.io/project-react/`. The site SHALL NOT switch client routes to hash URLs.

#### Scenario: Open a route directly
- **WHEN** a visitor opens `https://james-datacom.github.io/project-react/settings`
- **THEN** the application renders the Settings screen
- **THEN** the address remains `https://james-datacom.github.io/project-react/settings`

#### Scenario: Refresh a route
- **WHEN** a visitor refreshes `https://james-datacom.github.io/project-react/account`
- **THEN** the application renders the Account screen
- **THEN** the address remains a path URL for that route

### Requirement: Hosting does not change the application
Publishing to GitHub Pages SHALL NOT change the application's screens, navigation, or theme. The hosted site SHALL show the same screens as the local application for the same route.

#### Scenario: Hosted home matches the app
- **WHEN** a visitor opens the hosted home address
- **THEN** the home screen matches the home screen shown by the local application
