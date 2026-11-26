// JavaScript reference solutions for Practice: Strings. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  26: `function reverseString(s) {
  let out = "";
  for (let i = s.length - 1; i >= 0; i--) out += s[i];
  return out;
}
`,
  27: `function isPalindromeText(s) {
  const letters = [...s].filter((ch) => /[a-z]/i.test(ch)).map((ch) => ch.toLowerCase());
  let i = 0;
  let j = letters.length - 1;
  while (i < j) {
    if (letters[i] !== letters[j]) return false;
    i++;
    j--;
  }
  return true;
}
`,
  28: `function countVowelsConsonants(s) {
  let vowels = 0;
  let consonants = 0;
  for (const ch of s) {
    if (!/[a-z]/i.test(ch)) continue;
    if ("aeiou".includes(ch.toLowerCase())) vowels++;
    else consonants++;
  }
  return [vowels, consonants];
}
`,
  29: `function charFrequency(s) {
  const counts = {};
  for (const ch of s) counts[ch] = (counts[ch] ?? 0) + 1;
  return counts;
}
`,
  30: `function firstNonRepeating(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of s) if (counts.get(ch) === 1) return ch;
  return null;
}
`,
  31: `function firstRepeating(s) {
  const seen = new Set();
  for (const ch of s) {
    if (seen.has(ch)) return ch;
    seen.add(ch);
  }
  return null;
}
`,
  32: `function removeDuplicates(s) {
  const seen = new Set();
  let out = "";
  for (const ch of s) {
    if (!seen.has(ch)) {
      seen.add(ch);
      out += ch;
    }
  }
  return out;
}
`,
  33: `function areAnagrams(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of b) {
    if (!counts.get(ch)) return false;
    counts.set(ch, counts.get(ch) - 1);
  }
  return true;
}
`,
  34: `function reverseWords(sentence) {
  const words = sentence.split(" ").filter((w) => w !== "");
  const out = [];
  for (let i = words.length - 1; i >= 0; i--) out.push(words[i]);
  return out.join(" ");
}
`,
  35: `function reverseEachWord(sentence) {
  return sentence
    .split(" ")
    .map((w) => [...w].reverse().join(""))
    .join(" ");
}
`,
  36: `function capitalizeWords(sentence) {
  let out = "";
  for (let i = 0; i < sentence.length; i++) {
    const ch = sentence[i];
    out += i === 0 || sentence[i - 1] === " " ? ch.toUpperCase() : ch;
  }
  return out;
}
`,
  37: `function allUnique(s) {
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      if (s[i] === s[j]) return false;
    }
  }
  return true;
}
`,
  38: `function longestWord(sentence) {
  let best = "";
  for (const w of sentence.split(" ")) if (w.length > best.length) best = w;
  return best;
}
`,
  39: `function countWords(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== " " && (i === 0 || s[i - 1] === " ")) count++;
  }
  return count;
}
`,
  40: `function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}
`,
  41: `function compress(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out += s[i] + (j - i);
    i = j;
  }
  return out.length < s.length ? out : s;
}
`,
  42: `function decode(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const letter = s[i++];
    let count = 0;
    while (i < s.length && s[i] >= "0" && s[i] <= "9") count = count * 10 + Number(s[i++]);
    out += letter.repeat(count);
  }
  return out;
}
`,
  43: `function longestCommonPrefix(words) {
  if (words.length === 0) return "";
  let prefix = "";
  for (let i = 0; i < words[0].length; i++) {
    const ch = words[0][i];
    if (words.some((w) => w[i] !== ch)) break;
    prefix += ch;
  }
  return prefix;
}
`,
  44: `function isPangram(s) {
  const seen = new Set();
  for (const ch of s.toLowerCase()) if (ch >= "a" && ch <= "z") seen.add(ch);
  return seen.size === 26;
}
`,
  45: `function isSubsequence(a, b) {
  let i = 0;
  for (const ch of b) if (i < a.length && ch === a[i]) i++;
  return i === a.length;
}
`,
  46: `function findIndex(text, word) {
  for (let i = 0; i + word.length <= text.length; i++) {
    let j = 0;
    while (j < word.length && text[i + j] === word[j]) j++;
    if (j === word.length) return i;
  }
  return -1;
}
`,
  47: `function permutations(s) {
  if (s.length <= 1) return [s];
  const out = [];
  for (let i = 0; i < s.length; i++) {
    for (const rest of permutations(s.slice(0, i) + s.slice(i + 1))) out.push(s[i] + rest);
  }
  return out;
}
`,
  48: `function myAtoi(s) {
  let i = 0;
  while (i < s.length && s[i] === " ") i++;
  let sign = 1;
  if (s[i] === "+" || s[i] === "-") {
    if (s[i] === "-") sign = -1;
    i++;
  }
  let value = 0;
  while (i < s.length && s[i] >= "0" && s[i] <= "9") {
    value = value * 10 + (s.charCodeAt(i) - 48);
    i++;
  }
  value *= sign;
  return Math.max(-2147483648, Math.min(2147483647, value));
}
`,
  49: `function longestPalindrome(s) {
  let best = "";
  const grow = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--;
      hi++;
    }
    return s.slice(lo + 1, hi);
  };
  for (let i = 0; i < s.length; i++) {
    for (const p of [grow(i, i), grow(i, i + 1)]) if (p.length > best.length) best = p;
  }
  return best;
}
`,
  50: `function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
`,
  51: `function minDeletionsToAnagram(a, b) {
  const counts = new Map();
  for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of b) counts.set(ch, (counts.get(ch) ?? 0) - 1);
  let total = 0;
  for (const n of counts.values()) total += Math.abs(n);
  return total;
}
`,
  52: `function oneEditAway(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  if (a.length < b.length) [a, b] = [b, a];
  let i = 0;
  while (i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.slice(i + 1) === b.slice(i);
}
`,
  53: `function zigzag(s, rows) {
  if (rows === 1) return s;
  const lines = new Array(rows).fill("");
  let row = 0;
  let step = 1;
  for (const ch of s) {
    lines[row] += ch;
    if (row === 0) step = 1;
    else if (row === rows - 1) step = -1;
    row += step;
  }
  return lines.join("");
}
`,
  54: `function countAndSay(n) {
  let term = "1";
  for (let k = 1; k < n; k++) {
    let next = "";
    let i = 0;
    while (i < term.length) {
      let j = i;
      while (j < term.length && term[j] === term[i]) j++;
      next += String(j - i) + term[i];
      i = j;
    }
    term = next;
  }
  return term;
}
`,
  55: `function minWindow(s, t) {
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  let missing = t.length;
  let best = "";
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      if (need.get(ch) > 0) missing--;
      need.set(ch, need.get(ch) - 1);
    }
    while (missing === 0) {
      if (best === "" || right - left + 1 < best.length) best = s.slice(left, right + 1);
      const out = s[left++];
      if (need.has(out)) {
        need.set(out, need.get(out) + 1);
        if (need.get(out) > 0) missing++;
      }
    }
  }
  return best;
}
`,
};
