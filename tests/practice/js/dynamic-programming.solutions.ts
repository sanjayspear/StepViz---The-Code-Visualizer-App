// JavaScript reference solutions for Practice: Dynamic programming. Never shipped to students.
const ROW = `function robRow(houses) {
  let before = 0;
  let prev = 0;
  for (const x of houses) [before, prev] = [prev, Math.max(prev, before + x)];
  return prev;
}
`;
const SUMS = `function reachable(nums) {
  let sums = new Set([0]);
  for (const x of nums) sums = new Set([...sums, ...[...sums].map((s) => s + x)]);
  return sums;
}
`;

export const SOLUTIONS: Record<number, string> = {
  281: `function climbStairs(n) {
  let a = 1;
  let b = 1;
  for (let i = 1; i < n; i++) [a, b] = [b, a + b];
  return b;
}
`,
  282: `function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (!memo.has(n)) memo.set(n, fibMemo(n - 1, memo) + fibMemo(n - 2, memo));
  return memo.get(n);
}

function fibTable(n) {
  const t = [0, 1];
  for (let i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
  return t[n];
}
`,
  283: `function minCostClimbing(cost) {
  const n = cost.length;
  const best = new Array(n + 1).fill(0);
  for (let i = 2; i <= n; i++) best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]);
  return best[n];
}
`,
  284: `${ROW}
function rob(nums) {
  return robRow(nums);
}
`,
  285: `${ROW}
function robCircle(nums) {
  if (nums.length === 1) return nums[0];
  return Math.max(robRow(nums.slice(1)), robRow(nums.slice(0, -1)));
}
`,
  286: `function coinChange(coins, amount) {
  const best = [0, ...new Array(amount).fill(Infinity)];
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) if (c <= x) best[x] = Math.min(best[x], best[x - c] + 1);
  }
  return best[amount] === Infinity ? -1 : best[amount];
}
`,
  287: `function coinWays(amount, coins) {
  const ways = [1, ...new Array(amount).fill(0)];
  for (const c of coins) for (let x = c; x <= amount; x++) ways[x] += ways[x - c];
  return ways[amount];
}
`,
  288: `function lisLength(nums) {
  const best = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) best[i] = Math.max(best[i], best[j] + 1);
  }
  return Math.max(0, ...best);
}
`,
  289: `function lcs(a, b) {
  const t = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
    }
  }
  return t[a.length][b.length];
}
`,
  290: `function editDistance(a, b) {
  const t = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] : 1 + Math.min(t[i - 1][j], t[i][j - 1], t[i - 1][j - 1]);
    }
  }
  return t[a.length][b.length];
}
`,
  291: `function knapsack(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  weights.forEach((w, i) => {
    for (let c = capacity; c >= w; c--) best[c] = Math.max(best[c], best[c - w] + values[i]);
  });
  return best[capacity];
}
`,
  292: `${SUMS}
function subsetSum(nums, target) {
  return reachable(nums).has(target);
}
`,
  293: `${SUMS}
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  return total % 2 === 0 && reachable(nums).has(total / 2);
}
`,
  294: `function gridPaths(m, n) {
  const t = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) t[r][c] = t[r - 1][c] + t[r][c - 1];
  return t[m - 1][n - 1];
}
`,
  295: `function pathsWithObstacles(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const t = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) t[r][c] = 0;
      else if (r === 0 && c === 0) t[r][c] = 1;
      else t[r][c] = (r > 0 ? t[r - 1][c] : 0) + (c > 0 ? t[r][c - 1] : 0);
    }
  }
  return t[rows - 1][cols - 1];
}
`,
  296: `function minPathSum(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const t = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) t[r][c] = grid[0][0];
      else if (r === 0) t[r][c] = t[r][c - 1] + grid[r][c];
      else if (c === 0) t[r][c] = t[r - 1][c] + grid[r][c];
      else t[r][c] = Math.min(t[r - 1][c], t[r][c - 1]) + grid[r][c];
    }
  }
  return t[rows - 1][cols - 1];
}
`,
  297: `function numDecodings(s) {
  const ways = [1, ...new Array(s.length).fill(0)];
  for (let i = 1; i <= s.length; i++) {
    if (s[i - 1] !== "0") ways[i] += ways[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) ways[i] += ways[i - 2];
    }
  }
  return ways[s.length];
}
`,
  298: `function wordBreak(s, words) {
  const dict = new Set(words);
  const ok = [true, ...new Array(s.length).fill(false)];
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (ok[j] && dict.has(s.slice(j, i))) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[s.length];
}
`,
  299: `function maxProduct(nums) {
  let big = nums[0];
  let small = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    [big, small] = [Math.max(x, x * big, x * small), Math.min(x, x * big, x * small)];
    best = Math.max(best, big);
  }
  return best;
}
`,
  300: `function longestPalSubseq(s) {
  const n = s.length;
  if (n === 0) return 0;
  const t = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    t[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      t[i][j] = s[i] === s[j] ? t[i + 1][j - 1] + 2 : Math.max(t[i + 1][j], t[i][j - 1]);
    }
  }
  return t[0][n - 1];
}
`,
  301: `function canJump(nums) {
  let furthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > furthest) return false;
    furthest = Math.max(furthest, i + nums[i]);
  }
  return true;
}
`,
  302: `function minJumps(nums) {
  let jumps = 0;
  let end = 0;
  let furthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    furthest = Math.max(furthest, i + nums[i]);
    if (i === end) {
      jumps++;
      end = furthest;
    }
  }
  return jumps;
}
`,
  303: `function maxProfitCooldown(prices) {
  let holding = -Infinity;
  let sold = 0;
  let resting = 0;
  for (const p of prices) [holding, sold, resting] = [Math.max(holding, resting - p), holding + p, Math.max(resting, sold)];
  return Math.max(sold, resting);
}
`,
  304: `function isMatch(s, p) {
  const memo = new Map();
  const m = (i, j) => {
    const key = i + "," + j;
    if (memo.has(key)) return memo.get(key);
    let ans;
    if (j === p.length) ans = i === s.length;
    else {
      const first = i < s.length && (p[j] === s[i] || p[j] === ".");
      if (j + 1 < p.length && p[j + 1] === "*") ans = m(i, j + 2) || (first && m(i + 1, j));
      else ans = first && m(i + 1, j + 1);
    }
    memo.set(key, ans);
    return ans;
  };
  return m(0, 0);
}
`,
  305: `function maxCoins(nums) {
  const a = [1, ...nums, 1];
  const n = a.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let width = 2; width < n; width++) {
    for (let l = 0; l + width < n; l++) {
      const r = l + width;
      for (let k = l + 1; k < r; k++) best[l][r] = Math.max(best[l][r], best[l][k] + a[l] * a[k] * a[r] + best[k][r]);
    }
  }
  return best[0][n - 1];
}
`,
};
