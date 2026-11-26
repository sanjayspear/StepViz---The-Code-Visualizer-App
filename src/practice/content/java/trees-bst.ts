// Practice, Java: Trees & BST (Q236-Q260). Tests come from the Python content;
// reference solutions in tests/practice/java/trees-bst.solutions.ts.
// Every starter brings its own TreeNode class and a helper that builds a tree from level-order text.
import { fromPython } from '../javascript/shared';
import { TREES_BST } from '../python/trees-bst';
import { javaStarter, type JavaMethod } from './shared';

const NODE = `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int val) {
        this.val = val;
    }
}`;

const HELPERS = `    static TreeNode buildTree(String levelOrder) {
        // A tree from its values level by level, "null" for a missing child: "3 9 20 null null 15 7"
        String[] parts = levelOrder.split(" ");
        if (levelOrder.isEmpty() || parts[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(parts[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < parts.length) {
            TreeNode node = queue.poll();
            if (i < parts.length && !parts[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(parts[i]));
                queue.offer(node.left);
            }
            i++;
            if (i < parts.length && !parts[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(parts[i]));
                queue.offer(node.right);
            }
            i++;
        }
        return root;
    }`;

const tree = (methods: JavaMethod[], mainBody: string) => javaStarter(methods, mainBody, NODE, HELPERS);
const one = (header: string, comment: string, mainBody: string) => tree([[header, comment]], mainBody);
const EX = 'buildTree("3 9 20 null null 15 7")';

