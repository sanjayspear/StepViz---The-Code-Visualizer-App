// Practice, JavaScript: dynamic-programming. Tests come from the Python content; reference solutions in tests/practice/js/dynamic-programming.solutions.ts.
import { fromPython } from './shared';
import { DYNAMIC_PROGRAMMING } from '../python/dynamic-programming';

export const DYNAMIC_PROGRAMMING_JS = fromPython(DYNAMIC_PROGRAMMING, {
  281: {
    example: 'Example: climbStairs(3) returns 3 (1+1+1, 1+2, 2+1).',
    starter: `function climbStairs(n) {
  // How many different ways to climb n stairs, taking 1 or 2 steps at a time?
}

console.log(climbStairs(3));
`,
  },
  282: {
    example: 'Example: fibMemo(10) and fibTable(10) both return 55.',
    starter: `function fibMemo(n) {
  // Fibonacci (fib(0) = 0, fib(1) = 1) with recursion that remembers answers it has worked out.
}

function fibTable(n) {
  // The same, filling a table from the bottom up with a loop.
}

console.log(fibMemo(10), fibTable(10));
`,
    hint: "Memo: keep a Map; before working out fib(n), check whether it is already there, and store each answer. Table: make an array t with t[0] = 0 and t[1] = 1, then t[i] = t[i - 1] + t[i - 2] up to n. Like writing answers on sticky notes so you never have to work the same sum out twice.",
  },
  283: {
    example: 'Example: minCostClimbing([10, 15, 20]) returns 15 (start on the 15 and jump two steps to the top).',
    starter: `function minCostClimbing(cost) {
  // cost[i] is paid when you step on stair i. Start on stair 0 or 1, climb 1 or 2 stairs at a time.
  // The least total cost to get past the last stair.
}

console.log(minCostClimbing([10, 15, 20]));
`,
    hint: "Let best[i] be the cheapest way to stand at stair i: best[0] = best[1] = 0 and best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]). The top is stair cost.length. Like choosing stepping stones across a stream, each with a toll.",
  },
  284: {
    example: 'Example: rob([2, 7, 9, 3, 1]) returns 12 (2 + 9 + 1).',
    starter: `function rob(nums) {
  // nums[i] is the money in house i of a row. The most you can take without taking two neighbours.
}

console.log(rob([2, 7, 9, 3, 1]));
`,
  },
  285: {
    example: 'Example: robCircle([2, 3, 2]) returns 3 (the first and last houses are neighbours).',
    starter: `function robCircle(nums) {
  // The same, but the houses stand in a circle: the first and the last are neighbours.
}

console.log(robCircle([2, 3, 2]));
`,
  },
  286: {
    example: 'Example: coinChange([1, 2, 5], 11) returns 3 (5 + 5 + 1).',
    starter: `function coinChange(coins, amount) {
  // The fewest coins (any number of each kind) that make amount, or -1 if it can't be made.
}

console.log(coinChange([1, 2, 5], 11));
`,
  },
  287: {
    example: 'Example: coinWays(5, [1, 2, 5]) returns 4.',
    starter: `function coinWays(amount, coins) {
  // How many different ways (order does not matter) coins can make amount?
}

console.log(coinWays(5, [1, 2, 5]));
`,
  },
  288: {
    example: 'Example: lisLength([10, 9, 2, 5, 3, 7, 101, 18]) returns 4 (2, 3, 7, 101).',
    starter: `function lisLength(nums) {
  // The length of the longest strictly increasing subsequence (items in order, not always neighbours).
}

console.log(lisLength([10, 9, 2, 5, 3, 7, 101, 18]));
`,
  },
  289: {
    example: 'Example: lcs("abcde", "ace") returns 3 ("ace").',
    starter: `function lcs(a, b) {
  // The length of the longest common subsequence of a and b (letters in order, not always neighbours).
}

console.log(lcs("abcde", "ace"));
`,
  },
  290: {
    example: 'Example: editDistance("horse", "ros") returns 3.',
    starter: `function editDistance(a, b) {
  // The fewest single-letter inserts, deletes or replacements that turn a into b.
}

console.log(editDistance("horse", "ros"));
`,
  },
  291: {
    example: 'Example: knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) returns 9 (the items weighing 3 and 4).',
    starter: `function knapsack(weights, values, capacity) {
  // Each item can be taken once or not at all. The most value whose total weight fits in capacity.
}

console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7));
`,
  },
  292: {
    example: 'Example: subsetSum([3, 34, 4, 12, 5, 2], 9) returns true (4 + 5).',
    starter: `function subsetSum(nums, target) {
  // nums are 0 or more. true if some of them (each used at most once) add up to target.
}

console.log(subsetSum([3, 34, 4, 12, 5, 2], 9));
`,
    hint: "Keep a Set (or a true/false table) of the sums you can make, starting with 0. For each number, add it to every sum you already have. At the end, check target. Like collecting all the totals you can pay with the notes in your wallet.",
  },
  293: {
    example: 'Example: canPartition([1, 5, 11, 5]) returns true ([1, 5, 5] and [11]).',
    starter: `function canPartition(nums) {
  // true if nums can be split into two groups with equal sums.
}

console.log(canPartition([1, 5, 11, 5]));
`,
    hint: "If the total is odd, it is impossible. Otherwise the question is subset sum with target total / 2. Like sharing a bag of sweets fairly between two friends.",
  },
  294: {
    example: 'Example: gridPaths(3, 7) returns 28.',
    starter: `function gridPaths(m, n) {
  // A grid of m rows and n columns. How many paths go from the top-left to the bottom-right,
  // moving only right or down? Use a table.
}

console.log(gridPaths(3, 7));
`,
  },
  295: {
    example: 'Example: pathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]) returns 2.',
    starter: `function pathsWithObstacles(grid) {
  // 0 is open, 1 is blocked. Paths from the top-left to the bottom-right moving only right or down.
}

console.log(pathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]));
`,
  },
  296: {
    example: 'Example: minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) returns 7 (1, 3, 1, 1, 1).',
    starter: `function minPathSum(grid) {
  // The smallest sum of numbers on a path from the top-left to the bottom-right, moving right or down.
}

console.log(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]));
`,
  },
  297: {
    example: 'Example: numDecodings("226") returns 3 ("BZ", "VF", "BBF").',
    starter: `function numDecodings(s) {
  // 1 = A, 2 = B, ..., 26 = Z. How many ways can the digits s be read as letters?
}

console.log(numDecodings("226"));
`,
    hint: "ways[i] counts the readings of the first i digits; ways[0] = 1. The digit s[i - 1] alone works if it is not \"0\" (add ways[i - 1]); the two digits s.slice(i - 2, i) work if they make 10 to 26 (add ways[i - 2]). Like reading a secret message where some numbers could be one letter or two.",
  },
  298: {
    example: 'Example: wordBreak("leetcode", ["leet", "code"]) returns true.',
    starter: `function wordBreak(s, words) {
  // true if s can be split into words from the array (each word may be used again).
}

console.log(wordBreak("leetcode", ["leet", "code"]));
`,
    hint: "ok[i] says whether the first i letters can be split; ok[0] = true. ok[i] is true if some j < i has ok[j] true and s.slice(j, i) is a word. Like checking a text with no spaces by marking every point where a word could end.",
  },
  299: {
    example: 'Example: maxProduct([2, 3, -2, 4]) returns 6 ([2, 3]).',
    starter: `function maxProduct(nums) {
  // The largest product of a run of neighbouring numbers (at least one number).
}

console.log(maxProduct([2, 3, -2, 4]));
`,
  },
  300: {
    example: 'Example: longestPalSubseq("bbbab") returns 4 ("bbbb").',
    starter: `function longestPalSubseq(s) {
  // The length of the longest subsequence of s (letters in order, not always neighbours) that is a palindrome.
}

console.log(longestPalSubseq("bbbab"));
`,
  },
  301: {
    example: 'Example: canJump([2, 3, 1, 1, 4]) returns true.',
    starter: `function canJump(nums) {
  // From position i you may jump up to nums[i] places forward. Starting at 0, can you reach the last position?
}

console.log(canJump([2, 3, 1, 1, 4]));
`,
  },
  302: {
    example: 'Example: minJumps([2, 3, 1, 1, 4]) returns 2 (jump to position 1, then to the end).',
    starter: `function minJumps(nums) {
  // The fewest jumps to reach the last position (it can always be reached).
}

console.log(minJumps([2, 3, 1, 1, 4]));
`,
  },
  303: {
    example: 'Example: maxProfitCooldown([1, 2, 3, 0, 2]) returns 3 (buy, sell, rest, buy, sell).',
    starter: `function maxProfitCooldown(prices) {
  // Buy and sell as often as you like, holding at most one share; the day after a sale you must rest.
}

console.log(maxProfitCooldown([1, 2, 3, 0, 2]));
`,
  },
  304: {
    example: 'Example: isMatch("aab", "c*a*b") returns true ("c*" matches nothing, "a*" matches "aa").',
    starter: `function isMatch(s, p) {
  // true if the pattern p matches the whole of s: "." matches any one letter,
  // "x*" matches zero or more of x (the letter or "." before the star).
}

console.log(isMatch("aab", "c*a*b"));
`,
    hint: "m(i, j) asks whether the rest of s from i matches the rest of p from j. The first letters match if p[j] is \".\" or equals s[i]. If a \"*\" follows p[j], either skip \"x*\" (m(i, j + 2)) or use it once if the first letters match (m(i + 1, j)); otherwise both must match and you go on to m(i + 1, j + 1). Remember answers. Like a card game where a wild card can stand for any card, and a star lets a card repeat.",
    forbid: { names: ['RegExp', 'match', 'matchAll', 'test', 'search', 'replace', 'replaceAll', 'split'], patterns: [{ regex: '/…/', shown: 'a regular expression' }], why: 'This question asks you to write the matching yourself, without regular expressions.' },
  },
  305: {
    example: 'Example: maxCoins([3, 1, 5, 8]) returns 167.',
    starter: `function maxCoins(nums) {
  // Bursting balloon i gives left × nums[i] × right coins, where left and right are the balloons
  // still next to it (1 past the ends). The most coins from bursting them all.
}

console.log(maxCoins([3, 1, 5, 8]));
`,
  },
});
