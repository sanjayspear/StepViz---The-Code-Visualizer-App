// Practice, Java: Sorting, greedy & intervals (Q306-Q320). Tests come from the Python content;
// reference solutions in tests/practice/java/sorting-greedy-intervals.solutions.ts.
import { fromPython } from '../javascript/shared';
import { SORTING_GREEDY_INTERVALS } from '../python/sorting-greedy-intervals';
import { javaStarter, one } from './shared';

const UTIL = 'import java.util.*;';
const NO_SORT = {
  names: ['sort', 'stream', 'PriorityQueue', 'TreeSet', 'TreeMap', 'Collections'],
  why: 'This question asks you to do the sorting yourself, without Arrays.sort() or Collections.sort().',
};
const call = (header: string, comment: string, expr: string, print: 'plain' | 'array' | 'deep' = 'plain') =>
  one(
    header,
    comment,
    print === 'array' ? `System.out.println(Arrays.toString(${expr}));` : print === 'deep' ? `System.out.println(Arrays.deepToString(${expr}));` : `System.out.println(${expr});`,
    UTIL,
  );

export const SORTING_GREEDY_INTERVALS_JAVA = fromPython(SORTING_GREEDY_INTERVALS, {
  306: {
    example: 'Example: bubbleSort(new int[] {5, 2, 4, 1}), selectionSort(...) and insertionSort(...) all return [1, 2, 4, 5].',
    starter: javaStarter(
      [
        ['int[] bubbleSort(int[] nums)', 'Swap neighbours that are in the wrong order, pass after pass. Return the sorted array.'],
        ['int[] selectionSort(int[] nums)', 'Pick the smallest of the unsorted part and put it next in line.'],
        ['int[] insertionSort(int[] nums)', 'Take each number and slide it left into its place among the sorted ones.'],
      ],
      'System.out.println(Arrays.toString(bubbleSort(new int[] {5, 2, 4, 1})));\nSystem.out.println(Arrays.toString(selectionSort(new int[] {5, 2, 4, 1})));\nSystem.out.println(Arrays.toString(insertionSort(new int[] {5, 2, 4, 1})));',
      UTIL,
    ),
    forbid: NO_SORT,
  },
  307: {
    example: 'Example: sortByCounting(new int[] {2, 0, 2, 1, 1, 0}) returns [0, 0, 1, 1, 2, 2].',
    starter: call('int[] sortByCounting(int[] nums)', 'nums holds only 0s, 1s and 2s. Count each, then build the sorted array.', 'sortByCounting(new int[] {2, 0, 2, 1, 1, 0})', 'array'),
    hint: 'Count how many 0s, 1s and 2s there are (an int[3]), then write that many of each, in order, into a new array. Like sorting coins by counting each kind and stacking them in piles.',
    forbid: NO_SORT,
  },
  308: {
    example: 'Example: canAttendAll(new int[][] {{0, 30}, {5, 10}, {15, 20}}) returns false.',
    starter: call('boolean canAttendAll(int[][] meetings)', 'Each meeting is {start, end}. true if no two overlap (one may start when another ends).', 'canAttendAll(new int[][] {{0, 30}, {5, 10}, {15, 20}})'),
    hint: 'Sort the meetings by start time (Arrays.sort(meetings, (a, b) -> a[0] - b[0])). Then each meeting must start no earlier than the one before it ends. Like checking a diary: put the appointments in order and look for one that starts before the last has finished.',
  },
  309: {
    example: 'Example: contentChildren(new int[] {1, 2, 3}, new int[] {1, 1}) returns 1.',
    starter: call(
      'int contentChildren(int[] greed, int[] cookies)',
      'Child i is happy with a cookie of size >= greed[i]; each child gets at most one cookie.\nThe most children you can make happy.',
      'contentChildren(new int[] {1, 2, 3}, new int[] {1, 1})',
    ),
  },
  310: {
    example: 'Example: mergeSort(new int[] {5, 2, 4, 6, 1, 3}) returns [1, 2, 3, 4, 5, 6].',
    starter: call('int[] mergeSort(int[] nums)', 'Split in half, sort each half the same way, then merge them. Return a sorted array.', 'mergeSort(new int[] {5, 2, 4, 6, 1, 3})', 'array'),
    hint: 'An array of 0 or 1 numbers is sorted. Otherwise copy the two halves into new arrays, sort each the same way, then merge: compare the fronts of the two sorted halves and take the smaller each time, then copy what is left. Like sorting a big pile of exam papers by splitting it among friends and merging their sorted piles.',
    forbid: NO_SORT,
  },
  311: {
    example: 'Example: quickSort(new int[] {5, 2, 4, 6, 1, 3}) returns [1, 2, 3, 4, 5, 6].',
    starter: call(
      'int[] quickSort(int[] nums)',
      'Pick a pivot, put smaller numbers on its left and bigger ones on its right,\nand sort both sides the same way. Return a sorted array.',
      'quickSort(new int[] {5, 2, 4, 6, 1, 3})',
      'array',
    ),
    hint: 'Copy the array, then sort it in place with a helper sort(a, lo, hi): choose a pivot (say a[(lo + hi) / 2]), move smaller numbers to its left and bigger ones to its right (two pointers swapping), then sort both sides the same way. Like a teacher lining up a class: everyone shorter than one pupil stands left, taller stands right, then each side repeats.',
    forbid: NO_SORT,
  },
  312: {
    example: 'Example: kthLargest(new int[] {3, 2, 1, 5, 6, 4}, 2) returns 5.',
    starter: call('int kthLargest(int[] nums, int k)', 'The kth largest number (k = 1 is the largest; repeated numbers count separately).', 'kthLargest(new int[] {3, 2, 1, 5, 6, 4}, 2)'),
    hint: 'Keep a PriorityQueue<Integer> (it gives the smallest first) holding the k biggest numbers seen so far: offer each number, and poll the smallest whenever it holds more than k. At the end its smallest (peek) is the answer. Like a top-k leaderboard where the lowest score drops off when someone better arrives.',
  },
  313: {
    example: 'Example: mergeIntervals(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}}) returns [[1, 6], [8, 10], [15, 18]].',
    starter: call('int[][] mergeIntervals(int[][] intervals)', 'Merge all intervals that overlap (touching counts), sorted by start.', 'mergeIntervals(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}})', 'deep'),
    hint: 'Sort by start (Arrays.sort(intervals, (a, b) -> a[0] - b[0])). Go through them: if an interval starts no later than the end of the last merged one, stretch that end to the larger of the two ends; otherwise start a new merged interval. Like joining strips of tape on a ruler that overlap.',
  },
  314: {
    example: 'Example: insertInterval(new int[][] {{1, 3}, {6, 9}}, new int[] {2, 5}) returns [[1, 5], [6, 9]].',
    starter: call(
      'int[][] insertInterval(int[][] intervals, int[] interval)',
      'intervals are sorted and do not overlap. Add interval, merging where needed; keep them sorted.',
      'insertInterval(new int[][] {{1, 3}, {6, 9}}, new int[] {2, 5})',
      'deep',
    ),
    hint: 'Three parts: copy the intervals that end before the new interval starts; merge every interval that overlaps it into it (smallest start, largest end); then add it and copy the rest. Like slotting a new booking into a calendar and joining it with any bookings it touches.',
  },
  315: {
    example: 'Example: eraseOverlap(new int[][] {{1, 2}, {2, 3}, {3, 4}, {1, 3}}) returns 1 (remove [1, 3]).',
    starter: call('int eraseOverlap(int[][] intervals)', 'The fewest intervals to remove so the rest do not overlap (touching is fine).', 'eraseOverlap(new int[][] {{1, 2}, {2, 3}, {3, 4}, {1, 3}})'),
  },
  316: {
    example: 'Example: minMeetingRooms(new int[][] {{0, 30}, {5, 10}, {15, 20}}) returns 2.',
    starter: call(
      'int minMeetingRooms(int[][] meetings)',
      'Each meeting is {start, end}. The fewest rooms so no two meetings share a room at the same time\n(a room is free again the moment a meeting ends).',
      'minMeetingRooms(new int[][] {{0, 30}, {5, 10}, {15, 20}})',
    ),
  },
  317: {
    example: 'Example: minPlatforms(new int[] {900, 940, 950, 1100, 1500, 1800}, new int[] {910, 1200, 1120, 1130, 1900, 2000}) returns 3.',
    starter: call(
      'int minPlatforms(int[] arrivals, int[] departures)',
      'Train i arrives at arrivals[i] and leaves at departures[i] (times like 930 for 9:30).\nA train arriving at the very minute another leaves still needs its own platform.\nThe fewest platforms the station needs.',
      'minPlatforms(new int[] {900, 940, 950, 1100, 1500, 1800}, new int[] {910, 1200, 1120, 1130, 1900, 2000})',
    ),
  },
  318: {
    example: 'Example: canCompleteCircuit(new int[] {1, 2, 3, 4, 5}, new int[] {3, 4, 5, 1, 2}) returns 3.',
    starter: call(
      'int canCompleteCircuit(int[] gas, int[] cost)',
      'Station i gives gas[i]; driving from i to i + 1 (wrapping round) uses cost[i].\nThe station to start from to drive all the way round with an empty tank at first, or -1.',
      'canCompleteCircuit(new int[] {1, 2, 3, 4, 5}, new int[] {3, 4, 5, 1, 2})',
    ),
  },
  319: {
    example: "Example: leastInterval(new char[] {'A', 'A', 'A', 'B', 'B', 'B'}, 2) returns 8 (A B idle A B idle A B).",
    starter: call(
      'int leastInterval(char[] tasks, int n)',
      'Each task takes one time unit. The same task needs at least n units between two runs\n(the CPU may stay idle). The fewest units to finish everything.',
      "leastInterval(new char[] {'A', 'A', 'A', 'B', 'B', 'B'}, 2)",
    ),
    hint: 'Let m be the most times any task appears, and k how many tasks appear m times. The busiest task makes m - 1 blocks of length n + 1, plus a last row of k: (m - 1) × (n + 1) + k. If there are more tasks than that, no idling is needed: the answer is tasks.length. Like a coach planning laps so the same runner always gets a rest.',
  },
  320: {
    example: 'Example: largestNumber(new int[] {3, 30, 34, 5, 9}) returns "9534330".',
    starter: call('String largestNumber(int[] nums)', 'Arrange the numbers (0 or more) side by side to make the largest number. Return it as text.', 'largestNumber(new int[] {3, 30, 34, 5, 9})'),
    hint: 'Turn the numbers into Strings and sort them with a rule: a comes before b when (a + b) is bigger than (b + a) (list.sort((a, b) -> (b + a).compareTo(a + b))). Join them; if the result starts with "0", the whole number is "0". Like arranging number cards on a table so the longest number reads as big as possible.',
  },
});
