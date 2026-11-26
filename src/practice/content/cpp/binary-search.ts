// Practice, C++: Binary search (Q171-Q190). Tests come from the Python content;
// reference solutions in tests/practice/cpp/binary-search.solutions.ts.
import { fromPython } from '../javascript/shared';
import { BINARY_SEARCH } from '../python/binary-search';
import { cppStarter, PRINT_INTS } from './shared';

const NO_SEARCH = {
  names: ['find', 'binary_search', 'lower_bound', 'upper_bound', 'equal_range', 'count'],
  why: 'This question asks you to write the binary search yourself, without find() or binary_search().',
};
const NO_ROOT = { names: ['sqrt', 'cbrt', 'pow', 'hypot'], why: 'This question asks you to find it with binary search, without sqrt() or pow().' };
const fn = (header: string, comment: string, setup: string, print: string, before = '') =>
  cppStarter([[header, comment]], `${setup ? `${setup}\n` : ''}${print}`, ['climits'], `${before ? `${before}\n\n` : ''}${PRINT_INTS}`);
const nums = (values: string) => `vector<int> nums = {${values}};`;
const show = (expr: string) => `cout << ${expr} << endl;`;
const MATRIX = 'vector<vector<int>> matrix = {{1, 4, 7, 11, 15}, {2, 5, 8, 12, 19}, {3, 6, 9, 16, 22}, {10, 13, 14, 17, 24}, {18, 21, 23, 26, 30}};';

