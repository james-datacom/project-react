# Proposal

## Why

The React app is already published with GitHub Pages, and there is no place in this repo to practice Infrastructure as Code. Terraform plus a separate GitHub Actions workflow can teach that workflow now, using only free local providers, without an Azure subscription and without changing how the app is built or deployed.

## What Changes

- Add a `/terraform` configuration that uses only `hashicorp/local` and `hashicorp/random`. It generates a random project identifier and writes a local file containing the project name, environment, that identifier, and a short note that Terraform created the file.
- Expose `project_name` and `environment` as variables, with defaults `react-app` and `development`, and output the project name, environment, and random identifier.
- Ignore Terraform working directories, state files, and `*.tfvars`. Keep `.terraform.lock.hcl` committable.
- Add a separate GitHub Actions workflow that runs `terraform fmt -check`, `init`, `validate`, and `plan` from `/terraform` on pull requests to `main`, pushes to `main`, and manual dispatch.
- Run `terraform apply -auto-approve` only when the workflow is started manually. Do not apply on pull requests or on pushes to `main`.
- Leave the existing React app and the GitHub Pages workflow unchanged. Do not add Azure, AWS, GCP, Docker, databases, or other backends.
- Keep the Terraform files commented for a beginner: provider, resource, variable, output, and state. After implementation, explain each new file, what a push, pull request, and manual run do, where state lives on a GitHub-hosted runner, why local-provider resources disappear with that runner, and how this could later move to Azure.

## Capabilities

### New Capabilities

- `terraform-local-stack`: A beginner Terraform stack limited to the local and random providers, with project variables, a generated local file, outputs, and git rules that ignore state while keeping the lock file.
- `terraform-ci`: A GitHub Actions workflow, separate from GitHub Pages, that checks and plans Terraform on pull requests and pushes to `main`, and applies only on manual dispatch.

### Modified Capabilities

None. `openspec list --specs` is empty. The GitHub Pages behavior lives on the `deploy-github-pages` change and its requirements stay as they are.

## Impact

- Adds `/terraform` (`main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars.example`) and `.github/workflows/terraform.yml`. Updates the root `.gitignore` for Terraform state and variable files only.
- Does not edit `.github/workflows/deploy.yml` or the React application. Pages continues to build and deploy on its own workflow.
- New Actions dependency: `hashicorp/setup-terraform`, plus `actions/checkout`. No cloud credentials and no remote state backend.
- Apply on a GitHub-hosted runner uses local state for that job only. Resources from the local provider are not kept after the runner is discarded.
