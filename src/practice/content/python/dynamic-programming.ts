// Practice, Python: Dynamic programming (Q281-Q305). Reference solutions: tests/practice/dynamic-programming.solutions.ts.
import type { PracticeContent } from '../types';

export const DYNAMIC_PROGRAMMING: PracticeContent[] = [
  {
    id: 281,
    example: 'Example: climb_stairs(3) returns 3 (1+1+1, 1+2, 2+1).',
    starter: `def climb_stairs(n):
    # How many different ways to climb n stairs, taking 1 or 2 steps at a time?
    pass


print(climb_stairs(3))
`,
    tests: [
      { call: 'climb_stairs', args: [1], expected: 1 },
      { call: 'climb_stairs', args: [2], expected: 2 },
      { call: 'climb_stairs', args: [3], expected: 3 },
      { call: 'climb_stairs', args: [5], expected: 8 },
      { call: 'climb_stairs', args: [45], expected: 1836311903 },
    ],
    hint: 'The last move to stair n came from stair n - 1 or stair n - 2, so ways(n) = ways(n - 1) + ways(n - 2), with ways(1) = 1 and ways(2) = 2. Keep just the last two answers in a loop. Like counting routes up a staircase by asking how you could have arrived at each step.',
  },
  {
    id: 282,
    example: 'Example: fib_memo(10) and fib_table(10) both return 55.',
    starter: `def fib_memo(n):
    # Fibonacci (fib(0) = 0, fib(1) = 1) with recursion that remembers answers it has worked out.
    pass


def fib_table(n):
    # The same, filling a table from the bottom up with a loop.
    pass


print(fib_memo(10), fib_table(10))
`,
    tests: [
      { call: 'fib_memo', args: [10], expected: 55 },
      { call: 'fib_memo', args: [50], expected: 12586269025 },
      { call: 'fib_memo', args: [1], expected: 1 },
      { call: 'fib_table', args: [0], expected: 0 },
      { call: 'fib_table', args: [50], expected: 12586269025 },
      { call: 'fib_table', args: [2], expected: 1 },
    ],
    hint: 'Memo: keep a dictionary; before working out fib(n), check whether it is already there, and store each answer. Table: make a list t with t[0] = 0 and t[1] = 1, then t[i] = t[i - 1] + t[i - 2] up to n. Like writing answers on sticky notes so you never have to work the same sum out twice.',
  },
  {
    id: 283,
    example: 'Example: min_cost_climbing([10, 15, 20]) returns 15 (start on the 15 and jump two steps to the top).',
    starter: `def min_cost_climbing(cost):
    # cost[i] is paid when you step on stair i. Start on stair 0 or 1, climb 1 or 2 stairs at a time.
    # The least total cost to get past the last stair.
    pass


print(min_cost_climbing([10, 15, 20]))
`,
    tests: [
      { call: 'min_cost_climbing', args: [[10, 15, 20]], expected: 15 },
      { call: 'min_cost_climbing', args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
      { call: 'min_cost_climbing', args: [[0, 0]], expected: 0 },
      { call: 'min_cost_climbing', args: [[5, 10]], expected: 5 },
    ],
    hint: 'Let best[i] be the cheapest way to stand at stair i: best[0] = best[1] = 0 and best[i] = min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]). The top is stair len(cost). Like choosing stepping stones across a stream, each with a toll.',
  },
  {
    id: 284,
    example: 'Example: rob([2, 7, 9, 3, 1]) returns 12 (2 + 9 + 1).',
    starter: `def rob(nums):
    # nums[i] is the money in house i of a row. The most you can take without taking two neighbours.
    pass


print(rob([2, 7, 9, 3, 1]))
`,
    tests: [
      { call: 'rob', args: [[1, 2, 3, 1]], expected: 4 },
      { call: 'rob', args: [[2, 7, 9, 3, 1]], expected: 12 },
      { call: 'rob', args: [[]], expected: 0 },
      { call: 'rob', args: [[5]], expected: 5 },
      { call: 'rob', args: [[2, 1, 1, 2]], expected: 4 },
    ],
    hint: 'At each house, either skip it (keep the best so far) or take it (its money plus the best up to two houses back). Keep two running numbers for "best up to the previous house" and "best up to the one before". Like picking seats in a cinema row where nobody may sit next to each other.',
  },
  {
    id: 285,
    example: 'Example: rob_circle([2, 3, 2]) returns 3 (the first and last houses are neighbours).',
    starter: `def rob_circle(nums):
    # The same, but the houses stand in a circle: the first and the last are neighbours.
    pass


print(rob_circle([2, 3, 2]))
`,
    tests: [
      { call: 'rob_circle', args: [[2, 3, 2]], expected: 3 },
      { call: 'rob_circle', args: [[1, 2, 3, 1]], expected: 4 },
      { call: 'rob_circle', args: [[1, 2, 3]], expected: 3 },
      { call: 'rob_circle', args: [[5]], expected: 5 },
      { call: 'rob_circle', args: [[200, 3, 140, 20, 10]], expected: 340 },
    ],
    hint: 'You can never take both the first and the last house. So solve the row problem twice, once without the first house and once without the last, and take the better answer (one house alone is a special case). Like seating guests at a round table: the two ends of the row now touch.',
  },
  {
    id: 286,
    example: 'Example: coin_change([1, 2, 5], 11) returns 3 (5 + 5 + 1).',
    starter: `def coin_change(coins, amount):
    # The fewest coins (any number of each kind) that make amount, or -1 if it can't be made.
    pass


print(coin_change([1, 2, 5], 11))
`,
    tests: [
      { call: 'coin_change', args: [[1, 2, 5], 11], expected: 3 },
      { call: 'coin_change', args: [[2], 3], expected: -1 },
      { call: 'coin_change', args: [[1], 0], expected: 0 },
      { call: 'coin_change', args: [[186, 419, 83, 408], 6249], expected: 20 },
      { call: 'coin_change', args: [[2, 5, 10, 1], 27], expected: 4 },
    ],
    hint: 'Let best[x] be the fewest coins for the amount x: best[0] = 0, and best[x] = 1 + the smallest best[x - c] over the coins c that fit. Fill the table from 1 up to amount; "impossible" can be a very big number. Like working out change for every amount up to the one you need.',
  },
  {
    id: 287,
    example: 'Example: coin_ways(5, [1, 2, 5]) returns 4.',
    starter: `def coin_ways(amount, coins):
    # How many different ways (order does not matter) coins can make amount?
    pass


print(coin_ways(5, [1, 2, 5]))
`,
    tests: [
      { call: 'coin_ways', args: [5, [1, 2, 5]], expected: 4 },
      { call: 'coin_ways', args: [3, [2]], expected: 0 },
      { call: 'coin_ways', args: [10, [10]], expected: 1 },
      { call: 'coin_ways', args: [0, [7]], expected: 1 },
      { call: 'coin_ways', args: [12, [1, 2, 5]], expected: 13 },
    ],
    hint: 'ways[0] = 1. Go coin by coin (the outer loop), and for each amount x from the coin up, add ways[x - coin] to ways[x]. Doing coins in the outer loop counts 1+2 and 2+1 only once. Like counting how many ways to fill a piggy bank, one kind of coin at a time.',
  },
  {
    id: 288,
    example: 'Example: lis_length([10, 9, 2, 5, 3, 7, 101, 18]) returns 4 (2, 3, 7, 101).',
    starter: `def lis_length(nums):
    # The length of the longest strictly increasing subsequence (items in order, not always neighbours).
    pass


print(lis_length([10, 9, 2, 5, 3, 7, 101, 18]))
`,
    tests: [
      { call: 'lis_length', args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { call: 'lis_length', args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { call: 'lis_length', args: [[7, 7, 7, 7]], expected: 1 },
      { call: 'lis_length', args: [[]], expected: 0 },
      { call: 'lis_length', args: [[5, 4, 3, 2, 1]], expected: 1 },
    ],
    hint: 'Let best[i] be the longest increasing run ending at position i: 1 + the biggest best[j] over earlier j with nums[j] < nums[i] (or just 1). The answer is the biggest best[i]. Like climbing a mountain trail, only ever stepping onto higher stones.',
  },
  {
    id: 289,
    example: 'Example: lcs("abcde", "ace") returns 3 ("ace").',
    starter: `def lcs(a, b):
    # The length of the longest common subsequence of a and b (letters in order, not always neighbours).
    pass


print(lcs("abcde", "ace"))
`,
    tests: [
      { call: 'lcs', args: ['abcde', 'ace'], expected: 3 },
      { call: 'lcs', args: ['abc', 'abc'], expected: 3 },
      { call: 'lcs', args: ['abc', 'def'], expected: 0 },
      { call: 'lcs', args: ['', 'a'], expected: 0 },
      { call: 'lcs', args: ['AGGTAB', 'GXTXAYB'], expected: 4 },
    ],
    hint: 'A table t[i][j] for the first i letters of a and the first j of b. If a[i - 1] == b[j - 1], t[i][j] = t[i - 1][j - 1] + 1; otherwise the better of t[i - 1][j] and t[i][j - 1]. Row 0 and column 0 are 0. Like comparing two shopping lists to find the longest set of items bought in the same order.',
  },
  {
    id: 290,
    example: 'Example: edit_distance("horse", "ros") returns 3.',
    starter: `def edit_distance(a, b):
    # The fewest single-letter inserts, deletes or replacements that turn a into b.
    pass


print(edit_distance("horse", "ros"))
`,
    tests: [
      { call: 'edit_distance', args: ['horse', 'ros'], expected: 3 },
      { call: 'edit_distance', args: ['intention', 'execution'], expected: 5 },
      { call: 'edit_distance', args: ['', 'abc'], expected: 3 },
      { call: 'edit_distance', args: ['abc', 'abc'], expected: 0 },
      { call: 'edit_distance', args: ['kitten', 'sitting'], expected: 3 },
    ],
    hint: 'A table t[i][j] for the first i letters of a and j of b: t[i][0] = i, t[0][j] = j. If the letters match, t[i][j] = t[i - 1][j - 1]; otherwise 1 + the smallest of t[i - 1][j] (delete), t[i][j - 1] (insert) and t[i - 1][j - 1] (replace). Like a spell checker counting how many key presses separate two words.',
  },
  {
    id: 291,
    example: 'Example: knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) returns 9 (the items weighing 3 and 4).',
    starter: `def knapsack(weights, values, capacity):
    # Each item can be taken once or not at all. The most value whose total weight fits in capacity.
    pass


print(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))
`,
    tests: [
      { call: 'knapsack', args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { call: 'knapsack', args: [[10, 20, 30], [60, 100, 120], 50], expected: 220 },
      { call: 'knapsack', args: [[5], [10], 4], expected: 0 },
      { call: 'knapsack', args: [[], [], 10], expected: 0 },
    ],
    hint: 'best[c] is the most value with capacity c. For each item, go through the capacities from the top down to its weight: best[c] = max(best[c], best[c - weight] + value). Going down keeps each item to one use. Like packing a suitcase with a weight limit, deciding item by item.',
  },
  {
    id: 292,
    example: 'Example: subset_sum([3, 34, 4, 12, 5, 2], 9) returns True (4 + 5).',
    starter: `def subset_sum(nums, target):
    # nums are 0 or more. True if some of them (each used at most once) add up to target.
    pass


print(subset_sum([3, 34, 4, 12, 5, 2], 9))
`,
    tests: [
      { call: 'subset_sum', args: [[3, 34, 4, 12, 5, 2], 9], expected: true },
      { call: 'subset_sum', args: [[3, 34, 4, 12, 5, 2], 30], expected: false },
      { call: 'subset_sum', args: [[], 0], expected: true },
      { call: 'subset_sum', args: [[1, 2], 4], expected: false },
      { call: 'subset_sum', args: [[2, 3, 7], 10], expected: true },
    ],
    hint: 'Keep a set (or a True/False table) of the sums you can make, starting with {0}. For each number, add it to every sum you already have. At the end, check target. Like collecting all the totals you can pay with the notes in your wallet.',
  },
  {
    id: 293,
    example: 'Example: can_partition([1, 5, 11, 5]) returns True ([1, 5, 5] and [11]).',
    starter: `def can_partition(nums):
    # True if nums can be split into two groups with equal sums.
    pass


print(can_partition([1, 5, 11, 5]))
`,
    tests: [
      { call: 'can_partition', args: [[1, 5, 11, 5]], expected: true },
      { call: 'can_partition', args: [[1, 2, 3, 5]], expected: false },
      { call: 'can_partition', args: [[1, 1]], expected: true },
      { call: 'can_partition', args: [[2]], expected: false },
      { call: 'can_partition', args: [[3, 3, 3, 4, 5]], expected: true },
    ],
    hint: 'If the total is odd, it is impossible. Otherwise the question is subset sum with target total // 2. Like sharing a bag of sweets fairly between two friends.',
  },
  {
    id: 294,
    example: 'Example: grid_paths(3, 7) returns 28.',
    starter: `def grid_paths(m, n):
    # A grid of m rows and n columns. How many paths go from the top-left to the bottom-right,
    # moving only right or down? Use a table.
    pass


print(grid_paths(3, 7))
`,
    tests: [
      { call: 'grid_paths', args: [3, 7], expected: 28 },
      { call: 'grid_paths', args: [3, 2], expected: 3 },
      { call: 'grid_paths', args: [1, 1], expected: 1 },
      { call: 'grid_paths', args: [10, 10], expected: 48620 },
      { call: 'grid_paths', args: [1, 5], expected: 1 },
    ],
    hint: 'Make a table of m rows of n ones. Every other cell is the cell above plus the cell to the left; the answer is in the bottom-right corner. Like a city map where you write at each corner how many ways lead there.',
  },
  {
    id: 295,
    example: 'Example: paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]) returns 2.',
    starter: `def paths_with_obstacles(grid):
    # 0 is open, 1 is blocked. Paths from the top-left to the bottom-right moving only right or down.
    pass


print(paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))
`,
    tests: [
      { call: 'paths_with_obstacles', args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { call: 'paths_with_obstacles', args: [[[0, 1], [0, 0]]], expected: 1 },
      { call: 'paths_with_obstacles', args: [[[1]]], expected: 0 },
      { call: 'paths_with_obstacles', args: [[[0, 0], [0, 1]]], expected: 0 },
      { call: 'paths_with_obstacles', args: [[[0, 0, 0, 0]]], expected: 1 },
    ],
    hint: 'The same table as for plain grid paths, but a blocked cell has 0 ways, and the start has 1 way only if it is open. Cells in the first row or column get their count from the one neighbour they have. Like counting routes through a city with some streets closed for roadworks.',
  },
  {
    id: 296,
    example: 'Example: min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) returns 7 (1, 3, 1, 1, 1).',
    starter: `def min_path_sum(grid):
    # The smallest sum of numbers on a path from the top-left to the bottom-right, moving right or down.
    pass


print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
`,
    tests: [
      { call: 'min_path_sum', args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { call: 'min_path_sum', args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
      { call: 'min_path_sum', args: [[[5]]], expected: 5 },
      { call: 'min_path_sum', args: [[[1, 2], [1, 1]]], expected: 3 },
    ],
    hint: 'best[r][c] is the cell\'s number plus the smaller of best above and best to the left (cells on the top row or left column have only one choice). Fill it row by row. Like finding the cheapest route across a toll-road grid.',
  },
  {
    id: 297,
    example: 'Example: num_decodings("226") returns 3 ("BZ", "VF", "BBF").',
    starter: `def num_decodings(s):
    # 1 = A, 2 = B, ..., 26 = Z. How many ways can the digits s be read as letters?
    pass


print(num_decodings("226"))
`,
    tests: [
      { call: 'num_decodings', args: ['12'], expected: 2 },
      { call: 'num_decodings', args: ['226'], expected: 3 },
      { call: 'num_decodings', args: ['06'], expected: 0 },
      { call: 'num_decodings', args: ['11106'], expected: 2 },
      { call: 'num_decodings', args: ['10'], expected: 1 },
    ],
    hint: 'ways[i] counts the readings of the first i digits; ways[0] = 1. The digit s[i - 1] alone works if it is not "0" (add ways[i - 1]); the two digits s[i - 2:i] work if they make 10 to 26 (add ways[i - 2]). Like reading a secret message where some numbers could be one letter or two.',
  },
  {
    id: 298,
    example: 'Example: word_break("leetcode", ["leet", "code"]) returns True.',
    starter: `def word_break(s, words):
    # True if s can be split into words from the list (each word may be used again).
    pass


print(word_break("leetcode", ["leet", "code"]))
`,
    tests: [
      { call: 'word_break', args: ['leetcode', ['leet', 'code']], expected: true },
      { call: 'word_break', args: ['applepenapple', ['apple', 'pen']], expected: true },
      { call: 'word_break', args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
      { call: 'word_break', args: ['aaaaaaa', ['aaaa', 'aaa']], expected: true },
      { call: 'word_break', args: ['ab', ['a']], expected: false },
    ],
    hint: 'ok[i] says whether the first i letters can be split; ok[0] = True. ok[i] is True if some j < i has ok[j] True and s[j:i] is a word. Like checking a text with no spaces by marking every point where a word could end.',
  },
  {
    id: 299,
    example: 'Example: max_product([2, 3, -2, 4]) returns 6 ([2, 3]).',
    starter: `def max_product(nums):
    # The largest product of a run of neighbouring numbers (at least one number).
    pass


print(max_product([2, 3, -2, 4]))
`,
    tests: [
      { call: 'max_product', args: [[2, 3, -2, 4]], expected: 6 },
      { call: 'max_product', args: [[-2, 0, -1]], expected: 0 },
      { call: 'max_product', args: [[-2, 3, -4]], expected: 24 },
      { call: 'max_product', args: [[-2]], expected: -2 },
      { call: 'max_product', args: [[0, 2]], expected: 2 },
    ],
    hint: 'Keep both the biggest and the smallest product of a run ending here, because a negative number turns the smallest into the biggest. For each number x: new biggest = max(x, x × big, x × small) and new smallest = min of the same three. Like a temperature that flips sign: the coldest day can become the hottest.',
  },
  {
    id: 300,
    example: 'Example: longest_pal_subseq("bbbab") returns 4 ("bbbb").',
    starter: `def longest_pal_subseq(s):
    # The length of the longest subsequence of s (letters in order, not always neighbours) that is a palindrome.
    pass


print(longest_pal_subseq("bbbab"))
`,
    tests: [
      { call: 'longest_pal_subseq', args: ['bbbab'], expected: 4 },
      { call: 'longest_pal_subseq', args: ['cbbd'], expected: 2 },
      { call: 'longest_pal_subseq', args: ['a'], expected: 1 },
      { call: 'longest_pal_subseq', args: ['agbdba'], expected: 5 },
      { call: 'longest_pal_subseq', args: [''], expected: 0 },
    ],
    hint: 't[i][j] is the answer for s[i..j]. If s[i] == s[j], it is t[i + 1][j - 1] + 2; otherwise the better of t[i + 1][j] and t[i][j - 1]. Single letters give 1. Fill it for short pieces first. (It is also the longest common subsequence of s and s reversed.) Like crossing out letters from a word until it reads the same both ways.',
  },
  {
    id: 301,
    example: 'Example: can_jump([2, 3, 1, 1, 4]) returns True.',
    starter: `def can_jump(nums):
    # From position i you may jump up to nums[i] places forward. Starting at 0, can you reach the last position?
    pass


print(can_jump([2, 3, 1, 1, 4]))
`,
    tests: [
      { call: 'can_jump', args: [[2, 3, 1, 1, 4]], expected: true },
      { call: 'can_jump', args: [[3, 2, 1, 0, 4]], expected: false },
      { call: 'can_jump', args: [[0]], expected: true },
      { call: 'can_jump', args: [[2, 0, 0]], expected: true },
      { call: 'can_jump', args: [[1, 0, 1]], expected: false },
    ],
    hint: 'Keep the furthest position you can reach so far. Walk along; if you ever stand past it, you are stuck. Otherwise update it with i + nums[i]. Like crossing a river on stepping stones while tracking the furthest stone in reach.',
  },
  {
    id: 302,
    example: 'Example: min_jumps([2, 3, 1, 1, 4]) returns 2 (jump to position 1, then to the end).',
    starter: `def min_jumps(nums):
    # The fewest jumps to reach the last position (it can always be reached).
    pass


print(min_jumps([2, 3, 1, 1, 4]))
`,
    tests: [
      { call: 'min_jumps', args: [[2, 3, 1, 1, 4]], expected: 2 },
      { call: 'min_jumps', args: [[2, 3, 0, 1, 4]], expected: 2 },
      { call: 'min_jumps', args: [[0]], expected: 0 },
      { call: 'min_jumps', args: [[1, 1, 1, 1]], expected: 3 },
      { call: 'min_jumps', args: [[5, 1, 1, 1, 1]], expected: 1 },
    ],
    hint: 'Think in rounds: with j jumps you can reach up to some end. While walking through that range, track the furthest place the next jump could reach; when you reach the end of the range, take a jump and that furthest place becomes the new end. Like planning a journey by train: each change of train takes you as far as the best connection allows.',
  },
  {
    id: 303,
    example: 'Example: max_profit_cooldown([1, 2, 3, 0, 2]) returns 3 (buy, sell, rest, buy, sell).',
    starter: `def max_profit_cooldown(prices):
    # Buy and sell as often as you like, holding at most one share; the day after a sale you must rest.
    pass


print(max_profit_cooldown([1, 2, 3, 0, 2]))
`,
    tests: [
      { call: 'max_profit_cooldown', args: [[1, 2, 3, 0, 2]], expected: 3 },
      { call: 'max_profit_cooldown', args: [[1]], expected: 0 },
      { call: 'max_profit_cooldown', args: [[2, 1]], expected: 0 },
      { call: 'max_profit_cooldown', args: [[1, 2, 4]], expected: 3 },
      { call: 'max_profit_cooldown', args: [[6, 1, 6, 4, 3, 0, 2]], expected: 7 },
    ],
    hint: 'Keep three running amounts for each day: the best if you hold a share, if you just sold today, and if you are resting without a share. Holding = max(holding, resting - price); sold = holding + price; resting = max(resting, sold yesterday). Like a shop that must close for a day after every big sale.',
  },
  {
    id: 304,
    example: 'Example: is_match("aab", "c*a*b") returns True ("c*" matches nothing, "a*" matches "aa").',
    starter: `def is_match(s, p):
    # True if the pattern p matches the whole of s: "." matches any one letter,
    # "x*" matches zero or more of x (the letter or "." before the star).
    pass


print(is_match("aab", "c*a*b"))
`,
    tests: [
      { call: 'is_match', args: ['aa', 'a'], expected: false },
      { call: 'is_match', args: ['aa', 'a*'], expected: true },
      { call: 'is_match', args: ['ab', '.*'], expected: true },
      { call: 'is_match', args: ['aab', 'c*a*b'], expected: true },
      { call: 'is_match', args: ['mississippi', 'mis*is*p*.'], expected: false },
      { call: 'is_match', args: ['', 'a*'], expected: true },
    ],
    hint: 'm(i, j) asks whether s[i:] matches p[j:]. The first letters match if p[j] is "." or equals s[i]. If a "*" follows p[j], either skip "x*" (m(i, j + 2)) or use it once if the first letters match (m(i + 1, j)); otherwise both must match and you go on to m(i + 1, j + 1). Remember answers. Like a card game where a wild card can stand for any card, and a star lets a card repeat.',
    forbid: { names: ['re', 'fnmatch'], why: 'This question asks you to write the matching yourself, without the re module.' },
  },
  {
    id: 305,
    example: 'Example: max_coins([3, 1, 5, 8]) returns 167.',
    starter: `def max_coins(nums):
    # Bursting balloon i gives left × nums[i] × right coins, where left and right are the balloons
    # still next to it (1 past the ends). The most coins from bursting them all.
    pass


print(max_coins([3, 1, 5, 8]))
`,
    tests: [
      { call: 'max_coins', args: [[3, 1, 5, 8]], expected: 167 },
      { call: 'max_coins', args: [[1, 5]], expected: 10 },
      { call: 'max_coins', args: [[7]], expected: 7 },
      { call: 'max_coins', args: [[9, 76, 64, 21]], expected: 116718 },
      { call: 'max_coins', args: [[2, 4, 3]], expected: 33 },
    ],
    hint: 'Put a 1 at both ends. Think about which balloon in a range bursts LAST: then its neighbours are the range\'s outer edges. best(l, r) = the biggest of best(l, k) + a[l] × a[k] × a[r] + best(k, r) over k between l and r. Fill it for short ranges first. Like planning a demolition from the last building standing backwards.',
  },
];
