// C reference solutions for Practice: sliding-window (the questions that fit C). Never shipped to students.
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
  131: file(`int maxSumK(int nums[], int n, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) window += nums[i];
    int best = window;
    for (int i = k; i < n; i++) {
        window += nums[i] - nums[i - k];
        if (window > best) best = window;
    }
    return best;
}
`),
  134: file(`bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int maxVowels(char s[], int k) {
    int n = strlen(s);
    int count = 0;
    for (int i = 0; i < k; i++) {
        if (isVowel(s[i])) count++;
    }
    int best = count;
    for (int i = k; i < n; i++) {
        if (isVowel(s[i])) count++;
        if (isVowel(s[i - k])) count--;
        if (count > best) best = count;
    }
    return best;
}
`),
  135: file(`int longestUniqueSubstring(char s[]) {
    int last[128];
    for (int i = 0; i < 128; i++) last[i] = -1;
    int left = 0;
    int best = 0;
    for (int right = 0; s[right] != '\\0'; right++) {
        char c = s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}
`),
  136: file(`int longestKDistinct(char s[], int k) {
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    int different = 0;
    int left = 0;
    int best = 0;
    for (int right = 0; s[right] != '\\0'; right++) {
        if (counts[s[right]] == 0) different++;
        counts[s[right]]++;
        while (different > k) {
            counts[s[left]]--;
            if (counts[s[left]] == 0) different--;
            left++;
        }
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}
`),
  137: file(`int characterReplacement(char s[], int k) {
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    int left = 0;
    int top = 0;
    int best = 0;
    for (int right = 0; s[right] != '\\0'; right++) {
        counts[s[right]]++;
        if (counts[s[right]] > top) top = counts[s[right]];
        while (right - left + 1 - top > k) {
            counts[s[left]]--;
            left++;
        }
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}
`),
  138: file(`int longestOnes(int nums[], int n, int k) {
    int left = 0;
    int zeros = 0;
    int best = 0;
    for (int right = 0; right < n; right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > k) {
            if (nums[left] == 0) zeros--;
            left++;
        }
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}
`),
  139: file(`int minSubarrayLen(int target, int nums[], int n) {
    int left = 0;
    int total = 0;
    int best = INT_MAX;
    for (int right = 0; right < n; right++) {
        total += nums[right];
        while (total >= target) {
            if (right - left + 1 < best) best = right - left + 1;
            total -= nums[left];
            left++;
        }
    }
    return best == INT_MAX ? 0 : best;
}
`),
  140: file(`int windowWith(int nums[], int n, int limit, bool longest) {
    if (limit < 0) return 0;
    int values[n + 1];
    int counts[n + 1];
    int size = 0;
    int left = 0;
    int total = 0;
    for (int right = 0; right < n; right++) {
        int at = -1;
        for (int i = 0; i < size; i++) {
            if (values[i] == nums[right]) at = i;
        }
        if (at == -1) {
            values[size] = nums[right];
            counts[size] = 0;
            at = size;
            size++;
        }
        counts[at]++;
        while (size > limit) {
            for (int i = 0; i < size; i++) {
                if (values[i] == nums[left]) {
                    counts[i]--;
                    if (counts[i] == 0) {
                        values[i] = values[size - 1];
                        counts[i] = counts[size - 1];
                        size--;
                    }
                    break;
                }
            }
            left++;
        }
        if (longest) {
            if (right - left + 1 > total) total = right - left + 1;
        } else {
            total += right - left + 1;
        }
    }
    return total;
}

int longestTwoValues(int nums[], int n) {
    return windowWith(nums, n, 2, true);
}
`),
  141: file(`bool sameCounts(int a[], int b[]) {
    for (int i = 0; i < 128; i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

int countMatches(char text[], char word[]) {
    int n = strlen(text);
    int m = strlen(word);
    if (m > n) return 0;
    int need[128];
    int have[128];
    for (int i = 0; i < 128; i++) {
        need[i] = 0;
        have[i] = 0;
    }
    for (int i = 0; i < m; i++) need[word[i]]++;
    int count = 0;
    for (int i = 0; i < n; i++) {
        have[text[i]]++;
        if (i >= m) have[text[i - m]]--;
        if (i >= m - 1 && sameCounts(need, have)) count++;
    }
    return count;
}

bool containsPermutation(char p[], char s[]) {
    return countMatches(s, p) > 0;
}
`),
  143: file(`int productsBelowK(int nums[], int n, int k) {
    if (k <= 1) return 0;
    long long product = 1;
    int left = 0;
    int count = 0;
    for (int right = 0; right < n; right++) {
        product *= nums[right];
        while (product >= k) {
            product /= nums[left];
            left++;
        }
        count += right - left + 1;
    }
    return count;
}
`),
  144: file(`int longestAfterDelete(int nums[], int n) {
    int left = 0;
    int zeros = 0;
    int best = 0;
    for (int right = 0; right < n; right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > 1) {
            if (nums[left] == 0) zeros--;
            left++;
        }
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best - 1;
}
`),
  145: file(`int maxCardPoints(int cards[], int n, int k) {
    int size = n - k;
    int total = 0;
    for (int i = 0; i < n; i++) total += cards[i];
    if (size == 0) return total;
    int window = 0;
    for (int i = 0; i < size; i++) window += cards[i];
    int smallest = window;
    for (int i = size; i < n; i++) {
        window += cards[i] - cards[i - size];
        if (window < smallest) smallest = window;
    }
    return total - smallest;
}
`),
  146: file(`int minSwapsGroupOnes(int data[], int n) {
    int m = 0;
    for (int i = 0; i < n; i++) m += data[i];
    if (m == 0) return 0;
    int window = 0;
    for (int i = 0; i < m; i++) window += data[i];
    int best = window;
    for (int i = m; i < n; i++) {
        window += data[i] - data[i - m];
        if (window > best) best = window;
    }
    return m - best;
}
`),
  147: file(`bool sameCounts(int a[], int b[]) {
    for (int i = 0; i < 128; i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

int countMatches(char text[], char word[]) {
    int n = strlen(text);
    int m = strlen(word);
    if (m > n) return 0;
    int need[128];
    int have[128];
    for (int i = 0; i < 128; i++) {
        need[i] = 0;
        have[i] = 0;
    }
    for (int i = 0; i < m; i++) need[word[i]]++;
    int count = 0;
    for (int i = 0; i < n; i++) {
        have[text[i]]++;
        if (i >= m) have[text[i - m]]--;
        if (i >= m - 1 && sameCounts(need, have)) count++;
    }
    return count;
}

int countAnagramWindows(char text[], char word[]) {
    return countMatches(text, word);
}
`),
  148: file(`int distinctAtMost(int nums[], int n, int limit) {
    if (limit < 0) return 0;
    int values[n + 1];
    int counts[n + 1];
    int size = 0;
    int left = 0;
    int total = 0;
    for (int right = 0; right < n; right++) {
        int at = -1;
        for (int i = 0; i < size; i++) {
            if (values[i] == nums[right]) at = i;
        }
        if (at == -1) {
            values[size] = nums[right];
            counts[size] = 0;
            at = size;
            size++;
        }
        counts[at]++;
        while (size > limit) {
            for (int i = 0; i < size; i++) {
                if (values[i] == nums[left]) {
                    counts[i]--;
                    if (counts[i] == 0) {
                        values[i] = values[size - 1];
                        counts[i] = counts[size - 1];
                        size--;
                    }
                    break;
                }
            }
            left++;
        }
        total += right - left + 1;
    }
    return total;
}

int exactlyKDistinct(int nums[], int n, int k) {
    return distinctAtMost(nums, n, k) - distinctAtMost(nums, n, k - 1);
}
`),
  150: file(`int longestIn(char s[], int from, int to, int k) {
    if (to - from < k) return 0;
    int counts[128];
    for (int i = 0; i < 128; i++) counts[i] = 0;
    for (int i = from; i < to; i++) counts[s[i]]++;
    for (int i = from; i < to; i++) {
        if (counts[s[i]] < k) {
            int a = longestIn(s, from, i, k);
            int b = longestIn(s, i + 1, to, k);
            return a > b ? a : b;
        }
    }
    return to - from;
}

int longestWithKRepeats(char s[], int k) {
    return longestIn(s, 0, strlen(s), k);
}
`),
};
