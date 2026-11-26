// Practice, Python: Trees & BST (Q236-Q260). Reference solutions: tests/practice/trees-bst.solutions.ts.
// Every starter brings its own TreeNode class and a helper that builds a tree from a level-order list.
import type { PracticeContent, Value } from '../types';

const TREE = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(values):
    # A tree from a level-order list, None for a missing child: [3, 9, 20, None, None, 15, 7]
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i = 1
    while queue and i < len(values):
        node = queue.pop(0)
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root
`;

const T = (values: Value[]): Value => ({ $tree: values });
const EXAMPLE = [3, 9, 20, null, null, 15, 7];
const PATHS = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1];
const LCA = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];
const BST = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5];

export const TREES_BST: PracticeContent[] = [
  {
    id: 236,
    example: 'Example: for the tree 1 with children 2 and 3, inorder gives [2, 1, 3], preorder [1, 2, 3] and postorder [2, 3, 1].',
    starter: `${TREE}

def inorder(root):
    # Left subtree, then the node, then the right subtree, recursively. A list of values.
    pass


def preorder(root):
    # The node first, then left, then right.
    pass


def postorder(root):
    # Left, then right, then the node last.
    pass


root = build_tree([1, 2, 3])
print(inorder(root), preorder(root), postorder(root))
`,
    tests: [
      { call: 'inorder', args: [T([1, null, 2, 3])], expected: [1, 3, 2] },
      { call: 'preorder', args: [T([1, null, 2, 3])], expected: [1, 2, 3] },
      { call: 'postorder', args: [T([1, null, 2, 3])], expected: [3, 2, 1] },
      { call: 'inorder', args: [T([1, 2, 3, 4, 5])], expected: [4, 2, 5, 1, 3] },
      { call: 'preorder', args: [T([1, 2, 3, 4, 5])], expected: [1, 2, 4, 5, 3] },
      { call: 'postorder', args: [T([1, 2, 3, 4, 5])], expected: [4, 5, 2, 3, 1] },
      { call: 'inorder', args: [T([])], expected: [] },
    ],
    hint: 'Each traversal is three lines: for an empty tree return []; otherwise join the answers for the left subtree, [root.val] and the right subtree in the order the name says (in: left, node, right; pre: node first; post: node last). Like reading out a family tree: the only question is whether you say the parent\'s name before, between or after the children\'s.',
  },
  {
    id: 237,
    example: 'Example: max_depth(build_tree([3, 9, 20, None, None, 15, 7])) returns 3.',
    starter: `${TREE}

def max_depth(root):
    # How many nodes are on the longest path from the root down to a leaf (0 for an empty tree)?
    pass


