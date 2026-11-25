# StepViz

## The spec is the PDF

`StepViz_Build_Spec.pdf` (project root) is the source of truth. Its screenshots define
layout, copy, colors and spacing; section 5 has the exact design tokens; section 6 has
the exact sample trace and copy; section 9 is the acceptance checklist. Read the
relevant pages before changing any screen. Do not redesign, rename or reword anything.

**Ask before adding anything that is not in the PDF.** If the PDF is unclear or
something is missing, ask; do not guess.

## Scope

Phase 1 is done. Phase 2: (g) Screen 3 and Bubble sort (done), (h) JavaScript exact
trace (done). (i) In-browser AI explanations are PAUSED (work saved on the branch
`wip/ai-explanations`). Next, in this order:

1. Rule-based explainer: a `kind` on every trace step, and plain-English "What is
   happening" + "In real life" text built from what changed (plan first, then build).
2. Java, C++ and C exact traces: tree-walking interpreters over tree-sitter, each in
   its own locked-down worker, same trace JSON, explained by the rule-based explainer.
   - J1: shared interpreter core + Java basics. J2: Java arrays, list view, Scanner,
     crashes, examples; Java loses "(coming soon)".
   - C1: C++ core (main, cout, functions incl. references, strings). C2: C++ arrays,
     vector, list view, cin, crashes, examples; C++ loses "(coming soon)".
   - C3: C mode (printf/scanf) reusing the C++ interpreter; C loses "(coming soon)".
3. Later stages after C3 (planned, not built): Java ArrayList, more String methods,
   switch, try/catch, simple classes; C++ structs and classes, basic pointers, map.

Phase 1 covers:

- Screen 1: Home (paste code, language select, example chips, "Visualize my code")
- Screen 2: Step-through (code panel, call stack, output, explanation, "In real life", controls)
- Screen 4: phone layout of Screen 2 (and Screen 1 at phone width), below 900 px
- Python only, exact trace, run fully in the browser (Pyodide in a Web Worker, `sys.settrace`). No backend.
- Built-in examples: Factorial (section 6 fixture), For loop, Fibonacci and (Phase 2)
  Bubble sort have hand-written explanations; pasted or edited code uses the generic
  "Line N runs: ..." explanation.

Phase 2 so far:

- Screen 3 (loops and arrays): shown when a list changes inside a loop (`listView`
  in the trace). Bubble sort is a hand-written fixture with kicker labels
  ("Pass 1, comparison 1"); pasted code gets "Step X of N" and plain variable names.

- JavaScript exact trace: Acorn instruments the code (`src/runner/js/`), which runs in
  a fresh locked-down worker per run (`js.worker.ts`: no network APIs, eval, string
  timers or Function constructors; `import()` rejected at parse time; strict mode).
  Same trace shape, caps, crash and list rules as Python. JavaScript versions of the
  four examples; only Factorial has hand-written explanations (section 6 texts
  adapted).
- Language select: "Java (coming soon)", "C++ (coming soon)", "C (coming soon)"
  (selecting one shows "Coming soon"); strip pill "Java, C++, C · coming soon". Each
  label changes when that language works.

Not built: the items above, accounts, share links (the buttons show "Coming soon"),
Screen 5.
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
- Screen 3: a swap line is shown before it runs (old list + curved arrow); the next
  step shows the swapped list. History chips: "start [...]", "swapped 5 and 2" per
  earlier swap, highlighted "now [...]" (+ " → swapping 5 and 2" on a swap step).
  Top bar: "Loops view" note, Share link, Beginner mode in a ⋮ menu. Speed control
  kept. Code panel about 55% / list 45% at desktop width. Phone: Skip to next pass
  under the list. Uncompared bars use #A5A0E8 (from the screenshot).
- JavaScript: switching language swaps an unchanged example for the same example in
  the other language; the student's own code is left alone. Loops report their header
  line at the start of each round, and the last body line is recorded before the
  loop's update runs (so `i` shows that round's value).
- Paused AI (branch `wip/ai-explanations`): free, open model in the browser (WebLLM,
  Qwen2.5-1.5B-Instruct, Apache-2.0; model program copy served from our site; model
  from Hugging Face only), no accounts, no daily limits, accuracy guard, CSP allows
  only self + huggingface.co + *.hf.co.
- Java/C++/C decisions: tree-sitter (MIT) for all three, each grammar loaded only
  when chosen and served from our site. Bottom frame is main(); C++ gets a "Global"
  frame only when it has global variables. C++ stops with a plain-words crash for an
  out-of-range index and for a variable used before it has a value. Unsupported code
  stays on Home: "Line 7: StepViz can't run pointers in C++ yet." (feature name
  filled in). Input box for these languages: "Your program reads input. Type your
  input here, one value per line or separated by spaces." C++ reference parameters
  show as "a = 5 (same box as x)". Examples in these languages use the rule-based
  explainer, except Factorial and Bubble sort, which keep hand-written text if it
  carries over easily.

## Commands

- `npm run dev`: dev server
- `npm run build`: type-check and production build to `dist/`
- `npm test`: all Playwright tests (builds and serves on port 4317)

## Workflow

Work in stages and stop for review. Commit after each stage with a clear message.
Push to GitHub only when asked.
