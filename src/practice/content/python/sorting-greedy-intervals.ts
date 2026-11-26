// Practice, Python: Sorting, greedy & intervals (Q306-Q320). Reference solutions: tests/practice/sorting-greedy-intervals.solutions.ts.
import type { PracticeContent } from '../types';

const NO_SORT = { names: ['sorted', 'sort', 'heapq', 'Counter'], why: 'This question asks you to do the sorting yourself, without sort(), sorted(), heapq or Counter.' };

export const SORTING_GREEDY_INTERVALS: PracticeContent[] = [
  {
    id: 306,
    example: 'Example: bubble_sort([5, 2, 4, 1]), selection_sort([5, 2, 4, 1]) and insertion_sort([5, 2, 4, 1]) all return [1, 2, 4, 5].',
    starter: `def bubble_sort(nums):
    # Swap neighbours that are in the wrong order, pass after pass. Return the sorted list.
    pass


def selection_sort(nums):
    # Pick the smallest of the unsorted part and put it next in line.
    pass


def insertion_sort(nums):
    # Take each number and slide it left into its place among the sorted ones.
    pass


print(bubble_sort([5, 2, 4, 1]), selection_sort([5, 2, 4, 1]), insertion_sort([5, 2, 4, 1]))
`,
    tests: [
      { call: 'bubble_sort', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'bubble_sort', args: [[]], expected: [] },
      { call: 'selection_sort', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'selection_sort', args: [[3, -1, 3, 0]], expected: [-1, 0, 3, 3] },
      { call: 'insertion_sort', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'insertion_sort', args: [[1]], expected: [1] },
      { call: 'insertion_sort', args: [[9, 8, 7, 7]], expected: [7, 7, 8, 9] },
    ],
    hint: 'Bubble: repeat passes, swapping nums[j] and nums[j + 1] when they are out of order. Selection: for each position i, find the smallest from i on and swap it into i. Insertion: for each i, move nums[i] left past bigger numbers. Like sorting a hand of cards three different ways.',
    forbid: NO_SORT,
  },
  {
    id: 307,
    example: 'Example: sort_by_counting([2, 0, 2, 1, 1, 0]) returns [0, 0, 1, 1, 2, 2].',
    starter: `def sort_by_counting(nums):
    # nums holds only 0s, 1s and 2s. Count each, then build the sorted list.
    pass


print(sort_by_counting([2, 0, 2, 1, 1, 0]))
`,
    tests: [
      { call: 'sort_by_counting', args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { call: 'sort_by_counting', args: [[]], expected: [] },
      { call: 'sort_by_counting', args: [[1]], expected: [1] },
      { call: 'sort_by_counting', args: [[2, 2, 0]], expected: [0, 2, 2] },
    ],
    hint: 'Count how many 0s, 1s and 2s there are (a list of three counters), then write that many of each in order. Like sorting coins by counting each kind and stacking them in piles.',
    forbid: NO_SORT,
  },
  {
    id: 308,
    example: 'Example: can_attend_all([[0, 30], [5, 10], [15, 20]]) returns False.',
    starter: `def can_attend_all(meetings):
    # Each meeting is [start, end]. True if no two overlap (one may start when another ends).
    pass


print(can_attend_all([[0, 30], [5, 10], [15, 20]]))
`,
    tests: [
      { call: 'can_attend_all', args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
      { call: 'can_attend_all', args: [[[7, 10], [2, 4]]], expected: true },
      { call: 'can_attend_all', args: [[]], expected: true },
      { call: 'can_attend_all', args: [[[1, 5], [5, 8]]], expected: true },
      { call: 'can_attend_all', args: [[[1, 5], [4, 8]]], expected: false },
    ],
    hint: 'Sort the meetings by start time. Then each meeting must start no earlier than the one before it ends. Like checking a diary: put the appointments in order and look for one that starts before the last has finished.',
  },
  {
    id: 309,
    example: 'Example: content_children([1, 2, 3], [1, 1]) returns 1.',
    starter: `def content_children(greed, cookies):
    # Child i is happy with a cookie of size >= greed[i]; each child gets at most one cookie.
    # The most children you can make happy.
    pass


print(content_children([1, 2, 3], [1, 1]))
`,
    tests: [
      { call: 'content_children', args: [[1, 2, 3], [1, 1]], expected: 1 },
      { call: 'content_children', args: [[1, 2], [1, 2, 3]], expected: 2 },
      { call: 'content_children', args: [[], [1]], expected: 0 },
      { call: 'content_children', args: [[10, 9, 8, 7], [5, 6, 7, 8]], expected: 2 },
    ],
    hint: 'Sort both lists. Give cookies from the smallest up: if the current cookie satisfies the least greedy child left, that child is happy and you move to the next child; either way move on to the next cookie. Like handing out shoes: give each the smallest pair that fits.',
  },
  {
    id: 310,
    example: 'Example: merge_sort([5, 2, 4, 6, 1, 3]) returns [1, 2, 3, 4, 5, 6].',
    starter: `def merge_sort(nums):
    # Split in half, sort each half the same way, then merge them. Return a sorted list.
    pass


print(merge_sort([5, 2, 4, 6, 1, 3]))
`,
    tests: [
      { call: 'merge_sort', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'merge_sort', args: [[]], expected: [] },
      { call: 'merge_sort', args: [[1]], expected: [1] },
      { call: 'merge_sort', args: [[3, -1, 3, 0]], expected: [-1, 0, 3, 3] },
      { call: 'merge_sort', args: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ],
    hint: 'A list of 0 or 1 numbers is sorted. Otherwise sort nums[:mid] and nums[mid:], then merge: compare the fronts of the two sorted halves and take the smaller each time, then add what is left. Like sorting a big pile of exam papers by splitting it among friends and merging their sorted piles.',
    forbid: NO_SORT,
  },
  {
    id: 311,
    example: 'Example: quick_sort([5, 2, 4, 6, 1, 3]) returns [1, 2, 3, 4, 5, 6].',
    starter: `def quick_sort(nums):
    # Pick a pivot, put smaller numbers on its left and bigger ones on its right,
    # and sort both sides the same way. Return a sorted list.
    pass


print(quick_sort([5, 2, 4, 6, 1, 3]))
`,
    tests: [
      { call: 'quick_sort', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'quick_sort', args: [[]], expected: [] },
      { call: 'quick_sort', args: [[1]], expected: [1] },
      { call: 'quick_sort', args: [[3, -1, 3, 0, 3]], expected: [-1, 0, 3, 3, 3] },
      { call: 'quick_sort', args: [[2, 2, 2, 2]], expected: [2, 2, 2, 2] },
    ],
    hint: 'Choose a pivot (say the middle number). Make three lists: smaller than it, equal to it, bigger than it. Sort the smaller and bigger lists the same way and join the three. Like a teacher lining up a class: everyone shorter than one pupil stands left, taller stands right, then each side repeats.',
    forbid: NO_SORT,
  },
  {
    id: 312,
    example: 'Example: kth_largest([3, 2, 1, 5, 6, 4], 2) returns 5.',
    starter: `def kth_largest(nums, k):
    # The kth largest number (k = 1 is the largest; repeated numbers count separately).
    pass


print(kth_largest([3, 2, 1, 5, 6, 4], 2))
`,
    tests: [
      { call: 'kth_largest', args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { call: 'kth_largest', args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { call: 'kth_largest', args: [[1], 1], expected: 1 },
      { call: 'kth_largest', args: [[2, 1], 2], expected: 1 },
    ],
    hint: 'Keep a min-heap (heapq) of the k biggest numbers seen so far: push each number, and pop the smallest whenever the heap holds more than k. At the end the smallest in the heap is the answer. Like a top-k leaderboard where the lowest score drops off when someone better arrives.',
  },
  {
    id: 313,
    example: 'Example: merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]) returns [[1, 6], [8, 10], [15, 18]].',
    starter: `def merge_intervals(intervals):
    # Merge all intervals that overlap (touching counts), sorted by start.
    pass


print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))
`,
    tests: [
      { call: 'merge_intervals', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { call: 'merge_intervals', args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { call: 'merge_intervals', args: [[]], expected: [] },
      { call: 'merge_intervals', args: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      { call: 'merge_intervals', args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
    ],
    hint: 'Sort by start. Go through them: if an interval starts no later than the end of the last merged one, stretch that end to the larger of the two ends; otherwise start a new merged interval. Like joining strips of tape on a ruler that overlap.',
  },
  {
    id: 314,
    example: 'Example: insert_interval([[1, 3], [6, 9]], [2, 5]) returns [[1, 5], [6, 9]].',
    starter: `def insert_interval(intervals, new):
    # intervals are sorted and do not overlap. Add new, merging where needed; keep them sorted.
    pass


print(insert_interval([[1, 3], [6, 9]], [2, 5]))
`,
    tests: [
      { call: 'insert_interval', args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
      { call: 'insert_interval', args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]] },
      { call: 'insert_interval', args: [[], [5, 7]], expected: [[5, 7]] },
      { call: 'insert_interval', args: [[[1, 5]], [6, 8]], expected: [[1, 5], [6, 8]] },
      { call: 'insert_interval', args: [[[3, 5]], [1, 2]], expected: [[1, 2], [3, 5]] },
    ],
    hint: 'Three parts: copy the intervals that end before new starts; merge every interval that overlaps new into it (smallest start, largest end); then add new and copy the rest. Like slotting a new booking into a calendar and joining it with any bookings it touches.',
  },
  {
    id: 315,
    example: 'Example: erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]]) returns 1 (remove [1, 3]).',
    starter: `def erase_overlap(intervals):
    # The fewest intervals to remove so the rest do not overlap (touching is fine).
    pass


print(erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]]))
`,
    tests: [
      { call: 'erase_overlap', args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { call: 'erase_overlap', args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { call: 'erase_overlap', args: [[[1, 2], [2, 3]]], expected: 0 },
      { call: 'erase_overlap', args: [[]], expected: 0 },
      { call: 'erase_overlap', args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
    ],
    hint: 'Sort by end time and keep every interval that starts no earlier than the end of the last one kept; count the others as removed. Finishing early always leaves the most room. Like booking the most talks into one room by always picking the one that ends soonest.',
  },
  {
    id: 316,
    example: 'Example: min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) returns 2.',
    starter: `def min_meeting_rooms(meetings):
    # Each meeting is [start, end]. The fewest rooms so no two meetings share a room at the same time
    # (a room is free again the moment a meeting ends).
    pass


print(min_meeting_rooms([[0, 30], [5, 10], [15, 20]]))
`,
    tests: [
      { call: 'min_meeting_rooms', args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { call: 'min_meeting_rooms', args: [[[7, 10], [2, 4]]], expected: 1 },
      { call: 'min_meeting_rooms', args: [[]], expected: 0 },
      { call: 'min_meeting_rooms', args: [[[1, 5], [5, 10]]], expected: 1 },
      { call: 'min_meeting_rooms', args: [[[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]], expected: 4 },
    ],
    hint: 'Sort the starts and the ends separately. Walk through the starts: each start needs a room, but if the earliest unfinished end is at or before it, that room is freed first. The most rooms in use at once is the answer. Like counting how many tables a restaurant needs at its busiest moment.',
  },
  {
    id: 317,
    example: 'Example: min_platforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]) returns 3.',
    starter: `def min_platforms(arrivals, departures):
    # Train i arrives at arrivals[i] and leaves at departures[i] (times like 930 for 9:30).
    # A train arriving at the very minute another leaves still needs its own platform.
    # The fewest platforms the station needs.
    pass


print(min_platforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]))
`,
    tests: [
      { call: 'min_platforms', args: [[900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]], expected: 3 },
      { call: 'min_platforms', args: [[900, 1100, 1235], [1000, 1200, 1240]], expected: 1 },
      { call: 'min_platforms', args: [[1000], [1030]], expected: 1 },
      { call: 'min_platforms', args: [[1000, 1030], [1030, 1100]], expected: 2 },
      { call: 'min_platforms', args: [[900, 900, 900], [905, 910, 915]], expected: 3 },
    ],
    hint: 'Sort the arrivals and the departures separately and walk through both like merging: an arrival at or before the next departure needs one more platform; otherwise a train leaves first and frees one. Keep the most platforms in use. Like counting the busiest moment at a bus stop.',
  },
  {
    id: 318,
    example: 'Example: can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]) returns 3.',
    starter: `def can_complete_circuit(gas, cost):
    # Station i gives gas[i]; driving from i to i + 1 (wrapping round) uses cost[i].
    # The station to start from to drive all the way round with an empty tank at first, or -1.
    pass


print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))
`,
    tests: [
      { call: 'can_complete_circuit', args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { call: 'can_complete_circuit', args: [[2, 3, 4], [3, 4, 3]], expected: -1 },
      { call: 'can_complete_circuit', args: [[5], [4]], expected: 0 },
      { call: 'can_complete_circuit', args: [[3, 1, 1], [1, 2, 2]], expected: 0 },
      { call: 'can_complete_circuit', args: [[1, 2], [2, 1]], expected: 1 },
    ],
    hint: 'If all the gas is less than all the cost, it is impossible. Otherwise drive from station 0 keeping the tank; whenever it drops below 0, no station up to here can be the start, so start again from the next station with an empty tank. Like a road trip where a breakdown tells you to begin after that stretch.',
  },
  {
    id: 319,
    example: 'Example: least_interval(["A", "A", "A", "B", "B", "B"], 2) returns 8 (A B idle A B idle A B).',
    starter: `def least_interval(tasks, n):
    # Each task takes one time unit. The same task needs at least n units between two runs
    # (the CPU may stay idle). The fewest units to finish everything.
    pass


print(least_interval(["A", "A", "A", "B", "B", "B"], 2))
`,
    tests: [
      { call: 'least_interval', args: [['A', 'A', 'A', 'B', 'B', 'B'], 2], expected: 8 },
      { call: 'least_interval', args: [['A', 'A', 'A', 'B', 'B', 'B'], 0], expected: 6 },
      { call: 'least_interval', args: [['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2], expected: 16 },
      { call: 'least_interval', args: [['A'], 5], expected: 1 },
      { call: 'least_interval', args: [['A', 'B', 'A'], 3], expected: 5 },
    ],
    hint: 'Let m be the most times any task appears, and k how many tasks appear m times. The busiest task makes m - 1 blocks of length n + 1, plus a last row of k: (m - 1) × (n + 1) + k. If there are more tasks than that, no idling is needed: the answer is len(tasks). Like a coach planning laps so the same runner always gets a rest.',
  },
  {
    id: 320,
    example: 'Example: largest_number([3, 30, 34, 5, 9]) returns "9534330".',
    starter: `def largest_number(nums):
    # Arrange the numbers (0 or more) side by side to make the largest number. Return it as text.
    pass


print(largest_number([3, 30, 34, 5, 9]))
`,
    tests: [
      { call: 'largest_number', args: [[10, 2]], expected: '210' },
      { call: 'largest_number', args: [[3, 30, 34, 5, 9]], expected: '9534330' },
      { call: 'largest_number', args: [[0, 0]], expected: '0' },
      { call: 'largest_number', args: [[1]], expected: '1' },
      { call: 'largest_number', args: [[432, 43243]], expected: '43243432' },
    ],
    hint: 'Put a before b when the text a + b is bigger than b + a (use functools.cmp_to_key with sorted). Join them; if the result starts with "0", the whole number is "0". Like arranging number cards on a table so the longest number reads as big as possible.',
  },
];
