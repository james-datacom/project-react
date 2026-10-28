# A variable is an input to this configuration.

# This default is used when project_name is omitted and no .tfvars file sets it.
variable "project_name" {
  description = "Name written into the generated project file."
  type        = string
  default     = "react-app"
}

# This default is used when environment is omitted and no .tfvars file sets it.
variable "environment" {
  description = "Environment written into the generated project file."
  type        = string
  default     = "development"
}
