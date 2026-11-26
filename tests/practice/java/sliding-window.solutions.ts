// Java reference solutions for Practice: Sliding window. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
/** Start positions of windows of text whose letter counts match word's. */
const MATCHES = `    static List<Integer> matches(String text, String word) {
        List<Integer> out = new ArrayList<>();
        int m = word.length();
        if (m > text.length()) return out;
        int[] need = new int[128];
        int[] have = new int[128];
        for (int i = 0; i < m; i++) need[word.charAt(i)]++;
        for (int i = 0; i < text.length(); i++) {
            have[text.charAt(i)]++;
            if (i >= m) have[text.charAt(i - m)]--;
            if (i < m - 1) continue;
            boolean same = true;
            for (int c = 0; c < 128; c++) {
                if (need[c] != have[c]) {
                    same = false;
                    break;
                }
            }
            if (same) out.add(i - m + 1);
        }
        return out;
    }
`;
const DISTINCT = `    static int atMost(int[] nums, int limit) {
        if (limit < 0) return 0;
        Map<Integer, Integer> counts = new HashMap<>();
        int left = 0;
        int total = 0;
        for (int right = 0; right < nums.length; right++) {
            counts.put(nums[right], counts.getOrDefault(nums[right], 0) + 1);
            while (counts.size() > limit) {
                int c = counts.get(nums[left]) - 1;
                if (c == 0) counts.remove(nums[left]);
                else counts.put(nums[left], c);
                left++;
            }
            total += right - left + 1;
        }
        return total;
    }
`;

