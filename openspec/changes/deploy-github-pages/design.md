# Design

## Context

The app is a static Vite client. `npm run build` is `tsc -b && vite build`, and Vite writes `dist`. `vite.config.ts` does not set `base`, so a production build requests assets from the domain root. `src/main.tsx` mounts `BrowserRouter` with no basename. There is no test script, no workflow, and no Node version pin. `package-lock.json` is the lockfile. Vite 8.3.5 requires Node `^20.19.0 || >=22.12.0`, and `@types/node` is already `24.19.2`. `origin` is `james-datacom/project-react`. See proposal.md for why this is GitHub Pages, and the delta specs for the publish and hosted-site behavior.

## Goals / Non-Goals

**Goals:**

- One workflow builds with the existing command and deploys `dist` through GitHub's Pages actions.
- A local production build uses the same `/project-react/` asset prefix the hosted site uses.
- Direct loads and refreshes of client routes render the app at the path URL.
- The README states the local commands, the pipeline, the hosted URL, and the one repository setting that cannot be committed.

**Non-Goals:**

- A test suite, a lint step, or an `engines` field.
- Hash URLs, a `gh-pages` branch, or committing `dist`.
- Changing screens, navigation, or theme.

## Decisions

### Two-job Pages workflow

Add `.github/workflows/deploy.yml`. It runs on `push` to `main` and on `workflow_dispatch`. Workflow permissions are `contents: read`, `pages: write`, and `id-token: write`.

The `build` job checks out the repo, sets up Node, runs `actions/configure-pages@v5`, installs with `npm ci`, runs `npm test --if-present`, runs `npm run build`, and uploads `dist` with `actions/upload-pages-artifact@v4`. The `deploy` job needs `build`, uses the `github-pages` environment, and deploys that artifact with `actions/deploy-pages@v4`. Checkout is `actions/checkout@v6`. Those Pages action majors are the ones in GitHub's custom workflow documentation for a separate build and deploy. `configure-pages` is included because that documentation places it before the build. Its `base_path` output is not used. See the base-path decision below.

`npm test --if-present` exits successfully when `package.json` has no test script, and fails the build job when a test script exists and fails. No test script is added. Because `deploy` needs `build`, a failed test or build never calls `deploy-pages`, so the last successful Pages deployment stays in place.

Node is 24, via `actions/setup-node` with npm caching. Vite's engine range allows it, and the repo already depends on `@types/node` 24. The workflow pins the major, not a patch. Pin `actions/setup-node` to the major published as current on that action when the workflow file is written. This design does not guess that major: the Pages actions above were confirmed from GitHub's docs, and `setup-node` was not in that example.

Concurrency group `pages` with `cancel-in-progress: false` matches GitHub's static Pages template, so a production deploy already in progress is not cancelled.

A single job was rejected because a failed build must not deploy. `npm install` was rejected because the spec requires the lockfile. A third-party Pages action and a `gh-pages` branch were rejected because the deploy job must use GitHub's Pages actions and must not commit the build.

### Production base path is the repository name

For the Vite `build` command, set `base` to `/project-react/`. Leave `base` as `/` for the dev server, so `npm run dev` stays at the local root. The prefix is the repository name on `origin`, with the trailing slash Vite requires. It is written in `vite.config.ts` so `npm run build` on a laptop matches CI. Reading `base_path` only from `configure-pages` was rejected because a local build would otherwise keep `/` and the hosted assets would 404.

`npm run preview` serves that build under `/project-react/` on the preview origin. Preview still has Vite's own SPA fallback, so it does not reproduce the Pages 404 behavior below.

### Keep BrowserRouter and add a Pages fallback

Pass `basename` from `import.meta.env.BASE_URL`, with Vite's trailing slash removed. When the base is `/`, the basename is `/`. When the base is `/project-react/`, the basename is `/project-react`. No other router change. Routes, screens, and the unknown-path redirect stay as they are.

GitHub Pages has no SPA fallback. A request for `/project-react/settings` does not map to a file, so Pages would show its own 404 and the app would never start. The production build copies `index.html` to `404.html` in `dist`. Pages then serves that file for an unknown path and leaves the browser address unchanged. `BrowserRouter` reads the path and renders the route. The copy runs inside `vite build`, so the artifact and a local `dist` both contain it.

`HashRouter` was rejected because the pages-site spec requires the address to stay a path URL. A 404 page that redirects to `index.html` and rewrites the path was rejected for the same reason: the address would not remain the route the visitor opened.

### Docs and ignore rules

Replace the Vite template `README.md` with the local run command (`npm install`, `npm run dev`), the local build and preview commands, what the workflow does, what a merge to `main` does, the manual Pages source setting, and the site URL `https://james-datacom.github.io/project-react/`. State that preview and the hosted site are under `/project-react/`, and that Node 24 is what CI uses.

Add `.env` to `.gitignore`. `node_modules`, `dist`, and `*.local` are already ignored, and `*.local` covers `.env.local`. Do not add `build/`.

## Risks / Trade-offs

- [Deep links are HTTP 404 even though the app renders] → `404.html` is the built app, so the screen still loads and the path stays. Uptime checks that require HTTP 200 will report those routes as missing. Accepted, because a hash URL would break the spec.
- [A manual run can publish a branch other than main] → The spec requires the selected revision to publish. The README says so. No environment rule is added that would block that.
- [Renaming the repository breaks asset URLs] → The base path is the current repository name, documented beside the config and in the README. A rename has to change that value and the pages-site spec together.
- [Node 24 can move forward inside the major] → `npm ci` still installs the lockfile. The major stays inside Vite's engine range and matches `@types/node`.
- [There are no tests, so a UI break can still publish] → The workflow already runs `npm test --if-present`. This change does not invent a suite.

## Migration Plan

1. Add the workflow, the Vite base and `404.html` copy, the router basename, the `.env` ignore rule, and the README.
2. In the repository on GitHub, set Settings → Pages → Build and deployment → Source to GitHub Actions. That setting is not stored in the repo. The first deploy creates the `github-pages` environment.
3. Push to `main`, or run the workflow manually. A successful deploy publishes `https://james-datacom.github.io/project-react/`.
4. To roll back, revert the commit on `main` or re-run the workflow from an earlier commit. A failed build does not replace the current site. The first deploy has no previous site to keep.

## Open Questions

None. The Node major and the Pages actions are decided above. The only step outside the repo is switching the Pages source to GitHub Actions.
