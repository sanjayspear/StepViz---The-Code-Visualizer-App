// C++ reference solutions for Practice: Trees & BST. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <climits>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

${functions}
int main() {
    return 0;
}
`;
const HEIGHT = `int height(TreeNode* n) {
    if (n == nullptr) return 0;
    return 1 + max(height(n->left), height(n->right));
}
`;
const LEVELS = `vector<vector<int>> levels(TreeNode* root) {
    vector<vector<int>> out;
    if (root == nullptr) return out;
    vector<TreeNode*> row;
    row.push_back(root);
    while (!row.empty()) {
        vector<int> values;
        vector<TreeNode*> next;
        for (TreeNode* n : row) {
            values.push_back(n->val);
            if (n->left != nullptr) next.push_back(n->left);
            if (n->right != nullptr) next.push_back(n->right);
        }
        out.push_back(values);
        row = next;
    }
    return out;
}
`;

export const SOLUTIONS: Record<number, string> = {
  236: file(`void walk(TreeNode* n, vector<int>& out, int order) {
    if (n == nullptr) return;
    if (order == 1) out.push_back(n->val);
    walk(n->left, out, order);
    if (order == 0) out.push_back(n->val);
    walk(n->right, out, order);
    if (order == 2) out.push_back(n->val);
}

vector<int> inorder(TreeNode* root) {
    vector<int> out;
    walk(root, out, 0);
    return out;
}

vector<int> preorder(TreeNode* root) {
    vector<int> out;
    walk(root, out, 1);
    return out;
}

vector<int> postorder(TreeNode* root) {
    vector<int> out;
    walk(root, out, 2);
    return out;
}
`),
  237: file(`int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}
`),
  238: file(`int minDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    if (root->left == nullptr) return 1 + minDepth(root->right);
    if (root->right == nullptr) return 1 + minDepth(root->left);
    return 1 + min(minDepth(root->left), minDepth(root->right));
}
`),
  239: file(`bool sameTree(TreeNode* p, TreeNode* q) {
    if (p == nullptr || q == nullptr) return p == q;
    return p->val == q->val && sameTree(p->left, q->left) && sameTree(p->right, q->right);
}
`),
  240: file(`TreeNode* invertTree(TreeNode* root) {
    if (root == nullptr) return root;
    TreeNode* left = invertTree(root->left);
    root->left = invertTree(root->right);
    root->right = left;
    return root;
}
`),
  241: file(`bool mirror(TreeNode* a, TreeNode* b) {
    if (a == nullptr || b == nullptr) return a == b;
    return a->val == b->val && mirror(a->left, b->right) && mirror(a->right, b->left);
}

bool isSymmetric(TreeNode* root) {
    return root == nullptr || mirror(root->left, root->right);
}
`),
  242: file(`vector<int> countNodesLeaves(TreeNode* root) {
    vector<int> out = {0, 0};
    if (root == nullptr) return out;
    if (root->left == nullptr && root->right == nullptr) {
        out[0] = 1;
        out[1] = 1;
        return out;
    }
    vector<int> a = countNodesLeaves(root->left);
    vector<int> b = countNodesLeaves(root->right);
    out[0] = a[0] + b[0] + 1;
    out[1] = a[1] + b[1];
    return out;
}
`),
  243: file(`bool hasPathSum(TreeNode* root, int target) {
    if (root == nullptr) return false;
    if (root->left == nullptr && root->right == nullptr) return root->val == target;
    return hasPathSum(root->left, target - root->val) || hasPathSum(root->right, target - root->val);
}
`),
  244: file(`void paths(TreeNode* n, string now, vector<string>& out) {
    if (n == nullptr) return;
    string here = now.empty() ? to_string(n->val) : now + "->" + to_string(n->val);
    if (n->left == nullptr && n->right == nullptr) {
        out.push_back(here);
        return;
    }
    paths(n->left, here, out);
    paths(n->right, here, out);
}

vector<string> binaryTreePaths(TreeNode* root) {
    vector<string> out;
    paths(root, "", out);
    return out;
}
`),
  245: file(`int depthOf(TreeNode* n, int& best) {
    if (n == nullptr) return 0;
    int a = depthOf(n->left, best);
    int b = depthOf(n->right, best);
    best = max(best, a + b);
    return 1 + max(a, b);
}

int diameter(TreeNode* root) {
    int best = 0;
    depthOf(root, best);
    return best;
}
`),
  246: file(`${HEIGHT}
bool isBalanced(TreeNode* root) {
    if (root == nullptr) return true;
    if (abs(height(root->left) - height(root->right)) > 1) return false;
    return isBalanced(root->left) && isBalanced(root->right);
}
`),
  247: file(`TreeNode* make(vector<int>& nums, int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = (lo + hi) / 2;
    TreeNode* n = new TreeNode(nums[mid]);
    n->left = make(nums, lo, mid - 1);
    n->right = make(nums, mid + 1, hi);
    return n;
}

TreeNode* sortedToBst(vector<int>& nums) {
    return make(nums, 0, nums.size() - 1);
}
`),
  248: file(`vector<int> inorderIterative(TreeNode* root) {
    vector<int> out;
    vector<TreeNode*> st;
    TreeNode* cur = root;
    while (cur != nullptr || !st.empty()) {
        while (cur != nullptr) {
            st.push_back(cur);
            cur = cur->left;
        }
        cur = st.back();
        st.pop_back();
        out.push_back(cur->val);
        cur = cur->right;
    }
    return out;
}

vector<int> preorderIterative(TreeNode* root) {
    vector<int> out;
    if (root == nullptr) return out;
    vector<TreeNode*> st;
    st.push_back(root);
    while (!st.empty()) {
        TreeNode* n = st.back();
        st.pop_back();
        out.push_back(n->val);
        if (n->right != nullptr) st.push_back(n->right);
        if (n->left != nullptr) st.push_back(n->left);
    }
    return out;
}

