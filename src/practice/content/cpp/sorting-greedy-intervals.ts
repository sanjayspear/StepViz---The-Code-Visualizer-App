// Practice, C++: Sorting, greedy & intervals (Q306-Q320). Tests come from the Python content;
// reference solutions in tests/practice/cpp/sorting-greedy-intervals.solutions.ts.
import { fromPython } from '../javascript/shared';
import { SORTING_GREEDY_INTERVALS } from '../python/sorting-greedy-intervals';
import { cppStarter, PRINT_INTS } from './shared';

const NO_SORT = {
  names: ['sort', 'stable_sort', 'partial_sort', 'nth_element', 'make_heap', 'sort_heap'],
  patterns: [{ regex: '(set|multiset|map|multimap|priority_queue)<', shown: 'a sorted container' }],
  why: 'This question asks you to do the sorting yourself, without sort().',
};
const PRINT_LISTS = `void printLists(const vector<vector<int>>& lists) {
    for (int i = 0; i < lists.size(); i++) {
        vector<int> row = lists[i];
        printVector(row);
    }
}`;
const HELPERS = `${PRINT_INTS}\n\n${PRINT_LISTS}`;
const fn = (header: string, comment: string, main: string) => cppStarter([[header, comment]], main, ['queue'], HELPERS);
const show = (expr: string) => `cout << ${expr} << endl;`;
const MEETINGS = 'vector<vector<int>> meetings = {{0, 30}, {5, 10}, {15, 20}};';

