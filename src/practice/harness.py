# Practice tests for Python answers. Loaded into the Python worker after tracer.py
# (it uses its sandbox: _safe_builtins, _syntax_error, StopRun, USER_FILE), so a student's
# answer runs exactly where the visualiser runs code: no network, blocked imports.
#
# check(source, spec_json, max_seconds) -> JSON
#   spec: {"tests": [test, ...], "forbid": {"names": [...], "ops": [...], "patterns": [...], "why": "..."}}
#   test: {"call": "is_even", "args": [4], "expected": true}
#     compare   "exact" (default: same value and kind; a tuple counts as a list), "approx",
#               "unordered" (a list in any order), "sets" (any order, and each inner list in
#               any order), "output" (what the call printed), or a check of the answer's shape:
#               "topo", "peak", "gray", "inorder"
#     mutated   {"arg": 0, "value": [...], "prefix": true}: the argument after the call
#               (prefix: only its first <returned number> items)
#     returns   "index" / "value": a node of the input list is reported as its position / value
#     then      a second function applied to the result (serialize, then deserialize)
#     copy      the answer must not share nodes with the input (deep copies)
#     intKeys   the expected dictionary has number keys ({"1": 2} in JSON means {1: 2})
#     setup     {"intersect": {"a": [...], "b": [...], "common": [...]}}: two lists sharing a tail
#     call "$ops" with "cls" and "ops" [["LRUCache", 2], ["put", 1, 1], ["get", 1]]:
#               make the object, call each method, compare the list of answers
#   Values built from markers: {"$list": [1, 2]} a linked list, {"$cycle": [...], "pos": 1},
#   {"$tree": [3, 9, null, 7]} a binary tree (level order), {"$randlist": [[7, null], [13, 0]]},
#   {"$graph": [[2, 4], [1, 3], ...]} (nodes 1..n), {"$guess": 6}, {"$bad": 4}, {"$reader": [...]}.
#   The program's own ListNode / TreeNode / Node class is used when it defines one.
# Every test gets a fresh copy of its arguments and its own time limit. Nothing is traced.

import copy as _copy
import io as _io
import json as _json
import re as _re
import sys as _sys
import time as _time
import tokenize as _tokenize


# ---- building values ------------------------------------------------------------------------

class _ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class _TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class _Node:
    def __init__(self, val=0, next=None, random=None, neighbors=None):
        self.val = val
        self.next = next
        self.random = random
        self.neighbors = neighbors if neighbors is not None else []


def _new(cls, *args):
    try:
        return cls(*args)
    except TypeError:
        obj = cls.__new__(cls)
        return obj


class _Ctx:
    def __init__(self, g):
        self.list_cls = g.get("ListNode") if isinstance(g.get("ListNode"), type) else _ListNode
        self.tree_cls = g.get("TreeNode") if isinstance(g.get("TreeNode"), type) else _TreeNode
        self.node_cls = g.get("Node") if isinstance(g.get("Node"), type) else _Node
        self.inputs = []  # every node made for the arguments (for "copy" and "returns")
        self.list_nodes = []  # nodes of the input list(s), in order (for returns: index)
        self.calls = 0


def _make_list(values, ctx, pos=-1):
    head = None
    nodes = []
    for v in values:
        node = _new(ctx.list_cls, v)
        node.val = v
        node.next = None
        nodes.append(node)
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if nodes and pos is not None and pos >= 0:
        nodes[-1].next = nodes[pos]
    head = nodes[0] if nodes else None
    ctx.inputs.extend(nodes)
    ctx.list_nodes.extend(nodes)
    return head


def _make_tree(values, ctx):
    if not values or values[0] is None:
        return None
    def node(v):
        n = _new(ctx.tree_cls, v)
        n.val, n.left, n.right = v, None, None
        ctx.inputs.append(n)
        return n
    root = node(values[0])
    queue = [root]
    i = 1
    while queue and i < len(values):
        cur = queue.pop(0)
        if i < len(values) and values[i] is not None:
            cur.left = node(values[i])
            queue.append(cur.left)
        i += 1
        if i < len(values) and values[i] is not None:
            cur.right = node(values[i])
            queue.append(cur.right)
        i += 1
    return root


