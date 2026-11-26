// Java reference solutions for Practice: Arrays & matrices. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const FLIP = `    static void flip(int[] a, int i, int j) {
        while (i < j) {
            int t = a[i];
            a[i] = a[j];
            a[j] = t;
            i++;
            j--;
        }
    }
`;

export const SOLUTIONS: Record<number, string> = {
  56: main(`    static int[] findMinMax(int[] nums) {
        int smallest = nums[0];
        int largest = nums[0];
        for (int x : nums) {
            if (x < smallest) smallest = x;
            if (x > largest) largest = x;
        }
        return new int[] {smallest, largest};
    }
`),
  57: main(`    static Integer secondLargest(int[] nums) {
        Integer first = null;
        Integer second = null;
        for (int x : nums) {
            if (first == null || x > first) {
                second = first;
                first = x;
            } else if (x != first && (second == null || x > second)) {
                second = x;
            }
        }
        return second;
    }
`),
  58: main(`${FLIP}
    static void reverseInPlace(int[] nums) {
        flip(nums, 0, nums.length - 1);
    }
`),
  59: main(`    static boolean isSorted(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            if (nums[i - 1] > nums[i]) return false;
        }
        return true;
    }
`),
  60: main(`    static int removeDuplicatesSorted(int[] nums) {
        if (nums.length == 0) return 0;
        int k = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[k - 1]) {
                nums[k] = nums[i];
                k++;
            }
        }
        return k;
    }
`),
  61: main(`    static void moveZeros(int[] nums) {
        int w = 0;
        for (int x : nums) {
            if (x != 0) {
                nums[w] = x;
                w++;
            }
        }
        while (w < nums.length) {
            nums[w] = 0;
            w++;
        }
    }
`),
  62: main(`${FLIP}
    static void rotateRight(int[] nums, int k) {
        int n = nums.length;
        if (n == 0) return;
        k %= n;
        flip(nums, 0, n - 1);
        flip(nums, 0, k - 1);
        flip(nums, k, n - 1);
    }
`),
  63: main(`    static int missingNumber(int[] nums) {
        int n = nums.length;
        int total = n * (n + 1) / 2;
        for (int x : nums) total -= x;
        return total;
    }
`),
  64: main(`    static int singleNumber(int[] nums) {
        int x = 0;
        for (int v : nums) x ^= v;
        return x;
    }
`),
  65: main(`    static int findDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (seen.contains(x)) return x;
            seen.add(x);
        }
        return -1;
    }
`),
  66: main(`    static int[] mergeSorted(int[] a, int[] b) {
        int[] out = new int[a.length + b.length];
        int i = 0;
        int j = 0;
        int w = 0;
        while (i < a.length && j < b.length) {
            if (a[i] <= b[j]) {
                out[w] = a[i];
                i++;
            } else {
                out[w] = b[j];
                j++;
            }
            w++;
        }
        while (i < a.length) {
            out[w] = a[i];
            i++;
            w++;
        }
        while (j < b.length) {
            out[w] = b[j];
            j++;
            w++;
        }
        return out;
    }
`),
  67: main(`    static List<Integer> intersection(int[] a, int[] b) {
        Set<Integer> inA = new HashSet<>();
        for (int x : a) inA.add(x);
        Set<Integer> found = new LinkedHashSet<>();
        for (int x : b) {
            if (inA.contains(x)) found.add(x);
        }
        return new ArrayList<>(found);
    }
`),
  68: main(`    static List<Integer> union(int[] a, int[] b) {
        Set<Integer> all = new LinkedHashSet<>();
        for (int x : a) all.add(x);
        for (int x : b) all.add(x);
        return new ArrayList<>(all);
    }
`),
  69: main(`    static int[] plusOne(int[] digits) {
        int[] out = new int[digits.length];
        for (int i = 0; i < digits.length; i++) out[i] = digits[i];
        for (int i = out.length - 1; i >= 0; i--) {
            if (out[i] < 9) {
                out[i]++;
                return out;
            }
            out[i] = 0;
        }
        int[] bigger = new int[out.length + 1];
        bigger[0] = 1;
        return bigger;
    }
`),
  70: main(`    static int majorityElement(int[] nums) {
        int candidate = 0;
        int count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += x == candidate ? 1 : -1;
        }
        return candidate;
    }
