# Project React

Static React application. GitHub Actions builds it, and GitHub Pages hosts the result. There is no backend.

The hosted site is [https://james-datacom.github.io/project-react/](https://james-datacom.github.io/project-react/).

CI uses Node.js 24. Vite 8 accepts that version, and it matches the `@types/node` dependency in this repo.

## Run locally

```bash
npm install
npm run dev
```

The dev server uses the site root, `/`, not the GitHub Pages path.

## Build locally

```bash
npm run build
npm run preview
```

`npm run build` typechecks the project and runs Vite. The production build writes `dist` and copies `index.html` to `404.html` so GitHub Pages can open a client route directly. Asset URLs use `/project-react/`.

`npm run preview` serves that build at `http://localhost:4173/project-react/`. Open a route such as `http://localhost:4173/project-react/settings` and the address stays a path URL.

## Deploy

`.github/workflows/deploy.yml` deploys the app.

- A push to `main` starts the workflow. Pushes to other branches do not.
- An operator can also run it manually from the Actions tab. A manual run publishes the revision that was selected, which can be a branch other than `main`.
- The build job checks out the repo, installs dependencies with `npm ci`, runs `npm test` only when a test script exists, then runs `npm run build`.
- The deploy job publishes the `dist` artifact to the `github-pages` environment. It does not commit the build or use a `gh-pages` branch.
- If the tests or the build fail, the deploy job does not run, and the current Pages site stays as it is.

Merging code into `main` pushes that commit and starts this workflow. When the deploy job succeeds, GitHub Pages serves the new build at the URL above.

Before the first deploy, set the repository's Pages source to GitHub Actions:

1. Open the repository on GitHub.
2. Go to Settings, then Pages.
3. Under Build and deployment, set Source to GitHub Actions.

That setting is not stored in this repository. The first successful deploy creates the `github-pages` environment.
