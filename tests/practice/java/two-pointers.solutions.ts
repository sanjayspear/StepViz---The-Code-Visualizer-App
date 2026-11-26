// Java reference solutions for Practice: Two pointers. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  111: main(`    static int[] twoSumSorted(int[] nums, int target) {
        int i = 0;
        int j = nums.length - 1;
        while (i < j) {
            int s = nums[i] + nums[j];
            if (s == target) return new int[] {i, j};
            if (s < target) i++;
            else j--;
        }
        return new int[0];
    }
`),
  112: main(`    static boolean vowel(char c) {
        return "aeiouAEIOU".indexOf(c) >= 0;
    }

    static String reverseVowels(String s) {
        char[] chars = s.toCharArray();
        int i = 0;
        int j = chars.length - 1;
        while (i < j) {
            if (!vowel(chars[i])) i++;
            else if (!vowel(chars[j])) j--;
            else {
                char t = chars[i];
                chars[i] = chars[j];
                chars[j] = t;
                i++;
                j--;
            }
        }
        return new String(chars);
    }
`),
  113: main(`    static int removeElement(int[] nums, int val) {
        int k = 0;
        for (int x : nums) {
            if (x != val) {
                nums[k] = x;
                k++;
            }
        }
        return k;
    }
`),
  114: main(`    static int[] sortedSquares(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int i = 0;
        int j = n - 1;
        for (int w = n - 1; w >= 0; w--) {
            if (Math.abs(nums[i]) > Math.abs(nums[j])) {
                out[w] = nums[i] * nums[i];
                i++;
            } else {
                out[w] = nums[j] * nums[j];
                j--;
            }
        }
        return out;
    }
`),
  115: main(`    static void mergeInto(int[] a, int m, int[] b, int n) {
        int i = m - 1;
        int j = n - 1;
        int w = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && a[i] > b[j]) {
                a[w] = a[i];
                i--;
            } else {
                a[w] = b[j];
                j--;
            }
            w--;
        }
    }
`),
  116: main(`    static void negativesFirst(int[] nums) {
        int k = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] < 0) {
                int t = nums[i];
                nums[i] = nums[k];
                nums[k] = t;
                k++;
            }
        }
    }
`),
  117: main(`    static String real(String text) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '#') {
                if (out.length() > 0) out.deleteCharAt(out.length() - 1);
            } else {
                out.append(c);
            }
        }
        return out.toString();
    }

    static boolean backspaceCompare(String s, String t) {
        return real(s).equals(real(t));
    }
`),
  118: main(`    static boolean isPal(String s, int i, int j) {
        while (i < j) {
            if (s.charAt(i) != s.charAt(j)) return false;
            i++;
            j--;
        }
        return true;
    }

    static boolean palindromeAfterOneDelete(String s) {
        int i = 0;
        int j = s.length() - 1;
        while (i < j) {
            if (s.charAt(i) != s.charAt(j)) return isPal(s, i + 1, j) || isPal(s, i, j - 1);
            i++;
            j--;
        }
        return true;
    }
`),
  119: main(`    static boolean hasPairWithDifference(int[] nums, int k) {
        int i = 0;
        int j = 1;
        while (j < nums.length) {
            if (i == j) {
                j++;
                continue;
            }
            int d = nums[j] - nums[i];
            if (d == k) return true;
            if (d < k) j++;
            else i++;
        }
        return false;
    }
`),
  120: main(`    static int maxArea(int[] height) {
        int i = 0;
        int j = height.length - 1;
        int best = 0;
        while (i < j) {
            best = Math.max(best, (j - i) * Math.min(height[i], height[j]));
            if (height[i] < height[j]) i++;
            else j--;
        }
        return best;
    }
`),
  121: main(`    static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int lo = i + 1;
            int hi = nums.length - 1;
            while (lo < hi) {
                int s = nums[i] + nums[lo] + nums[hi];
                if (s < 0) lo++;
                else if (s > 0) hi--;
                else {
                    List<Integer> t = new ArrayList<>();
                    t.add(nums[i]);
                    t.add(nums[lo]);
                    t.add(nums[hi]);
                    out.add(t);
                    while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                    lo++;
                    hi--;
                }
            }
        }
        return out;
    }