export const TREES_BST_JAVA = fromPython(TREES_BST, {
  236: {
    example: 'Example: for the tree 1 with children 2 and 3, inorder gives [2, 1, 3], preorder [1, 2, 3] and postorder [2, 3, 1].',
    starter: tree(
      [
        ['List<Integer> inorder(TreeNode root)', 'Left subtree, then the node, then the right subtree, recursively. A list of values.'],
        ['List<Integer> preorder(TreeNode root)', 'The node first, then left, then right.'],
        ['List<Integer> postorder(TreeNode root)', 'Left, then right, then the node last.'],
      ],
      'TreeNode root = buildTree("1 2 3");\nSystem.out.println(inorder(root));\nSystem.out.println(preorder(root));\nSystem.out.println(postorder(root));',
    ),
    hint: "Each traversal is a few lines: for an empty tree return an empty list; otherwise add the answers for the left subtree, the node's own value and the right subtree in the order the name says (in: left, node, right; pre: node first; post: node last). Like reading out a family tree: the only question is whether you say the parent's name before, between or after the children's.",
  },
  237: {
    example: 'Example: maxDepth(buildTree("3 9 20 null null 15 7")) returns 3.',
    starter: one('int maxDepth(TreeNode root)', 'How many nodes are on the longest path from the root down to a leaf (0 for an empty tree)?', `System.out.println(maxDepth(${EX}));`),
  },
  238: {
    example: 'Example: minDepth(buildTree("3 9 20 null null 15 7")) returns 2 (3 then 9).',
    starter: one('int minDepth(TreeNode root)', 'How many nodes are on the shortest path from the root down to a leaf (0 for an empty tree)?', `System.out.println(minDepth(${EX}));`),
  },
  239: {
    example: 'Example: sameTree(buildTree("1 2 3"), buildTree("1 2 3")) returns true.',
    starter: one('boolean sameTree(TreeNode p, TreeNode q)', 'true if both trees have the same shape and the same values.', 'System.out.println(sameTree(buildTree("1 2 3"), buildTree("1 2 3")));'),
  },
  240: {
    example: 'Example: invertTree(buildTree("2 1 3")) gives the tree [2, 3, 1].',
    starter: one(
      'TreeNode invertTree(TreeNode root)',
      'Swap the left and right child of every node (a mirror image). Return the root.',
      'TreeNode root = invertTree(buildTree("2 1 3"));\nSystem.out.println(root != null && root.left != null ? root.left.val : -1);',
    ),
    hint: 'For a node: invert its left and right subtrees, then swap them (with a spare variable). An empty tree stays empty. Like looking at a family photo in a mirror: everyone swaps sides.',
  },
  241: {
    example: 'Example: isSymmetric(buildTree("1 2 2 3 4 4 3")) returns true.',
    starter: one('boolean isSymmetric(TreeNode root)', 'true if the tree is a mirror image of itself around its centre.', 'System.out.println(isSymmetric(buildTree("1 2 2 3 4 4 3")));'),
    hint: 'Write mirror(a, b): both empty is true; one empty or different values is false; otherwise mirror(a.left, b.right) and mirror(a.right, b.left). The tree is symmetric if mirror(root.left, root.right). Like a butterfly: the left wing must match the right wing flipped over.',
  },
  242: {
    example: 'Example: countNodesLeaves(buildTree("1 2 3 4 5")) returns [5, 3].',
    starter: one(
      'int[] countNodesLeaves(TreeNode root)',
      '{how many nodes, how many leaves}; a leaf is a node with no children.',
      'System.out.println(Arrays.toString(countNodesLeaves(buildTree("1 2 3 4 5"))));',
    ),
    hint: 'An empty tree has {0, 0} and a leaf has {1, 1}. Otherwise add up the counts of both subtrees, plus 1 node for this one. Like counting the branches and the leaves of a real tree, one branch at a time.',
  },
  243: {
    example: 'Example: hasPathSum(root, 22) returns true when a root-to-leaf path such as 5, 4, 11, 2 adds up to 22.',
    starter: one(
      'boolean hasPathSum(TreeNode root, int target)',
      'true if some path from the root down to a leaf adds up to target.',
      'System.out.println(hasPathSum(buildTree("5 4 8 11 null 13 4 7 2 null null null 1"), 22));',
    ),
  },
  244: {
    example: 'Example: binaryTreePaths(buildTree("1 2 3 null 5")) returns [1->2->5, 1->3] (in any order).',
    starter: one('List<String> binaryTreePaths(TreeNode root)', 'Every path from the root to a leaf, written like "1->2->5".', 'System.out.println(binaryTreePaths(buildTree("1 2 3 null 5")));'),
  },
  245: {
    example: 'Example: diameter(buildTree("1 2 3 4 5")) returns 3 (the path 4, 2, 1, 3 has 3 edges).',
    starter: one('int diameter(TreeNode root)', 'The number of edges on the longest path between any two nodes (0 for 0 or 1 node).', 'System.out.println(diameter(buildTree("1 2 3 4 5")));'),
    hint: "Work out each subtree's height (in nodes) with a helper. The longest path through a node is left height + right height; keep the biggest of those over all nodes (it need not pass through the root), for example in a static variable or a one-item int[]. Like finding the two people furthest apart in a family tree.",
  },
  246: {
    example: 'Example: isBalanced(buildTree("3 9 20 null null 15 7")) returns true.',
    starter: one('boolean isBalanced(TreeNode root)', 'true if, at every node, the heights of the two subtrees differ by at most 1.', `System.out.println(isBalanced(${EX}));`),
  },
  247: {
    example: 'Example: sortedToBst(new int[] {-10, -3, 0, 5, 9}) can give the tree [0, -3, 9, -10, null, 5].',
    starter: one(
      'TreeNode sortedToBst(int[] nums)',
      'nums is sorted (all different). A height-balanced binary search tree holding them; return its root.',
      'TreeNode root = sortedToBst(new int[] {-10, -3, 0, 5, 9});\nSystem.out.println(root != null ? root.val : -1);',
    ),
    hint: 'The middle number becomes the root; the numbers to its left build the left subtree and those to its right the right subtree, the same way (a helper taking the range lo..hi). An empty range gives null. Like organising a knock-out tournament bracket from the middle outwards so both halves are the same size.',
  },
  248: {
    example: 'Example: for the tree 1 with children 2 and 3, inorderIterative gives [2, 1, 3].',
    starter: tree(
      [
        ['List<Integer> inorderIterative(TreeNode root)', 'The three traversals again, with a loop and a stack instead of recursion.'],
        ['List<Integer> preorderIterative(TreeNode root)', ''],
        ['List<Integer> postorderIterative(TreeNode root)', ''],
      ],
      'TreeNode root = buildTree("1 2 3");\nSystem.out.println(inorderIterative(root));\nSystem.out.println(preorderIterative(root));\nSystem.out.println(postorderIterative(root));',
    ),
  },
  249: {
    example: 'Example: levelOrder(buildTree("3 9 20 null null 15 7")) returns [[3], [9, 20], [15, 7]].',
    starter: one('List<List<Integer>> levelOrder(TreeNode root)', 'The values level by level, left to right: a list of lists.', `System.out.println(levelOrder(${EX}));`),
  },
  250: {
    example: 'Example: zigzagOrder(buildTree("3 9 20 null null 15 7")) returns [[3], [20, 9], [15, 7]].',
    starter: one('List<List<Integer>> zigzagOrder(TreeNode root)', 'Level by level, left to right on the first level, right to left on the next, and so on.', `System.out.println(zigzagOrder(${EX}));`),
  },
  251: {
    example: 'Example: rightSideView(buildTree("1 2 3 null 5 null 4")) returns [1, 3, 4].',
    starter: one('List<Integer> rightSideView(TreeNode root)', 'Standing on the right of the tree: the value you see on each level, top to bottom.', 'System.out.println(rightSideView(buildTree("1 2 3 null 5 null 4")));'),
  },
  252: {
    example: 'Example: in the tree [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], the lowest common ancestor of 5 and 1 is the node 3.',
    starter: one(
      'TreeNode lowestCommonAncestor(TreeNode root, int p, int q)',
      'p and q are values in the tree (all values are different). Return the lowest node\nthat has both below it (a node counts as below itself).',
      'TreeNode node = lowestCommonAncestor(buildTree("3 5 1 6 2 0 8 null null 7 4"), 5, 1);\nSystem.out.println(node != null ? node.val : -1);',
    ),
  },
  253: {
    example: 'Example: in the BST [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], the lowest common ancestor of 2 and 8 is 6.',
    starter: one(
      'TreeNode lcaBst(TreeNode root, int p, int q)',
      'root is a binary search tree; p and q are values in it. Return the lowest common ancestor node.',
      'TreeNode node = lcaBst(buildTree("6 2 8 0 4 7 9 null null 3 5"), 2, 8);\nSystem.out.println(node != null ? node.val : -1);',
    ),
  },
  254: {
    example: 'Example: isValidBst(buildTree("2 1 3")) returns true; isValidBst(buildTree("5 1 4 null null 3 6")) returns false.',
    starter: one(
      'boolean isValidBst(TreeNode root)',
      'true if every node is bigger than everything in its left subtree and\nsmaller than everything in its right subtree.',
      'System.out.println(isValidBst(buildTree("2 1 3")));',
    ),
    hint: "Checking only each node's children is not enough. Pass down a range (low, high) the node must fit in, as longs so the edges never get in the way: going left lowers high to the node's value, going right raises low. Like a guessing game where every answer narrows the allowed range.",
  },
  255: {
    example: 'Example: insertBst(buildTree("4 2 7 1 3"), 5) gives a BST holding 1, 2, 3, 4, 5, 7; deleteBst removes a value the same way.',
    starter: tree(
      [
        ['TreeNode insertBst(TreeNode root, int val)', 'Put val into the BST (it is not there yet). Return the root.'],
        ['TreeNode deleteBst(TreeNode root, int key)', 'Remove key from the BST if it is there. Return the root.'],
      ],
      'TreeNode root = insertBst(buildTree("4 2 7 1 3"), 5);\nroot = deleteBst(root, 2);\nSystem.out.println(root != null ? root.val : -1);',
    ),
  },
  256: {
    example: 'Example: kthSmallest(buildTree("3 1 4 null 2"), 1) returns 1.',
    starter: one('int kthSmallest(TreeNode root, int k)', 'root is a BST. The kth smallest value (k = 1 is the smallest).', 'System.out.println(kthSmallest(buildTree("3 1 4 null 2"), 1));'),
  },
  257: {
    example: 'Example: treeFromOrders(new int[] {3, 9, 20, 15, 7}, new int[] {9, 3, 15, 20, 7}) gives the tree [3, 9, 20, null, null, 15, 7].',
    starter: one(
      'TreeNode treeFromOrders(int[] preorder, int[] inorder)',
      'Rebuild the tree (all values are different) from its preorder and inorder arrays. Return the root.',
      'TreeNode root = treeFromOrders(new int[] {3, 9, 20, 15, 7}, new int[] {9, 3, 15, 20, 7});\nSystem.out.println(root != null ? root.val : -1);',
    ),
  },
  258: {
    example: 'Example: flatten(root) for the tree [1, 2, 5, 3, 4, null, 6] changes it to 1 -> 2 -> 3 -> 4 -> 5 -> 6 along the right children.',
    starter: one(
      'void flatten(TreeNode root)',
      'Change the tree itself into a chain along right children, in preorder; every left child becomes null.',
      'TreeNode root = buildTree("1 2 5 3 4 null 6");\nflatten(root);\nSystem.out.println(root.right != null ? root.right.val : -1);',
    ),
    hint: "For each node with a left subtree: find the rightmost node of that left subtree, hang the node's right subtree on it, move the left subtree to the right, and set left to null. Then move on to the right child. Like folding a paper family tree into one long strip, in the order you would read the names.",
  },
  259: {
    example: 'Example: deserialize(serialize(root)) gives back a tree with the same shape and values as root.',
    starter: tree(
      [
        ['String serialize(TreeNode root)', 'Turn the tree into a piece of text (any format you like).'],
        ['TreeNode deserialize(String text)', 'Rebuild the tree from that text; return its root.'],
      ],
      'TreeNode root = buildTree("1 2 3 null null 4 5");\nString text = serialize(root);\nSystem.out.println(text);\nSystem.out.println(deserialize(text) != null);',
    ),
    hint: 'Write the tree in preorder, with a marker such as "#" for every missing child, separated by commas. To rebuild, split the text and read the values back in the same order with the same recursion (keep the position in a static int or a one-item int[]): a "#" means null. Like packing a tent with a list of every pole, including the gaps, so it can be put back exactly.',
  },
  260: {
    example: 'Example: maxPathSum(buildTree("-10 9 20 null null 15 7")) returns 42 (15 + 20 + 7).',
    starter: one(
      'int maxPathSum(TreeNode root)',
      'The largest sum of values along any path between two nodes (at least one node; values may be negative).',
      'System.out.println(maxPathSum(buildTree("-10 9 20 null null 15 7")));',
    ),
  },
});
