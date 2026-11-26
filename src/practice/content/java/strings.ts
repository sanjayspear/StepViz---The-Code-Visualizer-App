// Practice, Java: Strings (Q26-Q55). Tests come from the Python content;
// reference solutions in tests/practice/java/strings.solutions.ts.
import { fromPython } from '../javascript/shared';
import { STRINGS } from '../python/strings';
import { one } from './shared';

const UTIL = 'import java.util.*;';

export const STRINGS_JAVA = fromPython(STRINGS, {
  26: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: one('String reverseString(String s)', 'Return s backwards. Do not use StringBuilder.reverse().', 'System.out.println(reverseString("hello"));'),
    hint: 'Start with an empty result and go through s from the last position down to 0 (for (int i = s.length() - 1; i >= 0; i--)), adding each s.charAt(i). Like reading a word on a sign while walking backwards past it.',
    forbid: { names: ['reverse'], why: 'This question asks you to reverse the text yourself, without reverse().' },
  },
  27: {
    example: 'Example: isPalindromeText("A man, a plan, a canal: Panama") returns true.',
    starter: one(
      'boolean isPalindromeText(String s)',
      'true if s reads the same both ways, looking only at letters and ignoring upper/lower case.',
      'System.out.println(isPalindromeText("A man, a plan, a canal: Panama"));',
    ),
    hint: 'Keep only the letters, in lower case (Character.isLetter(c) and Character.toLowerCase(c)). Then compare the first with the last, the second with the second-last, and so on, moving two pointers towards the middle. Like folding a paper strip in half to see if both halves match.',
  },
  28: {
    example: 'Example: countVowelsConsonants("Hello World") returns [3, 7].',
    starter: one(
      'int[] countVowelsConsonants(String s)',
      '{number of vowels, number of consonants} among the letters of s (other characters do not count).',
      'System.out.println(Arrays.toString(countVowelsConsonants("Hello World")));',
      UTIL,
    ),
    hint: 'Go through the characters and skip anything that is not a letter (Character.isLetter). If "aeiou" contains the lower-case letter (\"aeiou\".indexOf(c) >= 0), count a vowel, otherwise a consonant. Return new int[] {vowels, consonants}. Like sorting letters into two piles at a post office.',
  },
  29: {
    example: 'Example: charFrequency("hello") returns {h=1, e=1, l=2, o=1}.',
    starter: one('Map<Character, Integer> charFrequency(String s)', 'A map from each character of s to how many times it appears.', 'System.out.println(charFrequency("hello"));', UTIL),
    hint: 'Start with an empty HashMap. For each character, add 1 to its count: counts.put(c, counts.getOrDefault(c, 0) + 1). Like a teacher making tally marks next to each name on a list.',
  },
  30: {
    example: 'Example: firstNonRepeating("leetcode") returns "l"; with none, it returns null.',
    starter: one('String firstNonRepeating(String s)', 'The first character that appears only once in s (as a one-letter String), or null.', 'System.out.println(firstNonRepeating("leetcode"));'),
  },
  31: {
    example: 'Example: firstRepeating("abcb") returns "b"; with none, it returns null.',
    starter: one('String firstRepeating(String s)', 'The first character that appears a second time (reading left to right), as a one-letter String, or null.', 'System.out.println(firstRepeating("abcb"));'),
  },
  32: {
    example: 'Example: removeDuplicates("banana") returns "ban".',
    starter: one('String removeDuplicates(String s)', 'Keep only the first time each character appears, in order.', 'System.out.println(removeDuplicates("banana"));'),
  },
  33: {
    example: 'Example: areAnagrams("listen", "silent") returns true.',
    starter: one('boolean areAnagrams(String a, String b)', 'true if b uses exactly the same letters as a (each the same number of times).', 'System.out.println(areAnagrams("listen", "silent"));'),
  },
  34: {
    example: 'Example: reverseWords("the sky is blue") returns "blue is sky the".',
    starter: one('String reverseWords(String sentence)', 'The words in reverse order, joined by single spaces (extra spaces are dropped).', 'System.out.println(reverseWords("the sky is blue"));'),
    hint: 'Split the sentence on spaces (sentence.split(" ")) and skip the empty pieces that extra spaces leave. Collect the words from the last to the first and join them with " ". Like reading a train\'s carriages from the back to the front.',
  },
  35: {
    example: 'Example: reverseEachWord("hello world") returns "olleh dlrow".',
    starter: one('String reverseEachWord(String sentence)', 'Reverse every word on its own; keep the words in their places.', 'System.out.println(reverseEachWord("hello world"));'),
  },
  36: {
    example: 'Example: capitalizeWords("hello world") returns "Hello World".',
    starter: one('String capitalizeWords(String sentence)', 'Make the first letter of every word upper case; leave everything else as it is.', 'System.out.println(capitalizeWords("hello world"));'),
    hint: 'A letter starts a word when it is the first character or the character before it is a space. Make those letters upper case (Character.toUpperCase(c)) and keep the rest. Like a sign writer who only paints the first letter of each word in a bigger brush.',
  },
  37: {
    example: 'Example: allUnique("abc") returns true, allUnique("aba") returns false.',
    starter: one('boolean allUnique(String s)', 'true if no character appears twice. Do not use extra data structures.', 'System.out.println(allUnique("abc"));'),
    hint: 'Compare every pair of positions with two loops: for i, then for j after i; if s.charAt(i) == s.charAt(j), a character repeats. Like checking a small group for twins by putting each person next to every other person once.',
    forbid: {
      names: ['Set', 'HashSet', 'TreeSet', 'LinkedHashSet', 'Map', 'HashMap', 'TreeMap', 'List', 'ArrayList', 'sort', 'toCharArray', 'chars', 'StringBuilder'],
      patterns: [{ regex: 'new\\w+\\[', shown: 'a new array' }],
      why: 'This question asks you to check without extra data structures (no set, map, list, array or sorted copy).',
    },
  },
  38: {
    example: 'Example: longestWord("I love programming") returns "programming".',
    starter: one('String longestWord(String sentence)', 'The longest word (the first one if several are equally long); "" if there are none.', 'System.out.println(longestWord("I love programming"));'),
    hint: 'Go through the words (sentence.split(" "), skipping empty pieces) and remember the best word so far; replace it only when a word is strictly longer (so the first of equal ones stays). Like choosing the tallest child in a line by walking along it once.',
  },
  39: {
    example: 'Example: countWords("  hello   world  ") returns 2.',
    starter: one('int countWords(String s)', 'How many words (runs of characters that are not spaces) are in s?', 'System.out.println(countWords("  hello   world  "));'),
    hint: 'A word starts where a non-space character comes right after a space (or at the very start). Count those starts. Like counting islands on a map: each patch of land after water is one more island.',
  },
  40: {
    example: 'Example: isRotation("waterbottle", "erbottlewat") returns true.',
    starter: one('boolean isRotation(String a, String b)', 'true if b is a turned around a (some letters moved from the front to the back).', 'System.out.println(isRotation("waterbottle", "erbottlewat"));'),
    hint: 'If the lengths differ, it is not a rotation. Otherwise every rotation of a appears inside a + a, so check (a + a).contains(b). Like a necklace: wherever you open it, the beads are a piece of the necklace laid out twice.',
  },
  41: {
    example: 'Example: compress("aaabbbcc") returns "a3b3c2"; compress("abc") returns "abc".',
    starter: one('String compress(String s)', 'Each run of a letter becomes the letter and its count ("aaab" -> "a3b1").\nReturn s itself if the compressed text is not shorter.', 'System.out.println(compress("aaabbbcc"));'),
  },
  42: {
    example: 'Example: decode("a3b2") returns "aaabb".',
    starter: one('String decode(String s)', 'Each letter is followed by how many times it repeats ("a10" is ten a\'s).', 'System.out.println(decode("a3b2"));'),
  },
  43: {
    example: 'Example: longestCommonPrefix(new String[] {"flower", "flow", "flight"}) returns "fl".',
    starter: one(
      'String longestCommonPrefix(String[] words)',
      'The longest start that every word shares ("" if there is none or no words).',
      'System.out.println(longestCommonPrefix(new String[] {"flower", "flow", "flight"}));',
    ),
  },
  44: {
    example: 'Example: isPangram("The quick brown fox jumps over the lazy dog") returns true.',
    starter: one('boolean isPangram(String s)', 'true if s uses every letter a to z at least once (upper or lower case).', 'System.out.println(isPangram("The quick brown fox jumps over the lazy dog"));'),
    hint: 'Keep a boolean[26] of letters seen (letter - \'a\' is its place), filled from s.toLowerCase(); then check that all 26 are true. Like ticking off every letter on an alphabet chart.',
  },
  45: {
    example: 'Example: isSubsequence("abc", "ahbgdc") returns true.',
    starter: one('boolean isSubsequence(String a, String b)', 'true if the letters of a appear in b in the same order (not always side by side).', 'System.out.println(isSubsequence("abc", "ahbgdc"));'),
  },
  46: {
    example: 'Example: findIndex("hello", "ll") returns 2; not found gives -1.',
    starter: one('int findIndex(String text, String word)', 'The first position where word starts in text, or -1. Search by hand.', 'System.out.println(findIndex("hello", "ll"));'),
    hint: 'Try every start position i from 0 to text.length() - word.length(); at each, compare the letters one by one. Return the first i where all of them match. Like sliding a stencil along a line of text until the letters line up.',
    forbid: {
      names: ['indexOf', 'lastIndexOf', 'contains', 'matches', 'split', 'replace', 'replaceAll', 'Pattern', 'startsWith', 'endsWith', 'regionMatches'],
      why: 'This question asks you to search by hand, without indexOf(), contains() or split().',
    },
  },
  47: {
    example: 'Example: permutations("ab") returns [ab, ba] (in any order).',
    starter: one('List<String> permutations(String s)', 'Every ordering of the letters of s (all letters are different).', 'System.out.println(permutations("abc"));', UTIL),
    forbid: null,
  },
  48: {
    example: 'Example: myAtoi("   -42") returns -42.',
    starter: one(
      'int myAtoi(String s)',
      'Skip leading spaces, read an optional + or -, then the digits until something else.\nKeep the answer between -2147483648 and 2147483647. 0 if there are no digits.',
      'System.out.println(myAtoi("   -42"));',
    ),
    hint: 'Move a position i past the spaces; note a "+" or "-"; then while s.charAt(i) is a digit, value = value * 10 + (s.charAt(i) - \'0\'), keeping value in a long and stopping once it is past the int range. Apply the sign and clamp at the end. Like a cashier reading a handwritten price: skip the blank, see the sign, read digits until the first letter.',
    forbid: { names: ['parseInt', 'parseLong', 'valueOf', 'decode', 'Scanner'], why: 'This question asks you to turn the text into a number by hand, without Integer.parseInt().' },
  },
  49: {
    example: 'Example: longestPalindrome("cbbd") returns "bb".',
    starter: one(
      'String longestPalindrome(String s)',
      'The longest part of s (letters side by side) that reads the same both ways.\nIf several are equally long, the first one.',
      'System.out.println(longestPalindrome("cbbd"));',
    ),
  },
  50: {
    example: 'Example: groupAnagrams(new String[] {"eat", "tea", "tan", "ate", "nat", "bat"}) returns [[eat, tea, ate], [tan, nat], [bat]] (in any order).',
    starter: one(
      'List<List<String>> groupAnagrams(String[] words)',
      'Put words that are anagrams of each other in the same group.',
      'System.out.println(groupAnagrams(new String[] {"eat", "tea", "tan", "ate", "nat", "bat"}));',
      UTIL,
    ),
    hint: 'Give every word a key that is the same for all its anagrams: its letters sorted (char[] cs = w.toCharArray(); Arrays.sort(cs); new String(cs)). Put words with the same key in the same list of a Map<String, List<String>>. Like sorting letters into pigeonholes by their postcode.',
  },
  51: {
    example: 'Example: minDeletionsToAnagram("cde", "abc") returns 4.',
    starter: one('int minDeletionsToAnagram(String a, String b)', 'How many letters must be deleted (from either word) so the two become anagrams?', 'System.out.println(minDeletionsToAnagram("cde", "abc"));'),
  },
  52: {
    example: 'Example: oneEditAway("pale", "ple") returns true.',
    starter: one('boolean oneEditAway(String a, String b)', 'true if exactly one insert, delete or replace of a letter turns a into b.', 'System.out.println(oneEditAway("pale", "ple"));'),
  },
  53: {
    example: 'Example: zigzag("PAYPALISHIRING", 3) returns "PAHNAPLSIIGYIR".',
    starter: one('String zigzag(String s, int rows)', 'Write s in a zigzag over rows lines (down, then diagonally up, ...), then read the lines one by one.', 'System.out.println(zigzag("PAYPALISHIRING", 3));'),
  },
  54: {
    example: 'Example: countAndSay(4) returns "1211".',
    starter: one('String countAndSay(int n)', 'Term 1 is "1"; each next term describes the one before ("1" -> "11" -> "21" -> "1211").', 'System.out.println(countAndSay(4));'),
  },
  55: {
    example: 'Example: minWindow("ADOBECODEBANC", "ABC") returns "BANC".',
    starter: one(
      'String minWindow(String s, String t)',
      'The shortest part of s (side by side) that contains every letter of t\n(with repeats); "" if there is none.',
      'System.out.println(minWindow("ADOBECODEBANC", "ABC"));',
    ),
  },
});
