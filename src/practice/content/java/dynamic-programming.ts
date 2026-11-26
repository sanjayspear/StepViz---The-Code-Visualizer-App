// Practice, Java: Dynamic programming (Q281-Q305). Tests come from the Python content;
// reference solutions in tests/practice/java/dynamic-programming.solutions.ts.
import { fromPython } from '../javascript/shared';
import { DYNAMIC_PROGRAMMING } from '../python/dynamic-programming';
import { javaStarter, one } from './shared';

const call = (header: string, comment: string, expr: string) => one(header, comment, `System.out.println(${expr});`);

export const DYNAMIC_PROGRAMMING_JAVA = fromPython(DYNAMIC_PROGRAMMING, {
  281: {
    example: 'Example: climbStairs(3) returns 3 (1+1+1, 1+2, 2+1).',
    starter: call('int climbStairs(int n)', 'How many different ways to climb n stairs, taking 1 or 2 steps at a time?', 'climbStairs(3)'),
  },
  282: {
    example: 'Example: fibMemo(10) and fibTable(10) both return 55.',
    starter: javaStarter(
      [
        ['long fibMemo(int n)', 'Fibonacci (fib(0) = 0, fib(1) = 1) with recursion that remembers answers it has worked out.\nTip: keep the answers in a static HashMap or long[].'],
        ['long fibTable(int n)', 'The same, filling a table from the bottom up with a loop.'],
      ],
      'System.out.println(fibMemo(10));\nSystem.out.println(fibTable(10));',
      'import java.util.*;',
    ),
    hint: 'Memo: keep a HashMap<Integer, Long>; before working out fib(n), check whether it is already there, and store each answer. Table: make a long[] t with t[0] = 0 and t[1] = 1, then t[i] = t[i - 1] + t[i - 2] up to n. Like writing answers on sticky notes so you never have to work the same sum out twice.',
  },
  283: {
    example: 'Example: minCostClimbing(new int[] {10, 15, 20}) returns 15 (start on the 15 and jump two steps to the top).',
    starter: call(
      'int minCostClimbing(int[] cost)',
      'cost[i] is paid when you step on stair i. Start on stair 0 or 1, climb 1 or 2 stairs at a time.\nThe least total cost to get past the last stair.',
      'minCostClimbing(new int[] {10, 15, 20})',
    ),
    hint: 'Let best[i] be the cheapest way to stand at stair i: best[0] = best[1] = 0 and best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]). The top is stair cost.length. Like choosing stepping stones across a stream, each with a toll.',
  },
  284: {
    example: 'Example: rob(new int[] {2, 7, 9, 3, 1}) returns 12 (2 + 9 + 1).',
    starter: call('int rob(int[] nums)', 'nums[i] is the money in house i of a row. The most you can take without taking two neighbours.', 'rob(new int[] {2, 7, 9, 3, 1})'),
  },
  285: {
    example: 'Example: robCircle(new int[] {2, 3, 2}) returns 3 (the first and last houses are neighbours).',
    starter: call('int robCircle(int[] nums)', 'The same, but the houses stand in a circle: the first and the last are neighbours.', 'robCircle(new int[] {2, 3, 2})'),
  },
  286: {
    example: 'Example: coinChange(new int[] {1, 2, 5}, 11) returns 3 (5 + 5 + 1).',
    starter: call('int coinChange(int[] coins, int amount)', "The fewest coins (any number of each kind) that make amount, or -1 if it can't be made.", 'coinChange(new int[] {1, 2, 5}, 11)'),
  },
  287: {
    example: 'Example: coinWays(5, new int[] {1, 2, 5}) returns 4.',
    starter: call('int coinWays(int amount, int[] coins)', 'How many different ways (order does not matter) coins can make amount?', 'coinWays(5, new int[] {1, 2, 5})'),
  },
  288: {
    example: 'Example: lisLength(new int[] {10, 9, 2, 5, 3, 7, 101, 18}) returns 4 (2, 3, 7, 101).',
    starter: call('int lisLength(int[] nums)', 'The length of the longest strictly increasing subsequence (items in order, not always neighbours).', 'lisLength(new int[] {10, 9, 2, 5, 3, 7, 101, 18})'),
  },
  289: {
    example: 'Example: lcs("abcde", "ace") returns 3 ("ace").',
    starter: call('int lcs(String a, String b)', 'The length of the longest common subsequence of a and b (letters in order, not always neighbours).', 'lcs("abcde", "ace")'),
  },
  290: {
    example: 'Example: editDistance("horse", "ros") returns 3.',
    starter: call('int editDistance(String a, String b)', 'The fewest single-letter inserts, deletes or replacements that turn a into b.', 'editDistance("horse", "ros")'),
  },
  291: {
    example: 'Example: knapsack(new int[] {1, 3, 4, 5}, new int[] {1, 4, 5, 7}, 7) returns 9 (the items weighing 3 and 4).',
    starter: call(
      'int knapsack(int[] weights, int[] values, int capacity)',
      'Each item can be taken once or not at all. The most value whose total weight fits in capacity.',
      'knapsack(new int[] {1, 3, 4, 5}, new int[] {1, 4, 5, 7}, 7)',
    ),
  },
  292: {
    example: 'Example: subsetSum(new int[] {3, 34, 4, 12, 5, 2}, 9) returns true (4 + 5).',
    starter: call('boolean subsetSum(int[] nums, int target)', 'nums are 0 or more. true if some of them (each used at most once) add up to target.', 'subsetSum(new int[] {3, 34, 4, 12, 5, 2}, 9)'),
    hint: 'Keep a boolean[] can of size target + 1, with can[0] = true. For each number x, go through the sums from target down to x: can[s] becomes true if can[s - x] is. At the end, check can[target]. Like collecting all the totals you can pay with the notes in your wallet.',
  },
  293: {
    example: 'Example: canPartition(new int[] {1, 5, 11, 5}) returns true ([1, 5, 5] and [11]).',
    starter: call('boolean canPartition(int[] nums)', 'true if nums can be split into two groups with equal sums.', 'canPartition(new int[] {1, 5, 11, 5})'),
    hint: 'If the total is odd, it is impossible. Otherwise the question is subset sum with target total / 2. Like sharing a bag of sweets fairly between two friends.',
  },
  294: {
    example: 'Example: gridPaths(3, 7) returns 28.',
    starter: call(
      'int gridPaths(int m, int n)',
      'A grid of m rows and n columns. How many paths go from the top-left to the bottom-right,\nmoving only right or down? Use a table.',
      'gridPaths(3, 7)',
    ),
  },
  295: {
    example: 'Example: pathsWithObstacles(new int[][] {{0, 0, 0}, {0, 1, 0}, {0, 0, 0}}) returns 2.',
    starter: call('int pathsWithObstacles(int[][] grid)', '0 is open, 1 is blocked. Paths from the top-left to the bottom-right moving only right or down.', 'pathsWithObstacles(new int[][] {{0, 0, 0}, {0, 1, 0}, {0, 0, 0}})'),
  },
  296: {
    example: 'Example: minPathSum(new int[][] {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) returns 7 (1, 3, 1, 1, 1).',
    starter: call('int minPathSum(int[][] grid)', 'The smallest sum of numbers on a path from the top-left to the bottom-right, moving right or down.', 'minPathSum(new int[][] {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}})'),
  },
  297: {
    example: 'Example: numDecodings("226") returns 3 ("BZ", "VF", "BBF").',
    starter: call('int numDecodings(String s)', '1 = A, 2 = B, ..., 26 = Z. How many ways can the digits s be read as letters?', 'numDecodings("226")'),
    hint: 'ways[i] counts the readings of the first i digits; ways[0] = 1. The digit s.charAt(i - 1) alone works if it is not \'0\' (add ways[i - 1]); the two digits s.substring(i - 2, i) work if they make 10 to 26 (add ways[i - 2]). Like reading a secret message where some numbers could be one letter or two.',
  },
  298: {
    example: 'Example: wordBreak("leetcode", new String[] {"leet", "code"}) returns true.',
    starter: call('boolean wordBreak(String s, String[] words)', 's can be split into words from the list (each word may be used again)?', 'wordBreak("leetcode", new String[] {"leet", "code"})'),
    hint: 'ok[i] says whether the first i letters can be split; ok[0] = true. ok[i] is true if some j < i has ok[j] true and s.substring(j, i) is a word (keep the words in a HashSet). Like checking a text with no spaces by marking every point where a word could end.',
  },
  299: {
    example: 'Example: maxProduct(new int[] {2, 3, -2, 4}) returns 6 ([2, 3]).',
    starter: call('int maxProduct(int[] nums)', 'The largest product of a run of neighbouring numbers (at least one number).', 'maxProduct(new int[] {2, 3, -2, 4})'),
    hint: 'Keep both the biggest and the smallest product of a run ending here, because a negative number turns the smallest into the biggest. For each number x: new biggest = the max of x, x × big and x × small; new smallest = the min of the same three (work both out before changing either). Like a temperature that flips sign: the coldest day can become the hottest.',
  },
  300: {
    example: 'Example: longestPalSubseq("bbbab") returns 4 ("bbbb").',
    starter: call(
      'int longestPalSubseq(String s)',
      'The length of the longest subsequence of s (letters in order, not always neighbours) that is a palindrome.',
      'longestPalSubseq("bbbab")',
    ),
    hint: 't[i][j] is the answer for the letters from i to j. If s.charAt(i) == s.charAt(j), it is t[i + 1][j - 1] + 2; otherwise the better of t[i + 1][j] and t[i][j - 1]. Single letters give 1. Fill it for short pieces first. Like crossing out letters from a word until it reads the same both ways.',
  },
  301: {
    example: 'Example: canJump(new int[] {2, 3, 1, 1, 4}) returns true.',
    starter: call('boolean canJump(int[] nums)', 'From position i you may jump up to nums[i] places forward. Starting at 0, can you reach the last position?', 'canJump(new int[] {2, 3, 1, 1, 4})'),
  },
  302: {
    example: 'Example: minJumps(new int[] {2, 3, 1, 1, 4}) returns 2 (jump to position 1, then to the end).',
    starter: call('int minJumps(int[] nums)', 'The fewest jumps to reach the last position (it can always be reached).', 'minJumps(new int[] {2, 3, 1, 1, 4})'),
  },
  303: {
    example: 'Example: maxProfitCooldown(new int[] {1, 2, 3, 0, 2}) returns 3 (buy, sell, rest, buy, sell).',
    starter: call(
      'int maxProfitCooldown(int[] prices)',
      'Buy and sell as often as you like, holding at most one share; the day after a sale you must rest.',
      'maxProfitCooldown(new int[] {1, 2, 3, 0, 2})',
    ),
  },
  304: {
    example: 'Example: isMatch("aab", "c*a*b") returns true ("c*" matches nothing, "a*" matches "aa").',
    starter: call(
      'boolean isMatch(String s, String p)',
      'true if the pattern p matches the whole of s: "." matches any one letter,\n"x*" matches zero or more of x (the letter or "." before the star).',
      'isMatch("aab", "c*a*b")',
    ),
    hint: 'm(i, j) asks whether the rest of s from i matches the rest of p from j. The first letters match if p.charAt(j) is \'.\' or equals s.charAt(i). If a \'*\' follows, either skip "x*" (m(i, j + 2)) or use it once if the first letters match (m(i + 1, j)); otherwise both must match and you go on to m(i + 1, j + 1). Remember answers in an int[][] (0 unknown, 1 yes, 2 no). Like a card game where a wild card can stand for any card, and a star lets a card repeat.',
    forbid: { names: ['matches', 'Pattern', 'Matcher', 'replaceAll', 'replaceFirst', 'split'], why: 'This question asks you to write the matching yourself, without matches() or regular expressions.' },
  },
  305: {
    example: 'Example: maxCoins(new int[] {3, 1, 5, 8}) returns 167.',
    starter: call(
      'int maxCoins(int[] nums)',
      'Bursting balloon i gives left × nums[i] × right coins, where left and right are the balloons\nstill next to it (1 past the ends). The most coins from bursting them all.',
      'maxCoins(new int[] {3, 1, 5, 8})',
    ),
  },
});
