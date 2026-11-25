# StepViz Python tracer. Runs inside Pyodide, inside a Web Worker only.
#
# analyze(source)            -> JSON: syntax check + number of input() calls
# run(source, inputs, ...)   -> JSON: the recorded steps (spec section 7)
#
# Steps show the state AFTER a line has run, like the section 6 sample trace:
#   - when a line finishes (the next line event in the same frame, or the end of
#     the program), a step for that line is recorded with the new values/output,
#   - when a user function is called, a step highlights the caller's line, with
#     the new frame on top and "running",
#   - when a user function returns, a step shows that frame as "returning".
# The frame that returned is gone from the next step.

import ast
import builtins
import io
import json
import sys
import time
import types

USER_FILE = "<stepviz>"
MAX_REPR = 40

# Modules pasted code may not import: the JavaScript bridge (which could reach
# the network) and the import machinery that could get around this list.
BLOCKED_MODULES = {
    "js",
    "pyodide",
    "pyodide_js",
    "_pyodide",
    "_pyodide_core",
    "micropip",
    "importlib",
    "ctypes",
    "socket",
    "urllib",
    "http",
    "ssl",
    "os",
    "subprocess",
    "shutil",
    "pathlib",
}


class StopRun(BaseException):
    """Raised from the trace function when a cap is hit. BaseException so a
    student's `except Exception:` does not swallow it."""

    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


# --------------------------------------------------------------------------
# Friendly syntax errors

_FRIENDLY = [
    ("expected ':'", "A colon (:) is missing at the end of this line."),
    ("expected an indented block", "The line after a colon (:) needs to be indented."),
    ("unexpected indent", "This line is indented more than Python expects."),
    ("unindent does not match", "This line's indentation does not line up with the lines above it."),
    ("unterminated string literal", "Some text in quotes is missing its closing quote."),
    ("unterminated triple-quoted string", "Some text in triple quotes is missing its closing quotes."),
    ("was never closed", "A bracket is opened here but never closed."),
    ("unmatched", "There is a closing bracket without a matching opening one."),
    ("does not match opening parenthesis", "The closing bracket does not match the opening one."),
    ("invalid character", "This line has a character Python does not understand."),
    ("inconsistent use of tabs and spaces", "This line mixes tabs and spaces for indentation."),
    ("cannot assign to", "The left side of = must be a variable name."),
    ("invalid syntax", "Python could not understand this line."),
]


def _friendly_message(msg):
    low = (msg or "").lower()
    for needle, friendly in _FRIENDLY:
        if needle in low:
            return friendly
    return (msg or "Python could not understand this line.").rstrip(".") + "."


def _syntax_error(e):
    line = e.lineno or 1
    return {"line": line, "message": "Line %d: %s" % (line, _friendly_message(e.msg))}


# --------------------------------------------------------------------------
# Source analysis


class _GlobalNames(ast.NodeVisitor):
    """Names assigned at module level, in source order (not inside functions)."""

    def __init__(self):
        self.names = []

    def _add(self, name):
        if name not in self.names:
            self.names.append(name)

    def _target(self, t):
        if isinstance(t, ast.Name):
            self._add(t.id)
        elif isinstance(t, (ast.Tuple, ast.List)):
            for elt in t.elts:
                self._target(elt)
        elif isinstance(t, ast.Starred):
            self._target(t.value)

    def visit_FunctionDef(self, node):
        self._add(node.name)

    visit_AsyncFunctionDef = visit_FunctionDef

    def visit_ClassDef(self, node):
        self._add(node.name)

    def visit_Lambda(self, node):
        pass

    def visit_ListComp(self, node):
        pass

    visit_SetComp = visit_DictComp = visit_GeneratorExp = visit_ListComp

    def visit_Assign(self, node):
        for t in node.targets:
            self._target(t)
        self.generic_visit(node)

    def visit_AugAssign(self, node):
        self._target(node.target)

    def visit_AnnAssign(self, node):
        if node.value is not None:
            self._target(node.target)

    def visit_For(self, node):
        self._target(node.target)
        self.generic_visit(node)

    def visit_With(self, node):
        for item in node.items:
            if item.optional_vars is not None:
                self._target(item.optional_vars)
        self.generic_visit(node)

    def visit_NamedExpr(self, node):
        self._target(node.target)

    def visit_Import(self, node):
        pass  # modules are not shown

    visit_ImportFrom = visit_Import


