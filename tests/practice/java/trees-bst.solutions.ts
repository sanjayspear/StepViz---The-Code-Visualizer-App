// Java reference solutions for Practice: Trees & BST. Never shipped to students.
const main = (methods: string) => `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int val) {
        this.val = val;
    }
}

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const LEVELS = `    static List<List<TreeNode>> levels(TreeNode root) {
        List<List<TreeNode>> out = new ArrayList<>();
        List<TreeNode> level = new ArrayList<>();
        if (root != null) level.add(root);
        while (!level.isEmpty()) {
            out.add(level);
            List<TreeNode> next = new ArrayList<>();
            for (TreeNode n : level) {
                if (n.left != null) next.add(n.left);
                if (n.right != null) next.add(n.right);
            }
            level = next;
        }
        return out;
    }
`;

export const SOLUTIONS: Record<number, string> = {
  236: main(`    static List<Integer> inorder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        out.addAll(inorder(root.left));
        out.add(root.val);
        out.addAll(inorder(root.right));
        return out;
    }

    static List<Integer> preorder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        out.add(root.val);
        out.addAll(preorder(root.left));
        out.addAll(preorder(root.right));
        return out;
    }

    static List<Integer> postorder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        out.addAll(postorder(root.left));
        out.addAll(postorder(root.right));
        out.add(root.val);
        return out;
    }
`),
  237: main(`    static int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
`),
  238: main(`    static int minDepth(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null) return 1 + minDepth(root.right);
        if (root.right == null) return 1 + minDepth(root.left);
        return 1 + Math.min(minDepth(root.left), minDepth(root.right));
    }
`),
  239: main(`    static boolean sameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null || p.val != q.val) return false;
        return sameTree(p.left, q.left) && sameTree(p.right, q.right);
    }
`),
  240: main(`    static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = left;
        return root;
    }
`),
  241: main(`    static boolean mirror(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null || a.val != b.val) return false;
        return mirror(a.left, b.right) && mirror(a.right, b.left);
    }

    static boolean isSymmetric(TreeNode root) {
        return root == null || mirror(root.left, root.right);
    }
`),
  242: main(`    static int[] countNodesLeaves(TreeNode root) {
        if (root == null) return new int[] {0, 0};
        if (root.left == null && root.right == null) return new int[] {1, 1};
        int[] a = countNodesLeaves(root.left);
        int[] b = countNodesLeaves(root.right);
        return new int[] {a[0] + b[0] + 1, a[1] + b[1]};
    }
`),
  243: main(`    static boolean hasPathSum(TreeNode root, int target) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return target == root.val;
        return hasPathSum(root.left, target - root.val) || hasPathSum(root.right, target - root.val);
    }
`),
  244: main(`    static void walk(TreeNode node, String path, List<String> out) {
        if (node == null) return;
        path = path.isEmpty() ? "" + node.val : path + "->" + node.val;
        if (node.left == null && node.right == null) out.add(path);
        walk(node.left, path, out);
        walk(node.right, path, out);
    }

    static List<String> binaryTreePaths(TreeNode root) {
        List<String> out = new ArrayList<>();
        walk(root, "", out);
        return out;
    }
`),
  245: main(`    static int best = 0;

    static int height(TreeNode node) {
        if (node == null) return 0;
        int a = height(node.left);
        int b = height(node.right);
        best = Math.max(best, a + b);
        return 1 + Math.max(a, b);
    }

    static int diameter(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }
`),
  246: main(`    static int height(TreeNode node) {
        if (node == null) return 0;
        int a = height(node.left);
        int b = height(node.right);
        if (a < 0 || b < 0 || Math.abs(a - b) > 1) return -1;
        return 1 + Math.max(a, b);
    }

    static boolean isBalanced(TreeNode root) {
        return height(root) >= 0;
    }
`),
  247: main(`    static TreeNode build(int[] nums, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) / 2;
        TreeNode node = new TreeNode(nums[mid]);
        node.left = build(nums, lo, mid - 1);
        node.right = build(nums, mid + 1, hi);
        return node;
    }

    static TreeNode sortedToBst(int[] nums) {
        return build(nums, 0, nums.length - 1);
    }
`),
  248: main(`    static List<Integer> inorderIterative(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode node = root;
        while (!stack.isEmpty() || node != null) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            out.add(node.val);
            node = node.right;
        }
        return out;
    }

    static List<Integer> preorderIterative(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            out.add(node.val);
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        }
        return out;
    }

    static List<Integer> postorderIterative(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            out.add(0, node.val);
            if (node.left != null) stack.push(node.left);
            if (node.right != null) stack.push(node.right);
        }
        return out;
    }
