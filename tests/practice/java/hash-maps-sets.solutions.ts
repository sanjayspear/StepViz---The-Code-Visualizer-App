// Java reference solutions for Practice: Hash maps & sets. Never shipped to students.
const main = (methods: string, before = '') => `import java.util.*;
${before}
public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  86: main(`    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[] {seen.get(target - nums[i]), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
`),
  87: main(`    static boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) return true;
        }
        return false;
    }
`),
  88: main(`    static Map<Integer, Integer> elementFrequency(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        return counts;
    }
`),
  89: main(`    static int mostFrequent(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        int best = nums[0];
        for (int x : counts.keySet()) {
            int c = counts.get(x);
            int b = counts.get(best);
            if (c > b || (c == b && x < best)) best = x;
        }
        return best;
    }
`),
  90: main(`    static List<Integer> appearOnce(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        List<Integer> out = new ArrayList<>();
        for (int x : nums) {
            if (counts.get(x) == 1) out.add(x);
        }
        return out;
    }
`),
  91: main(`    static boolean sameElements(int[] a, int[] b) {
        if (a.length != b.length) return false;
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : a) counts.put(x, counts.getOrDefault(x, 0) + 1);
        for (int x : b) {
            int c = counts.getOrDefault(x, 0);
            if (c == 0) return false;
            counts.put(x, c - 1);
        }
        return true;
    }
`),
  92: main(`    static List<Integer> commonInThree(int[] a, int[] b, int[] c) {
        List<Integer> out = new ArrayList<>();
        int i = 0;
        int j = 0;
        int k = 0;
        while (i < a.length && j < b.length && k < c.length) {
            if (a[i] == b[j] && b[j] == c[k]) {
                if (out.isEmpty() || out.get(out.size() - 1) != a[i]) out.add(a[i]);
                i++;
                j++;
                k++;
            } else {
                int smallest = Math.min(a[i], Math.min(b[j], c[k]));
                if (a[i] == smallest) i++;
                else if (b[j] == smallest) j++;
                else k++;
            }
        }
        return out;
    }
`),
  93: main(`    static boolean isIsomorphic(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Character> st = new HashMap<>();
        Map<Character, Character> ts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i);
            char b = t.charAt(i);
            if (st.containsKey(a) && st.get(a) != b) return false;
            if (ts.containsKey(b) && ts.get(b) != a) return false;
            st.put(a, b);
            ts.put(b, a);
        }
        return true;
    }
`),
  94: main(`    static boolean wordPattern(String pattern, String s) {
        String[] words = s.split(" ");
        if (words.length != pattern.length()) return false;
        Map<Character, String> lw = new HashMap<>();
        Map<String, Character> wl = new HashMap<>();
        for (int i = 0; i < words.length; i++) {
            char l = pattern.charAt(i);
            String w = words[i];
            if (lw.containsKey(l) && !lw.get(l).equals(w)) return false;
            if (wl.containsKey(w) && wl.get(w) != l) return false;
            lw.put(l, w);
            wl.put(w, l);
        }
        return true;
    }
`),
  95: main(`    static boolean canConstruct(String note, String magazine) {
        int[] counts = new int[128];
        for (int i = 0; i < magazine.length(); i++) counts[magazine.charAt(i)]++;
        for (int i = 0; i < note.length(); i++) {
            char c = note.charAt(i);
            if (counts[c] == 0) return false;
            counts[c]--;
        }
        return true;
    }
`),
  96: main(`    static boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1) {
            if (seen.contains(n)) return false;
            seen.add(n);
            int next = 0;
            while (n > 0) {
                int d = n % 10;
                next += d * d;
                n /= 10;
            }
            n = next;
        }
        return true;
    }
`),
  97: main(`    static boolean nearbyDuplicate(int[] nums, int k) {
        Map<Integer, Integer> last = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (last.containsKey(nums[i]) && i - last.get(nums[i]) <= k) return true;
            last.put(nums[i], i);
        }
        return false;
    }
`),
  98: main(`    static List<Integer> topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        List<Integer> values = new ArrayList<>(counts.keySet());
        values.sort((a, b) -> counts.get(b) - counts.get(a));
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < k; i++) out.add(values.get(i));
        return out;
    }
`),
  99: main(`    static String frequencySort(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) counts.put(s.charAt(i), counts.getOrDefault(s.charAt(i), 0) + 1);
        List<Character> chars = new ArrayList<>(counts.keySet());
        chars.sort((a, b) -> counts.get(b) != counts.get(a) ? counts.get(b) - counts.get(a) : a - b);
        String out = "";
        for (char c : chars) {
            for (int i = 0; i < counts.get(c); i++) out += c;
        }
        return out;
    }
`),
  100: main(`    static int subarraySumCount(int[] nums, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int total = 0;
        int count = 0;
        for (int x : nums) {
            total += x;
            count += seen.getOrDefault(total - k, 0);
            seen.put(total, seen.getOrDefault(total, 0) + 1);
        }
        return count;
    }
