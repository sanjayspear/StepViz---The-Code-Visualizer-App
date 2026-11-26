// Reference solutions for Practice: Binary search (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  171: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
  172: `def search_insert(nums, target):
    low, high = 0, len(nums)
    while low < high:
        mid = (low + high) // 2
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low
`,
  173: `def count_occurrences(nums, target):
    def first_at_least(x):
        low, high = 0, len(nums)
        while low < high:
            mid = (low + high) // 2
            if nums[mid] < x:
                low = mid + 1
            else:
                high = mid
        return low
    return first_at_least(target + 1) - first_at_least(target)
`,
  174: `def floor_sqrt(n):
    low, high, answer = 0, n, 0
    while low <= high:
        mid = (low + high) // 2
        if mid * mid <= n:
            answer = mid
            low = mid + 1
        else:
            high = mid - 1
    return answer
`,
  175: `def is_perfect_square(n):
    low, high = 1, n
    while low <= high:
        mid = (low + high) // 2
        if mid * mid == n:
            return True
        if mid * mid < n:
            low = mid + 1
        else:
            high = mid - 1
    return False
`,
  176: `def guess_number(n, guess):
    low, high = 1, n
    while low <= high:
        mid = (low + high) // 2
        r = guess(mid)
        if r == 0:
            return mid
        if r < 0:
            high = mid - 1
        else:
            low = mid + 1
`,
  177: `def first_bad_version(n, is_bad):
    low, high = 1, n
    while low < high:
        mid = (low + high) // 2
        if is_bad(mid):
            high = mid
        else:
            low = mid + 1
    return low
`,
  178: `def next_letter(letters, target):
    low, high = 0, len(letters)
    while low < high:
        mid = (low + high) // 2
        if letters[mid] <= target:
            low = mid + 1
        else:
            high = mid
    return letters[low % len(letters)]
`,
  179: `def search_range(nums, target):
    def edge(leftmost):
        low, high, found = 0, len(nums) - 1, -1
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                found = mid
                if leftmost:
                    high = mid - 1
                else:
                    low = mid + 1
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return found
    return [edge(True), edge(False)]
`,
  180: `def find_peak(nums):
    low, high = 0, len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] < nums[mid + 1]:
            low = mid + 1
        else:
            high = mid
    return low
`,
  181: `def search_rotated(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1
`,
  182: `def find_min_rotated(nums):
    low, high = 0, len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[high]:
            low = mid + 1
        else:
            high = mid
    return nums[low]
`,
  183: `def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    r, c = 0, len(matrix[0]) - 1
    while r < len(matrix) and c >= 0:
        v = matrix[r][c]
        if v == target:
            return True
        if v > target:
            c -= 1
        else:
            r += 1
    return False
`,
  184: `def single_in_sorted(nums):
    low, high = 0, len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            low = mid + 2
        else:
            high = mid
    return nums[low]
`,
  185: `def min_eating_speed(piles, h):
    low, high = 1, max(piles)
    while low < high:
        k = (low + high) // 2
        hours = sum((p + k - 1) // k for p in piles)
        if hours <= h:
            high = k
        else:
            low = k + 1
    return low
`,
  186: `def ship_within_days(weights, days):
    def days_needed(cap):
        count, load = 1, 0
        for w in weights:
            if load + w > cap:
                count += 1
                load = 0
            load += w
        return count
    low, high = max(weights), sum(weights)
    while low < high:
        mid = (low + high) // 2
        if days_needed(mid) <= days:
            high = mid
        else:
            low = mid + 1
    return low
`,
  187: `def kth_smallest_matrix(matrix, k):
    n = len(matrix)
    def count_at_most(x):
        r, c, count = n - 1, 0, 0
        while r >= 0 and c < n:
            if matrix[r][c] <= x:
                count += r + 1
                c += 1
            else:
                r -= 1
        return count
    low, high = matrix[0][0], matrix[-1][-1]
    while low < high:
        mid = (low + high) // 2
        if count_at_most(mid) >= k:
            high = mid
        else:
            low = mid + 1
    return low
`,
  188: `def search_unknown(reader, target):
    high = 1
    while reader.get(high) < target:
        high *= 2
    low = high // 2
    while low <= high:
        mid = (low + high) // 2
        v = reader.get(mid)
        if v == target:
            return mid
        if v < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
  189: `def split_array(nums, k):
    def runs_needed(limit):
        runs, total = 1, 0
        for x in nums:
            if total + x > limit:
                runs += 1
                total = 0
            total += x
        return runs
    low, high = max(nums), sum(nums)
    while low < high:
        mid = (low + high) // 2
        if runs_needed(mid) <= k:
            high = mid
        else:
            low = mid + 1
    return low
`,
  190: `def median_sorted(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    low, high = 0, m
    inf = float("inf")
    while low <= high:
        i = (low + high) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < m else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < n else inf
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2 == 1:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            high = i - 1
        else:
            low = i + 1
`,
};
