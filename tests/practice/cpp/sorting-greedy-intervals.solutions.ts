// C++ reference solutions for Practice: Sorting, greedy & intervals. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <queue>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  306: file(`vector<int> bubbleSort(vector<int> nums) {
    int n = nums.size();
    for (int pass = 0; pass < n; pass++) {
        for (int i = 0; i + 1 < n - pass; i++) {
            if (nums[i] > nums[i + 1]) {
                int t = nums[i];
                nums[i] = nums[i + 1];
                nums[i + 1] = t;
            }
        }
    }
    return nums;
}

vector<int> selectionSort(vector<int> nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        int small = i;
        for (int j = i + 1; j < n; j++) {
            if (nums[j] < nums[small]) small = j;
        }
        int t = nums[i];
        nums[i] = nums[small];
        nums[small] = t;
    }
    return nums;
}

vector<int> insertionSort(vector<int> nums) {
    for (int i = 1; i < nums.size(); i++) {
        int x = nums[i];
        int j = i - 1;
        while (j >= 0 && nums[j] > x) {
            nums[j + 1] = nums[j];
            j--;
        }
        nums[j + 1] = x;
    }
    return nums;
}
`),
  307: file(`vector<int> sortByCounting(vector<int>& nums) {
    vector<int> counts(3, 0);
    for (int x : nums) counts[x]++;
    vector<int> out;
    for (int v = 0; v < 3; v++) {
        for (int i = 0; i < counts[v]; i++) out.push_back(v);
    }
    return out;
}
`),
  308: file(`bool canAttendAll(vector<vector<int>> meetings) {
    sort(meetings.begin(), meetings.end());
    for (int i = 1; i < meetings.size(); i++) {
        if (meetings[i][0] < meetings[i - 1][1]) return false;
    }
    return true;
}
`),
  309: file(`int contentChildren(vector<int> greed, vector<int> cookies) {
    sort(greed.begin(), greed.end());
    sort(cookies.begin(), cookies.end());
    int child = 0;
    for (int c : cookies) {
        if (child < greed.size() && c >= greed[child]) child++;
    }
    return child;
}
`),
  310: file(`vector<int> mergeSort(vector<int> nums) {
    if (nums.size() <= 1) return nums;
    int mid = nums.size() / 2;
    vector<int> left;
    vector<int> right;
    for (int i = 0; i < nums.size(); i++) {
        if (i < mid) left.push_back(nums[i]);
        else right.push_back(nums[i]);
    }
    left = mergeSort(left);
    right = mergeSort(right);
    vector<int> out;
    int i = 0;
    int j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            out.push_back(left[i]);
            i++;
        } else {
            out.push_back(right[j]);
            j++;
        }
    }
    while (i < left.size()) {
        out.push_back(left[i]);
        i++;
    }
    while (j < right.size()) {
        out.push_back(right[j]);
        j++;
    }
    return out;
}
`),
  311: file(`void quick(vector<int>& a, int lo, int hi) {
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

vector<int> quickSort(vector<int> nums) {
    quick(nums, 0, nums.size() - 1);
    return nums;
}
`),
  312: file(`int kthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int x : nums) {
        heap.push(x);
        if (heap.size() > k) heap.pop();
    }
    return heap.top();
}
`),
  313: file(`vector<vector<int>> mergeIntervals(vector<vector<int>> intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> out;
    for (int i = 0; i < intervals.size(); i++) {
        vector<int> iv = intervals[i];
        if (!out.empty() && iv[0] <= out.back()[1]) out.back()[1] = max(out.back()[1], iv[1]);
        else out.push_back(iv);
    }
    return out;
}
`),
  314: file(`vector<vector<int>> insertInterval(vector<vector<int>> intervals, vector<int> interval) {
    vector<vector<int>> out;
    int i = 0;
    int n = intervals.size();
    while (i < n && intervals[i][1] < interval[0]) {
        out.push_back(intervals[i]);
        i++;
    }
    while (i < n && intervals[i][0] <= interval[1]) {
        interval[0] = min(interval[0], intervals[i][0]);
        interval[1] = max(interval[1], intervals[i][1]);
        i++;
    }
    out.push_back(interval);
    while (i < n) {
        out.push_back(intervals[i]);
        i++;
    }
    return out;
}
`),
  315: file(`int eraseOverlap(vector<vector<int>> intervals) {
    sort(intervals.begin(), intervals.end(), [](vector<int> a, vector<int> b) { return a[1] < b[1]; });
    int removed = 0;
    bool any = false;
    int end = 0;
    for (int i = 0; i < intervals.size(); i++) {
        if (any && intervals[i][0] < end) {
            removed++;
        } else {
            end = intervals[i][1];
            any = true;
        }
    }
    return removed;
}
`),
  316: file(`int minMeetingRooms(vector<vector<int>> meetings) {
    vector<int> starts;
    vector<int> ends;
    for (int i = 0; i < meetings.size(); i++) {
        starts.push_back(meetings[i][0]);
        ends.push_back(meetings[i][1]);
    }
    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());
    int rooms = 0;
    int best = 0;
    int j = 0;
    for (int i = 0; i < starts.size(); i++) {
        while (j < ends.size() && ends[j] <= starts[i]) {
            j++;
            rooms--;
        }
        rooms++;
        best = max(best, rooms);
    }
    return best;
}
`),
  317: file(`int minPlatforms(vector<int> arrivals, vector<int> departures) {
    sort(arrivals.begin(), arrivals.end());
    sort(departures.begin(), departures.end());
    int platforms = 0;
    int best = 0;
    int j = 0;
    for (int i = 0; i < arrivals.size(); i++) {
        while (j < departures.size() && departures[j] < arrivals[i]) {
            j++;
            platforms--;
        }
        platforms++;
        best = max(best, platforms);
    }
    return best;
}
`),
  318: file(`int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int total = 0;
    int tank = 0;
    int start = 0;
    for (int i = 0; i < gas.size(); i++) {
        int d = gas[i] - cost[i];
        total += d;
        tank += d;
        if (tank < 0) {
            start = i + 1;
            tank = 0;
        }
    }
    return total < 0 ? -1 : start;
}
`),
  319: file(`int leastInterval(vector<char>& tasks, int n) {
    vector<int> counts(26, 0);
    for (char t : tasks) counts[t - 'A']++;
    int m = 0;
    for (int c : counts) m = max(m, c);
    int k = 0;
    for (int c : counts) {
        if (c == m) k++;
    }
    int frame = (m - 1) * (n + 1) + k;
    return max(frame, (int) tasks.size());
}
`),
  320: file(`string largestNumber(vector<int>& nums) {
    vector<string> parts;
    for (int x : nums) parts.push_back(to_string(x));
    sort(parts.begin(), parts.end(), [](string a, string b) { return a + b > b + a; });
    string out = "";
    for (string p : parts) out += p;
    if (!out.empty() && out[0] == '0') return "0";
    return out;
}
`),
};