def _count_input_calls(tree):
    n = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "input":
            n += 1
    return n


def analyze(source):
    try:
        tree = ast.parse(source, USER_FILE)
        compile(tree, USER_FILE, "exec")
    except SyntaxError as e:
        return json.dumps({"ok": False, "error": _syntax_error(e)})
    return json.dumps({"ok": True, "inputCalls": _count_input_calls(tree)})


# --------------------------------------------------------------------------
# Value formatting


def _short(value):
    if isinstance(value, (types.FunctionType, types.BuiltinFunctionType, types.MethodType)):
        return "function"
    if isinstance(value, type):
        return "class"
    try:
        text = repr(value)
    except Exception:
        text = "?"
    if len(text) > MAX_REPR:
        text = text[: MAX_REPR - 1] + "…"
    return text


def _hidden(name, value):
    return name.startswith("_") or isinstance(value, types.ModuleType)


def _frame_label(frame):
    code = frame.f_code
    nargs = code.co_argcount + code.co_kwonlyargcount
    names = list(code.co_varnames[:nargs])
    if code.co_flags & 0x04:  # *args
        names.append(code.co_varnames[nargs])
    loc = frame.f_locals
    parts = []
    for n in names:
        if n in loc:
            parts.append(_short(loc[n]))
    return "%s(%s)" % (code.co_name, ", ".join(parts))


# --------------------------------------------------------------------------
# Loops and lists (Screen 3): which list to draw, which positions each line
# looks at, and which lines swap two items.

_SAFE_INDEX_NODES = (
    ast.Expression, ast.Name, ast.Load, ast.Constant, ast.BinOp, ast.UnaryOp,
    ast.Add, ast.Sub, ast.Mult, ast.FloorDiv, ast.Mod, ast.USub, ast.UAdd,
)
_LIST_MUTATORS = {"append", "insert", "pop", "remove", "sort", "reverse", "extend", "clear"}


def _safe_index(node):
    """An index made only of names, numbers and arithmetic (no calls), so it
    can be evaluated again without side effects."""
    return all(isinstance(n, _SAFE_INDEX_NODES) for n in ast.walk(node))


def _subscript_of(node):
    """(list name, index node) for `name[index]`, else None."""
    if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name) and not isinstance(node.slice, ast.Slice):
        return node.value.id, node.slice
    return None


