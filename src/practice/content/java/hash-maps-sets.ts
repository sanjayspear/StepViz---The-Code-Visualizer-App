// Practice, Java: Hash maps & sets (Q86-Q110). Tests come from the Python content;
// reference solutions in tests/practice/java/hash-maps-sets.solutions.ts.
import { fromPython } from '../javascript/shared';
import { HASH_MAPS_SETS } from '../python/hash-maps-sets';
import { one } from './shared';

const UTIL = 'import java.util.*;';
const call = (header: string, comment: string, expr: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${expr}));` : `System.out.println(${expr});`, UTIL);

export const HASH_MAPS_SETS_JAVA = fromPython(HASH_MAPS_SETS, {
  86: {
    example: 'Example: twoSum(new int[] {2, 7, 11, 15}, 9) returns [0, 1].',
    starter: call('int[] twoSum(int[] nums, int target)', 'The positions [i, j] (i < j) of the two numbers that add up to target (there is exactly one pair).', 'twoSum(new int[] {2, 7, 11, 15}, 9)', true),
    hint: 'Walk through the array keeping a HashMap of value -> position for the numbers already seen. For each x, check whether the map has target - x: if so, you have the pair. Like looking for a dance partner whose height adds up to the right total, asking the room as each person walks in.',
  },
  87: {
    example: 'Example: containsDuplicate(new int[] {1, 2, 3, 1}) returns true.',
    starter: call('boolean containsDuplicate(int[] nums)', 'true if any value appears more than once.', 'containsDuplicate(new int[] {1, 2, 3, 1})'),
    hint: 'Keep a HashSet of values seen; if a value is already in the set (add returns false), there is a duplicate. Like a cloakroom attendant who notices a second coat with the same ticket.',
  },
  88: {
    example: 'Example: elementFrequency(new int[] {1, 2, 2, 3, 3, 3}) returns {1=1, 2=2, 3=3}.',
    starter: call('Map<Integer, Integer> elementFrequency(int[] nums)', 'A map from each value to how many times it appears.', 'elementFrequency(new int[] {1, 2, 2, 3, 3, 3})'),
    hint: 'Start with an empty HashMap and add 1 to the count of each value: counts.put(x, counts.getOrDefault(x, 0) + 1). Like counting votes by keeping a tally next to each candidate.',
  },
  89: {
    example: 'Example: mostFrequent(new int[] {1, 3, 2, 3, 1, 3}) returns 3; for a tie, the smallest value.',
    starter: call('int mostFrequent(int[] nums)', 'The value that appears most often (the smallest of them if several tie).', 'mostFrequent(new int[] {1, 3, 2, 3, 1, 3})'),
    hint: 'Count every value in a HashMap, then pick the value with the biggest count, breaking ties by the smaller value (loop over the keys and replace the best only when the count is bigger, or equal with a smaller value). Like finding the most popular ice-cream flavour from a tally sheet.',
  },
  90: {
    example: 'Example: appearOnce(new int[] {4, 3, 2, 7, 8, 2, 3, 1}) returns [4, 7, 8, 1].',
    starter: call('List<Integer> appearOnce(int[] nums)', 'The values that appear exactly once, in their order in nums.', 'appearOnce(new int[] {4, 3, 2, 7, 8, 2, 3, 1})'),
  },
  91: {
    example: 'Example: sameElements(new int[] {1, 2, 3}, new int[] {3, 2, 1}) returns true.',
    starter: call('boolean sameElements(int[] a, int[] b)', 'true if a and b hold the same values the same number of times (in any order).', 'sameElements(new int[] {1, 2, 3}, new int[] {3, 2, 1})'),
    hint: 'Count the values of a in a HashMap, subtract the values of b, and check that every count ends at 0. Like checking that two shopping bags hold exactly the same items.',
  },
  92: {
    example: 'Example: commonInThree(new int[] {1, 5, 10, 20, 40, 80}, new int[] {6, 7, 20, 80, 100}, new int[] {3, 4, 15, 20, 30, 70, 80, 120}) returns [20, 80].',
    starter: call(
      'List<Integer> commonInThree(int[] a, int[] b, int[] c)',
      'a, b and c are sorted. The values in all three, each once, in order.',
      'commonInThree(new int[] {1, 5, 10, 20, 40, 80}, new int[] {6, 7, 20, 80, 100}, new int[] {3, 4, 15, 20, 30, 70, 80, 120})',
    ),
  },
  93: {
    example: 'Example: isIsomorphic("egg", "add") returns true.',
    starter: call('boolean isIsomorphic(String s, String t)', 'true if the letters of s can be replaced (each letter always by the same letter,\nno two letters by the same one) to get t.', 'isIsomorphic("egg", "add")'),
    hint: 'Keep two HashMaps, s-letter -> t-letter and t-letter -> s-letter. At each position, both must agree with what was seen before (or be new). Like a secret code: each letter always turns into the same letter, and no two letters share a code.',
  },
  94: {
    example: 'Example: wordPattern("abba", "dog cat cat dog") returns true.',
    starter: call('boolean wordPattern(String pattern, String s)', 'true if the words of s follow the pattern: each letter stands for one word, each word for one letter.', 'wordPattern("abba", "dog cat cat dog")'),
    hint: 'Split s into words (s.split(" ")); if there are not as many words as letters, the answer is no. Then use two HashMaps (letter -> word and word -> letter), exactly like checking an isomorphism. Like a seating plan: each letter is a seat, and each seat has one guest.',
  },
  95: {
    example: 'Example: canConstruct("aa", "aab") returns true.',
    starter: call('boolean canConstruct(String note, String magazine)', 'true if the note can be written with letters cut from the magazine (each used once).', 'canConstruct("aa", "aab")'),
  },
  96: {
    example: 'Example: isHappy(19) returns true (1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, 1² + 0² + 0² = 1).',
    starter: call('boolean isHappy(int n)', 'Replace n by the sum of the squares of its digits again and again.\ntrue if this reaches 1.', 'isHappy(19)'),
    hint: 'Keep a HashSet of the numbers you have already seen. Stop with true at 1, and with false when a number comes back (you are going round in a circle). Like a walk where seeing the same signpost twice means you are lost in a loop.',
  },
  97: {
    example: 'Example: nearbyDuplicate(new int[] {1, 2, 3, 1}, 3) returns true.',
    starter: call('boolean nearbyDuplicate(int[] nums, int k)', 'true if two equal values are at most k positions apart.', 'nearbyDuplicate(new int[] {1, 2, 3, 1}, 3)'),
    hint: 'Remember the last position of each value in a HashMap. When a value comes again, check whether i - last.get(value) <= k, then update its last position. Like noticing a friend who sat in your row within the last few seats.',
  },
  98: {
    example: 'Example: topKFrequent(new int[] {1, 1, 1, 2, 2, 3}, 2) returns [1, 2] (in any order).',
    starter: call('List<Integer> topKFrequent(int[] nums, int k)', 'The k values that appear most often (in any order).', 'topKFrequent(new int[] {1, 1, 1, 2, 2, 3}, 2)'),
  },
  99: {
    example: 'Example: frequencySort("tree") returns "eert" (most frequent first; ties in alphabetical order).',
    starter: call('String frequencySort(String s)', 'The characters of s, the most frequent first (each written as often as it appears);\nequally frequent ones in alphabetical order.', 'frequencySort("tree")'),
    hint: 'Count the characters, then sort the different characters by count (biggest first) and, for equal counts, alphabetically; write each one count times. Like arranging trophies: the biggest pile in front, equal piles in alphabetical order.',
  },
  100: {
    example: 'Example: subarraySumCount(new int[] {1, 1, 1}, 2) returns 2.',
    starter: call('int subarraySumCount(int[] nums, int k)', 'How many runs of neighbouring numbers add up to exactly k?', 'subarraySumCount(new int[] {1, 1, 1}, 2)'),
    hint: 'Keep the running total and a HashMap of how often each running total has appeared (start with 0 seen once). A run ending here adds up to k exactly when total - k appeared before, so add that count. Like checking your bank balance: two balances differing by k mean the purchases in between cost k.',
  },
  101: {
    example: 'Example: longestZeroSum(new int[] {15, -2, 2, -8, 1, 7, 10, 23}) returns 5 (-2, 2, -8, 1, 7).',
    starter: call('int longestZeroSum(int[] nums)', 'The length of the longest run of neighbouring numbers that adds up to 0.', 'longestZeroSum(new int[] {15, -2, 2, -8, 1, 7, 10, 23})'),
  },
  102: {
    example: 'Example: longestEqual01(new int[] {0, 1, 0}) returns 2.',
    starter: call('int longestEqual01(int[] nums)', 'nums holds 0s and 1s. The longest run with as many 0s as 1s.', 'longestEqual01(new int[] {0, 1, 0})'),
  },
  103: {
    example: 'Example: pairsWithDifference(new int[] {3, 1, 4, 1, 5}, 2) returns 2 ((1, 3) and (3, 5)).',
    starter: call('int pairsWithDifference(int[] nums, int k)', 'How many different pairs of values differ by exactly k (k is 0 or more)?', 'pairsWithDifference(new int[] {3, 1, 4, 1, 5}, 2)'),
    hint: 'Count the values in a HashMap. For k > 0, count the different values x where x + k is also there; for k == 0, count the values that appear at least twice. Like pairing people whose ages differ by exactly k years, each pair of ages counted once.',
  },
  104: {
    example: 'Example: pairsDivisibleByK(new int[] {2, 2, 1, 7, 5, 3}, 4) returns 5.',
    starter: call('int pairsDivisibleByK(int[] nums, int k)', 'How many pairs of positions i < j have nums[i] + nums[j] divisible by k?', 'pairsDivisibleByK(new int[] {2, 2, 1, 7, 5, 3}, 4)'),
  },
  105: {
    example: 'Example: validSudoku(board) returns true when no row, column or 3×3 box repeats a digit.',
    starter: one(
      'boolean validSudoku(char[][] board)',
      'board is 9 rows of 9 cells, each \'1\'-\'9\' or \'.\' for empty.\ntrue if no row, column or 3x3 box holds the same digit twice.',
      'char[][] board = new char[9][9];\nfor (int r = 0; r < 9; r++) {\n    for (int c = 0; c < 9; c++) board[r][c] = \'.\';\n}\nSystem.out.println(validSudoku(board));',
      UTIL,
    ),
    hint: 'Keep a HashSet for every row, every column and every box (box number r / 3 * 3 + c / 3). For each digit, if it is already in its row, column or box set, the board is not valid; otherwise add it to all three. Like a hotel where no floor, corridor or wing may have two guests with the same name.',
  },
  106: {
    example: 'Example: fourSumCount(new int[] {1, 2}, new int[] {-2, -1}, new int[] {-1, 2}, new int[] {0, 2}) returns 2.',
    starter: call(
      'int fourSumCount(int[] a, int[] b, int[] c, int[] d)',
      'How many ways to pick one number from each array so the four add up to 0?',
      'fourSumCount(new int[] {1, 2}, new int[] {-2, -1}, new int[] {-1, 2}, new int[] {0, 2})',
    ),
    hint: 'Count every sum x + y of a pair from a and b in a HashMap. Then for each pair from c and d, add the count of -(z + w). That is O(n²) instead of O(n⁴). Like matching two halves of a torn ticket: count the left halves first, then look up each right half.',
  },
  107: {
    example: 'Example: m = new MyHashMap(); m.put(1, 1); m.get(1) returns 1; m.get(3) returns -1.',
    starter: `import java.util.*;

