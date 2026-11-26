// Practice, Python: Strings (Q26-Q55). Reference solutions: tests/practice/strings.solutions.ts.
import { DICT_LITERAL, type PracticeContent } from '../types';

export const STRINGS: PracticeContent[] = [
  {
    id: 26,
    example: 'Example: reverse_string("hello") returns "olleh".',
    starter: `def reverse_string(s):
    # Return s backwards, without reversed(), .reverse() or s[::-1].
    pass


print(reverse_string("hello"))
`,
    tests: [
      { call: 'reverse_string', args: ['hello'], expected: 'olleh' },
      { call: 'reverse_string', args: [''], expected: '' },
      { call: 'reverse_string', args: ['a'], expected: 'a' },
      { call: 'reverse_string', args: ['ab cd'], expected: 'dc ba' },
      { call: 'reverse_string', args: ['Python3'], expected: '3nohtyP' },
    ],
    hint: 'Start with an empty result and go through s from the last position down to 0 (range(len(s) - 1, -1, -1)), adding each letter. Like reading a word on a sign while walking backwards past it.',
    forbid: { names: ['reversed', 'reverse'], patterns: [{ regex: '::-1\\]', shown: '[::-1]' }], why: 'This question asks you to reverse the text yourself, without reversed(), .reverse() or [::-1].' },
  },
  {
    id: 27,
    example: 'Example: is_palindrome_text("A man, a plan, a canal: Panama") returns True.',
    starter: `def is_palindrome_text(s):
    # True if the letters of s read the same both ways, ignoring case and anything that is not a letter.
    pass


print(is_palindrome_text("A man, a plan, a canal: Panama"))
`,
    tests: [
      { call: 'is_palindrome_text', args: ['A man, a plan, a canal: Panama'], expected: true },
      { call: 'is_palindrome_text', args: ['race a car'], expected: false },
      { call: 'is_palindrome_text', args: [''], expected: true },
      { call: 'is_palindrome_text', args: ['Was it a car or a cat I saw?'], expected: true },
      { call: 'is_palindrome_text', args: ['ab'], expected: false },
    ],
    hint: 'Keep only the letters, in lower case (ch.isalpha() and ch.lower()). Then compare the first with the last, the second with the second-last, and so on, moving two pointers towards the middle. Like folding a paper strip in half to see if both halves match.',
  },
  {
    id: 28,
    example: 'Example: count_vowels_consonants("Hello World") returns (3, 7).',
    starter: `def count_vowels_consonants(s):
    # Return (vowels, consonants), counting letters only, in any case.
    pass


print(count_vowels_consonants("Hello World"))
`,
    tests: [
      { call: 'count_vowels_consonants', args: ['Hello World'], expected: [3, 7] },
      { call: 'count_vowels_consonants', args: [''], expected: [0, 0] },
      { call: 'count_vowels_consonants', args: ['AEIOU xyz'], expected: [5, 3] },
      { call: 'count_vowels_consonants', args: ['123 !?'], expected: [0, 0] },
    ],
    hint: 'Go through the letters (skip anything where ch.isalpha() is False). If ch.lower() is in "aeiou" count a vowel, otherwise a consonant. Return both counts. Like sorting letters into two piles at a post office.',
  },
  {
    id: 29,
    example: 'Example: char_frequency("hello") returns {"h": 1, "e": 1, "l": 2, "o": 1}.',
    starter: `def char_frequency(s):
    # Return a dictionary: each character of s -> how many times it appears.
    pass


print(char_frequency("hello"))
`,
    tests: [
      { call: 'char_frequency', args: ['hello'], expected: { h: 1, e: 1, l: 2, o: 1 } },
      { call: 'char_frequency', args: [''], expected: {} },
      { call: 'char_frequency', args: ['aaa'], expected: { a: 3 } },
      { call: 'char_frequency', args: ['a b'], expected: { a: 1, ' ': 1, b: 1 } },
    ],
    hint: 'Start with an empty dictionary. For each character, add 1 to its count: counts[ch] = counts.get(ch, 0) + 1. Like a teacher making tally marks next to each name on a list.',
  },
  {
    id: 30,
    example: 'Example: first_non_repeating("leetcode") returns "l"; with none, it returns None.',
    starter: `def first_non_repeating(s):
    # The first character that appears only once in s, or None if there is none.
    pass


print(first_non_repeating("loveleetcode"))
`,
    tests: [
      { call: 'first_non_repeating', args: ['leetcode'], expected: 'l' },
      { call: 'first_non_repeating', args: ['loveleetcode'], expected: 'v' },
      { call: 'first_non_repeating', args: ['aabb'], expected: null },
      { call: 'first_non_repeating', args: ['x'], expected: 'x' },
      { call: 'first_non_repeating', args: ['abab c'], expected: ' ' },
    ],
    hint: 'Two passes: first count every character, then go through s again and return the first one whose count is 1. Like checking a class register twice: once to count names, once to find the first name that appears only once.',
  },
  {
    id: 31,
    example: 'Example: first_repeating("abcb") returns "b"; with none, it returns None.',
    starter: `def first_repeating(s):
    # Reading s from the left, the first character you see for the second time (or None).
    pass


print(first_repeating("abcb"))
`,
    tests: [
      { call: 'first_repeating', args: ['abcb'], expected: 'b' },
      { call: 'first_repeating', args: ['abca'], expected: 'a' },
      { call: 'first_repeating', args: ['abba'], expected: 'b' },
      { call: 'first_repeating', args: ['abcd'], expected: null },
      { call: 'first_repeating', args: [''], expected: null },
    ],
    hint: 'Keep a set of characters seen so far. For each character: if it is already in the set, that is your answer; otherwise add it. Like a door guard who stops the first person trying to come in twice.',
  },
  {
    id: 32,
    example: 'Example: remove_duplicates("banana") returns "ban".',
    starter: `def remove_duplicates(s):
    # Keep the first time each character appears, drop the later repeats.
    pass


print(remove_duplicates("banana"))
`,
    tests: [
      { call: 'remove_duplicates', args: ['banana'], expected: 'ban' },
      { call: 'remove_duplicates', args: ['aabbcc'], expected: 'abc' },
      { call: 'remove_duplicates', args: [''], expected: '' },
      { call: 'remove_duplicates', args: ['abc'], expected: 'abc' },
      { call: 'remove_duplicates', args: ['Mississippi'], expected: 'Misp' },
    ],
    hint: 'Build the answer one character at a time, and remember which characters you already used (a set). Add a character only the first time you meet it. Like collecting stickers: you keep the first of each kind and skip the doubles.',
  },
  {
    id: 33,
    example: 'Example: are_anagrams("listen", "silent") returns True.',
    starter: `def are_anagrams(a, b):
    # True if b uses exactly the same letters as a, the same number of times.
    pass


print(are_anagrams("listen", "silent"))
`,
    tests: [
      { call: 'are_anagrams', args: ['listen', 'silent'], expected: true },
      { call: 'are_anagrams', args: ['rat', 'car'], expected: false },
      { call: 'are_anagrams', args: ['', ''], expected: true },
      { call: 'are_anagrams', args: ['aab', 'abb'], expected: false },
      { call: 'are_anagrams', args: ['abc', 'abcd'], expected: false },
    ],
    hint: 'Count the letters of a, then take away the letters of b; anagrams leave every count at 0. (Sorting both and comparing also works.) Like checking that two bags of Scrabble tiles hold exactly the same tiles.',
  },
  {
    id: 34,
    example: 'Example: reverse_words("the sky is blue") returns "blue is sky the".',
    starter: `def reverse_words(sentence):
    # The words in reverse order, separated by single spaces.
    pass


print(reverse_words("the sky is blue"))
`,
    tests: [
      { call: 'reverse_words', args: ['the sky is blue'], expected: 'blue is sky the' },
      { call: 'reverse_words', args: ['  hello world  '], expected: 'world hello' },
      { call: 'reverse_words', args: ['a'], expected: 'a' },
      { call: 'reverse_words', args: ['a good   example'], expected: 'example good a' },
    ],
    hint: 'sentence.split() (with no argument) gives the words and drops extra spaces. Collect them from the last to the first and join them with " ". Like reading a train\'s carriages from the back to the front.',
  },
  {
    id: 35,
    example: 'Example: reverse_each_word("hello world") returns "olleh dlrow".',
    starter: `def reverse_each_word(s):
    # Reverse the letters of every word, but keep the words in their places.
    pass


print(reverse_each_word("hello world"))
`,
    tests: [
      { call: 'reverse_each_word', args: ['hello world'], expected: 'olleh dlrow' },
      { call: 'reverse_each_word', args: ["Let's take it"], expected: "s'teL ekat ti" },
      { call: 'reverse_each_word', args: [''], expected: '' },
      { call: 'reverse_each_word', args: ['a bc def'], expected: 'a cb fed' },
    ],
    hint: 'Split the sentence on " ", reverse each word on its own, then join them back with " ". Like turning every card in a row face-down without changing the order of the cards.',
  },
  {
    id: 36,
    example: 'Example: capitalize_words("hello world") returns "Hello World".',
    starter: `def capitalize_words(s):
    # Make the first letter of every word a capital; leave everything else as it is.
    pass


print(capitalize_words("hello world"))
`,
    tests: [
      { call: 'capitalize_words', args: ['hello world'], expected: 'Hello World' },
      { call: 'capitalize_words', args: ['python is fun'], expected: 'Python Is Fun' },
      { call: 'capitalize_words', args: [''], expected: '' },
      { call: 'capitalize_words', args: ['already Big'], expected: 'Already Big' },
      { call: 'capitalize_words', args: ['hello   there'], expected: 'Hello   There' },
    ],
    hint: 'A letter starts a word when it is the first character or the character before it is a space. Make those letters upper case (ch.upper()) and keep the rest. Like a sign writer who only paints the first letter of each word in a bigger brush.',
  },
  {
    id: 37,
    example: 'Example: all_unique("abc") returns True, all_unique("aba") returns False.',
    starter: `def all_unique(s):
    # True if no character appears twice. Use no extra data structures (no set, dict, list).
    pass


print(all_unique("abc"))
`,
    tests: [
      { call: 'all_unique', args: ['abc'], expected: true },
      { call: 'all_unique', args: ['aba'], expected: false },
      { call: 'all_unique', args: [''], expected: true },
      { call: 'all_unique', args: ['abcdefa'], expected: false },
      { call: 'all_unique', args: ['Aa'], expected: true },
    ],
    hint: 'Compare every pair of positions with two loops: for i, then for j after i; if s[i] == s[j], a character repeats. Like checking a small group for twins by putting each person next to every other person once.',
    forbid: { names: ['set', 'dict', 'list', 'Counter', 'defaultdict', 'sorted'], patterns: [DICT_LITERAL], why: 'This question asks you to check without extra data structures (no set, dict, list or sorted copy).' },
  },
  {
    id: 38,
    example: 'Example: longest_word("I love programming") returns "programming".',
    starter: `def longest_word(sentence):
    # The longest word (the first one if several are equally long); "" for no words.
    pass


print(longest_word("I love programming"))
`,
    tests: [
      { call: 'longest_word', args: ['I love programming'], expected: 'programming' },
      { call: 'longest_word', args: ['a bb cc'], expected: 'bb' },
      { call: 'longest_word', args: [''], expected: '' },
      { call: 'longest_word', args: ['   one   three  '], expected: 'three' },
    ],
    hint: 'Go through sentence.split() and remember the best word so far; replace it only when a word is strictly longer (so the first of equal ones stays). Like choosing the tallest child in a line by walking along it once.',
  },
  {
    id: 39,
    example: 'Example: count_words("  hello   world  ") returns 2.',
    starter: `def count_words(s):
    # How many words are in s? Spaces may be anywhere, and there may be several in a row.
    pass


print(count_words("  hello   world  "))
`,
    tests: [
      { call: 'count_words', args: ['  hello   world  '], expected: 2 },
      { call: 'count_words', args: [''], expected: 0 },
      { call: 'count_words', args: ['   '], expected: 0 },
      { call: 'count_words', args: ['one'], expected: 1 },
      { call: 'count_words', args: ['a b  c'], expected: 3 },
    ],
    hint: 'A word starts where a non-space character comes right after a space (or at the very start). Count those starts. (s.split() also does it.) Like counting islands on a map: each patch of land after water is one more island.',
  },
  {
    id: 40,
    example: 'Example: is_rotation("waterbottle", "erbottlewat") returns True.',
    starter: `def is_rotation(a, b):
    # True if b is a with some letters moved from the front to the back.
    pass


print(is_rotation("waterbottle", "erbottlewat"))
`,
    tests: [
      { call: 'is_rotation', args: ['waterbottle', 'erbottlewat'], expected: true },
      { call: 'is_rotation', args: ['abc', 'acb'], expected: false },
      { call: 'is_rotation', args: ['', ''], expected: true },
      { call: 'is_rotation', args: ['aa', 'aaa'], expected: false },
      { call: 'is_rotation', args: ['abcd', 'dabc'], expected: true },
    ],
    hint: 'If the lengths differ, it is not a rotation. Otherwise every rotation of a appears inside a + a, so check whether b is in a + a. Like a necklace: wherever you open it, the beads are a piece of the necklace laid out twice.',
  },
  {
    id: 41,
    example: 'Example: compress("aaabbbcc") returns "a3b3c2"; compress("abc") returns "abc".',
    starter: `def compress(s):
    # Each run of a letter becomes the letter and its count ("aaab" -> "a3b1").
    # Return s itself if the compressed text is not shorter.
    pass


print(compress("aaabbbcc"))
`,
    tests: [
      { call: 'compress', args: ['aaabbbcc'], expected: 'a3b3c2' },
      { call: 'compress', args: ['abc'], expected: 'abc' },
      { call: 'compress', args: ['aaabcc'], expected: 'aaabcc' },
      { call: 'compress', args: [''], expected: '' },
      { call: 'compress', args: ['aaaaaaaaaaab'], expected: 'a11b1' },
    ],
    hint: 'Walk through s counting how long each run of the same letter is; when the letter changes, write the letter and its count. At the end, return the shorter of the two texts (the original if they are equally long). Like counting cars of the same colour in a passing train.',
  },
  {
    id: 42,
    example: 'Example: decode("a3b2") returns "aaabb".',
    starter: `def decode(s):
    # Each letter is followed by how many times it repeats (the count may have several digits).
    pass


print(decode("a3b2"))
`,
    tests: [
      { call: 'decode', args: ['a3b2'], expected: 'aaabb' },
      { call: 'decode', args: ['x1'], expected: 'x' },
      { call: 'decode', args: [''], expected: '' },
      { call: 'decode', args: ['a10'], expected: 'aaaaaaaaaa' },
      { call: 'decode', args: ['a2b1c3'], expected: 'aabccc' },
    ],
    hint: 'Read a letter, then read all the digits after it to make the count (count = count * 10 + digit), and add the letter count times. Like a shopping list: "eggs 12" means put twelve eggs in the basket.',
  },
  {
    id: 43,
    example: 'Example: longest_common_prefix(["flower", "flow", "flight"]) returns "fl".',
    starter: `def longest_common_prefix(words):
    # The longest start that every word in the list shares ("" if none, or no words).
    pass


print(longest_common_prefix(["flower", "flow", "flight"]))
`,
    tests: [
      { call: 'longest_common_prefix', args: [['flower', 'flow', 'flight']], expected: 'fl' },
      { call: 'longest_common_prefix', args: [['dog', 'racecar', 'car']], expected: '' },
      { call: 'longest_common_prefix', args: [['a']], expected: 'a' },
      { call: 'longest_common_prefix', args: [[]], expected: '' },
      { call: 'longest_common_prefix', args: [['abc', 'abc']], expected: 'abc' },
    ],
    hint: 'Look at position 0 in every word, then position 1, and so on; stop at the first position where a word is too short or the letters differ. Like several people reading the same story aloud: you stop at the first word where someone says something different.',
  },
  {
    id: 44,
    example: 'Example: is_pangram("The quick brown fox jumps over the lazy dog") returns True.',
    starter: `def is_pangram(s):
    # True if s uses every letter a to z at least once (in any case).
    pass


print(is_pangram("The quick brown fox jumps over the lazy dog"))
`,
    tests: [
      { call: 'is_pangram', args: ['The quick brown fox jumps over the lazy dog'], expected: true },
      { call: 'is_pangram', args: ['Hello'], expected: false },
      { call: 'is_pangram', args: [''], expected: false },
      { call: 'is_pangram', args: ['abcdefghijklmnopqrstuvwxyZ'], expected: true },
    ],
    hint: 'Collect the lower-case letters of s in a set and check that it has all 26 (or check each letter of "abcdefghijklmnopqrstuvwxyz" is in s.lower()). Like ticking off every letter on an alphabet chart.',
  },
  {
    id: 45,
    example: 'Example: is_subsequence("abc", "ahbgdc") returns True.',
    starter: `def is_subsequence(a, b):
    # True if the letters of a appear in b in the same order (not necessarily side by side).
    pass


print(is_subsequence("abc", "ahbgdc"))
`,
    tests: [
      { call: 'is_subsequence', args: ['abc', 'ahbgdc'], expected: true },
      { call: 'is_subsequence', args: ['axc', 'ahbgdc'], expected: false },
      { call: 'is_subsequence', args: ['', 'abc'], expected: true },
      { call: 'is_subsequence', args: ['abc', ''], expected: false },
      { call: 'is_subsequence', args: ['aab', 'ab'], expected: false },
    ],
    hint: 'Keep a pointer into a. Walk through b; whenever b\'s letter matches the letter a is waiting for, move the pointer on. a is a subsequence if the pointer reaches its end. Like finding the letters of your name, in order, while reading the newspaper.',
  },
  {
    id: 46,
    example: 'Example: find_index("hello", "ll") returns 2; not found gives -1.',
    starter: `def find_index(text, word):
    # The first position where word starts inside text, or -1. Without find() or index().
    pass


print(find_index("hello", "ll"))
`,
    tests: [
      { call: 'find_index', args: ['hello', 'll'], expected: 2 },
      { call: 'find_index', args: ['aaaaa', 'bba'], expected: -1 },
      { call: 'find_index', args: ['abc', ''], expected: 0 },
      { call: 'find_index', args: ['abc', 'c'], expected: 2 },
      { call: 'find_index', args: ['a', 'ab'], expected: -1 },
      { call: 'find_index', args: ['mississippi', 'issip'], expected: 4 },
    ],
    hint: 'Try every start position i from 0 to len(text) - len(word); at each, compare the letters one by one. Return the first i where all of them match. Like sliding a stencil along a line of text until the letters line up.',
    forbid: { names: ['find', 'index', 'rfind', 'rindex', 're'], why: 'This question asks you to search by hand, without find(), index() or re.' },
  },
  {
    id: 47,
    example: 'Example: permutations("ab") returns ["ab", "ba"] (in any order).',
    starter: `def permutations(s):
    # A list of every ordering of the letters of s (the letters of s are all different).
    pass


print(permutations("abc"))
`,
    tests: [
      { call: 'permutations', args: ['abc'], expected: ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'], compare: 'unordered' },
      { call: 'permutations', args: ['ab'], expected: ['ab', 'ba'], compare: 'unordered' },
      { call: 'permutations', args: ['a'], expected: ['a'], compare: 'unordered' },
      { call: 'permutations', args: [''], expected: [''], compare: 'unordered' },
    ],
    hint: 'Recursion: for each letter of s, put it first and add all the permutations of the remaining letters after it. The permutations of "" are just [""]. Like seating guests: choose who sits first, then arrange the rest.',
    forbid: { names: ['itertools'], why: 'This question asks you to build the permutations yourself, without itertools.' },
  },
  {
    id: 48,
    example: 'Example: my_atoi("   -42") returns -42.',
    starter: `def my_atoi(s):
    # Skip leading spaces, read an optional + or -, then digits until something else.
    # Clamp to the 32-bit range (-2147483648 to 2147483647). No digits gives 0. Without int().
    pass


print(my_atoi("   -42"))
`,
    tests: [
      { call: 'my_atoi', args: ['42'], expected: 42 },
      { call: 'my_atoi', args: ['   -42'], expected: -42 },
      { call: 'my_atoi', args: ['4193 with words'], expected: 4193 },
      { call: 'my_atoi', args: ['words and 987'], expected: 0 },
      { call: 'my_atoi', args: ['-91283472332'], expected: -2147483648 },
      { call: 'my_atoi', args: ['2147483648'], expected: 2147483647 },
      { call: 'my_atoi', args: ['+1'], expected: 1 },
      { call: 'my_atoi', args: [''], expected: 0 },
    ],
    hint: 'Move a position i past the spaces; note a "+" or "-"; then while s[i] is a digit, value = value * 10 + (ord(s[i]) - ord("0")). Apply the sign and clamp to the range at the end. Like a cashier reading a handwritten price: skip the blank, see the sign, read digits until the first letter.',
    forbid: { names: ['int', 'float', 'eval'], why: 'This question asks you to turn the text into a number by hand, without int(), float() or eval().' },
  },
  {
    id: 49,
    example: 'Example: longest_palindrome("cbbd") returns "bb".',
    starter: `def longest_palindrome(s):
    # The longest part of s (letters side by side) that reads the same both ways.
    pass


print(longest_palindrome("forgeeksskeegfor"))
`,
    tests: [
      { call: 'longest_palindrome', args: ['cbbd'], expected: 'bb' },
      { call: 'longest_palindrome', args: ['a'], expected: 'a' },
      { call: 'longest_palindrome', args: ['forgeeksskeegfor'], expected: 'geeksskeeg' },
      { call: 'longest_palindrome', args: ['racecar'], expected: 'racecar' },
      { call: 'longest_palindrome', args: ['abcde'], expected: 'a' },
    ],
    hint: 'Every palindrome has a centre: one letter (odd length) or the gap between two letters (even length). For each centre, grow outwards while the letters on both sides match, and keep the longest. Like dropping a stone in a pond and watching how far the ripples stay even.',
  },
  {
    id: 50,
    example: 'Example: group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]) returns [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] (in any order).',
    starter: `def group_anagrams(words):
    # A list of groups; each group holds words made of the same letters.
    pass


print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
`,
    tests: [
      { call: 'group_anagrams', args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']], compare: 'sets' },
      { call: 'group_anagrams', args: [['']], expected: [['']], compare: 'sets' },
      { call: 'group_anagrams', args: [['a']], expected: [['a']], compare: 'sets' },
      { call: 'group_anagrams', args: [['abc', 'bca', 'xyz', 'cab', 'zyx']], expected: [['abc', 'bca', 'cab'], ['xyz', 'zyx']], compare: 'sets' },
    ],
    hint: 'Give every word a key that is the same for all its anagrams: its letters sorted ("".join(sorted(word))). Put words with the same key in the same list of a dictionary. Like sorting letters into pigeonholes by their postcode.',
  },
  {
    id: 51,
    example: 'Example: min_deletions_to_anagram("cde", "abc") returns 4.',
    starter: `def min_deletions_to_anagram(a, b):
    # How many letters must be deleted (from either word) to make them anagrams?
    pass


print(min_deletions_to_anagram("cde", "abc"))
`,
    tests: [
      { call: 'min_deletions_to_anagram', args: ['cde', 'abc'], expected: 4 },
      { call: 'min_deletions_to_anagram', args: ['abc', 'abc'], expected: 0 },
      { call: 'min_deletions_to_anagram', args: ['', 'abc'], expected: 3 },
      { call: 'min_deletions_to_anagram', args: ['aab', 'abb'], expected: 2 },
    ],
    hint: 'Count the letters of each word. For every letter, the difference between the two counts must be deleted; add up those differences. Like two children swapping cards until both piles match: the extra cards on each side have to go.',
  },
  {
    id: 52,
    example: 'Example: one_edit_away("pale", "ple") returns True.',
    starter: `def one_edit_away(a, b):
    # True if exactly one insert, delete or replace turns a into b.
    pass


print(one_edit_away("pale", "ple"))
`,
    tests: [
      { call: 'one_edit_away', args: ['pale', 'ple'], expected: true },
      { call: 'one_edit_away', args: ['pales', 'pale'], expected: true },
      { call: 'one_edit_away', args: ['pale', 'bale'], expected: true },
      { call: 'one_edit_away', args: ['pale', 'bake'], expected: false },
      { call: 'one_edit_away', args: ['abc', 'abc'], expected: false },
      { call: 'one_edit_away', args: ['', 'a'], expected: true },
    ],
    hint: 'If the lengths differ by more than 1, the answer is no. Walk both words with two pointers; at the first difference, skip one letter in the longer word (or both, if equally long), and the rest must match exactly. Equal words are zero edits apart. Like spotting the single typo between two copies of a sentence.',
  },
  {
    id: 53,
    example: 'Example: zigzag("PAYPALISHIRING", 3) returns "PAHNAPLSIIGYIR".',
    starter: `def zigzag(s, rows):
    # Write s down and up in a zigzag over the given number of rows, then read the rows.
    pass


print(zigzag("PAYPALISHIRING", 3))
`,
    tests: [
      { call: 'zigzag', args: ['PAYPALISHIRING', 3], expected: 'PAHNAPLSIIGYIR' },
      { call: 'zigzag', args: ['PAYPALISHIRING', 4], expected: 'PINALSIGYAHRPI' },
      { call: 'zigzag', args: ['A', 1], expected: 'A' },
      { call: 'zigzag', args: ['AB', 1], expected: 'AB' },
      { call: 'zigzag', args: ['ABCD', 2], expected: 'ACBD' },
    ],
    hint: 'Keep one text per row. Put each letter in the current row, then move down one row, turning around at the top and bottom rows. With one row, the answer is s itself. Finally join the rows. Like a ball bouncing between the floor and the ceiling, leaving a letter at every height it passes.',
  },
  {
    id: 54,
    example: 'Example: count_and_say(4) returns "1211".',
    starter: `def count_and_say(n):
    # Term 1 is "1"; each next term reads the previous one aloud ("1211" -> "one 1, one 2, two 1s" -> "111221").
    pass


print(count_and_say(4))
`,
    tests: [
      { call: 'count_and_say', args: [1], expected: '1' },
      { call: 'count_and_say', args: [2], expected: '11' },
      { call: 'count_and_say', args: [4], expected: '1211' },
      { call: 'count_and_say', args: [5], expected: '111221' },
      { call: 'count_and_say', args: [6], expected: '312211' },
    ],
    hint: 'Start with "1" and repeat n - 1 times: read the current term in runs of the same digit, and for each run write its length and then the digit. Like describing a row of beads: "three red, one blue".',
  },
  {
    id: 55,
    example: 'Example: min_window("ADOBECODEBANC", "ABC") returns "BANC".',
    starter: `def min_window(s, t):
    # The shortest part of s that holds every character of t (with repeats); "" if none.
    pass


print(min_window("ADOBECODEBANC", "ABC"))
`,
    tests: [
      { call: 'min_window', args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { call: 'min_window', args: ['a', 'a'], expected: 'a' },
      { call: 'min_window', args: ['a', 'aa'], expected: '' },
      { call: 'min_window', args: ['ab', 'b'], expected: 'b' },
      { call: 'min_window', args: ['aaflslflsldkalskaaa', 'aaa'], expected: 'aaa' },
    ],
    hint: 'Use a sliding window: move the right edge until the window holds everything t needs (keep counts), then move the left edge in as far as you can while it still does, remembering the shortest window. Repeat to the end. Like a camera zooming in as far as possible while keeping every friend in the photo.',
  },
];