def _build(value, ctx):
    if isinstance(value, list):
        return [_build(v, ctx) for v in value]
    if not isinstance(value, dict):
        return value
    if "$list" in value:
        return _make_list(value["$list"], ctx)
    if "$cycle" in value:
        return _make_list(value["$cycle"], ctx, value.get("pos", -1))
    if "$tree" in value:
        return _make_tree(value["$tree"], ctx)
    if "$randlist" in value:
        nodes = []
        for v, _r in value["$randlist"]:
            n = _new(ctx.node_cls, v)
            n.val, n.next, n.random = v, None, None
            nodes.append(n)
        for a, b in zip(nodes, nodes[1:]):
            a.next = b
        for n, (_v, r) in zip(nodes, value["$randlist"]):
            n.random = nodes[r] if r is not None else None
        ctx.inputs.extend(nodes)
        return nodes[0] if nodes else None
    if "$graph" in value:
        adj = value["$graph"]
        nodes = []
        for i in range(len(adj)):
            n = _new(ctx.node_cls, i + 1)
            n.val, n.neighbors = i + 1, []
            nodes.append(n)
        for n, nbrs in zip(nodes, adj):
            n.neighbors = [nodes[k - 1] for k in nbrs]
        ctx.inputs.extend(nodes)
        return nodes[0] if nodes else None
    if "$guess" in value:
        pick = value["$guess"]
        def guess(num):
            ctx.calls += 1
            return 0 if num == pick else (-1 if pick < num else 1)
        return guess
    if "$bad" in value:
        first = value["$bad"]
        def is_bad(version):
            ctx.calls += 1
            return version >= first
        return is_bad
    if "$reader" in value:
        data = value["$reader"]
        class Reader:
            def get(self, i):
                return data[i] if 0 <= i < len(data) else 2147483647
        return Reader()
    return {k: _build(v, ctx) for k, v in value.items()}


# ---- reading answers back ---------------------------------------------------------------------

def _is_node(x, *attrs):
    return x is not None and not isinstance(x, (int, float, str, bool, list, tuple, dict)) and all(hasattr(x, a) for a in attrs)


def _export(value, depth=0):
    """Plain values for comparing and showing: nodes become {"$list": ...}, {"$tree": ...} and so on."""
    if depth > 50:
        return "..."
    if isinstance(value, (list, tuple)):
        return [_export(v, depth + 1) for v in value]
    if isinstance(value, dict):
        return {k: _export(v, depth + 1) for k, v in value.items()}
    if _is_node(value, "neighbors"):
        order, index, queue = [], {}, [value]
        index[id(value)] = 1
        while queue:
            n = queue.pop(0)
            order.append(n)
            for m in n.neighbors:
                if id(m) not in index:
                    index[id(m)] = len(index) + 1
                    queue.append(m)
        by_val = sorted(order, key=lambda n: n.val)
        return {"$graph": [sorted(m.val for m in n.neighbors) for n in by_val]}
    if _is_node(value, "random", "next"):
        nodes, seen = [], set()
        n = value
        while n is not None and id(n) not in seen and len(nodes) < 10000:
            seen.add(id(n))
            nodes.append(n)
            n = n.next
        pos = {id(x): i for i, x in enumerate(nodes)}
        return {"$randlist": [[x.val, pos.get(id(x.random)) if x.random is not None else None] for x in nodes]}
    if _is_node(value, "left", "right", "val"):
        out, queue = [], [value]
        while queue:
            n = queue.pop(0)
            if n is None:
                out.append(None)
                continue
            out.append(n.val)
            queue.append(n.left)
            queue.append(n.right)
            if len(out) > 20000:
                break
        while out and out[-1] is None:
            out.pop()
        return {"$tree": out}
    if _is_node(value, "next", "val"):
        values, seen, nodes = [], {}, []
        n = value
        while n is not None and id(n) not in seen and len(values) < 10000:
            seen[id(n)] = len(values)
            values.append(n.val)
            n = n.next
        if n is not None:
            return {"$cycle": values, "pos": seen.get(id(n), -1)}
        return {"$list": values}
    return value


def _nodes_of(value):
    """Every node reachable from an answer (for the deep-copy check)."""
    found, todo = [], [value]
    seen = set()
    while todo and len(found) < 20000:
        x = todo.pop()
        if x is None or id(x) in seen or isinstance(x, (int, float, str, bool)):
            continue
        if isinstance(x, (list, tuple)):
            todo.extend(x)
            continue
        if not any(hasattr(x, a) for a in ("next", "left", "neighbors", "random")):
            continue
        seen.add(id(x))
        found.append(x)
        for a in ("next", "left", "right", "random"):
            todo.append(getattr(x, a, None))
        todo.extend(getattr(x, "neighbors", []) or [])
    return found


