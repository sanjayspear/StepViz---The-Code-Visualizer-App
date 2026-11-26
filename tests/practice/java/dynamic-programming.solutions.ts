// Java reference solutions for Practice: Dynamic programming. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const ROW = `    static int robRange(int[] nums, int from, int to) {
        int before = 0;
        int prev = 0;
        for (int i = from; i < to; i++) {
            int next = Math.max(prev, before + nums[i]);
            before = prev;
            prev = next;
        }
        return prev;
    }
`;
const SUBSET = `    static boolean reachable(int[] nums, int target) {
        boolean[] can = new boolean[target + 1];
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
  281: main(`    static int climbStairs(int n) {
        int a = 1;
        int b = 1;
        for (int i = 1; i < n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return b;
    }
`),
  282: main(`    static Map<Integer, Long> memo = new HashMap<>();

    static long fibMemo(int n) {
        if (n < 2) return n;
        if (!memo.containsKey(n)) memo.put(n, fibMemo(n - 1) + fibMemo(n - 2));
        return memo.get(n);
    }

    static long fibTable(int n) {
        if (n < 2) return n;
        long[] t = new long[n + 1];
        t[1] = 1;
        for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
        return t[n];
    }
`),
  283: main(`    static int minCostClimbing(int[] cost) {
        int n = cost.length;
        int[] best = new int[n + 1];
        for (int i = 2; i <= n; i++) best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]);
        return best[n];
    }
`),
  284: main(`${ROW}
    static int rob(int[] nums) {
        return robRange(nums, 0, nums.length);
    }
`),
  285: main(`${ROW}
    static int robCircle(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robRange(nums, 1, nums.length), robRange(nums, 0, nums.length - 1));
    }
`),
  286: main(`    static int coinChange(int[] coins, int amount) {
        int[] best = new int[amount + 1];
        for (int x = 1; x <= amount; x++) {
            best[x] = Integer.MAX_VALUE;
            for (int c : coins) {
                if (c <= x && best[x - c] != Integer.MAX_VALUE) best[x] = Math.min(best[x], best[x - c] + 1);
            }
        }
        return best[amount] == Integer.MAX_VALUE ? -1 : best[amount];
    }
`),
  287: main(`    static int coinWays(int amount, int[] coins) {
        int[] ways = new int[amount + 1];
        ways[0] = 1;
        for (int c : coins) {
            for (int x = c; x <= amount; x++) ways[x] += ways[x - c];
        }
        return ways[amount];
    }
`),
  288: main(`    static int lisLength(int[] nums) {
        int[] best = new int[nums.length];
        int answer = 0;
        for (int i = 0; i < nums.length; i++) {
            best[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) best[i] = Math.max(best[i], best[j] + 1);
            }
            answer = Math.max(answer, best[i]);
        }
        return answer;
    }
`),
  289: main(`    static int lcs(String a, String b) {
        int[][] t = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) t[i][j] = t[i - 1][j - 1] + 1;
                else t[i][j] = Math.max(t[i - 1][j], t[i][j - 1]);
            }
        }
        return t[a.length()][b.length()];
    }
`),
  290: main(`    static int editDistance(String a, String b) {
        int[][] t = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) t[i][0] = i;
        for (int j = 0; j <= b.length(); j++) t[0][j] = j;
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) t[i][j] = t[i - 1][j - 1];
                else t[i][j] = 1 + Math.min(t[i - 1][j], Math.min(t[i][j - 1], t[i - 1][j - 1]));
            }
        }
        return t[a.length()][b.length()];
    }
`),
  291: main(`    static int knapsack(int[] weights, int[] values, int capacity) {
        int[] best = new int[capacity + 1];
        for (int i = 0; i < weights.length; i++) {
            for (int c = capacity; c >= weights[i]; c--) best[c] = Math.max(best[c], best[c - weights[i]] + values[i]);
        }
        return best[capacity];
    }
`),
  292: main(`${SUBSET}
    static boolean subsetSum(int[] nums, int target) {
        return reachable(nums, target);
    }
`),
  293: main(`${SUBSET}
    static boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        return total % 2 == 0 && reachable(nums, total / 2);
    }
`),
  294: main(`    static int gridPaths(int m, int n) {
        int[][] t = new int[m][n];
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) t[r][c] = r == 0 || c == 0 ? 1 : t[r - 1][c] + t[r][c - 1];
        }
        return t[m - 1][n - 1];
    }
`),
  295: main(`    static int pathsWithObstacles(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        int[][] t = new int[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 1) t[r][c] = 0;
                else if (r == 0 && c == 0) t[r][c] = 1;
                else t[r][c] = (r > 0 ? t[r - 1][c] : 0) + (c > 0 ? t[r][c - 1] : 0);
            }
        }
        return t[rows - 1][cols - 1];
    }
`),
  296: main(`    static int minPathSum(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        int[][] t = new int[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r == 0 && c == 0) t[r][c] = grid[0][0];
                else if (r == 0) t[r][c] = t[r][c - 1] + grid[r][c];
                else if (c == 0) t[r][c] = t[r - 1][c] + grid[r][c];
                else t[r][c] = Math.min(t[r - 1][c], t[r][c - 1]) + grid[r][c];
            }
        }
        return t[rows - 1][cols - 1];
    }
`),
  297: main(`    static int numDecodings(String s) {
        int[] ways = new int[s.length() + 1];
        ways[0] = 1;
        for (int i = 1; i <= s.length(); i++) {
            if (s.charAt(i - 1) != '0') ways[i] += ways[i - 1];
            if (i >= 2) {
                int two = Integer.parseInt(s.substring(i - 2, i));
                if (two >= 10 && two <= 26) ways[i] += ways[i - 2];
            }
        }
        return ways[s.length()];
    }
`),
  298: main(`    static boolean wordBreak(String s, String[] words) {
        Set<String> dict = new HashSet<>();
        for (String w : words) dict.add(w);
        boolean[] ok = new boolean[s.length() + 1];
        ok[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (ok[j] && dict.contains(s.substring(j, i))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[s.length()];
    }
`),
  299: main(`    static int maxProduct(int[] nums) {
        int big = nums[0];
        int small = nums[0];
        int best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i];
            int a = Math.max(x, Math.max(x * big, x * small));
            int b = Math.min(x, Math.min(x * big, x * small));
            big = a;
            small = b;
            best = Math.max(best, big);
        }
        return best;
    }
`),
  300: main(`    static int longestPalSubseq(String s) {
        int n = s.length();
        if (n == 0) return 0;
        int[][] t = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            t[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) t[i][j] = t[i + 1][j - 1] + 2;
                else t[i][j] = Math.max(t[i + 1][j], t[i][j - 1]);
            }
        }
        return t[0][n - 1];
    }
`),
  301: main(`    static boolean canJump(int[] nums) {
        int furthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > furthest) return false;
            furthest = Math.max(furthest, i + nums[i]);
        }
        return true;
    }
`),
  302: main(`    static int minJumps(int[] nums) {
        int jumps = 0;
        int end = 0;
        int furthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            furthest = Math.max(furthest, i + nums[i]);
            if (i == end) {
                jumps++;
                end = furthest;
            }
        }
        return jumps;
    }
`),
  303: main(`    static int maxProfitCooldown(int[] prices) {
        int holding = Integer.MIN_VALUE / 2;
        int sold = 0;
        int resting = 0;
        for (int p : prices) {
            int h = Math.max(holding, resting - p);
            int s = holding + p;
            int r = Math.max(resting, sold);
            holding = h;
            sold = s;
            resting = r;
        }
        return Math.max(sold, resting);
    }
`),
  304: main(`    static int[][] memo;

    static boolean m(String s, String p, int i, int j) {
        if (memo[i][j] != 0) return memo[i][j] == 1;
        boolean ans;
        if (j == p.length()) {
            ans = i == s.length();
        } else {
            boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
            if (j + 1 < p.length() && p.charAt(j + 1) == '*') ans = m(s, p, i, j + 2) || (first && m(s, p, i + 1, j));
            else ans = first && m(s, p, i + 1, j + 1);
        }
        memo[i][j] = ans ? 1 : 2;
        return ans;
    }

    static boolean isMatch(String s, String p) {
        memo = new int[s.length() + 1][p.length() + 1];
        return m(s, p, 0, 0);
    }
`),
  305: main(`    static int maxCoins(int[] nums) {
        int n = nums.length + 2;
        int[] a = new int[n];
        a[0] = 1;
        a[n - 1] = 1;
        for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];
        int[][] best = new int[n][n];
        for (int width = 2; width < n; width++) {
            for (int l = 0; l + width < n; l++) {
                int r = l + width;
                for (int k = l + 1; k < r; k++) best[l][r] = Math.max(best[l][r], best[l][k] + a[l] * a[k] * a[r] + best[k][r]);
            }
        }
        return best[0][n - 1];
    }
`),
};
