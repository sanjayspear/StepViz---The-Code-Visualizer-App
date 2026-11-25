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

1. Rule-based explainer (E1, done): every tracer fills in `kind` (+ `detail`) on each
   step; `src/trace/explainer.ts` writes "What is happening" + "In real life" for live
   traces from the kind and what changed, with no per-language rules.
2. Java, C++ and C exact traces (start only when the product owner says so): tree-walking interpreters over tree-sitter, each in
   its own locked-down worker, same trace JSON, explained by the rule-based explainer.
   - J1 (done): shared recorder (`src/runner/recorder.ts`, also used by JavaScript),
     tree-sitter loader, Java interpreter (`src/runner/java/interpreter.ts`) for the
     basics, its own locked-down worker (`java.worker.ts`, lockdown in `lockdown.ts`).
     J2 (done): arrays (one dimension), list view (incl. temp-variable swaps),
     Scanner, printf/String.format, Arrays.toString/sort, parseInt/parseDouble,
     array/input crashes, the four Java examples; Java is selectable ("Java",
     strip "Java · exact trace" + "C++, C · coming soon").
   - C1 + C2 (done, one stage): C++ interpreter (`src/runner/cpp/interpreter.ts`,
     own worker `cpp.worker.ts`): main, functions (by value, by reference), globals,
     int/long/double/char/bool/string/auto, arrays and vector, cout (endl, fixed,
     setprecision, boolalpha), cin and getline, swap/sort/max/min/math/to_string/
     stoi; list view incl. swap(); four C++ examples (Factorial hand-written);
     C++ selectable ("C++", strip "C++ · exact trace").
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
- Language select: "Java", "C++", "C (coming soon)" (selecting C shows "Coming
  soon"); strip "C · coming soon" until C works.

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
- Explainer rules: kinds are define, assign, input, print, branch-taken,
  branch-skipped, loop-start, loop-next, loop-end, call, return, swap, crash, other.
  "b stays 1" when a value does not change; lists of more than 6 items and text over
  20 characters are summarised in sentences ("a list of 8 numbers", "a long piece of
  text"), frames keep real values. While loops: "Checking the condition again: total
  < 10 is still true." "In real life" lines are tagged by sub-kind ("swapping seats"
  only for swaps and simultaneous changes of existing boxes). Crash steps have no
  "In real life" line; unknown statements keep "Line N runs: ..." plus a generic one.
  No jargon ("iteration", "expression"). JavaScript records a loop-end step like
  Python. Hand-written fixtures keep their text. Only print/input/function words
  change per language.
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
- Java J1 rules: problems Java's compiler would reject stay on Home with a line
  number ("x is an int box, so it can't hold 2.5.", "x is used before it was given a
  value.", "y is used but never declared."); unsupported code: "Line N: StepViz can't
  run <feature> in Java yet."; missing wrapper: "StepViz needs a public class Main
  with a main method." Doubles print like Java (2.0, 1.0E7); int wraps at 32 bits;
  a void method's return shows "returns nothing". Text compared with == is compared
  by its letters (real Java compares objects; .equals() is the right way). Java
  crash sentences: ArithmeticException "Java can't divide a whole number by zero.",
  StringIndexOutOfBounds "This position is outside the text.", NullPointerException
  "This box is empty (null), so it can't be used here."
- Java J2 rules: text compared with == asks "the same object?" exactly like Java
  (text written in the program, and joined only from such text, is shared; text
  built from variables or read from input is a new object); .equals compares the
  letters. Scanner follows Java (nextInt reads a word and leaves the rest of the
  line for nextLine). Printing an array shows Java's [I@... form; Arrays.toString
  shows [1, 2]. A swap through a temp variable (temp = a[x]; a[x] = a[y]; a[y] =
  temp) is one swap step before it runs. Input crashes: "Your program asked for
  more input than you typed.", "The input was not the kind of value the program
  expected.", "This text is not a number." Java Factorial keeps hand-written text
  (section 6 adapted); the other Java examples use the rule-based explainer.
- C++ rules: StepViz stops with a plain-words crash where real C++ would give
  garbage: unset variable/array item ("This box was used before it was given a
  value."), index outside a list or vector, incl. .at ("This position is outside
  the list."), whole-number / by zero ("C++ can't divide a whole number by zero.").
  cout prints like C++ (2, 3.5, 1e+07, bool as 1 unless boolalpha). vector and
  string are copied on assignment / by-value parameters; references share the box
  and show "5 (same box as x)" (call labels show the plain value). Global variables
  get a "Global" frame under main(); function frames list only their own
  variables. return 0 in main is a "main() is done and returns 0" step. Text +
  number needs to_string() (message on Home). Unsupported: pointers, new/delete,
  structs/classes, templates, maps, switch, try/catch, unsigned, other #includes.
- List changes read item by item in every language: "nums[0] changes from 5 to 2.",
  "3 is added to the end of squares.", "4 is taken off the end of squares." List
  methods (append, push, pop, sort...) count as changes (assign kind).

## Commands

- `npm run dev`: dev server
- `npm run build`: type-check and production build to `dist/`
- `npm test`: all Playwright tests (builds and serves on port 4317)

## Workflow

Work in stages and stop for review. Commit after each stage with a clear message.
Push to GitHub only when asked.
