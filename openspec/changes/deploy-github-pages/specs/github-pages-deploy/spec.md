# Spec Delta

## Purpose

Publish the production build of the static app to GitHub Pages when main is updated or an operator starts the workflow by hand.

## ADDED Requirements

### Requirement: Publish on updates to main
The pipeline SHALL publish a production build to GitHub Pages when commits are pushed to the main branch. Pushes to any other branch SHALL NOT publish a new build.

#### Scenario: Push to main
- **WHEN** a commit is pushed to the main branch
- **THEN** a production build of that commit is published to GitHub Pages

#### Scenario: Push to another branch
- **WHEN** a commit is pushed to a branch other than main
- **THEN** GitHub Pages is not updated by this pipeline

### Requirement: Publish on manual run
An operator SHALL be able to start the same pipeline manually. A manual run SHALL publish a production build of the selected revision to GitHub Pages.

#### Scenario: Manual run
- **WHEN** an operator starts the deployment workflow manually
- **THEN** a production build of the selected revision is published to GitHub Pages

### Requirement: Publish the static production build
The pipeline SHALL install dependencies from the lockfile in the repository and SHALL publish the static files produced by the project's existing production build. It SHALL NOT commit that build output to the repository, and it SHALL NOT publish from a separate gh-pages branch.

#### Scenario: Successful publish
- **WHEN** a publish completes successfully
- **THEN** GitHub Pages serves the static files from that production build
- **THEN** those files are not committed to the repository

### Requirement: Failed build leaves the live site unchanged
The pipeline SHALL leave the current GitHub Pages site in place when the production build fails.

#### Scenario: Build fails
- **WHEN** a publish is triggered
- **AND** the production build fails
- **THEN** the GitHub Pages site continues to serve the last successful publish

### Requirement: Tests gate publish only when they exist
When the project defines an automated test command, the pipeline SHALL run it before publishing and SHALL publish only if it passes. When the project defines no test command, the pipeline SHALL still publish and SHALL NOT add a test suite.

#### Scenario: No test command
- **WHEN** the project has no test command
- **AND** a publish is triggered
- **THEN** the production build is published
- **THEN** no test suite is added to the project

#### Scenario: Tests fail
- **WHEN** the project has a test command
- **AND** that command fails
- **THEN** the production build is not published

#### Scenario: Tests pass
- **WHEN** the project has a test command
- **AND** that command passes
- **THEN** the production build is published

### Requirement: Pages deployment constraints
The pipeline SHALL run on GitHub Actions and SHALL deploy through the GitHub Pages environment. It SHALL be allowed to read repository contents, write to GitHub Pages, and write the identity token Pages requires. It SHALL NOT be granted write access to repository contents. The pipeline SHALL NOT depend on Azure, AWS, or Terraform.

#### Scenario: Deployment uses GitHub Pages
- **WHEN** a publish runs
- **THEN** GitHub Actions builds the app and deploys it to the GitHub Pages environment
- **THEN** the workflow can read contents, write Pages, and write the Pages identity token
- **THEN** the workflow cannot write repository contents
- **THEN** the publish does not use Azure, AWS, or Terraform
