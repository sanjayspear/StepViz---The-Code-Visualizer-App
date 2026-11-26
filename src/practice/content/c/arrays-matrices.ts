// Practice, C: the questions of arrays-matrices that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/arrays-matrices.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q56, Q66, Q67, Q68, Q69, Q74, Q75, Q76, Q77, Q78, Q79, Q80, Q81.
import { fromPython, jsTests } from '../javascript/shared';
import { nullTo } from '../cpp/shared';
import { ARRAYS_MATRICES } from '../python/arrays-matrices';
import { cStarter, PRINT_INTS } from './shared';

export const ARRAYS_MATRICES_C = fromPython(
  ARRAYS_MATRICES,
  {
  57: {
    example: "Example: secondLargest({3, 1, 4, 1, 5}) returns 4; with no second value, -1.",
    starter: cStarter([["int secondLargest(int nums[], int n)", "The second largest different value, or -1 if there is none (the numbers are all positive)."]], "int nums[] = {3, 1, 4, 1, 5};\nprintf(\"%d\\n\", secondLargest(nums, 5));", [], ''),
    hint: "Keep two values, first and second (start them at -1, which no positive number can be). For each number bigger than first, move first down to second; for a number between them (and not equal to first), it becomes second. Like a podium: a new winner pushes the old winner to second place.",
    tests: nullTo(jsTests(ARRAYS_MATRICES.find((c) => c.id === 57)!.tests), -1),
  },
  58: {
    example: "Example: after reverseInPlace(nums) with nums = {1, 2, 3}, nums is [3, 2, 1].",
    starter: cStarter([["void reverseInPlace(int nums[], int n)", "Reverse the array itself (do not make a new one). Return nothing."]], "int nums[] = {1, 2, 3};\nreverseInPlace(nums, 3);\nprintArray(nums, 3);", [], PRINT_INTS),
    hint: "Two pointers: i at the start and j at the end. Swap nums[i] and nums[j], move i right and j left, and stop when they meet. Like two people at both ends of a bookshelf swapping books as they walk towards each other.",
    forbid: null,
  },
  59: {
    example: "Example: isSorted({1, 2, 2, 3}) returns true.",
    starter: cStarter([["bool isSorted(int nums[], int n)", "true if every number is at least the one before it."]], "int nums[] = {1, 2, 2, 3};\nprintf(\"%s\\n\", isSorted(nums, 4) ? \"true\" : \"false\");", [], ''),
    hint: "Look at each neighbour pair nums[i - 1], nums[i]; if any pair goes down, the array is not sorted. Like checking that a row of steps never goes downhill.",
  },
  60: {
    example: "Example: removeDuplicatesSorted({1, 1, 2}) returns 2 and the array starts [1, 2].",
    starter: cStarter([["int removeDuplicatesSorted(int nums[], int n)", "nums is sorted. Move each different value to the front, in place,\nand return how many different values there are."]], "int nums[] = {1, 1, 2};\nprintf(\"%d\\n\", removeDuplicatesSorted(nums, 3));", [], ''),
    hint: "Keep a write position k (start at 1 if the list is not empty). For each later item, if it differs from nums[k - 1], copy it to nums[k] and add 1 to k. Like packing a suitcase: you only put in an item if it is different from the last one you packed.",
  },
  61: {
    example: "Example: after moveZeros(nums) with nums = {0, 1, 0, 3, 12}, nums is [1, 3, 12, 0, 0].",
    starter: cStarter([["void moveZeros(int nums[], int n)", "Move every 0 to the end, keeping the order of the other numbers. Change nums itself."]], "int nums[] = {0, 1, 0, 3, 12};\nmoveZeros(nums, 5);\nprintArray(nums, 5);", [], PRINT_INTS),
    hint: "Keep a write position w. Copy every non-zero number to nums[w] and add 1 to w; afterwards fill the rest of the array from w with zeros. Like moving the people in a queue forward and putting the empty chairs at the back.",
  },
  62: {
    example: "Example: after rotateRight(nums, 3) with nums = {1, 2, 3, 4, 5, 6, 7}, nums is [5, 6, 7, 1, 2, 3, 4].",
    starter: cStarter([["void rotateRight(int nums[], int n, int k)", "Move every item k places to the right, wrapping around. Change nums itself."]], "int nums[] = {1, 2, 3, 4, 5, 6, 7};\nrotateRight(nums, 7, 3);\nprintArray(nums, 7);", [], PRINT_INTS),
    hint: "First use k = k % n (rotating by the length changes nothing). Then reverse the whole array, reverse the first k items, and reverse the rest, each with two positions swapping inwards. Like a round table: everyone moves k seats to the right.",
  },
  63: {
    example: "Example: missingNumber({3, 0, 1}) returns 2.",
    starter: cStarter([["int missingNumber(int nums[], int n)", "nums holds all the numbers 0 to n except one. Which one is missing?"]], "int nums[] = {3, 0, 1};\nprintf(\"%d\\n\", missingNumber(nums, 3));", [], ''),
    hint: "The numbers 0 to n add up to n * (n + 1) / 2. Subtract the sum of nums: what is left is the missing one. Like counting the eggs in a full box and seeing how many are gone.",
  },
  64: {
    example: "Example: singleNumber({4, 1, 2, 1, 2}) returns 4.",
    starter: cStarter([["int singleNumber(int nums[], int n)", "Every number appears twice except one. Return that one."]], "int nums[] = {2, 2, 1};\nprintf(\"%d\\n\", singleNumber(nums, 3));", [], ''),
    hint: "x ^ x is 0 and x ^ 0 is x, so XOR all the numbers together: the pairs cancel out and only the single one is left. Like a dance where partners pair up and leave the floor: the one without a partner stays.",
  },
  65: {
    example: "Example: findDuplicate({1, 3, 4, 2, 2}) returns 2.",
    starter: cStarter([["int findDuplicate(int nums[], int n)", "n + 1 numbers, each from 1 to n: one value appears more than once. Return it."]], "int nums[] = {1, 3, 4, 2, 2};\nprintf(\"%d\\n\", findDuplicate(nums, 5));", [], ''),
    hint: "Every value is from 1 to n, so keep a bool array seen[n + 1] (all false at first); the first number already marked is the duplicate. (Without extra space: treat each value as a pointer to a position and find where the \"cycle\" starts.) Like spotting the second person to arrive with the same ticket number.",
  },
  70: {
    example: "Example: majorityElement({2, 2, 1, 1, 1, 2, 2}) returns 2.",
    starter: cStarter([["int majorityElement(int nums[], int n)", "The value that appears more than half the time (there always is one)."]], "int nums[] = {3, 2, 3};\nprintf(\"%d\\n\", majorityElement(nums, 3));", [], ''),
    hint: "Boyer-Moore voting: keep a candidate and a count. Same value: count + 1; different: count - 1; when the count is 0, take the next value as the new candidate. The majority survives. Like a tug of war where the bigger team always ends up holding the rope.",
  },
  71: {
    example: "Example: maxProfit({7, 1, 5, 3, 6, 4}) returns 5 (buy at 1, sell at 6).",
    starter: cStarter([["int maxProfit(int prices[], int n)", "Buy on one day and sell on a later day. The biggest profit (0 if none)."]], "int prices[] = {7, 1, 5, 3, 6, 4};\nprintf(\"%d\\n\", maxProfit(prices, 6));", [], ''),
    hint: "Walk through the days remembering the cheapest price so far; each day, selling today would earn price - cheapest, so keep the best of those. Like remembering the lowest price you have seen for a game while waiting for the best day to resell it.",
  },
  72: {
    example: "Example: maxProfitMany({7, 1, 5, 3, 6, 4}) returns 7 (buy 1 sell 5, buy 3 sell 6).",
    starter: cStarter([["int maxProfitMany(int prices[], int n)", "Buy and sell as often as you like (one share at a time). The biggest total profit."]], "int prices[] = {7, 1, 5, 3, 6, 4};\nprintf(\"%d\\n\", maxProfitMany(prices, 6));", [], ''),
    hint: "Every time tomorrow's price is higher than today's, that rise is profit you can take: add up all the day-to-day increases. Like collecting every uphill stretch on a hike.",
  },
  73: {
    example: "Example: maxSubarray({-2, 1, -3, 4, -1, 2, 1, -5, 4}) returns 6 (4, -1, 2, 1).",
    starter: cStarter([["int maxSubarray(int nums[], int n)", "The largest sum of a run of neighbouring numbers (at least one number)."]], "int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\nprintf(\"%d\\n\", maxSubarray(nums, 9));", [], ''),
    hint: "Kadane's idea: keep the best sum of a run that ends here: either the current number alone, or the previous run plus it (whichever is bigger; C has no max(), so compare with if); keep the best ever. Like a runner deciding at each mile whether to keep going or restart fresh.",
  },
  82: {
    example: "Example: pivotIndex({1, 7, 3, 6, 5, 6}) returns 3 (1 + 7 + 3 = 5 + 6).",
    starter: cStarter([["int pivotIndex(int nums[], int n)", "The first position where the sum to its left equals the sum to its right, or -1."]], "int nums[] = {1, 7, 3, 6, 5, 6};\nprintf(\"%d\\n\", pivotIndex(nums, 6));", [], ''),
    hint: "Compute the total once. Walk through the list keeping the sum to the left; the sum to the right of i is total - left - nums[i]. Return the first i where they are equal. Like balancing a see-saw: find the spot where both sides weigh the same.",
  },
  83: {
    example: "Example: nextPermutation(nums) with nums = {1, 2, 3} changes nums to [1, 3, 2].",
    starter: cStarter([["void nextPermutation(int nums[], int n)", "Change nums to the next ordering in dictionary order (after the last one comes the first, sorted)."]], "int nums[] = {1, 2, 3};\nnextPermutation(nums, 3);\nprintArray(nums, 3);", [], PRINT_INTS),
    hint: "From the right, find the first i with nums[i] < nums[i + 1]. If there is one, swap nums[i] with the smallest bigger number to its right (the last j from the right with nums[j] > nums[i]). Then reverse everything after i. Like an odometer: the rightmost digit that can still go up does, and everything after it resets to the lowest order.",
  },
  84: {
    example: "Example: longestConsecutive({100, 4, 200, 1, 3, 2}) returns 4 (1, 2, 3, 4).",
    starter: cStarter([["int longestConsecutive(int nums[], int n)", "The length of the longest run of consecutive numbers (in any order in the array)."]], "int nums[] = {100, 4, 200, 1, 3, 2};\nprintf(\"%d\\n\", longestConsecutive(nums, 6));", [], ''),
    hint: "C has no built-in set, so sort a copy first (a simple insertion sort is fine here). Then walk the sorted copy: a number one more than the one before makes the run longer, the same number changes nothing, anything else starts a new run. Like lining up house numbers on a street and looking for the longest unbroken stretch.",
  },
  85: {
    example: "Example: trap({0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}) returns 6.",
    starter: cStarter([["int trap(int height[], int n)", "Bars of width 1 with these heights: how much rain water stays between them?"]], "int height[] = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};\nprintf(\"%d\\n\", trap(height, 12));", [], ''),
    hint: "Water above a bar reaches the lower of the tallest bar on its left and the tallest bar on its right; it holds that level minus its own height. Compute the tallest-to-the-left and tallest-to-the-right for every bar (two passes), then add up. Like puddles between walls: each puddle is only as deep as its lower wall.",
  },
  },
  { partial: true },
);
