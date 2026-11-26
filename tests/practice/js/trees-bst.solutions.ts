// JavaScript reference solutions for Practice: Trees & BST. Never shipped to students.
const NODE = `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
`;
const LEVELS = `function levels(root) {
  const out = [];
  let level = root ? [root] : [];
  while (level.length) {
    out.push(level);
    level = level.flatMap((n) => [n.left, n.right]).filter((c) => c);
  }
  return out;
}
`;

export const SOLUTIONS: Record<number, string> = {
  236: `function inorder(root) {
  return root ? [...inorder(root.left), root.val, ...inorder(root.right)] : [];
}

function preorder(root) {
  return root ? [root.val, ...preorder(root.left), ...preorder(root.right)] : [];
}

function postorder(root) {
  return root ? [...postorder(root.left), ...postorder(root.right), root.val] : [];
}
`,
  237: `function maxDepth(root) {
  return root ? 1 + Math.max(maxDepth(root.left), maxDepth(root.right)) : 0;
}
`,
  238: `function minDepth(root) {
  if (!root) return 0;
  if (!root.left) return 1 + minDepth(root.right);
  if (!root.right) return 1 + minDepth(root.left);
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}
`,
  239: `function sameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return sameTree(p.left, q.left) && sameTree(p.right, q.right);
}
`,
  240: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
`,
  241: `function isSymmetric(root) {
  const mirror = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}
`,
  242: `function countNodesLeaves(root) {
  if (!root) return [0, 0];
  if (!root.left && !root.right) return [1, 1];
  const a = countNodesLeaves(root.left);
  const b = countNodesLeaves(root.right);
  return [a[0] + b[0] + 1, a[1] + b[1]];
}
`,
  243: `function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return target === root.val;
  return hasPathSum(root.left, target - root.val) || hasPathSum(root.right, target - root.val);
}
`,
  244: `function binaryTreePaths(root) {
  const out = [];
  const walk = (node, path) => {
    if (!node) return;
    path = path ? path + "->" + node.val : String(node.val);
    if (!node.left && !node.right) out.push(path);
    walk(node.left, path);
    walk(node.right, path);
  };
  walk(root, "");
  return out;
}
`,
  245: `function diameter(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const a = height(node.left);
    const b = height(node.right);
    best = Math.max(best, a + b);
    return 1 + Math.max(a, b);
  };
  height(root);
  return best;
}
`,
  246: `function isBalanced(root) {
  const height = (node) => {
    if (!node) return 0;
    const a = height(node.left);
    const b = height(node.right);
    if (a < 0 || b < 0 || Math.abs(a - b) > 1) return -1;
    return 1 + Math.max(a, b);
  };
  return height(root) >= 0;
}
`,
  247: `${NODE}
function sortedToBst(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, nums.length - 1);
}
`,
  248: `function inorderIterative(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (stack.length || node) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}

function preorderIterative(root) {
  const out = [];
  const stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}

function postorderIterative(root) {
  const out = [];
  const stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}
`,
  249: `${LEVELS}
function levelOrder(root) {
  return levels(root).map((level) => level.map((n) => n.val));
}
`,
  250: `${LEVELS}
function zigzagOrder(root) {
  return levels(root).map((level, i) => {
    const values = level.map((n) => n.val);
    return i % 2 === 1 ? values.reverse() : values;
  });
}
`,
  251: `${LEVELS}
function rightSideView(root) {
  return levels(root).map((level) => level[level.length - 1].val);
}
`,
  252: `function lowestCommonAncestor(root, p, q) {
  if (!root || root.val === p || root.val === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left ? left : right;
}
`,
  253: `function lcaBst(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node;
  }
  return null;
}
`,
  254: `function isValidBst(root) {
  const ok = (node, low, high) => {
    if (!node) return true;
    if (!(low < node.val && node.val < high)) return false;
    return ok(node.left, low, node.val) && ok(node.right, node.val, high);
  };
  return ok(root, -Infinity, Infinity);
}
`,
  255: `${NODE}
function insertBst(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertBst(root.left, val);
  else root.right = insertBst(root.right, val);
  return root;
}

function deleteBst(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteBst(root.left, key);
  else if (key > root.val) root.right = deleteBst(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let smallest = root.right;
    while (smallest.left) smallest = smallest.left;
    root.val = smallest.val;
    root.right = deleteBst(root.right, smallest.val);
  }
  return root;
}
`,
  256: `function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (true) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
}
`,
  257: `${NODE}
function treeFromOrders(preorder, inorder) {
  const where = new Map(inorder.map((v, i) => [v, i]));
  let next = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const val = preorder[next++];
    const node = new TreeNode(val);
    const mid = where.get(val);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}
`,
  258: `function flatten(root) {
  let node = root;
  while (node) {
    if (node.left) {
      let last = node.left;
      while (last.right) last = last.right;
      last.right = node.right;
      node.right = node.left;
      node.left = null;
    }
    node = node.right;
  }
}
`,
  259: `${NODE}
function serialize(root) {
  const parts = [];
  const walk = (node) => {
    if (!node) {
      parts.push("#");
      return;
    }
    parts.push(String(node.val));
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return parts.join(",");
}

function deserialize(text) {
  const values = text.split(",");
  let i = 0;
  const build = () => {
    const v = values[i++];
    if (v === "#") return null;
    const node = new TreeNode(Number(v));
    node.left = build();
    node.right = build();
    return node;
  };
  return build();
}
`,
  260: `function maxPathSum(root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const a = Math.max(gain(node.left), 0);
    const b = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + a + b);
    return node.val + Math.max(a, b);
  };
  gain(root);
  return best;
}
`,
};
