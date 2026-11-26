// Reference solutions for Practice: Strings (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  26: `def reverse_string(s):
    out = ""
    for i in range(len(s) - 1, -1, -1):
        out += s[i]
    return out
`,
  27: `def is_palindrome_text(s):
    letters = [ch.lower() for ch in s if ch.isalpha()]
    i, j = 0, len(letters) - 1
    while i < j:
        if letters[i] != letters[j]:
            return False
        i += 1
        j -= 1
    return True
`,
  28: `def count_vowels_consonants(s):
    vowels = consonants = 0
    for ch in s:
        if ch.isalpha():
            if ch.lower() in "aeiou":
                vowels += 1
            else:
                consonants += 1
    return vowels, consonants
`,
  29: `def char_frequency(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    return counts
`,
  30: `def first_non_repeating(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None
`,
  31: `def first_repeating(s):
    seen = set()
    for ch in s:
        if ch in seen:
            return ch
        seen.add(ch)
    return None
`,
  32: `def remove_duplicates(s):
    seen = set()
    out = ""
    for ch in s:
        if ch not in seen:
            seen.add(ch)
            out += ch
    return out
`,
  33: `def are_anagrams(a, b):
    if len(a) != len(b):
        return False
    counts = {}
    for ch in a:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in b:
        counts[ch] = counts.get(ch, 0) - 1
    return all(v == 0 for v in counts.values())
`,
  34: `def reverse_words(sentence):
    words = sentence.split()
    return " ".join(words[i] for i in range(len(words) - 1, -1, -1))
`,
  35: `def reverse_each_word(s):
    return " ".join(word[::-1] for word in s.split(" "))
`,
  36: `def capitalize_words(s):
    out = ""
    for i, ch in enumerate(s):
        if i == 0 or s[i - 1] == " ":
            out += ch.upper()
        else:
            out += ch
    return out
`,
  37: `def all_unique(s):
    for i in range(len(s)):
        for j in range(i + 1, len(s)):
            if s[i] == s[j]:
                return False
    return True
`,
  38: `def longest_word(sentence):
    best = ""
    for word in sentence.split():
        if len(word) > len(best):
            best = word
    return best
`,
  39: `def count_words(s):
    count = 0
    for i, ch in enumerate(s):
        if ch != " " and (i == 0 or s[i - 1] == " "):
            count += 1
    return count
`,
  40: `def is_rotation(a, b):
    return len(a) == len(b) and b in a + a
`,
  41: `def compress(s):
    out = ""
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out += s[i] + str(j - i)
        i = j
    return out if len(out) < len(s) else s
`,
  42: `def decode(s):
    out = ""
    i = 0
    while i < len(s):
        letter = s[i]
        i += 1
        count = 0
        while i < len(s) and s[i].isdigit():
            count = count * 10 + int(s[i])
            i += 1
        out += letter * count
    return out
`,
  43: `def longest_common_prefix(words):
    if not words:
        return ""
    prefix = ""
    for i in range(len(words[0])):
        ch = words[0][i]
        for w in words[1:]:
            if i >= len(w) or w[i] != ch:
                return prefix
        prefix += ch
    return prefix
`,
  44: `def is_pangram(s):
    letters = set(ch for ch in s.lower() if "a" <= ch <= "z")
    return len(letters) == 26
`,
  45: `def is_subsequence(a, b):
    i = 0
    for ch in b:
        if i < len(a) and a[i] == ch:
            i += 1
    return i == len(a)
`,
  46: `def find_index(text, word):
    for i in range(len(text) - len(word) + 1):
        match = True
        for j in range(len(word)):
            if text[i + j] != word[j]:
                match = False
                break
        if match:
            return i
    return -1
`,
  47: `def permutations(s):
    if len(s) <= 1:
        return [s]
    out = []
    for i in range(len(s)):
        for rest in permutations(s[:i] + s[i + 1:]):
            out.append(s[i] + rest)
    return out
`,
  48: `def my_atoi(s):
    i = 0
    while i < len(s) and s[i] == " ":
        i += 1
    sign = 1
    if i < len(s) and s[i] in "+-":
        if s[i] == "-":
            sign = -1
        i += 1
    value = 0
    while i < len(s) and "0" <= s[i] <= "9":
        value = value * 10 + (ord(s[i]) - ord("0"))
        i += 1
    value *= sign
    return max(-2147483648, min(2147483647, value))
`,
  49: `def longest_palindrome(s):
    best = ""
    for centre in range(len(s)):
        for left, right in ((centre, centre), (centre, centre + 1)):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            if right - left - 1 > len(best):
                best = s[left + 1:right]
    return best
`,
  50: `def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())
`,
  51: `def min_deletions_to_anagram(a, b):
    counts = {}
    for ch in a:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in b:
        counts[ch] = counts.get(ch, 0) - 1
    return sum(abs(v) for v in counts.values())
`,
  52: `def one_edit_away(a, b):
    if a == b or abs(len(a) - len(b)) > 1:
        return False
    if len(a) < len(b):
        a, b = b, a
    i = j = 0
    edited = False
    while i < len(a) and j < len(b):
        if a[i] != b[j]:
            if edited:
                return False
            edited = True
            if len(a) == len(b):
                j += 1
        else:
            j += 1
        i += 1
    return True
`,
  53: `def zigzag(s, rows):
    if rows == 1:
        return s
    lines = [""] * rows
    row, step = 0, 1
    for ch in s:
        lines[row] += ch
        if row == 0:
            step = 1
        elif row == rows - 1:
            step = -1
        row += step
    return "".join(lines)
`,
  54: `def count_and_say(n):
    term = "1"
    for _ in range(n - 1):
        out = ""
        i = 0
        while i < len(term):
            j = i
            while j < len(term) and term[j] == term[i]:
                j += 1
            out += str(j - i) + term[i]
            i = j
        term = out
    return term
`,
  55: `def min_window(s, t):
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)
    best = ""
    left = 0
    for right, ch in enumerate(s):
        if need.get(ch, 0) > 0:
            missing -= 1
        need[ch] = need.get(ch, 0) - 1
        while missing == 0:
            if not best or right - left + 1 < len(best):
                best = s[left:right + 1]
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return best
`,
};
