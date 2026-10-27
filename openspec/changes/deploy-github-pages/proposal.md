# Proposal

## Why

The app is a static React client, and merging to main does not publish it anywhere. GitHub Pages can host the build and GitHub Actions can produce it, which is enough for this repository. Cloud accounts and Terraform would add infrastructure the app does not have.

## What Changes

- Add a GitHub Actions workflow that checks out the repo, installs dependencies with npm, builds the existing Vite app, uploads the static output, and deploys that artifact to GitHub Pages.
- Run the workflow on pushes to `main` and on manual dispatch. Use the official Pages deployment actions, the `github-pages` environment, and permissions limited to reading contents, writing Pages, and writing the id token.
- Do not add a test suite. The repo has no test script. The workflow runs tests only if one is configured later, and it runs them before the build.
- Set Vite's production base path from this repository so assets resolve on the project site. `origin` is `james-datacom/project-react`, so the Pages path is `/project-react/`.
- Keep `BrowserRouter`. Change the router only if opening or refreshing a client route on Pages cannot load the app. Hash URLs are a last resort because they change published links.
- Document local run, local build, how Actions deploys, how Pages hosts the app, and what a merge to `main` does. Name the Pages URL from `origin`, and call out the repository setting that must be switched to GitHub Actions by hand.
- Ignore `.env` if it is still unignored. `node_modules`, `dist`, and `*.local` (which covers `.env.local`) are already ignored. Do not add a `build/` entry; this app emits `dist`.
- Do not use Azure, AWS, or Terraform. Do not commit build output or create a `gh-pages` branch. Do not change UI or other application behavior.

## Capabilities

### New Capabilities

- `github-pages-deploy`: Publish the production build to GitHub Pages from Actions when `main` is updated or the workflow is run manually, using the Pages permissions and environment.
- `pages-site`: Serve the built app under this repository's GitHub Pages base path so assets load, and so opening or refreshing a client route still renders the app.

### Modified Capabilities

None. The main spec inventory is empty. Layout specs exist only on the in-progress `layout-web-design` change.

## Impact

- Adds a workflow under `.github/workflows/`. Updates `vite.config.ts` and `README.md`, and `.gitignore` only for `.env`. `src/main.tsx` changes only if `BrowserRouter` cannot survive a Pages refresh.
- The app stays React, TypeScript, and Vite. The package manager is npm (`package-lock.json`). The build command is `npm run build` (`tsc -b && vite build`). The output directory is `dist`.
- No Node.js version is pinned: `package.json` has no `engines` field and there is no `.nvmrc`. The design must name the version the workflow uses and why it fits this Vite setup.
- GitHub still needs Pages set to deploy from Actions. That setting is not in the repo. From `origin`, the project site is `https://james-datacom.github.io/project-react/`.
