# Spec Delta

## Purpose

Give this repository a small Terraform stack for learning Infrastructure as Code, using only free local providers and leaving the React app unchanged.

## ADDED Requirements

### Requirement: Local providers only
The stack SHALL live in `/terraform` and SHALL use only the HashiCorp `local` and `random` providers. It SHALL NOT configure Azure, AWS, GCP, or any other cloud provider.

#### Scenario: Init uses free providers
- **WHEN** Terraform is initialized in `/terraform`
- **THEN** the configuration requires the `local` and `random` providers
- **THEN** no cloud provider is configured

### Requirement: Stack files
The stack SHALL include `main.tf`, `variables.tf`, `outputs.tf`, and `terraform.tfvars.example`. The example file SHALL show `project_name` and `environment`. Apply SHALL succeed when no `.tfvars` file is present.

#### Scenario: Example variables are optional
- **WHEN** Terraform is applied in `/terraform` with no `.tfvars` file
- **THEN** apply succeeds using the default variable values
- **THEN** `terraform.tfvars.example` still documents `project_name` and `environment`

### Requirement: Generated project file
The stack SHALL generate a random project identifier and SHALL write a local file that contains the project name, the environment, that identifier, and a message that Terraform generated the file.

#### Scenario: Apply writes the file
- **WHEN** Terraform apply succeeds
- **THEN** a local file exists
- **THEN** that file contains the project name, the environment, the random project identifier, and a message that Terraform generated it

### Requirement: Project variables
The stack SHALL accept `project_name` and `environment`. When they are omitted, `project_name` SHALL default to `react-app` and `environment` SHALL default to `development`.

#### Scenario: Defaults
- **WHEN** apply runs without overriding `project_name` or `environment`
- **THEN** the generated file uses project name `react-app` and environment `development`

#### Scenario: Overrides
- **WHEN** `project_name` and `environment` are set to other values
- **THEN** the generated file uses those values

### Requirement: Stack outputs
The stack SHALL output the project name, the environment, and the random project identifier.

#### Scenario: Apply exposes outputs
- **WHEN** apply completes
- **THEN** the outputs include the project name, the environment, and the random project identifier

### Requirement: Git ignores state and keeps the lock file
The repository SHALL ignore `.terraform/`, `*.tfstate`, `*.tfstate.*`, and `*.tfvars`. It SHALL NOT ignore `.terraform.lock.hcl`.

#### Scenario: Generated Terraform files are ignored
- **WHEN** Terraform creates `.terraform/`, a state file, or a `.tfvars` file
- **THEN** Git ignores those paths

#### Scenario: Lock file can be committed
- **WHEN** `.terraform.lock.hcl` exists
- **THEN** Git does not ignore it

### Requirement: Beginner comments
The Terraform files SHALL include comments that explain provider, resource, variable, output, and Terraform state in this stack.

#### Scenario: A reader opens the configuration
- **WHEN** someone reads the Terraform files
- **THEN** comments explain the provider, resource, variable, output, and Terraform state used here

### Requirement: React app stays unchanged
Adding the stack SHALL NOT require changes to the React application.

#### Scenario: App source is untouched
- **WHEN** the stack is added
- **THEN** the React application source is unchanged
