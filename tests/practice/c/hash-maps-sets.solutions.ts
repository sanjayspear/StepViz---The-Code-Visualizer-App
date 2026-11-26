// C reference solutions for Practice: hash-maps-sets (the questions that fit C). Never shipped to students.
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
  87: file(`bool containsDuplicate(int nums[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}
`),
  89: file(`int mostFrequent(int nums[], int n) {
    int best = 0;
    int bestCount = 0;
    for (int i = 0; i < n; i++) {
        int count = 0;
        for (int j = 0; j < n; j++) {
            if (nums[j] == nums[i]) count++;
        }
        if (count > bestCount || (count == bestCount && nums[i] < best)) {
            best = nums[i];
            bestCount = count;
        }
    }
    return best;
}
`),
  91: file(`int countIn(int a[], int n, int x) {
    int c = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] == x) c++;
    }
    return c;
}

bool sameElements(int a[], int aSize, int b[], int bSize) {
    if (aSize != bSize) return false;
    for (int i = 0; i < aSize; i++) {
        if (countIn(a, aSize, a[i]) != countIn(b, bSize, a[i])) return false;
    }
    return true;
}
`),
  93: file(`bool isIsomorphic(char s[], char t[]) {
    if (strlen(s) != strlen(t)) return false;
    char st[128];
    char ts[128];
    for (int i = 0; i < 128; i++) {
        st[i] = 0;
        ts[i] = 0;
    }
    for (int i = 0; s[i] != '\\0'; i++) {
        char a = s[i];
        char b = t[i];
        if (st[a] != 0 && st[a] != b) return false;
        if (ts[b] != 0 && ts[b] != a) return false;
        st[a] = b;
        ts[b] = a;
    }
    return true;
}
`),
  94: file(`bool wordPattern(char pattern[], char s[]) {
    char words[50][20];
    int count = 0;
    int len = 0;
    for (int i = 0; ; i++) {
        if (s[i] == ' ' || s[i] == '\\0') {
            words[count][len] = '\\0';
            count++;
            len = 0;
            if (s[i] == '\\0') break;
        } else {
            words[count][len] = s[i];
            len++;
        }
    }
    int n = strlen(pattern);
    if (count != n) return false;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            bool sameLetter = pattern[i] == pattern[j];
            bool sameWord = strcmp(words[i], words[j]) == 0;
            if (sameLetter != sameWord) return false;
        }
    }
    return true;
}
`),
  95: file(`bool canConstruct(char note[], char magazine[]) {
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    for (int i = 0; magazine[i] != '\\0'; i++) counts[magazine[i]]++;
    for (int i = 0; note[i] != '\\0'; i++) {
        if (counts[note[i]] == 0) return false;
        counts[note[i]]--;
    }
    return true;
}
`),
  96: file(`int nextHappy(int n) {
    int total = 0;
    while (n > 0) {
        int d = n % 10;
        total += d * d;
        n /= 10;
    }
    return total;
}

bool isHappy(int n) {
    int slow = n;
    int fast = nextHappy(n);
    while (fast != 1 && slow != fast) {
        slow = nextHappy(slow);
        fast = nextHappy(nextHappy(fast));
    }
    return fast == 1;
}
`),
  97: file(`bool nearbyDuplicate(int nums[], int n, int k) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n && j <= i + k; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}
`),
  100: file(`int subarraySumCount(int nums[], int n, int k) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        int total = 0;
        for (int j = i; j < n; j++) {
            total += nums[j];
            if (total == k) count++;
        }
    }
    return count;
}
`),
  101: file(`int longestZeroSum(int nums[], int n) {
    int best = 0;
    for (int i = 0; i < n; i++) {
        int total = 0;
        for (int j = i; j < n; j++) {
            total += nums[j];
            if (total == 0 && j - i + 1 > best) best = j - i + 1;
        }
    }
    return best;
}
`),
  102: file(`int longestEqual01(int nums[], int n) {
    int best = 0;
    for (int i = 0; i < n; i++) {
        int total = 0;
        for (int j = i; j < n; j++) {
            total += nums[j] == 1 ? 1 : -1;
            if (total == 0 && j - i + 1 > best) best = j - i + 1;
        }
    }
    return best;
}
`),
  103: file(`int pairsWithDifference(int nums[], int n, int k) {
    int a[n + 1];
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
    int pairs = 0;
    for (int i = 0; i < n; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;
        if (k == 0) {
            if (i + 1 < n && a[i + 1] == a[i]) pairs++;
        } else {
            for (int j = i + 1; j < n; j++) {
                if (a[j] == a[i] + k) {
                    pairs++;
                    break;
                }
            }
        }
    }
    return pairs;
}
`),
  104: file(`int pairsDivisibleByK(int nums[], int n, int k) {
    int seen[k];
    for (int i = 0; i < k; i++) seen[i] = 0;
    int count = 0;
    for (int i = 0; i < n; i++) {
        int r = ((nums[i] % k) + k) % k;
        count += seen[(k - r) % k];
        seen[r]++;
    }
    return count;
}
`),
  106: file(`int fourSumCount(int a[], int aSize, int b[], int bSize, int c[], int cSize, int d[], int dSize) {
    int left[aSize * bSize + 1];
    int right[cSize * dSize + 1];
    int nl = 0;
    int nr = 0;
    for (int i = 0; i < aSize; i++) {
        for (int j = 0; j < bSize; j++) {
            left[nl] = a[i] + b[j];
            nl++;
        }
    }
    for (int i = 0; i < cSize; i++) {
        for (int j = 0; j < dSize; j++) {
            right[nr] = c[i] + d[j];
            nr++;
        }
    }
    int count = 0;
    for (int i = 0; i < nl; i++) {
        for (int j = 0; j < nr; j++) {
            if (left[i] + right[j] == 0) count++;
        }
    }
    return count;
}
`),
  110: file(`int firstMissingPositive(int nums[], int n) {
    for (int i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1;
            int t = nums[i];
            nums[i] = nums[j];
            nums[j] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}
`),
};