class _ListPlan(ast.NodeVisitor):
    def __init__(self):
        self.loops = []            # enclosing loop nodes (same function scope)
        self.candidates = []       # list names changed inside a loop, best first
        self.weak = []             # names assigned inside a loop (may be lists)
        self.loop_of = {}          # name -> (outer loop, inner loop)
        self.reads = {}            # line -> [(name, compiled index)]
        self.swaps = {}            # line -> (name, compiled a, compiled b)

    def _candidate(self, name, strong=True):
        bucket = self.candidates if strong else self.weak
        if name not in bucket:
            bucket.append(name)
        self.loop_of.setdefault(name, (self.loops[0], self.loops[-1]))

    def visit_FunctionDef(self, node):
        saved, self.loops = self.loops, []
        self.generic_visit(node)
        self.loops = saved

    visit_AsyncFunctionDef = visit_FunctionDef

    def _loop(self, node):
        self.loops.append(node)
        self.generic_visit(node)
        self.loops.pop()

    visit_For = visit_While = _loop

    def _targets(self, targets):
        for t in targets:
            for n in ast.walk(t):
                sub = _subscript_of(n)
                if sub:
                    self._candidate(sub[0])
                elif isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                    self._candidate(n.id, strong=False)

    def visit_Assign(self, node):
        if self.loops:
            self._targets(node.targets)
        self._check_swap(node)
        self.generic_visit(node)

    def visit_AugAssign(self, node):
        if self.loops:
            self._targets([node.target])
        self.generic_visit(node)

    def visit_Call(self, node):
        f = node.func
        if (
            self.loops
            and isinstance(f, ast.Attribute)
            and isinstance(f.value, ast.Name)
            and f.attr in _LIST_MUTATORS
        ):
            self._candidate(f.value.id)
        self.generic_visit(node)

    def visit_Subscript(self, node):
        sub = _subscript_of(node)
        if sub and _safe_index(sub[1]):
            code = compile(ast.Expression(sub[1]), USER_FILE, "eval")
            seen = self.reads.setdefault(node.lineno, [])
            key = (sub[0], ast.unparse(sub[1]))
            if key not in [k for k, _ in seen]:
                seen.append((key, code))
        self.generic_visit(node)

    def _check_swap(self, node):
        # nums[a], nums[b] = nums[b], nums[a]
        if len(node.targets) != 1:
            return
        t, v = node.targets[0], node.value
        if not (isinstance(t, ast.Tuple) and isinstance(v, ast.Tuple) and len(t.elts) == 2 == len(v.elts)):
            return
        subs = [_subscript_of(n) for n in (*t.elts, *v.elts)]
        if not all(subs) or len({s[0] for s in subs}) != 1:
            return
        if not all(_safe_index(s[1]) for s in subs):
            return
        idx = [ast.unparse(s[1]) for s in subs]
        if idx[0] == idx[3] and idx[1] == idx[2]:
            compile_ = lambda n: compile(ast.Expression(n), USER_FILE, "eval")
            self.swaps[node.lineno] = (subs[0][0], compile_(subs[0][1]), compile_(subs[1][1]))


# --------------------------------------------------------------------------
# Step kinds (for the rule-based explainer): what each line does.


def _calls_named(node, name):
    return any(
        isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == name for n in ast.walk(node)
    )


def _target_names(targets):
    names = []
    for t in targets:
        for n in ast.walk(t):
            if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store) and n.id not in names:
                names.append(n.id)
            elif isinstance(n, ast.Subscript) and isinstance(n.value, ast.Name) and n.value.id not in names:
                names.append(n.value.id)
    return names


def _block_range(stmts):
    if not stmts:
        return None
    return [stmts[0].lineno, max(getattr(n, "end_lineno", n.lineno) for n in stmts)]


def _line_kinds(tree, source):
    """line -> what the statement starting on that line does (outermost statement)."""
    info = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.stmt) or node.lineno in info:
            continue
        seg = lambda n: (ast.get_source_segment(source, n) or "").strip()
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            info[node.lineno] = {"kind": "define", "targets": [node.name]}
        elif isinstance(node, ast.If):
            info[node.lineno] = {"kind": "branch", "body": _block_range(node.body), "else": _block_range(node.orelse), "condition": seg(node.test)}
        elif isinstance(node, ast.For):
            var = node.target.id if isinstance(node.target, ast.Name) else None
            info[node.lineno] = {"kind": "loop", "body": _block_range(node.body), "loopVar": var}
        elif isinstance(node, ast.While):
            info[node.lineno] = {"kind": "loop", "body": _block_range(node.body), "condition": seg(node.test)}
        elif isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            simultaneous = isinstance(node, ast.Assign) and any(
                isinstance(t, (ast.Tuple, ast.List)) and len(t.elts) > 1 for t in node.targets
            )
            value = node.value if node.value is not None else node
            kind = "input" if _calls_named(value, "input") else "assign"
            info[node.lineno] = {"kind": kind, "targets": _target_names(targets), "simultaneous": simultaneous}
        elif isinstance(node, ast.Expr) and _calls_named(node, "print"):
            info[node.lineno] = {"kind": "print"}
        elif isinstance(node, ast.Expr) and _calls_named(node, "input"):
            info[node.lineno] = {"kind": "input", "targets": []}
        else:
            info[node.lineno] = {"kind": "other"}
    return info


