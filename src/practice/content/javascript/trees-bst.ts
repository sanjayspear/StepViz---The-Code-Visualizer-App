// Practice, JavaScript: Trees & BST (Q236-Q260). Tests come from the Python content;
// reference solutions in tests/practice/js/trees-bst.solutions.ts.
// Every starter brings its own TreeNode class and a helper that builds a tree from a level-order array.
import { fromPython } from './shared';
import { TREES_BST } from '../python/trees-bst';

const TREE = `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(values) {
  // A tree from a level-order array, null for a missing child: [3, 9, 20, null, null, 15, 7]
  if (values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    if (i < values.length && values[i] !== null) queue.push((node.left = new TreeNode(values[i])));
    i++;
    if (i < values.length && values[i] !== null) queue.push((node.right = new TreeNode(values[i])));
    i++;
  }
  return root;
}
`;

/** The helper, then each function with its comment lines, then the lines that try it out. */
const tree = (fns: [string, string, string][], call: string) =>
  `${TREE}\n${fns
    .map(
      ([name, args, comment]) =>
        `function ${name}(${args}) {\n${comment
          .split('\n')
          .filter((l) => l)
          .map((l) => `  // ${l}`)
          .join('\n')}\n}\n`,
    )
    .join('\n')}\n${call}\n`;
const one = (name: string, args: string, comment: string, call: string) => tree([[name, args, comment]], call);
const EX = 'buildTree([3, 9, 20, null, null, 15, 7])';

