// Practice, JavaScript: binary-search. Tests come from the Python content; reference solutions in tests/practice/js/binary-search.solutions.ts.
import { fromPython } from './shared';

const NO_ROOT = { names: ['sqrt', 'cbrt', 'pow', 'hypot'], ops: ['**', '**='], why: 'This question asks you to find it with binary search, without Math.sqrt(), ** or Math.pow().' };
const NO_SEARCH = { names: ['indexOf', 'lastIndexOf', 'includes', 'findIndex', 'findLastIndex'], why: 'This question asks you to write the binary search yourself, without indexOf() or findIndex().' };
import { BINARY_SEARCH } from '../python/binary-search';

export const BINARY_SEARCH_JS = fromPython(BINARY_SEARCH, {
  171: {
    example: 'Example: binarySearch([-1, 0, 3, 5, 9, 12], 9) returns 4.',
    starter: `function binarySearch(nums, target) {
  // nums is sorted. The position of target, or -1, using binary search.
}

console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9));
`,
    hint: "Keep low and high. Look at mid = Math.floor((low + high) / 2): equal, done; smaller than target, search right of mid (low = mid + 1); bigger, search left (high = mid - 1). Stop when low > high. Like finding a word in a dictionary by opening it in the middle.",
    forbid: NO_SEARCH,
  },
  172: {
    example: 'Example: searchInsert([1, 3, 5, 6], 2) returns 1.',
    starter: `function searchInsert(nums, target) {
  // nums is sorted. The position of target, or where it would go to keep nums sorted.
}

console.log(searchInsert([1, 3, 5, 6], 2));
`,
    hint: "Binary search with low = 0 and high = nums.length: if nums[mid] < target, low = mid + 1, otherwise high = mid. When they meet, low is the answer. Like finding where a new book goes on a sorted shelf.",
    forbid: NO_SEARCH,
  },
  173: {
    example: 'Example: countOccurrences([1, 2, 2, 2, 3], 2) returns 3.',
    starter: `function countOccurrences(nums, target) {
  // nums is sorted. How many times target appears, in O(log n) (two binary searches).
}

console.log(countOccurrences([1, 2, 2, 2, 3], 2));
`,
    forbid: { names: ['filter', 'reduce', 'indexOf', 'lastIndexOf', 'findIndex', 'findLastIndex'], why: 'This question asks you to use binary search, not filter(), reduce() or indexOf().' },
  },
  174: {
    example: 'Example: floorSqrt(8) returns 2.',
    starter: `function floorSqrt(n) {
  // The largest whole r with r * r <= n (n is 0 or more), using binary search.
}

console.log(floorSqrt(8));
`,
    forbid: NO_ROOT,
  },
  175: {
    example: 'Example: isPerfectSquare(16) returns true, isPerfectSquare(14) returns false.',
    starter: `function isPerfectSquare(n) {
  // true if n (1 or more) is some whole number times itself. Without Math.sqrt().
}

console.log(isPerfectSquare(16));
`,
    forbid: NO_ROOT,
  },
  176: {
    example: 'Example: guessNumber(10, guess) returns 6 when the hidden number is 6.',
    starter: `function guessNumber(n, guess) {
  // A number from 1 to n is hidden. guess(x) returns 0 if x is right,
  // -1 if the hidden number is lower than x, and 1 if it is higher. Find it.
}

function guess(x) {
  // A stand-in for trying it out: the hidden number here is 6.
  return x === 6 ? 0 : 6 < x ? -1 : 1;
}

console.log(guessNumber(10, guess));
`,
  },
  177: {
    example: 'Example: firstBadVersion(5, isBad) returns 4 when versions 4 and 5 are bad.',
    starter: `function firstBadVersion(n, is_bad) {
  // Versions 1 to n; from some version on, every version is bad.
  // is_bad(v) says whether version v is bad. Return the first bad one, with few calls.
}

function isBad(v) {
  // A stand-in for trying it out: versions 4 and later are bad.
  return v >= 4;
}

console.log(firstBadVersion(5, isBad));
`,
    hint: "Binary search: if isBad(mid), the first bad version is mid or earlier (high = mid); otherwise it is after mid (low = mid + 1). When low === high, that is the answer. Like finding the day milk went off by checking the middle of the week first.",
  },
  178: {
    example: 'Example: nextLetter(["c", "f", "j"], "c") returns "f"; with none bigger, it wraps to the first letter.',
    starter: `function nextLetter(letters, target) {
  // letters is sorted. The smallest letter bigger than target; if there is none, letters[0].
}

console.log(nextLetter(["c", "f", "j"], "c"));
`,
  },
  179: {
    example: 'Example: searchRange([5, 7, 7, 8, 8, 10], 8) returns [3, 4].',
    starter: `function searchRange(nums, target) {
  // nums is sorted. [first position, last position] of target, or [-1, -1], in O(log n).
}

console.log(searchRange([5, 7, 7, 8, 8, 10], 8));
`,
    hint: "Two binary searches: one keeps going left after a match (to find the first), one keeps going right (to find the last). Like finding the first and the last page that mention a word in a sorted index.",
  },
  180: {
    example: 'Example: findPeak([1, 2, 3, 1]) returns 2 (any peak is fine).',
    starter: `function findPeak(nums) {
  // A position whose value is bigger than its neighbours (outside the array counts as -infinity).
  // Neighbouring values are never equal. Any peak is fine; aim for O(log n).
}

console.log(findPeak([1, 2, 3, 1]));
`,
  },
  181: {
    example: 'Example: searchRotated([4, 5, 6, 7, 0, 1, 2], 0) returns 4.',
    starter: `function searchRotated(nums, target) {
  // nums was sorted (all different), then turned around some point. Position of target, or -1, in O(log n).
}

console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0));
`,
    hint: "At every step one half (low..mid or mid..high) is still sorted. Check whether target lies inside that sorted half by its ends; if yes, search there, otherwise search the other half. Like a clock face: from any point, at least one direction runs in order.",
  },
  182: {
    example: 'Example: findMinRotated([3, 4, 5, 1, 2]) returns 1.',
    starter: `function findMinRotated(nums) {
  // nums was sorted (all different), then turned around some point. Its smallest value, in O(log n).
}

console.log(findMinRotated([3, 4, 5, 1, 2]));
`,
    forbid: { names: ['min', 'sort', 'toSorted'], why: 'This question asks you to find it with binary search, without Math.min() or sorting.' },
  },
  183: {
    example: 'Example: searchMatrix(matrix, 5) returns true when every row and column of matrix is sorted.',
    starter: `function searchMatrix(matrix, target) {
  // Every row is sorted left to right and every column top to bottom. true if target is there.
}

console.log(searchMatrix([[1, 4], [2, 5]], 5));
`,
  },
  184: {
    example: 'Example: singleInSorted([1, 1, 2, 3, 3, 4, 4, 8, 8]) returns 2.',
    starter: `function singleInSorted(nums) {
  // nums is sorted; every value appears twice except one. Find it in O(log n).
}

console.log(singleInSorted([1, 1, 2, 3, 3, 4, 4, 8, 8]));
`,
  },
  185: {
    example: 'Example: minEatingSpeed([3, 6, 7, 11], 8) returns 4.',
    starter: `function minEatingSpeed(piles, h) {
  // Eat at k bananas an hour (one pile at a time; a smaller pile still takes the whole hour).
  // The smallest k that finishes all piles within h hours.
}

console.log(minEatingSpeed([3, 6, 7, 11], 8));
`,
    hint: "The answer is between 1 and the biggest pile (Math.max(...piles)). For a speed k, the hours are the sum of Math.ceil(pile / k). Binary search the smallest k whose hours are <= h. Like finding the slowest pace that still gets you to the station on time.",
  },
  186: {
    example: 'Example: shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) returns 15.',
    starter: `function shipWithinDays(weights, days) {
  // Packages go in order, one ship load per day. The smallest ship capacity that ships them all in days.
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5));
`,
  },
  187: {
    example: 'Example: kthSmallestMatrix([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8) returns 13.',
    starter: `function kthSmallestMatrix(matrix, k) {
  // Rows and columns are sorted. The kth smallest value (counting repeats).
}

console.log(kthSmallestMatrix([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8));
`,
  },
  188: {
    example: 'Example: searchUnknown(reader, 9) returns 4 for the hidden array [-1, 0, 3, 5, 9, 12].',
    starter: `function searchUnknown(reader, target) {
  // A sorted array of unknown length: reader.get(i) gives item i, or 2147483647 past the end.
  // The position of target, or -1.
}

class Reader {
  // A stand-in for trying it out.
  constructor(data) {
    this.data = data;
  }

  get(i) {
    return i >= 0 && i < this.data.length ? this.data[i] : 2147483647;
  }
}

console.log(searchUnknown(new Reader([-1, 0, 3, 5, 9, 12]), 9));
`,
    hint: "First find a range: start with high = 1 and double it while reader.get(high) < target. Then binary search between Math.floor(high / 2) and high (values past the end read as huge, so they count as \"too big\"). Like searching a street with no end sign: jump ahead in bigger steps, then look closely.",
  },
  189: {
    example: 'Example: splitArray([7, 2, 5, 10, 8], 2) returns 18 ([7, 2, 5] and [10, 8]).',
    starter: `function splitArray(nums, k) {
  // Cut nums into k non-empty runs of neighbours. Make the largest run sum as small as possible.
}

console.log(splitArray([7, 2, 5, 10, 8], 2));
`,
  },
  190: {
    example: 'Example: medianSorted([1, 2], [3, 4]) returns 2.5.',
    starter: `function medianSorted(a, b) {
  // a and b are sorted. The median of all their numbers together, in O(log(m + n)).
}

console.log(medianSorted([1, 2], [3, 4]));
`,
    hint: "Binary search how many items to take from the shorter array (i), taking the rest of the left half from the other (j). The split is right when the biggest left item of each array is <= the smallest right item of the other (use -Infinity and Infinity past the ends); then the median comes from those four edge values. Like cutting two sorted decks so that every card on the left is smaller than every card on the right.",
    forbid: { names: ['sort', 'toSorted'], why: 'This question asks for O(log(m + n)) without merging and sorting.' },
  },
});
