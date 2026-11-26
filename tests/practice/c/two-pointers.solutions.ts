// C reference solutions for Practice: two-pointers (the questions that fit C). Never shipped to students.
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
  113: file(`int removeElement(int nums[], int n, int val) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] != val) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  115: file(`void mergeInto(int a[], int m, int b[], int n) {
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
  116: file(`void negativesFirst(int nums[], int n) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] < 0) {
            int t = nums[i];
            nums[i] = nums[k];
            nums[k] = t;
            k++;
        }
    }
}
`),
  117: file(`void real(char text[], char out[]) {
    int len = 0;
    for (int i = 0; text[i] != '\\0'; i++) {
        if (text[i] == '#') {
            if (len > 0) len--;
        } else {
            out[len] = text[i];
            len++;
        }
    }
    out[len] = '\\0';
}

bool backspaceCompare(char s[], char t[]) {
    char a[strlen(s) + 1];
    char b[strlen(t) + 1];
    real(s, a);
    real(t, b);
    return strcmp(a, b) == 0;
}
`),
  118: file(`bool isPal(char s[], int i, int j) {
    while (i < j) {
        if (s[i] != s[j]) return false;
        i++;
        j--;
    }
    return true;
}

bool palindromeAfterOneDelete(char s[]) {
    int i = 0;
    int j = strlen(s) - 1;
    while (i < j) {
        if (s[i] != s[j]) return isPal(s, i + 1, j) || isPal(s, i, j - 1);
        i++;
        j--;
    }
    return true;
}
`),
  119: file(`bool hasPairWithDifference(int nums[], int n, int k) {
    int i = 0;
    int j = 1;
    while (j < n) {
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
  120: file(`int maxArea(int height[], int n) {
    int i = 0;
    int j = n - 1;
    int best = 0;
    while (i < j) {
        int h = height[i] < height[j] ? height[i] : height[j];
        if ((j - i) * h > best) best = (j - i) * h;
        if (height[i] < height[j]) i++;
        else j--;
    }
    return best;
}
`),
  122: file(`void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int x = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = x;
    }
}

int threeSumClosest(int nums[], int n, int target) {
    insertionSort(nums, n);
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i + 2 < n; i++) {
        int lo = i + 1;
        int hi = n - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            if (abs(s - target) < abs(best - target)) best = s;
            if (s < target) lo++;
            else if (s > target) hi--;
            else return s;
        }
    }
    return best;
}
`),
  124: file(`void sortColors(int nums[], int n) {
    int low = 0;
    int mid = 0;
    int high = n - 1;
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
  125: file(`int removeExtraDuplicates(int nums[], int n) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (k < 2 || nums[i] != nums[k - 2]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  126: file(`int countPairsBelow(int nums[], int n, int target) {
    int i = 0;
    int j = n - 1;
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
  127: file(`void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int x = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = x;
    }
}

int numBoats(int people[], int n, int limit) {
    insertionSort(people, n);
    int i = 0;
    int j = n - 1;
    int boats = 0;
    while (i <= j) {
        if (people[i] + people[j] <= limit) i++;
        j--;
        boats++;
    }
    return boats;
}
`),
  128: file(`int shortestUnsorted(int nums[], int n) {
    int end = -1;
    int start = 0;
    int biggest = INT_MIN;
    for (int i = 0; i < n; i++) {
        if (nums[i] < biggest) end = i;
        else biggest = nums[i];
    }
    int smallest = INT_MAX;
    for (int i = n - 1; i >= 0; i--) {
        if (nums[i] > smallest) start = i;
        else smallest = nums[i];
    }
    return end == -1 ? 0 : end - start + 1;
}
`),
  129: file(`int smallestDifference(int a[], int aSize, int b[], int bSize) {
    int i = 0;
    int j = 0;
    int best = INT_MAX;
    while (i < aSize && j < bSize) {
        int d = abs(a[i] - b[j]);
        if (d < best) best = d;
        if (a[i] < b[j]) i++;
        else j++;
    }
    return best;
}
`),
  130: file(`void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int x = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = x;
    }
}

int triangleCount(int nums[], int n) {
    insertionSort(nums, n);
    int count = 0;
    for (int k = n - 1; k > 1; k--) {
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
