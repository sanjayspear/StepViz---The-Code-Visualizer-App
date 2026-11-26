// C++ reference solutions for Practice: Two pointers. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <climits>
using namespace std;

${functions}
int main() {
    return 0;
}
`;
const PAIR = (a: string, b: string) => `vector<int> out;
        out.push_back(${a});
        out.push_back(${b});
        return out;`;

export const SOLUTIONS: Record<number, string> = {
  111: file(`vector<int> twoSumSorted(vector<int>& nums, int target) {
    int i = 0;
    int j = nums.size() - 1;
    while (i < j) {
        int s = nums[i] + nums[j];
        if (s == target) {
        ${PAIR('i', 'j')}
        }
        if (s < target) i++;
        else j--;
    }
    vector<int> none;
    return none;
}
`),
  112: file(`bool vowel(char c) {
    string v = "aeiouAEIOU";
    return v.find(c) != string::npos;
}

string reverseVowels(string s) {
    int i = 0;
    int j = s.size() - 1;
    while (i < j) {
        if (!vowel(s[i])) i++;
        else if (!vowel(s[j])) j--;
        else {
            char t = s[i];
            s[i] = s[j];
            s[j] = t;
            i++;
            j--;
        }
    }
    return s;
}
`),
  113: file(`int removeElement(vector<int>& nums, int val) {
    int k = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] != val) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  114: file(`vector<int> sortedSquares(vector<int>& nums) {
    int n = nums.size();
    vector<int> out(n, 0);
    int i = 0;
    int j = n - 1;
    for (int w = n - 1; w >= 0; w--) {
        if (abs(nums[i]) > abs(nums[j])) {
            out[w] = nums[i] * nums[i];
            i++;
        } else {
            out[w] = nums[j] * nums[j];
            j--;
        }
    }
    return out;
}
`),
  115: file(`void mergeInto(vector<int>& a, int m, vector<int>& b, int n) {
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
  116: file(`void negativesFirst(vector<int>& nums) {
    int k = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] < 0) {
            int t = nums[i];
            nums[i] = nums[k];
            nums[k] = t;
            k++;
        }
    }
}
`),
  117: file(`string real(string text) {
    string out = "";
    for (char c : text) {
        if (c == '#') {
            if (!out.empty()) out.pop_back();
        } else {
            out.push_back(c);
        }
    }
    return out;
}

bool backspaceCompare(string s, string t) {
    return real(s) == real(t);
}
`),
  118: file(`bool isPal(string s, int i, int j) {
    while (i < j) {
        if (s[i] != s[j]) return false;
        i++;
        j--;
    }
    return true;
}

bool palindromeAfterOneDelete(string s) {
    int i = 0;
    int j = s.size() - 1;
    while (i < j) {
        if (s[i] != s[j]) return isPal(s, i + 1, j) || isPal(s, i, j - 1);
        i++;
        j--;
    }
    return true;
}
`),
  119: file(`bool hasPairWithDifference(vector<int>& nums, int k) {
    int i = 0;
    int j = 1;
    while (j < nums.size()) {
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
  120: file(`int maxArea(vector<int>& height) {
    int i = 0;
    int j = height.size() - 1;
    int best = 0;
    while (i < j) {
        best = max(best, (j - i) * min(height[i], height[j]));
        if (height[i] < height[j]) i++;
        else j--;
    }
    return best;
}
`),
  121: file(`vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    for (int i = 0; i < nums.size(); i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int lo = i + 1;
        int hi = nums.size() - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            if (s < 0) lo++;
            else if (s > 0) hi--;
            else {
                vector<int> t;
                t.push_back(nums[i]);
                t.push_back(nums[lo]);
                t.push_back(nums[hi]);
                out.push_back(t);
                while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                lo++;
                hi--;
            }
        }
    }
    return out;
}
`),
  122: file(`int threeSumClosest(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i + 2 < nums.size(); i++) {
        int lo = i + 1;
        int hi = nums.size() - 1;
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
  123: file(`vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    int n = nums.size();
    for (int a = 0; a < n; a++) {
        if (a > 0 && nums[a] == nums[a - 1]) continue;
        for (int b = a + 1; b < n; b++) {
            if (b > a + 1 && nums[b] == nums[b - 1]) continue;
            int lo = b + 1;
            int hi = n - 1;
            while (lo < hi) {
                int s = nums[a] + nums[b] + nums[lo] + nums[hi];
                if (s < target) lo++;
                else if (s > target) hi--;
                else {
                    vector<int> t;
                    t.push_back(nums[a]);
                    t.push_back(nums[b]);
                    t.push_back(nums[lo]);
                    t.push_back(nums[hi]);
                    out.push_back(t);
                    while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                    lo++;
                    hi--;
                }
            }
        }
    }
    return out;
}
`),
  124: file(`void sortColors(vector<int>& nums) {
    int low = 0;
    int mid = 0;
    int high = nums.size() - 1;
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
  125: file(`int removeExtraDuplicates(vector<int>& nums) {
    int k = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (k < 2 || nums[i] != nums[k - 2]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
`),
  126: file(`int countPairsBelow(vector<int>& nums, int target) {
    int i = 0;
    int j = nums.size() - 1;
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
  127: file(`int numBoats(vector<int>& people, int limit) {
    sort(people.begin(), people.end());
    int i = 0;
    int j = people.size() - 1;
    int boats = 0;
    while (i <= j) {
        if (people[i] + people[j] <= limit) i++;
        j--;
        boats++;
    }
    return boats;
}
`),
  128: file(`int shortestUnsorted(vector<int>& nums) {
    int n = nums.size();
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
  129: file(`int smallestDifference(vector<int>& a, vector<int>& b) {
    int i = 0;
    int j = 0;
    int best = INT_MAX;
    while (i < a.size() && j < b.size()) {
        best = min(best, abs(a[i] - b[j]));
        if (a[i] < b[j]) i++;
        else j++;
    }
    return best;
}
`),
  130: file(`int triangleCount(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int count = 0;
    for (int k = nums.size() - 1; k > 1; k--) {
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
