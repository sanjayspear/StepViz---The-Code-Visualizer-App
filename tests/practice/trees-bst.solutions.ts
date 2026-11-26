// Reference solutions for Practice: Trees & BST (Python). Never shipped to students.
const NODE = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`;

export const SOLUTIONS: Record<number, string> = {
  236: `def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)


def preorder(root):
    if root is None:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)


def postorder(root):
    if root is None:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]
`,
  237: `def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
`,
  238: `def min_depth(root):
    if root is None:
        return 0
    if root.left is None:
        return 1 + min_depth(root.right)
    if root.right is None:
        return 1 + min_depth(root.left)
    return 1 + min(min_depth(root.left), min_depth(root.right))
`,
  239: `def same_tree(p, q):
    if p is None and q is None:
        return True
    if p is None or q is None or p.val != q.val:
        return False
    return same_tree(p.left, q.left) and same_tree(p.right, q.right)
`,
  240: `def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root
`,
  241: `def is_symmetric(root):
    def mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)
    return root is None or mirror(root.left, root.right)
`,
  242: `def count_nodes_leaves(root):
    if root is None:
        return (0, 0)
    if root.left is None and root.right is None:
        return (1, 1)
    a = count_nodes_leaves(root.left)
    b = count_nodes_leaves(root.right)
    return (a[0] + b[0] + 1, a[1] + b[1])
`,
  243: `def has_path_sum(root, target):
    if root is None:
        return False
    if root.left is None and root.right is None:
        return target == root.val
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)
`,
  244: `def binary_tree_paths(root):
    out = []
    def walk(node, path):
        if node is None:
            return
        path = path + "->" + str(node.val) if path else str(node.val)
        if node.left is None and node.right is None:
            out.append(path)
        walk(node.left, path)
        walk(node.right, path)
    walk(root, "")
    return out
`,
  245: `def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        a, b = height(node.left), height(node.right)
        best = max(best, a + b)
        return 1 + max(a, b)
    height(root)
    return best
`,
  246: `def is_balanced(root):
    def height(node):
        if node is None:
            return 0
        a, b = height(node.left), height(node.right)
        if a < 0 or b < 0 or abs(a - b) > 1:
            return -1
        return 1 + max(a, b)
    return height(root) >= 0
`,
  247: `${NODE}

def sorted_to_bst(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    return build(0, len(nums) - 1)
`,
  248: `def inorder_iterative(root):
    out, stack, node = [], [], root
    while stack or node is not None:
        while node is not None:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out


def preorder_iterative(root):
    out = []
    stack = [root] if root is not None else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)
    return out


def postorder_iterative(root):
    out = []
    stack = [root] if root is not None else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.left is not None:
            stack.append(node.left)
        if node.right is not None:
            stack.append(node.right)
    return out[::-1]
`,
  249: `def level_order(root):
    out = []
    level = [root] if root is not None else []
    while level:
        out.append([n.val for n in level])
        level = [c for n in level for c in (n.left, n.right) if c is not None]
    return out
`,
  250: `def zigzag_order(root):
    out = []
    level = [root] if root is not None else []
    while level:
        values = [n.val for n in level]
        if len(out) % 2 == 1:
            values.reverse()
        out.append(values)
        level = [c for n in level for c in (n.left, n.right) if c is not None]
    return out
`,
  251: `def right_side_view(root):
    out = []
    level = [root] if root is not None else []
    while level:
        out.append(level[-1].val)
        level = [c for n in level for c in (n.left, n.right) if c is not None]
    return out
`,
  252: `def lowest_common_ancestor(root, p, q):
    if root is None or root.val == p or root.val == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left is not None and right is not None:
        return root
    return left if left is not None else right
`,
  253: `def lca_bst(root, p, q):
    node = root
    while node is not None:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node
`,
  254: `def is_valid_bst(root):
    def ok(node, low, high):
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return ok(node.left, low, node.val) and ok(node.right, node.val, high)
    return ok(root, float("-inf"), float("inf"))
`,
  255: `${NODE}

def insert_bst(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert_bst(root.left, val)
    else:
        root.right = insert_bst(root.right, val)
    return root


def delete_bst(root, key):
    if root is None:
        return None
    if key < root.val:
        root.left = delete_bst(root.left, key)
    elif key > root.val:
        root.right = delete_bst(root.right, key)
    else:
        if root.left is None:
            return root.right
        if root.right is None:
            return root.left
        smallest = root.right
        while smallest.left is not None:
            smallest = smallest.left
        root.val = smallest.val
        root.right = delete_bst(root.right, smallest.val)
    return root
`,
  256: `def kth_smallest(root, k):
    stack, node = [], root
    while True:
        while node is not None:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right
`,
  257: `${NODE}

def tree_from_orders(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}
    nxt = 0
    def build(lo, hi):
        nonlocal nxt
        if lo > hi:
            return None
        val = preorder[nxt]
        nxt += 1
        node = TreeNode(val)
        mid = where[val]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(inorder) - 1)
`,
  258: `def flatten(root):
    node = root
    while node is not None:
        if node.left is not None:
            last = node.left
            while last.right is not None:
                last = last.right
            last.right = node.right
            node.right = node.left
            node.left = None
        node = node.right
`,
  259: `${NODE}

def serialize(root):
    parts = []
    def walk(node):
        if node is None:
            parts.append("#")
            return
        parts.append(str(node.val))
        walk(node.left)
        walk(node.right)
    walk(root)
    return ",".join(parts)


def deserialize(text):
    values = iter(text.split(","))
    def build():
        v = next(values)
        if v == "#":
            return None
        node = TreeNode(int(v))
        node.left = build()
        node.right = build()
        return node
    return build()
`,
  260: `def max_path_sum(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if node is None:
            return 0
        a = max(gain(node.left), 0)
        b = max(gain(node.right), 0)
        best = max(best, node.val + a + b)
        return node.val + max(a, b)
    gain(root)
    return best
`,
};
