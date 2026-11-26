// Practice, JavaScript: sorting-greedy-intervals. Tests come from the Python content; reference solutions in tests/practice/js/sorting-greedy-intervals.solutions.ts.
import { fromPython } from './shared';

const NO_SORT = { names: ['sort', 'toSorted'], why: 'This question asks you to do the sorting yourself, without sort().' };
import { SORTING_GREEDY_INTERVALS } from '../python/sorting-greedy-intervals';

export const SORTING_GREEDY_INTERVALS_JS = fromPython(SORTING_GREEDY_INTERVALS, {
  306: {
    example: 'Example: bubbleSort([5, 2, 4, 1]), selectionSort([5, 2, 4, 1]) and insertionSort([5, 2, 4, 1]) all return [1, 2, 4, 5].',
    starter: `function bubbleSort(nums) {
  // Swap neighbours that are in the wrong order, pass after pass. Return the sorted array.
}

function selectionSort(nums) {
  // Pick the smallest of the unsorted part and put it next in line.
}

function insertionSort(nums) {
  // Take each number and slide it left into its place among the sorted ones.
}

console.log(bubbleSort([5, 2, 4, 1]), selectionSort([5, 2, 4, 1]), insertionSort([5, 2, 4, 1]));
`,
    forbid: NO_SORT,
  },
  307: {
    example: 'Example: sortByCounting([2, 0, 2, 1, 1, 0]) returns [0, 0, 1, 1, 2, 2].',
    starter: `function sortByCounting(nums) {
  // nums holds only 0s, 1s and 2s. Count each, then build the sorted array.
}

console.log(sortByCounting([2, 0, 2, 1, 1, 0]));
`,
    forbid: NO_SORT,
  },
  308: {
    example: 'Example: canAttendAll([[0, 30], [5, 10], [15, 20]]) returns false.',
    starter: `function canAttendAll(meetings) {
  // Each meeting is [start, end]. true if no two overlap (one may start when another ends).
}

console.log(canAttendAll([[0, 30], [5, 10], [15, 20]]));
`,
  },
  309: {
    example: 'Example: contentChildren([1, 2, 3], [1, 1]) returns 1.',
    starter: `function contentChildren(greed, cookies) {
  // Child i is happy with a cookie of size >= greed[i]; each child gets at most one cookie.
  // The most children you can make happy.
}

console.log(contentChildren([1, 2, 3], [1, 1]));
`,
  },
  310: {
    example: 'Example: mergeSort([5, 2, 4, 6, 1, 3]) returns [1, 2, 3, 4, 5, 6].',
    starter: `function mergeSort(nums) {
  // Split in half, sort each half the same way, then merge them. Return a sorted array.
}

console.log(mergeSort([5, 2, 4, 6, 1, 3]));
`,
    hint: "An array of 0 or 1 numbers is sorted. Otherwise sort nums.slice(0, mid) and nums.slice(mid) the same way, then merge: compare the fronts of the two sorted halves and take the smaller each time, then add what is left. Like sorting a big pile of exam papers by splitting it among friends and merging their sorted piles.",
    forbid: NO_SORT,
  },
  311: {
    example: 'Example: quickSort([5, 2, 4, 6, 1, 3]) returns [1, 2, 3, 4, 5, 6].',
    starter: `function quickSort(nums) {
  // Pick a pivot, put smaller numbers on its left and bigger ones on its right,
  // and sort both sides the same way. Return a sorted array.
}

console.log(quickSort([5, 2, 4, 6, 1, 3]));
`,
    forbid: NO_SORT,
  },
  312: {
    example: 'Example: kthLargest([3, 2, 1, 5, 6, 4], 2) returns 5.',
    starter: `function kthLargest(nums, k) {
  // The kth largest number (k = 1 is the largest; repeated numbers count separately).
}

console.log(kthLargest([3, 2, 1, 5, 6, 4], 2));
`,
    hint: "Sort a copy from biggest to smallest (nums.slice().sort((a, b) => b - a)) and take position k - 1. (Quickselect, or a min-heap holding the k biggest numbers, avoids sorting everything.) Like a top-k leaderboard where you only care about the first k places.",
  },
  313: {
    example: 'Example: mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]) returns [[1, 6], [8, 10], [15, 18]].',
    starter: `function mergeIntervals(intervals) {
  // Merge all intervals that overlap (touching counts), sorted by start.
}

console.log(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]));
`,
    hint: "Sort by start (intervals.slice().sort((a, b) => a[0] - b[0])). Go through them: if an interval starts no later than the end of the last merged one, stretch that end to the larger of the two ends; otherwise start a new merged interval. Like joining strips of tape on a ruler that overlap.",
  },
  314: {
    example: 'Example: insertInterval([[1, 3], [6, 9]], [2, 5]) returns [[1, 5], [6, 9]].',
    starter: `function insertInterval(intervals, interval) {
  // intervals are sorted and do not overlap. Add interval, merging where needed; keep them sorted.
}

console.log(insertInterval([[1, 3], [6, 9]], [2, 5]));
`,
    hint: "Three parts: copy the intervals that end before the new interval starts; merge every interval that overlaps it into it (smallest start, largest end); then add it and copy the rest. Like slotting a new booking into a calendar and joining it with any bookings it touches.",
  },
  315: {
    example: 'Example: eraseOverlap([[1, 2], [2, 3], [3, 4], [1, 3]]) returns 1 (remove [1, 3]).',
    starter: `function eraseOverlap(intervals) {
  // The fewest intervals to remove so the rest do not overlap (touching is fine).
}

console.log(eraseOverlap([[1, 2], [2, 3], [3, 4], [1, 3]]));
`,
  },
  316: {
    example: 'Example: minMeetingRooms([[0, 30], [5, 10], [15, 20]]) returns 2.',
    starter: `function minMeetingRooms(meetings) {
  // Each meeting is [start, end]. The fewest rooms so no two meetings share a room at the same time
  // (a room is free again the moment a meeting ends).
}

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]]));
`,
  },
  317: {
    example: 'Example: minPlatforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]) returns 3.',
    starter: `function minPlatforms(arrivals, departures) {
  // Train i arrives at arrivals[i] and leaves at departures[i] (times like 930 for 9:30).
  // A train arriving at the very minute another leaves still needs its own platform.
  // The fewest platforms the station needs.
}

console.log(minPlatforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]));
`,
  },
  318: {
    example: 'Example: canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]) returns 3.',
    starter: `function canCompleteCircuit(gas, cost) {
  // Station i gives gas[i]; driving from i to i + 1 (wrapping round) uses cost[i].
  // The station to start from to drive all the way round with an empty tank at first, or -1.
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]));
`,
  },
  319: {
    example: 'Example: leastInterval(["A", "A", "A", "B", "B", "B"], 2) returns 8 (A B idle A B idle A B).',
    starter: `function leastInterval(tasks, n) {
  // Each task takes one time unit. The same task needs at least n units between two runs
  // (the CPU may stay idle). The fewest units to finish everything.
}

console.log(leastInterval(["A", "A", "A", "B", "B", "B"], 2));
`,
    hint: "Let m be the most times any task appears, and k how many tasks appear m times. The busiest task makes m - 1 blocks of length n + 1, plus a last row of k: (m - 1) \u00d7 (n + 1) + k. If there are more tasks than that, no idling is needed: the answer is tasks.length. Like a coach planning laps so the same runner always gets a rest.",
  },
  320: {
    example: 'Example: largestNumber([3, 30, 34, 5, 9]) returns "9534330".',
    starter: `function largestNumber(nums) {
  // Arrange the numbers (0 or more) side by side to make the largest number. Return it as text.
}

console.log(largestNumber([3, 30, 34, 5, 9]));
`,
    hint: "Turn the numbers into text and sort with a rule: put a before b when a + b is bigger than b + a (texts.sort((a, b) => (b + a > a + b ? 1 : b + a < a + b ? -1 : 0))). Join them; if the result starts with \"0\", the whole number is \"0\". Like arranging number cards on a table so the longest number reads as big as possible.",
  },
});