print(max_depth(build_tree([3, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'max_depth', args: [T(EXAMPLE)], expected: 3 },
      { call: 'max_depth', args: [T([1, null, 2])], expected: 2 },
      { call: 'max_depth', args: [T([])], expected: 0 },
      { call: 'max_depth', args: [T([1])], expected: 1 },
      { call: 'max_depth', args: [T([1, 2, null, 3, null, 4])], expected: 4 },
    ],
    hint: 'An empty tree has depth 0; otherwise the depth is 1 + the bigger of the depths of the two subtrees. Like measuring the height of a family tree by asking each child how many generations hang below them.',
  },
  {
    id: 238,
    example: 'Example: min_depth(build_tree([3, 9, 20, None, None, 15, 7])) returns 2 (3 then 9).',
    starter: `${TREE}

def min_depth(root):
    # How many nodes are on the shortest path from the root down to a leaf (0 for an empty tree)?
    pass


print(min_depth(build_tree([3, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'min_depth', args: [T(EXAMPLE)], expected: 2 },
      { call: 'min_depth', args: [T([2, null, 3, null, 4, null, 5, null, 6])], expected: 5 },
      { call: 'min_depth', args: [T([])], expected: 0 },
      { call: 'min_depth', args: [T([1, 2])], expected: 2 },
      { call: 'min_depth', args: [T([1])], expected: 1 },
    ],
    hint: 'Careful: a path must end at a leaf. If one subtree is empty, the answer comes from the other one (1 + its min depth); only when both exist take 1 + the smaller. Like the shortest walk from a tree\'s trunk to a leaf: a branch with nothing on it is not a leaf.',
  },
  {
    id: 239,
    example: 'Example: same_tree(build_tree([1, 2, 3]), build_tree([1, 2, 3])) returns True.',
    starter: `${TREE}

def same_tree(p, q):
    # True if both trees have the same shape and the same values.
    pass


print(same_tree(build_tree([1, 2, 3]), build_tree([1, 2, 3])))
`,
    tests: [
      { call: 'same_tree', args: [T([1, 2, 3]), T([1, 2, 3])], expected: true },
      { call: 'same_tree', args: [T([1, 2]), T([1, null, 2])], expected: false },
      { call: 'same_tree', args: [T([1, 2, 1]), T([1, 1, 2])], expected: false },
      { call: 'same_tree', args: [T([]), T([])], expected: true },
      { call: 'same_tree', args: [T([1]), T([])], expected: false },
    ],
    hint: 'Two empty trees are the same; if only one is empty, or the root values differ, they are not. Otherwise both left subtrees and both right subtrees must be the same. Like checking two copies of a family tree, person by person.',
  },
  {
    id: 240,
    example: 'Example: invert_tree(build_tree([2, 1, 3])) gives the tree [2, 3, 1].',
    starter: `${TREE}

def invert_tree(root):
    # Swap the left and right child of every node (a mirror image). Return the root.
    pass


root = invert_tree(build_tree([2, 1, 3]))
print(root.left.val if root and root.left else None)
`,
    tests: [
      { call: 'invert_tree', args: [T([4, 2, 7, 1, 3, 6, 9])], expected: T([4, 7, 2, 9, 6, 3, 1]) },
      { call: 'invert_tree', args: [T([2, 1, 3])], expected: T([2, 3, 1]) },
      { call: 'invert_tree', args: [T([])], expected: null },
      { call: 'invert_tree', args: [T([1, 2])], expected: T([1, null, 2]) },
    ],
    hint: 'For a node: invert its left and right subtrees, then swap them (root.left, root.right = root.right, root.left). An empty tree stays empty. Like looking at a family photo in a mirror: everyone swaps sides.',
  },
  {
    id: 241,
    example: 'Example: is_symmetric(build_tree([1, 2, 2, 3, 4, 4, 3])) returns True.',
    starter: `${TREE}

def is_symmetric(root):
    # True if the tree is a mirror image of itself around its centre.
    pass


print(is_symmetric(build_tree([1, 2, 2, 3, 4, 4, 3])))
`,
    tests: [
      { call: 'is_symmetric', args: [T([1, 2, 2, 3, 4, 4, 3])], expected: true },
      { call: 'is_symmetric', args: [T([1, 2, 2, null, 3, null, 3])], expected: false },
      { call: 'is_symmetric', args: [T([])], expected: true },
      { call: 'is_symmetric', args: [T([1])], expected: true },
      { call: 'is_symmetric', args: [T([1, 2, 3])], expected: false },
    ],
    hint: 'Write mirror(a, b): both empty is True; one empty or different values is False; otherwise mirror(a.left, b.right) and mirror(a.right, b.left). The tree is symmetric if mirror(root.left, root.right). Like a butterfly: the left wing must match the right wing flipped over.',
  },
  {
    id: 242,
    example: 'Example: count_nodes_leaves(build_tree([1, 2, 3, 4, 5])) returns (5, 3).',
    starter: `${TREE}

def count_nodes_leaves(root):
    # (how many nodes, how many leaves); a leaf is a node with no children.
    pass


print(count_nodes_leaves(build_tree([1, 2, 3, 4, 5])))
`,
    tests: [
      { call: 'count_nodes_leaves', args: [T([1, 2, 3, 4, 5])], expected: [5, 3] },
      { call: 'count_nodes_leaves', args: [T([])], expected: [0, 0] },
      { call: 'count_nodes_leaves', args: [T([1])], expected: [1, 1] },
      { call: 'count_nodes_leaves', args: [T([1, 2, null, 3])], expected: [3, 1] },
    ],
    hint: 'An empty tree has (0, 0) and a leaf has (1, 1). Otherwise add up the counts of both subtrees, plus 1 node for this one. Like counting the branches and the leaves of a real tree, one branch at a time.',
  },
  {
    id: 243,
    example: 'Example: has_path_sum(root, 22) returns True when a root-to-leaf path such as 5, 4, 11, 2 adds up to 22.',
    starter: `${TREE}

def has_path_sum(root, target):
    # True if some path from the root down to a leaf adds up to target.
    pass


print(has_path_sum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22))
`,
    tests: [
      { call: 'has_path_sum', args: [T(PATHS), 22], expected: true },
      { call: 'has_path_sum', args: [T([1, 2, 3]), 5], expected: false },
      { call: 'has_path_sum', args: [T([]), 0], expected: false },
      { call: 'has_path_sum', args: [T([1, 2]), 1], expected: false },
      { call: 'has_path_sum', args: [T([1]), 1], expected: true },
    ],
    hint: 'Take the root\'s value off the target and ask the same question of the children. At a leaf, the answer is whether what is left equals the leaf\'s value. An empty tree has no path at all. Like spending a budget walking down a path: you must reach a leaf with exactly nothing left.',
  },
  {
    id: 244,
    example: 'Example: binary_tree_paths(build_tree([1, 2, 3, None, 5])) returns ["1->2->5", "1->3"] (in any order).',
    starter: `${TREE}

def binary_tree_paths(root):
    # Every path from the root to a leaf, written like "1->2->5".
    pass


print(binary_tree_paths(build_tree([1, 2, 3, None, 5])))
`,
    tests: [
      { call: 'binary_tree_paths', args: [T([1, 2, 3, null, 5])], expected: ['1->2->5', '1->3'], compare: 'unordered' },
      { call: 'binary_tree_paths', args: [T([1])], expected: ['1'], compare: 'unordered' },
      { call: 'binary_tree_paths', args: [T([])], expected: [], compare: 'unordered' },
      { call: 'binary_tree_paths', args: [T([1, 2, 3, 4, 5, 6, 7])], expected: ['1->2->4', '1->2->5', '1->3->6', '1->3->7'], compare: 'unordered' },
    ],
    hint: 'Walk down with the path so far as text. At a leaf, record the path; otherwise go to each child with path + "->" + the child\'s value. Like writing down the turns from the front door to every room at the end of a corridor.',
  },
  {
    id: 245,
    example: 'Example: diameter(build_tree([1, 2, 3, 4, 5])) returns 3 (the path 4, 2, 1, 3 has 3 edges).',
    starter: `${TREE}

def diameter(root):
    # The number of edges on the longest path between any two nodes (0 for 0 or 1 node).
    pass


print(diameter(build_tree([1, 2, 3, 4, 5])))
`,
    tests: [
      { call: 'diameter', args: [T([1, 2, 3, 4, 5])], expected: 3 },
      { call: 'diameter', args: [T([1, 2])], expected: 1 },
      { call: 'diameter', args: [T([1])], expected: 0 },
      { call: 'diameter', args: [T([])], expected: 0 },
      { call: 'diameter', args: [T([1, 2, null, 3, 4, 5, null, null, 6])], expected: 4 },
    ],
    hint: 'Work out each subtree\'s height (in nodes). The longest path through a node is left height + right height; keep the biggest of those over all nodes (it need not pass through the root). Like finding the two people furthest apart in a family tree.',
  },
  {
    id: 246,
    example: 'Example: is_balanced(build_tree([3, 9, 20, None, None, 15, 7])) returns True.',
    starter: `${TREE}

def is_balanced(root):
    # True if, at every node, the heights of the two subtrees differ by at most 1.
    pass


print(is_balanced(build_tree([3, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'is_balanced', args: [T(EXAMPLE)], expected: true },
      { call: 'is_balanced', args: [T([1, 2, 2, 3, 3, null, null, 4, 4])], expected: false },
      { call: 'is_balanced', args: [T([])], expected: true },
      { call: 'is_balanced', args: [T([1, null, 2, null, 3])], expected: false },
      { call: 'is_balanced', args: [T([1, 2, 3, 4])], expected: true },
    ],
    hint: 'Write a helper that returns a subtree\'s height, or -1 if it is out of balance somewhere. A node is out of balance if a child returned -1 or the two heights differ by more than 1. Like checking a mobile hanging from the ceiling: every bar must hang level enough.',
  },
  {
    id: 247,
    example: 'Example: sorted_to_bst([-10, -3, 0, 5, 9]) can give the tree [0, -3, 9, -10, None, 5].',
    starter: `${TREE}

def sorted_to_bst(nums):
    # nums is sorted (all different). A height-balanced binary search tree holding them; return its root.
    pass


root = sorted_to_bst([-10, -3, 0, 5, 9])
print(root.val if root else None)
`,
    tests: [
      { call: 'sorted_to_bst', args: [[-10, -3, 0, 5, 9]], expected: [-10, -3, 0, 5, 9], compare: 'balanced' },
      { call: 'sorted_to_bst', args: [[1, 3]], expected: [1, 3], compare: 'balanced' },
      { call: 'sorted_to_bst', args: [[]], expected: [], compare: 'balanced' },
      { call: 'sorted_to_bst', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 2, 3, 4, 5, 6, 7], compare: 'balanced' },
      { call: 'sorted_to_bst', args: [[0]], expected: [0], compare: 'balanced' },
    ],
    hint: 'The middle number becomes the root; the numbers to its left build the left subtree and those to its right the right subtree, the same way. An empty range gives None. Like organising a knock-out tournament bracket from the middle outwards so both halves are the same size.',
  },
  {
    id: 248,
    example: 'Example: for the tree 1 with children 2 and 3, inorder_iterative gives [2, 1, 3].',
    starter: `${TREE}

def inorder_iterative(root):
    # The three traversals again, with a loop and a stack instead of recursion.
    pass


def preorder_iterative(root):
    pass


def postorder_iterative(root):
    pass


root = build_tree([1, 2, 3])
print(inorder_iterative(root), preorder_iterative(root), postorder_iterative(root))
`,
    tests: [
      { call: 'inorder_iterative', args: [T([1, null, 2, 3])], expected: [1, 3, 2] },
      { call: 'preorder_iterative', args: [T([1, null, 2, 3])], expected: [1, 2, 3] },
      { call: 'postorder_iterative', args: [T([1, null, 2, 3])], expected: [3, 2, 1] },
      { call: 'inorder_iterative', args: [T([1, 2, 3, 4, 5])], expected: [4, 2, 5, 1, 3] },
      { call: 'preorder_iterative', args: [T([1, 2, 3, 4, 5])], expected: [1, 2, 4, 5, 3] },
      { call: 'postorder_iterative', args: [T([1, 2, 3, 4, 5])], expected: [4, 5, 2, 3, 1] },
      { call: 'postorder_iterative', args: [T([])], expected: [] },
    ],
    hint: 'Preorder: pop a node, record it, push its right child then its left. Inorder: go left pushing nodes, pop one, record it, then go to its right child. Postorder: do "node, right, left" like preorder and reverse the answer at the end. Like keeping a pile of bookmarks for the places you still have to go back to.',
  },
  {
    id: 249,
    example: 'Example: level_order(build_tree([3, 9, 20, None, None, 15, 7])) returns [[3], [9, 20], [15, 7]].',
    starter: `${TREE}

def level_order(root):
    # The values level by level, left to right: a list of lists.
    pass


print(level_order(build_tree([3, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'level_order', args: [T(EXAMPLE)], expected: [[3], [9, 20], [15, 7]] },
      { call: 'level_order', args: [T([1])], expected: [[1]] },
      { call: 'level_order', args: [T([])], expected: [] },
      { call: 'level_order', args: [T([1, 2, 3, 4, null, null, 5])], expected: [[1], [2, 3], [4, 5]] },
    ],
    hint: 'Use a queue. While it is not empty, take exactly as many nodes as it holds now (one level), record their values, and add their children for the next level. Like an announcer calling out the rows of a theatre, front row first.',
  },
  {
    id: 250,
    example: 'Example: zigzag_order(build_tree([3, 9, 20, None, None, 15, 7])) returns [[3], [20, 9], [15, 7]].',
    starter: `${TREE}

def zigzag_order(root):
    # Level by level, left to right on the first level, right to left on the next, and so on.
    pass


print(zigzag_order(build_tree([3, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'zigzag_order', args: [T(EXAMPLE)], expected: [[3], [20, 9], [15, 7]] },
      { call: 'zigzag_order', args: [T([1, 2, 3, 4, 5, 6, 7])], expected: [[1], [3, 2], [4, 5, 6, 7]] },
      { call: 'zigzag_order', args: [T([])], expected: [] },
      { call: 'zigzag_order', args: [T([1])], expected: [[1]] },
    ],
    hint: 'Do a normal level-order traversal and reverse the values of every second level before recording it. Like mowing a lawn: one row left to right, the next right to left.',
  },
  {
    id: 251,
    example: 'Example: right_side_view(build_tree([1, 2, 3, None, 5, None, 4])) returns [1, 3, 4].',
    starter: `${TREE}

def right_side_view(root):
    # Standing on the right of the tree: the value you see on each level, top to bottom.
    pass


print(right_side_view(build_tree([1, 2, 3, None, 5, None, 4])))
`,
    tests: [
      { call: 'right_side_view', args: [T([1, 2, 3, null, 5, null, 4])], expected: [1, 3, 4] },
      { call: 'right_side_view', args: [T([1, null, 3])], expected: [1, 3] },
      { call: 'right_side_view', args: [T([])], expected: [] },
      { call: 'right_side_view', args: [T([1, 2, 3, 4])], expected: [1, 3, 4] },
    ],
    hint: 'Do a level-order traversal and keep only the last node of each level. Like looking at a block of flats from the side: on each floor you only see the end window.',
  },
  {
    id: 252,
    example: 'Example: in the tree [3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], the lowest common ancestor of 5 and 1 is the node 3.',
    starter: `${TREE}

def lowest_common_ancestor(root, p, q):
    # p and q are values in the tree (all values are different). Return the lowest node
    # that has both below it (a node counts as below itself).
    pass


root = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
node = lowest_common_ancestor(root, 5, 1)
print(node.val if node else None)
`,
    tests: [
      { call: 'lowest_common_ancestor', args: [T(LCA), 5, 1], returns: 'value', expected: 3 },
      { call: 'lowest_common_ancestor', args: [T(LCA), 5, 4], returns: 'value', expected: 5 },
      { call: 'lowest_common_ancestor', args: [T(LCA), 6, 4], returns: 'value', expected: 5 },
      { call: 'lowest_common_ancestor', args: [T(LCA), 7, 8], returns: 'value', expected: 3 },
      { call: 'lowest_common_ancestor', args: [T([1, 2]), 1, 2], returns: 'value', expected: 1 },
    ],
    hint: 'Search both subtrees. If the node itself is p or q, return it. If p and q turn up in different subtrees, this node is the answer; otherwise pass up whichever side found something. Like two cousins tracing their family upwards to find the first grandparent they share.',
  },
  {
    id: 253,
    example: 'Example: in the BST [6, 2, 8, 0, 4, 7, 9, None, None, 3, 5], the lowest common ancestor of 2 and 8 is 6.',
    starter: `${TREE}

def lca_bst(root, p, q):
    # root is a binary search tree; p and q are values in it. Return the lowest common ancestor node.
    pass


root = build_tree([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])
node = lca_bst(root, 2, 8)
print(node.val if node else None)
`,
    tests: [
      { call: 'lca_bst', args: [T(BST), 2, 8], returns: 'value', expected: 6 },
      { call: 'lca_bst', args: [T(BST), 2, 4], returns: 'value', expected: 2 },
      { call: 'lca_bst', args: [T(BST), 3, 5], returns: 'value', expected: 4 },
      { call: 'lca_bst', args: [T(BST), 7, 9], returns: 'value', expected: 8 },
      { call: 'lca_bst', args: [T([2, 1]), 2, 1], returns: 'value', expected: 2 },
    ],
    hint: 'Use the order of a BST: if both values are smaller than the node, go left; if both are bigger, go right; otherwise they split here (or one is this node), so this is the answer. Like two addresses on a sorted street: walk until the house numbers send you different ways.',
  },
  {
    id: 254,
    example: 'Example: is_valid_bst(build_tree([2, 1, 3])) returns True; is_valid_bst(build_tree([5, 1, 4, None, None, 3, 6])) returns False.',
    starter: `${TREE}

def is_valid_bst(root):
    # True if every node is bigger than everything in its left subtree and
    # smaller than everything in its right subtree.
    pass


print(is_valid_bst(build_tree([2, 1, 3])))
`,
    tests: [
      { call: 'is_valid_bst', args: [T([2, 1, 3])], expected: true },
      { call: 'is_valid_bst', args: [T([5, 1, 4, null, null, 3, 6])], expected: false },
      { call: 'is_valid_bst', args: [T([5, 4, 6, null, null, 3, 7])], expected: false },
      { call: 'is_valid_bst', args: [T([1, 1])], expected: false },
      { call: 'is_valid_bst', args: [T([])], expected: true },
    ],
    hint: 'Checking only each node\'s children is not enough. Pass down a range (low, high) the node must fit in: going left lowers high to the node\'s value, going right raises low. Like a guessing game where every answer narrows the allowed range.',
  },
  {
    id: 255,
    example: 'Example: insert_bst(build_tree([4, 2, 7, 1, 3]), 5) gives a BST holding 1, 2, 3, 4, 5, 7; delete_bst removes a value the same way.',
    starter: `${TREE}

def insert_bst(root, val):
    # Put val into the BST (it is not there yet). Return the root.
    pass


def delete_bst(root, key):
    # Remove key from the BST if it is there. Return the root.
    pass


root = insert_bst(build_tree([4, 2, 7, 1, 3]), 5)
root = delete_bst(root, 2)
print(root.val if root else None)
`,
    tests: [
      { call: 'insert_bst', args: [T([4, 2, 7, 1, 3]), 5], expected: [1, 2, 3, 4, 5, 7], compare: 'inorder' },
      { call: 'insert_bst', args: [T([]), 5], expected: [5], compare: 'inorder' },
      { call: 'insert_bst', args: [T([40, 20, 60, 10, 30, 50, 70]), 25], expected: [10, 20, 25, 30, 40, 50, 60, 70], compare: 'inorder' },
      { call: 'delete_bst', args: [T([5, 3, 6, 2, 4, null, 7]), 3], expected: [2, 4, 5, 6, 7], compare: 'inorder' },
      { call: 'delete_bst', args: [T([5, 3, 6, 2, 4, null, 7]), 0], expected: [2, 3, 4, 5, 6, 7], compare: 'inorder' },
      { call: 'delete_bst', args: [T([5]), 5], expected: [], compare: 'inorder' },
      { call: 'delete_bst', args: [T([5, 3, 6, 2, 4, null, 7]), 5], expected: [2, 3, 4, 6, 7], compare: 'inorder' },
    ],
    hint: 'Insert: walk left or right by comparing, and hang the new node where you fall off. Delete: find the node; with no child, remove it; with one child, let the child take its place; with two, copy in the smallest value of its right subtree and delete that value from the right subtree. Like a sorted filing cabinet: a new folder slides into its gap; a removed one is replaced by its nearest neighbour.',
  },
  {
    id: 256,
    example: 'Example: kth_smallest(build_tree([3, 1, 4, None, 2]), 1) returns 1.',
    starter: `${TREE}

def kth_smallest(root, k):
    # root is a BST. The kth smallest value (k = 1 is the smallest).
    pass


print(kth_smallest(build_tree([3, 1, 4, None, 2]), 1))
`,
    tests: [
      { call: 'kth_smallest', args: [T([3, 1, 4, null, 2]), 1], expected: 1 },
      { call: 'kth_smallest', args: [T([5, 3, 6, 2, 4, null, null, 1]), 3], expected: 3 },
      { call: 'kth_smallest', args: [T([1]), 1], expected: 1 },
      { call: 'kth_smallest', args: [T([2, 1, 3]), 3], expected: 3 },
    ],
    hint: 'An inorder traversal of a BST visits the values from smallest to largest. Count the nodes as you visit them and stop at the kth. Like counting books along a sorted shelf from the left.',
  },
  {
    id: 257,
    example: 'Example: tree_from_orders([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]) gives the tree [3, 9, 20, None, None, 15, 7].',
    starter: `${TREE}

def tree_from_orders(preorder, inorder):
    # Rebuild the tree (all values are different) from its preorder and inorder lists. Return the root.
    pass


root = tree_from_orders([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
print(root.val if root else None)
`,
    tests: [
      { call: 'tree_from_orders', args: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: T(EXAMPLE) },
      { call: 'tree_from_orders', args: [[-1], [-1]], expected: T([-1]) },
      { call: 'tree_from_orders', args: [[], []], expected: null },
      { call: 'tree_from_orders', args: [[1, 2, 3], [3, 2, 1]], expected: T([1, 2, null, 3]) },
      { call: 'tree_from_orders', args: [[1, 2, 4, 5, 3], [4, 2, 5, 1, 3]], expected: T([1, 2, 3, 4, 5]) },
    ],
    hint: 'The first value of preorder is the root. Find it in inorder: the values to its left make the left subtree and those to its right the right subtree. Their sizes tell you how to split the rest of preorder. Build both subtrees the same way. Like rebuilding a family tree from a list of "parent first" names plus a list sorted left to right.',
  },
  {
    id: 258,
    example: 'Example: flatten(root) for the tree [1, 2, 5, 3, 4, None, 6] changes it to 1 -> 2 -> 3 -> 4 -> 5 -> 6 along the right children.',
    starter: `${TREE}

def flatten(root):
    # Change the tree itself into a chain along right children, in preorder; every left child becomes None.
    pass


root = build_tree([1, 2, 5, 3, 4, None, 6])
flatten(root)
print(root.right.val if root and root.right else None)
`,
    tests: [
      { call: 'flatten', args: [T([1, 2, 5, 3, 4, null, 6])], expected: null, mutated: { arg: 0, value: T([1, null, 2, null, 3, null, 4, null, 5, null, 6]) } },
      { call: 'flatten', args: [T([])], expected: null, mutated: { arg: 0, value: null } },
      { call: 'flatten', args: [T([0])], expected: null, mutated: { arg: 0, value: T([0]) } },
      { call: 'flatten', args: [T([1, 2])], expected: null, mutated: { arg: 0, value: T([1, null, 2]) } },
    ],
    hint: 'For each node with a left subtree: find the rightmost node of that left subtree, hang the node\'s right subtree on it, move the left subtree to the right, and set left to None. Then move on to the right child. Like folding a paper family tree into one long strip, in the order you would read the names.',
  },
  {
    id: 259,
    example: 'Example: deserialize(serialize(root)) gives back a tree with the same shape and values as root.',
    starter: `${TREE}

def serialize(root):
    # Turn the tree into a piece of text (any format you like).
    pass


def deserialize(text):
    # Rebuild the tree from that text; return its root.
    pass


root = build_tree([1, 2, 3, None, None, 4, 5])
text = serialize(root)
print(text)
print(deserialize(text) is not None)
`,
    tests: [
      { call: 'serialize', then: 'deserialize', args: [T([1, 2, 3, null, null, 4, 5])], expected: T([1, 2, 3, null, null, 4, 5]) },
      { call: 'serialize', then: 'deserialize', args: [T([])], expected: null },
      { call: 'serialize', then: 'deserialize', args: [T([1])], expected: T([1]) },
      { call: 'serialize', then: 'deserialize', args: [T([-1, -22, null, 333])], expected: T([-1, -22, null, 333]) },
      { call: 'serialize', then: 'deserialize', args: [T([5, 4, 7, 3, null, 2, null, -1, null, 9])], expected: T([5, 4, 7, 3, null, 2, null, -1, null, 9]) },
    ],
    hint: 'Write the tree in preorder, with a marker such as "#" for every missing child, separated by commas. To rebuild, read the values back in the same order with the same recursion: a "#" means None. Like packing a tent with a list of every pole, including the gaps, so it can be put back exactly.',
  },
  {
    id: 260,
    example: 'Example: max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])) returns 42 (15 + 20 + 7).',
    starter: `${TREE}

def max_path_sum(root):
    # The largest sum of values along any path between two nodes (at least one node; values may be negative).
    pass


print(max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])))
`,
    tests: [
      { call: 'max_path_sum', args: [T([1, 2, 3])], expected: 6 },
      { call: 'max_path_sum', args: [T([-10, 9, 20, null, null, 15, 7])], expected: 42 },
      { call: 'max_path_sum', args: [T([-3])], expected: -3 },
      { call: 'max_path_sum', args: [T([2, -1])], expected: 2 },
      { call: 'max_path_sum', args: [T(PATHS)], expected: 48 },
    ],
    hint: 'A helper returns the best sum of a path going down from a node (its value plus the better child\'s gain, ignoring a negative gain). At each node, the best path bending there is value + left gain + right gain; keep the biggest seen. Like planning a hike that may go up to a summit and down another side: at each peak, take the best trail on either side.',
  },
];
