// C++ reference solutions for Practice: Dynamic programming. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <climits>
using namespace std;

${functions}
int main() {
    return 0;
}
`;
const ROB_RANGE = `int robRange(vector<int>& nums, int from, int to) {
    int take = 0;
    int skip = 0;
    for (int i = from; i < to; i++) {
        int t = skip + nums[i];
        skip = max(skip, take);
        take = t;
    }
    return max(take, skip);
}
`;
const SUBSET = `bool subsetSum(vector<int>& nums, int target) {
    vector<bool> can(target + 1, false);
    can[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--) {
            if (can[s - x]) can[s] = true;
        }
    }
    return can[target];
}
`;

export const SOLUTIONS: Record<number, string> = {
  281: file(`int climbStairs(int n) {
    int a = 1;
    int b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}
`),
  282: file(`map<int, long long> memo;

long long fibMemo(int n) {
    if (n < 2) return n;
    if (memo.count(n)) return memo[n];
    long long v = fibMemo(n - 1) + fibMemo(n - 2);
    memo[n] = v;
    return v;
}

long long fibTable(int n) {
    if (n < 2) return n;
    vector<long long> t(n + 1, 0);
    t[1] = 1;
    for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
    return t[n];
}
`),
  283: file(`int minCostClimbing(vector<int>& cost) {
    int n = cost.size();
    vector<int> best(n + 1, 0);
    for (int i = 2; i <= n; i++) best[i] = min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]);
    return best[n];
}
`),
  284: file(`${ROB_RANGE}
int rob(vector<int>& nums) {
    return robRange(nums, 0, nums.size());
}
`),
  285: file(`${ROB_RANGE}
int robCircle(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    return max(robRange(nums, 0, n - 1), robRange(nums, 1, n));
}
`),
  286: file(`int coinChange(vector<int>& coins, int amount) {
    vector<int> best(amount + 1, INT_MAX);
    best[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && best[a - c] != INT_MAX) best[a] = min(best[a], best[a - c] + 1);
        }
    }
    return best[amount] == INT_MAX ? -1 : best[amount];
}
`),
  287: file(`int coinWays(int amount, vector<int>& coins) {
    vector<int> ways(amount + 1, 0);
    ways[0] = 1;
    for (int c : coins) {
        for (int a = c; a <= amount; a++) ways[a] += ways[a - c];
    }
    return ways[amount];
}
`),
  288: file(`int lisLength(vector<int>& nums) {
    int n = nums.size();
    vector<int> len(n, 1);
    int best = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) len[i] = max(len[i], len[j] + 1);
        }
        best = max(best, len[i]);
    }
    return best;
}
`),
  289: file(`int lcs(string a, string b) {
    int m = a.size();
    int n = b.size();
    vector<vector<int>> t(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) t[i][j] = t[i - 1][j - 1] + 1;
            else t[i][j] = max(t[i - 1][j], t[i][j - 1]);
        }
    }
    return t[m][n];
}
`),
  290: file(`int editDistance(string a, string b) {
    int m = a.size();
    int n = b.size();
    vector<vector<int>> t(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) t[i][0] = i;
    for (int j = 0; j <= n; j++) t[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) t[i][j] = t[i - 1][j - 1];
            else t[i][j] = 1 + min(t[i - 1][j - 1], min(t[i - 1][j], t[i][j - 1]));
        }
    }
    return t[m][n];
}
`),
  291: file(`int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
    vector<int> best(capacity + 1, 0);
    for (int i = 0; i < weights.size(); i++) {
        for (int c = capacity; c >= weights[i]; c--) best[c] = max(best[c], best[c - weights[i]] + values[i]);
    }
    return best[capacity];
}
`),
  292: file(SUBSET),
  293: file(`${SUBSET}
