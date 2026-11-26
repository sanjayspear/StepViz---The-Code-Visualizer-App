// Practice, C++: Trees & BST (Q236-Q260). Tests come from the Python content;
// reference solutions in tests/practice/cpp/trees-bst.solutions.ts.
// Every starter brings its own TreeNode struct and a helper that builds a tree from level-order text.
import { fromPython } from '../javascript/shared';
import { TREES_BST } from '../python/trees-bst';
import { cppStarter, PRINT_INTS, type CppFunction } from './shared';

const NODE = `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};`;

const HELPERS = `TreeNode* buildTree(string levelOrder) {
    // A tree from its values level by level, "null" for a missing child: "3 9 20 null null 15 7"
    vector<string> parts;
    string word = "";
    for (char c : levelOrder + " ") {
        if (c != ' ') {
            word += c;
        } else if (!word.empty()) {
            parts.push_back(word);
            word = "";
        }
    }
    if (parts.empty() || parts[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(parts[0]));
    vector<TreeNode*> waiting;
    waiting.push_back(root);
    int head = 0;
    int i = 1;
    while (head < waiting.size() && i < parts.size()) {
        TreeNode* node = waiting[head];
        head++;
        if (i < parts.size() && parts[i] != "null") {
            node->left = new TreeNode(stoi(parts[i]));
            waiting.push_back(node->left);
        }
        i++;
        if (i < parts.size() && parts[i] != "null") {
            node->right = new TreeNode(stoi(parts[i]));
            waiting.push_back(node->right);
        }
        i++;
    }
    return root;
}`;

const PRINT_LISTS = `void printLists(const vector<vector<int>>& lists) {
    for (int i = 0; i < lists.size(); i++) {
        vector<int> row = lists[i];
        printVector(row);
    }
}`;

const tree = (functions: CppFunction[], mainBody: string) => cppStarter(functions, mainBody, [], `${NODE}\n\n${HELPERS}\n\n${PRINT_INTS}\n\n${PRINT_LISTS}`);
const one = (header: string, comment: string, mainBody: string) => tree([[header, comment]], mainBody);
const EX = 'TreeNode* root = buildTree("3 9 20 null null 15 7");';
const valueOf = (expr: string) => `TreeNode* node = ${expr};\ncout << (node != nullptr ? node->val : -1) << endl;`;

