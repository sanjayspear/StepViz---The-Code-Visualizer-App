// C reference solutions for Practice: binary-search (the questions that fit C). Never shipped to students.
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
  171: file(`int binarySearch(int nums[], int n, int target) {
    int low = 0;
    int high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`),
  172: file(`int searchInsert(int nums[], int n, int target) {
    int low = 0;
    int high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}
`),
  173: file(`int lowerBound(int nums[], int n, int target) {
    int low = 0;
    int high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

int countOccurrences(int nums[], int n, int target) {
    return lowerBound(nums, n, target + 1) - lowerBound(nums, n, target);
}
`),
  174: file(`int floorSqrt(int n) {
    long long low = 0;
    long long high = n;
    long long best = 0;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (mid * mid <= n) {
            best = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return (int) best;
}
`),
  175: file(`bool isPerfectSquare(int n) {
    long long low = 1;
    long long high = n;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        long long sq = mid * mid;
        if (sq == n) return true;
        if (sq < n) low = mid + 1;
        else high = mid - 1;
    }
    return false;
}
`),
  178: file(`char nextLetter(char letters[], int n, char target) {
    int low = 0;
    int high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (letters[mid] <= target) low = mid + 1;
        else high = mid;
    }
    return low == n ? letters[0] : letters[low];
}
`),
  180: file(`int findPeak(int nums[], int n) {
    int low = 0;
    int high = n - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] < nums[mid + 1]) low = mid + 1;
        else high = mid;
    }
    return low;
}
`),
  181: file(`int searchRotated(int nums[], int n, int target) {
    int low = 0;
    int high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
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
  182: file(`int findMinRotated(int nums[], int n) {
    int low = 0;
    int high = n - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] > nums[high]) low = mid + 1;
        else high = mid;
    }
    return nums[low];
}
`),
  184: file(`int singleInSorted(int nums[], int n) {
    int low = 0;
    int high = n - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (mid % 2 == 1) mid--;
        if (nums[mid] == nums[mid + 1]) low = mid + 2;
        else high = mid;
    }
    return nums[low];
}
`),
  185: file(`int minEatingSpeed(int piles[], int n, int h) {
    int low = 1;
    int high = 1;
    for (int i = 0; i < n; i++) {
        if (piles[i] > high) high = piles[i];
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        long long hours = 0;
        for (int i = 0; i < n; i++) hours += (piles[i] + mid - 1) / mid;
        if (hours <= h) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  186: file(`int shipWithinDays(int weights[], int n, int days) {
    int low = 0;
    int high = 0;
    for (int i = 0; i < n; i++) {
        if (weights[i] > low) low = weights[i];
        high += weights[i];
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        int need = 1;
        int load = 0;
        for (int i = 0; i < n; i++) {
            if (load + weights[i] > mid) {
                need++;
                load = 0;
            }
            load += weights[i];
        }
        if (need <= days) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  189: file(`int splitArray(int nums[], int n, int k) {
    int low = 0;
    int high = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] > low) low = nums[i];
        high += nums[i];
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        int parts = 1;
        int total = 0;
        for (int i = 0; i < n; i++) {
            if (total + nums[i] > mid) {
                parts++;
                total = 0;
            }
            total += nums[i];
        }
        if (parts <= k) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  190: file(`int biggerOf(int a, int b) {
    return a > b ? a : b;
}

int smallerOf(int a, int b) {
    return a < b ? a : b;
}

double medianSorted(int a[], int aSize, int b[], int bSize) {
    if (aSize > bSize) return medianSorted(b, bSize, a, aSize);
    int m = aSize;
    int n = bSize;
    int low = 0;
    int high = m;
    while (low <= high) {
        int i = (low + high) / 2;
        int j = (m + n + 1) / 2 - i;
        int aLeft = i == 0 ? INT_MIN : a[i - 1];
        int aRight = i == m ? INT_MAX : a[i];
        int bLeft = j == 0 ? INT_MIN : b[j - 1];
        int bRight = j == n ? INT_MAX : b[j];
        if (aLeft <= bRight && bLeft <= aRight) {
            if ((m + n) % 2 == 1) return biggerOf(aLeft, bLeft);
            return (biggerOf(aLeft, bLeft) + smallerOf(aRight, bRight)) / 2.0;
        }
        if (aLeft > bRight) high = i - 1;
        else low = i + 1;
    }
    return 0;
}
`),
};
