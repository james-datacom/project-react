# Tasks

## 1. Local Terraform stack

- [ ] 1.1 Add `terraform/main.tf` with `required_version` `1.17.0`, `hashicorp/local` `2.9.1` and `hashicorp/random` `3.9.1`, empty `provider` blocks, `random_id.project` with `byte_length = 4`, and `local_file.project` writing `terraform/generated-project.txt` with the project name, environment, hex identifier, and a sentence that Terraform generated the file. Comment the provider blocks, both resources, and local state (`terraform.tfstate` records the id and the file and is not committed). Do not add a `backend` block or any cloud provider. Verify the file contains those blocks and comments and does not mention Azure, AWS, or GCP.
- [ ] 1.2 Add `terraform/variables.tf` with `project_name` defaulting to `react-app` and `environment` defaulting to `development`, each with a description and a comment on what a default does when no `.tfvars` file is present. Verify both variables and those defaults are in the file.
- [ ] 1.3 Add `terraform/outputs.tf` with outputs for the project name, the environment, and `random_id.project.hex`, and a comment on each output. Verify the three outputs are in the file.
- [ ] 1.4 Add `terraform/terraform.tfvars.example` setting `project_name` and `environment` to those defaults, with a comment that copying it to `terraform.tfvars` is optional. Verify the example documents both names.

## 2. Git ignore

- [ ] 2.1 Append `.terraform/`, `*.tfstate`, `*.tfstate.*`, `*.tfvars`, and `terraform/generated-project.txt` to the root `.gitignore`. Do not ignore `.terraform.lock.hcl`. Verify `git check-ignore` matches `.terraform/`, a `*.tfstate` path, a `*.tfstate.*` path, a `*.tfvars` path, and `terraform/generated-project.txt`, and does not match `terraform/.terraform.lock.hcl` or `terraform/terraform.tfvars.example`.

## 3. GitHub Actions

- [ ] 3.1 Add `.github/workflows/terraform.yml` with one `terraform` job on `ubuntu-latest`, `contents: read`, and `defaults.run.working-directory: terraform`. Trigger it on pull requests targeting `main`, pushes to `main`, and `workflow_dispatch`, and on no other events. Steps, in order: `actions/checkout@v6`, `hashicorp/setup-terraform@v4` with `terraform_version: 1.17.0`, `terraform fmt -check`, `terraform init`, `terraform validate`, `terraform plan`, and `terraform apply -auto-approve` only when `github.event_name == 'workflow_dispatch'`. Do not add a remote backend, cloud credentials, a concurrency group, or an `id-token` permission. Verify the workflow file contains those triggers, the ordered steps, and the apply condition, and does not run `npm` or deploy Pages.
- [ ] 3.2 Leave `.github/workflows/deploy.yml` and the React application source unchanged. Verify `git diff` for `deploy.yml` and `src/` is empty.

## 4. Local check

- [ ] 4.1 In `/terraform`, run `terraform fmt -check`, `terraform init`, and `terraform validate`. Verify all three succeed and `terraform/.terraform.lock.hcl` exists.
- [ ] 4.2 Run `terraform apply -auto-approve` with no `.tfvars` file. Verify `terraform/generated-project.txt` contains project name `react-app`, environment `development`, an identifier, and a sentence that Terraform generated the file, and that the apply outputs show those same three values.
- [ ] 4.3 Run `terraform apply -auto-approve` with `project_name` and `environment` overridden. Verify the generated file and the outputs use the overridden values.
- [ ] 4.4 In the implementation summary, explain each new file, what a push, a pull request, and a manual workflow run do, where state lives on a GitHub-hosted runner, why local-provider resources disappear with that runner, and how this stack could later use Azure. Verify the summary includes each of those points and does not add Azure, a backend, or a README to the repo.