export const TREES_BST_CPP = fromPython(TREES_BST, {
  236: {
    example: 'Example: for the tree 1 with children 2 and 3, inorder gives [2, 1, 3], preorder [1, 2, 3] and postorder [2, 3, 1].',
    starter: tree(
      [
        ['vector<int> inorder(TreeNode* root)', 'Left subtree, then the node, then the right subtree, recursively. A vector of values.'],
        ['vector<int> preorder(TreeNode* root)', 'The node first, then left, then right.'],
        ['vector<int> postorder(TreeNode* root)', 'Left, then right, then the node last.'],
      ],
      'TreeNode* root = buildTree("1 2 3");\nvector<int> a = inorder(root);\nprintVector(a);\nvector<int> b = preorder(root);\nprintVector(b);\nvector<int> c = postorder(root);\nprintVector(c);',
    ),
    hint: "Each traversal is a few lines: for an empty tree (nullptr) return an empty vector; otherwise add the answers for the left subtree, the node's own value and the right subtree in the order the name says (in: left, node, right; pre: node first; post: node last). Like reading out a family tree: the only question is whether you say the parent's name before, between or after the children's.",
  },
  237: {
    example: 'Example: maxDepth(buildTree("3 9 20 null null 15 7")) returns 3.',
    starter: one('int maxDepth(TreeNode* root)', 'How many nodes are on the longest path from the root down to a leaf (0 for an empty tree)?', `${EX}\ncout << maxDepth(root) << endl;`),
  },
  238: {
    example: 'Example: minDepth(buildTree("3 9 20 null null 15 7")) returns 2 (3 then 9).',
    starter: one('int minDepth(TreeNode* root)', 'How many nodes are on the shortest path from the root down to a leaf (0 for an empty tree)?', `${EX}\ncout << minDepth(root) << endl;`),
  },
  239: {
    example: 'Example: sameTree(buildTree("1 2 3"), buildTree("1 2 3")) returns true.',
    starter: one('bool sameTree(TreeNode* p, TreeNode* q)', 'true if both trees have the same shape and the same values.', 'TreeNode* p = buildTree("1 2 3");\nTreeNode* q = buildTree("1 2 3");\ncout << boolalpha << sameTree(p, q) << endl;'),
  },
  240: {
    example: 'Example: invertTree(buildTree("2 1 3")) gives the tree [2, 3, 1].',
    starter: one(
      'TreeNode* invertTree(TreeNode* root)',
      'Swap the left and right child of every node (a mirror image). Return the root.',
      'TreeNode* root = invertTree(buildTree("2 1 3"));\ncout << (root != nullptr && root->left != nullptr ? root->left->val : -1) << endl;',
    ),
    hint: 'For a node: invert its left and right subtrees, then swap them (with a spare pointer). An empty tree stays empty. Like looking at a family photo in a mirror: everyone swaps sides.',
  },
  241: {
    example: 'Example: isSymmetric(buildTree("1 2 2 3 4 4 3")) returns true.',
    starter: one('bool isSymmetric(TreeNode* root)', 'true if the tree is a mirror image of itself around its centre.', 'TreeNode* root = buildTree("1 2 2 3 4 4 3");\ncout << boolalpha << isSymmetric(root) << endl;'),
    hint: 'Write mirror(a, b): both nullptr is true; one nullptr or different values is false; otherwise mirror(a->left, b->right) and mirror(a->right, b->left). The tree is symmetric if mirror(root->left, root->right). Like a butterfly: the left wing must match the right wing flipped over.',
  },
  242: {
    example: 'Example: countNodesLeaves(buildTree("1 2 3 4 5")) returns [5, 3].',
    starter: one(
      'vector<int> countNodesLeaves(TreeNode* root)',
      '{how many nodes, how many leaves}; a leaf is a node with no children.',
      'TreeNode* root = buildTree("1 2 3 4 5");\nvector<int> r = countNodesLeaves(root);\nprintVector(r);',
    ),
    hint: 'An empty tree has {0, 0} and a leaf has {1, 1}. Otherwise add up the counts of both subtrees, plus 1 node for this one. Like counting the branches and the leaves of a real tree, one branch at a time.',
  },
  243: {
    example: 'Example: hasPathSum(root, 22) returns true when a root-to-leaf path such as 5, 4, 11, 2 adds up to 22.',
    starter: one(
      'bool hasPathSum(TreeNode* root, int target)',
      'true if some path from the root down to a leaf adds up to target.',
      'TreeNode* root = buildTree("5 4 8 11 null 13 4 7 2 null null null 1");\ncout << boolalpha << hasPathSum(root, 22) << endl;',
    ),
  },
  244: {
    example: 'Example: binaryTreePaths(buildTree("1 2 3 null 5")) returns [1->2->5, 1->3] (in any order).',
    starter: one(
      'vector<string> binaryTreePaths(TreeNode* root)',
      'Every path from the root to a leaf, written like "1->2->5".',
      'TreeNode* root = buildTree("1 2 3 null 5");\nvector<string> r = binaryTreePaths(root);\nfor (string p : r) cout << p << endl;',
    ),
  },
  245: {
    example: 'Example: diameter(buildTree("1 2 3 4 5")) returns 3 (the path 4, 2, 1, 3 has 3 edges).',
    starter: one('int diameter(TreeNode* root)', 'The number of edges on the longest path between any two nodes (0 for 0 or 1 node).', 'TreeNode* root = buildTree("1 2 3 4 5");\ncout << diameter(root) << endl;'),
    hint: "Work out each subtree's height (in nodes) with a helper. The longest path through a node is left height + right height; keep the biggest of those over all nodes (it need not pass through the root), for example in a variable passed by reference (int& best). Like finding the two people furthest apart in a family tree.",
  },
  246: {
    example: 'Example: isBalanced(buildTree("3 9 20 null null 15 7")) returns true.',
    starter: one('bool isBalanced(TreeNode* root)', 'true if, at every node, the heights of the two subtrees differ by at most 1.', `${EX}\ncout << boolalpha << isBalanced(root) << endl;`),
  },
  247: {
    example: 'Example: sortedToBst({-10, -3, 0, 5, 9}) can give the tree [0, -3, 9, -10, null, 5].',
    starter: one(
      'TreeNode* sortedToBst(vector<int>& nums)',
      'nums is sorted (all different). A height-balanced binary search tree holding them; return its root.',
      'vector<int> nums = {-10, -3, 0, 5, 9};\nTreeNode* root = sortedToBst(nums);\ncout << (root != nullptr ? root->val : -1) << endl;',
    ),
    hint: 'The middle number becomes the root; the numbers to its left build the left subtree and those to its right the right subtree, the same way (a helper taking the range lo..hi). An empty range gives nullptr. Like organising a knock-out tournament bracket from the middle outwards so both halves are the same size.',
  },
  248: {
    example: 'Example: for the tree 1 with children 2 and 3, inorderIterative gives [2, 1, 3].',
    starter: tree(
      [
        ['vector<int> inorderIterative(TreeNode* root)', 'The three traversals again, with a loop and a stack (a vector<TreeNode*> works) instead of recursion.'],
        ['vector<int> preorderIterative(TreeNode* root)', ''],
        ['vector<int> postorderIterative(TreeNode* root)', ''],
      ],
      'TreeNode* root = buildTree("1 2 3");\nvector<int> a = inorderIterative(root);\nprintVector(a);\nvector<int> b = preorderIterative(root);\nprintVector(b);\nvector<int> c = postorderIterative(root);\nprintVector(c);',
    ),
  },
  249: {
    example: 'Example: levelOrder(buildTree("3 9 20 null null 15 7")) returns [[3], [9, 20], [15, 7]].',
    starter: one('vector<vector<int>> levelOrder(TreeNode* root)', 'The values level by level, left to right: a vector of vectors.', `${EX}\nvector<vector<int>> r = levelOrder(root);\nprintLists(r);`),
  },
  250: {
    example: 'Example: zigzagOrder(buildTree("3 9 20 null null 15 7")) returns [[3], [20, 9], [15, 7]].',
    starter: one('vector<vector<int>> zigzagOrder(TreeNode* root)', 'Level by level, left to right on the first level, right to left on the next, and so on.', `${EX}\nvector<vector<int>> r = zigzagOrder(root);\nprintLists(r);`),
  },
  251: {
    example: 'Example: rightSideView(buildTree("1 2 3 null 5 null 4")) returns [1, 3, 4].',
    starter: one('vector<int> rightSideView(TreeNode* root)', 'Standing on the right of the tree: the value you see on each level, top to bottom.', 'TreeNode* root = buildTree("1 2 3 null 5 null 4");\nvector<int> r = rightSideView(root);\nprintVector(r);'),
  },
  252: {
    example: 'Example: in the tree [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], the lowest common ancestor of 5 and 1 is the node 3.',
    starter: one(
      'TreeNode* lowestCommonAncestor(TreeNode* root, int p, int q)',
      'p and q are values in the tree (all values are different). Return the lowest node\nthat has both below it (a node counts as below itself).',
      `TreeNode* root = buildTree("3 5 1 6 2 0 8 null null 7 4");\n${valueOf('lowestCommonAncestor(root, 5, 1)')}`,
    ),
  },
  253: {
    example: 'Example: in the BST [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], the lowest common ancestor of 2 and 8 is 6.',
    starter: one(
      'TreeNode* lcaBst(TreeNode* root, int p, int q)',
      'root is a binary search tree; p and q are values in it. Return the lowest common ancestor node.',
      `TreeNode* root = buildTree("6 2 8 0 4 7 9 null null 3 5");\n${valueOf('lcaBst(root, 2, 8)')}`,
    ),
  },
  254: {
    example: 'Example: isValidBst(buildTree("2 1 3")) returns true; isValidBst(buildTree("5 1 4 null null 3 6")) returns false.',
    starter: one(
      'bool isValidBst(TreeNode* root)',
      'true if every node is bigger than everything in its left subtree and\nsmaller than everything in its right subtree.',
      'TreeNode* root = buildTree("2 1 3");\ncout << boolalpha << isValidBst(root) << endl;',
    ),
    hint: "Checking only each node's children is not enough. Pass down a range (low, high) the node must fit in, as long long so the edges never get in the way: going left lowers high to the node's value, going right raises low. Like a guessing game where every answer narrows the allowed range.",
  },
  255: {
    example: 'Example: insertBst(buildTree("4 2 7 1 3"), 5) gives a BST holding 1, 2, 3, 4, 5, 7; deleteBst removes a value the same way.',
    starter: tree(
      [
        ['TreeNode* insertBst(TreeNode* root, int val)', 'Put val into the BST (it is not there yet). Return the root.'],
        ['TreeNode* deleteBst(TreeNode* root, int key)', 'Remove key from the BST if it is there. Return the root.'],
      ],
      'TreeNode* root = insertBst(buildTree("4 2 7 1 3"), 5);\nroot = deleteBst(root, 2);\ncout << (root != nullptr ? root->val : -1) << endl;',
    ),
  },
  256: {
    example: 'Example: kthSmallest(buildTree("3 1 4 null 2"), 1) returns 1.',
    starter: one('int kthSmallest(TreeNode* root, int k)', 'root is a BST. The kth smallest value (k = 1 is the smallest).', 'TreeNode* root = buildTree("3 1 4 null 2");\ncout << kthSmallest(root, 1) << endl;'),
  },
  257: {
    example: 'Example: treeFromOrders({3, 9, 20, 15, 7}, {9, 3, 15, 20, 7}) gives the tree [3, 9, 20, null, null, 15, 7].',
    starter: one(
      'TreeNode* treeFromOrders(vector<int>& preorder, vector<int>& inorder)',
      'Rebuild the tree (all values are different) from its preorder and inorder vectors. Return the root.',
      'vector<int> pre = {3, 9, 20, 15, 7};\nvector<int> in = {9, 3, 15, 20, 7};\nTreeNode* root = treeFromOrders(pre, in);\ncout << (root != nullptr ? root->val : -1) << endl;',
    ),
  },
  258: {
    example: 'Example: flatten(root) for the tree [1, 2, 5, 3, 4, null, 6] changes it to 1 -> 2 -> 3 -> 4 -> 5 -> 6 along the right children.',
    starter: one(
      'void flatten(TreeNode* root)',
      'Change the tree itself into a chain along right children, in preorder; every left child becomes nullptr.',
      'TreeNode* root = buildTree("1 2 5 3 4 null 6");\nflatten(root);\ncout << (root->right != nullptr ? root->right->val : -1) << endl;',
    ),
    hint: "For each node with a left subtree: find the rightmost node of that left subtree, hang the node's right subtree on it, move the left subtree to the right, and set left to nullptr. Then move on to the right child. Like folding a paper family tree into one long strip, in the order you would read the names.",
  },
  259: {
    example: 'Example: deserialize(serialize(root)) gives back a tree with the same shape and values as root.',
    starter: tree(
      [
        ['string serialize(TreeNode* root)', 'Turn the tree into a piece of text (any format you like).'],
        ['TreeNode* deserialize(string text)', 'Rebuild the tree from that text; return its root.'],
      ],
      'TreeNode* root = buildTree("1 2 3 null null 4 5");\nstring text = serialize(root);\ncout << text << endl;\ncout << boolalpha << (deserialize(text) != nullptr) << endl;',
    ),
    hint: 'Write the tree in preorder, with a marker such as "#" for every missing child, separated by commas. To rebuild, split the text into parts and read them back in the same order with the same recursion (keep the position in an int passed by reference): a "#" means nullptr. Like packing a tent with a list of every pole, including the gaps, so it can be put back exactly.',
  },
  260: {
    example: 'Example: maxPathSum(buildTree("-10 9 20 null null 15 7")) returns 42 (15 + 20 + 7).',
    starter: one(
      'int maxPathSum(TreeNode* root)',
      'The largest sum of values along any path between two nodes (at least one node; values may be negative).',
      'TreeNode* root = buildTree("-10 9 20 null null 15 7");\ncout << maxPathSum(root) << endl;',
    ),
  },
});