export const SORTING_GREEDY_INTERVALS_CPP = fromPython(SORTING_GREEDY_INTERVALS, {
  306: {
    example: 'Example: bubbleSort({5, 2, 4, 1}), selectionSort(...) and insertionSort(...) all return [1, 2, 4, 5].',
    starter: cppStarter(
      [
        ['vector<int> bubbleSort(vector<int> nums)', 'Swap neighbours that are in the wrong order, pass after pass. Return the sorted vector.'],
        ['vector<int> selectionSort(vector<int> nums)', 'Pick the smallest of the unsorted part and put it next in line.'],
        ['vector<int> insertionSort(vector<int> nums)', 'Take each number and slide it left into its place among the sorted ones.'],
      ],
      'vector<int> nums = {5, 2, 4, 1};\nvector<int> a = bubbleSort(nums);\nprintVector(a);\nvector<int> b = selectionSort(nums);\nprintVector(b);\nvector<int> c = insertionSort(nums);\nprintVector(c);',
      [],
      PRINT_INTS,
    ),
    forbid: NO_SORT,
  },
  307: {
    example: 'Example: sortByCounting({2, 0, 2, 1, 1, 0}) returns [0, 0, 1, 1, 2, 2].',
    starter: cppStarter(
      [['vector<int> sortByCounting(vector<int>& nums)', 'nums holds only 0s, 1s and 2s. Count each, then build the sorted vector.']],
      'vector<int> nums = {2, 0, 2, 1, 1, 0};\nvector<int> r = sortByCounting(nums);\nprintVector(r);',
      [],
      PRINT_INTS,
    ),
    hint: 'Count how many 0s, 1s and 2s there are (a vector<int> counts(3, 0)), then push_back that many of each, in order, into a new vector. Like sorting coins by counting each kind and stacking them in piles.',
    forbid: NO_SORT,
  },
  308: {
    example: 'Example: canAttendAll({{0, 30}, {5, 10}, {15, 20}}) returns false.',
    starter: fn('bool canAttendAll(vector<vector<int>> meetings)', 'Each meeting is {start, end}. true if no two overlap (one may start when another ends).', `${MEETINGS}\ncout << boolalpha << canAttendAll(meetings) << endl;`),
    hint: 'Sort the meetings by start time (sort(meetings.begin(), meetings.end()) puts the rows in order of their first number). Then each meeting must start no earlier than the one before it ends. Like checking a diary: put the appointments in order and look for one that starts before the last has finished.',
  },
  309: {
    example: 'Example: contentChildren({1, 2, 3}, {1, 1}) returns 1.',
    starter: fn(
      'int contentChildren(vector<int> greed, vector<int> cookies)',
      'Child i is happy with a cookie of size >= greed[i]; each child gets at most one cookie.\nThe most children you can make happy.',
      'vector<int> greed = {1, 2, 3};\nvector<int> cookies = {1, 1};\ncout << contentChildren(greed, cookies) << endl;',
    ),
  },
  310: {
    example: 'Example: mergeSort({5, 2, 4, 6, 1, 3}) returns [1, 2, 3, 4, 5, 6].',
    starter: cppStarter(
      [['vector<int> mergeSort(vector<int> nums)', 'Split in half, sort each half the same way, then merge them. Return a sorted vector.']],
      'vector<int> nums = {5, 2, 4, 6, 1, 3};\nvector<int> r = mergeSort(nums);\nprintVector(r);',
      [],
      PRINT_INTS,
    ),
    hint: 'A vector of 0 or 1 numbers is sorted. Otherwise copy the two halves into new vectors, sort each the same way, then merge: compare the fronts of the two sorted halves and take the smaller each time, then copy what is left. Like sorting a big pile of exam papers by splitting it among friends and merging their sorted piles.',
    forbid: NO_SORT,
  },
  311: {
    example: 'Example: quickSort({5, 2, 4, 6, 1, 3}) returns [1, 2, 3, 4, 5, 6].',
    starter: cppStarter(
      [['vector<int> quickSort(vector<int> nums)', 'Pick a pivot, put smaller numbers on its left and bigger ones on its right,\nand sort both sides the same way. Return a sorted vector.']],
      'vector<int> nums = {5, 2, 4, 6, 1, 3};\nvector<int> r = quickSort(nums);\nprintVector(r);',
      [],
      PRINT_INTS,
    ),
    hint: 'Sort the copy in place with a helper that takes the vector by reference and a range lo..hi: choose a pivot (say a[(lo + hi) / 2]), move smaller numbers to its left and bigger ones to its right (two pointers swapping), then sort both sides the same way. Like a teacher lining up a class: everyone shorter than one pupil stands left, taller stands right, then each side repeats.',
    forbid: NO_SORT,
  },
  312: {
    example: 'Example: kthLargest({3, 2, 1, 5, 6, 4}, 2) returns 5.',
    starter: fn('int kthLargest(vector<int>& nums, int k)', 'The kth largest number (k = 1 is the largest; repeated numbers count separately).', 'vector<int> nums = {3, 2, 1, 5, 6, 4};\ncout << kthLargest(nums, 2) << endl;'),
    hint: 'Keep a priority_queue<int, vector<int>, greater<int>> (it gives the smallest first) holding the k biggest numbers seen so far: push each number, and pop the smallest whenever it holds more than k. At the end its top is the answer. Like a top-k leaderboard where the lowest score drops off when someone better arrives.',
  },
  313: {
    example: 'Example: mergeIntervals({{1, 3}, {2, 6}, {8, 10}, {15, 18}}) returns [[1, 6], [8, 10], [15, 18]].',
    starter: fn(
      'vector<vector<int>> mergeIntervals(vector<vector<int>> intervals)',
      'Merge all intervals that overlap (touching counts), sorted by start.',
      'vector<vector<int>> intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};\nvector<vector<int>> r = mergeIntervals(intervals);\nprintLists(r);',
    ),
    hint: 'Sort by start (sort(intervals.begin(), intervals.end()) orders the rows by their first number). Go through them: if an interval starts no later than the end of the last merged one, stretch that end to the larger of the two ends; otherwise start a new merged interval. Like joining strips of tape on a ruler that overlap.',
  },
  314: {
    example: 'Example: insertInterval({{1, 3}, {6, 9}}, {2, 5}) returns [[1, 5], [6, 9]].',
    starter: fn(
      'vector<vector<int>> insertInterval(vector<vector<int>> intervals, vector<int> interval)',
      'intervals are sorted and do not overlap. Add interval, merging where needed; keep them sorted.',
      'vector<vector<int>> intervals = {{1, 3}, {6, 9}};\nvector<int> interval = {2, 5};\nvector<vector<int>> r = insertInterval(intervals, interval);\nprintLists(r);',
    ),
    hint: 'Three parts: copy the intervals that end before the new interval starts; merge every interval that overlaps it into it (smallest start, largest end); then add it and copy the rest. Like slotting a new booking into a calendar and joining it with any bookings it touches.',
  },
  315: {
    example: 'Example: eraseOverlap({{1, 2}, {2, 3}, {3, 4}, {1, 3}}) returns 1 (remove [1, 3]).',
    starter: fn(
      'int eraseOverlap(vector<vector<int>> intervals)',
      'The fewest intervals to remove so the rest do not overlap (touching is fine).',
      'vector<vector<int>> intervals = {{1, 2}, {2, 3}, {3, 4}, {1, 3}};\ncout << eraseOverlap(intervals) << endl;',
    ),
  },
  316: {
    example: 'Example: minMeetingRooms({{0, 30}, {5, 10}, {15, 20}}) returns 2.',
    starter: fn(
      'int minMeetingRooms(vector<vector<int>> meetings)',
      'Each meeting is {start, end}. The fewest rooms so no two meetings share a room at the same time\n(a room is free again the moment a meeting ends).',
      `${MEETINGS}\ncout << minMeetingRooms(meetings) << endl;`,
    ),
  },
  317: {
    example: 'Example: minPlatforms({900, 940, 950, 1100, 1500, 1800}, {910, 1200, 1120, 1130, 1900, 2000}) returns 3.',
    starter: fn(
      'int minPlatforms(vector<int> arrivals, vector<int> departures)',
      'Train i arrives at arrivals[i] and leaves at departures[i] (times like 930 for 9:30).\nA train arriving at the very minute another leaves still needs its own platform.\nThe fewest platforms the station needs.',
      'vector<int> arrivals = {900, 940, 950, 1100, 1500, 1800};\nvector<int> departures = {910, 1200, 1120, 1130, 1900, 2000};\ncout << minPlatforms(arrivals, departures) << endl;',
    ),
  },
  318: {
    example: 'Example: canCompleteCircuit({1, 2, 3, 4, 5}, {3, 4, 5, 1, 2}) returns 3.',
    starter: fn(
      'int canCompleteCircuit(vector<int>& gas, vector<int>& cost)',
      'Station i gives gas[i]; driving from i to i + 1 (wrapping round) uses cost[i].\nThe station to start from to drive all the way round with an empty tank at first, or -1.',
      'vector<int> gas = {1, 2, 3, 4, 5};\nvector<int> cost = {3, 4, 5, 1, 2};\ncout << canCompleteCircuit(gas, cost) << endl;',
    ),
  },
  319: {
    example: "Example: leastInterval({'A', 'A', 'A', 'B', 'B', 'B'}, 2) returns 8 (A B idle A B idle A B).",
    starter: fn(
      'int leastInterval(vector<char>& tasks, int n)',
      'Each task takes one time unit. The same task needs at least n units between two runs\n(the CPU may stay idle). The fewest units to finish everything.',
      "vector<char> tasks = {'A', 'A', 'A', 'B', 'B', 'B'};\ncout << leastInterval(tasks, 2) << endl;",
    ),
    hint: 'Let m be the most times any task appears, and k how many tasks appear m times. The busiest task makes m - 1 blocks of length n + 1, plus a last row of k: (m - 1) × (n + 1) + k. If there are more tasks than that, no idling is needed: the answer is tasks.size(). Like a coach planning laps so the same runner always gets a rest.',
  },
  320: {
    example: 'Example: largestNumber({3, 30, 34, 5, 9}) returns "9534330".',
    starter: fn('string largestNumber(vector<int>& nums)', 'Arrange the numbers (0 or more) side by side to make the largest number. Return it as text.', 'vector<int> nums = {3, 30, 34, 5, 9};\ncout << largestNumber(nums) << endl;'),
    hint: 'Turn the numbers into text (to_string) and sort them with a rule: a comes before b when a + b is bigger than b + a (sort(v.begin(), v.end(), [](string a, string b) { return a + b > b + a; })). Join them; if the result starts with "0", the whole number is "0". Like arranging number cards on a table so the longest number reads as big as possible.',
  },
});
