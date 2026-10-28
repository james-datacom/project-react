# Design

## Context

The React app deploys from `.github/workflows/deploy.yml` on pushes to `main` and on manual dispatch. That workflow checks out with `actions/checkout@v6`, builds with npm, and publishes GitHub Pages. The root `.gitignore` has no Terraform entries. There is no `/terraform` directory and no remote state. See proposal.md for why this stays a learning stack, and the `terraform-local-stack` and `terraform-ci` deltas for the required behavior.

## Goals / Non-Goals

**Goals:**

- One root module under `/terraform` that a beginner can read, init, validate, plan, and apply with no cloud account.
- One Actions workflow that checks and plans that module, and applies only on `workflow_dispatch`.
- The Pages workflow and the React source stay byte-for-byte as they are.

**Non-Goals:**

- Modules, a remote backend, workspaces, or a saved plan file passed between jobs.
- An Azure provider, credentials, or a sketch of Azure resources in the configuration.
- A new README. Beginner explanations live in comments in the Terraform files. The implementation summary covers runner state and a later move to Azure.

## Decisions

### One root module, local state

Add these files:

- `terraform/main.tf` — `terraform` block, both providers, `random_id`, and `local_file`
- `terraform/variables.tf` — `project_name` and `environment`
- `terraform/outputs.tf` — project name, environment, and the random identifier
- `terraform/terraform.tfvars.example` — the same two variables set to the defaults, with a comment that copying it to `terraform.tfvars` is optional

Do not add a `backend` block. Terraform then keeps state in `terraform/terraform.tfstate` on the machine that ran the command. `required_version` is `1.17.0`, the current Terraform release. `required_providers` pins `hashicorp/local` `2.9.1` and `hashicorp/random` `3.9.1`. Empty `provider "local"` and `provider "random"` blocks are enough; neither provider needs credentials.

A child module was rejected because there is one file and two resources. A remote backend was rejected because the spec forbids one and there is no cloud account to host it.

### What apply creates

`random_id.project` uses `byte_length = 4`. The identifier exposed to the file and to outputs is `random_id.project.hex`.

`local_file.project` writes `terraform/generated-project.txt`. The content is four plain-text lines: project name, environment, the hex identifier, and a sentence that Terraform generated the file. Values come from `var.project_name`, `var.environment`, and the random id.

`project_name` defaults to `react-app`. `environment` defaults to `development`. Both variables have a `description`. Outputs pass those two variables through and pass the hex identifier through. Apply with no `.tfvars` file uses the defaults.

`random_pet` was rejected because the story asks for an identifier, and `random_id.hex` is a stable value once state exists. JSON content was rejected because the file is for a person to open.

### Comments a beginner can follow

Comments in the Terraform files name the idea and the block it sits on:

- provider: the `required_providers` and `provider` blocks, including that these two talk to the local machine only
- resource: `random_id` and `local_file`
- variable: both variable blocks, including what a default does when no `.tfvars` file is present
- output: the three output blocks
- state: a comment in `main.tf` that state is the local `terraform.tfstate` file, that it records the random id and the file, and that it is not committed

### Git ignore

Append these patterns to the root `.gitignore`:

```
.terraform/
*.tfstate
*.tfstate.*
*.tfvars
terraform/generated-project.txt
```

`*.tfvars` does not match `terraform.tfvars.example`, so the example stays committable. `.terraform.lock.hcl` is not listed, so it stays committable. After `terraform init`, commit `terraform/.terraform.lock.hcl`.

The generated file is ignored as well as the patterns the story names. It is apply output tied to local state. Committing it would record an id the next machine, with a new empty state, will not reproduce. Ignoring the lock file was rejected because the spec requires it to be committable.

### A second workflow, one job

Add `.github/workflows/terraform.yml`. Leave `deploy.yml` unchanged.

The workflow runs on `pull_request` to `main`, `push` to `main`, and `workflow_dispatch`. Permissions are `contents: read`. One job, `terraform`, uses `ubuntu-latest` and `defaults.run.working-directory: terraform`.

Steps, in order:

1. `actions/checkout@v6` (the same major `deploy.yml` uses)
2. `hashicorp/setup-terraform@v4` with `terraform_version: 1.17.0`
3. `terraform fmt -check`
4. `terraform init`
5. `terraform validate`
6. `terraform plan`
7. `terraform apply -auto-approve` with `if: github.event_name == 'workflow_dispatch'`

`v4` is the current major of setup-terraform (v4.0.1). Pinning Terraform `1.17.0` in both the workflow and `required_version` keeps a laptop and Actions on the same CLI. Floating `latest` was rejected because a later CLI could fail `required_version` or format the files differently.

Apply is a later step in the same job, not a second job. On a manual run, plan and apply share the state that `init` just created in that job. On a pull request or a push, the apply step is skipped. A saved plan file was rejected: nothing persists between runs, so a plan artifact from a pull request cannot be applied later.

No concurrency group. Two runs do not share state. No cloud secrets and no `id-token` permission.

### What a later Azure subscription would replace

This design does not add Azure. The swap, when a subscription exists, is local to the module and the workflow gate can stay:

- Replace `hashicorp/local` and `hashicorp/random` with `hashicorp/azurerm` (or keep `random` if an id is still useful).
- Replace `local_file` with an Azure resource, and add a remote backend so state survives the runner.
- Give the manual apply step a credential. Keep apply on `workflow_dispatch` only.

The Pages workflow stays a separate file either way.

## Risks / Trade-offs

- [State on a GitHub-hosted runner lasts for that job only] → Accepted. Plan still shows the diff. Apply on a manual run creates `generated-project.txt` and `terraform.tfstate` on the runner, then the runner is destroyed and both disappear. The next run starts from empty state, so the random id changes every manual apply.
- [A local apply writes a file and a state file on the laptop] → State and `*.tfvars` are ignored. The generated file is ignored. The lock file is the piece to commit.
- [`terraform plan` and `terraform apply` can diverge] → They run in one job, back to back, for a module with no outside API. A saved plan is extra machinery for no shared state.
- [Terraform 1.17.0 is a new minor] → The learning module uses `random_id` and `local_file` only. The pin is exact, so a later release does not enter CI until someone bumps it in both places.
- [Someone runs apply from a pull-request workflow by editing the `if`] → The condition is the only gate. The design does not add environment protection rules.

## Migration Plan

1. Add `/terraform`, the workflow, and the `.gitignore` lines. Do not edit `deploy.yml` or the React app.
2. Run `terraform fmt` and `terraform init` in `/terraform`. Commit `.terraform.lock.hcl` with the new files.
3. A pull request runs format, init, validate, and plan. A push to `main` does the same. Apply runs when someone starts the Terraform workflow from the Actions tab.
4. Rollback is deleting `/terraform`, `.github/workflows/terraform.yml`, and the new `.gitignore` lines. The Pages workflow is untouched, so the live site does not need a redeploy.

## Open Questions

None. Provider versions, the Terraform pin, the generated filename, and the apply condition are decided above.
