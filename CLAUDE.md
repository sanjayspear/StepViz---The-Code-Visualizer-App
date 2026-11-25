# StepViz

## The spec is the PDF

`StepViz_Build_Spec.pdf` (project root) is the source of truth. Its screenshots define
layout, copy, colors and spacing; section 5 has the exact design tokens; section 6 has
the exact sample trace and copy; section 9 is the acceptance checklist. Read the
relevant pages before changing any screen. Do not redesign, rename or reword anything.

**Ask before adding anything that is not in the PDF.** If the PDF is unclear or
something is missing, ask; do not guess.

## Scope: Phase 1 only

Build and maintain only:

- Screen 1: Home (paste code, language select, example chips, "Visualize my code")
- Screen 2: Step-through (code panel, call stack, output, explanation, "In real life", controls)
- Screen 4: phone layout of Screen 2 (and Screen 1 at phone width), below 900 px
- Python only, exact trace, run fully in the browser (Pyodide in a Web Worker, `sys.settrace`). No backend.
- Built-in examples: Factorial (section 6 fixture), For loop and Fibonacci (hand-written
  explanations); Bubble sort and pasted code use the generic "Line N runs: ..." explanation.

Not in Phase 1: Screen 3 (loops and arrays), JavaScript tracing, AI explanations,
accounts, share links (the buttons show "Coming soon"), Screen 5.
The UI reads only the trace JSON (section 7, `src/trace/types.ts`) so those can be added later.

## Stack

React + Vite + TypeScript, CodeMirror 6, plain CSS with tokens in `src/styles/tokens.css`,
Google Fonts (Space Grotesk, Inter, JetBrains Mono), Pyodide self-hosted from
`public/pyodide` (copied from `node_modules` by `scripts/copy-pyodide.mjs`),
Playwright tests. Static build for GitHub Pages.

## Rules that must not regress

- Pasted code never runs outside the Web Worker; the worker has no network access
  (APIs removed after Pyodide loads; `js`/`pyodide`/`os`/`importlib` imports blocked).
- Caps: 2,000 steps and 5 s, plus a main-thread watchdog. On a cap, stay on Home with
  "Your program ran for a very long time, so we stopped it. Check that every loop can end."
- Touch targets at least 44 px. Visible 2 px accent focus ring. Frame status always has
  a text label, never color alone.
- Do not store pasted code anywhere. (Only the Beginner mode choice is kept, in localStorage.)

## Decisions agreed with the product owner

- Factorial plays the section 6 fixture only while the editor text is exactly the sample;
  edited code is traced live. Same for For loop and Fibonacci (their fixtures are checked
  against the live tracer in `tests/tracer.spec.ts`).
- Live traces show the state after each line runs, like section 6.
- Titles: factorial(3), "For loop: sum of 1 to 3", fibonacci(5), "Bubble sort", "Your code".
- Crashes: open the steps up to the crash; last step has the crashed line, the crashing
  frame with status "error" (#FDE8E3 / #B42318 / #8A1C12), a plain-words sentence, and the
  raw Python message in the Output box. A crash before any step stays on Home.
- Beginner mode works now (off hides "In real life"); remembered in localStorage.
- Phone: badge and Beginner mode in a top-bar menu; blank lines kept; output box shown
  once something is printed; frames leave out function values.
- Space toggles play only when focus is not on a button, link, select or text field.
- "Loading Python…" on the button while Pyodide loads; input() prompt:
  "Your program asks for input. Type one line per input() call."

## Commands

- `npm run dev`: dev server
- `npm run build`: type-check and production build to `dist/`
- `npm test`: all Playwright tests (builds and serves on port 4317)

## Workflow

Work in stages and stop for review. Commit after each stage with a clear message.
Push to GitHub only when asked.
