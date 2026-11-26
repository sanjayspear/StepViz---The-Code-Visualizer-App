// Practice, C++: Hash maps & sets (Q86-Q110). Tests come from the Python content;
// reference solutions in tests/practice/cpp/hash-maps-sets.solutions.ts.
import { fromPython } from '../javascript/shared';
import { HASH_MAPS_SETS } from '../python/hash-maps-sets';
import { cppStarter, PRINT_INTS } from './shared';

const MAPS = ['map', 'set', 'unordered_map', 'unordered_set'];
const fn = (header: string, comment: string, setup: string, print: string) => cppStarter([[header, comment]], `${setup}\n${print}`, MAPS, PRINT_INTS);
const nums = (values: string) => `vector<int> nums = {${values}};`;
const show = (expr: string) => `cout << ${expr} << endl;`;
const yes = (expr: string) => `cout << boolalpha << ${expr} << endl;`;

const cls = (body: string, main: string) =>
  `#include <iostream>\n#include <vector>\n#include <string>\n#include <map>\nusing namespace std;\n\n${body.trim()}\n\nint main() {\n${main
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n')}\n    return 0;\n}\n`;

export const HASH_MAPS_SETS_CPP = fromPython(HASH_MAPS_SETS, {
  86: {
    example: 'Example: twoSum({2, 7, 11, 15}, 9) returns [0, 1].',
    starter: fn('vector<int> twoSum(vector<int>& nums, int target)', 'The positions {i, j} (i < j) of the two numbers that add up to target (there is exactly one pair).', nums('2, 7, 11, 15'), 'vector<int> r = twoSum(nums, 9);\nprintVector(r);'),
    hint: 'Walk through the vector keeping a map of value -> position for the numbers already seen. For each x, check whether the map has target - x (count): if so, you have the pair. Like looking for a dance partner whose height adds up to the right total, asking the room as each person walks in.',
  },
  87: {
    example: 'Example: containsDuplicate({1, 2, 3, 1}) returns true.',
    starter: fn('bool containsDuplicate(vector<int>& nums)', 'true if any value appears more than once.', nums('1, 2, 3, 1'), yes('containsDuplicate(nums)')),
    hint: 'Keep a set<int> of values seen; if a value is already in the set (count is 1), there is a duplicate. Like a cloakroom attendant who notices a second coat with the same ticket.',
  },
  88: {
    example: 'Example: elementFrequency({1, 2, 2, 3, 3, 3}) returns {1: 1, 2: 2, 3: 3}.',
    starter: fn('map<int, int> elementFrequency(vector<int>& nums)', 'A map from each value to how many times it appears.', nums('1, 2, 2, 3, 3, 3'), show('elementFrequency(nums).size()')),
    hint: 'Start with an empty map<int, int> and add 1 to the count of each value: counts[x]++ (a missing key starts at 0). Like counting votes by keeping a tally next to each candidate.',
  },
  89: {
    example: 'Example: mostFrequent({1, 3, 2, 3, 1, 3}) returns 3; for a tie, the smallest value.',
    starter: fn('int mostFrequent(vector<int>& nums)', 'The value that appears most often (the smallest of them if several tie).', nums('1, 3, 2, 3, 1, 3'), show('mostFrequent(nums)')),
    hint: 'Count every value in a map<int, int>, then pick the value with the biggest count. A map walks its keys from smallest to largest, so replacing the best only when a count is strictly bigger keeps the smallest of tied values. Like finding the most popular ice-cream flavour from a tally sheet.',
  },
  90: {
    example: 'Example: appearOnce({4, 3, 2, 7, 8, 2, 3, 1}) returns [4, 7, 8, 1].',
    starter: fn('vector<int> appearOnce(vector<int>& nums)', 'The values that appear exactly once, in their order in nums.', nums('4, 3, 2, 7, 8, 2, 3, 1'), 'vector<int> r = appearOnce(nums);\nprintVector(r);'),
  },
  91: {
    example: 'Example: sameElements({1, 2, 3}, {3, 2, 1}) returns true.',
    starter: fn('bool sameElements(vector<int>& a, vector<int>& b)', 'true if a and b hold the same values the same number of times (in any order).', 'vector<int> a = {1, 2, 3};\nvector<int> b = {3, 2, 1};', yes('sameElements(a, b)')),
    hint: 'Count the values of a in a map<int, int>, subtract the values of b, and check that every count ends at 0. Like checking that two shopping bags hold exactly the same items.',
  },
  92: {
    example: 'Example: commonInThree({1, 5, 10, 20, 40, 80}, {6, 7, 20, 80, 100}, {3, 4, 15, 20, 30, 70, 80, 120}) returns [20, 80].',
    starter: fn(
      'vector<int> commonInThree(vector<int>& a, vector<int>& b, vector<int>& c)',
      'a, b and c are sorted. The values in all three, each once, in order.',
      'vector<int> a = {1, 5, 10, 20, 40, 80};\nvector<int> b = {6, 7, 20, 80, 100};\nvector<int> c = {3, 4, 15, 20, 30, 70, 80, 120};',
      'vector<int> r = commonInThree(a, b, c);\nprintVector(r);',
    ),
  },
  93: {
    example: 'Example: isIsomorphic("egg", "add") returns true.',
    starter: fn('bool isIsomorphic(string s, string t)', 'true if the letters of s can be replaced (each letter always by the same letter,\nno two letters by the same one) to get t.', '', yes('isIsomorphic("egg", "add")')),
    hint: 'Keep two map<char, char>, s-letter -> t-letter and t-letter -> s-letter. At each position, both must agree with what was seen before (or be new). Like a secret code: each letter always turns into the same letter, and no two letters share a code.',
  },
  94: {
    example: 'Example: wordPattern("abba", "dog cat cat dog") returns true.',
    starter: fn('bool wordPattern(string pattern, string s)', 'true if the words of s follow the pattern: each letter stands for one word, each word for one letter.', '', yes('wordPattern("abba", "dog cat cat dog")')),
    hint: 'Split s into words (build each word until a space); if there are not as many words as letters, the answer is no. Then use two maps (letter -> word and word -> letter), exactly like checking an isomorphism. Like a seating plan: each letter is a seat, and each seat has one guest.',
  },
  95: {
    example: 'Example: canConstruct("aa", "aab") returns true.',
    starter: fn('bool canConstruct(string note, string magazine)', 'true if the note can be written with letters cut from the magazine (each used once).', '', yes('canConstruct("aa", "aab")')),
  },
  96: {
    example: 'Example: isHappy(19) returns true (1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, 1² + 0² + 0² = 1).',
    starter: fn('bool isHappy(int n)', 'Replace n by the sum of the squares of its digits again and again.\ntrue if this reaches 1.', '', yes('isHappy(19)')),
    hint: 'Keep a set<int> of the numbers you have already seen. Stop with true at 1, and with false when a number comes back (you are going round in a circle). Like a walk where seeing the same signpost twice means you are lost in a loop.',
  },
  97: {
    example: 'Example: nearbyDuplicate({1, 2, 3, 1}, 3) returns true.',
    starter: fn('bool nearbyDuplicate(vector<int>& nums, int k)', 'true if two equal values are at most k positions apart.', nums('1, 2, 3, 1'), yes('nearbyDuplicate(nums, 3)')),
    hint: 'Remember the last position of each value in a map<int, int>. When a value comes again, check whether i - last[value] <= k, then update its last position. Like noticing a friend who sat in your row within the last few seats.',
  },
  98: {
    example: 'Example: topKFrequent({1, 1, 1, 2, 2, 3}, 2) returns [1, 2] (in any order).',
    starter: fn('vector<int> topKFrequent(vector<int>& nums, int k)', 'The k values that appear most often (in any order).', nums('1, 1, 1, 2, 2, 3'), 'vector<int> r = topKFrequent(nums, 2);\nprintVector(r);'),
  },
  99: {
    example: 'Example: frequencySort("tree") returns "eert" (most frequent first; ties in alphabetical order).',
    starter: fn('string frequencySort(string s)', 'The characters of s, the most frequent first (each written as often as it appears);\nequally frequent ones in alphabetical order.', '', show('frequencySort("tree")')),
    hint: 'Count the characters in a map<char, int>. Then, again and again, pick the character with the biggest count left (the first one in alphabetical order on a tie), write it count times, and remove it. Like arranging trophies: the biggest pile in front, equal piles in alphabetical order.',
  },
  100: {
    example: 'Example: subarraySumCount({1, 1, 1}, 2) returns 2.',
    starter: fn('int subarraySumCount(vector<int>& nums, int k)', 'How many runs of neighbouring numbers add up to exactly k?', nums('1, 1, 1'), show('subarraySumCount(nums, 2)')),
    hint: 'Keep the running total and a map<int, int> of how often each running total has appeared (start with seen[0] = 1). A run ending here adds up to k exactly when total - k appeared before, so add that count. Like checking your bank balance: two balances differing by k mean the purchases in between cost k.',
  },
  101: {
    example: 'Example: longestZeroSum({15, -2, 2, -8, 1, 7, 10, 23}) returns 5 (-2, 2, -8, 1, 7).',
    starter: fn('int longestZeroSum(vector<int>& nums)', 'The length of the longest run of neighbouring numbers that adds up to 0.', nums('15, -2, 2, -8, 1, 7, 10, 23'), show('longestZeroSum(nums)')),
  },
  102: {
    example: 'Example: longestEqual01({0, 1, 0}) returns 2.',
    starter: fn('int longestEqual01(vector<int>& nums)', 'nums holds 0s and 1s. The longest run with as many 0s as 1s.', nums('0, 1, 0'), show('longestEqual01(nums)')),
  },
  103: {
    example: 'Example: pairsWithDifference({3, 1, 4, 1, 5}, 2) returns 2 ((1, 3) and (3, 5)).',
    starter: fn('int pairsWithDifference(vector<int>& nums, int k)', 'How many different pairs of values differ by exactly k (k is 0 or more)?', nums('3, 1, 4, 1, 5'), show('pairsWithDifference(nums, 2)')),
    hint: 'Count the values in a map<int, int>. For k > 0, count the different values x where x + k is also there; for k == 0, count the values that appear at least twice. Like pairing people whose ages differ by exactly k years, each pair of ages counted once.',
  },
  104: {
    example: 'Example: pairsDivisibleByK({2, 2, 1, 7, 5, 3}, 4) returns 5.',
    starter: fn('int pairsDivisibleByK(vector<int>& nums, int k)', 'How many pairs of positions i < j have nums[i] + nums[j] divisible by k?', nums('2, 2, 1, 7, 5, 3'), show('pairsDivisibleByK(nums, 4)')),
  },
  105: {
    example: 'Example: validSudoku(board) returns true when no row, column or 3×3 box repeats a digit.',
    starter: fn(
      'bool validSudoku(vector<vector<char>>& board)',
      "board is 9 rows of 9 cells, each '1'-'9' or '.' for empty.\ntrue if no row, column or 3x3 box holds the same digit twice.",
      "vector<vector<char>> board(9, vector<char>(9, '.'));",
      yes('validSudoku(board)'),
    ),
    hint: 'Keep a table of seen digits for every row, every column and every box (vector<vector<int>> rows(9, vector<int>(10, 0)) and the same for columns and boxes; box number r / 3 * 3 + c / 3). For each digit, if it is already in its row, column or box set, the board is not valid; otherwise add it to all three. Like a hotel where no floor, corridor or wing may have two guests with the same name.',
  },
  106: {
    example: 'Example: fourSumCount({1, 2}, {-2, -1}, {-1, 2}, {0, 2}) returns 2.',
    starter: fn(
      'int fourSumCount(vector<int>& a, vector<int>& b, vector<int>& c, vector<int>& d)',
      'How many ways to pick one number from each vector so the four add up to 0?',
      'vector<int> a = {1, 2};\nvector<int> b = {-2, -1};\nvector<int> c = {-1, 2};\nvector<int> d = {0, 2};',
      show('fourSumCount(a, b, c, d)'),
    ),
    hint: 'Count every sum x + y of a pair from a and b in a map<int, int>. Then for each pair from c and d, add the count of -(z + w). That is O(n²) instead of O(n⁴). Like matching two halves of a torn ticket: count the left halves first, then look up each right half.',
  },
  107: {
    example: 'Example: MyHashMap m; m.put(1, 1); m.get(1) returns 1; m.get(3) returns -1.',
    starter: cls(
      `class MyHashMap {
public:
    // A hash map built from scratch, without map, unordered_map or set.
    MyHashMap() {
    }

    void put(int key, int value) {
        // Store value for key (replace an old value).
    }

    int get(int key) {
        // The value for key, or -1 if there is none.
        return -1;
    }

    void remove(int key) {
        // Forget key (if it is there).
    }
};`,
      'MyHashMap m;\nm.put(1, 1);\ncout << m.get(1) << endl;\ncout << m.get(3) << endl;',
    ),
    hint: 'Make 1000 buckets: a vector of key vectors and a vector of value vectors. A key goes in bucket key % 1000, and you search only that small bucket for it. Like a cloakroom with numbered rails: you only look along the rail your ticket number points to.',
    forbid: {
      patterns: [
        { regex: '(unordered_map|unordered_set|multimap|multiset)<', shown: 'unordered_map or unordered_set' },
        { regex: '(^|[^_])(map|set)<', shown: 'map or set' },
      ],
      why: 'This question asks you to build the hash map yourself, without map or set.',
    },
  },
  108: {
    example: 'Example: LRUCache c(2); c.put(1, 1); c.put(2, 2); c.get(1) returns 1; c.put(3, 3) removes key 2.',
    starter: cls(
      `class LRUCache {
public:
    // Holds at most capacity keys; when full, putting a new key removes the least recently used one.
    LRUCache(int capacity) {
    }

    int get(int key) {
        // The value for key (and key becomes the most recently used), or -1.
        return -1;
    }

    void put(int key, int value) {
        // Store value for key (key becomes the most recently used).
    }
};`,
      'LRUCache c(2);\nc.put(1, 1);\ncout << c.get(1) << endl;',
    ),
    hint: 'Keep the keys, their values and the time each was last used (a counter that goes up on every get and put) in three vectors. When there are too many keys, remove the one with the smallest time, the least recently used. Like a small bookshelf: the book you just read goes on the right, and when it is full you give away the one on the far left.',
  },
  109: {
    example: 'Example: groupShifted({"abc", "bcd", "xyz", "az", "ba"}) returns [[abc, bcd, xyz], [az, ba]] (in any order).',
    starter: fn(
      'vector<vector<string>> groupShifted(vector<string> words)',
      'Put words that are the same after shifting every letter by the same amount\n(z wraps round to a) in the same group.',
      'vector<string> words = {"abc", "bcd", "xyz", "az", "ba"};',
      show('groupShifted(words).size()'),
    ),
    hint: 'Shifted words have the same gaps between neighbouring letters. Use the gaps ((w[i] - w[i - 1] + 26) % 26, joined into a string) as a map key and group the words by it. Like songs that sound alike in a different key: the steps between the notes are the same.',
  },
  110: {
    example: 'Example: firstMissingPositive({3, 4, -1, 1}) returns 2.',
    starter: fn('int firstMissingPositive(vector<int>& nums)', 'The smallest whole number above 0 that is not in nums, in O(n) time and O(1) extra space.', nums('3, 4, -1, 1'), show('firstMissingPositive(nums)')),
  },
});