`),
  249: main(`${LEVELS}
    static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        for (List<TreeNode> level : levels(root)) {
            List<Integer> values = new ArrayList<>();
            for (TreeNode n : level) values.add(n.val);
            out.add(values);
        }
        return out;
    }
`),
  250: main(`${LEVELS}
    static List<List<Integer>> zigzagOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        for (List<TreeNode> level : levels(root)) {
            List<Integer> values = new ArrayList<>();
            for (TreeNode n : level) {
                if (out.size() % 2 == 1) values.add(0, n.val);
                else values.add(n.val);
            }
            out.add(values);
        }
        return out;
    }
`),
  251: main(`${LEVELS}
    static List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        for (List<TreeNode> level : levels(root)) out.add(level.get(level.size() - 1).val);
        return out;
    }
`),
  252: main(`    static TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {
        if (root == null || root.val == p || root.val == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
`),
  253: main(`    static TreeNode lcaBst(TreeNode root, int p, int q) {
        TreeNode node = root;
        while (node != null) {
            if (p < node.val && q < node.val) node = node.left;
            else if (p > node.val && q > node.val) node = node.right;
            else return node;
        }
        return null;
    }
`),
  254: main(`    static boolean ok(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return ok(node.left, low, node.val) && ok(node.right, node.val, high);
    }

    static boolean isValidBst(TreeNode root) {
        return ok(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
`),
  255: main(`    static TreeNode insertBst(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertBst(root.left, val);
        else root.right = insertBst(root.right, val);
        return root;
    }

    static TreeNode deleteBst(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteBst(root.left, key);
        else if (key > root.val) root.right = deleteBst(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            TreeNode smallest = root.right;
            while (smallest.left != null) smallest = smallest.left;
            root.val = smallest.val;
            root.right = deleteBst(root.right, smallest.val);
        }
        return root;
    }
`),
  256: main(`    static int kthSmallest(TreeNode root, int k) {
        Stack<TreeNode> stack = new Stack<>();
        TreeNode node = root;
        while (true) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            k--;
            if (k == 0) return node.val;
            node = node.right;
        }
    }
`),
  257: main(`    static int next = 0;

    static TreeNode build(int[] preorder, Map<Integer, Integer> where, int lo, int hi) {
        if (lo > hi) return null;
        int val = preorder[next];
        next++;
        TreeNode node = new TreeNode(val);
        int mid = where.get(val);
        node.left = build(preorder, where, lo, mid - 1);
        node.right = build(preorder, where, mid + 1, hi);
        return node;
    }

    static TreeNode treeFromOrders(int[] preorder, int[] inorder) {
        Map<Integer, Integer> where = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) where.put(inorder[i], i);
        next = 0;
        return build(preorder, where, 0, inorder.length - 1);
    }
`),
  258: main(`    static void flatten(TreeNode root) {
        TreeNode node = root;
        while (node != null) {
            if (node.left != null) {
                TreeNode last = node.left;
                while (last.right != null) last = last.right;
                last.right = node.right;
                node.right = node.left;
                node.left = null;
            }
            node = node.right;
        }
    }
`),
  259: main(`    static void write(TreeNode node, List<String> parts) {
        if (node == null) {
            parts.add("#");
            return;
        }
        parts.add("" + node.val);
        write(node.left, parts);
        write(node.right, parts);
    }

    static String serialize(TreeNode root) {
        List<String> parts = new ArrayList<>();
        write(root, parts);
        return String.join(",", parts);
    }

    static int at = 0;

    static TreeNode read(String[] values) {
        String v = values[at];
        at++;
        if (v.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(v));
        node.left = read(values);
        node.right = read(values);
        return node;
    }

    static TreeNode deserialize(String text) {
        at = 0;
        return read(text.split(","));
    }
`),
  260: main(`    static int best;

    static int gain(TreeNode node) {
        if (node == null) return 0;
        int a = Math.max(gain(node.left), 0);
        int b = Math.max(gain(node.right), 0);
        best = Math.max(best, node.val + a + b);
        return node.val + Math.max(a, b);
    }

    static int maxPathSum(TreeNode root) {
        best = Integer.MIN_VALUE;
        gain(root);
        return best;
    }
`),
};