`),
  71: main(`    static int maxProfit(int[] prices) {
        int cheapest = Integer.MAX_VALUE;
        int best = 0;
        for (int p : prices) {
            cheapest = Math.min(cheapest, p);
            best = Math.max(best, p - cheapest);
        }
        return best;
    }
`),
  72: main(`    static int maxProfitMany(int[] prices) {
        int total = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
        }
        return total;
    }
`),
  73: main(`    static int maxSubarray(int[] nums) {
        int current = nums[0];
        int best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            best = Math.max(best, current);
        }
        return best;
    }
`),
  74: main(`    static int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) {
            out[i] = left;
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= right;
            right *= nums[i];
        }
        return out;
    }
`),
  75: main(`    static List<Integer> majorityThird(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);
        List<Integer> out = new ArrayList<>();
        for (int x : counts.keySet()) {
            if (counts.get(x) > nums.length / 3) out.add(x);
        }
        return out;
    }
`),
  76: main(`    static List<List<Integer>> pascal(int n) {
        List<List<Integer>> rows = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            List<Integer> row = new ArrayList<>();
            row.add(1);
            for (int j = 1; j < r; j++) row.add(rows.get(r - 1).get(j - 1) + rows.get(r - 1).get(j));
            if (r > 0) row.add(1);
            rows.add(row);
        }
        return rows;
    }
`),
  77: main(`    static int[][] transpose(int[][] matrix) {
        int rows = matrix.length;
        int cols = matrix[0].length;
        int[][] out = new int[cols][rows];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) out[c][r] = matrix[r][c];
        }
        return out;
    }
`),
  78: main(`    static void rotateMatrix(int[][] matrix) {
        int n = matrix.length;
        for (int r = 0; r < n; r++) {
            for (int c = r + 1; c < n; c++) {
                int t = matrix[r][c];
                matrix[r][c] = matrix[c][r];
                matrix[c][r] = t;
            }
        }
        for (int[] row : matrix) {
            for (int i = 0, j = n - 1; i < j; i++, j--) {
                int t = row[i];
                row[i] = row[j];
                row[j] = t;
            }
        }
    }
`),
  79: main(`    static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> out = new ArrayList<>();
        if (matrix.length == 0) return out;
        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) out.add(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) out.add(matrix[r][right]);
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) out.add(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) out.add(matrix[r][left]);
                left++;
            }
        }
        return out;
    }
`),
  80: main(`    static void setZeroes(int[][] matrix) {
        boolean[] rows = new boolean[matrix.length];
        boolean[] cols = new boolean[matrix[0].length];
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[0].length; c++) {
                if (matrix[r][c] == 0) {
                    rows[r] = true;
                    cols[c] = true;
                }
            }
        }
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[0].length; c++) {
                if (rows[r] || cols[c]) matrix[r][c] = 0;
            }
        }
    }
`),
  81: main(`    static List<Integer> leaders(int[] nums) {
        List<Integer> out = new ArrayList<>();
        int biggest = Integer.MIN_VALUE;
        for (int i = nums.length - 1; i >= 0; i--) {
            if (nums[i] > biggest) {
                out.add(0, nums[i]);
                biggest = nums[i];
            }
        }
        return out;
    }
`),
  82: main(`    static int pivotIndex(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        int left = 0;
        for (int i = 0; i < nums.length; i++) {
            if (left == total - left - nums[i]) return i;
            left += nums[i];
        }
        return -1;
    }
`),
  83: main(`${FLIP}
    static void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = nums.length - 1;
            while (nums[j] <= nums[i]) j--;
            int t = nums[i];
            nums[i] = nums[j];
            nums[j] = t;
        }
        flip(nums, i + 1, nums.length - 1);
    }
`),
  84: main(`    static int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;
            int length = 1;
            while (set.contains(x + length)) length++;
            best = Math.max(best, length);
        }
        return best;
    }
`),
  85: main(`    static int trap(int[] height) {
        int n = height.length;
        int[] left = new int[n];
        int[] right = new int[n];
        for (int i = 0; i < n; i++) left[i] = Math.max(height[i], i > 0 ? left[i - 1] : 0);
        for (int i = n - 1; i >= 0; i--) right[i] = Math.max(height[i], i + 1 < n ? right[i + 1] : 0);
        int water = 0;
        for (int i = 0; i < n; i++) water += Math.min(left[i], right[i]) - height[i];
        return water;
    }
`),
};
