// Reference solutions for Practice: Arrays & matrices (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  56: `def find_min_max(nums):
    smallest = largest = nums[0]
    for x in nums:
        if x < smallest:
            smallest = x
        if x > largest:
            largest = x
    return smallest, largest
`,
  57: `def second_largest(nums):
    first = second = None
    for x in nums:
        if first is None or x > first:
            if first is not None:
                second = first
            first = x
        elif x != first and (second is None or x > second):
            second = x
    return second
`,
  58: `def reverse_in_place(nums):
    i, j = 0, len(nums) - 1
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1
`,
  59: `def is_sorted(nums):
    for i in range(1, len(nums)):
        if nums[i] < nums[i - 1]:
            return False
    return True
`,
  60: `def remove_duplicates_sorted(nums):
    if not nums:
        return 0
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return k
`,
  61: `def move_zeros(nums):
    w = 0
    for x in nums:
        if x != 0:
            nums[w] = x
            w += 1
    for i in range(w, len(nums)):
        nums[i] = 0
`,
  62: `def rotate_right(nums, k):
    if not nums:
        return
    k %= len(nums)
    def rev(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    rev(0, len(nums) - 1)
    rev(0, k - 1)
    rev(k, len(nums) - 1)
`,
  63: `def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)
`,
  64: `def single_number(nums):
    result = 0
    for x in nums:
        result ^= x
    return result
`,
  65: `def find_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
`,
  66: `def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out
`,
  67: `def intersection(a, b):
    in_a = set(a)
    found = []
    for x in b:
        if x in in_a and x not in found:
            found.append(x)
    return found
`,
  68: `def union(a, b):
    out = []
    seen = set()
    for x in a + b:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
`,
  69: `def plus_one(digits):
    digits = digits[:]
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits
`,
  70: `def majority_element(nums):
    candidate, count = None, 0
    for x in nums:
        if count == 0:
            candidate = x
        count += 1 if x == candidate else -1
    return candidate
`,
  71: `def max_profit(prices):
    cheapest = float("inf")
    best = 0
    for p in prices:
        cheapest = min(cheapest, p)
        best = max(best, p - cheapest)
    return best
`,
  72: `def max_profit_many(prices):
    total = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            total += prices[i] - prices[i - 1]
    return total
`,
  73: `def max_subarray(nums):
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)
        best = max(best, current)
    return best
`,
  74: `def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    left = 1
    for i in range(n):
        answer[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= right
        right *= nums[i]
    return answer
`,
  75: `def majority_third(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    return [x for x, c in counts.items() if c > len(nums) // 3]
`,
  76: `def pascal(n):
    rows = []
    for i in range(n):
        row = [1] * (i + 1)
        for j in range(1, i):
            row[j] = rows[-1][j - 1] + rows[-1][j]
        rows.append(row)
    return rows
`,
  77: `def transpose(matrix):
    return [[matrix[r][c] for r in range(len(matrix))] for c in range(len(matrix[0]))]
`,
  78: `def rotate_matrix(matrix):
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()
`,
  79: `def spiral_order(matrix):
    out = []
    if not matrix:
        return out
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out
`,
  80: `def set_zeroes(matrix):
    rows, cols = set(), set()
    for r in range(len(matrix)):
        for c in range(len(matrix[0])):
            if matrix[r][c] == 0:
                rows.add(r)
                cols.add(c)
    for r in range(len(matrix)):
        for c in range(len(matrix[0])):
            if r in rows or c in cols:
                matrix[r][c] = 0
`,
  81: `def leaders(nums):
    out = []
    biggest = None
    for x in reversed(nums):
        if biggest is None or x > biggest:
            out.append(x)
            biggest = x
    out.reverse()
    return out
`,
  82: `def pivot_index(nums):
    total = sum(nums)
    left = 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1
`,
  83: `def next_permutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])
`,
  84: `def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
    return best
`,
  85: `def trap(height):
    n = len(height)
    if n == 0:
        return 0
    left = [0] * n
    right = [0] * n
    left[0] = height[0]
    for i in range(1, n):
        left[i] = max(left[i - 1], height[i])
    right[-1] = height[-1]
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))
`,
};
