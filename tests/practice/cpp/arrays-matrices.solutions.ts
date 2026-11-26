// C++ reference solutions for Practice: Arrays & matrices. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_set>
#include <climits>
using namespace std;

${functions}
int main() {
    return 0;
}
`;
const FLIP = `void flip(vector<int>& a, int i, int j) {
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
  56: file(`vector<int> findMinMax(vector<int>& nums) {
    int smallest = nums[0];
    int largest = nums[0];
    for (int x : nums) {
        if (x < smallest) smallest = x;
        if (x > largest) largest = x;
    }
    vector<int> out;
    out.push_back(smallest);
    out.push_back(largest);
    return out;
}
`),
  57: file(`int secondLargest(vector<int>& nums) {
    int first = -1;
    int second = -1;
    for (int x : nums) {
        if (x > first) {
            second = first;
            first = x;
        } else if (x != first && x > second) {
            second = x;
        }
    }
    return second;
}
`),
  58: file(`${FLIP}
void reverseInPlace(vector<int>& nums) {
    flip(nums, 0, nums.size() - 1);
}
`),
  59: file(`bool isSorted(vector<int>& nums) {
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i - 1] > nums[i]) return false;
    }
    return true;
}
`),
  60: file(`int removeDuplicatesSorted(vector<int>& nums) {
    if (nums.empty()) return 0;
    int k = 1;
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  61: file(`void moveZeros(vector<int>& nums) {
    int w = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] != 0) {
            nums[w] = nums[i];
            w++;
        }
    }
    while (w < nums.size()) {
        nums[w] = 0;
        w++;
    }
}
`),
  62: file(`${FLIP}
void rotateRight(vector<int>& nums, int k) {
    int n = nums.size();
    if (n == 0) return;
    k %= n;
    flip(nums, 0, n - 1);
    flip(nums, 0, k - 1);
    flip(nums, k, n - 1);
}
`),
  63: file(`int missingNumber(vector<int>& nums) {
    int n = nums.size();
    int total = n * (n + 1) / 2;
    for (int x : nums) total -= x;
    return total;
}
`),
  64: file(`int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}