def _in_range(line, rng):
    return line is not None and rng is not None and rng[0] <= line <= rng[1]


def _classify(info, line, next_line, active_loops):
    """(kind, detail) for the line that just finished, given the line that runs next."""
    i = info.get(line) or {"kind": "other"}
    kind = i["kind"]
    detail = {}
    if kind == "branch":
        taken = _in_range(next_line, i["body"])
        kind = "branch-taken" if taken else "branch-skipped"
        if i["condition"]:
            detail["condition"] = i["condition"]
        if not taken and _in_range(next_line, i["else"]):
            detail["toElse"] = True
    elif kind == "loop":
        if _in_range(next_line, i["body"]):
            kind = "loop-next" if line in active_loops else "loop-start"
            active_loops.add(line)
        else:
            kind = "loop-end"
            active_loops.discard(line)
        if i.get("loopVar"):
            detail["loopVar"] = i["loopVar"]
        if i.get("condition"):
            detail["condition"] = i["condition"]
    elif kind in ("assign", "input", "define"):
        if i.get("targets"):
            detail["targets"] = i["targets"]
        if i.get("simultaneous"):
            detail["simultaneous"] = True
    return kind, detail


def _loop_var(loop):
    if isinstance(loop, ast.For) and isinstance(loop.target, ast.Name):
        return loop.target.id
    return None


def _eval_index(code, frame, length):
    try:
        i = eval(code, frame.f_globals, dict(frame.f_locals))
    except Exception:
        return None
    if not isinstance(i, int) or isinstance(i, bool):
        return None
    if -length <= i < 0:
        i += length
    return i if 0 <= i < length else None


# --------------------------------------------------------------------------
# Running with the tracer


def _safe_builtins(out, inputs):
    real_import = builtins.__import__
    queue = list(inputs)

    def guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
        root = name.split(".")[0]
        if level == 0 and root in BLOCKED_MODULES:
            raise ImportError("The module '%s' is not available in StepViz." % root)
        return real_import(name, globals, locals, fromlist, level)

    def fake_input(prompt=""):
        out.write(str(prompt))
        if not queue:
            raise EOFError("Your program asked for more input than you typed.")
        value = queue.pop(0)
        out.write(value + "\n")
        return value

    b = dict(builtins.__dict__)
    b["__import__"] = guarded_import
    b["input"] = fake_input
    for name in ("open", "exit", "quit", "breakpoint", "help", "copyright", "credits", "license"):
        b.pop(name, None)
    return b


