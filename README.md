# StepViz

Paste a Python, JavaScript, Java, C++ or C program and watch it run one step at a time: the running line,
variables, call stack and output, each step explained in plain English with a
real-life comparison.

Phase 1 and part of Phase 2 of the product described in `StepViz_Build_Spec.pdf`. Everything runs in the
browser: Python runs in [Pyodide](https://pyodide.org) and JavaScript is instrumented
with [Acorn](https://github.com/acornjs/acorn), each inside a Web Worker with no network
access. There is no backend.

## Requirements

- Node.js 20 or newer (developed with Node 24) and npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173/).

`npm run dev` and `npm run build` first copy the Pyodide runtime and the
tree-sitter files from `node_modules` into `public/pyodide/` and
`public/tree-sitter/` (git-ignored), so they are served from the app's own site.

To try the production build locally:

```bash
npm run build
npm run preview
```

## Test

```bash
npx playwright install chromium   # once
npm test
```

`npm test` builds the app, serves it on port 4317 and runs:

- `tests/tracer.spec.ts`: the Python tracer under Node (valid factorial trace, caps,
  syntax and runtime errors, blocked imports, `input()`, fixtures match the live tracer)
- `tests/jstracer.spec.ts`: the JavaScript tracer under Node (same checks)
- `tests/acceptance.spec.ts`: the 16-point acceptance checklist from section 9 of the
  spec, plus crash, `input()`, Beginner mode, keyboard and example checks
- `tests/screen3.spec.ts`: the loops and lists view (Screen 3)
- `tests/javascript.spec.ts`: JavaScript in the app (examples, errors, locked-down worker)
- `tests/explainer.spec.ts`: step kinds and the rule-based explainer
- `tests/java.spec.ts`: the Java interpreter under Node; `tests/java-worker.spec.ts`:
  the built Java worker in a browser; `tests/java-app.spec.ts`: Java in the app
- `tests/cpp.spec.ts`: the C++ interpreter under Node; `tests/cpp-app.spec.ts`: C++ in the app
- `tests/c.spec.ts`: C mode under Node; `tests/c-app.spec.ts`: C in the app
- `tests/switch.spec.ts`: switch in JavaScript, Java, C++ and C

Run one file or one test:

```bash
npx playwright test tests/acceptance.spec.ts
npx playwright test -g "Play moves one step"
```

## Deploy to GitHub Pages

The build is a static site with relative paths, so it works at
`https://<user>.github.io/<repo>/` without any configuration.

### Option A: GitHub Actions (included)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

1. In the repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow from the **Actions** tab).
4. The site URL appears in the workflow run and in **Settings → Pages**.

### Option B: by hand

```bash
npm run build
npx gh-pages -d dist      # pushes dist/ to the gh-pages branch
```

Then in **Settings → Pages**, set the source to the `gh-pages` branch, folder `/ (root)`.

## Project layout

```
src/
  screens/Home/        Screen 1 (and its phone layout)
  screens/Step/        Screen 2 and Screen 4 (phone)
  runner/              Web Worker, Python tracer (tracer.py), watchdog
  trace/               trace JSON types, explanations, getTrace()
  examples/            example programs and hand-written traces
  hooks/               playback, Beginner mode, media query
  styles/tokens.css    design tokens (spec section 5)
tests/                 Playwright tests
scripts/               Pyodide copy step, screenshot helpers
```
