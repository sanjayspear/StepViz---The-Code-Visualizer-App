// Java reference solutions for Practice: Strings. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  26: main(`    static String reverseString(String s) {
        String out = "";
        for (int i = s.length() - 1; i >= 0; i--) out += s.charAt(i);
        return out;
    }
`),
  27: main(`    static boolean isPalindromeText(String s) {
        String letters = "";
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isLetter(c)) letters += Character.toLowerCase(c);
        }
        int i = 0;
        int j = letters.length() - 1;
        while (i < j) {
            if (letters.charAt(i) != letters.charAt(j)) return false;
            i++;
            j--;
        }
        return true;
    }
`),
  28: main(`    static int[] countVowelsConsonants(String s) {
        int vowels = 0;
        int consonants = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = Character.toLowerCase(s.charAt(i));
            if (!Character.isLetter(c)) continue;
            if ("aeiou".indexOf(c) >= 0) vowels++;
            else consonants++;
        }
        return new int[] {vowels, consonants};
    }
`),
  29: main(`    static Map<Character, Integer> charFrequency(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        return counts;
    }
`),
  30: main(`    static String firstNonRepeating(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) counts.put(s.charAt(i), counts.getOrDefault(s.charAt(i), 0) + 1);
        for (int i = 0; i < s.length(); i++) {
            if (counts.get(s.charAt(i)) == 1) return "" + s.charAt(i);
        }
        return null;
    }
`),
  31: main(`    static String firstRepeating(String s) {
        Set<Character> seen = new HashSet<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (seen.contains(c)) return "" + c;
            seen.add(c);
        }
        return null;
    }
`),
  32: main(`    static String removeDuplicates(String s) {
        Set<Character> seen = new HashSet<>();
        String out = "";
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (!seen.contains(c)) {
                seen.add(c);
                out += c;
            }
        }
        return out;
    }
`),
  33: main(`    static boolean areAnagrams(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] counts = new int[128];
        for (int i = 0; i < a.length(); i++) counts[a.charAt(i)]++;
        for (int i = 0; i < b.length(); i++) {
            if (counts[b.charAt(i)] == 0) return false;
            counts[b.charAt(i)]--;
        }
        return true;
    }
`),
  34: main(`    static String reverseWords(String sentence) {
        String[] parts = sentence.split(" ");
        String out = "";
        for (int i = parts.length - 1; i >= 0; i--) {
            if (parts[i].isEmpty()) continue;
            out += out.isEmpty() ? parts[i] : " " + parts[i];
        }
        return out;
    }
`),
  35: main(`    static String reverseEachWord(String sentence) {
        String out = "";
        String word = "";
        for (int i = 0; i < sentence.length(); i++) {
            char c = sentence.charAt(i);
            if (c == ' ') {
                out += word + " ";
                word = "";
            } else {
                word = c + word;
            }
        }
        return out + word;
    }
`),
  36: main(`    static String capitalizeWords(String sentence) {
        String out = "";
        for (int i = 0; i < sentence.length(); i++) {
            char c = sentence.charAt(i);
            out += (i == 0 || sentence.charAt(i - 1) == ' ') ? Character.toUpperCase(c) : c;
        }
        return out;
    }
`),
  37: main(`    static boolean allUnique(String s) {
        for (int i = 0; i < s.length(); i++) {
            for (int j = i + 1; j < s.length(); j++) {
                if (s.charAt(i) == s.charAt(j)) return false;
            }
        }
        return true;
    }
`),
  38: main(`    static String longestWord(String sentence) {
        String best = "";
        for (String w : sentence.split(" ")) {
            if (w.length() > best.length()) best = w;
        }
        return best;
    }
`),
  39: main(`    static int countWords(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) != ' ' && (i == 0 || s.charAt(i - 1) == ' ')) count++;
        }
        return count;
    }
`),
  40: main(`    static boolean isRotation(String a, String b) {
        return a.length() == b.length() && (a + a).contains(b);
    }
`),
  41: main(`    static String compress(String s) {
        String out = "";
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            out += s.charAt(i) + "" + (j - i);
            i = j;
        }
        return out.length() < s.length() ? out : s;
    }
`),
  42: main(`    static String decode(String s) {
        String out = "";
        int i = 0;
        while (i < s.length()) {
            char letter = s.charAt(i);
            i++;
            int count = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                count = count * 10 + (s.charAt(i) - '0');
                i++;
            }
            for (int k = 0; k < count; k++) out += letter;
        }
        return out;
    }
`),
  43: main(`    static String longestCommonPrefix(String[] words) {
        if (words.length == 0) return "";
        String prefix = "";
        for (int i = 0; i < words[0].length(); i++) {
            char c = words[0].charAt(i);
            for (String w : words) {
                if (i >= w.length() || w.charAt(i) != c) return prefix;
            }
            prefix += c;
        }
        return prefix;
    }