`),
  101: main(`    static int longestZeroSum(int[] nums) {
        Map<Integer, Integer> first = new HashMap<>();
        first.put(0, -1);
        int total = 0;
        int best = 0;
        for (int i = 0; i < nums.length; i++) {
            total += nums[i];
            if (first.containsKey(total)) best = Math.max(best, i - first.get(total));
            else first.put(total, i);
        }
        return best;
    }
`),
  102: main(`    static int longestEqual01(int[] nums) {
        Map<Integer, Integer> first = new HashMap<>();
        first.put(0, -1);
        int total = 0;
        int best = 0;
        for (int i = 0; i < nums.length; i++) {
            total += nums[i] == 1 ? 1 : -1;
            if (first.containsKey(total)) best = Math.max(best, i - first.get(total));
            else first.put(total, i);
        }
        return best;
    }
`),
  103: main(`    static int pairsWithDifference(int[] nums, int k) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        int pairs = 0;
        for (int x : counts.keySet()) {
            if (k == 0 ? counts.get(x) >= 2 : counts.containsKey(x + k)) pairs++;
        }
        return pairs;
    }
`),
  104: main(`    static int pairsDivisibleByK(int[] nums, int k) {
        int[] seen = new int[k];
        int count = 0;
        for (int x : nums) {
            int r = ((x % k) + k) % k;
            count += seen[(k - r) % k];
            seen[r]++;
        }
        return count;
    }
`),
  105: main(`    static boolean validSudoku(char[][] board) {
        boolean[][] rows = new boolean[9][10];
        boolean[][] cols = new boolean[9][10];
        boolean[][] boxes = new boolean[9][10];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                char ch = board[r][c];
                if (ch == '.') continue;
                int d = ch - '0';
                int b = r / 3 * 3 + c / 3;
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
                rows[r][d] = true;
                cols[c][d] = true;
                boxes[b][d] = true;
            }
        }
        return true;
    }
`),
  106: main(`    static int fourSumCount(int[] a, int[] b, int[] c, int[] d) {
        Map<Integer, Integer> sums = new HashMap<>();
        for (int x : a) {
            for (int y : b) sums.put(x + y, sums.getOrDefault(x + y, 0) + 1);
        }
        int count = 0;
        for (int z : c) {
            for (int w : d) count += sums.getOrDefault(-(z + w), 0);
        }
        return count;
    }
`),
  107: main(
    ``,
    `
class MyHashMap {
    List<List<Integer>> keys = new ArrayList<>();
    List<List<Integer>> values = new ArrayList<>();

    MyHashMap() {
        for (int i = 0; i < 1000; i++) {
            keys.add(new ArrayList<>());
            values.add(new ArrayList<>());
        }
    }

    void put(int key, int value) {
        List<Integer> ks = keys.get(key % 1000);
        List<Integer> vs = values.get(key % 1000);
        for (int i = 0; i < ks.size(); i++) {
            if (ks.get(i) == key) {
                vs.set(i, value);
                return;
            }
        }
        ks.add(key);
        vs.add(value);
    }

    int get(int key) {
        List<Integer> ks = keys.get(key % 1000);
        for (int i = 0; i < ks.size(); i++) {
            if (ks.get(i) == key) return values.get(key % 1000).get(i);
        }
        return -1;
    }

    void remove(int key) {
        List<Integer> ks = keys.get(key % 1000);
        for (int i = 0; i < ks.size(); i++) {
            if (ks.get(i) == key) {
                ks.remove(i);
                values.get(key % 1000).remove(i);
                return;
            }
        }
    }
}
`,
  ),
  108: main(
    ``,
    `
class LRUCache {
    int capacity;
    LinkedHashMap<Integer, Integer> items = new LinkedHashMap<>();

    LRUCache(int capacity) {
        this.capacity = capacity;
    }

    int get(int key) {
        if (!items.containsKey(key)) return -1;
        int value = items.get(key);
        items.remove(key);
        items.put(key, value);
        return value;
    }

    void put(int key, int value) {
        items.remove(key);
        items.put(key, value);
        if (items.size() > capacity) {
            int oldest = -1;
            for (int k : items.keySet()) {
                oldest = k;
                break;
            }
            items.remove(oldest);
        }
    }
}
`,
  ),
  109: main(`    static List<List<String>> groupShifted(String[] words) {
        Map<String, List<String>> groups = new LinkedHashMap<>();
        for (String w : words) {
            String key = "";
            for (int i = 1; i < w.length(); i++) key += ((w.charAt(i) - w.charAt(i - 1) + 26) % 26) + ",";
            if (!groups.containsKey(key)) groups.put(key, new ArrayList<>());
            groups.get(key).add(w);
        }
        return new ArrayList<>(groups.values());
    }
`),
  110: main(`    static int firstMissingPositive(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                int j = nums[i] - 1;
                int t = nums[i];
                nums[i] = nums[j];
                nums[j] = t;
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) return i + 1;
        }
        return n + 1;
    }
`),
};
