// C++ reference solutions for Practice: Hash maps & sets. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  86: file(`vector<int> twoSum(vector<int>& nums, int target) {
    map<int, int> seen;
    vector<int> out;
    for (int i = 0; i < nums.size(); i++) {
        if (seen.count(target - nums[i])) {
            out.push_back(seen[target - nums[i]]);
            out.push_back(i);
            return out;
        }
        seen[nums[i]] = i;
    }
    return out;
}
`),
  87: file(`bool containsDuplicate(vector<int>& nums) {
    set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}
`),
  88: file(`map<int, int> elementFrequency(vector<int>& nums) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    return counts;
}
`),
  89: file(`int mostFrequent(vector<int>& nums) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    int best = 0;
    int bestCount = 0;
    for (auto [x, c] : counts) {
        if (c > bestCount) {
            best = x;
            bestCount = c;
        }
    }
    return best;
}
`),
  90: file(`vector<int> appearOnce(vector<int>& nums) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    vector<int> out;
    for (int x : nums) {
        if (counts[x] == 1) out.push_back(x);
    }
    return out;
}
`),
  91: file(`bool sameElements(vector<int>& a, vector<int>& b) {
    if (a.size() != b.size()) return false;
    map<int, int> counts;
    for (int x : a) counts[x]++;
    for (int x : b) {
        if (counts[x] == 0) return false;
        counts[x]--;
    }
    return true;
}
`),
  92: file(`vector<int> commonInThree(vector<int>& a, vector<int>& b, vector<int>& c) {
    vector<int> out;
    int i = 0;
    int j = 0;
    int k = 0;
    while (i < a.size() && j < b.size() && k < c.size()) {
        if (a[i] == b[j] && b[j] == c[k]) {
            if (out.empty() || out.back() != a[i]) out.push_back(a[i]);
            i++;
            j++;
            k++;
        } else {
            int smallest = min(a[i], min(b[j], c[k]));
            if (a[i] == smallest) i++;
            else if (b[j] == smallest) j++;
            else k++;
        }
    }
    return out;
}
`),
  93: file(`bool isIsomorphic(string s, string t) {
    if (s.size() != t.size()) return false;
    map<char, char> st;
    map<char, char> ts;
    for (int i = 0; i < s.size(); i++) {
        char a = s[i];
        char b = t[i];
        if (st.count(a) && st[a] != b) return false;
        if (ts.count(b) && ts[b] != a) return false;
        st[a] = b;
        ts[b] = a;
    }
    return true;
}
`),
  94: file(`bool wordPattern(string pattern, string s) {
    vector<string> words;
    string word = "";
    for (char c : s) {
        if (c == ' ') {
            words.push_back(word);
            word = "";
        } else {
            word += c;
        }
    }
    words.push_back(word);
    if (words.size() != pattern.size()) return false;
    map<char, string> lw;
    map<string, char> wl;
    for (int i = 0; i < words.size(); i++) {
        char l = pattern[i];
        string w = words[i];
        if (lw.count(l) && lw[l] != w) return false;
        if (wl.count(w) && wl[w] != l) return false;
        lw[l] = w;
        wl[w] = l;
    }
    return true;
}
`),
  95: file(`bool canConstruct(string note, string magazine) {
    map<char, int> counts;
    for (char c : magazine) counts[c]++;
    for (char c : note) {
        if (counts[c] == 0) return false;
        counts[c]--;
    }
    return true;
}
`),
  96: file(`bool isHappy(int n) {
    set<int> seen;
    while (n != 1) {
        if (seen.count(n)) return false;
        seen.insert(n);
        int next = 0;
        while (n > 0) {
            int d = n % 10;
            next += d * d;
            n /= 10;
        }
        n = next;
    }
    return true;
}
`),
  97: file(`bool nearbyDuplicate(vector<int>& nums, int k) {
    map<int, int> last;
    for (int i = 0; i < nums.size(); i++) {
        if (last.count(nums[i]) && i - last[nums[i]] <= k) return true;
        last[nums[i]] = i;
    }
    return false;
}
`),
  98: file(`vector<int> topKFrequent(vector<int>& nums, int k) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    vector<int> out;
    for (int round = 0; round < k; round++) {
        int best = 0;
        int bestCount = 0;
        for (auto [x, c] : counts) {
            if (c > bestCount) {
                best = x;
                bestCount = c;
            }
        }
        out.push_back(best);
        counts.erase(best);
    }
    return out;
}
`),
  99: file(`string frequencySort(string s) {
    map<char, int> counts;
    for (char c : s) counts[c]++;
    string out = "";
    while (!counts.empty()) {
        char best = ' ';
        int bestCount = 0;
        for (auto [c, n] : counts) {
            if (n > bestCount) {
                best = c;
                bestCount = n;
            }
        }
        for (int i = 0; i < bestCount; i++) out += best;
        counts.erase(best);
    }
    return out;
}
`),
  100: file(`int subarraySumCount(vector<int>& nums, int k) {
    map<int, int> seen;
    seen[0] = 1;
    int total = 0;
    int count = 0;
    for (int x : nums) {
        total += x;
        if (seen.count(total - k)) count += seen[total - k];
        seen[total]++;
    }
    return count;
}
`),
  101: file(`int longestZeroSum(vector<int>& nums) {
    map<int, int> first;
    first[0] = -1;
    int total = 0;
    int best = 0;
    for (int i = 0; i < nums.size(); i++) {
        total += nums[i];
        if (first.count(total)) best = max(best, i - first[total]);
        else first[total] = i;
    }
    return best;
}
`),
  102: file(`int longestEqual01(vector<int>& nums) {
    map<int, int> first;
    first[0] = -1;
    int total = 0;
    int best = 0;
    for (int i = 0; i < nums.size(); i++) {
        total += nums[i] == 1 ? 1 : -1;
        if (first.count(total)) best = max(best, i - first[total]);
        else first[total] = i;
    }
    return best;
}
`),
  103: file(`int pairsWithDifference(vector<int>& nums, int k) {
    map<int, int> counts;
    for (int x : nums) counts[x]++;
    int pairs = 0;
    for (auto [x, c] : counts) {
        if (k == 0) {
            if (c >= 2) pairs++;
        } else if (counts.count(x + k)) {
            pairs++;
        }
    }
    return pairs;
}
`),
  104: file(`int pairsDivisibleByK(vector<int>& nums, int k) {
    vector<int> seen(k, 0);
    int count = 0;
    for (int x : nums) {
        int r = ((x % k) + k) % k;
        count += seen[(k - r) % k];
        seen[r]++;
    }
    return count;
}
`),
  105: file(`bool validSudoku(vector<vector<char>>& board) {
    vector<vector<int>> rows(9, vector<int>(10, 0));
    vector<vector<int>> cols(9, vector<int>(10, 0));
    vector<vector<int>> boxes(9, vector<int>(10, 0));
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            char d = board[r][c];
            if (d == '.') continue;
            int b = r / 3 * 3 + c / 3;
            int k = d - '0';
            if (rows[r][k] || cols[c][k] || boxes[b][k]) return false;
            rows[r][k] = 1;
            cols[c][k] = 1;
            boxes[b][k] = 1;
        }
    }
    return true;
}
`),
  106: file(`int fourSumCount(vector<int>& a, vector<int>& b, vector<int>& c, vector<int>& d) {
    map<int, int> sums;
    for (int x : a) {
        for (int y : b) sums[x + y]++;
    }
    int count = 0;
    for (int z : c) {
        for (int w : d) {
            if (sums.count(-(z + w))) count += sums[-(z + w)];
        }
    }
    return count;
}
`),
  107: file(`class MyHashMap {
public:
    vector<vector<int>> keys;
    vector<vector<int>> values;

    MyHashMap() {
        for (int i = 0; i < 1000; i++) {
            vector<int> empty;
            keys.push_back(empty);
            values.push_back(empty);
        }
    }

    void put(int key, int value) {
        int b = key % 1000;
        for (int i = 0; i < keys[b].size(); i++) {
            if (keys[b][i] == key) {
                values[b][i] = value;
                return;
            }
        }
        keys[b].push_back(key);
        values[b].push_back(value);
    }

    int get(int key) {
        int b = key % 1000;
        for (int i = 0; i < keys[b].size(); i++) {
            if (keys[b][i] == key) return values[b][i];
        }
        return -1;
    }

    void remove(int key) {
        int b = key % 1000;
        for (int i = 0; i < keys[b].size(); i++) {
            if (keys[b][i] == key) {
                keys[b].erase(keys[b].begin() + i);
                values[b].erase(values[b].begin() + i);
                return;
            }
        }
    }
};
`),
  108: file(`class LRUCache {
public:
    int capacity;
    int clock = 0;
    vector<int> keys;
    vector<int> values;
    vector<int> used;

    LRUCache(int capacity) {
        this->capacity = capacity;
    }

    int find(int key) {
        for (int i = 0; i < keys.size(); i++) {
            if (keys[i] == key) return i;
        }
        return -1;
    }

    int get(int key) {
        int i = find(key);
        if (i == -1) return -1;
        clock++;
        used[i] = clock;
        return values[i];
    }

    void put(int key, int value) {
        clock++;
        int i = find(key);
        if (i != -1) {
            values[i] = value;
            used[i] = clock;
            return;
        }
        keys.push_back(key);
        values.push_back(value);
        used.push_back(clock);
        if (keys.size() > capacity) {
            int oldest = 0;
            for (int k = 1; k < used.size(); k++) {
                if (used[k] < used[oldest]) oldest = k;
            }
            keys.erase(keys.begin() + oldest);
            values.erase(values.begin() + oldest);
            used.erase(used.begin() + oldest);
        }
    }
};
`),
  109: file(`vector<vector<string>> groupShifted(vector<string> words) {
    map<string, int> where;
    vector<vector<string>> groups;
    for (string w : words) {
        string key = "";
        for (int i = 1; i < w.size(); i++) key += to_string((w[i] - w[i - 1] + 26) % 26) + ",";
        if (where.count(key) == 0) {
            where[key] = groups.size();
            vector<string> fresh;
            groups.push_back(fresh);
        }
        groups[where[key]].push_back(w);
    }
    return groups;
}
`),
  110: file(`int firstMissingPositive(vector<int>& nums) {
    int n = nums.size();
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
