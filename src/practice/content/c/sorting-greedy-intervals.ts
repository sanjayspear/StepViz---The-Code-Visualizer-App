// Practice, C: the questions of sorting-greedy-intervals that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/sorting-greedy-intervals.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q306, Q307, Q308, Q310, Q311, Q313, Q314, Q315, Q316, Q320.
import { fromPython } from '../javascript/shared';
import { SORTING_GREEDY_INTERVALS } from '../python/sorting-greedy-intervals';
import { cStarter } from './shared';

export const SORTING_GREEDY_INTERVALS_C = fromPython(
  SORTING_GREEDY_INTERVALS,
  {
  309: {
    example: "Example: contentChildren({1, 2, 3}, {1, 1}) returns 1.",
    starter: cStarter([["int contentChildren(int greed[], int greedSize, int cookies[], int cookiesSize)", "Child i is happy with a cookie of size >= greed[i]; each child gets at most one cookie.\nThe most children you can make happy."]], "int greed[] = {1, 2, 3};\nint cookies[] = {1, 1};\nprintf(\"%d\\n\", contentChildren(greed, 3, cookies, 2));", [], ''),
    hint: "Sort both arrays first (write a short insertion sort: C has no sort() built in). Give cookies from the smallest up: if the current cookie satisfies the least greedy child left, that child is happy and you move to the next child; either way move on to the next cookie. Like handing out shoes: give each the smallest pair that fits.",
  },
  312: {
    example: "Example: kthLargest({3, 2, 1, 5, 6, 4}, 2) returns 5.",
    starter: cStarter([["int kthLargest(int nums[], int n, int k)", "The kth largest number (k = 1 is the largest; repeated numbers count separately)."]], "int nums[] = {3, 2, 1, 5, 6, 4};\nprintf(\"%d\\n\", kthLargest(nums, 6, 2));", [], ''),
    hint: "Sort a copy of the numbers (a short insertion sort is fine here); the kth largest is then at position n - k. (A heap that keeps only the k biggest is the faster way.) Like a top-k leaderboard: line everyone up by score and count k places from the top.",
  },
  317: {
    example: "Example: minPlatforms({900, 940, 950, 1100, 1500, 1800}, {910, 1200, 1120, 1130, 1900, 2000}) returns 3.",
    starter: cStarter([["int minPlatforms(int arrivals[], int arrivalsSize, int departures[], int departuresSize)", "Train i arrives at arrivals[i] and leaves at departures[i] (times like 930 for 9:30).\nA train arriving at the very minute another leaves still needs its own platform.\nThe fewest platforms the station needs."]], "int arrivals[] = {900, 940, 950, 1100, 1500, 1800};\nint departures[] = {910, 1200, 1120, 1130, 1900, 2000};\nprintf(\"%d\\n\", minPlatforms(arrivals, 6, departures, 6));", [], ''),
    hint: "Sort the arrivals and the departures separately and walk through both like merging: an arrival at or before the next departure needs one more platform; otherwise a train leaves first and frees one. Keep the most platforms in use. Like counting the busiest moment at a bus stop.",
  },
  318: {
    example: "Example: canCompleteCircuit({1, 2, 3, 4, 5}, {3, 4, 5, 1, 2}) returns 3.",
    starter: cStarter([["int canCompleteCircuit(int gas[], int gasSize, int cost[], int costSize)", "Station i gives gas[i]; driving from i to i + 1 (wrapping round) uses cost[i].\nThe station to start from to drive all the way round with an empty tank at first, or -1."]], "int gas[] = {1, 2, 3, 4, 5};\nint cost[] = {3, 4, 5, 1, 2};\nprintf(\"%d\\n\", canCompleteCircuit(gas, 5, cost, 5));", [], ''),
    hint: "If all the gas is less than all the cost, it is impossible. Otherwise drive from station 0 keeping the tank; whenever it drops below 0, no station up to here can be the start, so start again from the next station with an empty tank. Like a road trip where a breakdown tells you to begin after that stretch.",
  },
  319: {
    example: "Example: leastInterval({'A', 'A', 'A', 'B', 'B', 'B'}, 2) returns 8 (A B idle A B idle A B).",
    starter: cStarter([["int leastInterval(char tasks[], int count, int n)", "Each task takes one time unit. The same task needs at least n units between two runs\n(the CPU may stay idle). The fewest units to finish everything."]], "char tasks[] = {'A', 'A', 'A', 'B', 'B', 'B'};\nprintf(\"%d\\n\", leastInterval(tasks, 6, 2));", [], ''),
    hint: "Let m be the most times any task appears, and k how many tasks appear m times. The busiest task makes m - 1 blocks of length n + 1, plus a last row of k: (m - 1) \u00d7 (n + 1) + k. If there are more tasks than that, no idling is needed: the answer is count. Like a coach planning laps so the same runner always gets a rest.",
  },
  },
  { partial: true },
);
