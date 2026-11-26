// Java reference solutions for Practice: Sorting, greedy & intervals. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const COPY = `    static int[] copy(int[] a) {
        int[] out = new int[a.length];
        for (int i = 0; i < a.length; i++) out[i] = a[i];
        return out;
    }
`;
/** Keep the first count rows of a table. */
const TRIM = `    static int[][] firstRows(int[][] rows, int count) {
        int[][] out = new int[count][];
        for (int i = 0; i < count; i++) out[i] = rows[i];
        return out;
    }
`;

export const SOLUTIONS: Record<number, string> = {
  306: main(`${COPY}
    static int[] bubbleSort(int[] nums) {
        int[] a = copy(nums);
        for (int end = a.length - 1; end > 0; end--) {
            for (int j = 0; j < end; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                }
            }
        }
        return a;
    }

    static int[] selectionSort(int[] nums) {
        int[] a = copy(nums);
        for (int i = 0; i < a.length; i++) {
            int smallest = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[smallest]) smallest = j;
            }
            int t = a[i];
            a[i] = a[smallest];
            a[smallest] = t;
        }
        return a;
    }

    static int[] insertionSort(int[] nums) {
        int[] a = copy(nums);
        for (int i = 1; i < a.length; i++) {
            int x = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > x) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = x;
        }
        return a;
    }
`),
  307: main(`    static int[] sortByCounting(int[] nums) {
        int[] counts = new int[3];
        for (int x : nums) counts[x]++;
        int[] out = new int[nums.length];
        int w = 0;
        for (int v = 0; v < 3; v++) {
            for (int k = 0; k < counts[v]; k++) {
                out[w] = v;
                w++;
            }
        }
        return out;
    }
`),
  308: main(`    static boolean canAttendAll(int[][] meetings) {
        Arrays.sort(meetings, (a, b) -> a[0] - b[0]);
        for (int i = 1; i < meetings.length; i++) {
            if (meetings[i][0] < meetings[i - 1][1]) return false;
        }
        return true;
    }
`),
  309: main(`    static int contentChildren(int[] greed, int[] cookies) {
        Arrays.sort(greed);
        Arrays.sort(cookies);
        int child = 0;
        for (int size : cookies) {
            if (child < greed.length && size >= greed[child]) child++;
        }
        return child;
    }
`),
  310: main(`    static int[] mergeSort(int[] nums) {
        if (nums.length <= 1) {
            int[] same = new int[nums.length];
            for (int i = 0; i < nums.length; i++) same[i] = nums[i];
            return same;
        }
        int mid = nums.length / 2;
        int[] left = new int[mid];
        int[] right = new int[nums.length - mid];
        for (int i = 0; i < mid; i++) left[i] = nums[i];
        for (int i = mid; i < nums.length; i++) right[i - mid] = nums[i];
        int[] a = mergeSort(left);
        int[] b = mergeSort(right);
        int[] out = new int[nums.length];
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
  311: main(`${COPY}
    static void quick(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[(lo + hi) / 2];
        int i = lo;
        int j = hi;
        while (i <= j) {
            while (a[i] < pivot) i++;
            while (a[j] > pivot) j--;
            if (i <= j) {
                int t = a[i];
                a[i] = a[j];
                a[j] = t;
                i++;
                j--;
            }
        }
        quick(a, lo, j);
        quick(a, i, hi);
    }

    static int[] quickSort(int[] nums) {
        int[] a = copy(nums);
        quick(a, 0, a.length - 1);
        return a;
    }
`),
  312: main(`    static int kthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
`),
  313: main(`${TRIM}
    static int[][] mergeIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        int[][] out = new int[intervals.length][];
        int count = 0;
        for (int[] iv : intervals) {
            if (count > 0 && iv[0] <= out[count - 1][1]) {
                out[count - 1][1] = Math.max(out[count - 1][1], iv[1]);
            } else {
                out[count] = new int[] {iv[0], iv[1]};
                count++;
            }
        }
        return firstRows(out, count);
    }
`),
  314: main(`${TRIM}
    static int[][] insertInterval(int[][] intervals, int[] interval) {
        int[][] out = new int[intervals.length + 1][];
        int count = 0;
        int start = interval[0];
        int end = interval[1];
        int i = 0;
        while (i < intervals.length && intervals[i][1] < start) {
            out[count] = intervals[i];
            count++;
            i++;
        }
        while (i < intervals.length && intervals[i][0] <= end) {
            start = Math.min(start, intervals[i][0]);
            end = Math.max(end, intervals[i][1]);
            i++;
        }
        out[count] = new int[] {start, end};
        count++;
        while (i < intervals.length) {
            out[count] = intervals[i];
            count++;
            i++;
        }
        return firstRows(out, count);
    }
`),
  315: main(`    static int eraseOverlap(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
        int removed = 0;
        int lastEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= lastEnd) lastEnd = iv[1];
            else removed++;
        }
        return removed;
    }
`),
  316: main(`    static int minMeetingRooms(int[][] meetings) {
        int n = meetings.length;
        int[] starts = new int[n];
        int[] ends = new int[n];
        for (int i = 0; i < n; i++) {
            starts[i] = meetings[i][0];
            ends[i] = meetings[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int rooms = 0;
        int best = 0;
        int j = 0;
        for (int s : starts) {
            while (j < n && ends[j] <= s) {
                j++;
                rooms--;
            }
            rooms++;
            best = Math.max(best, rooms);
        }
        return best;
    }
`),
  317: main(`    static int minPlatforms(int[] arrivals, int[] departures) {
        Arrays.sort(arrivals);
        Arrays.sort(departures);
        int i = 0;
        int j = 0;
        int used = 0;
        int best = 0;
        while (i < arrivals.length) {
            if (arrivals[i] <= departures[j]) {
                used++;
                best = Math.max(best, used);
                i++;
            } else {
                used--;
                j++;
            }
        }
        return best;
    }
`),
  318: main(`    static int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0;
        for (int i = 0; i < gas.length; i++) total += gas[i] - cost[i];
        if (total < 0) return -1;
        int start = 0;
        int tank = 0;
        for (int i = 0; i < gas.length; i++) {
            tank += gas[i] - cost[i];
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return start;
    }
`),
  319: main(`    static int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char t : tasks) counts[t - 'A']++;
        int m = 0;
        for (int c : counts) m = Math.max(m, c);
        int k = 0;
        for (int c : counts) {
            if (c == m) k++;
        }
        return Math.max(tasks.length, (m - 1) * (n + 1) + k);
    }
`),
  320: main(`    static String largestNumber(int[] nums) {
        List<String> texts = new ArrayList<>();
        for (int x : nums) texts.add("" + x);
        texts.sort((a, b) -> (b + a).compareTo(a + b));
        String joined = String.join("", texts);
        return joined.startsWith("0") ? "0" : joined;
    }
`),
};