vector<int> postorderIterative(TreeNode* root) {
    vector<int> out;
    if (root == nullptr) return out;
    vector<TreeNode*> st;
    st.push_back(root);
    while (!st.empty()) {
        TreeNode* n = st.back();
        st.pop_back();
        out.push_back(n->val);
        if (n->left != nullptr) st.push_back(n->left);
        if (n->right != nullptr) st.push_back(n->right);
    }
    reverse(out.begin(), out.end());
    return out;
}
`),
  249: file(`${LEVELS}
vector<vector<int>> levelOrder(TreeNode* root) {
    return levels(root);
}
`),
  250: file(`${LEVELS}
vector<vector<int>> zigzagOrder(TreeNode* root) {
    vector<vector<int>> out = levels(root);
    for (int i = 1; i < out.size(); i += 2) reverse(out[i].begin(), out[i].end());
    return out;
}
`),
  251: file(`${LEVELS}
vector<int> rightSideView(TreeNode* root) {
    vector<vector<int>> rows = levels(root);
    vector<int> out;
    for (int i = 0; i < rows.size(); i++) out.push_back(rows[i].back());
    return out;
}
`),
  252: file(`TreeNode* lowestCommonAncestor(TreeNode* root, int p, int q) {
    if (root == nullptr || root->val == p || root->val == q) return root;
    TreeNode* a = lowestCommonAncestor(root->left, p, q);
    TreeNode* b = lowestCommonAncestor(root->right, p, q);
    if (a != nullptr && b != nullptr) return root;
    return a != nullptr ? a : b;
}
`),
  253: file(`TreeNode* lcaBst(TreeNode* root, int p, int q) {
    TreeNode* n = root;
    while (n != nullptr) {
        if (p < n->val && q < n->val) n = n->left;
        else if (p > n->val && q > n->val) n = n->right;
        else return n;
    }
    return nullptr;
}
`),
  254: file(`bool fits(TreeNode* n, long long low, long long high) {
    if (n == nullptr) return true;
    if (n->val <= low || n->val >= high) return false;
    return fits(n->left, low, n->val) && fits(n->right, n->val, high);
}

bool isValidBst(TreeNode* root) {
    return fits(root, LLONG_MIN, LLONG_MAX);
}
`),
  255: file(`TreeNode* insertBst(TreeNode* root, int val) {
    if (root == nullptr) return new TreeNode(val);
    if (val < root->val) root->left = insertBst(root->left, val);
    else root->right = insertBst(root->right, val);
    return root;
}

TreeNode* deleteBst(TreeNode* root, int key) {
    if (root == nullptr) return root;
    if (key < root->val) {
        root->left = deleteBst(root->left, key);
        return root;
    }
    if (key > root->val) {
        root->right = deleteBst(root->right, key);
        return root;
    }
    if (root->left == nullptr) return root->right;
    if (root->right == nullptr) return root->left;
    TreeNode* next = root->right;
    while (next->left != nullptr) next = next->left;
    root->val = next->val;
    root->right = deleteBst(root->right, next->val);
    return root;
}
`),
  256: file(`void walk(TreeNode* n, vector<int>& out) {
    if (n == nullptr) return;
    walk(n->left, out);
    out.push_back(n->val);
    walk(n->right, out);
}

int kthSmallest(TreeNode* root, int k) {
    vector<int> out;
    walk(root, out);
    return out[k - 1];
}
`),
  257: file(`TreeNode* make(vector<int>& pre, int& at, vector<int>& in, int lo, int hi) {
    if (lo > hi) return nullptr;
    int v = pre[at];
    at++;
    int mid = lo;
    while (in[mid] != v) mid++;
    TreeNode* n = new TreeNode(v);
    n->left = make(pre, at, in, lo, mid - 1);
    n->right = make(pre, at, in, mid + 1, hi);
    return n;
}

TreeNode* treeFromOrders(vector<int>& preorder, vector<int>& inorder) {
    int at = 0;
    return make(preorder, at, inorder, 0, inorder.size() - 1);
}
`),
  258: file(`void flatten(TreeNode* root) {
    TreeNode* n = root;
    while (n != nullptr) {
        if (n->left != nullptr) {
            TreeNode* last = n->left;
            while (last->right != nullptr) last = last->right;
            last->right = n->right;
            n->right = n->left;
            n->left = nullptr;
        }
        n = n->right;
    }
}
`),
  259: file(`string serialize(TreeNode* root) {
    if (root == nullptr) return "#";
    return to_string(root->val) + "," + serialize(root->left) + "," + serialize(root->right);
}

TreeNode* readTree(vector<string>& parts, int& at) {
    string p = parts[at];
    at++;
    if (p == "#") return nullptr;
    TreeNode* n = new TreeNode(stoi(p));
    n->left = readTree(parts, at);
    n->right = readTree(parts, at);
    return n;
}

TreeNode* deserialize(string text) {
    vector<string> parts;
    string word = "";
    for (char c : text) {
        if (c == ',') {
            parts.push_back(word);
            word = "";
        } else {
            word += c;
        }
    }
    parts.push_back(word);
    int at = 0;
    return readTree(parts, at);
}
`),
  260: file(`int gain(TreeNode* n, int& best) {
    if (n == nullptr) return 0;
    int a = max(0, gain(n->left, best));
    int b = max(0, gain(n->right, best));
    best = max(best, n->val + a + b);
    return n->val + max(a, b);
}

int maxPathSum(TreeNode* root) {
    int best = INT_MIN;
    gain(root, best);
    return best;
}
`),
};
