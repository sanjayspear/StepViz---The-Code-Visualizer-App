// Practice, C: the questions of two-pointers that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/two-pointers.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q111, Q112, Q114, Q121, Q123.
import { fromPython } from '../javascript/shared';
import { TWO_POINTERS } from '../python/two-pointers';
import { cStarter, PRINT_INTS } from './shared';

export const TWO_POINTERS_C = fromPython(
  TWO_POINTERS,
  {
  113: {
    example: "Example: removeElement({3, 2, 2, 3}, 3) returns 2, and the array starts [2, 2].",
    starter: cStarter([["int removeElement(int nums[], int n, int val)", "Move every item that is not val to the front of nums (any order), in place,\nand return how many there are."]], "int nums[] = {3, 2, 2, 3};\nprintf(\"%d\\n\", removeElement(nums, 4, 3));", [], ''),
    hint: "Keep a write position k. For every item that is not val, copy it to nums[k] and add 1 to k. Return k. Like a bouncer letting through everyone except people wearing one colour, filling the front seats in turn.",
  },
  115: {
    example: "Example: mergeInto(a, 3, {2, 5, 6}, 3) with a = {1, 2, 3, 0, 0, 0} changes a to [1, 2, 2, 3, 5, 6].",
    starter: cStarter([["void mergeInto(int a[], int m, int b[], int n)", "a has m sorted numbers followed by n spare places; b has n sorted numbers.\nMerge b into a so a is sorted, changing a itself, without sorting."]], "int a[] = {1, 2, 3, 0, 0, 0};\nint b[] = {2, 5, 6};\nmergeInto(a, 3, b, 3);\nprintArray(a, 6);", [], PRINT_INTS),
    hint: "Fill a from the back. Compare the last real number of a with the last of b, write the bigger one at position m + n - 1, and move inwards; at the end copy whatever is left of b. Working from the back never overwrites a number you still need. Like stacking two piles of plates by size, largest first, at the far end of the shelf.",
    forbid: {"names": ["qsort"], "why": "This question asks you to do it without sorting."},
  },
  116: {
    example: "Example: negativesFirst(nums) with nums = {1, -2, 3, -4} changes nums to something like [-2, -4, 1, 3].",
    starter: cStarter([["void negativesFirst(int nums[], int n)", "Rearrange nums itself so every negative number comes before every other number.\n(Any order inside the two groups is fine.)"]], "int nums[] = {1, -2, 3, -4, -5};\nnegativesFirst(nums, 5);\nprintArray(nums, 5);", [], PRINT_INTS),
    hint: "Keep a position k for the next negative. Go through the list; whenever nums[i] is negative, swap it with nums[k] and add 1 to k. Like sorting laundry: every dark item is thrown into the left basket as you go.",
  },
  117: {
    example: "Example: backspaceCompare(\"ab#c\", \"ad#c\") returns true (both are \"ac\").",
    starter: cStarter([["bool backspaceCompare(char s[], char t[])", "In both texts, \"#\" deletes the letter before it. true if the results are equal."]], "printf(\"%s\\n\", backspaceCompare(\"ab#c\", \"ad#c\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Build what each text really says in a char array used as a stack: copy each letter to the end, and for each \"#\" step the end back by one if there is anything to remove. End both with '\\0' and compare them with strcmp. Like typing on a keyboard: the backspace key removes the last letter you typed.",
  },
  118: {
    example: "Example: palindromeAfterOneDelete(\"abca\") returns true (delete \"c\" or \"b\").",
    starter: cStarter([["bool palindromeAfterOneDelete(char s[])", "true if s is a palindrome, or becomes one after deleting at most one character."]], "printf(\"%s\\n\", palindromeAfterOneDelete(\"aba\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Walk two pointers inwards. At the first mismatch you get one deletion: the answer is yes if the rest is a palindrome after skipping either the left letter or the right letter. Like proofreading a mirrored word where you may cross out one wrong letter.",
  },
  119: {
    example: "Example: hasPairWithDifference({1, 3, 5, 8}, 3) returns true (8 - 5).",
    starter: cStarter([["bool hasPairWithDifference(int nums[], int n, int k)", "nums is sorted, k is 0 or more. true if two different positions hold values that differ by k."]], "int nums[] = {1, 3, 5, 8};\nprintf(\"%s\\n\", hasPairWithDifference(nums, 4, 3) ? \"true\" : \"false\");", [], ''),
    hint: "Two pointers that both move right: i and j = i + 1. If nums[j] - nums[i] is too small, move j on; too big, move i on (keep j ahead of i); equal, found it. Like two hikers on a trail keeping exactly k metres apart.",
  },
  120: {
    example: "Example: maxArea({1, 8, 6, 2, 5, 4, 8, 3, 7}) returns 49.",
    starter: cStarter([["int maxArea(int height[], int n)", "Two lines and the ground make a container. The most water any two lines can hold."]], "int height[] = {1, 8, 6, 2, 5, 4, 8, 3, 7};\nprintf(\"%d\\n\", maxArea(height, 9));", [], ''),
    hint: "Start with the widest pair (both ends). The water is width \u00d7 the shorter line. Moving the taller line inwards can never help, so move the shorter one, and keep the best area. Like widening a fence: the shorter post decides how high the water can rise.",
  },
  122: {
    example: "Example: threeSumClosest({-1, 2, 1, -4}, 1) returns 2 (-1 + 2 + 1).",
    starter: cStarter([["int threeSumClosest(int nums[], int n, int target)", "The sum of three numbers (different positions) that is closest to target."]], "int nums[] = {-1, 2, 1, -4};\nprintf(\"%d\\n\", threeSumClosest(nums, 4, 1));", [], ''),
    hint: "Sort first (write a short insertion sort: C has no sort() built in). Then fix the first number and move two pointers through the rest like in three-sum; after each sum, keep it if it is closer to target than the best so far, and move the pointer that brings the sum towards target. Like tuning a radio: nudge the dial towards the clearest signal.",
  },
  124: {
    example: "Example: sortColors(nums) with nums = {2, 0, 2, 1, 1, 0} changes nums to [0, 0, 1, 1, 2, 2].",
    starter: cStarter([["void sortColors(int nums[], int n)", "nums holds 0s, 1s and 2s. Sort it in one pass, in place, without sort()."]], "int nums[] = {2, 0, 2, 1, 1, 0};\nsortColors(nums, 6);\nprintArray(nums, 6);", [], PRINT_INTS),
    hint: "Dutch flag: three pointers low, mid, high. A 0 at mid swaps to low (both move on), a 1 just moves mid on, a 2 swaps to high (high moves in, mid stays to check what arrived). Like sorting red, white and blue marbles into three heaps in a single sweep.",
    forbid: {"names": ["qsort"], "why": "This question asks you to do it without sorting."},
  },
  125: {
    example: "Example: removeExtraDuplicates({1, 1, 1, 2, 2, 3}) returns 5, and the array starts [1, 1, 2, 2, 3].",
    starter: cStarter([["int removeExtraDuplicates(int nums[], int n)", "nums is sorted. Keep each value at most twice at the front, in place; return how many are kept."]], "int nums[] = {1, 1, 1, 2, 2, 3};\nprintf(\"%d\\n\", removeExtraDuplicates(nums, 6));", [], ''),
    hint: "Keep a write position k. Copy nums[i] to nums[k] unless it equals nums[k - 2] (then the value is already in twice). Like a shop rule of \"at most two per customer\" applied as the queue moves.",
  },
  126: {
    example: "Example: countPairsBelow({-1, 1, 1, 2, 3}, 2) returns 3.",
    starter: cStarter([["int countPairsBelow(int nums[], int n, int target)", "nums is sorted. How many pairs of positions i < j have nums[i] + nums[j] < target?"]], "int nums[] = {-1, 1, 1, 2, 3};\nprintf(\"%d\\n\", countPairsBelow(nums, 5, 2));", [], ''),
    hint: "Pointers at both ends. If nums[left] + nums[right] < target, then left pairs with every position from left + 1 to right: add right - left and move left on. Otherwise move right in. Like matching the lightest person with the heaviest who still fits in the lift.",
  },
  127: {
    example: "Example: numBoats({3, 2, 2, 1}, 3) returns 3.",
    starter: cStarter([["int numBoats(int people[], int n, int limit)", "Each boat holds at most two people whose weights add up to at most limit.\nThe fewest boats to carry everyone (nobody is heavier than limit)."]], "int people[] = {1, 2};\nprintf(\"%d\\n\", numBoats(people, 2, 3));", [], ''),
    hint: "Sort first (write a short insertion sort: C has no sort() built in). The heaviest person always takes a boat; if the lightest person fits with them, they go together. Move the pointers and count the boats. Like pairing the heaviest backpack with the lightest one so no trip is wasted.",
  },
  128: {
    example: "Example: shortestUnsorted({2, 6, 4, 8, 10, 9, 15}) returns 5 (sorting 6, 4, 8, 10, 9 fixes it).",
    starter: cStarter([["int shortestUnsorted(int nums[], int n)", "The length of the shortest run that, if sorted, makes the whole array sorted (0 if it already is)."]], "int nums[] = {2, 6, 4, 8, 10, 9, 15};\nprintf(\"%d\\n\", shortestUnsorted(nums, 7));", [], ''),
    hint: "From the left, keep the biggest value so far: the last position where a number is smaller than it is the run's right end. From the right, keep the smallest so far: the last position (going left) bigger than it is the left end. Like finding the stretch of a bookshelf where books are out of order.",
  },
  129: {
    example: "Example: smallestDifference({1, 2, 3, 11, 15}, {8, 19, 23, 127, 235}) returns 3 (11 and 8).",
    starter: cStarter([["int smallestDifference(int a[], int aSize, int b[], int bSize)", "a and b are sorted. The smallest |x - y| with x from a and y from b."]], "int a[] = {1, 2, 3, 11, 15};\nint b[] = {8, 19, 23, 127, 235};\nprintf(\"%d\\n\", smallestDifference(a, 5, b, 5));", [], ''),
    hint: "One pointer in each list. Look at the difference, keep the best, then move the pointer at the smaller value (that is the only way to get closer). Like two people walking towards each other on parallel streets, checking how close they get.",
  },
  130: {
    example: "Example: triangleCount({2, 2, 3, 4}) returns 3.",
    starter: cStarter([["int triangleCount(int nums[], int n)", "How many groups of three positions make a triangle (any two sides add up to more than the third)?"]], "int nums[] = {2, 2, 3, 4};\nprintf(\"%d\\n\", triangleCount(nums, 4));", [], ''),
    hint: "Sort first (write a short insertion sort: C has no sort() built in). For each largest side c (from the right), use two pointers on the smaller ones: if nums[left] + nums[right] > c, every left from there to right works (add right - left) and move right in; otherwise move left on. Like checking which pairs of sticks can reach across a gap of length c.",
  },
  },
  { partial: true },
);