def _text(value):
    """How a value is shown in a test line."""
    if isinstance(value, dict):
        if "$list" in value:
            return "list " + (" -> ".join(repr(v) for v in value["$list"]) if value["$list"] else "(empty)")
        if "$cycle" in value:
            body = " -> ".join(repr(v) for v in value["$cycle"])
            return "list %s (the last node links back to position %d)" % (body, value.get("pos", -1)) if value.get("pos", -1) >= 0 else "list " + body
        if "$tree" in value:
            return "tree %s" % repr(value["$tree"])
        if "$randlist" in value:
            return "list %s" % repr(value["$randlist"])
        if "$graph" in value:
            return "graph %s" % repr(value["$graph"])
        if "$guess" in value:
            return "guess (the hidden number is %d)" % value["$guess"]
        if "$bad" in value:
            return "is_bad (the first bad version is %d)" % value["$bad"]
        if "$reader" in value:
            return "reader %s" % repr(value["$reader"])
        return "{%s}" % ", ".join("%s: %s" % (repr(k), _text(v)) for k, v in value.items())
    if isinstance(value, list):
        return "[%s]" % ", ".join(_text(v) for v in value)
    if isinstance(value, tuple):
        return "(%s)" % ", ".join(_text(v) for v in value) + ("," if len(value) == 1 else "")
    return repr(value)


# ---- comparing --------------------------------------------------------------------------------

def _plain(value):
    """Tuples become lists, so (2, 1) and [2, 1] compare alike, like the expected values in JSON."""
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, dict):
        return {k: _plain(v) for k, v in value.items()}
    return value


def _same(got, expected, how="exact"):
    got = _plain(got)
    if how == "unordered" and isinstance(got, list) and isinstance(expected, list):
        return _same(sorted(got, key=repr), sorted(expected, key=repr))
    if how == "sets" and isinstance(got, list) and isinstance(expected, list):
        norm = lambda xs: sorted((sorted(x, key=repr) if isinstance(x, list) else x for x in xs), key=repr)
        return _same(norm(got), norm(expected))
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


def _shape_ok(how, got, args, expected):
    """Answers with many right forms: check the shape instead of one exact answer."""
    got = _plain(got)
    if how == "topo":  # args: n, prerequisites [[course, before]]; expected: True if an order exists
        n, pre = args[0], args[1]
        if expected is False:
            return got == []
        if not isinstance(got, list) or sorted(got) != list(range(n)):
            return False
        at = {c: i for i, c in enumerate(got)}
        return all(at[b] < at[a] for a, b in pre)
    if how == "peak":
        nums = args[0]
        if not isinstance(got, int) or isinstance(got, bool) or not 0 <= got < len(nums):
            return False
        left = nums[got - 1] if got > 0 else float("-inf")
        right = nums[got + 1] if got + 1 < len(nums) else float("-inf")
        return nums[got] > left and nums[got] > right
    if how == "gray":
        n = args[0]
        if not isinstance(got, list) or len(got) != 2 ** n or got[0] != 0 or sorted(got) != list(range(2 ** n)):
            return False
        return all(bin(a ^ b).count("1") == 1 for a, b in zip(got, got[1:]))
    if how == "inorder":  # a BST after a change: its values in order, and a valid BST
        tree = _export(got) if not isinstance(got, dict) else got
        values = tree.get("$tree", []) if isinstance(tree, dict) else None
        return values is not None and _tree_inorder(values) == expected and _is_bst(values)
    return False


def _tree_nodes(values):
    """(value, left index, right index) for a level-order list."""
    nodes, kids, queue, i = [], {}, [], 1
    if not values or values[0] is None:
        return []
    nodes.append([values[0], None, None])
    queue.append(0)
    while queue and i < len(values):
        cur = queue.pop(0)
        for side in (1, 2):
            if i < len(values) and values[i] is not None:
                nodes.append([values[i], None, None])
                nodes[cur][side] = len(nodes) - 1
                queue.append(len(nodes) - 1)
            i += 1
    return nodes


