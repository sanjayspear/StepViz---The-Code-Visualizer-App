// Practice, C: the questions of dynamic-programming that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/dynamic-programming.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q295, Q296, Q298.
import { fromPython } from '../javascript/shared';
import { DYNAMIC_PROGRAMMING } from '../python/dynamic-programming';
import { cStarter } from './shared';

export const DYNAMIC_PROGRAMMING_C = fromPython(
  DYNAMIC_PROGRAMMING,
  {
  281: {
    example: "Example: climbStairs(3) returns 3 (1+1+1, 1+2, 2+1).",
    starter: cStarter([["int climbStairs(int n)", "How many different ways to climb n stairs, taking 1 or 2 steps at a time?"]], "printf(\"%d\\n\", climbStairs(1));", [], ''),
    hint: "The last move to stair n came from stair n - 1 or stair n - 2, so ways(n) = ways(n - 1) + ways(n - 2), with ways(1) = 1 and ways(2) = 2. Keep just the last two answers in a loop. Like counting routes up a staircase by asking how you could have arrived at each step.",
  },
  282: {
    example: "Example: fibMemo(10) and fibTable(10) both return 55.",
    starter: cStarter([["long long fibMemo(int n)", "Fibonacci (fib(0) = 0, fib(1) = 1) with recursion that remembers answers it has worked out.\nTip: keep the answers in a global array, like long long memo[100] (0 means not worked out yet)."], ["long long fibTable(int n)", "The same, filling a table from the bottom up with a loop."]], "printf(\"%lld\\n\", fibMemo(10));\nprintf(\"%lld\\n\", fibTable(0));", [], ''),
    hint: "Memo: keep a global long long memo[100] (all 0 at first); before working out fib(n), check whether memo[n] is already set, and store each answer. Table: make long long t[n + 1] with t[0] = 0 and t[1] = 1, then t[i] = t[i - 1] + t[i - 2] up to n. Like writing answers on sticky notes so you never have to work the same sum out twice.",
  },
  283: {
    example: "Example: minCostClimbing({10, 15, 20}) returns 15 (start on the 15 and jump two steps to the top).",
    starter: cStarter([["int minCostClimbing(int cost[], int n)", "cost[i] is paid when you step on stair i. Start on stair 0 or 1, climb 1 or 2 stairs at a time.\nThe least total cost to get past the last stair."]], "int cost[] = {10, 15, 20};\nprintf(\"%d\\n\", minCostClimbing(cost, 3));", [], ''),
    hint: "Let best[i] be the cheapest way to stand at stair i: best[0] = best[1] = 0 and best[i] is the smaller of best[i - 1] + cost[i - 1] and best[i - 2] + cost[i - 2] (C has no min(): compare with if). The top is stair n. Like choosing stepping stones across a stream, each with a toll.",
  },
  284: {
    example: "Example: rob({2, 7, 9, 3, 1}) returns 12 (2 + 9 + 1).",
    starter: cStarter([["int rob(int nums[], int n)", "nums[i] is the money in house i of a row. The most you can take without taking two neighbours."]], "int nums[] = {1, 2, 3, 1};\nprintf(\"%d\\n\", rob(nums, 4));", [], ''),
    hint: "At each house, either skip it (keep the best so far) or take it (its money plus the best up to two houses back). Keep two running numbers for \"best up to the previous house\" and \"best up to the one before\". Like picking seats in a cinema row where nobody may sit next to each other.",
  },
  285: {
    example: "Example: robCircle({2, 3, 2}) returns 3.",
    starter: cStarter([["int robCircle(int nums[], int n)", "The same, but the houses stand in a circle: the first and the last are neighbours."]], "int nums[] = {2, 3, 2};\nprintf(\"%d\\n\", robCircle(nums, 3));", [], ''),
    hint: "You can never take both the first and the last house. So solve the row problem twice, once without the first house and once without the last, and take the better answer (one house alone is a special case). Like seating guests at a round table: the two ends of the row now touch.",
  },
  286: {
    example: "Example: coinChange({1, 2, 5}, 11) returns 3 (5 + 5 + 1).",
    starter: cStarter([["int coinChange(int coins[], int n, int amount)", "The fewest coins (any number of each kind) that make amount, or -1 if it can't be made."]], "int coins[] = {1, 2, 5};\nprintf(\"%d\\n\", coinChange(coins, 3, 11));", [], ''),
    hint: "Let best[x] be the fewest coins for the amount x: best[0] = 0, and best[x] = 1 + the smallest best[x - c] over the coins c that fit. Fill the table from 1 up to amount; \"impossible\" can be a very big number. Like working out change for every amount up to the one you need.",
  },
  287: {
    example: "Example: coinWays(5, {1, 2, 5}) returns 4.",
    starter: cStarter([["int coinWays(int amount, int coins[], int n)", "How many different ways (order does not matter) coins can make amount?"]], "int coins[] = {1, 2, 5};\nprintf(\"%d\\n\", coinWays(5, coins, 3));", [], ''),
    hint: "ways[0] = 1. Go coin by coin (the outer loop), and for each amount x from the coin up, add ways[x - coin] to ways[x]. Doing coins in the outer loop counts 1+2 and 2+1 only once. Like counting how many ways to fill a piggy bank, one kind of coin at a time.",
  },
  288: {
    example: "Example: lisLength({10, 9, 2, 5, 3, 7, 101, 18}) returns 4 ([2, 3, 7, 101]).",
    starter: cStarter([["int lisLength(int nums[], int n)", "The length of the longest strictly increasing subsequence (items in order, not always neighbours)."]], "int nums[] = {10, 9, 2, 5, 3, 7, 101, 18};\nprintf(\"%d\\n\", lisLength(nums, 8));", [], ''),
    hint: "Let best[i] be the longest increasing run ending at position i: 1 + the biggest best[j] over earlier j with nums[j] < nums[i] (or just 1). The answer is the biggest best[i]. Like climbing a mountain trail, only ever stepping onto higher stones.",
  },
  289: {
    example: "Example: lcs(\"abcde\", \"ace\") returns 3.",
    starter: cStarter([["int lcs(char a[], char b[])", "The length of the longest common subsequence of a and b (letters in order, not always neighbours)."]], "printf(\"%d\\n\", lcs(\"abcde\", \"ace\"));", ["string.h"], ''),
    hint: "A table t[i][j] for the first i letters of a and the first j of b. If a[i - 1] == b[j - 1], t[i][j] = t[i - 1][j - 1] + 1; otherwise the better of t[i - 1][j] and t[i][j - 1]. Row 0 and column 0 are 0. Like comparing two shopping lists to find the longest set of items bought in the same order.",
  },
  290: {
    example: "Example: editDistance(\"horse\", \"ros\") returns 3.",
    starter: cStarter([["int editDistance(char a[], char b[])", "The fewest single-letter inserts, deletes or replacements that turn a into b."]], "printf(\"%d\\n\", editDistance(\"horse\", \"ros\"));", ["string.h"], ''),
    hint: "A table t[i][j] for the first i letters of a and j of b: t[i][0] = i, t[0][j] = j. If the letters match, t[i][j] = t[i - 1][j - 1]; otherwise 1 + the smallest of t[i - 1][j] (delete), t[i][j - 1] (insert) and t[i - 1][j - 1] (replace). Like a spell checker counting how many key presses separate two words.",
  },
  291: {
    example: "Example: knapsack({1, 3, 4, 5}, {1, 4, 5, 7}, 7) returns 9 (the items weighing 3 and 4).",
    starter: cStarter([["int knapsack(int weights[], int weightsSize, int values[], int valuesSize, int capacity)", "Each item can be taken once or not at all. The most value whose total weight fits in capacity."]], "int weights[] = {1, 3, 4, 5};\nint values[] = {1, 4, 5, 7};\nprintf(\"%d\\n\", knapsack(weights, 4, values, 4, 7));", [], ''),
    hint: "best[c] is the most value with capacity c. For each item, go through the capacities from the top down to its weight: best[c] = max(best[c], best[c - weight] + value). Going down keeps each item to one use. Like packing a suitcase with a weight limit, deciding item by item.",
  },
  292: {
    example: "Example: subsetSum({3, 34, 4, 12, 5, 2}, 9) returns true (4 + 5).",
    starter: cStarter([["bool subsetSum(int nums[], int n, int target)", "nums are 0 or more. true if some of them (each used at most once) add up to target."]], "int nums[] = {3, 34, 4, 12, 5, 2};\nprintf(\"%s\\n\", subsetSum(nums, 6, 9) ? \"true\" : \"false\");", [], ''),
    hint: "Keep a bool can[target + 1] (all false), with can[0] = true. For each number x, go through the sums from target down to x: can[s] becomes true if can[s - x] is. At the end, check can[target]. Like collecting all the totals you can pay with the notes in your wallet, one note at a time.",
  },
  293: {
    example: "Example: canPartition({1, 5, 11, 5}) returns true ([1, 5, 5] and [11]).",
    starter: cStarter([["bool canPartition(int nums[], int n)", "true if nums can be split into two groups with equal sums."]], "int nums[] = {1, 5, 11, 5};\nprintf(\"%s\\n\", canPartition(nums, 4) ? \"true\" : \"false\");", [], ''),
    hint: "If the total is odd, it is impossible. Otherwise the question is subset sum with target total / 2. Like sharing a bag of sweets fairly between two friends.",
  },
  294: {
    example: "Example: gridPaths(3, 7) returns 28.",
    starter: cStarter([["int gridPaths(int m, int n)", "A grid of m rows and n columns. How many paths go from the top-left to the bottom-right,\nmoving only right or down? Use a table."]], "printf(\"%d\\n\", gridPaths(3, 7));", [], ''),
    hint: "Make a table int t[m][n] where the first row and the first column are all 1. Every other cell is the cell above plus the cell to the left; the answer is in the bottom-right corner. Like a city map where you write at each corner how many ways lead there.",
  },
  297: {
    example: "Example: numDecodings(\"226\") returns 3 (BZ, VF, BBF).",
    starter: cStarter([["int numDecodings(char s[])", "1 = A, 2 = B, ..., 26 = Z. How many ways can the digits s be read as letters?"]], "printf(\"%d\\n\", numDecodings(\"12\"));", ["string.h"], ''),
    hint: "ways[i] counts the readings of the first i digits; ways[0] = 1. The digit s[i - 1] alone works if it is not '0' (add ways[i - 1]); the two digits s[i - 2] and s[i - 1] work if they make 10 to 26 (add ways[i - 2]). Like reading a secret code where some numbers could be one letter or two.",
  },
  299: {
    example: "Example: maxProduct({2, 3, -2, 4}) returns 6 ([2, 3]).",
    starter: cStarter([["int maxProduct(int nums[], int n)", "The largest product of a run of neighbouring numbers (at least one number)."]], "int nums[] = {2, 3, -2, 4};\nprintf(\"%d\\n\", maxProduct(nums, 4));", [], ''),
    hint: "Keep both the biggest and the smallest product of a run ending here, because a negative number turns the smallest into the biggest. For each number x: new biggest = the max of x, x \u00d7 big and x \u00d7 small; new smallest = the min of the same three (work both out before changing either). Like a see-saw: a big debt flipped by a negative becomes a big win.",
  },
  300: {
    example: "Example: longestPalSubseq(\"bbbab\") returns 4 (\"bbbb\").",
    starter: cStarter([["int longestPalSubseq(char s[])", "The length of the longest subsequence of s (letters in order, not always neighbours) that is a palindrome."]], "printf(\"%d\\n\", longestPalSubseq(\"bbbab\"));", ["string.h"], ''),
    hint: "t[i][j] is the answer for the letters from i to j. If s[i] == s[j], it is t[i + 1][j - 1] + 2; otherwise the better of t[i + 1][j] and t[i][j - 1]. Single letters give 1. Fill it for short pieces first. Like crossing out letters from a word until it reads the same both ways.",
  },
  301: {
    example: "Example: canJump({2, 3, 1, 1, 4}) returns true.",
    starter: cStarter([["bool canJump(int nums[], int n)", "From position i you may jump up to nums[i] places forward. Starting at 0, can you reach the last position?"]], "int nums[] = {2, 3, 1, 1, 4};\nprintf(\"%s\\n\", canJump(nums, 5) ? \"true\" : \"false\");", [], ''),
    hint: "Keep the furthest position you can reach so far. Walk along; if you ever stand past it, you are stuck. Otherwise update it with i + nums[i]. Like crossing a river on stepping stones while tracking the furthest stone in reach.",
  },
  302: {
    example: "Example: minJumps({2, 3, 1, 1, 4}) returns 2 (jump to position 1, then to the end).",
    starter: cStarter([["int minJumps(int nums[], int n)", "The fewest jumps to reach the last position (it can always be reached)."]], "int nums[] = {2, 3, 1, 1, 4};\nprintf(\"%d\\n\", minJumps(nums, 5));", [], ''),
    hint: "Think in rounds: with j jumps you can reach up to some end. While walking through that range, track the furthest place the next jump could reach; when you reach the end of the range, take a jump and that furthest place becomes the new end. Like planning a journey by train: each change of train takes you as far as the best connection allows.",
  },
  303: {
    example: "Example: maxProfitCooldown({1, 2, 3, 0, 2}) returns 3 (buy, sell, rest, buy, sell).",
    starter: cStarter([["int maxProfitCooldown(int prices[], int n)", "Buy and sell as often as you like, holding at most one share; the day after a sale you must rest."]], "int prices[] = {1, 2, 3, 0, 2};\nprintf(\"%d\\n\", maxProfitCooldown(prices, 5));", [], ''),
    hint: "Keep three running amounts for each day: the best if you hold a share, if you just sold today, and if you are resting without a share. Holding = max(holding, resting - price); sold = holding + price; resting = max(resting, sold yesterday). Like a shop that must close for a day after every big sale.",
  },
  304: {
    example: "Example: isMatch(\"aab\", \"c*a*b\") returns true (\"c*\" matches nothing, \"a*\" matches \"aa\").",
    starter: cStarter([["bool isMatch(char s[], char p[])", "true if the pattern p matches the whole of s: \".\" matches any one letter,\n\"x*\" matches zero or more of x (the letter or \".\" before the star)."]], "printf(\"%s\\n\", isMatch(\"aa\", \"a\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "m(i, j) asks whether the rest of s from i matches the rest of p from j. The first letters match if p[j] is '.' or equals s[i]. If a '*' follows, either skip \"x*\" (m(i, j + 2)) or use it once if the first letters match (m(i + 1, j)); otherwise both must match and you go on to m(i + 1, j + 1). Remember answers in a table (0 unknown, 1 yes, 2 no). Like a card game where a wild card can stand for any card, and a star lets a card repeat.",
    forbid: {"names": ["regcomp", "regexec"], "why": "This question asks you to write the matching yourself, without regex.h."},
  },
  305: {
    example: "Example: maxCoins({3, 1, 5, 8}) returns 167.",
    starter: cStarter([["int maxCoins(int nums[], int n)", "Bursting balloon i gives left \u00d7 nums[i] \u00d7 right coins, where left and right are the balloons\nstill next to it (1 past the ends). The most coins from bursting them all."]], "int nums[] = {3, 1, 5, 8};\nprintf(\"%d\\n\", maxCoins(nums, 4));", [], ''),
    hint: "Put a 1 at both ends. Think about which balloon in a range bursts LAST: then its neighbours are the range's outer edges. best(l, r) = the biggest of best(l, k) + a[l] \u00d7 a[k] \u00d7 a[r] + best(k, r) over k between l and r. Fill it for short ranges first. Like planning a demolition from the last building standing backwards.",
  },
  },
  { partial: true },
);
