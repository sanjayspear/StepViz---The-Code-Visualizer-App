// C++ reference solutions for Practice: Binary search. Never shipped to students.
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
const LOWER = `int lowerBound(vector<int>& nums, int target) {
    int low = 0;
    int high = nums.size();
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}
`;

export const SOLUTIONS: Record<number, string> = {
  171: file(`int binarySearch(vector<int>& nums, int target) {
    int low = 0;
    int high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`),
  172: file(`${LOWER}
int searchInsert(vector<int>& nums, int target) {
    return lowerBound(nums, target);
}
`),
  173: file(`${LOWER}
int countOccurrences(vector<int>& nums, int target) {
    return lowerBound(nums, target + 1) - lowerBound(nums, target);
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
    return best;
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
  176: file(`class Guesser {
public:
    int hidden;

    Guesser(int hidden) {
        this->hidden = hidden;
    }

    int guess(int x) {
        if (x == hidden) return 0;
        return hidden < x ? -1 : 1;
    }
};

int guessNumber(int n, Guesser g) {
    int low = 1;
    int high = n;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        int r = g.guess(mid);
        if (r == 0) return mid;
        if (r < 0) high = mid - 1;
        else low = mid + 1;
    }
    return -1;
}
`),
  177: file(`class VersionChecker {
public:
    int firstBad;

    VersionChecker(int firstBad) {
        this->firstBad = firstBad;
    }

    bool isBad(int v) {
        return v >= firstBad;
    }
};

int firstBadVersion(int n, VersionChecker checker) {
    int low = 1;
    int high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (checker.isBad(mid)) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  178: file(`char nextLetter(vector<char>& letters, char target) {
    int low = 0;
    int high = letters.size();
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (letters[mid] <= target) low = mid + 1;
        else high = mid;
    }
    return low == letters.size() ? letters[0] : letters[low];
}
`),
  179: file(`${LOWER}
vector<int> searchRange(vector<int>& nums, int target) {
    int first = lowerBound(nums, target);
    vector<int> out;
    if (first == nums.size() || nums[first] != target) {
        out.push_back(-1);
        out.push_back(-1);
        return out;
    }
    out.push_back(first);
    out.push_back(lowerBound(nums, target + 1) - 1);
    return out;
}
`),
  180: file(`int findPeak(vector<int>& nums) {
    int low = 0;
    int high = nums.size() - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] < nums[mid + 1]) low = mid + 1;
        else high = mid;
    }
    return low;
}
`),
  181: file(`int searchRotated(vector<int>& nums, int target) {
    int low = 0;
    int high = nums.size() - 1;
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
  182: file(`int findMinRotated(vector<int>& nums) {
    int low = 0;
    int high = nums.size() - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] > nums[high]) low = mid + 1;
        else high = mid;
    }
    return nums[low];
}
`),
  183: file(`bool searchMatrix(vector<vector<int>>& matrix, int target) {
    if (matrix.empty()) return false;
    int r = 0;
    int c = matrix[0].size() - 1;
    while (r < matrix.size() && c >= 0) {
        if (matrix[r][c] == target) return true;
        if (matrix[r][c] > target) c--;
        else r++;
    }
    return false;
}
`),
  184: file(`int singleInSorted(vector<int>& nums) {
    int low = 0;
    int high = nums.size() - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (mid % 2 == 1) mid--;
        if (nums[mid] == nums[mid + 1]) low = mid + 2;
        else high = mid;
    }
    return nums[low];
}
`),
  185: file(`int minEatingSpeed(vector<int>& piles, int h) {
    int low = 1;
    int high = 1;
    for (int p : piles) high = max(high, p);
    while (low < high) {
        int mid = low + (high - low) / 2;
        long long hours = 0;
        for (int p : piles) hours += (p + mid - 1) / mid;
        if (hours <= h) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  186: file(`int shipWithinDays(vector<int>& weights, int days) {
    int low = 0;
    int high = 0;
    for (int w : weights) {
        low = max(low, w);
        high += w;
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        int need = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > mid) {
                need++;
                load = 0;
            }
            load += w;
        }
        if (need <= days) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  187: file(`int kthSmallestMatrix(vector<vector<int>>& matrix, int k) {
    int n = matrix.size();
    int low = matrix[0][0];
    int high = matrix[n - 1][n - 1];
    while (low < high) {
        int mid = low + (high - low) / 2;
        int count = 0;
        int c = n - 1;
        for (int r = 0; r < n; r++) {
            while (c >= 0 && matrix[r][c] > mid) c--;
            count += c + 1;
        }
        if (count >= k) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  188: file(`class Reader {
public:
    vector<int> data;

    Reader(vector<int> data) {
        this->data = data;
    }

    int get(int i) {
        return i >= 0 && i < data.size() ? data[i] : 2147483647;
    }
};

int searchUnknown(Reader reader, int target) {
    int high = 1;
    while (reader.get(high) < target) high *= 2;
    int low = high / 2;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        int v = reader.get(mid);
        if (v == target) return mid;
        if (v < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`),
  189: file(`int splitArray(vector<int>& nums, int k) {
    int low = 0;
    int high = 0;
    for (int x : nums) {
        low = max(low, x);
        high += x;
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        int parts = 1;
        int total = 0;
        for (int x : nums) {
            if (total + x > mid) {
                parts++;
                total = 0;
            }
            total += x;
        }
        if (parts <= k) high = mid;
        else low = mid + 1;
    }
    return low;
}
`),
  190: file(`double medianSorted(vector<int>& a, vector<int>& b) {
    if (a.size() > b.size()) return medianSorted(b, a);
    int m = a.size();
    int n = b.size();
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
            if ((m + n) % 2 == 1) return max(aLeft, bLeft);
            return (max(aLeft, bLeft) + min(aRight, bRight)) / 2.0;
        }
        if (aLeft > bRight) high = i - 1;
        else low = i + 1;
    }
    return 0;
}
`),
};
