I have an existing React web application in this GitHub repository.

The application is completely static:
- React frontend only
- No backend
- No API server
- No database

I want to host the application using GitHub Pages.

I want to use GitHub Actions as the CI/CD pipeline.

IMPORTANT:
- Do NOT use Azure.
- Do NOT use AWS.
- Do NOT create Terraform.
- Do NOT add unnecessary infrastructure.
- GitHub Pages will host the application.
- GitHub Actions will build and deploy the application.

Before making changes, inspect the existing repository and determine:
- whether the project uses Vite, Create React App, Next.js static export, or another React build system
- which package manager is being used (npm, yarn, or pnpm)
- the correct build command
- the build output directory (for example dist or build)

Then configure the project appropriately.

==================================================
1. GITHUB ACTIONS
==================================================

Create:

.github/workflows/deploy.yml

Configure the workflow to deploy the React application to GitHub Pages.

The workflow should:

1. Trigger on pushes/merges to the main branch.
2. Allow manual execution using workflow_dispatch.
3. Checkout the repository.
4. Set up the correct Node.js version.
5. Install dependencies using the repository's existing package manager.
6. Run the existing tests if tests are configured.
7. Build the React application.
8. Upload the generated static build as a GitHub Pages artifact.
9. Deploy the artifact to GitHub Pages.

Use official GitHub Actions wherever possible.

Use the current recommended GitHub Pages deployment Actions.

==================================================
2. PERMISSIONS
==================================================

Configure the GitHub Actions permissions required by GitHub Pages.

Use:

permissions:
  contents: read
  pages: write
  id-token: write

Use the GitHub Pages environment when deploying:

environment:
  name: github-pages

==================================================
3. REACT CONFIGURATION
==================================================

Inspect the existing React build system before making changes.

If the project uses Vite:
- configure the Vite base path correctly for GitHub Pages
- do not assume the repository name; derive or clearly identify what needs to be configured

If the project uses Create React App:
- configure the appropriate homepage/public URL behavior if required

If React Router is used:
- identify whether BrowserRouter will cause problems when refreshing a route hosted on GitHub Pages
- recommend or configure the appropriate solution, such as HashRouter, if necessary

Do not change the router unless required.

==================================================
4. GITHUB PAGES
==================================================

Configure the project to work with GitHub Pages deployment through GitHub Actions.

Do not use the old approach of manually committing the build output unless required.

Do not create a gh-pages branch unless there is a specific technical reason to do so.

Use GitHub Actions as the deployment source.

==================================================
5. GITIGNORE
==================================================

Inspect and update .gitignore if necessary.

Make sure these are not accidentally committed:

node_modules/
dist/
build/
.env
.env.local

Only add entries that are relevant to the existing project.

==================================================
6. README
==================================================

Update or create documentation explaining:

- how the application is built
- how GitHub Actions deploys the application
- how GitHub Pages hosts the application
- how to run the application locally
- how to build locally
- what happens when code is merged into main

==================================================
7. DO NOT MODIFY UNRELATED CODE
==================================================

Do not restructure the React application.

Do not change application behavior or UI.

Only make changes necessary for:

- build
- GitHub Actions
- GitHub Pages deployment

==================================================
8. FINAL RESPONSE
==================================================

After implementing the changes, show me:

1. Files created
2. Files modified
3. Final folder structure
4. The complete deployment flow
5. Any GitHub repository settings I need to configure manually
6. The expected GitHub Pages URL format
7. How to test the build locally
8. What happens when I merge code into main

Do not invent repository names, URLs, or configuration values.

If something cannot be determined from the repository, clearly tell me what I need to configure.