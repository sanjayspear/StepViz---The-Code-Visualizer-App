// Reference solutions for Practice: Dynamic programming (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  281: `def climb_stairs(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
`,
  282: `def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]


def fib_table(n):
    t = [0, 1] + [0] * max(0, n - 1)
    for i in range(2, n + 1):
        t[i] = t[i - 1] + t[i - 2]
    return t[n]
`,
  283: `def min_cost_climbing(cost):
    n = len(cost)
    best = [0] * (n + 1)
    for i in range(2, n + 1):
        best[i] = min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2])
    return best[n]
`,
  284: `def rob(nums):
    before, prev = 0, 0
    for x in nums:
        before, prev = prev, max(prev, before + x)
    return prev
`,
  285: `def rob_circle(nums):
    def line(houses):
        before, prev = 0, 0
        for x in houses:
            before, prev = prev, max(prev, before + x)
        return prev
    if len(nums) == 1:
        return nums[0]
    return max(line(nums[1:]), line(nums[:-1]))
`,
  286: `def coin_change(coins, amount):
    big = amount + 1
    best = [0] + [big] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x and best[x - c] + 1 < best[x]:
                best[x] = best[x - c] + 1
    return best[amount] if best[amount] != big else -1
`,
  287: `def coin_ways(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for x in range(c, amount + 1):
            ways[x] += ways[x - c]
    return ways[amount]
`,
  288: `def lis_length(nums):
    best = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                best[i] = max(best[i], best[j] + 1)
    return max(best, default=0)
`,
  289: `def lcs(a, b):
    t = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                t[i][j] = t[i - 1][j - 1] + 1
            else:
                t[i][j] = max(t[i - 1][j], t[i][j - 1])
    return t[len(a)][len(b)]
`,
  290: `def edit_distance(a, b):
    t = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        t[i][0] = i
    for j in range(len(b) + 1):
        t[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                t[i][j] = t[i - 1][j - 1]
            else:
                t[i][j] = 1 + min(t[i - 1][j], t[i][j - 1], t[i - 1][j - 1])
    return t[len(a)][len(b)]
`,
  291: `def knapsack(weights, values, capacity):
    best = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return best[capacity]
`,
  292: `def subset_sum(nums, target):
    sums = {0}
    for x in nums:
        sums = sums | {s + x for s in sums}
    return target in sums
`,
  293: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    sums = {0}
    for x in nums:
        sums = sums | {s + x for s in sums}
    return total // 2 in sums
`,
  294: `def grid_paths(m, n):
    t = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            t[r][c] = t[r - 1][c] + t[r][c - 1]
    return t[m - 1][n - 1]
`,
  295: `def paths_with_obstacles(grid):
    rows, cols = len(grid), len(grid[0])
    t = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                t[r][c] = 0
            elif r == 0 and c == 0:
                t[r][c] = 1
            else:
                t[r][c] = (t[r - 1][c] if r > 0 else 0) + (t[r][c - 1] if c > 0 else 0)
    return t[rows - 1][cols - 1]
`,
  296: `def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    t = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                t[r][c] = grid[0][0]
            elif r == 0:
                t[r][c] = t[r][c - 1] + grid[r][c]
            elif c == 0:
                t[r][c] = t[r - 1][c] + grid[r][c]
            else:
                t[r][c] = min(t[r - 1][c], t[r][c - 1]) + grid[r][c]
    return t[rows - 1][cols - 1]
`,
  297: `def num_decodings(s):
    ways = [1] + [0] * len(s)
    for i in range(1, len(s) + 1):
        if s[i - 1] != "0":
            ways[i] += ways[i - 1]
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            ways[i] += ways[i - 2]
    return ways[len(s)]
`,
  298: `def word_break(s, words):
    words = set(words)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if ok[j] and s[j:i] in words:
                ok[i] = True
                break
    return ok[len(s)]
`,
  299: `def max_product(nums):
    big = small = best = nums[0]
    for x in nums[1:]:
        big, small = max(x, x * big, x * small), min(x, x * big, x * small)
        best = max(best, big)
    return best
`,
  300: `def longest_pal_subseq(s):
    n = len(s)
    if n == 0:
        return 0
    t = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        t[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                t[i][j] = t[i + 1][j - 1] + 2
            else:
                t[i][j] = max(t[i + 1][j], t[i][j - 1])
    return t[0][n - 1]
`,
  301: `def can_jump(nums):
    furthest = 0
    for i, x in enumerate(nums):
        if i > furthest:
            return False
        furthest = max(furthest, i + x)
    return True
`,
  302: `def min_jumps(nums):
    jumps, end, furthest = 0, 0, 0
    for i in range(len(nums) - 1):
        furthest = max(furthest, i + nums[i])
        if i == end:
            jumps += 1
            end = furthest
    return jumps
`,
  303: `def max_profit_cooldown(prices):
    holding, sold, resting = float("-inf"), 0, 0
    for p in prices:
        holding, sold, resting = max(holding, resting - p), holding + p, max(resting, sold)
    return max(sold, resting)
`,
  304: `def is_match(s, p):
    memo = {}
    def m(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        if j == len(p):
            ans = i == len(s)
        else:
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                ans = m(i, j + 2) or (first and m(i + 1, j))
            else:
                ans = first and m(i + 1, j + 1)
        memo[(i, j)] = ans
        return ans
    return m(0, 0)
`,
  305: `def max_coins(nums):
    a = [1] + nums + [1]
    n = len(a)
    best = [[0] * n for _ in range(n)]
    for width in range(2, n):
        for l in range(0, n - width):
            r = l + width
            for k in range(l + 1, r):
                best[l][r] = max(best[l][r], best[l][k] + a[l] * a[k] * a[r] + best[k][r])
    return best[0][n - 1]
`,
};
