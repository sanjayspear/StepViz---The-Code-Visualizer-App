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
   - P1 (done): basic pointers (C and C++) and std::map.
   - Then, on the owner's "act like the senior developer and architect", my order:
     G1 tables (2-D arrays) in Java/C++/C and vector<vector<int>> (done), H1 Java
     HashMap/TreeMap/LinkedHashMap (done), P2 C/C++ pointer arithmetic + new/delete
     (done), K2 Java inheritance (done), C5 C++ inheritance (done). That list is
     finished. Then (2026-11-26, my order): try-line step removed in Python/JS
     (done), I1 Java interfaces + Comparable (done), S2 sets (done), ST1 Java
     static variables and constants (done), PY1 Python and JavaScript classes
     (done), SW2 Java switch values + var (done), L2 Java lambdas + Comparator
     (done), OP1 C++ operator overloading (done), ST2 C++ static members (done), ST3
     Java streams (done). The list of ideas is finished.

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
  part" and "throws". Python's except header lines get no step, and the try line
  itself gets no step in any language (since 2026-11-26), like Java/C++. JavaScript: names starting with __sv stay on Home ("Line 2: names
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
  ("Dog has no constructor that takes no values."). Unsupported: implements
  (interfaces), static variables, inner (non-static) classes, generic classes,
  anonymous classes, this(...), Object (so equals(Object) can't be written; ==
  and the default equals compare objects, as in Java).
- Java inheritance (K2): extends (one class above another, any depth), fields
  of all levels in the object text (top class first): Dog {name: "Rex", legs:
  4, breed: "Lab"}. Constructors in Java's order: super(...) (or the hidden
  super()) runs the class above in a frame "super("Rex")", then that class's
  field values, then the rest. Overriding: the object's own class decides
  (a.describe() on a Dog in an Animal box runs Dog's); calls without an object
  inside a method do too; super.describe() runs the class above ("super.describe()"
  frame). @Override, protected (like public: one file is one package), abstract
  classes and methods. A variable's box type is checked like Java's compiler:
  "a is an Animal box, and Animal has no field breed: cast it first, like ((Dog)
  a).breed." (same for methods). instanceof Dog; casts (Dog) a: a wrong one is a
  ClassCastException "class Dog cannot be cast to class Cat" ("This object can't
  be treated as that class: it was made as a different one."); a Dog in an
  Animal box prints as Dog@.... Rules: "Animal is abstract, so new Animal() is
  not allowed: make one of the classes that extend it."; "secret is private in A,
  so B can't use it (make it protected, or use a method of A)."; "Q must have its
  own area() method, because S only promises it (abstract)."; "A has no
  constructor that takes no values, so the constructor below it must start with
  super(...)." Unsupported: interfaces, a field with the same name as one above,
  instanceof Dog d (with a name), this(...).
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
  except this->. A member value written in the struct may use members above
  it (int b = a + 1;).
- Java interfaces (I1): interface Shape { double area(); default String label()
  { ... } } (default, static and private methods with bodies; others are promises),
  interface A extends B, class C implements A, B (with extends too), interface
  types for variables, parameters and lists, instanceof / casts to interfaces
  (ClassCastException when the object does not implement it). A method runs from
  the object's class first, then an interface's default method. Comparable<T>:
  class Student implements Comparable<Student> with public int compareTo(Student
  o); Collections.sort / Arrays.sort / Collections.max call compareTo (each call
  is a step) in Java's own order for lists under 32 items (TimSort's binary
  insertion sort); longer lists use a stable merge sort (same result). Rules:
  "Shape is an interface, so new Shape() is not allowed: make an object of a
  class that implements it."; "Dot must have its own area() method, because
  Shape only promises it."; "area() must be public in Dot, because Shape makes it
  public (write public before it)."; "P objects can't be sorted by themselves:
  write class P implements Comparable<P> with a compareTo method." Unsupported:
  constants in interfaces, generic interfaces of the program, lambdas,
  Comparator, TreeMap/TreeSet with object keys.