export const SOLUTIONS: Record<number, string> = {
  131: main(`    static int maxSumK(int[] nums, int k) {
        int window = 0;
        for (int i = 0; i < k; i++) window += nums[i];
        int best = window;
        for (int i = k; i < nums.length; i++) {
            window += nums[i] - nums[i - k];
            best = Math.max(best, window);
        }
        return best;
    }
`),
  132: main(`    static double[] windowAverages(int[] nums, int k) {
        if (k > nums.length) return new double[0];
        double[] out = new double[nums.length - k + 1];
        int total = 0;
        for (int i = 0; i < nums.length; i++) {
            total += nums[i];
            if (i >= k) total -= nums[i - k];
            if (i >= k - 1) out[i - k + 1] = (double) total / k;
        }
        return out;
    }
`),
  133: main(`    static int[] firstNegatives(int[] nums, int k) {
        int[] out = new int[nums.length - k + 1];
        ArrayDeque<Integer> negs = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] < 0) negs.addLast(i);
            if (!negs.isEmpty() && negs.peekFirst() <= i - k) negs.pollFirst();
            if (i >= k - 1) out[i - k + 1] = negs.isEmpty() ? 0 : nums[negs.peekFirst()];
        }
        return out;
    }
`),
  134: main(`    static int maxVowels(String s, int k) {
        int count = 0;
        for (int i = 0; i < k; i++) if ("aeiou".indexOf(s.charAt(i)) >= 0) count++;
        int best = count;
        for (int i = k; i < s.length(); i++) {
            if ("aeiou".indexOf(s.charAt(i)) >= 0) count++;
            if ("aeiou".indexOf(s.charAt(i - k)) >= 0) count--;
            best = Math.max(best, count);
        }
        return best;
    }
`),
  135: main(`    static int longestUniqueSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last.containsKey(c) && last.get(c) >= left) left = last.get(c) + 1;
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
`),
  136: main(`    static int longestKDistinct(String s, int k) {
        Map<Character, Integer> counts = new HashMap<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            counts.put(c, counts.getOrDefault(c, 0) + 1);
            while (counts.size() > k) {
                char d = s.charAt(left);
                int n = counts.get(d) - 1;
                if (n == 0) counts.remove(d);
                else counts.put(d, n);
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
`),
  137: main(`    static int characterReplacement(String s, int k) {
        int[] counts = new int[128];
        int left = 0;
        int top = 0;
        int best = 0;
        for (int right = 0; right < s.length(); right++) {
            counts[s.charAt(right)]++;
            top = Math.max(top, counts[s.charAt(right)]);
            while (right - left + 1 - top > k) {
                counts[s.charAt(left)]--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
`),
  138: main(`    static int longestOnes(int[] nums, int k) {
        int left = 0;
        int zeros = 0;
        int best = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) {
                if (nums[left] == 0) zeros--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
`),
  139: main(`    static int minSubarrayLen(int target, int[] nums) {
        int left = 0;
        int total = 0;
        int best = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            total += nums[right];
            while (total >= target) {
                best = Math.min(best, right - left + 1);
                total -= nums[left];
                left++;
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
`),
  140: main(`${DISTINCT}
    static int longestTwoValues(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < nums.length; right++) {
            counts.put(nums[right], counts.getOrDefault(nums[right], 0) + 1);
            while (counts.size() > 2) {
                int c = counts.get(nums[left]) - 1;
                if (c == 0) counts.remove(nums[left]);
                else counts.put(nums[left], c);
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
`),
  141: main(`${MATCHES}
    static boolean containsPermutation(String p, String s) {
        return !matches(s, p).isEmpty();
    }
`),
  142: main(`${MATCHES}
    static List<Integer> findAnagrams(String text, String pattern) {
        return matches(text, pattern);
    }
`),
  143: main(`    static int productsBelowK(int[] nums, int k) {
        if (k <= 1) return 0;
        long product = 1;
        int left = 0;
        int count = 0;
        for (int right = 0; right < nums.length; right++) {
            product *= nums[right];
            while (product >= k) {
                product /= nums[left];
                left++;
            }
            count += right - left + 1;
        }
        return count;
    }
`),
  144: main(`    static int longestAfterDelete(int[] nums) {
        int left = 0;
        int zeros = 0;
        int best = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > 1) {
                if (nums[left] == 0) zeros--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best - 1;
    }
`),
  145: main(`    static int maxCardPoints(int[] cards, int k) {
        int n = cards.length;
        int size = n - k;
        int total = 0;
        for (int x : cards) total += x;
        if (size == 0) return total;
        int window = 0;
        for (int i = 0; i < size; i++) window += cards[i];
        int smallest = window;
        for (int i = size; i < n; i++) {
            window += cards[i] - cards[i - size];
            smallest = Math.min(smallest, window);
        }
        return total - smallest;
    }
`),
  146: main(`    static int minSwapsGroupOnes(int[] data) {
        int m = 0;
        for (int x : data) m += x;
        if (m == 0) return 0;
        int window = 0;
        for (int i = 0; i < m; i++) window += data[i];
        int best = window;
        for (int i = m; i < data.length; i++) {
            window += data[i] - data[i - m];
            best = Math.max(best, window);
        }
        return m - best;
    }
`),
  147: main(`${MATCHES}
    static int countAnagramWindows(String text, String word) {
        return matches(text, word).size();
    }
`),
  148: main(`${DISTINCT}
    static int exactlyKDistinct(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }
`),
  149: main(`    static int[] maxSlidingWindow(int[] nums, int k) {
        int[] out = new int[nums.length - k + 1];
        ArrayDeque<Integer> window = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            while (!window.isEmpty() && nums[window.peekLast()] <= nums[i]) window.pollLast();
            window.addLast(i);
            if (window.peekFirst() <= i - k) window.pollFirst();
            if (i >= k - 1) out[i - k + 1] = nums[window.peekFirst()];
        }
        return out;
    }
`),
  150: main(`    static int longestWithKRepeats(String s, int k) {
        if (s.length() < k) return 0;
        int[] counts = new int[128];
        for (int i = 0; i < s.length(); i++) counts[s.charAt(i)]++;
        for (int i = 0; i < s.length(); i++) {
            if (counts[s.charAt(i)] < k) {
                return Math.max(longestWithKRepeats(s.substring(0, i), k), longestWithKRepeats(s.substring(i + 1), k));
            }
        }
        return s.length();
    }
`),
};
