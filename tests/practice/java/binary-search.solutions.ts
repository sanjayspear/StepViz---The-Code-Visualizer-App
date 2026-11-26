// Java reference solutions for Practice: Binary search. Never shipped to students.
const main = (methods: string, before = '') => `import java.util.*;
${before}
public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  171: main(`    static int binarySearch(int[] nums, int target) {
        int low = 0;
        int high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
`),
  172: main(`    static int searchInsert(int[] nums, int target) {
        int low = 0;
        int high = nums.length;
        while (low < high) {
            int mid = (low + high) / 2;
            if (nums[mid] < target) low = mid + 1;
            else high = mid;
        }
        return low;
    }
`),
  173: main(`    static int firstAtLeast(int[] nums, int x) {
        int low = 0;
        int high = nums.length;
        while (low < high) {
            int mid = (low + high) / 2;
            if (nums[mid] < x) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    static int countOccurrences(int[] nums, int target) {
        return firstAtLeast(nums, target + 1) - firstAtLeast(nums, target);
    }
`),
  174: main(`    static int floorSqrt(int n) {
        long low = 0;
        long high = n;
        long answer = 0;
        while (low <= high) {
            long mid = (low + high) / 2;
            if (mid * mid <= n) {
                answer = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return (int) answer;
    }
`),
  175: main(`    static boolean isPerfectSquare(int n) {
        long low = 1;
        long high = n;
        while (low <= high) {
            long mid = (low + high) / 2;
            if (mid * mid == n) return true;
            if (mid * mid < n) low = mid + 1;
            else high = mid - 1;
        }
        return false;
    }
`),
  176: main(
    `    static int guessNumber(int n, Guesser g) {
        int low = 1;
        int high = n;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int r = g.guess(mid);
            if (r == 0) return mid;
            if (r < 0) high = mid - 1;
            else low = mid + 1;
        }
        return -1;
    }
`,
    `
class Guesser {
    int hidden;

    Guesser(int hidden) {
        this.hidden = hidden;
    }

    int guess(int x) {
        if (x == hidden) return 0;
        return hidden < x ? -1 : 1;
    }
}
`,
  ),
  177: main(
    `    static int firstBadVersion(int n, VersionChecker checker) {
        int low = 1;
        int high = n;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (checker.isBad(mid)) high = mid;
            else low = mid + 1;
        }
        return low;
    }
`,
    `
class VersionChecker {
    int firstBad;

    VersionChecker(int firstBad) {
        this.firstBad = firstBad;
    }

    boolean isBad(int v) {
        return v >= firstBad;
    }
}
`,
  ),
  178: main(`    static char nextLetter(char[] letters, char target) {
        int low = 0;
        int high = letters.length;
        while (low < high) {
            int mid = (low + high) / 2;
            if (letters[mid] <= target) low = mid + 1;
            else high = mid;
        }
        return letters[low % letters.length];
    }
`),
  179: main(`    static int edge(int[] nums, int target, boolean leftmost) {
        int low = 0;
        int high = nums.length - 1;
        int found = -1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (nums[mid] == target) {
                found = mid;
                if (leftmost) high = mid - 1;
                else low = mid + 1;
            } else if (nums[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return found;
    }

    static int[] searchRange(int[] nums, int target) {
        return new int[] {edge(nums, target, true), edge(nums, target, false)};
    }
`),
  180: main(`    static int findPeak(int[] nums) {
        int low = 0;
        int high = nums.length - 1;
        while (low < high) {
            int mid = (low + high) / 2;
            if (nums[mid] < nums[mid + 1]) low = mid + 1;
            else high = mid;
        }
        return low;
    }
`),
  181: main(`    static int searchRotated(int[] nums, int target) {
        int low = 0;
        int high = nums.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
`),
  182: main(`    static int findMinRotated(int[] nums) {
        int low = 0;
        int high = nums.length - 1;
        while (low < high) {
            int mid = (low + high) / 2;
            if (nums[mid] > nums[high]) low = mid + 1;
            else high = mid;
        }
        return nums[low];
    }
`),
  183: main(`    static boolean searchMatrix(int[][] matrix, int target) {
        if (matrix.length == 0 || matrix[0].length == 0) return false;
        int r = 0;
        int c = matrix[0].length - 1;
        while (r < matrix.length && c >= 0) {
            int v = matrix[r][c];
            if (v == target) return true;
            if (v > target) c--;
            else r++;
        }
        return false;
    }
`),
  184: main(`    static int singleInSorted(int[] nums) {
        int low = 0;
        int high = nums.length - 1;
        while (low < high) {
            int mid = (low + high) / 2;
            if (mid % 2 == 1) mid--;
            if (nums[mid] == nums[mid + 1]) low = mid + 2;
            else high = mid;
        }
        return nums[low];
    }
`),
  185: main(`    static int minEatingSpeed(int[] piles, int h) {
        int low = 1;
        int high = 0;
        for (int p : piles) high = Math.max(high, p);
        while (low < high) {
            int k = low + (high - low) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;
            if (hours <= h) high = k;
            else low = k + 1;
        }
        return low;
    }
`),
  186: main(`    static int daysNeeded(int[] weights, int cap) {
        int count = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > cap) {
                count++;
                load = 0;
            }
            load += w;
        }
        return count;
    }

    static int shipWithinDays(int[] weights, int days) {
        int low = 0;
        int high = 0;
        for (int w : weights) {
            low = Math.max(low, w);
            high += w;
        }
        while (low < high) {
            int mid = (low + high) / 2;
            if (daysNeeded(weights, mid) <= days) high = mid;
            else low = mid + 1;
        }
        return low;
    }
`),
  187: main(`    static int countAtMost(int[][] matrix, int x) {
        int n = matrix.length;
        int r = n - 1;
        int c = 0;
        int count = 0;
        while (r >= 0 && c < n) {
            if (matrix[r][c] <= x) {
                count += r + 1;
                c++;
            } else {
                r--;
            }
        }
        return count;
    }

    static int kthSmallestMatrix(int[][] matrix, int k) {
        int n = matrix.length;
        int low = matrix[0][0];
        int high = matrix[n - 1][n - 1];
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (countAtMost(matrix, mid) >= k) high = mid;
            else low = mid + 1;
        }
        return low;
    }
`),
  188: main(
    `    static int searchUnknown(Reader reader, int target) {
        int high = 1;
        while (reader.get(high) < target) high *= 2;
        int low = high / 2;
        while (low <= high) {
            int mid = (low + high) / 2;
            int v = reader.get(mid);
            if (v == target) return mid;
            if (v < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
`,
    `
class Reader {
    int[] data;

    Reader(int[] data) {
        this.data = data;
    }

    int get(int i) {
        return i >= 0 && i < data.length ? data[i] : 2147483647;
    }
}
`,
  ),
  189: main(`    static int runsNeeded(int[] nums, int limit) {
        int runs = 1;
        int total = 0;
        for (int x : nums) {
            if (total + x > limit) {
                runs++;
                total = 0;
            }
            total += x;
        }
        return runs;
    }

    static int splitArray(int[] nums, int k) {
        int low = 0;
        int high = 0;
        for (int x : nums) {
            low = Math.max(low, x);
            high += x;
        }
        while (low < high) {
            int mid = (low + high) / 2;
            if (runsNeeded(nums, mid) <= k) high = mid;
            else low = mid + 1;
        }
        return low;
    }
`),
  190: main(`    static double medianSorted(int[] a, int[] b) {
        if (a.length > b.length) {
            int[] t = a;
            a = b;
            b = t;
        }
        int m = a.length;
        int n = b.length;
        int half = (m + n + 1) / 2;
        int low = 0;
        int high = m;
        while (low <= high) {
            int i = (low + high) / 2;
            int j = half - i;
            int aLeft = i > 0 ? a[i - 1] : Integer.MIN_VALUE;
            int aRight = i < m ? a[i] : Integer.MAX_VALUE;
            int bLeft = j > 0 ? b[j - 1] : Integer.MIN_VALUE;
            int bRight = j < n ? b[j] : Integer.MAX_VALUE;
            if (aLeft <= bRight && bLeft <= aRight) {
                if ((m + n) % 2 == 1) return Math.max(aLeft, bLeft);
                return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2.0;
            }
            if (aLeft > bRight) high = i - 1;
            else low = i + 1;
        }
        return 0;
    }
`),
};
