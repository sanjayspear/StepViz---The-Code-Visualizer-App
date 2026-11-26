// Reference solutions for Practice: Two pointers (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  111: `def two_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
`,
  112: `def reverse_vowels(s):
    chars = list(s)
    i, j = 0, len(chars) - 1
    vowels = "aeiouAEIOU"
    while i < j:
        if chars[i] not in vowels:
            i += 1
        elif chars[j] not in vowels:
            j -= 1
        else:
            chars[i], chars[j] = chars[j], chars[i]
            i += 1
            j -= 1
    return "".join(chars)
`,
  113: `def remove_element(nums, val):
    k = 0
    for x in nums:
        if x != val:
            nums[k] = x
            k += 1
    return k
`,
  114: `def sorted_squares(nums):
    n = len(nums)
    out = [0] * n
    i, j = 0, n - 1
    for w in range(n - 1, -1, -1):
        if abs(nums[i]) > abs(nums[j]):
            out[w] = nums[i] * nums[i]
            i += 1
        else:
            out[w] = nums[j] * nums[j]
            j -= 1
    return out
`,
  115: `def merge_into(a, m, b, n):
    i, j, w = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:
            a[w] = a[i]
            i -= 1
        else:
            a[w] = b[j]
            j -= 1
        w -= 1
`,
  116: `def negatives_first(nums):
    k = 0
    for i in range(len(nums)):
        if nums[i] < 0:
            nums[i], nums[k] = nums[k], nums[i]
            k += 1
`,
  117: `def backspace_compare(s, t):
    def real(text):
        out = []
        for ch in text:
            if ch == "#":
                if out:
                    out.pop()
            else:
                out.append(ch)
        return out
    return real(s) == real(t)
`,
  118: `def palindrome_after_one_delete(s):
    def is_pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return is_pal(i + 1, j) or is_pal(i, j - 1)
        i += 1
        j -= 1
    return True
`,
  119: `def has_pair_with_difference(nums, k):
    i, j = 0, 1
    while j < len(nums):
        if i == j:
            j += 1
            continue
        d = nums[j] - nums[i]
        if d == k:
            return True
        if d < k:
            j += 1
        else:
            i += 1
    return False
`,
  120: `def max_area(height):
    i, j = 0, len(height) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(height[i], height[j]))
        if height[i] < height[j]:
            i += 1
        else:
            j -= 1
    return best
`,
  121: `def three_sum(nums):
    nums = sorted(nums)
    out = []
    for i in range(len(nums)):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                lo += 1
                hi -= 1
    return out
`,
  122: `def three_sum_closest(nums, target):
    nums = sorted(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(len(nums) - 2):
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if abs(s - target) < abs(best - target):
                best = s
            if s < target:
                lo += 1
            elif s > target:
                hi -= 1
            else:
                return s
    return best
`,
  123: `def four_sum(nums, target):
    nums = sorted(nums)
    out = []
    n = len(nums)
    for a in range(n):
        if a > 0 and nums[a] == nums[a - 1]:
            continue
        for b in range(a + 1, n):
            if b > a + 1 and nums[b] == nums[b - 1]:
                continue
            lo, hi = b + 1, n - 1
            while lo < hi:
                s = nums[a] + nums[b] + nums[lo] + nums[hi]
                if s < target:
                    lo += 1
                elif s > target:
                    hi -= 1
                else:
                    out.append([nums[a], nums[b], nums[lo], nums[hi]])
                    while lo < hi and nums[lo] == nums[lo + 1]:
                        lo += 1
                    lo += 1
                    hi -= 1
    return out
`,
  124: `def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
`,
  125: `def remove_extra_duplicates(nums):
    k = 0
    for x in nums:
        if k < 2 or x != nums[k - 2]:
            nums[k] = x
            k += 1
    return k
`,
  126: `def count_pairs_below(nums, target):
    i, j = 0, len(nums) - 1
    count = 0
    while i < j:
        if nums[i] + nums[j] < target:
            count += j - i
            i += 1
        else:
            j -= 1
    return count
`,
  127: `def num_boats(people, limit):
    people = sorted(people)
    i, j = 0, len(people) - 1
    boats = 0
    while i <= j:
        if people[i] + people[j] <= limit:
            i += 1
        j -= 1
        boats += 1
    return boats
`,
  128: `def shortest_unsorted(nums):
    n = len(nums)
    end, start = -1, 0
    biggest = float("-inf")
    for i in range(n):
        if nums[i] < biggest:
            end = i
        else:
            biggest = nums[i]
    smallest = float("inf")
    for i in range(n - 1, -1, -1):
        if nums[i] > smallest:
            start = i
        else:
            smallest = nums[i]
    return end - start + 1 if end != -1 else 0
`,
  129: `def smallest_difference(a, b):
    i = j = 0
    best = float("inf")
    while i < len(a) and j < len(b):
        best = min(best, abs(a[i] - b[j]))
        if a[i] < b[j]:
            i += 1
        else:
            j += 1
    return best
`,
  130: `def triangle_count(nums):
    nums = sorted(nums)
    count = 0
    for k in range(len(nums) - 1, 1, -1):
        lo, hi = 0, k - 1
        while lo < hi:
            if nums[lo] + nums[hi] > nums[k]:
                count += hi - lo
                hi -= 1
            else:
                lo += 1
    return count
`,
};
