// Practice, C++: Strings (Q26-Q55). Tests come from the Python content;
// reference solutions in tests/practice/cpp/strings.solutions.ts.
import { fromPython, jsTests } from '../javascript/shared';
import { STRINGS } from '../python/strings';
import { cppStarter, nullTo, one, PRINT_INTS } from './shared';

const call = (header: string, comment: string, expr: string, includes: string[] = []) => one(header, comment, `cout << ${expr} << endl;`, includes);
const testsOf = (id: number) => jsTests(STRINGS.find((c) => c.id === id)!.tests);

export const STRINGS_CPP = fromPython(STRINGS, {
  26: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: call('string reverseString(string s)', 'Return s backwards. Do not use reverse().', 'reverseString("hello")'),
    hint: 'Start with an empty result and go through s from the last position down to 0 (for (int i = s.size() - 1; i >= 0; i--)), adding each s[i]. Like reading a word on a sign while walking backwards past it.',
    forbid: { names: ['reverse', 'rbegin', 'rend'], why: 'This question asks you to reverse the text yourself, without reverse().' },
  },
  27: {
    example: 'Example: isPalindromeText("A man, a plan, a canal: Panama") returns true.',
    starter: call(
      'bool isPalindromeText(string s)',
      'true if s reads the same both ways, looking only at letters and ignoring upper/lower case.',
      'boolalpha << isPalindromeText("A man, a plan, a canal: Panama")',
    ),
    hint: 'Keep only the letters, in lower case (isalpha(c) and tolower(c)). Then compare the first with the last, the second with the second-last, and so on, moving two pointers towards the middle. Like folding a paper strip in half to see if both halves match.',
  },
  28: {
    example: 'Example: countVowelsConsonants("Hello World") returns [3, 7].',
    starter: cppStarter(
      [['vector<int> countVowelsConsonants(string s)', '{number of vowels, number of consonants} among the letters of s (other characters do not count).']],
      'vector<int> r = countVowelsConsonants("Hello World");\nprintVector(r);',
      [],
      PRINT_INTS,
    ),
    hint: 'Go through the characters and skip anything that is not a letter (isalpha). If the lower-case letter is one of "aeiou" (string("aeiou").find(c) != string::npos), count a vowel, otherwise a consonant. Return both counts in a vector. Like sorting letters into two piles at a post office.',
  },
  29: {
    example: 'Example: charFrequency("hello") returns {e: 1, h: 1, l: 2, o: 1}.',
    starter: call('map<char, int> charFrequency(string s)', 'A map from each character of s to how many times it appears.', 'charFrequency("hello").size()', ['map']),
    hint: 'Start with an empty map<char, int>. For each character c, add 1 to its count: counts[c]++ (a missing key starts at 0). Like a teacher making tally marks next to each name on a list.',
  },
  30: {
    example: 'Example: firstNonRepeating("leetcode") returns "l"; with none, it returns "".',
    starter: call('string firstNonRepeating(string s)', 'The first character that appears only once in s (as a one-letter string), or "" if there is none.', 'firstNonRepeating("leetcode")'),
    tests: nullTo(testsOf(30), ''),
  },
  31: {
    example: 'Example: firstRepeating("abcb") returns "b"; with none, it returns "".',
    starter: call('string firstRepeating(string s)', 'The first character that appears a second time (reading left to right), as a one-letter string, or "".', 'firstRepeating("abcb")'),
    tests: nullTo(testsOf(31), ''),
  },
  32: {
    example: 'Example: removeDuplicates("banana") returns "ban".',
    starter: call('string removeDuplicates(string s)', 'Keep only the first time each character appears, in order.', 'removeDuplicates("banana")'),
  },
  33: {
    example: 'Example: areAnagrams("listen", "silent") returns true.',
    starter: call('bool areAnagrams(string a, string b)', 'true if b uses exactly the same letters as a (each the same number of times).', 'boolalpha << areAnagrams("listen", "silent")'),
  },
  34: {
    example: 'Example: reverseWords("the sky is blue") returns "blue is sky the".',
    starter: call('string reverseWords(string sentence)', 'The words in reverse order, joined by single spaces (extra spaces are dropped).', 'reverseWords("the sky is blue")'),
    hint: 'Collect the words: go through the sentence, building a word until a space, and keep each word that is not empty in a vector<string>. Then join them from the last to the first with " ". Like reading a train\'s carriages from the back to the front.',
  },
  35: {
    example: 'Example: reverseEachWord("hello world") returns "olleh dlrow".',
    starter: call('string reverseEachWord(string sentence)', 'Reverse every word on its own; keep the words in their places.', 'reverseEachWord("hello world")'),
  },
  36: {
    example: 'Example: capitalizeWords("hello world") returns "Hello World".',
    starter: call('string capitalizeWords(string sentence)', 'Make the first letter of every word upper case; leave everything else as it is.', 'capitalizeWords("hello world")'),
    hint: 'A letter starts a word when it is the first character or the character before it is a space. Make those letters upper case (toupper(c)) and keep the rest. Like a sign writer who only paints the first letter of each word in a bigger brush.',
  },
  37: {
    example: 'Example: allUnique("abc") returns true, allUnique("aba") returns false.',
    starter: call('bool allUnique(string s)', 'true if no character appears twice. Do not use extra data structures.', 'boolalpha << allUnique("abc")'),
    hint: 'Compare every pair of positions with two loops: for i, then for j after i; if s[i] == s[j], a character repeats. Like checking a small group for twins by putting each person next to every other person once.',
    forbid: {
      names: ['sort', 'count'],
      patterns: [
        { regex: '(vector|set|unordered_set|map|unordered_map|bitset|array)<', shown: 'a set, map or vector' },
        { regex: '(bool|int|char|long)[A-Za-z_]\\w*\\[', shown: 'an array' },
      ],
      why: 'This question asks you to check without extra data structures (no set, map, vector, array or sorted copy).',
    },
  },
  38: {
    example: 'Example: longestWord("I love programming") returns "programming".',
    starter: call('string longestWord(string sentence)', 'The longest word (the first one if several are equally long); "" if there are none.', 'longestWord("I love programming")'),
    hint: 'Go through the sentence building the current word; at each space (and at the end), compare the word with the best so far and replace the best only when the word is strictly longer (so the first of equal ones stays). Like choosing the tallest child in a line by walking along it once.',
  },
  39: {
    example: 'Example: countWords("  hello   world  ") returns 2.',
    starter: call('int countWords(string s)', 'How many words (runs of characters that are not spaces) are in s?', 'countWords("  hello   world  ")'),
    hint: 'A word starts where a non-space character comes right after a space (or at the very start). Count those starts. Like counting islands on a map: each patch of land after water is one more island.',
  },
  40: {
    example: 'Example: isRotation("waterbottle", "erbottlewat") returns true.',
    starter: call('bool isRotation(string a, string b)', 'true if b is a turned around a (some letters moved from the front to the back).', 'boolalpha << isRotation("waterbottle", "erbottlewat")'),
    hint: 'If the lengths differ, it is not a rotation. Otherwise every rotation of a appears inside a + a, so check (a + a).find(b) != string::npos. Like a necklace: wherever you open it, the beads are a piece of the necklace laid out twice.',
  },
  41: {
    example: 'Example: compress("aaabbbcc") returns "a3b3c2"; compress("abc") returns "abc".',
    starter: call('string compress(string s)', 'Each run of a letter becomes the letter and its count ("aaab" -> "a3b1").\nReturn s itself if the compressed text is not shorter.', 'compress("aaabbbcc")'),
  },
  42: {
    example: 'Example: decode("a3b2") returns "aaabb".',
    starter: call('string decode(string s)', "Each letter is followed by how many times it repeats (\"a10\" is ten a's).", 'decode("a3b2")'),
  },
  43: {
    example: 'Example: longestCommonPrefix({"flower", "flow", "flight"}) returns "fl".',
    starter: one(
      'string longestCommonPrefix(vector<string> words)',
      'The longest start that every word shares ("" if there is none or no words).',
      'vector<string> words = {"flower", "flow", "flight"};\ncout << longestCommonPrefix(words) << endl;',
    ),
  },
  44: {
    example: 'Example: isPangram("The quick brown fox jumps over the lazy dog") returns true.',
    starter: call('bool isPangram(string s)', 'true if s uses every letter a to z at least once (upper or lower case).', 'boolalpha << isPangram("The quick brown fox jumps over the lazy dog")'),
    hint: "Keep a bool seen[26] (all false), mark seen[tolower(c) - 'a'] for every letter of s, then check that all 26 are true. Like ticking off every letter on an alphabet chart.",
  },
  45: {
    example: 'Example: isSubsequence("abc", "ahbgdc") returns true.',
    starter: call('bool isSubsequence(string a, string b)', 'true if the letters of a appear in b in the same order (not always side by side).', 'boolalpha << isSubsequence("abc", "ahbgdc")'),
  },
  46: {
    example: 'Example: findIndex("hello", "ll") returns 2; not found gives -1.',
    starter: call('int findIndex(string text, string word)', 'The first position where word starts in text, or -1. Search by hand.', 'findIndex("hello", "ll")'),
    hint: 'Try every start position i from 0 to text.size() - word.size(); at each, compare the letters one by one. Return the first i where all of them match. Like sliding a stencil along a line of text until the letters line up.',
    forbid: { names: ['find', 'rfind', 'search', 'strstr', 'regex', 'find_first_of', 'contains', 'compare'], why: 'This question asks you to search by hand, without find().' },
  },
  47: {
    example: 'Example: permutations("ab") returns [ab, ba] (in any order).',
    starter: call('vector<string> permutations(string s)', 'Every ordering of the letters of s (all letters are different).', 'permutations("abc").size()'),
    forbid: { names: ['next_permutation', 'prev_permutation'], why: 'This question asks you to build the orderings yourself, without next_permutation().' },
  },
  48: {
    example: 'Example: myAtoi("   -42") returns -42.',
    starter: call(
      'int myAtoi(string s)',
      'Skip leading spaces, read an optional + or -, then the digits until something else.\nKeep the answer between -2147483648 and 2147483647. 0 if there are no digits.',
      'myAtoi("   -42")',
    ),
    hint: "Move a position i past the spaces; note a \"+\" or \"-\"; then while s[i] is a digit (isdigit), value = value * 10 + (s[i] - '0'), keeping value in a long long and stopping once it is past the int range. Apply the sign and clamp at the end. Like a cashier reading a handwritten price: skip the blank, see the sign, read digits until the first letter.",
    forbid: { names: ['stoi', 'stol', 'stoll', 'atoi', 'atol', 'strtol', 'stringstream', 'istringstream', 'sscanf'], why: 'This question asks you to turn the text into a number by hand, without stoi().' },
  },
  49: {
    example: 'Example: longestPalindrome("cbbd") returns "bb".',
    starter: call('string longestPalindrome(string s)', 'The longest part of s (letters side by side) that reads the same both ways.\nIf several are equally long, the first one.', 'longestPalindrome("cbbd")'),
  },
  50: {
    example: 'Example: groupAnagrams({"eat", "tea", "tan", "ate", "nat", "bat"}) returns [[eat, tea, ate], [tan, nat], [bat]] (in any order).',
    starter: one(
      'vector<vector<string>> groupAnagrams(vector<string> words)',
      'Put words that are anagrams of each other in the same group.',
      'vector<string> words = {"eat", "tea", "tan", "ate", "nat", "bat"};\ncout << groupAnagrams(words).size() << endl;',
      ['map'],
    ),
    hint: 'Give every word a key that is the same for all its anagrams: how many of each letter it has (count the 26 letters, then join the counts into text like "1,0,2,..."). Remember which group each key belongs to (a map<string, int> to the group\'s position in a vector<vector<string>>). Like sorting letters into pigeonholes by their postcode.',
  },
  51: {
    example: 'Example: minDeletionsToAnagram("cde", "abc") returns 4.',
    starter: call('int minDeletionsToAnagram(string a, string b)', 'How many letters must be deleted (from either word) so the two become anagrams?', 'minDeletionsToAnagram("cde", "abc")'),
  },
  52: {
    example: 'Example: oneEditAway("pale", "ple") returns true.',
    starter: call('bool oneEditAway(string a, string b)', 'true if exactly one insert, delete or replace of a letter turns a into b.', 'boolalpha << oneEditAway("pale", "ple")'),
  },
  53: {
    example: 'Example: zigzag("PAYPALISHIRING", 3) returns "PAHNAPLSIIGYIR".',
    starter: call('string zigzag(string s, int rows)', 'Write s in a zigzag over rows lines (down, then diagonally up, ...), then read the lines one by one.', 'zigzag("PAYPALISHIRING", 3)'),
  },
  54: {
    example: 'Example: countAndSay(4) returns "1211".',
    starter: call('string countAndSay(int n)', 'Term 1 is "1"; each next term describes the one before ("1" -> "11" -> "21" -> "1211").', 'countAndSay(4)'),
  },
  55: {
    example: 'Example: minWindow("ADOBECODEBANC", "ABC") returns "BANC".',
    starter: call('string minWindow(string s, string t)', 'The shortest part of s (side by side) that contains every letter of t\n(with repeats); "" if there is none.', 'minWindow("ADOBECODEBANC", "ABC")'),
  },
});