class MyHashMap {
    // A hash map built from scratch, without HashMap, TreeMap or HashSet.
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
}

public class Main {
    public static void main(String[] args) {
        MyHashMap m = new MyHashMap();
        m.put(1, 1);
        System.out.println(m.get(1));
        System.out.println(m.get(3));
    }
}
`,
    hint: 'Make 1000 buckets: a list of key lists and a list of value lists. A key goes in bucket key % 1000, and you search only that small bucket for it. Like a cloakroom with numbered rails: you only look along the rail your ticket number points to.',
    forbid: { names: ['Map', 'HashMap', 'TreeMap', 'LinkedHashMap', 'Set', 'HashSet', 'TreeSet', 'LinkedHashSet'], why: 'This question asks you to build the hash map yourself, without HashMap or HashSet.' },
  },
  108: {
    example: 'Example: c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1) returns 1; c.put(3, 3) removes key 2.',
    starter: `import java.util.*;

class LRUCache {
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
}

public class Main {
    public static void main(String[] args) {
        LRUCache c = new LRUCache(2);
        c.put(1, 1);
        System.out.println(c.get(1));
    }
}
`,
    hint: 'A LinkedHashMap remembers the order keys were put in. On every get or put of a key, remove it and put it again so it moves to the end; when there are too many keys, remove the first one (the first key of keySet()), which is the least recently used. Like a small bookshelf: the book you just read goes on the right, and when it is full you give away the one on the far left.',
  },
  109: {
    example: 'Example: groupShifted(new String[] {"abc", "bcd", "xyz", "az", "ba"}) returns [[abc, bcd, xyz], [az, ba]] (in any order).',
    starter: call('List<List<String>> groupShifted(String[] words)', 'Put words that are the same after shifting every letter by the same amount\n(z wraps round to a) in the same group.', 'groupShifted(new String[] {"abc", "bcd", "xyz", "az", "ba"})'),
    hint: 'Shifted words have the same gaps between neighbouring letters. Use the gaps ((w.charAt(i) - w.charAt(i - 1) + 26) % 26, joined into a String) as a HashMap key and group the words by it. Like songs that sound alike in a different key: the steps between the notes are the same.',
  },
  110: {
    example: 'Example: firstMissingPositive(new int[] {3, 4, -1, 1}) returns 2.',
    starter: call('int firstMissingPositive(int[] nums)', 'The smallest whole number above 0 that is not in nums, in O(n) time and O(1) extra space.', 'firstMissingPositive(new int[] {3, 4, -1, 1})'),
  },
});
