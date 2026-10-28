# Spec Delta

## Purpose

Check and plan the Terraform stack in GitHub Actions without changing the GitHub Pages deploy, and apply only when someone starts the workflow by hand.

## ADDED Requirements

### Requirement: Separate Terraform workflow
A Terraform workflow SHALL run in GitHub Actions, apart from the GitHub Pages deployment. Adding it SHALL NOT replace or modify the existing Pages workflow. Terraform checks SHALL NOT run inside the Pages workflow, and the Pages build SHALL NOT run inside the Terraform workflow.

#### Scenario: Pages workflow is left in place
- **WHEN** the Terraform workflow is added
- **THEN** the existing GitHub Pages workflow file is unchanged
- **THEN** a Pages deployment does not run Terraform
- **THEN** a Terraform run does not build or deploy the React app

### Requirement: When the workflow runs
The workflow SHALL run for pull requests that target `main`, for pushes to `main`, and for manual `workflow_dispatch`. It SHALL NOT run for other events.

#### Scenario: Pull request to main
- **WHEN** a pull request targets `main`
- **THEN** the Terraform workflow runs

#### Scenario: Push to main
- **WHEN** commits are pushed to `main`
- **THEN** the Terraform workflow runs

#### Scenario: Manual start
- **WHEN** an operator starts the workflow with `workflow_dispatch`
- **THEN** the Terraform workflow runs

#### Scenario: Other events
- **WHEN** the event is not a pull request targeting `main`, a push to `main`, or a manual dispatch
- **THEN** this workflow does not run

### Requirement: Check and plan on every run
Every run SHALL check out the repository, set up Terraform, and execute `terraform fmt -check`, `terraform init`, `terraform validate`, and `terraform plan` with `/terraform` as the working directory. The workflow SHALL use `actions/checkout` and `hashicorp/setup-terraform`.

#### Scenario: Valid configuration
- **WHEN** the workflow runs
- **AND** the Terraform files are formatted and valid
- **THEN** `terraform fmt -check`, `terraform init`, `terraform validate`, and `terraform plan` succeed
- **THEN** those commands run in `/terraform`

#### Scenario: Unformatted files
- **WHEN** the Terraform files are not formatted
- **THEN** `terraform fmt -check` fails
- **THEN** the workflow fails

### Requirement: Apply only on manual dispatch
The workflow SHALL run `terraform apply -auto-approve` only when that run was started with `workflow_dispatch`. It SHALL NOT apply on a pull request or on a push. Apply SHALL be a separate step from format, init, validate, and plan.

#### Scenario: Manual apply
- **WHEN** the workflow is started with `workflow_dispatch`
- **AND** format, init, validate, and plan succeed
- **THEN** `terraform apply -auto-approve` runs in `/terraform`

#### Scenario: Pull request does not apply
- **WHEN** the workflow runs because of a pull request
- **THEN** `terraform apply` does not run

#### Scenario: Push does not apply
- **WHEN** the workflow runs because of a push to `main`
- **THEN** `terraform apply` does not run

### Requirement: No cloud account
The workflow SHALL NOT require Azure, AWS, or GCP credentials, and it SHALL NOT configure a remote state backend. State for a run SHALL exist only on that job's runner.

#### Scenario: Run without cloud credentials
- **WHEN** the workflow runs in a repository with no cloud credentials
- **THEN** format, init, validate, and plan can complete
- **THEN** a manual apply can complete
- **THEN** no remote state backend is configured