export const TREES_BST_JS = fromPython(TREES_BST, {
  236: {
    example: 'Example: for the tree 1 with children 2 and 3, inorder gives [2, 1, 3], preorder [1, 2, 3] and postorder [2, 3, 1].',
    starter: tree(
      [
        ['inorder', 'root', 'Left subtree, then the node, then the right subtree, recursively. An array of values.'],
        ['preorder', 'root', 'The node first, then left, then right.'],
        ['postorder', 'root', 'Left, then right, then the node last.'],
      ],
      'const root = buildTree([1, 2, 3]);\nconsole.log(inorder(root), preorder(root), postorder(root));',
    ),
    hint: "Each traversal is three lines: for an empty tree return []; otherwise join the answers for the left subtree, [root.val] and the right subtree in the order the name says (in: left, node, right; pre: node first; post: node last), with [...a, ...b, ...c]. Like reading out a family tree: the only question is whether you say the parent's name before, between or after the children's.",
  },
  237: {
    example: `Example: maxDepth(${EX}) returns 3.`,
    starter: one('maxDepth', 'root', 'How many nodes are on the longest path from the root down to a leaf (0 for an empty tree)?', `console.log(maxDepth(${EX}));`),
  },
  238: {
    example: `Example: minDepth(${EX}) returns 2 (3 then 9).`,
    starter: one('minDepth', 'root', 'How many nodes are on the shortest path from the root down to a leaf (0 for an empty tree)?', `console.log(minDepth(${EX}));`),
  },
  239: {
    example: 'Example: sameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])) returns true.',
    starter: one('sameTree', 'p, q', 'true if both trees have the same shape and the same values.', 'console.log(sameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])));'),
  },
  240: {
    example: 'Example: invertTree(buildTree([2, 1, 3])) gives the tree [2, 3, 1].',
    starter: one(
      'invertTree',
      'root',
      'Swap the left and right child of every node (a mirror image). Return the root.',
      'const root = invertTree(buildTree([2, 1, 3]));\nconsole.log(root && root.left ? root.left.val : null);',
    ),
    hint: 'For a node: invert its left and right subtrees, then swap them ([root.left, root.right] = [root.right, root.left]). An empty tree stays empty. Like looking at a family photo in a mirror: everyone swaps sides.',
  },
  241: {
    example: 'Example: isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])) returns true.',
    starter: one('isSymmetric', 'root', 'true if the tree is a mirror image of itself around its centre.', 'console.log(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));'),
    hint: 'Write mirror(a, b): both empty is true; one empty or different values is false; otherwise mirror(a.left, b.right) and mirror(a.right, b.left). The tree is symmetric if mirror(root.left, root.right). Like a butterfly: the left wing must match the right wing flipped over.',
  },
  242: {
    example: 'Example: countNodesLeaves(buildTree([1, 2, 3, 4, 5])) returns [5, 3].',
    starter: one('countNodesLeaves', 'root', '[how many nodes, how many leaves]; a leaf is a node with no children.', 'console.log(countNodesLeaves(buildTree([1, 2, 3, 4, 5])));'),
    hint: 'An empty tree has [0, 0] and a leaf has [1, 1]. Otherwise add up the counts of both subtrees, plus 1 node for this one. Like counting the branches and the leaves of a real tree, one branch at a time.',
  },
  243: {
    example: 'Example: hasPathSum(root, 22) returns true when a root-to-leaf path such as 5, 4, 11, 2 adds up to 22.',
    starter: one(
      'hasPathSum',
      'root, target',
      'true if some path from the root down to a leaf adds up to target.',
      'console.log(hasPathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22));',
    ),
  },
  244: {
    example: 'Example: binaryTreePaths(buildTree([1, 2, 3, null, 5])) returns ["1->2->5", "1->3"] (in any order).',
    starter: one('binaryTreePaths', 'root', 'Every path from the root to a leaf, written like "1->2->5".', 'console.log(binaryTreePaths(buildTree([1, 2, 3, null, 5])));'),
  },
  245: {
    example: 'Example: diameter(buildTree([1, 2, 3, 4, 5])) returns 3 (the path 4, 2, 1, 3 has 3 edges).',
    starter: one('diameter', 'root', 'The number of edges on the longest path between any two nodes (0 for 0 or 1 node).', 'console.log(diameter(buildTree([1, 2, 3, 4, 5])));'),
  },
  246: {
    example: `Example: isBalanced(${EX}) returns true.`,
    starter: one('isBalanced', 'root', 'true if, at every node, the heights of the two subtrees differ by at most 1.', `console.log(isBalanced(${EX}));`),
  },
  247: {
    example: 'Example: sortedToBst([-10, -3, 0, 5, 9]) can give the tree [0, -3, 9, -10, null, 5].',
    starter: one(
      'sortedToBst',
      'nums',
      'nums is sorted (all different). A height-balanced binary search tree holding them; return its root.',
      'const root = sortedToBst([-10, -3, 0, 5, 9]);\nconsole.log(root ? root.val : null);',
    ),
    hint: "The middle number becomes the root; the numbers to its left build the left subtree and those to its right the right subtree, the same way. An empty range gives null. Like organising a knock-out tournament bracket from the middle outwards so both halves are the same size.",
  },
  248: {
    example: 'Example: for the tree 1 with children 2 and 3, inorderIterative gives [2, 1, 3].',
    starter: tree(
      [
        ['inorderIterative', 'root', 'The three traversals again, with a loop and a stack instead of recursion.'],
        ['preorderIterative', 'root', ''],
        ['postorderIterative', 'root', ''],
      ],
      'const root = buildTree([1, 2, 3]);\nconsole.log(inorderIterative(root), preorderIterative(root), postorderIterative(root));',
    ),
  },
  249: {
    example: `Example: levelOrder(${EX}) returns [[3], [9, 20], [15, 7]].`,
    starter: one('levelOrder', 'root', 'The values level by level, left to right: an array of arrays.', `console.log(levelOrder(${EX}));`),
  },
  250: {
    example: `Example: zigzagOrder(${EX}) returns [[3], [20, 9], [15, 7]].`,
    starter: one('zigzagOrder', 'root', 'Level by level, left to right on the first level, right to left on the next, and so on.', `console.log(zigzagOrder(${EX}));`),
  },
  251: {
    example: 'Example: rightSideView(buildTree([1, 2, 3, null, 5, null, 4])) returns [1, 3, 4].',
    starter: one('rightSideView', 'root', 'Standing on the right of the tree: the value you see on each level, top to bottom.', 'console.log(rightSideView(buildTree([1, 2, 3, null, 5, null, 4])));'),
  },
  252: {
    example: 'Example: in the tree [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], the lowest common ancestor of 5 and 1 is the node 3.',
    starter: one(
      'lowestCommonAncestor',
      'root, p, q',
      'p and q are values in the tree (all values are different). Return the lowest node\nthat has both below it (a node counts as below itself).',
      'const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nconst node = lowestCommonAncestor(root, 5, 1);\nconsole.log(node ? node.val : null);',
    ),
  },
  253: {
    example: 'Example: in the BST [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], the lowest common ancestor of 2 and 8 is 6.',
    starter: one(
      'lcaBst',
      'root, p, q',
      'root is a binary search tree; p and q are values in it. Return the lowest common ancestor node.',
      'const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]);\nconst node = lcaBst(root, 2, 8);\nconsole.log(node ? node.val : null);',
    ),
  },
  254: {
    example: 'Example: isValidBst(buildTree([2, 1, 3])) returns true; isValidBst(buildTree([5, 1, 4, null, null, 3, 6])) returns false.',
    starter: one(
      'isValidBst',
      'root',
      'true if every node is bigger than everything in its left subtree and\nsmaller than everything in its right subtree.',
      'console.log(isValidBst(buildTree([2, 1, 3])));',
    ),
  },
  255: {
    example: 'Example: insertBst(buildTree([4, 2, 7, 1, 3]), 5) gives a BST holding 1, 2, 3, 4, 5, 7; deleteBst removes a value the same way.',
    starter: tree(
      [
        ['insertBst', 'root, val', 'Put val into the BST (it is not there yet). Return the root.'],
        ['deleteBst', 'root, key', 'Remove key from the BST if it is there. Return the root.'],
      ],
      'let root = insertBst(buildTree([4, 2, 7, 1, 3]), 5);\nroot = deleteBst(root, 2);\nconsole.log(root ? root.val : null);',
    ),
  },
  256: {
    example: 'Example: kthSmallest(buildTree([3, 1, 4, null, 2]), 1) returns 1.',
    starter: one('kthSmallest', 'root, k', 'root is a BST. The kth smallest value (k = 1 is the smallest).', 'console.log(kthSmallest(buildTree([3, 1, 4, null, 2]), 1));'),
  },
  257: {
    example: 'Example: treeFromOrders([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]) gives the tree [3, 9, 20, null, null, 15, 7].',
    starter: one(
      'treeFromOrders',
      'preorder, inorder',
      'Rebuild the tree (all values are different) from its preorder and inorder arrays. Return the root.',
      'const root = treeFromOrders([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]);\nconsole.log(root ? root.val : null);',
    ),
  },
  258: {
    example: 'Example: flatten(root) for the tree [1, 2, 5, 3, 4, null, 6] changes it to 1 -> 2 -> 3 -> 4 -> 5 -> 6 along the right children.',
    starter: one(
      'flatten',
      'root',
      'Change the tree itself into a chain along right children, in preorder; every left child becomes null.',
      'const root = buildTree([1, 2, 5, 3, 4, null, 6]);\nflatten(root);\nconsole.log(root && root.right ? root.right.val : null);',
    ),
    hint: "For each node with a left subtree: find the rightmost node of that left subtree, hang the node's right subtree on it, move the left subtree to the right, and set left to null. Then move on to the right child. Like folding a paper family tree into one long strip, in the order you would read the names.",
  },
  259: {
    example: 'Example: deserialize(serialize(root)) gives back a tree with the same shape and values as root.',
    starter: tree(
      [
        ['serialize', 'root', 'Turn the tree into a piece of text (any format you like).'],
        ['deserialize', 'text', 'Rebuild the tree from that text; return its root.'],
      ],
      'const root = buildTree([1, 2, 3, null, null, 4, 5]);\nconst text = serialize(root);\nconsole.log(text);\nconsole.log(deserialize(text) != null);',
    ),
    hint: "Write the tree in preorder, with a marker such as \"#\" for every missing child, separated by commas. To rebuild, read the values back in the same order with the same recursion: a \"#\" means null. Like packing a tent with a list of every pole, including the gaps, so it can be put back exactly.",
  },
  260: {
    example: 'Example: maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])) returns 42 (15 + 20 + 7).',
    starter: one(
      'maxPathSum',
      'root',
      'The largest sum of values along any path between two nodes (at least one node; values may be negative).',
      'console.log(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])));',
    ),
  },
});
