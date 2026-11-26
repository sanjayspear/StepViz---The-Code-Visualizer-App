# Practice tests for Python answers. Loaded into the Python worker after tracer.py
# (it uses its sandbox: _safe_builtins, _syntax_error, StopRun, USER_FILE), so a student's
# answer runs exactly where the visualiser runs code: no network, blocked imports.
#
# check(source, spec_json, max_seconds) -> JSON
#   spec: {"tests": [{"call": "is_even", "args": [4], "expected": true, "compare": "exact"}],
#          "forbid": {"names": ["bin"], "ops": ["%"], "why": "..."}}
#   compare: "exact" (the default: same value and kind; a tuple counts as a list),
#            "approx" (numbers within 1e-9), "unordered" (lists in any order).
# Every test gets a fresh copy of its arguments and its own time limit. Nothing is traced.

import copy as _copy
import io as _io
import json as _json
import sys as _sys
import time as _time
import tokenize as _tokenize


def _plain(value):
    """Tuples become lists, so (2, 1) and [2, 1] compare alike, like the expected values in JSON."""
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, dict):
        return {k: _plain(v) for k, v in value.items()}
    return value


def _same(got, expected, how):
    got = _plain(got)
    if how == "unordered" and isinstance(got, list) and isinstance(expected, list):
        return _same(sorted(got, key=repr), sorted(expected, key=repr), "exact")
    if how == "approx" and isinstance(got, (int, float)) and not isinstance(got, bool) and isinstance(expected, (int, float)):
        return abs(got - expected) <= 1e-9 * max(1.0, abs(expected))
    # Exact: True is not 1, 2.0 is not 2 (the question asks for one kind of answer).
    if type(got) is bool or type(expected) is bool:
        return type(got) is type(expected) and got == expected
    if isinstance(expected, int) and isinstance(got, float):
        return False
    if isinstance(expected, list):
        return isinstance(got, list) and len(got) == len(expected) and all(_same(g, e, how) for g, e in zip(got, expected))
    if isinstance(expected, dict):
        return isinstance(got, dict) and got.keys() == expected.keys() and all(_same(got[k], expected[k], how) for k in expected)
    return type(got) is type(expected) and got == expected


def _forbidden(source, forbid):
    """Names or operators the question asks not to use, found by Python's own tokenizer
    (so text inside quotes and comments does not count). Returns [line, word] or None."""
    if not forbid:
        return None
    names = set(forbid.get("names", []))
    ops = set(forbid.get("ops", []))
    try:
        for tok in _tokenize.generate_tokens(_io.StringIO(source).readline):
            if tok.type == _tokenize.NAME and tok.string in names:
                return [tok.start[0], tok.string]
            if tok.type == _tokenize.OP and tok.string in ops:
                return [tok.start[0], tok.string]
    except (_tokenize.TokenError, IndentationError, SyntaxError):
        return None
    return None


def _call_text(name, args):
    return "%s(%s)" % (name, ", ".join(repr(a) for a in args))


PER_TEST_SECONDS = 2.0


def check(source, spec_json, max_seconds=5.0):
    spec = _json.loads(spec_json)
    try:
        code = compile(source, USER_FILE, "exec")
    except SyntaxError as e:
        return _json.dumps({"status": "syntax-error", "error": _syntax_error(e), "results": []})

    hit = _forbidden(source, spec.get("forbid"))
    if hit:
        return _json.dumps({"status": "forbidden", "line": hit[0], "word": hit[1], "why": spec["forbid"].get("why", ""), "results": []})

    out = _io.StringIO()
    g = {"__name__": "__main__", "__builtins__": _safe_builtins(out, [])}
    # Each test gets PER_TEST_SECONDS; all of it together max_seconds (so the page's watchdog never has to step in).
    total_deadline = _time.monotonic() + max_seconds
    state = {"deadline": total_deadline}

    def watch(frame, event, arg):
        # A light time check: only at calls and lines of the student's own code.
        if _time.monotonic() > state["deadline"]:
            raise StopRun("time")
        return watch if frame.f_code.co_filename == USER_FILE else None

    old_stdout = _sys.stdout
    old_limit = _sys.getrecursionlimit()
    _sys.setrecursionlimit(min(old_limit, 1000))
    try:
        # The whole program first (its functions, and any lines at the bottom like print(...)).
        _sys.stdout = out
        _sys.settrace(watch)
        try:
            exec(code, g)
        except StopRun:
            return _json.dumps({"status": "timeout", "where": "program", "results": []})
        except RecursionError:
            return _json.dumps({"status": "error", "where": "program", "errorType": "RecursionError", "message": "the function kept calling itself", "results": []})
        except BaseException as e:  # the student's program stopped before the tests
            return _json.dumps({"status": "error", "where": "program", "errorType": type(e).__name__, "message": str(e), "line": _user_line(e), "results": []})
        finally:
            _sys.settrace(None)

        results = []
        for t in spec["tests"]:
            name = t["call"]
            args = _copy.deepcopy(t["args"])
            shown = _call_text(name, t["args"])
            fn = g.get(name)
            entry = {"call": shown, "expected": repr(t["expected"])}
            if not callable(fn):
                entry.update(passed=False, problem="missing", got="")
                results.append(entry)
                continue
            if _time.monotonic() >= total_deadline:
                entry.update(passed=False, problem="skipped", got="")
                results.append(entry)
                continue
            state["deadline"] = min(_time.monotonic() + PER_TEST_SECONDS, total_deadline)
            out.seek(0)
            out.truncate()
            _sys.settrace(watch)
            try:
                got = fn(*args)
                _sys.settrace(None)
                entry.update(passed=_same(got, t["expected"], t.get("compare", "exact")), got=repr(got))
                if isinstance(got, tuple) and isinstance(t["expected"], list):
                    entry["expected"] = repr(tuple(t["expected"]))  # show (5, 3) when the answer is a tuple
            except StopRun:
                _sys.settrace(None)
                entry.update(passed=False, problem="timeout", got="")
            except RecursionError:
                _sys.settrace(None)
                entry.update(passed=False, problem="error", errorType="RecursionError", message="the function kept calling itself", got="")
            except BaseException as e:
                _sys.settrace(None)
                entry.update(passed=False, problem="error", errorType=type(e).__name__, message=str(e), line=_user_line(e), got="")
            results.append(entry)
        return _json.dumps({"status": "ok", "results": results})
    finally:
        _sys.settrace(None)
        _sys.stdout = old_stdout
        _sys.setrecursionlimit(old_limit)


def _user_line(e):
    """The last line of the student's own code in the error's traceback."""
    tb = e.__traceback__
    line = None
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == USER_FILE:
            line = tb.tb_lineno
        tb = tb.tb_next
    return line
