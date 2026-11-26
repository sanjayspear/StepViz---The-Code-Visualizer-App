// Practice, JavaScript: hash-maps-sets. Tests come from the Python content; reference solutions in tests/practice/js/hash-maps-sets.solutions.ts.
import { fromPython } from './shared';
import { HASH_MAPS_SETS } from '../python/hash-maps-sets';

export const HASH_MAPS_SETS_JS = fromPython(HASH_MAPS_SETS, {
  86: {
    example: 'Example: twoSum([2, 7, 11, 15], 9) returns [0, 1].',
    starter: `function twoSum(nums, target) {
  // The positions [i, j] (i < j) of the two numbers that add up to target (there is exactly one pair).
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
    hint: "Walk through the array keeping a Map of value -> position for the numbers already seen. For each x, check whether the Map has target - x: if so, you have the pair. Like looking for a dance partner whose height adds up to the right total, asking the room as each person walks in.",
  },
  87: {
    example: 'Example: containsDuplicate([1, 2, 3, 1]) returns true.',
    starter: `function containsDuplicate(nums) {
  // true if any value appears at least twice.
}

console.log(containsDuplicate([1, 2, 3, 1]));
`,
    hint: "Keep a Set of values seen; if a value is already in the Set, there is a duplicate. (Or compare new Set(nums).size with nums.length.) Like a cloakroom attendant who notices a second coat with the same ticket.",
  },
  88: {
    example: 'Example: elementFrequency([1, 2, 2, 3, 3, 3]) returns {1: 1, 2: 2, 3: 3}.',
    starter: `function elementFrequency(nums) {
  // A dictionary: each value -> how many times it appears.
}

console.log(elementFrequency([1, 2, 2, 3, 3, 3]));
`,
    hint: "Start with an empty Map (or object) and add 1 to the count of each value: counts.set(x, (counts.get(x) ?? 0) + 1). Like counting votes by keeping a tally next to each candidate.",
  },
  89: {
    example: 'Example: mostFrequent([1, 3, 2, 3, 1, 3]) returns 3; for a tie, the smallest value.',
    starter: `function mostFrequent(nums) {
  // The value that appears most often; if several tie, the smallest of them.
}

console.log(mostFrequent([1, 3, 2, 3, 1, 3]));
`,
    hint: "Count every value in a Map, then pick the value with the biggest count, breaking ties by the smaller value (loop over the counts and replace the best only when the count is bigger, or equal with a smaller value). Like finding the most popular ice-cream flavour from a tally sheet.",
  },
  90: {
    example: 'Example: appearOnce([4, 3, 2, 7, 8, 2, 3, 1]) returns [4, 7, 8, 1].',
    starter: `function appearOnce(nums) {
  // The values that appear exactly once, in the order they appear.
}

console.log(appearOnce([4, 3, 2, 7, 8, 2, 3, 1]));
`,
  },
  91: {
    example: 'Example: sameElements([1, 2, 3], [3, 2, 1]) returns true.',
    starter: `function sameElements(a, b) {
  // true if a and b hold the same values the same number of times, in any order.
}

console.log(sameElements([1, 2, 3], [3, 2, 1]));
`,
    hint: "Count the values of a in a Map, subtract the values of b, and check that every count ends at 0. Like checking that two shopping bags hold exactly the same items.",
  },
  92: {
    example: 'Example: commonInThree([1, 5, 10, 20, 40, 80], [6, 7, 20, 80, 100], [3, 4, 15, 20, 30, 70, 80, 120]) returns [20, 80].',
    starter: `function commonInThree(a, b, c) {
  // a, b and c are sorted. The values found in all three, each once, in increasing order.
}

console.log(commonInThree([1, 5, 10, 20, 40, 80], [6, 7, 20, 80, 100], [3, 4, 15, 20, 30, 70, 80, 120]));
`,
  },
  93: {
    example: 'Example: isIsomorphic("egg", "add") returns true.',
    starter: `function isIsomorphic(s, t) {
  // true if each letter of s can be replaced (always by the same letter, no two letters
  // by the same one) to make t.
}

console.log(isIsomorphic("egg", "add"));
`,
    hint: "Keep two Maps, s-letter -> t-letter and t-letter -> s-letter. At each position, both must agree with what was seen before (or be new). Like a secret code: each letter always turns into the same letter, and no two letters share a code.",
  },
  94: {
    example: 'Example: wordPattern("abba", "dog cat cat dog") returns true.',
    starter: `function wordPattern(pattern, s) {
  // true if the words of s follow the pattern: same letter = same word, different letter = different word.
}

console.log(wordPattern("abba", "dog cat cat dog"));
`,
    hint: "Split s into words (s.split(\" \")); if there are not as many words as letters, the answer is no. Then use two Maps (letter -> word and word -> letter), exactly like checking an isomorphism. Like a seating plan: each letter is a seat, and each seat has one guest.",
  },
  95: {
    example: 'Example: canConstruct("aa", "aab") returns true.',
    starter: `function canConstruct(note, magazine) {
  // true if the letters of magazine (each used once) are enough to write note.
}

console.log(canConstruct("aa", "aab"));
`,
  },
  96: {
    example: 'Example: isHappy(19) returns true (1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, 1² + 0² + 0² = 1).',
    starter: `function isHappy(n) {
  // Replace n by the sum of the squares of its digits again and again.
  // true if this reaches 1, false if it loops forever.
}

console.log(isHappy(19));
`,
    hint: "Keep a Set of the numbers you have already seen. Stop with true at 1, and with false when a number comes back (you are going round in a circle). Like a walk where seeing the same signpost twice means you are lost in a loop.",
  },
  97: {
    example: 'Example: nearbyDuplicate([1, 2, 3, 1], 3) returns true.',
    starter: `function nearbyDuplicate(nums, k) {
  // true if two equal values sit at most k positions apart.
}

console.log(nearbyDuplicate([1, 2, 3, 1], 3));
`,
    hint: "Remember the last position of each value in a Map. When a value comes again, check whether i - last.get(value) <= k, then update its last position. Like noticing a friend who sat in your row within the last few seats.",
  },
  98: {
    example: 'Example: topKFrequent([1, 1, 1, 2, 2, 3], 2) returns [1, 2] (in any order).',
    starter: `function topKFrequent(nums, k) {
  // The k values that appear most often (in any order).
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2));
`,
  },
  99: {
    example: 'Example: frequencySort("tree") returns "eert" (most frequent first; ties in alphabetical order).',
    starter: `function frequencySort(s) {
  // Sort the characters by how often they appear, most often first.
  // Characters with the same count go in alphabetical (character code) order.
}

console.log(frequencySort("tree"));
`,
    hint: "Count the characters, then sort the distinct characters by count (biggest first) and, for equal counts, alphabetically; write each one count times (ch.repeat(count)). Like arranging trophies: the biggest pile in front, equal piles in alphabetical order.",
  },
  100: {
    example: 'Example: subarraySumCount([1, 1, 1], 2) returns 2.',
    starter: `function subarraySumCount(nums, k) {
  // How many runs of neighbouring items add up to exactly k?
}

console.log(subarraySumCount([1, 1, 1], 2));
`,
    hint: "Keep the running total and a Map of how often each running total has appeared (start with 0 seen once). A run ending here adds up to k exactly when total - k appeared before, so add that count. Like checking your bank balance: two balances differing by k mean the purchases in between cost k.",
  },
  101: {
    example: 'Example: longestZeroSum([15, -2, 2, -8, 1, 7, 10, 23]) returns 5 (-2, 2, -8, 1, 7).',
    starter: `function longestZeroSum(nums) {
  // The length of the longest run of neighbouring items that adds up to 0 (0 if none).
}

console.log(longestZeroSum([15, -2, 2, -8, 1, 7, 10, 23]));
`,
  },
  102: {
    example: 'Example: longestEqual01([0, 1, 0]) returns 2.',
    starter: `function longestEqual01(nums) {
  // nums holds 0s and 1s. The length of the longest run with as many 0s as 1s.
}

console.log(longestEqual01([0, 1, 0]));
`,
  },
  103: {
    example: 'Example: pairsWithDifference([3, 1, 4, 1, 5], 2) returns 2 ((1, 3) and (3, 5)).',
    starter: `function pairsWithDifference(nums, k) {
  // How many different pairs of values (a, b) with b - a == k are in nums? (k is 0 or more.)
}

console.log(pairsWithDifference([3, 1, 4, 1, 5], 2));
`,
    hint: "Count the values in a Map. For k > 0, count the distinct values x where x + k is also there; for k === 0, count the values that appear at least twice. Like pairing people whose ages differ by exactly k years, each pair of ages counted once.",
  },
  104: {
    example: 'Example: pairsDivisibleByK([2, 2, 1, 7, 5, 3], 4) returns 5.',
    starter: `function pairsDivisibleByK(nums, k) {
  // How many pairs of positions i < j have (nums[i] + nums[j]) divisible by k?
}

console.log(pairsDivisibleByK([2, 2, 1, 7, 5, 3], 4));
`,
    hint: "Only remainders matter. Walk through the numbers keeping a count of remainders seen; for x with remainder r, it pairs with every earlier number whose remainder is (k - r) % k. Add that count, then record r. Like matching puzzle pieces whose bumps and holes add up to a whole.",
  },
  105: {
    example: 'Example: validSudoku(board) returns true when no row, column or 3×3 box repeats a digit.',
    starter: `function validSudoku(board) {
  // board is 9 rows of 9 cells, each "1"-"9" or "." for empty.
  // true if no row, column or 3x3 box holds the same digit twice.
}

const empty = Array.from({ length: 9 }, () => new Array(9).fill("."));
console.log(validSudoku(empty));
`,
    hint: "Keep a Set for every row, every column and every box (box number Math.floor(r / 3) * 3 + Math.floor(c / 3)). For each digit, if it is already in its row, column or box Set, the board is not valid; otherwise add it to all three. Like a hotel where no floor, corridor or wing may have two guests with the same name.",
  },
  106: {
    example: 'Example: fourSumCount([1, 2], [-2, -1], [-1, 2], [0, 2]) returns 2.',
    starter: `function fourSumCount(a, b, c, d) {
  // How many ways to pick one number from each array so the four add up to 0?
}

console.log(fourSumCount([1, 2], [-2, -1], [-1, 2], [0, 2]));
`,
    hint: "Count every sum x + y of a pair from a and b in a Map. Then for each pair from c and d, add the count of -(z + w). That is O(n\u00b2) instead of O(n\u2074). Like matching two halves of a torn ticket: count the left halves first, then look up each right half.",
  },
  107: {
    example: 'Example: m = new MyHashMap(); m.put(1, 1); m.get(1) returns 1; m.get(3) returns -1.',
    starter: `class MyHashMap {
  // A hash map built from scratch, without Map, Set or an object used as a map.
  constructor() {
  }

  put(key, value) {
    // Store value for key (replace an old value).
  }

  get(key) {
    // The value for key, or -1 if there is none.
  }

  remove(key) {
    // Forget key (if it is there).
  }
}

const m = new MyHashMap();
m.put(1, 1);
console.log(m.get(1), m.get(3));
`,
    forbid: { names: ['Map', 'Set', 'WeakMap', 'WeakSet', 'Object', 'Reflect'], patterns: [{ regex: '(^|[=:]|return)\\{', shown: '{ }' }], why: 'This question asks you to build the hash map yourself, without Map, Set or an object used as a map.' },
    hint: "Make an array of buckets (say 1000 empty arrays). A key goes in bucket key % 1000; each bucket holds [key, value] pairs, and you search only that small bucket. Like a cloakroom with numbered rails: you only look along the rail your ticket number points to.",
  },
  108: {
    example: 'Example: c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1) returns 1; c.put(3, 3) removes key 2.',
    starter: `class LRUCache {
  // Holds at most capacity keys; when full, putting a new key removes the least recently used one.
  constructor(capacity) {
  }

  get(key) {
    // The value for key (and key becomes the most recently used), or -1.
  }

  put(key, value) {
    // Store value for key (key becomes the most recently used).
  }
}

const c = new LRUCache(2);
c.put(1, 1);
console.log(c.get(1));
`,
    hint: "A JavaScript Map remembers the order keys were added. On every get or put of a key, delete it and set it again so it moves to the end; when there are too many keys, delete the first one (map.keys().next().value), which is the least recently used. Like a small bookshelf: the book you just read goes on the right, and when it is full you give away the one on the far left.",
  },
  109: {
    example: 'Example: groupShifted(["abc", "bcd", "xyz", "az", "ba"]) returns [["abc", "bcd", "xyz"], ["az", "ba"]] (in any order).',
    starter: `function groupShifted(strings) {
  // Group the words that are shifts of each other ("abc" -> "bcd": every letter one further,
  // z wraps round to a). A array of groups, in any order.
}

console.log(groupShifted(["abc", "bcd", "acef", "xyz", "az", "ba", "a", "z"]));
`,
    hint: "Shifted words have the same gaps between neighbouring letters. Use the gaps ((w.charCodeAt(i) - w.charCodeAt(i - 1) + 26) % 26, joined into text) as a Map key and group the words by it. Like songs that sound alike in a different key: the steps between the notes are the same.",
  },
  110: {
    example: 'Example: firstMissingPositive([3, 4, -1, 1]) returns 2.',
    starter: `function firstMissingPositive(nums) {
  // The smallest positive whole number that is not in nums, in O(n) time and O(1) extra space.
}

console.log(firstMissingPositive([3, 4, -1, 1]));
`,
  },
});