def _tree_inorder(values):
    nodes = _tree_nodes(values)
    out = []
    def walk(i):
        if i is None:
            return
        walk(nodes[i][1])
        out.append(nodes[i][0])
        walk(nodes[i][2])
    if nodes:
        walk(0)
    return out


def _is_bst(values):
    order = _tree_inorder(values)
    return all(a < b for a, b in zip(order, order[1:]))


# ---- rules ------------------------------------------------------------------------------------

def _forbidden(source, forbid):
    """Names, operators or patterns the question asks not to use, found by Python's own tokenizer
    (so text inside quotes and comments does not count). Returns [line, word] or None."""
    if not forbid:
        return None
    names = set(forbid.get("names", []))
    ops = set(forbid.get("ops", []))
    patterns = forbid.get("patterns", [])
    code_only = []
    try:
        for tok in _tokenize.generate_tokens(_io.StringIO(source).readline):
            if tok.type == _tokenize.NAME and tok.string in names:
                return [tok.start[0], tok.string]
            if tok.type == _tokenize.OP and tok.string in ops:
                return [tok.start[0], tok.string]
            if tok.type not in (_tokenize.STRING, _tokenize.COMMENT):
                code_only.append((tok.start[0], tok.string))
    except (_tokenize.TokenError, IndentationError, SyntaxError):
        return None
    for p in patterns:
        rx = _re.compile(p["regex"])
        by_line = {}
        for line, text in code_only:
            by_line[line] = by_line.get(line, "") + text
        for line in sorted(by_line):
            if rx.search(by_line[line]):
                return [line, p["shown"]]
    return None


def _call_text(name, args):
    return "%s(%s)" % (name, ", ".join(_text(a) for a in args))


# ---- running ----------------------------------------------------------------------------------

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
            entry = _run_test(t, g, out, state, total_deadline, watch)
            results.append(entry)
        return _json.dumps({"status": "ok", "results": results})
    finally:
        _sys.settrace(None)
        _sys.stdout = old_stdout
        _sys.setrecursionlimit(old_limit)


def _shown_call(t):
    if t["call"] == "$ops":
        steps = ["%s(%s)" % (op[0], ", ".join(_text(a) for a in op[1:])) for op in t["ops"]]
        return "; ".join(steps)
    if "setup" in t and "intersect" in t["setup"]:
        s = t["setup"]["intersect"]
        a = s["a"] + s["common"]
        b = s["b"] + s["common"]
        return "%s(list %s, list %s) (they share %s)" % (t["call"], " -> ".join(map(repr, a)), " -> ".join(map(repr, b)), " -> ".join(map(repr, s["common"])) if s["common"] else "nothing")
    text = _call_text(t["call"], t.get("args", []))
    if t.get("then"):
        text = "%s(%s)" % (t["then"], text)
    return text


def _expected_text(t):
    how = t.get("compare", "exact")
    if how == "output":
        return repr(t["expected"])
    if how == "topo":
        return "an order where each course comes after the ones it needs" if t["expected"] is not False else "[] (no order is possible)"
    if how == "peak":
        return "the position of any peak"
    if how == "gray":
        return "a Gray code: 0 first, each number differs from the next in one bit"
    if how == "inorder":
        return "a valid BST holding %s" % repr(t["expected"])
    text = _text(t["expected"])
    if how in ("unordered", "sets"):
        text += " (in any order)"
    if "mutated" in t:
        m = t["mutated"]
        changed = "the first <answer> items of " if m.get("prefix") else ""
        after = "%sargument %d becomes %s" % (changed, m["arg"] + 1, _text(m["value"]))
        text = after if t["expected"] is None and not m.get("prefix") else "%s, and %s" % (text, after)
    return text


