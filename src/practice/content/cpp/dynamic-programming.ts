// Practice, C++: Dynamic programming (Q281-Q305). Tests come from the Python content;
// reference solutions in tests/practice/cpp/dynamic-programming.solutions.ts.
import { fromPython } from '../javascript/shared';
import { DYNAMIC_PROGRAMMING } from '../python/dynamic-programming';
import { cppStarter } from './shared';

const fn = (header: string, comment: string, main: string) => cppStarter([[header, comment]], main);
const show = (expr: string) => `cout << ${expr} << endl;`;
const yes = (expr: string) => `cout << boolalpha << ${expr} << endl;`;
const nums = (name: string, values: string) => `vector<int> ${name} = {${values}};`;

export const DYNAMIC_PROGRAMMING_CPP = fromPython(DYNAMIC_PROGRAMMING, {
  281: {
    example: 'Example: climbStairs(3) returns 3 (1+1+1, 1+2, 2+1).',
    starter: fn('int climbStairs(int n)', 'How many different ways to climb n stairs, taking 1 or 2 steps at a time?', show('climbStairs(3)')),
  },
  282: {
    example: 'Example: fibMemo(10) and fibTable(10) both return 55.',
    starter: cppStarter(
      [
        ['long long fibMemo(int n)', 'Fibonacci (fib(0) = 0, fib(1) = 1) with recursion that remembers answers it has worked out.\nTip: keep the answers in a global map<int, long long> or vector<long long>.'],
        ['long long fibTable(int n)', 'The same, filling a table from the bottom up with a loop.'],
      ],
      'cout << fibMemo(10) << endl;\ncout << fibTable(10) << endl;',
      ['map'],
    ),
    hint: 'Memo: keep a global map<int, long long>; before working out fib(n), check whether it is already there (count), and store each answer. Table: make a vector<long long> t(n + 1) with t[0] = 0 and t[1] = 1, then t[i] = t[i - 1] + t[i - 2] up to n. Like writing answers on sticky notes so you never have to work the same sum out twice.',
  },
  283: {
    example: 'Example: minCostClimbing({10, 15, 20}) returns 15 (start on the 15 and jump two steps to the top).',
    starter: fn(
      'int minCostClimbing(vector<int>& cost)',
      'cost[i] is paid when you step on stair i. Start on stair 0 or 1, climb 1 or 2 stairs at a time.\nThe least total cost to get past the last stair.',
      `${nums('cost', '10, 15, 20')}\n${show('minCostClimbing(cost)')}`,
    ),
    hint: 'Let best[i] be the cheapest way to stand at stair i: best[0] = best[1] = 0 and best[i] = min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]). The top is stair cost.size(). Like choosing stepping stones across a stream, each with a toll.',
  },
  284: {
    example: 'Example: rob({2, 7, 9, 3, 1}) returns 12 (2 + 9 + 1).',
    starter: fn('int rob(vector<int>& nums)', 'nums[i] is the money in house i of a row. The most you can take without taking two neighbours.', `${nums('nums', '2, 7, 9, 3, 1')}\n${show('rob(nums)')}`),
  },
  285: {
    example: 'Example: robCircle({2, 3, 2}) returns 3.',
    starter: fn('int robCircle(vector<int>& nums)', 'The same, but the houses stand in a circle: the first and the last are neighbours.', `${nums('nums', '2, 3, 2')}\n${show('robCircle(nums)')}`),
  },
  286: {
    example: 'Example: coinChange({1, 2, 5}, 11) returns 3 (5 + 5 + 1).',
    starter: fn('int coinChange(vector<int>& coins, int amount)', "The fewest coins (any number of each kind) that make amount, or -1 if it can't be made.", `${nums('coins', '1, 2, 5')}\n${show('coinChange(coins, 11)')}`),
  },
  287: {
    example: 'Example: coinWays(5, {1, 2, 5}) returns 4.',
    starter: fn('int coinWays(int amount, vector<int>& coins)', 'How many different ways (order does not matter) coins can make amount?', `${nums('coins', '1, 2, 5')}\n${show('coinWays(5, coins)')}`),
  },
  288: {
    example: 'Example: lisLength({10, 9, 2, 5, 3, 7, 101, 18}) returns 4 ([2, 3, 7, 101]).',
    starter: fn('int lisLength(vector<int>& nums)', 'The length of the longest strictly increasing subsequence (items in order, not always neighbours).', `${nums('nums', '10, 9, 2, 5, 3, 7, 101, 18')}\n${show('lisLength(nums)')}`),
  },
  289: {
    example: 'Example: lcs("abcde", "ace") returns 3.',
    starter: fn('int lcs(string a, string b)', 'The length of the longest common subsequence of a and b (letters in order, not always neighbours).', show('lcs("abcde", "ace")')),
  },
  290: {
    example: 'Example: editDistance("horse", "ros") returns 3.',
    starter: fn('int editDistance(string a, string b)', 'The fewest single-letter inserts, deletes or replacements that turn a into b.', show('editDistance("horse", "ros")')),
  },
  291: {
    example: 'Example: knapsack({1, 3, 4, 5}, {1, 4, 5, 7}, 7) returns 9 (the items weighing 3 and 4).',
    starter: fn(
      'int knapsack(vector<int>& weights, vector<int>& values, int capacity)',
      'Each item can be taken once or not at all. The most value whose total weight fits in capacity.',
      `${nums('weights', '1, 3, 4, 5')}\n${nums('values', '1, 4, 5, 7')}\n${show('knapsack(weights, values, 7)')}`,
    ),
  },
  292: {
    example: 'Example: subsetSum({3, 34, 4, 12, 5, 2}, 9) returns true (4 + 5).',
    starter: fn('bool subsetSum(vector<int>& nums, int target)', 'nums are 0 or more. true if some of them (each used at most once) add up to target.', `${nums('nums', '3, 34, 4, 12, 5, 2')}\n${yes('subsetSum(nums, 9)')}`),
    hint: 'Keep a vector<bool> can(target + 1, false), with can[0] = true. For each number x, go through the sums from target down to x: can[s] becomes true if can[s - x] is. At the end, check can[target]. Like collecting all the totals you can pay with the notes in your wallet, one note at a time.',
  },
  293: {
    example: 'Example: canPartition({1, 5, 11, 5}) returns true ([1, 5, 5] and [11]).',
    starter: fn('bool canPartition(vector<int>& nums)', 'true if nums can be split into two groups with equal sums.', `${nums('nums', '1, 5, 11, 5')}\n${yes('canPartition(nums)')}`),
    hint: 'If the total is odd, it is impossible. Otherwise the question is subset sum with target total / 2. Like sharing a bag of sweets fairly between two friends.',
  },
  294: {
    example: 'Example: gridPaths(3, 7) returns 28.',
    starter: fn(
      'int gridPaths(int m, int n)',
      'A grid of m rows and n columns. How many paths go from the top-left to the bottom-right,\nmoving only right or down? Use a table.',
      show('gridPaths(3, 7)'),
    ),
  },
  295: {
    example: 'Example: pathsWithObstacles({{0, 0, 0}, {0, 1, 0}, {0, 0, 0}}) returns 2.',
    starter: fn(
      'int pathsWithObstacles(vector<vector<int>>& grid)',
      '0 is open, 1 is blocked. Paths from the top-left to the bottom-right moving only right or down.',
      `vector<vector<int>> grid = {{0, 0, 0}, {0, 1, 0}, {0, 0, 0}};\n${show('pathsWithObstacles(grid)')}`,
    ),
  },
  296: {
    example: 'Example: minPathSum({{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) returns 7.',
    starter: fn(
      'int minPathSum(vector<vector<int>>& grid)',
      'The smallest sum of numbers on a path from the top-left to the bottom-right, moving right or down.',
      `vector<vector<int>> grid = {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}};\n${show('minPathSum(grid)')}`,
    ),
  },
  297: {
    example: 'Example: numDecodings("226") returns 3 (BZ, VF, BBF).',
    starter: fn('int numDecodings(string s)', '1 = A, 2 = B, ..., 26 = Z. How many ways can the digits s be read as letters?', show('numDecodings("226")')),
    hint: "ways[i] counts the readings of the first i digits; ways[0] = 1. The digit s[i - 1] alone works if it is not '0' (add ways[i - 1]); the two digits s.substr(i - 2, 2) work if they make 10 to 26 (add ways[i - 2]). Like reading a secret code where some numbers could be one letter or two.",
  },
  298: {
    example: 'Example: wordBreak("leetcode", {"leet", "code"}) returns true.',
    starter: fn(
      'bool wordBreak(string s, vector<string> words)',
      's can be split into words from the list (each word may be used again)?',
      `vector<string> words = {"leet", "code"};\n${yes('wordBreak("leetcode", words)')}`,
    ),
    hint: 'ok[i] says whether the first i letters can be split; ok[0] = true. ok[i] is true if some j < i has ok[j] true and s.substr(j, i - j) is a word (keep the words in a set<string>). Like checking a text with no spaces by marking every point where a word could end.',
  },
  299: {
    example: 'Example: maxProduct({2, 3, -2, 4}) returns 6 ([2, 3]).',
    starter: fn('int maxProduct(vector<int>& nums)', 'The largest product of a run of neighbouring numbers (at least one number).', `${nums('nums', '2, 3, -2, 4')}\n${show('maxProduct(nums)')}`),
    hint: 'Keep both the biggest and the smallest product of a run ending here, because a negative number turns the smallest into the biggest. For each number x: new biggest = the max of x, x × big and x × small; new smallest = the min of the same three (work both out before changing either). Like a see-saw: a big debt flipped by a negative becomes a big win.',
  },
  300: {
    example: 'Example: longestPalSubseq("bbbab") returns 4 ("bbbb").',
    starter: fn(
      'int longestPalSubseq(string s)',
      'The length of the longest subsequence of s (letters in order, not always neighbours) that is a palindrome.',
      show('longestPalSubseq("bbbab")'),
    ),
    hint: 't[i][j] is the answer for the letters from i to j. If s[i] == s[j], it is t[i + 1][j - 1] + 2; otherwise the better of t[i + 1][j] and t[i][j - 1]. Single letters give 1. Fill it for short pieces first. Like crossing out letters from a word until it reads the same both ways.',
  },
  301: {
    example: 'Example: canJump({2, 3, 1, 1, 4}) returns true.',
    starter: fn('bool canJump(vector<int>& nums)', 'From position i you may jump up to nums[i] places forward. Starting at 0, can you reach the last position?', `${nums('nums', '2, 3, 1, 1, 4')}\n${yes('canJump(nums)')}`),
  },
  302: {
    example: 'Example: minJumps({2, 3, 1, 1, 4}) returns 2 (jump to position 1, then to the end).',
    starter: fn('int minJumps(vector<int>& nums)', 'The fewest jumps to reach the last position (it can always be reached).', `${nums('nums', '2, 3, 1, 1, 4')}\n${show('minJumps(nums)')}`),
  },
  303: {
    example: 'Example: maxProfitCooldown({1, 2, 3, 0, 2}) returns 3 (buy, sell, rest, buy, sell).',
    starter: fn(
      'int maxProfitCooldown(vector<int>& prices)',
      'Buy and sell as often as you like, holding at most one share; the day after a sale you must rest.',
      `${nums('prices', '1, 2, 3, 0, 2')}\n${show('maxProfitCooldown(prices)')}`,
    ),
  },
  304: {
    example: 'Example: isMatch("aab", "c*a*b") returns true ("c*" matches nothing, "a*" matches "aa").',
    starter: fn(
      'bool isMatch(string s, string p)',
      'true if the pattern p matches the whole of s: "." matches any one letter,\n"x*" matches zero or more of x (the letter or "." before the star).',
      yes('isMatch("aab", "c*a*b")'),
    ),
    hint: 'm(i, j) asks whether the rest of s from i matches the rest of p from j. The first letters match if p[j] is \'.\' or equals s[i]. If a \'*\' follows, either skip "x*" (m(i, j + 2)) or use it once if the first letters match (m(i + 1, j)); otherwise both must match and you go on to m(i + 1, j + 1). Remember answers in a vector<vector<int>> (0 unknown, 1 yes, 2 no). Like a card game where a wild card can stand for any card, and a star lets a card repeat.',
    forbid: {
      names: ['regex', 'regex_match', 'regex_search', 'regex_replace'],
      why: 'This question asks you to write the matching yourself, without regex.',
    },
  },
  305: {
    example: 'Example: maxCoins({3, 1, 5, 8}) returns 167.',
    starter: fn(
      'int maxCoins(vector<int>& nums)',
      'Bursting balloon i gives left × nums[i] × right coins, where left and right are the balloons\nstill next to it (1 past the ends). The most coins from bursting them all.',
      `${nums('nums', '3, 1, 5, 8')}\n${show('maxCoins(nums)')}`,
    ),
  },
});
