// Practice, C: the questions of strings that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/strings.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q26, Q28, Q29, Q30, Q31, Q32, Q34, Q35, Q36, Q38, Q41, Q42, Q43, Q47, Q49, Q50, Q53, Q54, Q55.
import { fromPython } from '../javascript/shared';
import { STRINGS } from '../python/strings';
import { cStarter } from './shared';

export const STRINGS_C = fromPython(
  STRINGS,
  {
  27: {
    example: "Example: isPalindromeText(\"A man, a plan, a canal: Panama\") returns true.",
    starter: cStarter([["bool isPalindromeText(char s[])", "true if s reads the same both ways, looking only at letters and ignoring upper/lower case."]], "printf(\"%s\\n\", isPalindromeText(\"A man, a plan, a canal: Panama\") ? \"true\" : \"false\");", ["string.h", "ctype.h"], ''),
    hint: "Keep only the letters, in lower case (isalpha(c) and tolower(c)). Then compare the first with the last, the second with the second-last, and so on, moving two pointers towards the middle. Like folding a paper strip in half to see if both halves match.",
  },
  33: {
    example: "Example: areAnagrams(\"listen\", \"silent\") returns true.",
    starter: cStarter([["bool areAnagrams(char a[], char b[])", "true if b uses exactly the same letters as a (each the same number of times)."]], "printf(\"%s\\n\", areAnagrams(\"listen\", \"silent\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Count the letters of a, then take away the letters of b; anagrams leave every count at 0. (Sorting both and comparing also works.) Like checking that two bags of Scrabble tiles hold exactly the same tiles.",
  },
  37: {
    example: "Example: allUnique(\"abc\") returns true, allUnique(\"aba\") returns false.",
    starter: cStarter([["bool allUnique(char s[])", "true if no character appears twice. Do not use extra data structures."]], "printf(\"%s\\n\", allUnique(\"abc\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Compare every pair of positions with two loops: for i, then for j after i; if s[i] == s[j], a character repeats. Like checking a small group for twins by putting each person next to every other person once.",
    forbid: {"names": ["qsort", "strchr", "strrchr", "memchr"], "patterns": [{"regex": "(bool|int|char|long)[A-Za-z_]\\w*\\[[^\\]]", "shown": "an array"}], "why": "This question asks you to check without extra data structures (no extra array or sorted copy)."},
  },
  39: {
    example: "Example: countWords(\"  hello   world  \") returns 2.",
    starter: cStarter([["int countWords(char s[])", "How many words (runs of characters that are not spaces) are in s?"]], "printf(\"%d\\n\", countWords(\"  hello   world  \"));", ["string.h"], ''),
    hint: "A word starts where a non-space character comes right after a space (or at the very start). Count those starts. Like counting islands on a map: each patch of land after water is one more island.",
  },
  40: {
    example: "Example: isRotation(\"waterbottle\", \"erbottlewat\") returns true.",
    starter: cStarter([["bool isRotation(char a[], char b[])", "true if b is a turned around a (some letters moved from the front to the back)."]], "printf(\"%s\\n\", isRotation(\"waterbottle\", \"erbottlewat\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "If the lengths differ, it is not a rotation. Otherwise try every shift k: b is a rotation when b[i] == a[(i + k) % n] for every position i. Like a necklace: wherever you open it, the beads come in the same circle.",
  },
  44: {
    example: "Example: isPangram(\"The quick brown fox jumps over the lazy dog\") returns true.",
    starter: cStarter([["bool isPangram(char s[])", "true if s uses every letter a to z at least once (upper or lower case)."]], "printf(\"%s\\n\", isPangram(\"The quick brown fox jumps over the lazy dog\") ? \"true\" : \"false\");", ["string.h", "ctype.h"], ''),
    hint: "Keep a bool seen[26] (all false), mark seen[tolower(c) - 'a'] for every letter of s, then check that all 26 are true. Like ticking off every letter on an alphabet chart.",
  },
  45: {
    example: "Example: isSubsequence(\"abc\", \"ahbgdc\") returns true.",
    starter: cStarter([["bool isSubsequence(char a[], char b[])", "true if the letters of a appear in b in the same order (not always side by side)."]], "printf(\"%s\\n\", isSubsequence(\"abc\", \"ahbgdc\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Keep a pointer into a. Walk through b; whenever b's letter matches the letter a is waiting for, move the pointer on. a is a subsequence if the pointer reaches its end. Like finding the letters of your name, in order, while reading the newspaper.",
  },
  46: {
    example: "Example: findIndex(\"hello\", \"ll\") returns 2; not found gives -1.",
    starter: cStarter([["int findIndex(char text[], char word[])", "The first position where word starts in text, or -1. Search by hand."]], "printf(\"%d\\n\", findIndex(\"hello\", \"ll\"));", ["string.h"], ''),
    hint: "Try every start position i from 0 to strlen(text) - strlen(word); at each, compare the letters one by one. Return the first i where all of them match. Like sliding a stencil along a line of text until the letters line up.",
    forbid: {"names": ["strstr", "strchr", "strrchr", "strncmp", "memcmp", "strcmp"], "why": "This question asks you to search by hand, without strstr()."},
  },
  48: {
    example: "Example: myAtoi(\"   -42\") returns -42.",
    starter: cStarter([["int myAtoi(char s[])", "Skip leading spaces, read an optional + or -, then the digits until something else.\nKeep the answer between -2147483648 and 2147483647. 0 if there are no digits."]], "printf(\"%d\\n\", myAtoi(\"42\"));", ["string.h", "ctype.h"], ''),
    hint: "Move a position i past the spaces; note a \"+\" or \"-\"; then while s[i] is a digit (isdigit), value = value * 10 + (s[i] - '0'), keeping value in a long long and stopping once it is past the int range. Apply the sign and clamp at the end. Like a cashier reading a handwritten price: skip the blank, see the sign, read digits until the first letter.",
    forbid: {"names": ["atoi", "atol", "atoll", "strtol", "strtoll", "sscanf"], "why": "This question asks you to turn the text into a number by hand, without atoi()."},
  },
  51: {
    example: "Example: minDeletionsToAnagram(\"cde\", \"abc\") returns 4.",
    starter: cStarter([["int minDeletionsToAnagram(char a[], char b[])", "How many letters must be deleted (from either word) so the two become anagrams?"]], "printf(\"%d\\n\", minDeletionsToAnagram(\"cde\", \"abc\"));", ["string.h"], ''),
    hint: "Count the letters of each word. For every letter, the difference between the two counts must be deleted; add up those differences. Like two children swapping cards until both piles match: the extra cards on each side have to go.",
  },
  52: {
    example: "Example: oneEditAway(\"pale\", \"ple\") returns true.",
    starter: cStarter([["bool oneEditAway(char a[], char b[])", "true if exactly one insert, delete or replace of a letter turns a into b."]], "printf(\"%s\\n\", oneEditAway(\"pale\", \"ple\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "If the lengths differ by more than 1, the answer is no. Walk both words with two pointers; at the first difference, skip one letter in the longer word (or both, if equally long), and the rest must match exactly. Equal words are zero edits apart. Like spotting the single typo between two copies of a sentence.",
  },
  },
  { partial: true },
);