- C++ operators (OP1): operator== != < > <= >= + - * / += -= as struct methods
  or free functions, and ostream& operator<<(ostream& os, const T& x) (cout << p
  runs it; os << ... inside prints). Each operator call is a frame labelled with
  the operands as written (a.operator+(b), operator<<(cout, c), operator<(a, b));
  os shows as cout. a != b uses operator== when there is no operator!= (C++20);
  a += b uses operator+= or falls back to a = a + b. sort(v.begin(), v.end()) on
  structs calls operator< in libstdc++'s insertion-sort order. Point{1, 2} works
  as a value. Without an operator the old messages stay; operator[], (), unary and
  others stay on Home ("the operator operator[]").
- C++ static members (ST2): static int count; (with int Dog::count = 0; after
  the class), static const / constexpr / inline members with a value in the
  class, static methods. They live in the "Global" frame as Dog::count (set up
  in program order with the global variables, before main()); used as count
  inside the class's code (and classes built on it), Dog::count anywhere; a
  static method's frame is "Dog::total()" with no this (also when called as
  d.total()). Changes read like other changes ("Dog::count changes from 1 to
  2."). Rules like the compiler: "Dog::count is static, so it also needs a line
  after the class that gives it its box, like int Dog::count = 0;"; "... can't
  get its value inside the class: write static inline int count = ...; or put a
  line after the class ..."; "A::MAX is const, so it can't be given a new
  value."; private / protected statics; "k belongs to each A object, so a
  static method can't use it on its own." (and "... can't call it on its
  own."); "this can't be used in a static method: it runs without an object.";
  "g() is not static, so it needs an object: call it like d.g()."; "A has no
  static member called m." A static variable inside a function now stays on
  Home ("static variables inside functions"); before, it was wrongly reset on
  every call. Unsupported: several statics in one line, static arrays written
  with [ ], static pointers.
- Checked against real compilers (D1, 2026-11-26): tests/golden holds everyday
  Java / C++ / C programs whose expected output comes from real javac/java 21
  and clang (scripts/golden-refresh.sh rebuilds it; avoid library-specific
  orders). StepViz must print exactly the same (tests/golden-java-cpp.spec.ts).
  Wrong results it found and fixed: C/C++ printf / cout / to_string rounding
  is now exact on the binary value with ties to even (printf("%.1f", 0.25)
  is 0.2, %.0f of 2.5 is 2, fixed 0.125 to 2 places is 0.12; %g picks its
  form after rounding; src/runner/numfmt.ts); Java's String.format rounds the
  shortest decimal form half-up (%.1f of 0.15 is 0.2, %.3f of 1.0005 is
  1.001), and %o works; C round() takes halves away from zero (round(-2.5) is
  -3); Java a[i++] = a[i] * 10 works out the array and the position first,
  and a[i++] += 2 / a[i++]++ move i once. C/C++ float is now a real 32-bit
  float (9.99f, float arithmetic rounded like C; printf / cout print its exact
  value). Java byte, short and float stay on Home ("StepViz can't run byte
  numbers (use int) in Java yet.", "float numbers (use double)", "float
  numbers like 1.5f (use double: 1.5)") instead of being treated as int /
  double. Added: Java new String(...), Double.NaN / POSITIVE_INFINITY /
  MAX_VALUE / MIN_VALUE; C++ string find / rfind (string::npos prints
  18446744073709551615), insert, erase, replace, append, push_back, pop_back,
  clear, s[i] = 'x', string(...) / string(n, c); toupper / tolower and
  isdigit / isalpha / isalnum / isspace / isupper / islower / ispunct (glibc's
  answers: isdigit gives 2048, like g++ on Linux); vector insert / erase at
  v.begin() + k; C strcpy / strcat / strncpy (with a "does not fit" crash).
  D2 (second round, 19 more programs: classes, interfaces, switches,
  overflow, collections, printing, references, pointers): no wrong results;
  fixed an interpreter crash (thenComparing(Comparator.naturalOrder()) was
  taken as a key) and added: interfaces declared inside Main, Math.PI / E,
  String.hashCode(), new ClassCastException(...); C++ setw / setfill / left /
  right (setw for the next value only), noboolalpha, char(66) / int(x) /
  double(x), a + 2 and q < a + 5 with an array a, {new Circle(1.5), ...} into a
  vector<Shape*>.
- C++ pair and unordered containers (C7, 2026-11-26): pair<A, B> (= {1, "a"},
  p(1, "a"), make_pair, p.first / p.second, vector<pair<...>> with {..},
  push_back({..}), emplace_back(a, b)); shown like map entries: pair {first:
  2, second: "b"}; ==, <, ... compare first, then second (and sort uses
  that); "A pair has two parts (first and second), not 3."; "cout can't print
  a pair directly: print its parts, like p.first." Structured bindings in
  range-for over pairs or structs: for (auto [a, b] : v) / for (auto& [a, b]
  : v) (b shows "(same box as v[0].second)"). unordered_map / unordered_set
  follow libstdc++'s hash table step for step, so the order shown in frames
  and walked by loops is g++'s: std::hash (whole numbers are their own hash,
  text through _Hash_bytes, checked against known values), 13 buckets after
  the first insert (an {...} list sizes it first), the prime growth (29, 59,
  127, 257, 541, 1109), and each new key goes first in its bucket or first of
  all. Unsupported: nested pairs, pairs as map values or keys, double or
  struct keys in unordered containers, bucket functions, custom hashes.
- C++ algorithms and containers (C6, 2026-11-26): every sort is libstdc++'s
  std::sort step for step (introsort with median-of-three, heap sort when too
  deep, final insertion sort), so a lambda or the program's operator< is
  called in g++'s order and equal items end up where g++ puts them. Fixed:
  text was sorted with the browser's alphabet ("a" before "B"); it is now by
  character codes like C++ ("B" before "a"). Ranges: v.begin(), v.end() /
  v.begin() + k / a, a + n (arrays). sort with a lambda ([](int a, int b) {
  ... }, also kept in an auto variable), greater<int>() or less<int>();
  reverse (lists and text), accumulate (the start value decides the type),
  count, find, max_element / min_element (*it is the item, it - v.begin() the
  position; the first largest / smallest, like libstdc++), v.begin() /
  v.end(). A lambda call is a small frame "lambda(1, 3)" like Java's. stack,
  queue, priority_queue (and with vector<T>, greater<T>) are shown as lists:
  a stack's top is its end, a queue's front is position 0, a priority_queue
  shows libstdc++'s heap ([4, 1, 3, 1], top first) using push_heap /
  pop_heap step for step. Empty pop / top / front: "The stack is empty, so
  there is nothing to take off its top." / "This is empty, so there is
  nothing to take or look at." Rules: "A queue has no top(): use front() for
  the next item and back() for the last one."; "A stack can't be read by
  position: use top()."; "A stack has no push_back(): it only has push, pop,
  top, size and empty."; "sort needs a lambda here, like [](int a, int b) {
  return a > b; }." Unsupported: pair, unordered_map (next), comparator
  structs, lambdas elsewhere, other algorithms, deque.
- Java collections (J3, 2026-11-26): StringBuilder / StringBuffer (shown as
  its text, sb = "ab3"; changes in place, shared by every variable holding it;
  append / insert / reverse / delete / deleteCharAt / setCharAt / replace /
  setLength are change steps, also chained; equals asks "the same object?";
  "s is a String box, and a StringBuilder is not a String: use .toString() to
  get its text."). Stack (push / pop / peek / empty / search, and all List
  methods), Queue / Deque boxes with LinkedList (a List too) or ArrayDeque
  (both ends; no positions: "An ArrayDeque has no get(...): use its ends
  ..."), PriorityQueue with Java's own heap (printing and for-each show the
  heap order, [1, 2, 3, 5]; a Comparator or compareTo is called in Java's
  order; reverseOrder, lambdas, new PriorityQueue<>(list) heapifies). Frames
  show them as lists, front first. Crash sentences: "The stack is empty, so
  there is nothing to take off its top." / "This is empty, so there is nothing
  to take or look at." (NoSuchElementException without a message; Scanner's
  have one). "Queue is an interface, so new Queue<>() is not allowed: write new
  LinkedList<>()." Lists of lists (List<List<Integer>>, one level) and maps
  with list values (Map<String, List<String>>): rows are shared, not copied;
  "1 is added to the end of g[0]."; m.get(k).add(x) / g.get(0).set(...) are
  change steps of m / g. Map merge / compute / computeIfAbsent /
  computeIfPresent. Any language: a value taken out of a list on the same line
  says so ("We make a box called top and put 2 in it. It is taken off the end
  of st."). Fixed: println of a list variable holding null. Unsupported:
  sets of lists, lists of arrays, deeper nesting, Iterator.
- Exact long numbers (N1, a correctness fix found 2026-11-26): Java long and
  C/C++ long / long long are exact 64-bit whole numbers that wrap like Java
  and g++ (21! in a long prints -4249290049419214848; 9007199254740993L stays
  exact; 1L << 40 is 1099511627776). Kept as plain numbers up to 2^53 and as
  bigints beyond, so nothing else changes. Also: int << long stays an int;
  (int) of a big double stops at the int limits (Java); (long) of a double
  too; Long.MAX_VALUE / MIN_VALUE, Long.parseLong; Math.abs/max/min of longs
  exact; Scanner.nextInt / nextLong of a number too big for the box is an
  InputMismatchException; C++ whole-number literals too big for an int are
  long (10000000000 needs no LL); cin / scanf read big numbers exactly;
  printf %lld, to_string, stol / stoll, abs of long long exact.
- Java streams (ST3): list.stream(), set.stream(), Arrays.stream(array),
  IntStream.range / rangeClosed / of, Stream.of; filter, map, mapToInt,
  mapToDouble, mapToObj, boxed, asDoubleStream, sorted() / sorted(cmp),
  distinct, limit, skip, peek; collect(Collectors.toList() / toSet() /
  joining(...)), toList() (read-only: changing it is an
  UnsupportedOperationException, "This list can only be read: a list from
  toList() can't be changed."), toArray (IntStream), forEach, count, sum,
  average, min, max, reduce, anyMatch / allMatch / noneMatch, findFirst /
  findAny; Optional / OptionalInt / OptionalDouble: get / getAsInt /
  getAsDouble / orElse / orElseThrow / isPresent / isEmpty / ifPresent;
  printed as Optional[3] / Optional.empty. Runs exactly like Java: nothing
  happens until the last call, then each item goes through every step before
  the next one (filter(5), filter(2), map(2), ...); sorted waits for all items
  (TimSort's comparison order); limit, anyMatch and findFirst stop early;
  count() does not run the steps when none of them can change how many items
  there are (Java 9+, so peek is skipped); DoubleStream sums use Java's
  compensated sum. No new screen design: every lambda call is the usual
  "lambda(...)" frame. Empty Optional: "There is no value to get here: the
  stream had no items to give an answer from." Method references of Java's
  own classes now work too: Integer::sum / max / min / compare / parseInt /
  intValue / valueOf, Double::sum / max / min / compare, String::length /
  toUpperCase / toLowerCase / trim / isEmpty / valueOf. Rules: "sum() works on
  a stream of numbers: use mapToInt(x -> x) first."; "An IntStream can't
  collect(...) directly: use boxed() first."; "An OptionalInt gives its value
  with getAsInt()."; "Collectors.joining joins text only: use
  map(String::valueOf) first." Unsupported: streams or Optionals kept in a
  variable, printing a stream, groupingBy and other Collectors, flatMap,
  parallel streams, Stream.iterate / generate.
- Java lambdas (L2): lambdas as values for methods and in Comparator<T>
  variables; method references System.out::println and Student::getScore (the
  program's classes). Uses: list.sort(cmp / null), Collections.sort(list, cmp),
  Arrays.sort(objects, cmp), Collections.max/min(list, cmp), list.forEach,
  removeIf, replaceAll, map.forEach((k, v) -> ...); Comparator.comparing /
  comparingInt / comparingDouble (key lambda or method reference), naturalOrder,
  reverseOrder, .reversed(), .thenComparing(...), cmp.compare(a, b). A lambda
  call is a small frame "lambda(...)" that lists only its own values (it still
  reads the variables around it); an expression lambda gives its value back as
  the return step. Sorting with a rule uses TimSort's order like Comparable.
  Rules: "total can't be changed inside a lambda: a lambda may only read the
  variables around it."; "Arrays.sort with a rule needs an array of objects (like
  String[]), not int[]."; var with a lambda, lambdas elsewhere, other method
  references, Function/Predicate/Runnable types and streams stay unsupported.
- Java switch values and var (SW2): int days = switch (m) { case 2 -> 28; case
  4, 6 -> 30; default -> { ...; yield 31; } }; and the old form (case 1: yield
  "a";). The line with the switch gets its step after the value is known; lines
  inside a block part (and the yield) get their own steps first. A switch that
  gives a value must have a default part ("A switch that gives a value needs a
  default part (default -> ...).") ; yield only inside one. var takes the type of
  its value (var n = 5 is an int box); "var needs a value here, so Java can tell
  its type (var x = ...;)."; "var can't start as null: write the type instead.";
  for (var x : list) works.
- Python and JavaScript classes (PY1): objects show their fields like Java/C++:
  rex = Dog {name: 'Rex', age: 0} (Python objects of the program's classes
  without their own __repr__; an object inside an object: Node {…}; values with
  no objects keep their usual repr). Python: no frame for a class body (the
  class line is a define step); the constructor frame is "Dog.__init__('Rex')"
  with self first (self = Dog {} then filling in); methods "rex.birthday()" (the
  caller's variable holding the object; Dog.birthday() if none). JavaScript: the
  constructor frame is "new Dog("Rex")" and methods "rex.birthday()", both with
  this as the first variable. Sentences: "self.name is set to 'Rex'." (a new
  field) / "self.age changes from 0 to 1." / "The new Dog object is ready: ..."
  / "rex now holds the new Dog object."; obj.field = ... targets the object.
- Java statics (ST1): static variables and constants of any class (static int
  count; static final int MAX = 3;) live in a bottom frame "static" (Main's by
  name, others as Dog.total), under main() like C++'s "Global"; a static written
  with a value shows ? until its line sets it (a step each, before main()
  starts); programs without statics keep main() at the bottom. Used by name in
  their class (and in classes inside Main for Main's), or as Dog.total. main()
  has no return step. Changes to a bottom-frame variable from any frame now read
  like other changes (also C++ globals changed inside functions). Rules: "MAX is
  final, so it can't be given a new value."; "MAX is final, so it needs a value
  here (final ... MAX = ...;)."; private statics; "fields in Main that are not
  static (write static before them)" stays unsupported. Unsupported: static {
  } blocks; statics of other classes are set before main() starts (Java sets them
  on first use; only visible if their value line prints something).
- Sets (S2): Java HashSet (printed in Java's HashMap order), TreeSet (sorted,
  first/last), LinkedHashSet (as added); Set<T> as the box type; add (true if it
  was new), remove, contains, size, isEmpty, clear, addAll / removeAll /
  retainAll / containsAll; new HashSet<>(list or List.of(...)), new
  ArrayList<>(set); for-each (changing the set inside it is a
  ConcurrentModificationException). C++ std::set<int/string/...> (sorted):
  insert, erase, count, contains, find(x) != end(), size, empty, clear,
  range-for. Frames: s = {"pear", "fig"} / {1, 3, 5}. Sentences (all languages,
  Python sets too): ""pear" is added to seen." / ""apple" is taken out of seen."
  / "s does not change: a set holds each value only once." Python's add,
  discard, update, setdefault, popitem now count as changes. Unsupported: sets
  of the program's objects or structs, unordered_set, Set.of.
- C++ inheritance (C5): class Dog : public Animal (one public base; struct bases
  are public by default). Members of all levels (base first): Dog {name: "Rex",
  breed: "Lab"}. The base part is made first, in a frame "Animal::Animal("Rex")"
  shown on the constructor's line: "Dog::Dog("Rex") first runs
  Animal::Animal("Rex") to set up the Animal part of the object." (: Animal(n) in
  the member list, or the base's constructor without values). virtual / override
  / pure virtual (= 0): through a pointer or reference (and inside methods) a
  virtual method uses the object's own class; otherwise the variable's type
  decides (a->plain() on a Dog in an Animal* runs Animal's plain()). Animal::x()
  calls the base version. Copying a Dog into an Animal keeps only the Animal part
  (slicing: copy = Base {a: 1}). protected works; empty destructors (virtual
  ~Animal() {}) are allowed. vector<Animal*> / vector<int*>, for (Animal* a :
  pets), delete through a base pointer. Rules: "Animal has a pure virtual method
  (sound() = 0), so you can't make an Animal itself: make one of the classes
  built on it."; "name is protected in Animal, so only code inside Animal and the
  classes built on it can use it."; "p is an A pointer, and A has no member y.";
  "A has no constructor that takes no values, so B's constructor must call
  A(...) in its member list."; "secret is private in A, so B can't use it (make it
  protected)." Unsupported: private/protected inheritance, several bases,
  destructors with code, a member with the same name as one in the base, {...}
  for a struct built on another, dynamic_cast.
- Pointers and maps (P1, my call): a pointer shows "p = points to x", "points to x
  in main()" when x is in another frame, "points to local in f() (gone)" after
  its block or function ended, "nullptr". Call labels show &x: "addOne(&x)".
  Crashes: "This pointer is nullptr, so it points to nothing." / "This pointer
  points to a box that no longer exists." (StepViz stops where real C++ gives
  garbage). cout << p prints a made-up address 0x7ffc.... Texts: "We make a
  pointer called p. It points to x." / "p now points to y instead of x." / "The
  box p points to, x in main(), changes from 1 to 2." / "Through the pointer pa,
  a changes from ... to ...". Rules: "p is a double* box, so it can't hold points
  to x."; "pa is a pointer: use -> to reach its member, like pa->x."
  P2: pointers into lists: int* p = a (a list used as a pointer: points to a[0];
  call labels sum(&a[0], 4)), p++, p += 2, *(p - 1), p[i], q - p, p < q; one past
  the end may be pointed to, reading there is "This position is outside the
  list." Moving a pointer to a plain variable stays unsupported. new / delete:
  boxes made with new have no name, so the text shows the value: "points to new
  int (5)", "points to new Point {x: 1, y: 2}", "points to item 0 of new int[3]
  [0, 0, 0]". delete: "The box q points to (new int) is deleted. q still points
  there, but the box no longer exists." / "The list arr points to (new int[3]) is
  deleted. ..."; use after delete = Dangling crash; "This box was already
  deleted, so it can't be deleted again."; "delete only works on a pointer that
  new gave back."; delete vs delete[] mismatch stays on Home ("a points to a list
  made with new[]: use delete[] a."). Through pointers: "The box q points to (new
  int) changes from 5 to 6." / "Through arr, item 1 of new int[3] changes from 0
  to 7." / "The box p points to, a[1], changes from 2 to 20." Unsupported:
  pointers to pointers, char* text, placement new, malloc/free, memory-leak
  warnings.
  std::map: m = {"Ali": 1, "Sam": 3} in key order; m[k] adds a missing key with
  0/""/empty struct like C++ (reading too); at() throws out_of_range ("map::at");
  find(k) != m.end() works, other iterator use does not; range-for with [k, v]
  (v "(same box as m["Ali"])" with &) or kv.first/kv.second (shown as pair
  {first: ..., second: ...}). Map and dictionary texts (C++ maps, Python dicts)
  read key by key: "m gets a new key "Sam" with the value 1." / "m["Sam"]
  changes from 1 to 3." / ""Ali" is taken out of m." / "m is emptied: it has no
  keys now." Python del d[k] / del a[i] now counts as a change. unordered_map
  stays on Home ("unordered_map (map works)").
- Tables (G1): a 2-D array is an array of rows, shown g = [[1, 2], [3, 4]] (C
  char tables as ["Sam", "Bo", ""]). Java: new int[2][3], new int[2][] (rows null),
  {{...}}, rows of different lengths, Arrays.deepToString; println of a missing
  row prints null. C/C++: int g[2][3] = {{1}, {4}} (missing items 0; no {...}:
  "no value yet"), every size after the first must be written, tables passed to
  functions (not copied), scanf("%s", names[2]). vector<vector<int>>, vector<int>
  v(n) / v(n, value), vector<int>(4, 0) as a value, push_back of rows (copied),
  resize. Texts: "g[1][2] changes from 0 to 9." / "Row 1 of g: position 2 was 0
  and is now 9." Unsupported: tables of structs (C/C++), sorting a list of lists.
- Java maps (H1): HashMap, TreeMap, LinkedHashMap (Map<K, V> as the box type,
  Map.Entry<K, V>). Printing follows Java exactly: HashMap in hash-bucket order
  (String.hashCode, (h ^ h>>>16) & (size-1), table 16 doubling past 3/4 full),
  TreeMap by key, LinkedHashMap as put in: {banana=2, apple=1, cherry=3}. Frames:
  m = {"banana": 2, "apple": 1} (same order), so the map sentences apply. put,
  get (null when missing: int n = m.get("x") is a NullPointerException, like
  Java), getOrDefault, containsKey, containsValue, remove, size, isEmpty, clear,
  putIfAbsent, keySet/values/entrySet (for-each; changing the map inside is a
  ConcurrentModificationException), getKey/getValue/setValue, firstKey/lastKey
  (TreeMap). Rules: "A Map holds objects, not int values: write Integer instead
  of int."; "A map can't be walked directly: use m.keySet(), .values() or
  .entrySet()." Unsupported: maps of lists, keys of the program's own classes,
  merge/compute (lambdas), HashSet.
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
- C4 (2026-11-25): C++ structs/classes and C structs (tests in `tests/structs-cpp.spec.ts`).
- P1 (2026-11-25): pointers (C, C++) and std::map (tests in `tests/pointers-cpp.spec.ts`).
- 2026-11-26: fix for struct member values that use other members; G1 tables in Java/C++/C (tests in `tests/tables-cpp.spec.ts`); H1 Java maps (tests in `tests/maps-java.spec.ts`); P2 pointer arithmetic + new/delete (tests in `tests/pointers-cpp.spec.ts`); K2 Java inheritance (tests in `tests/inheritance-java.spec.ts`); C5 C++ inheritance (tests in `tests/inheritance-cpp.spec.ts`); try-line step removed in Python/JS; I1 Java interfaces + Comparable (`tests/interfaces-java.spec.ts`); S2 sets (`tests/sets-java.spec.ts`); ST1 Java statics (`tests/statics-java.spec.ts`); PY1 Python/JS classes (`tests/classes-tracer.spec.ts`); SW2 switch values + var (`tests/switchvar-java.spec.ts`); L2 lambdas (`tests/lambdas-java.spec.ts`); OP1 C++ operators (`tests/operators-cpp.spec.ts`); ST2 C++ static members (`tests/statics-cpp.spec.ts`); ST3 Java streams (`tests/streams-java.spec.ts`); N1 exact 64-bit longs (`tests/longs-java-cpp.spec.ts`); J3 Java StringBuilder, Stack/Queue/Deque/PriorityQueue, lists of lists, map merge/compute (`tests/collections-java.spec.ts`); C6 C++ libstdc++ sort, lambdas, algorithms, stack/queue/priority_queue (`tests/algorithms-cpp.spec.ts`); C7 C++ pair, unordered_map, unordered_set (`tests/containers-cpp.spec.ts`); D1 checked against real javac / clang (`tests/golden/`, `tests/golden-java-cpp.spec.ts`, `scripts/golden-refresh.sh`; 301 tests pass).

### In progress
- `wip/llama-ai`: optional AI explanations by Llama in Ollama on the student's own desktop (button "Explain with AI (Llama on this computer)", setup panel, accuracy guard, phone menu note, CSP allows only http://localhost:11434). Built and tested (with a stand-in Ollama and with real Llama 3.2 3B on all 5 languages: works, ~2 s per step, no errors). NOT merged because the text quality is not good enough: about 1 step in 6 is wrong in a way the guard cannot catch ("total is added to itself"), and many "In real life" lines do not fit. Left: try Llama 3.1 8B (about 5 GB; download was started and stopped, not on the Mac yet) on the same 20 programs; if clearly accurate, switch AI_MODEL to it and merge; otherwise keep AI off and leave the branch.
- `wip/ai-explanations`: the older paused in-browser AI (WebLLM + Qwen). Superseded by `wip/llama-ai`; keep for reference only.

### Next step
Continue the later stages in order: (1) Java ArrayList + more String methods (done, L1), (2) try/catch in Java and C++ (done, T1) and the catch kind for Python and JavaScript (done, T2); (3) simple Java classes (done, K1); (4) C++ structs/classes (done, C4); (5) pointers and map (done, P1). All planned stages are built. Next: ask the owner whether to push, and what comes after (ideas: an example chip for classes or maps, pointer arithmetic, inheritance).

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
- Review of C3 and S1 (both live on the site), and L1 + T1 + T2 + K1 + C4 + P1 (not pushed); the owner said "you only review and continue", so I review each stage myself.
- Whether to push to GitHub.
