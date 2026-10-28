# An output is a value Terraform prints after apply.

output "project_name" {
  description = "Project name used for this apply."
  value       = var.project_name
}

output "environment" {
  description = "Environment used for this apply."
  value       = var.environment
}

output "project_identifier" {
  description = "Random project identifier saved in state."
  value       = random_id.project.hex
}