export const BINARY_SEARCH_CPP = fromPython(BINARY_SEARCH, {
  171: {
    example: 'Example: binarySearch({-1, 0, 3, 5, 9, 12}, 9) returns 4.',
    starter: fn('int binarySearch(vector<int>& nums, int target)', 'nums is sorted. The position of target, or -1, using binary search.', nums('-1, 0, 3, 5, 9, 12'), show('binarySearch(nums, 9)')),
    hint: 'Keep low and high. Look at mid = low + (high - low) / 2: equal, done; smaller than target, search right of mid (low = mid + 1); bigger, search left (high = mid - 1). Stop when low > high. Like finding a word in a dictionary by opening it in the middle.',
    forbid: NO_SEARCH,
  },
  172: {
    example: 'Example: searchInsert({1, 3, 5, 6}, 2) returns 1.',
    starter: fn('int searchInsert(vector<int>& nums, int target)', 'nums is sorted. The position of target, or where it would go to keep nums sorted.', nums('1, 3, 5, 6'), show('searchInsert(nums, 2)')),
    hint: 'Binary search with low = 0 and high = nums.size(): if nums[mid] < target, low = mid + 1, otherwise high = mid. When they meet, low is the answer. Like finding where a new book goes on a sorted shelf.',
    forbid: NO_SEARCH,
  },
  173: {
    example: 'Example: countOccurrences({1, 2, 2, 2, 3}, 2) returns 3.',
    starter: fn('int countOccurrences(vector<int>& nums, int target)', 'nums is sorted. How many times target appears, in O(log n) (two binary searches).', nums('1, 2, 2, 2, 3'), show('countOccurrences(nums, 2)')),
    forbid: { ...NO_SEARCH, why: 'This question asks you to use binary search, not counting one by one.' },
  },
  174: {
    example: 'Example: floorSqrt(8) returns 2.',
    starter: fn('int floorSqrt(int n)', 'The largest whole r with r * r <= n (n is 0 or more), using binary search.', '', show('floorSqrt(8)')),
    hint: 'Search r between 0 and n: if mid * mid <= n (work it out as a long long, or it overflows), remember mid and look higher; otherwise look lower. Like guessing a number with "higher" or "lower" answers.',
    forbid: NO_ROOT,
  },
  175: {
    example: 'Example: isPerfectSquare(16) returns true, isPerfectSquare(14) returns false.',
    starter: fn('bool isPerfectSquare(int n)', 'true if n (1 or more) is some whole number times itself. Without sqrt().', '', 'cout << boolalpha << isPerfectSquare(16) << endl;'),
    hint: 'Binary search a whole number r between 1 and n with r * r == n (a long long, so it cannot overflow): too small, go higher; too big, go lower. If the search ends without a match, n is not a perfect square. Like checking whether square tiles can exactly cover a square floor.',
    forbid: NO_ROOT,
  },
  176: {
    example: 'Example: guessNumber(10, g) returns 6 when the hidden number is 6.',
    starter: fn(
      'int guessNumber(int n, Guesser g)',
      'A number from 1 to n is hidden. Find it with g.guess(x).',
      'Guesser g(6);',
      show('guessNumber(10, g)'),
      `class Guesser {
public:
    // A stand-in for trying it out: guess(x) says if x is the hidden number.
    int hidden;

    Guesser(int hidden) {
        this->hidden = hidden;
    }

    int guess(int x) {
        // 0 if x is right, -1 if the hidden number is lower than x, 1 if it is higher.
        if (x == hidden) return 0;
        return hidden < x ? -1 : 1;
    }
};`,
    ),
    hint: 'Binary search from 1 to n: call g.guess(mid) with mid = low + (high - low) / 2 (low + high would overflow an int for big n); 0 means found, -1 means search below mid, 1 means search above. About 31 guesses are enough even for two billion. Like the "higher or lower" game with a friend.',
  },
  177: {
    example: 'Example: firstBadVersion(5, checker) returns 4 when versions 4 and 5 are bad.',
    starter: fn(
      'int firstBadVersion(int n, VersionChecker checker)',
      'Versions 1 to n; from some version on, every version is bad.\nReturn the first bad one, calling checker.isBad(v) as few times as you can.',
      'VersionChecker checker(4);',
      show('firstBadVersion(5, checker)'),
      `class VersionChecker {
public:
    // A stand-in for trying it out: from version firstBad on, every version is bad.
    int firstBad;

    VersionChecker(int firstBad) {
        this->firstBad = firstBad;
    }

    bool isBad(int v) {
        return v >= firstBad;
    }
};`,
    ),
    hint: 'Binary search: if checker.isBad(mid), the first bad version is mid or earlier (high = mid); otherwise it is after mid (low = mid + 1). When low == high, that is the answer. Use mid = low + (high - low) / 2 so it never overflows. Like finding the day milk went off by checking the middle of the week first.',
  },
  178: {
    example: "Example: nextLetter({'c', 'f', 'j'}, 'c') returns 'f'; with none bigger, it wraps to the first letter.",
    starter: fn('char nextLetter(vector<char>& letters, char target)', 'letters is sorted. The smallest letter bigger than target; if there is none, letters[0].', "vector<char> letters = {'c', 'f', 'j'};", show("nextLetter(letters, 'c')")),
  },
  179: {
    example: 'Example: searchRange({5, 7, 7, 8, 8, 10}, 8) returns [3, 4].',
    starter: fn('vector<int> searchRange(vector<int>& nums, int target)', 'nums is sorted. {first position, last position} of target, or {-1, -1}, in O(log n).', nums('5, 7, 7, 8, 8, 10'), 'vector<int> r = searchRange(nums, 8);\nprintVector(r);'),
  },
  180: {
    example: 'Example: findPeak({1, 2, 3, 1}) returns 2 (any peak is fine).',
    starter: fn(
      'int findPeak(vector<int>& nums)',
      'A position whose value is bigger than its neighbours (outside the vector counts as -infinity).\nNeighbouring values are never equal. Any peak is fine; aim for O(log n).',
      nums('1, 2, 3, 1'),
      show('findPeak(nums)'),
    ),
  },
  181: {
    example: 'Example: searchRotated({4, 5, 6, 7, 0, 1, 2}, 0) returns 4.',
    starter: fn('int searchRotated(vector<int>& nums, int target)', 'nums was sorted (all different), then turned around some point. Position of target, or -1, in O(log n).', nums('4, 5, 6, 7, 0, 1, 2'), show('searchRotated(nums, 0)')),
  },
  182: {
    example: 'Example: findMinRotated({3, 4, 5, 1, 2}) returns 1.',
    starter: fn('int findMinRotated(vector<int>& nums)', 'nums was sorted (all different), then turned around some point. Its smallest value, in O(log n).', nums('3, 4, 5, 1, 2'), show('findMinRotated(nums)')),
    forbid: { names: ['min', 'min_element', 'sort', 'stable_sort'], why: 'This question asks you to find it with binary search, without min() or sorting.' },
  },
  183: {
    example: 'Example: searchMatrix(matrix, 5) returns true when every row and column of matrix is sorted.',
    starter: fn('bool searchMatrix(vector<vector<int>>& matrix, int target)', 'Every row is sorted left to right and every column top to bottom. true if target is there.', MATRIX, 'cout << boolalpha << searchMatrix(matrix, 5) << endl;'),
  },
  184: {
    example: 'Example: singleInSorted({1, 1, 2, 3, 3, 4, 4, 8, 8}) returns 2.',
    starter: fn('int singleInSorted(vector<int>& nums)', 'nums is sorted; every value appears twice except one. Find it in O(log n).', nums('1, 1, 2, 3, 3, 4, 4, 8, 8'), show('singleInSorted(nums)')),
  },
  185: {
    example: 'Example: minEatingSpeed({3, 6, 7, 11}, 8) returns 4.',
    starter: fn(
      'int minEatingSpeed(vector<int>& piles, int h)',
      'Eat at k bananas an hour (one pile at a time; a smaller pile still takes the whole hour).\nThe smallest k that finishes all piles within h hours.',
      'vector<int> piles = {3, 6, 7, 11};',
      show('minEatingSpeed(piles, 8)'),
    ),
    hint: 'The answer is between 1 and the biggest pile. For a speed k, the hours are the sum of (pile + k - 1) / k. Binary search the smallest k whose hours are <= h. Like finding the slowest pace that still gets you to the station on time.',
  },
  186: {
    example: 'Example: shipWithinDays({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) returns 15.',
    starter: fn('int shipWithinDays(vector<int>& weights, int days)', 'Packages go in order, one ship load per day. The smallest ship capacity that ships them all in days.', 'vector<int> weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};', show('shipWithinDays(weights, 5)')),
  },
  187: {
    example: 'Example: kthSmallestMatrix({{1, 5, 9}, {10, 11, 13}, {12, 13, 15}}, 8) returns 13.',
    starter: fn('int kthSmallestMatrix(vector<vector<int>>& matrix, int k)', 'Rows and columns are sorted. The kth smallest value (counting repeats).', 'vector<vector<int>> matrix = {{1, 5, 9}, {10, 11, 13}, {12, 13, 15}};', show('kthSmallestMatrix(matrix, 8)')),
  },
  188: {
    example: 'Example: searchUnknown(reader, 9) returns 4 for the hidden list [-1, 0, 3, 5, 9, 12].',
    starter: fn(
      'int searchUnknown(Reader reader, int target)',
      'The position of target, or -1, using only reader.get(i).',
      'vector<int> data = {-1, 0, 3, 5, 9, 12};\nReader reader(data);',
      show('searchUnknown(reader, 9)'),
      `class Reader {
public:
    // A stand-in for trying it out: a sorted list whose length you are not told.
    vector<int> data;

    Reader(vector<int> data) {
        this->data = data;
    }

    int get(int i) {
        // Item i, or 2147483647 past the end.
        return i >= 0 && i < data.size() ? data[i] : 2147483647;
    }
};`,
    ),
    hint: 'First find a range: start with high = 1 and double it while reader.get(high) < target. Then binary search between high / 2 and high (values past the end read as huge, so they count as "too big"). Like searching a street with no end sign: jump ahead in bigger steps, then look closely.',
  },
  189: {
    example: 'Example: splitArray({7, 2, 5, 10, 8}, 2) returns 18 ([7, 2, 5] and [10, 8]).',
    starter: fn('int splitArray(vector<int>& nums, int k)', 'Cut nums into k non-empty runs of neighbours. Make the largest run sum as small as possible.', nums('7, 2, 5, 10, 8'), show('splitArray(nums, 2)')),
  },
  190: {
    example: 'Example: medianSorted({1, 2}, {3, 4}) returns 2.5.',
    starter: fn('double medianSorted(vector<int>& a, vector<int>& b)', 'a and b are sorted. The median of all their numbers together, in O(log(m + n)).', 'vector<int> a = {1, 2};\nvector<int> b = {3, 4};', show('medianSorted(a, b)')),
    hint: 'Binary search how many items to take from the shorter vector (i), taking the rest of the left half from the other (j). The split is right when the biggest left item of each vector is <= the smallest right item of the other (use INT_MIN and INT_MAX past the ends); then the median comes from those four edge values. Like cutting two sorted decks so that every card on the left is smaller than every card on the right.',
    forbid: { names: ['sort', 'stable_sort', 'merge', 'inplace_merge'], why: 'This question asks for O(log(m + n)) without merging and sorting.' },
  },
});
