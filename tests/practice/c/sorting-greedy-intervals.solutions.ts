// C reference solutions for Practice: sorting-greedy-intervals (the questions that fit C). Never shipped to students.
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
  309: file(`void insertionSort(int a[], int n) {
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

int contentChildren(int greed[], int greedSize, int cookies[], int cookiesSize) {
    insertionSort(greed, greedSize);
    insertionSort(cookies, cookiesSize);
    int child = 0;
    for (int i = 0; i < cookiesSize; i++) {
        if (child < greedSize && cookies[i] >= greed[child]) child++;
    }
    return child;
}
`),
  312: file(`void insertionSort(int a[], int n) {
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

int kthLargest(int nums[], int n, int k) {
    int a[n];
    for (int i = 0; i < n; i++) a[i] = nums[i];
    insertionSort(a, n);
    return a[n - k];
}
`),
  317: file(`void insertionSort(int a[], int n) {
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

int minPlatforms(int arrivals[], int arrivalsSize, int departures[], int departuresSize) {
    insertionSort(arrivals, arrivalsSize);
    insertionSort(departures, departuresSize);
    int platforms = 0;
    int best = 0;
    int j = 0;
    for (int i = 0; i < arrivalsSize; i++) {
        while (j < departuresSize && departures[j] < arrivals[i]) {
            j++;
            platforms--;
        }
        platforms++;
        if (platforms > best) best = platforms;
    }
    return best;
}
`),
  318: file(`int canCompleteCircuit(int gas[], int gasSize, int cost[], int costSize) {
    int total = 0;
    int tank = 0;
    int start = 0;
    for (int i = 0; i < gasSize; i++) {
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
  319: file(`int leastInterval(char tasks[], int count, int n) {
    int counts[26];
    for (int i = 0; i < 26; i++) counts[i] = 0;
    for (int i = 0; i < count; i++) counts[tasks[i] - 'A']++;
    int m = 0;
    for (int i = 0; i < 26; i++) {
        if (counts[i] > m) m = counts[i];
    }
    int k = 0;
    for (int i = 0; i < 26; i++) {
        if (counts[i] == m) k++;
    }
    int frame = (m - 1) * (n + 1) + k;
    return frame > count ? frame : count;
}
`),
};