bool canPartition(vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 == 1) return false;
    return subsetSum(nums, total / 2);
}
`),
  294: file(`int gridPaths(int m, int n) {
    vector<vector<int>> t(m, vector<int>(n, 1));
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) t[r][c] = t[r - 1][c] + t[r][c - 1];
    }
    return t[m - 1][n - 1];
}
`),
  295: file(`int pathsWithObstacles(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    vector<vector<int>> t(m, vector<int>(n, 0));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 1) continue;
            if (r == 0 && c == 0) t[r][c] = 1;
            else {
                if (r > 0) t[r][c] += t[r - 1][c];
                if (c > 0) t[r][c] += t[r][c - 1];
            }
        }
    }
    return t[m - 1][n - 1];
}
`),
  296: file(`int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    vector<vector<int>> t(m, vector<int>(n, 0));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (r == 0 && c == 0) t[r][c] = grid[r][c];
            else if (r == 0) t[r][c] = t[r][c - 1] + grid[r][c];
            else if (c == 0) t[r][c] = t[r - 1][c] + grid[r][c];
            else t[r][c] = min(t[r - 1][c], t[r][c - 1]) + grid[r][c];
        }
    }
    return t[m - 1][n - 1];
}
`),
  297: file(`int numDecodings(string s) {
    int n = s.size();
    vector<int> ways(n + 1, 0);
    ways[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s[i - 1] != '0') ways[i] += ways[i - 1];
        if (i >= 2) {
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (s[i - 2] != '0' && two <= 26) ways[i] += ways[i - 2];
        }
    }
    return ways[n];
}
`),
  298: file(`bool wordBreak(string s, vector<string> words) {
    set<string> dict;
    for (string w : words) dict.insert(w);
    int n = s.size();
    vector<bool> ok(n + 1, false);
    ok[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (ok[j] && dict.count(s.substr(j, i - j))) {
                ok[i] = true;
                break;
            }
        }
    }
    return ok[n];
}
`),
  299: file(`int maxProduct(vector<int>& nums) {
    int big = nums[0];
    int small = nums[0];
    int best = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        int x = nums[i];
        int a = max(x, max(x * big, x * small));
        int b = min(x, min(x * big, x * small));
        big = a;
        small = b;
        best = max(best, big);
    }
    return best;
}
`),
  300: file(`int longestPalSubseq(string s) {
    int n = s.size();
    if (n == 0) return 0;
    vector<vector<int>> t(n, vector<int>(n, 0));
    for (int i = n - 1; i >= 0; i--) {
        t[i][i] = 1;
        for (int j = i + 1; j < n; j++) {
            if (s[i] == s[j]) t[i][j] = t[i + 1][j - 1] + 2;
            else t[i][j] = max(t[i + 1][j], t[i][j - 1]);
        }
    }
    return t[0][n - 1];
}
`),
  301: file(`bool canJump(vector<int>& nums) {
    int reach = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > reach) return false;
        reach = max(reach, i + nums[i]);
    }
    return true;
}
`),
  302: file(`int minJumps(vector<int>& nums) {
    int jumps = 0;
    int end = 0;
    int far = 0;
    for (int i = 0; i + 1 < nums.size(); i++) {
        far = max(far, i + nums[i]);
        if (i == end) {
            jumps++;
            end = far;
        }
    }
    return jumps;
}
`),
  303: file(`int maxProfitCooldown(vector<int>& prices) {
    int hold = INT_MIN;
    int sold = 0;
    int rest = 0;
    for (int p : prices) {
        int prevSold = sold;
        sold = hold == INT_MIN ? 0 : hold + p;
        hold = max(hold, rest - p);
        rest = max(rest, prevSold);
    }
    return max(sold, rest);
}
`),
  304: file(`bool m(string& s, string& p, int i, int j, vector<vector<int>>& memo) {
    if (memo[i][j] != 0) return memo[i][j] == 1;
    bool ans;
    if (j == p.size()) {
        ans = i == s.size();
    } else {
        bool first = i < s.size() && (p[j] == '.' || p[j] == s[i]);
        if (j + 1 < p.size() && p[j + 1] == '*') ans = m(s, p, i, j + 2, memo) || (first && m(s, p, i + 1, j, memo));
        else ans = first && m(s, p, i + 1, j + 1, memo);
    }
    memo[i][j] = ans ? 1 : 2;
    return ans;
}

bool isMatch(string s, string p) {
    vector<vector<int>> memo(s.size() + 1, vector<int>(p.size() + 1, 0));
    return m(s, p, 0, 0, memo);
}
`),
  305: file(`int maxCoins(vector<int>& nums) {
    vector<int> b;
    b.push_back(1);
    for (int x : nums) b.push_back(x);
    b.push_back(1);
    int n = b.size();
    vector<vector<int>> t(n, vector<int>(n, 0));
    for (int len = 2; len < n; len++) {
        for (int left = 0; left + len < n; left++) {
            int right = left + len;
            for (int k = left + 1; k < right; k++) t[left][right] = max(t[left][right], t[left][k] + b[left] * b[k] * b[right] + t[k][right]);
        }
    }
    return t[0][n - 1];
}
`),
};
