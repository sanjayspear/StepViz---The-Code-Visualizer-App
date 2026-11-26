// C reference solutions for Practice: dynamic-programming (the questions that fit C). Never shipped to students.
const file = (functions: string) => `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <ctype.h>

${functions}
int main() {
    return 0;
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
  282: file(`long long memo[100];

long long fibMemo(int n) {
    if (n < 2) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    return memo[n];
}

long long fibTable(int n) {
    if (n < 2) return n;
    long long t[n + 1];
    t[0] = 0;
    t[1] = 1;
    for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
    return t[n];
}
`),
  283: file(`int minCostClimbing(int cost[], int n) {
    int best[n + 1];
    best[0] = 0;
    best[1] = 0;
    for (int i = 2; i <= n; i++) {
        int a = best[i - 1] + cost[i - 1];
        int b = best[i - 2] + cost[i - 2];
        best[i] = a < b ? a : b;
    }
    return best[n];
}
`),
  284: file(`int robRange(int nums[], int from, int to) {
    int take = 0;
    int skip = 0;
    for (int i = from; i < to; i++) {
        int t = skip + nums[i];
        skip = skip > take ? skip : take;
        take = t;
    }
    return take > skip ? take : skip;
}

int rob(int nums[], int n) {
    return robRange(nums, 0, n);
}
`),
  285: file(`int robRange(int nums[], int from, int to) {
    int take = 0;
    int skip = 0;
    for (int i = from; i < to; i++) {
        int t = skip + nums[i];
        skip = skip > take ? skip : take;
        take = t;
    }
    return take > skip ? take : skip;
}

int robCircle(int nums[], int n) {
    if (n == 1) return nums[0];
    int a = robRange(nums, 0, n - 1);
    int b = robRange(nums, 1, n);
    return a > b ? a : b;
}
`),
  286: file(`int coinChange(int coins[], int n, int amount) {
    int best[amount + 1];
    best[0] = 0;
    for (int a = 1; a <= amount; a++) {
        best[a] = INT_MAX;
        for (int i = 0; i < n; i++) {
            int c = coins[i];
            if (c <= a && best[a - c] != INT_MAX && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
        }
    }
    return best[amount] == INT_MAX ? -1 : best[amount];
}
`),
  287: file(`int coinWays(int amount, int coins[], int n) {
    int ways[amount + 1];
    for (int a = 0; a <= amount; a++) ways[a] = 0;
    ways[0] = 1;
    for (int i = 0; i < n; i++) {
        for (int a = coins[i]; a <= amount; a++) ways[a] += ways[a - coins[i]];
    }
    return ways[amount];
}
`),
  288: file(`int lisLength(int nums[], int n) {
    int len[n + 1];
    int best = 0;
    for (int i = 0; i < n; i++) {
        len[i] = 1;
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i] && len[j] + 1 > len[i]) len[i] = len[j] + 1;
        }
        if (len[i] > best) best = len[i];
    }
    return best;
}
`),
  289: file(`int lcs(char a[], char b[]) {
    int m = strlen(a);
    int n = strlen(b);
    int t[m + 1][n + 1];
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) t[i][j] = 0;
            else if (a[i - 1] == b[j - 1]) t[i][j] = t[i - 1][j - 1] + 1;
            else t[i][j] = t[i - 1][j] > t[i][j - 1] ? t[i - 1][j] : t[i][j - 1];
        }
    }
    return t[m][n];
}
`),
  290: file(`int editDistance(char a[], char b[]) {
    int m = strlen(a);
    int n = strlen(b);
    int t[m + 1][n + 1];
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0) t[i][j] = j;
            else if (j == 0) t[i][j] = i;
            else if (a[i - 1] == b[j - 1]) t[i][j] = t[i - 1][j - 1];
            else {
                int best = t[i - 1][j - 1];
                if (t[i - 1][j] < best) best = t[i - 1][j];
                if (t[i][j - 1] < best) best = t[i][j - 1];
                t[i][j] = best + 1;
            }
        }
    }
    return t[m][n];
}
`),
  291: file(`int knapsack(int weights[], int weightsSize, int values[], int valuesSize, int capacity) {
    int best[capacity + 1];
    for (int c = 0; c <= capacity; c++) best[c] = 0;
    for (int i = 0; i < weightsSize; i++) {
        for (int c = capacity; c >= weights[i]; c--) {
            if (best[c - weights[i]] + values[i] > best[c]) best[c] = best[c - weights[i]] + values[i];
        }
    }
    return best[capacity];
}
`),
  292: file(`bool subsetSum(int nums[], int n, int target) {
    bool can[target + 1];
    for (int s = 0; s <= target; s++) can[s] = false;
    can[0] = true;
    for (int i = 0; i < n; i++) {
        for (int s = target; s >= nums[i]; s--) {
            if (can[s - nums[i]]) can[s] = true;
        }
    }
    return can[target];
}
`),
  293: file(`bool subsetSum(int nums[], int n, int target) {
    bool can[target + 1];
    for (int s = 0; s <= target; s++) can[s] = false;
    can[0] = true;
    for (int i = 0; i < n; i++) {
        for (int s = target; s >= nums[i]; s--) {
            if (can[s - nums[i]]) can[s] = true;
        }
    }
    return can[target];
}

