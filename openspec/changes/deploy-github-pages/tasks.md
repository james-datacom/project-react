# Tasks

## 1. Production base and routing

- [x] 1.1 In `vite.config.ts`, set Vite `base` to `/project-react/` for the build command and `/` for the dev server, and verify `npm run build` emits asset URLs under `/project-react/` in `dist/index.html`
- [x] 1.2 Copy `index.html` to `404.html` inside `dist` as part of `vite build`, and verify `dist/404.html` matches `dist/index.html` after `npm run build`
- [x] 1.3 Set the existing `BrowserRouter` basename from `import.meta.env.BASE_URL` with the trailing slash removed, leave routes and screens unchanged, and verify `src/main.tsx` still uses `BrowserRouter` and does not use `HashRouter`

## 2. GitHub Actions

- [x] 2.1 Add `.github/workflows/deploy.yml` that runs on push to `main` and on `workflow_dispatch`, with permissions `contents: read`, `pages: write`, and `id-token: write`, and concurrency group `pages` with `cancel-in-progress: false`, and verify pushes to other branches are not triggers and the workflow does not grant `contents: write`
- [x] 2.2 In the build job, use `actions/checkout@v6`, `actions/setup-node` on Node 24 pinned to the current major of that action, `actions/configure-pages@v5`, `npm ci`, `npm test --if-present`, `npm run build`, and `actions/upload-pages-artifact@v4` with path `dist`, and verify `package.json` has no new test script
- [x] 2.3 Add a deploy job that needs the build job, uses the `github-pages` environment, and deploys with `actions/deploy-pages@v4`, and verify the workflow does not commit `dist`, does not create a `gh-pages` branch, and does not reference Azure, AWS, or Terraform

## 3. Docs and ignore rules

- [x] 3.1 Add `.env` to `.gitignore` without adding `build/`, and verify `git check-ignore` matches `.env`, `.env.local`, `node_modules`, and `dist`
- [x] 3.2 Replace the Vite template `README.md` with local run (`npm install`, `npm run dev`), local build and preview, what the workflow does, what a merge to `main` does, Node 24, the manual Pages source setting, and `https://james-datacom.github.io/project-react/`, and verify those points are in the README

## 4. Local check

- [x] 4.1 Run `npm run preview` after a production build and verify the home screen loads under `/project-react/` on the preview origin, `/project-react/settings` renders Settings at that path URL, and the dev server config still uses base `/`