`),
  122: main(`    static int threeSumClosest(int[] nums, int target) {
        Arrays.sort(nums);
        int best = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < nums.length - 2; i++) {
            int lo = i + 1;
            int hi = nums.length - 1;
            while (lo < hi) {
                int s = nums[i] + nums[lo] + nums[hi];
                if (Math.abs(s - target) < Math.abs(best - target)) best = s;
                if (s < target) lo++;
                else if (s > target) hi--;
                else return s;
            }
        }
        return best;
    }
`),
  123: main(`    static List<List<Integer>> fourSum(int[] nums, int target) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        int n = nums.length;
        for (int a = 0; a < n; a++) {
            if (a > 0 && nums[a] == nums[a - 1]) continue;
            for (int b = a + 1; b < n; b++) {
                if (b > a + 1 && nums[b] == nums[b - 1]) continue;
                int lo = b + 1;
                int hi = n - 1;
                while (lo < hi) {
                    int s = nums[a] + nums[b] + nums[lo] + nums[hi];
                    if (s < target) lo++;
                    else if (s > target) hi--;
                    else {
                        List<Integer> t = new ArrayList<>();
                        t.add(nums[a]);
                        t.add(nums[b]);
                        t.add(nums[lo]);
                        t.add(nums[hi]);
                        out.add(t);
                        while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                        lo++;
                        hi--;
                    }
                }
            }
        }
        return out;
    }
`),
  124: main(`    static void sortColors(int[] nums) {
        int low = 0;
        int mid = 0;
        int high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int t = nums[low];
                nums[low] = nums[mid];
                nums[mid] = t;
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int t = nums[mid];
                nums[mid] = nums[high];
                nums[high] = t;
                high--;
            }
        }
    }
`),
  125: main(`    static int removeExtraDuplicates(int[] nums) {
        int k = 0;
        for (int x : nums) {
            if (k < 2 || x != nums[k - 2]) {
                nums[k] = x;
                k++;
            }
        }
        return k;
    }
`),
  126: main(`    static int countPairsBelow(int[] nums, int target) {
        int i = 0;
        int j = nums.length - 1;
        int count = 0;
        while (i < j) {
            if (nums[i] + nums[j] < target) {
                count += j - i;
                i++;
            } else {
                j--;
            }
        }
        return count;
    }
`),
  127: main(`    static int numBoats(int[] people, int limit) {
        Arrays.sort(people);
        int i = 0;
        int j = people.length - 1;
        int boats = 0;
        while (i <= j) {
            if (people[i] + people[j] <= limit) i++;
            j--;
            boats++;
        }
        return boats;
    }
`),
  128: main(`    static int shortestUnsorted(int[] nums) {
        int n = nums.length;
        int end = -1;
        int start = 0;
        int biggest = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            if (nums[i] < biggest) end = i;
            else biggest = nums[i];
        }
        int smallest = Integer.MAX_VALUE;
        for (int i = n - 1; i >= 0; i--) {
            if (nums[i] > smallest) start = i;
            else smallest = nums[i];
        }
        return end == -1 ? 0 : end - start + 1;
    }
`),
  129: main(`    static int smallestDifference(int[] a, int[] b) {
        int i = 0;
        int j = 0;
        int best = Integer.MAX_VALUE;
        while (i < a.length && j < b.length) {
            best = Math.min(best, Math.abs(a[i] - b[j]));
            if (a[i] < b[j]) i++;
            else j++;
        }
        return best;
    }
`),
  130: main(`    static int triangleCount(int[] nums) {
        Arrays.sort(nums);
        int count = 0;
        for (int k = nums.length - 1; k > 1; k--) {
            int lo = 0;
            int hi = k - 1;
            while (lo < hi) {
                if (nums[lo] + nums[hi] > nums[k]) {
                    count += hi - lo;
                    hi--;
                } else {
                    lo++;
                }
            }
        }
        return count;
    }
`),
};
