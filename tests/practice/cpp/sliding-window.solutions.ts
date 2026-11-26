// C++ reference solutions for Practice: Sliding window. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <climits>
using namespace std;

${functions}
int main() {
    return 0;
}
`;
const MATCHES = `vector<int> matches(string text, string word) {
    vector<int> out;
    int m = word.size();
    if (m > text.size()) return out;
    vector<int> need(128, 0);
    vector<int> have(128, 0);
    for (char c : word) need[c]++;
    for (int i = 0; i < text.size(); i++) {
        have[text[i]]++;
        if (i >= m) have[text[i - m]]--;
        if (i >= m - 1 && need == have) out.push_back(i - m + 1);
    }
    return out;
}
`;
const AT_MOST = `int atMost(vector<int>& nums, int limit) {
    if (limit < 0) return 0;
    map<int, int> counts;
    int left = 0;
    int total = 0;
    for (int right = 0; right < nums.size(); right++) {
        counts[nums[right]]++;
        while (counts.size() > limit) {
            counts[nums[left]]--;
            if (counts[nums[left]] == 0) counts.erase(nums[left]);
            left++;
        }
        total += right - left + 1;
    }
    return total;
}
`;

export const SOLUTIONS: Record<number, string> = {
  131: file(`int maxSumK(vector<int>& nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) window += nums[i];
    int best = window;
    for (int i = k; i < nums.size(); i++) {
        window += nums[i] - nums[i - k];
        best = max(best, window);
    }
    return best;
}
`),
  132: file(`vector<double> windowAverages(vector<int>& nums, int k) {
    vector<double> out;
    int total = 0;
    for (int i = 0; i < nums.size(); i++) {
        total += nums[i];
        if (i >= k) total -= nums[i - k];
        if (i >= k - 1) out.push_back((double) total / k);
    }
    return out;
}
`),
  133: file(`vector<int> firstNegatives(vector<int>& nums, int k) {
    vector<int> negs;
    int head = 0;
    vector<int> out;
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] < 0) negs.push_back(i);
        if (head < negs.size() && negs[head] <= i - k) head++;
        if (i >= k - 1) out.push_back(head < negs.size() ? nums[negs[head]] : 0);
    }
    return out;
}
`),
  134: file(`bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int maxVowels(string s, int k) {
    int count = 0;
    for (int i = 0; i < k; i++) {
        if (isVowel(s[i])) count++;
    }
    int best = count;
    for (int i = k; i < s.size(); i++) {
        if (isVowel(s[i])) count++;
        if (isVowel(s[i - k])) count--;
        best = max(best, count);
    }
    return best;
}
`),
  135: file(`int longestUniqueSubstring(string s) {
    vector<int> last(128, -1);
    int left = 0;
    int best = 0;
    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        best = max(best, right - left + 1);
    }
    return best;
}
`),
  136: file(`int longestKDistinct(string s, int k) {
    map<char, int> counts;
    int left = 0;
    int best = 0;
    for (int right = 0; right < s.size(); right++) {
        counts[s[right]]++;
        while (counts.size() > k) {
            counts[s[left]]--;
            if (counts[s[left]] == 0) counts.erase(s[left]);
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}
`),
  137: file(`int characterReplacement(string s, int k) {
    vector<int> counts(128, 0);
    int left = 0;
    int top = 0;
    int best = 0;
    for (int right = 0; right < s.size(); right++) {
        counts[s[right]]++;
        top = max(top, counts[s[right]]);
        while (right - left + 1 - top > k) {
            counts[s[left]]--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}
`),
  138: file(`int longestOnes(vector<int>& nums, int k) {
    int left = 0;
    int zeros = 0;
    int best = 0;
    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > k) {
            if (nums[left] == 0) zeros--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}
`),
  139: file(`int minSubarrayLen(int target, vector<int>& nums) {
    int left = 0;
    int total = 0;
    int best = INT_MAX;
    for (int right = 0; right < nums.size(); right++) {
        total += nums[right];
        while (total >= target) {
            best = min(best, right - left + 1);
            total -= nums[left];
            left++;
        }
    }
    return best == INT_MAX ? 0 : best;
}
`),
  140: file(`int longestTwoValues(vector<int>& nums) {
    map<int, int> counts;
    int left = 0;
    int best = 0;
    for (int right = 0; right < nums.size(); right++) {
        counts[nums[right]]++;
        while (counts.size() > 2) {
            counts[nums[left]]--;
            if (counts[nums[left]] == 0) counts.erase(nums[left]);
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}
`),
  141: file(`${MATCHES}
bool containsPermutation(string p, string s) {
    return !matches(s, p).empty();
}
`),
  142: file(`${MATCHES}
vector<int> findAnagrams(string text, string pattern) {
    return matches(text, pattern);
}
`),
  143: file(`int productsBelowK(vector<int>& nums, int k) {
    if (k <= 1) return 0;
    long long product = 1;
    int left = 0;
    int count = 0;
    for (int right = 0; right < nums.size(); right++) {
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
  144: file(`int longestAfterDelete(vector<int>& nums) {
    int left = 0;
    int zeros = 0;
    int best = 0;
    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > 1) {
            if (nums[left] == 0) zeros--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best - 1;
}
`),
  145: file(`int maxCardPoints(vector<int>& cards, int k) {
    int n = cards.size();
    int size = n - k;
    int total = 0;
    for (int x : cards) total += x;
    if (size == 0) return total;
    int window = 0;
    for (int i = 0; i < size; i++) window += cards[i];
    int smallest = window;
    for (int i = size; i < n; i++) {
        window += cards[i] - cards[i - size];
        smallest = min(smallest, window);
    }
    return total - smallest;
}
`),
  146: file(`int minSwapsGroupOnes(vector<int>& data) {
    int m = 0;
    for (int x : data) m += x;
    if (m == 0) return 0;
    int window = 0;
    for (int i = 0; i < m; i++) window += data[i];
    int best = window;
    for (int i = m; i < data.size(); i++) {
        window += data[i] - data[i - m];
        best = max(best, window);
    }
    return m - best;
}
`),
  147: file(`${MATCHES}
int countAnagramWindows(string text, string word) {
    return matches(text, word).size();
}
`),
  148: file(`${AT_MOST}
int exactlyKDistinct(vector<int>& nums, int k) {
    return atMost(nums, k) - atMost(nums, k - 1);
}
`),
  149: file(`vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    vector<int> window;
    int front = 0;
    vector<int> out;
    for (int i = 0; i < nums.size(); i++) {
        while (window.size() > front && nums[window.back()] <= nums[i]) window.pop_back();
        window.push_back(i);
        if (window[front] <= i - k) front++;
        if (i >= k - 1) out.push_back(nums[window[front]]);
    }
    return out;
}
`),
  150: file(`int longestWithKRepeats(string s, int k) {
    if (s.size() < k) return 0;
    vector<int> counts(128, 0);
    for (char c : s) counts[c]++;
    for (int i = 0; i < s.size(); i++) {
        if (counts[s[i]] < k) return max(longestWithKRepeats(s.substr(0, i), k), longestWithKRepeats(s.substr(i + 1), k));
    }
    return s.size();
}
`),
};
