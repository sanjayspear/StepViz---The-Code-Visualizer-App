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
   - C3 (done): C mode of the C++ interpreter (dialect 'c', tree-sitter-c grammar):
     printf/puts/putchar, scanf with &x, text in char arrays, strlen/strcmp,
     <stdio.h> <stdlib.h> <math.h> <string.h> <stdbool.h> <limits.h>; four C
     examples (Factorial hand-written); C selectable.
3. Later stages after C3:
   - S1 (done): switch in Java (statement form, incl. arrow cases and several
     labels; "switch as a value" stays unsupported), C++, C and JavaScript; new
     step kind switch-case (detail.caseLabel, absent when nothing matched).
   - L1 (done): Java ArrayList / List (generics with Integer, Double, String...),
     autoboxing, Collections, more String methods, Character methods.
   - T1 (done): try/catch in Java (with finally, throw, throws) and C++ (throw of
     exceptions and plain values, catch (...), throw;); new step kind catch.
   - T2 (done): the catch kind for Python (tracer.py: except headers get no step)
     and JavaScript (instrumenter rewrites try/catch/finally and throw); all five
     languages now show caught errors alike.
   - K1 (done): simple Java classes (fields, constructors, methods, this,
     private, toString, objects in arrays/lists).
   - C4 (done): C++ structs and classes, C structs (typedef, designated
     initializers), vectors/arrays of structs, range-for with &.
   - Planned, not built: basic pointers, map (C++).

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
- Language select: Python, JavaScript, Java, C++, C — all exact traces; the strip
  shows a green "· exact trace" pill for each (no yellow pill left).

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
  branch-skipped, loop-start, loop-next, loop-end, call, return, swap,
  switch-case, catch, crash, other. switch: "day is 3, so the switch jumps to case 3.";
  empty cases join the next ("case 1 or 7"); "day is 4 and no case matches, so
  the default part runs." / "... so the whole switch is skipped."
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
- C rules: printf pattern that does not match its value is a crash ("The printf
  pattern does not match this value."); scanf without & stays on Home ("scanf
  needs &x to store a value in x."); char arrays show as text in frames ("Sam");
  & is allowed only as a scanf argument. A temp-variable swap is one swap step in
  C and C++ too. scanf/cin reading several values: "We read "Sam", 15 and 1.75
  with scanf and store them in name, age and h."
- Java L1 rules (ArrayList): lists show
  like arrays ([1, 2, 3]); list.remove(int) removes a position, remove(Integer/other
  value) removes the first equal item, like Java; Integer objects compared with ==
  ask "the same object?" (values -128..127 are shared, like Java's cache), .equals
  compares values; unboxing null is a NullPointerException. A for-each over a list
  follows Java's iterator (ConcurrentModificationException: "The list was changed
  while a for-each loop was going through it."). Index crash: "This position is
  outside the list." Arrays.asList / List.of only inside new ArrayList<>(...).
  Home messages: "An ArrayList holds objects, not int values: write
  ArrayList<Integer>.", "a holds Double values, so it can't hold 5.", "a is a list:
  use a.size() for how many items it has.", "x is an Integer box, so it can't hold
  2.5." Text sorts in Java order (by character codes: "B" before "a"; this also
  fixed Arrays.sort). String methods that change nothing return the same object
  (== shows it). Temp-variable swaps with get/set and Collections.swap are one
  swap step.
- try/catch rules (T1): the line that failed (or threw) is a catch step, shown
  after the error (frames already unwound), then the catch part's steps. Texts:
  "Java can't divide a whole number by zero. Instead of stopping, the program jumps
  to the catch part." / "The program throws an IllegalArgumentException with the
  message "...", and the catch part takes over." / C++ "The program throws the value
  7, ...". Not caught: "The program throws ..., and no catch part takes it, so the
  program stops."; with only a finally part: "... Nothing catches it here, so the
  finally part runs first." (the crash step stays on the line that failed). "In
  real life" lines: safety net / backup plan (catch), raising your hand / alarm
  cord (throw). Java follows its compiler: "Java needs this Exception to be
  handled: put this line inside a try/catch, or add throws Exception after the
  method name and brackets."; "ArithmeticException is already caught by the catch
  part above it (catch Exception)."; println(e) prints java.lang.X: message; frames
  show e as "ArithmeticException: / by zero". C++ follows real C++: only real
  exceptions can be caught (.at() and substr: out_of_range with g++'s what() text;
  stoi/stod: invalid_argument "stoi", crash sentence "This text is not a number.");
  v[i] outside the list, / by zero and unset variables are not exceptions and still
  stop; catch matching has no conversions (throw 1 is not caught by long; "text"
  is a const char*, not caught by string); catch (exception e) by value gives
  what() "std::exception". Unsupported: Java try-with-resources, exceptions with a
  cause, printStackTrace; C++ custom exception classes, throw; outside a catch.
  Python says "except part" and "raises" ("The program raises a ValueError with
  the message "neg", and the except part takes over."); the others say "catch
  part" and "throws". Python's except header lines get no step (like Java/C++
  catch lines); the try line itself keeps its step in Python and JavaScript, as
  before. JavaScript: names starting with __sv stay on Home ("Line 2: names
  starting with __sv are used by StepViz. Please choose another name.").
- Java classes (K1, decided by me on the owner's "you only review and continue"):
  objects show in the variables line as text, no new screen design: rex = Dog
  {name: "Rex", age: 3} (an object inside an object: Node {…}; frames still cut
  text at 40 characters). A constructor runs in a frame "new Dog("Rex", 3)" with
  this first (this = Dog {name: null, age: 0}, then the values); a method on an
  object: "rex.birthday()" with this first; static method of a class:
  "Node.pair(1, 2)"; toString when printing: "Dog.toString()". Texts: "We make a
  new Dog object. new Dog("Rex", 3) starts in a new box with name = "Rex", age =
  3." / "this.name changes from null to "Rex"." (any language: one field of an
  object text changed) / "The new Dog object is ready: ... " / "The new Dog object
  is stored in rex." / after any call that gives nothing back (all languages):
  "Back in main(): rex.birthday() has finished, so the program carries on."
  Java's rules: one public class per file ("Only one class in a file can be
  public: remove public from class Dog."), private ("name is private in Dog, so
  only code inside Dog can use it."), fields in static methods ("age belongs to
  each Dog object, so a static method can't use it on its own."), constructors
  ("Dog has no constructor that takes no values."). Unsupported: extends,
  implements, static variables, inner (non-static) classes, generic classes,
  anonymous classes, this(...)/super(...), Object (so equals(Object) can't be
  written; == and the default equals compare objects, as in Java).
- C++/C structs (C4, my call under the owner's delegation): same object text as
  Java (p = Point {x: 1, y: 2}; a member with no value yet shows ?). C++ objects
  are values: Point b = a copies, references show "(same box as a)", for (auto& q
  : pts) shows "q = ... (same box as pts[0])" (range-for with & now works for all
  vectors and arrays, not text). Constructor frame: "Dog::Dog("Rex", 3)" (not
  "new", which means something else in C++), this first; member lists (: name(n))
  run before the body. Methods: "d.birthday()"; inside a method without this->:
  "bark()". Rules like the compiler: "C++ can't compare two Point values with ==:
  compare their parts, like a.x == b.x."; "cout can't print a Point directly:
  print its parts, like a.x."; "Point has 2 members, not 3."; "age is private in
  Dog, so only code inside Dog can use it."; "getAge is a const method, so it
  can't change age."; "Dog has no constructor that takes no values."; "sort can't
  put Point values in order by itself." A member read before it has a value: the
  usual Uninitialized crash. Input into a member reads "We read 16 with scanf and
  store it in s.age." Unsupported: inheritance, virtual, operator overloading,
  static members, friends, destructors, protected, structs inside functions, ->
  except this->. Known limit: a member value written in the struct that uses
  another member (int b = a + 1;) is not supported correctly.
- List changes read item by item in every language: "nums[0] changes from 5 to 2.",
  "3 is added to the end of squares.", "4 is taken off the end of squares.",
  "7 is put in at position 1 of xs.", "1 is taken out of xs at position 0.",
  "xs is emptied: it has no items now." List methods (append, push, pop, sort...)
  count as changes (assign kind).
- Decided 2026-11-25 (owner: "do what is best as per industry standard"): no
  ArrayList example chip (the four examples stay the same in all five languages);
  AI explanations stay off (wrong about 1 step in 6 is not acceptable for
  learners); `wip/llama-ai` is kept but not merged, and the 8B comparison is not run.

## Commands

- `npm run dev`: dev server
- `npm run build`: type-check and production build to `dist/`
- `npm test`: all Playwright tests (builds and serves on port 4317)

## Workflow

Work in stages and stop for review. Commit after each stage with a clear message.
Push to GitHub only when asked.

## Where we stopped

Paused on 2026-11-25.

### Done
- a–f: Phase 1 (Home, Step-through, phone layout, Python via Pyodide in a locked-down worker, tests, docs, GitHub Pages deploy).
- g: Screen 3 (loops and lists view) with Bubble sort.
- h: JavaScript exact trace (Acorn-instrumented, locked-down worker).
- E1: rule-based explainer (step kinds; "What is happening" + "In real life" for every live trace).
- J1 + J2: Java interpreter (tree-sitter) with arrays, list view, Scanner, printf, four examples.
- C1 + C2: C++ interpreter (functions, references, globals, vector, cin/cout, crashes, four examples).
- C3: C mode of the C++ interpreter (printf/scanf, char arrays, four examples). All 5 languages are exact traces; no "coming soon" left.
- S1: switch in Java, C++, C and JavaScript (new step kind switch-case).
- L1 (2026-11-25): Java ArrayList + Collections + more String/Character methods (tests in `tests/arraylist-java.spec.ts`).
- T1 (2026-11-25): try/catch in Java and C++, step kind catch (tests in `tests/trycatch-java.spec.ts`, `tests/trycatch-cpp.spec.ts`).
- T2 (2026-11-25): catch steps for Python and JavaScript (tests in `tests/trycatch-tracer.spec.ts`).
- K1 (2026-11-25): simple Java classes (tests in `tests/classes-java.spec.ts`).
- C4 (2026-11-25): C++ structs/classes and C structs (tests in `tests/structs-cpp.spec.ts`; 174 tests pass).

### In progress
- `wip/llama-ai`: optional AI explanations by Llama in Ollama on the student's own desktop (button "Explain with AI (Llama on this computer)", setup panel, accuracy guard, phone menu note, CSP allows only http://localhost:11434). Built and tested (with a stand-in Ollama and with real Llama 3.2 3B on all 5 languages: works, ~2 s per step, no errors). NOT merged because the text quality is not good enough: about 1 step in 6 is wrong in a way the guard cannot catch ("total is added to itself"), and many "In real life" lines do not fit. Left: try Llama 3.1 8B (about 5 GB; download was started and stopped, not on the Mac yet) on the same 20 programs; if clearly accurate, switch AI_MODEL to it and merge; otherwise keep AI off and leave the branch.
- `wip/ai-explanations`: the older paused in-browser AI (WebLLM + Qwen). Superseded by `wip/llama-ai`; keep for reference only.

### Next step
Continue the later stages in order: (1) Java ArrayList + more String methods (done, L1), (2) try/catch in Java and C++ (done, T1) and the catch kind for Python and JavaScript (done, T2); (3) simple Java classes (done, K1); (4) C++ structs/classes (done, C4); next: basic pointers and map in C++ (pointers need a way to show "points to": decide, keeping the existing layout).

### Decisions to remember
- The PDF is the source of truth; ask before adding anything not in it. Work in stages, commit each, push only when asked.
- Every language is an exact trace: Python (Pyodide), JavaScript (Acorn), Java, C++ and C (own tree-walking interpreters over tree-sitter, each in its own locked-down worker, same trace JSON). No AI writes the built-in explanations; the rule-based explainer does.
- Pasted code runs only in the workers; workers have no network. Caps 2,000 steps / 5 s + watchdog. No pasted code stored.
- AI (if ever merged): free, on the student's own computer only (Ollama + Llama), desktop only, contacted only after the button is pressed, built-in text kept whenever the guard rejects the AI text. No accounts, no paid services.
- All language-specific rules are in "Decisions agreed with the product owner" above.

### How to run
- `npm install` (if ~/.npm is root-owned: `npm install --cache /tmp/npm-cache`)
- `npm run dev` → http://localhost:5173/
- `npm test` → builds and runs all Playwright tests on port 4317 (`npx playwright install chromium` once)
- AI branch only: open Ollama (installed in /Applications, Llama 3.2 3B downloaded); nothing else needed on localhost.

### What the product owner still owes
- Review of C3 and S1 (both live on the site), and L1 + T1 + T2 + K1 + C4 (not pushed); the owner said "you only review and continue", so I review each stage myself.
- Whether to push to GitHub.