`),
  65: file(`int findDuplicate(vector<int>& nums) {
    set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return x;
        seen.insert(x);
    }
    return -1;
}
`),
  66: file(`vector<int> mergeSorted(vector<int>& a, vector<int>& b) {
    vector<int> out;
    int i = 0;
    int j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) {
            out.push_back(a[i]);
            i++;
        } else {
            out.push_back(b[j]);
            j++;
        }
    }
    while (i < a.size()) {
        out.push_back(a[i]);
        i++;
    }
    while (j < b.size()) {
        out.push_back(b[j]);
        j++;
    }
    return out;
}
`),
  67: file(`vector<int> intersection(vector<int>& a, vector<int>& b) {
    set<int> inA;
    for (int x : a) inA.insert(x);
    set<int> added;
    vector<int> out;
    for (int x : b) {
        if (inA.count(x) && !added.count(x)) {
            added.insert(x);
            out.push_back(x);
        }
    }
    return out;
}
`),
  68: file(`vector<int> unionOf(vector<int>& a, vector<int>& b) {
    set<int> added;
    vector<int> out;
    for (int x : a) {
        if (!added.count(x)) {
            added.insert(x);
            out.push_back(x);
        }
    }
    for (int x : b) {
        if (!added.count(x)) {
            added.insert(x);
            out.push_back(x);
        }
    }
    return out;
}
`),
  69: file(`vector<int> plusOne(vector<int>& digits) {
    vector<int> out = digits;
    for (int i = out.size() - 1; i >= 0; i--) {
        if (out[i] < 9) {
            out[i]++;
            return out;
        }
        out[i] = 0;
    }
    out.insert(out.begin(), 1);
    return out;
}
`),
  70: file(`int majorityElement(vector<int>& nums) {
    int candidate = 0;
    int count = 0;
    for (int x : nums) {
        if (count == 0) candidate = x;
        count += x == candidate ? 1 : -1;
    }
    return candidate;
}
`),
  71: file(`int maxProfit(vector<int>& prices) {
    int cheapest = INT_MAX;
    int best = 0;
    for (int p : prices) {
        cheapest = min(cheapest, p);
        best = max(best, p - cheapest);
    }
    return best;
}
`),
  72: file(`int maxProfitMany(vector<int>& prices) {
    int total = 0;
    for (int i = 1; i < prices.size(); i++) {
        if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
    }
    return total;
}
`),
  73: file(`int maxSubarray(vector<int>& nums) {
    int current = nums[0];
    int best = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        current = max(nums[i], current + nums[i]);
        best = max(best, current);
    }
    return best;
}
`),
  74: file(`vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> out(n, 1);
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
  75: file(`vector<int> majorityThird(vector<int>& nums) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    vector<int> out;
    for (auto [x, c] : counts) {
        if (c > nums.size() / 3) out.push_back(x);
    }
    return out;
}
`),
  76: file(`vector<vector<int>> pascal(int n) {
    vector<vector<int>> rows;
    for (int r = 0; r < n; r++) {
        vector<int> row;
        row.push_back(1);
        for (int j = 1; j < r; j++) row.push_back(rows[r - 1][j - 1] + rows[r - 1][j]);
        if (r > 0) row.push_back(1);
        rows.push_back(row);
    }
    return rows;
}
`),
  77: file(`vector<vector<int>> transpose(vector<vector<int>>& matrix) {
    int rows = matrix.size();
    int cols = matrix[0].size();
    vector<vector<int>> out(cols, vector<int>(rows, 0));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) out[c][r] = matrix[r][c];
    }
    return out;
}
`),
  78: file(`void rotateMatrix(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int r = 0; r < n; r++) {
        for (int c = r + 1; c < n; c++) {
            int t = matrix[r][c];
            matrix[r][c] = matrix[c][r];
            matrix[c][r] = t;
        }
    }
    for (int r = 0; r < n; r++) {
        int i = 0;
        int j = n - 1;
        while (i < j) {
            int t = matrix[r][i];
            matrix[r][i] = matrix[r][j];
            matrix[r][j] = t;
            i++;
            j--;
        }
    }
}
`),
  79: file(`vector<int> spiralOrder(vector<vector<int>>& matrix) {
    vector<int> out;
    if (matrix.empty()) return out;
    int top = 0;
    int bottom = matrix.size() - 1;
    int left = 0;
    int right = matrix[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.push_back(matrix[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.push_back(matrix[r][right]);
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) out.push_back(matrix[bottom][c]);
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) out.push_back(matrix[r][left]);
            left++;
        }
    }
    return out;
}
`),
  80: file(`void setZeroes(vector<vector<int>>& matrix) {
    int rows = matrix.size();
    int cols = matrix[0].size();
    vector<int> zr(rows, 0);
    vector<int> zc(cols, 0);
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (matrix[r][c] == 0) {
                zr[r] = 1;
                zc[c] = 1;
            }
        }
    }
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (zr[r] == 1 || zc[c] == 1) matrix[r][c] = 0;
        }
    }
}
`),
  81: file(`vector<int> leaders(vector<int>& nums) {
    vector<int> out;
    int biggest = INT_MIN;
    for (int i = nums.size() - 1; i >= 0; i--) {
        if (nums[i] > biggest) {
            out.insert(out.begin(), nums[i]);
            biggest = nums[i];
        }
    }
    return out;
}
`),
  82: file(`int pivotIndex(vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    int left = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (left == total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
}
`),
  83: file(`${FLIP}
void nextPermutation(vector<int>& nums) {
    int i = nums.size() - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i >= 0) {
        int j = nums.size() - 1;
        while (nums[j] <= nums[i]) j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    flip(nums, i + 1, nums.size() - 1);
}
`),
  84: file(`int longestConsecutive(vector<int>& nums) {
    set<int> values;
    for (int x : nums) values.insert(x);
    int best = 0;
    for (int x : values) {
        if (values.count(x - 1)) continue;
        int length = 1;
        while (values.count(x + length)) length++;
        best = max(best, length);
    }
    return best;
}
`),
  85: file(`int trap(vector<int>& height) {
    int n = height.size();
    vector<int> left(n, 0);
    vector<int> right(n, 0);
    for (int i = 0; i < n; i++) left[i] = max(height[i], i > 0 ? left[i - 1] : 0);
    for (int i = n - 1; i >= 0; i--) right[i] = max(height[i], i + 1 < n ? right[i + 1] : 0);
    int water = 0;
    for (int i = 0; i < n; i++) water += min(left[i], right[i]) - height[i];
    return water;
}
`),
};