def run(source, inputs_json="[]", max_steps=2000, max_seconds=5.0):
    try:
        tree = ast.parse(source, USER_FILE)
        code = compile(tree, USER_FILE, "exec")
    except SyntaxError as e:
        return json.dumps({"status": "syntax-error", "error": _syntax_error(e), "steps": []})

    global_names = _GlobalNames()
    global_names.visit(tree)
    order = global_names.names

    plan = _ListPlan()
    plan.visit(tree)
    kinds = _line_kinds(tree, source)
    list_names = plan.candidates + [n for n in plan.weak if n not in plan.candidates]

    out = io.StringIO()
    g = {"__name__": "__main__", "__builtins__": _safe_builtins(out, json.loads(inputs_json))}

    steps = []
    # Each entry: [frame, label, pending_line, raised, active_loops]. Bottom to
    # top; index 0 is the module (Global). pending_line is the line that is
    # running in that frame and gets its step when it finishes; active_loops
    # holds the header lines of loops that have started (for loop-start/next).
    stack = []
    deadline = time.monotonic() + max_seconds
    # "crash": the step to show if an exception ends the program. Taken when
    # the exception first appears, in the frame where it happened; cleared
    # when the program carries on (the exception was caught).
    state = {"module": None, "crash": None, "crash_exc": None}

    def global_vars():
        result = {}
        for name in order:
            if name in g:
                if not _hidden(name, g[name]):
                    result[name] = _short(g[name])
            else:
                result[name] = "?"
        for name, value in g.items():
            if name not in result and name not in order and not _hidden(name, value):
                result[name] = _short(value)
        return result

    def local_vars(frame):
        result = {}
        for name, value in frame.f_locals.items():
            if not _hidden(name, value):
                result[name] = _short(value)
        return result

    def snapshot(line, returning=None, error=False):
        frames = []
        top = len(stack) - 1
        for i, (frame, label, *_rest) in enumerate(stack):
            vars_ = global_vars() if i == 0 else local_vars(frame)
            if i < top:
                status = "waiting"
            elif error:
                status = "error"
            elif returning is not None:
                status = "returning"
            else:
                status = "running"
            entry = {"name": label, "vars": vars_, "status": status}
            if i == top and returning is not None and not error:
                entry["returns"] = "returns " + _short(returning)
            frames.append(entry)
        step = {"line": line, "frames": frames, "output": out.getvalue()}
        if list_names:
            lists, looks = {}, {}
            for name in list_names:
                frame = find_list_frame(name)
                if frame is None:
                    continue
                value = frame.f_locals[name] if name in frame.f_locals else frame.f_globals[name]
                lists[name] = [_short(v) for v in value]
                idx = []
                for (ref, _text), code in plan.reads.get(line, []):
                    if ref == name:
                        i = _eval_index(code, frame, len(value))
                        if i is not None and i not in idx:
                            idx.append(i)
                if idx:
                    looks[name] = idx
            step["_lists"] = lists
            step["_looks"] = looks
        return step

    def find_list_frame(name):
        """The newest frame where `name` is a list (locals first, then globals)."""
        for frame, *_ in reversed(stack):
            local = frame.f_locals
            if name in local:
                if isinstance(local[name], list):
                    return frame
            elif isinstance(frame.f_globals.get(name), list):
                return frame
        return None

    def record(line, returning=None, swap=None, kind="other", detail=None):
        if len(steps) >= max_steps:
            raise StopRun("steps")
        step = snapshot(line, returning)
        if swap is not None:
            step["_swap"] = swap
        step["kind"] = kind
        if detail:
            step["detail"] = detail
        steps.append(step)

    def record_line(entry, next_line):
        """The pending line of this frame has finished; `next_line` runs next."""
        kind, detail = _classify(kinds, entry[2], next_line, entry[4])
        record(entry[2], kind=kind, detail=detail)

    def record_swap_before(frame, line):
        """A swap line is shown before it runs: the old list and an arrow."""
        name, code_a, code_b = plan.swaps[line]
        f = find_list_frame(name)
        if f is None:
            return False
        value = f.f_locals[name] if name in f.f_locals else f.f_globals[name]
        a, b = _eval_index(code_a, f, len(value)), _eval_index(code_b, f, len(value))
        if a is None or b is None:
            return False
        record(line, swap={"list": name, "pair": [a, b]}, kind="swap")
        return True

    def local_trace(frame, event, arg):
        if time.monotonic() > deadline:
            raise StopRun("time")
        if not stack or stack[-1][0] is not frame:
            return local_trace
        entry = stack[-1]
        if event == "line":  # the program carried on, so any exception was caught
            state["crash"] = None
            state["crash_exc"] = None
        if event == "line":
            if entry[2] is not None:
                record_line(entry, frame.f_lineno)  # the previous line in this frame has finished
            entry[2] = frame.f_lineno
            entry[3] = False
            if frame.f_lineno in plan.swaps and record_swap_before(frame, frame.f_lineno):
                entry[2] = None  # already shown; the next step shows the swapped list
        elif event == "exception":
            entry[3] = True
            exc = arg[1] if isinstance(arg, tuple) and len(arg) > 1 else None
            if state["crash_exc"] is not exc or state["crash"] is None:
                state["crash"] = snapshot(frame.f_lineno, error=True)
                state["crash"]["kind"] = "crash"
                state["crash_exc"] = exc
        elif event == "return":
            if frame is state["module"]:
                if entry[2] is not None and not entry[3]:
                    record_line(entry, None)  # the last line of the program
                return None
            if not entry[3]:
                record(frame.f_lineno, returning=arg, kind="return")
            stack.pop()
        return local_trace

    def global_trace(frame, event, arg):
        if frame.f_code.co_filename != USER_FILE:
            return None
        if time.monotonic() > deadline:
            raise StopRun("time")
        if event != "call":
            return None
        if state["module"] is None:
            state["module"] = frame
            stack.append([frame, "Global", None, False, set()])
            return local_trace
        name = frame.f_code.co_name
        if name.startswith("<"):  # lambdas, generator expressions
            return None
        stack.append([frame, _frame_label(frame), None, False, set()])
        caller = frame.f_back
        record(caller.f_lineno if caller is not None else frame.f_lineno, kind="call")
        return local_trace

    status = "ok"
    error = None
    real_stdout = sys.stdout
    old_limit = sys.getrecursionlimit()
    sys.setrecursionlimit(200)
    sys.stdout = out
    sys.settrace(global_trace)
    try:
        exec(code, g)
    except StopRun:
        status = "cap"
    except RecursionError:
        status = "cap"
    except BaseException as e:  # runtime error in the student's program
        status = "runtime-error"
        tb = e.__traceback__
        line = None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == USER_FILE:
                line = tb.tb_lineno
            tb = tb.tb_next
        error = {"line": line, "type": type(e).__name__, "message": str(e)}
        crash = state["crash"]
        if crash is not None and steps:
            crash["output"] = out.getvalue()
            crash["error"] = {"type": error["type"], "message": error["message"]}
            steps.append(crash)
    finally:
        sys.settrace(None)
        sys.stdout = real_stdout
        sys.setrecursionlimit(old_limit)

    if status == "ok" and time.monotonic() > deadline:
        status = "cap"

    list_view = _choose_list_view(plan, steps)
    for step in steps:
        lists = step.pop("_lists", None)
        looks = step.pop("_looks", None)
        swap = step.pop("_swap", None)
        if list_view and lists and list_view["list"] in lists:
            name = list_view["list"]
            entry = {"values": lists[name]}
            if looks and name in looks:
                entry["compare"] = looks[name]
            if swap and swap["list"] == name:
                entry["swap"] = swap["pair"]
                entry["compare"] = swap["pair"]
            step["list"] = entry

    result = {"status": status, "error": error, "steps": steps}
    if list_view:
        result["listView"] = list_view
    return json.dumps(result, ensure_ascii=False)


def _choose_list_view(plan, steps):
    """Use the loops-and-lists view if a list changes inside a loop (spec section 4)."""
    for name in plan.candidates + plan.weak:
        outer, inner = plan.loop_of[name]
        first, last = outer.lineno, outer.end_lineno
        prev = None
        for step in steps:
            values = step.get("_lists", {}).get(name)
            if values is not None and prev is not None and values != prev and first <= step["line"] <= last:
                loop_vars = [v for v in (_loop_var(outer), _loop_var(inner)) if v]
                return {
                    "list": name,
                    "outerLine": first,
                    "outerEndLine": last,
                    "loopVars": list(dict.fromkeys(loop_vars)),
                }
            if values is not None:
                prev = values
    return None


def lock_down():
    """Called once after Pyodide has loaded, before any student code runs.
    Removes the Python-to-JavaScript bridge from the import system."""
    sys.meta_path[:] = [f for f in sys.meta_path if type(f).__name__ != "JsFinder"]
    for name in list(sys.modules):
        if name.split(".")[0] in ("js", "pyodide_js", "micropip"):
            sys.modules[name] = None