bool canPartition(int nums[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) total += nums[i];
    if (total % 2 == 1) return false;
    return subsetSum(nums, n, total / 2);
}
`),
  294: file(`int gridPaths(int m, int n) {
    int t[m][n];
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) t[r][c] = (r == 0 || c == 0) ? 1 : t[r - 1][c] + t[r][c - 1];
    }
    return t[m - 1][n - 1];
}
`),
  297: file(`int numDecodings(char s[]) {
    int n = strlen(s);
    int ways[n + 1];
    for (int i = 0; i <= n; i++) ways[i] = 0;
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
  299: file(`int maxProduct(int nums[], int n) {
    int big = nums[0];
    int small = nums[0];
    int best = nums[0];
    for (int i = 1; i < n; i++) {
        int x = nums[i];
        int a = x * big;
        int b = x * small;
        int hi = x;
        if (a > hi) hi = a;
        if (b > hi) hi = b;
        int lo = x;
        if (a < lo) lo = a;
        if (b < lo) lo = b;
        big = hi;
        small = lo;
        if (big > best) best = big;
    }
    return best;
}
`),
  300: file(`int longestPalSubseq(char s[]) {
    int n = strlen(s);
    if (n == 0) return 0;
    int t[n][n];
    for (int i = n - 1; i >= 0; i--) {
        for (int j = 0; j < n; j++) t[i][j] = 0;
        t[i][i] = 1;
        for (int j = i + 1; j < n; j++) {
            if (s[i] == s[j]) t[i][j] = (i + 1 <= j - 1 ? t[i + 1][j - 1] : 0) + 2;
            else t[i][j] = t[i + 1][j] > t[i][j - 1] ? t[i + 1][j] : t[i][j - 1];
        }
    }
    return t[0][n - 1];
}
`),
  301: file(`bool canJump(int nums[], int n) {
    int reach = 0;
    for (int i = 0; i < n; i++) {
        if (i > reach) return false;
        if (i + nums[i] > reach) reach = i + nums[i];
    }
    return true;
}
`),
  302: file(`int minJumps(int nums[], int n) {
    int jumps = 0;
    int end = 0;
    int far = 0;
    for (int i = 0; i + 1 < n; i++) {
        if (i + nums[i] > far) far = i + nums[i];
        if (i == end) {
            jumps++;
            end = far;
        }
    }
    return jumps;
}
`),
  303: file(`int maxProfitCooldown(int prices[], int n) {
    int hold = INT_MIN;
    int sold = 0;
    int rest = 0;
    for (int i = 0; i < n; i++) {
        int prevSold = sold;
        sold = hold == INT_MIN ? 0 : hold + prices[i];
        if (rest - prices[i] > hold) hold = rest - prices[i];
        if (prevSold > rest) rest = prevSold;
    }
    return sold > rest ? sold : rest;
}
`),
  304: file(`bool matchFrom(char s[], char p[], int i, int j, int n, int m, int memo[]) {
    int key = i * (m + 1) + j;
    if (memo[key] != 0) return memo[key] == 1;
    bool ans;
    if (j == m) {
        ans = i == n;
    } else {
        bool first = i < n && (p[j] == '.' || p[j] == s[i]);
        if (j + 1 < m && p[j + 1] == '*') ans = matchFrom(s, p, i, j + 2, n, m, memo) || (first && matchFrom(s, p, i + 1, j, n, m, memo));
        else ans = first && matchFrom(s, p, i + 1, j + 1, n, m, memo);
    }
    memo[key] = ans ? 1 : 2;
    return ans;
}

bool isMatch(char s[], char p[]) {
    int n = strlen(s);
    int m = strlen(p);
    int memo[(n + 1) * (m + 1)];
    for (int k = 0; k < (n + 1) * (m + 1); k++) memo[k] = 0;
    return matchFrom(s, p, 0, 0, n, m, memo);
}
`),
  305: file(`int maxCoins(int nums[], int n) {
    int size = n + 2;
    int b[size];
    b[0] = 1;
    for (int i = 0; i < n; i++) b[i + 1] = nums[i];
    b[size - 1] = 1;
    int t[size][size];
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) t[i][j] = 0;
    }
    for (int len = 2; len < size; len++) {
        for (int left = 0; left + len < size; left++) {
            int right = left + len;
            for (int k = left + 1; k < right; k++) {
                int v = t[left][k] + b[left] * b[k] * b[right] + t[k][right];
                if (v > t[left][right]) t[left][right] = v;
            }
        }
    }
    return t[0][size - 1];
}
`),
};