def _run_test(t, g, out, state, total_deadline, watch):
    if t.get("intKeys") and isinstance(t.get("expected"), dict):
        # {1: 2} written in JSON as {"1": 2}: the keys are numbers.
        t = dict(t)
        t["expected"] = {int(k): v for k, v in t["expected"].items()}
    entry = {"call": _shown_call(t), "expected": _expected_text(t)}
    ctx = _Ctx(g)
    is_ops = t["call"] == "$ops"
    target = g.get(t["cls"] if is_ops else t["call"])
    if not callable(target):
        entry.update(passed=False, problem="missing", got="")
        entry["missing"] = t["cls"] if is_ops else t["call"]
        return entry
    if _time.monotonic() >= total_deadline:
        entry.update(passed=False, problem="skipped", got="")
        return entry
    state["deadline"] = min(_time.monotonic() + PER_TEST_SECONDS, total_deadline)
    out.seek(0)
    out.truncate()
    try:
        if "setup" in t and "intersect" in t["setup"]:
            s = t["setup"]["intersect"]
            common = _make_list(s["common"], ctx)
            def with_tail(values):
                head = _make_list(values, ctx)
                if head is None:
                    return common
                n = head
                while n.next is not None:
                    n = n.next
                n.next = common
                return head
            ctx.list_nodes = []
            a, b = with_tail(s["a"]), with_tail(s["b"])
            node, common_nodes = common, []
            while node is not None:
                common_nodes.append(node)
                node = node.next
            args = [a, b]
        else:
            args = _build(_copy.deepcopy(t.get("args", [])), ctx)
        _sys.settrace(watch)
        if is_ops:
            obj = target(*args, *_build(_copy.deepcopy(t["ops"][0][1:]), ctx))
            got = [None]
            for op in t["ops"][1:]:
                got.append(getattr(obj, op[0])(*_build(_copy.deepcopy(op[1:]), ctx)))
        else:
            got = target(*args)
            if t.get("then"):
                then = g.get(t["then"])
                if not callable(then):
                    _sys.settrace(None)
                    entry.update(passed=False, problem="missing", got="", missing=t["then"])
                    return entry
                got = then(got)
        _sys.settrace(None)
    except StopRun:
        _sys.settrace(None)
        entry.update(passed=False, problem="timeout", got="")
        return entry
    except RecursionError:
        _sys.settrace(None)
        entry.update(passed=False, problem="error", errorType="RecursionError", message="the function kept calling itself", got="")
        return entry
    except BaseException as e:
        _sys.settrace(None)
        entry.update(passed=False, problem="error", errorType=type(e).__name__, message=str(e), line=_user_line(e), got="")
        return entry

    how = t.get("compare", "exact")
    returns = t.get("returns")
    if returns == "index":
        shown = next((i for i, n in enumerate(ctx.list_nodes) if n is got), -1) if got is not None else -1
        if got is not None and shown == -1:
            shown = "a node that is not in the list"
        got_plain = shown
    elif returns == "value":
        got_plain = getattr(got, "val", got) if got is not None else None
    else:
        got_plain = _export(got)

    if how == "output":
        printed = out.getvalue()
        passed = printed == t["expected"]
        entry.update(passed=passed, got=repr(printed))
        return entry
    if how in ("topo", "peak", "gray", "inorder"):
        passed = _shape_ok(how, got if how != "inorder" else got_plain, _copy.deepcopy(t.get("args", [])), t["expected"])
    else:
        passed = _same(got_plain, t["expected"], how)
    got_text = _text(got_plain if not isinstance(got, tuple) else tuple(got_plain))
    if isinstance(got, tuple) and isinstance(t["expected"], list) and "mutated" not in t:
        entry["expected"] = _text(tuple(t["expected"]))  # show (5, 3) when the answer is a tuple
    if "mutated" in t:
        m = t["mutated"]
        after = _export(args[m["arg"]])
        if m.get("prefix"):
            k = got if isinstance(got, int) and not isinstance(got, bool) else -1
            after = after[:k] if isinstance(after, list) and k >= 0 else after
        ok_after = _same(after, m["value"], how if how in ("unordered", "sets") else "exact")
        ok_return = passed if t["expected"] is not None or m.get("prefix") else True
        if t["expected"] is None and not m.get("prefix"):
            got_text = "argument %d became %s" % (m["arg"] + 1, _text(after))
        else:
            got_text = "%s, and argument %d became %s" % (got_text, m["arg"] + 1, _text(after))
        passed = ok_after and ok_return
    if t.get("copy") and passed:
        inputs = set(id(n) for n in ctx.inputs)
        if any(id(n) in inputs for n in _nodes_of(got)):
            entry.update(passed=False, got=got_text, problem="shared")
            return entry
    entry.update(passed=passed, got=got_text)
    return entry


def _user_line(e):
    """The last line of the student's own code in the error's traceback."""
    tb = e.__traceback__
    line = None
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == USER_FILE:
            line = tb.tb_lineno
        tb = tb.tb_next
    return line
