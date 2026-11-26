// C reference solutions for Practice: arrays-matrices (the questions that fit C). Never shipped to students.
const file = (functions: string) => `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <ctype.h>

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  57: file(`int secondLargest(int nums[], int n) {
    bool hasFirst = false;
    bool hasSecond = false;
    int first = 0;
    int second = 0;
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        if (!hasFirst || x > first) {
            if (hasFirst) {
                second = first;
                hasSecond = true;
            }
            first = x;
            hasFirst = true;
        } else if (x != first && (!hasSecond || x > second)) {
            second = x;
            hasSecond = true;
        }
    }
    return hasSecond ? second : -1;
}
`),
  58: file(`void reverseInPlace(int nums[], int n) {
    int i = 0;
    int j = n - 1;
    while (i < j) {
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
        i++;
        j--;
    }
}
`),
  59: file(`bool isSorted(int nums[], int n) {
    for (int i = 1; i < n; i++) {
        if (nums[i - 1] > nums[i]) return false;
    }
    return true;
}
`),
  60: file(`int removeDuplicatesSorted(int nums[], int n) {
    if (n == 0) return 0;
    int k = 1;
    for (int i = 1; i < n; i++) {
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  61: file(`void moveZeros(int nums[], int n) {
    int w = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] != 0) {
            nums[w] = nums[i];
            w++;
        }
    }
    while (w < n) {
        nums[w] = 0;
        w++;
    }
}
`),
  62: file(`void reversePart(int nums[], int i, int j) {
    while (i < j) {
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
        i++;
        j--;
    }
}

void rotateRight(int nums[], int n, int k) {
    if (n == 0) return;
    k = k % n;
    reversePart(nums, 0, n - 1);
    reversePart(nums, 0, k - 1);
    reversePart(nums, k, n - 1);
}
`),
  63: file(`int missingNumber(int nums[], int n) {
    int total = n * (n + 1) / 2;
    for (int i = 0; i < n; i++) total -= nums[i];
    return total;
}
`),
  64: file(`int singleNumber(int nums[], int n) {
    int x = 0;
    for (int i = 0; i < n; i++) x ^= nums[i];
    return x;
}
`),
  65: file(`int findDuplicate(int nums[], int n) {
    bool seen[n + 1];
    for (int i = 0; i <= n; i++) seen[i] = false;
    for (int i = 0; i < n; i++) {
        if (seen[nums[i]]) return nums[i];
        seen[nums[i]] = true;
    }
    return -1;
}
`),
  70: file(`int majorityElement(int nums[], int n) {
    int candidate = 0;
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (count == 0) candidate = nums[i];
        count += nums[i] == candidate ? 1 : -1;
    }
    return candidate;
}
`),
  71: file(`int maxProfit(int prices[], int n) {
    int lowest = INT_MAX;
    int best = 0;
    for (int i = 0; i < n; i++) {
        if (prices[i] < lowest) lowest = prices[i];
        if (prices[i] - lowest > best) best = prices[i] - lowest;
    }
    return best;
}
`),
  72: file(`int maxProfitMany(int prices[], int n) {
    int total = 0;
    for (int i = 1; i < n; i++) {
        if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
    }
    return total;
}
`),
  73: file(`int maxSubarray(int nums[], int n) {
    int current = nums[0];
    int best = nums[0];
    for (int i = 1; i < n; i++) {
        current = current + nums[i] > nums[i] ? current + nums[i] : nums[i];
        if (current > best) best = current;
    }
    return best;
}
`),
  82: file(`int pivotIndex(int nums[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) total += nums[i];
    int left = 0;
    for (int i = 0; i < n; i++) {
        if (left == total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
}
`),
  83: file(`void nextPermutation(int nums[], int n) {
    int i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    int a = i + 1;
    int b = n - 1;
    while (a < b) {
        int t = nums[a];
        nums[a] = nums[b];
        nums[b] = t;
        a++;
        b--;
    }
}
`),
  84: file(`int longestConsecutive(int nums[], int n) {
    if (n == 0) return 0;
    int a[n];
    for (int i = 0; i < n; i++) a[i] = nums[i];
    for (int i = 1; i < n; i++) {
        int x = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = x;
    }
    int best = 1;
    int run = 1;
    for (int i = 1; i < n; i++) {
        if (a[i] == a[i - 1]) continue;
        if (a[i] == a[i - 1] + 1) run++;
        else run = 1;
        if (run > best) best = run;
    }
    return best;
}
`),
  85: file(`int trap(int height[], int n) {
    if (n == 0) return 0;
    int left[n];
    int right[n];
    left[0] = height[0];
    for (int i = 1; i < n; i++) left[i] = height[i] > left[i - 1] ? height[i] : left[i - 1];
    right[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = height[i] > right[i + 1] ? height[i] : right[i + 1];
    int water = 0;
    for (int i = 0; i < n; i++) water += (left[i] < right[i] ? left[i] : right[i]) - height[i];
    return water;
}
`),
};