`),
  44: main(`    static boolean isPangram(String s) {
        boolean[] seen = new boolean[26];
        String lower = s.toLowerCase();
        for (int i = 0; i < lower.length(); i++) {
            char c = lower.charAt(i);
            if (c >= 'a' && c <= 'z') seen[c - 'a'] = true;
        }
        for (boolean b : seen) {
            if (!b) return false;
        }
        return true;
    }
`),
  45: main(`    static boolean isSubsequence(String a, String b) {
        int i = 0;
        for (int j = 0; j < b.length(); j++) {
            if (i < a.length() && a.charAt(i) == b.charAt(j)) i++;
        }
        return i == a.length();
    }
`),
  46: main(`    static int findIndex(String text, String word) {
        for (int i = 0; i + word.length() <= text.length(); i++) {
            int j = 0;
            while (j < word.length() && text.charAt(i + j) == word.charAt(j)) j++;
            if (j == word.length()) return i;
        }
        return -1;
    }
`),
  47: main(`    static List<String> permutations(String s) {
        List<String> out = new ArrayList<>();
        if (s.length() <= 1) {
            out.add(s);
            return out;
        }
        for (int i = 0; i < s.length(); i++) {
            String rest = s.substring(0, i) + s.substring(i + 1);
            for (String p : permutations(rest)) out.add(s.charAt(i) + p);
        }
        return out;
    }
`),
  48: main(`    static int myAtoi(String s) {
        int i = 0;
        while (i < s.length() && s.charAt(i) == ' ') i++;
        int sign = 1;
        if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            if (s.charAt(i) == '-') sign = -1;
            i++;
        }
        long value = 0;
        while (i < s.length() && Character.isDigit(s.charAt(i))) {
            value = value * 10 + (s.charAt(i) - '0');
            if (value > 2147483648L) break;
            i++;
        }
        value *= sign;
        if (value > 2147483647L) return 2147483647;
        if (value < -2147483648L) return -2147483648;
        return (int) value;
    }
`),
  49: main(`    static String longestPalindrome(String s) {
        String best = "";
        for (int c = 0; c < s.length(); c++) {
            for (int extra = 0; extra < 2; extra++) {
                int lo = c;
                int hi = c + extra;
                while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
                    lo--;
                    hi++;
                }
                if (hi - lo - 1 > best.length()) best = s.substring(lo + 1, hi);
            }
        }
        return best;
    }
`),
  50: main(`    static List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new LinkedHashMap<>();
        for (String w : words) {
            char[] cs = w.toCharArray();
            Arrays.sort(cs);
            String key = new String(cs);
            if (!groups.containsKey(key)) groups.put(key, new ArrayList<>());
            groups.get(key).add(w);
        }
        List<List<String>> out = new ArrayList<>();
        for (List<String> g : groups.values()) out.add(g);
        return out;
    }
`),
  51: main(`    static int minDeletionsToAnagram(String a, String b) {
        int[] counts = new int[128];
        for (int i = 0; i < a.length(); i++) counts[a.charAt(i)]++;
        for (int i = 0; i < b.length(); i++) counts[b.charAt(i)]--;
        int total = 0;
        for (int n : counts) total += Math.abs(n);
        return total;
    }
`),
  52: main(`    static boolean oneEditAway(String a, String b) {
        if (a.equals(b) || Math.abs(a.length() - b.length()) > 1) return false;
        if (a.length() < b.length()) {
            String t = a;
            a = b;
            b = t;
        }
        int i = 0;
        while (i < b.length() && a.charAt(i) == b.charAt(i)) i++;
        if (a.length() == b.length()) return a.substring(i + 1).equals(b.substring(i + 1));
        return a.substring(i + 1).equals(b.substring(i));
    }
`),
  53: main(`    static String zigzag(String s, int rows) {
        if (rows == 1) return s;
        String[] lines = new String[rows];
        for (int r = 0; r < rows; r++) lines[r] = "";
        int row = 0;
        int step = 1;
        for (int i = 0; i < s.length(); i++) {
            lines[row] += s.charAt(i);
            if (row == 0) step = 1;
            else if (row == rows - 1) step = -1;
            row += step;
        }
        String out = "";
        for (String line : lines) out += line;
        return out;
    }
`),
  54: main(`    static String countAndSay(int n) {
        String term = "1";
        for (int k = 1; k < n; k++) {
            String next = "";
            int i = 0;
            while (i < term.length()) {
                int j = i;
                while (j < term.length() && term.charAt(j) == term.charAt(i)) j++;
                next += (j - i) + "" + term.charAt(i);
                i = j;
            }
            term = next;
        }
        return term;
    }
`),
  55: main(`    static String minWindow(String s, String t) {
        int[] need = new int[128];
        for (int i = 0; i < t.length(); i++) need[t.charAt(i)]++;
        int missing = t.length();
        String best = "";
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need[c] > 0) missing--;
            need[c]--;
            while (missing == 0) {
                if (best.isEmpty() || right - left + 1 < best.length()) best = s.substring(left, right + 1);
                char out = s.charAt(left);
                left++;
                need[out]++;
                if (need[out] > 0) missing++;
            }
        }
        return best;
    }
`),
};
