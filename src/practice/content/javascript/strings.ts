// Practice, JavaScript: Strings (Q26-Q55). Tests come from the Python content;
// reference solutions in tests/practice/js/strings.solutions.ts.
import { fromPython } from './shared';
import { STRINGS } from '../python/strings';

const REGEX = { regex: '/…/', shown: 'a regular expression' };

export const STRINGS_JS = fromPython(STRINGS, {
  26: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: `function reverseString(s) {
  // Return s backwards. Do not use reverse().
}

console.log(reverseString("hello"));
`,
    hint: 'Start with an empty result and go through s from the last position down to 0 (for (let i = s.length - 1; i >= 0; i--)), adding each letter. Like reading a word on a sign while walking backwards past it.',
    forbid: { names: ['reverse', 'toReversed', 'reduceRight'], why: 'This question asks you to reverse the text yourself, without reverse().' },
  },
  27: {
    example: 'Example: isPalindromeText("A man, a plan, a canal: Panama") returns true.',
    starter: `function isPalindromeText(s) {
  // true if s reads the same both ways, looking only at letters and ignoring upper/lower case.
}

console.log(isPalindromeText("A man, a plan, a canal: Panama"));
`,
    hint: 'Keep only the letters, in lower case (/[a-z]/i.test(ch) and ch.toLowerCase()). Then compare the first with the last, the second with the second-last, and so on, moving two pointers towards the middle. Like folding a paper strip in half to see if both halves match.',
  },
  28: {
    example: 'Example: countVowelsConsonants("Hello World") returns [3, 7].',
    starter: `function countVowelsConsonants(s) {
  // [number of vowels, number of consonants] among the letters of s (other characters don't count).
}

console.log(countVowelsConsonants("Hello World"));
`,
    hint: 'Go through the characters and skip anything that is not a letter (/[a-z]/i.test(ch)). If "aeiou" includes ch.toLowerCase(), count a vowel, otherwise a consonant. Return both counts as [vowels, consonants]. Like sorting letters into two piles at a post office.',
  },
  29: {
    example: 'Example: charFrequency("hello") returns {"h": 1, "e": 1, "l": 2, "o": 1}.',
    starter: `function charFrequency(s) {
  // An object (or a Map) from each character of s to how many times it appears.
}

console.log(charFrequency("hello"));
`,
    hint: 'Start with an empty object. For each character, add 1 to its count: counts[ch] = (counts[ch] ?? 0) + 1. Like a teacher making tally marks next to each name on a list.',
  },
  30: {
    example: 'Example: firstNonRepeating("leetcode") returns "l"; with none, it returns null.',
    starter: `function firstNonRepeating(s) {
  // The first character that appears only once in s, or null.
}

console.log(firstNonRepeating("leetcode"));
`,
  },
  31: {
    example: 'Example: firstRepeating("abcb") returns "b"; with none, it returns null.',
    starter: `function firstRepeating(s) {
  // The first character that appears a second time (reading left to right), or null.
}

console.log(firstRepeating("abcb"));
`,
  },
  32: {
    example: 'Example: removeDuplicates("banana") returns "ban".',
    starter: `function removeDuplicates(s) {
  // Keep only the first time each character appears, in order.
}

console.log(removeDuplicates("banana"));
`,
  },
  33: {
    example: 'Example: areAnagrams("listen", "silent") returns true.',
    starter: `function areAnagrams(a, b) {
  // true if b uses exactly the same letters as a (each the same number of times).
}

console.log(areAnagrams("listen", "silent"));
`,
  },
  34: {
    example: 'Example: reverseWords("the sky is blue") returns "blue is sky the".',
    starter: `function reverseWords(sentence) {
  // The words in reverse order, joined by single spaces (extra spaces are dropped).
}

console.log(reverseWords("the sky is blue"));
`,
    hint: 'sentence.trim().split(/\\s+/) gives the words without the extra spaces (but an empty text gives [""], so treat it on its own). Collect them from the last to the first and join them with " ". Like reading a train\'s carriages from the back to the front.',
  },
  35: {
    example: 'Example: reverseEachWord("hello world") returns "olleh dlrow".',
    starter: `function reverseEachWord(sentence) {
  // Reverse every word on its own; keep the words in their places.
}

console.log(reverseEachWord("hello world"));
`,
  },
  36: {
    example: 'Example: capitalizeWords("hello world") returns "Hello World".',
    starter: `function capitalizeWords(sentence) {
  // Make the first letter of every word upper case; leave everything else as it is.
}

console.log(capitalizeWords("hello world"));
`,
    hint: 'A letter starts a word when it is the first character or the character before it is a space. Make those letters upper case (ch.toUpperCase()) and keep the rest. Like a sign writer who only paints the first letter of each word in a bigger brush.',
  },
  37: {
    example: 'Example: allUnique("abc") returns true, allUnique("aba") returns false.',
    starter: `function allUnique(s) {
  // true if no character appears twice. Do not use extra data structures.
}

console.log(allUnique("abc"));
`,
    hint: 'Compare every pair of positions with two loops: for i, then for j after i; if s[i] === s[j], a character repeats. Like checking a small group for twins by putting each person next to every other person once.',
    forbid: {
      names: ['Set', 'Map', 'WeakMap', 'WeakSet', 'Object', 'Array', 'sort', 'toSorted', 'split', 'from'],
      patterns: [
        { regex: '(^|[=(\\[,:]|return)\\{', shown: '{ }' },
        { regex: '(^|[=(,:]|return)\\[', shown: '[ ]' },
      ],
      why: 'This question asks you to check without extra data structures (no Set, Map, object, array or sorted copy).',
    },
  },
  38: {
    example: 'Example: longestWord("I love programming") returns "programming".',
    starter: `function longestWord(sentence) {
  // The longest word (the first one if several are equally long); "" if there are none.
}

console.log(longestWord("I love programming"));
`,
    hint: 'Go through the words (sentence.split(" "), skipping empty ones) and remember the best word so far; replace it only when a word is strictly longer (so the first of equal ones stays). Like choosing the tallest child in a line by walking along it once.',
  },
  39: {
    example: 'Example: countWords("  hello   world  ") returns 2.',
    starter: `function countWords(s) {
  // How many words (runs of characters that are not spaces) are in s?
}

console.log(countWords("  hello   world  "));
`,
    hint: 'A word starts where a non-space character comes right after a space (or at the very start). Count those starts. Like counting islands on a map: each patch of land after water is one more island.',
  },
  40: {
    example: 'Example: isRotation("waterbottle", "erbottlewat") returns true.',
    starter: `function isRotation(a, b) {
  // true if b is a turned around a (some letters moved from the front to the back).
}

console.log(isRotation("waterbottle", "erbottlewat"));
`,
    hint: 'If the lengths differ, it is not a rotation. Otherwise every rotation of a appears inside a + a, so check (a + a).includes(b). Like a necklace: wherever you open it, the beads are a piece of the necklace laid out twice.',
  },
  41: {
    example: 'Example: compress("aaabbbcc") returns "a3b3c2"; compress("abc") returns "abc".',
    starter: `function compress(s) {
  // Each run of a letter becomes the letter and its count ("aaab" -> "a3b1").
  // Return s itself if the compressed text is not shorter.
}

console.log(compress("aaabbbcc"));
`,
  },
  42: {
    example: 'Example: decode("a3b2") returns "aaabb".',
    starter: `function decode(s) {
  // Each letter is followed by how many times it repeats ("a10" is ten a's).
}

console.log(decode("a3b2"));
`,
  },
  43: {
    example: 'Example: longestCommonPrefix(["flower", "flow", "flight"]) returns "fl".',
    starter: `function longestCommonPrefix(words) {
  // The longest start that every word shares ("" if there is none or no words).
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));
`,
  },
  44: {
    example: 'Example: isPangram("The quick brown fox jumps over the lazy dog") returns true.',
    starter: `function isPangram(s) {
  // true if s uses every letter a to z at least once (upper or lower case).
}

console.log(isPangram("The quick brown fox jumps over the lazy dog"));
`,
    hint: 'Collect the lower-case letters of s in a Set and check that it has all 26 (or check that s.toLowerCase() includes each letter of "abcdefghijklmnopqrstuvwxyz"). Like ticking off every letter on an alphabet chart.',
  },
  45: {
    example: 'Example: isSubsequence("abc", "ahbgdc") returns true.',
    starter: `function isSubsequence(a, b) {
  // true if the letters of a appear in b in the same order (not always side by side).
}

console.log(isSubsequence("abc", "ahbgdc"));
`,
  },
  46: {
    example: 'Example: findIndex("hello", "ll") returns 2; not found gives -1.',
    starter: `function findIndex(text, word) {
  // The first position where word starts in text, or -1. Search by hand.
}

console.log(findIndex("hello", "ll"));
`,
    hint: 'Try every start position i from 0 to text.length - word.length; at each, compare the letters one by one. Return the first i where all of them match. Like sliding a stencil along a line of text until the letters line up.',
    forbid: {
      names: ['indexOf', 'lastIndexOf', 'includes', 'search', 'match', 'matchAll', 'RegExp', 'split', 'replace', 'replaceAll'],
      patterns: [REGEX],
      why: 'This question asks you to search by hand, without indexOf(), includes(), split() or regular expressions.',
    },
  },
  47: {
    example: 'Example: permutations("ab") returns ["ab", "ba"] (in any order).',
    starter: `function permutations(s) {
  // Every ordering of the letters of s (all letters are different).
}

console.log(permutations("abc"));
`,
    forbid: null,
  },
  48: {
    example: 'Example: myAtoi("   -42") returns -42.',
    starter: `function myAtoi(s) {
  // Skip leading spaces, read an optional + or -, then the digits until something else.
  // Keep the answer between -2147483648 and 2147483647. 0 if there are no digits.
}

console.log(myAtoi("   -42"));
`,
    hint: 'Move a position i past the spaces; note a "+" or "-"; then while s[i] is a digit ("0" <= s[i] && s[i] <= "9"), value = value * 10 + (s.charCodeAt(i) - 48). Apply the sign and clamp to the range at the end. Like a cashier reading a handwritten price: skip the blank, see the sign, read digits until the first letter.',
    forbid: { names: ['parseInt', 'parseFloat', 'Number', 'BigInt', 'eval'], why: 'This question asks you to turn the text into a number by hand, without parseInt() or Number().' },
  },
  49: {
    example: 'Example: longestPalindrome("cbbd") returns "bb".',
    starter: `function longestPalindrome(s) {
  // The longest part of s (letters side by side) that reads the same both ways.
  // If several are equally long, the first one.
}

console.log(longestPalindrome("cbbd"));
`,
  },
  50: {
    example: 'Example: groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]) returns [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] (in any order).',
    starter: `function groupAnagrams(words) {
  // Put words that are anagrams of each other in the same group.
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
`,
    hint: 'Give every word a key that is the same for all its anagrams: its letters sorted ([...word].sort().join("")). Put words with the same key in the same array of a Map. Like sorting letters into pigeonholes by their postcode.',
  },
  51: {
    example: 'Example: minDeletionsToAnagram("cde", "abc") returns 4.',
    starter: `function minDeletionsToAnagram(a, b) {
  // How many letters must be deleted (from either word) so the two become anagrams?
}

console.log(minDeletionsToAnagram("cde", "abc"));
`,
  },
  52: {
    example: 'Example: oneEditAway("pale", "ple") returns true.',
    starter: `function oneEditAway(a, b) {
  // true if exactly one insert, delete or replace of a letter turns a into b.
}

console.log(oneEditAway("pale", "ple"));
`,
  },
  53: {
    example: 'Example: zigzag("PAYPALISHIRING", 3) returns "PAHNAPLSIIGYIR".',
    starter: `function zigzag(s, rows) {
  // Write s in a zigzag over rows lines (down, then diagonally up, ...), then read the lines one by one.
}

console.log(zigzag("PAYPALISHIRING", 3));
`,
  },
  54: {
    example: 'Example: countAndSay(4) returns "1211".',
    starter: `function countAndSay(n) {
  // Term 1 is "1"; each next term describes the one before ("1" -> "11" -> "21" -> "1211").
}

console.log(countAndSay(4));
`,
  },
  55: {
    example: 'Example: minWindow("ADOBECODEBANC", "ABC") returns "BANC".',
    starter: `function minWindow(s, t) {
  // The shortest part of s (side by side) that contains every letter of t
  // (with repeats); "" if there is none.
}

console.log(minWindow("ADOBECODEBANC", "ABC"));
`,
  },
});
