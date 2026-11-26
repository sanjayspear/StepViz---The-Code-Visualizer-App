// Reference solutions for Practice: Sliding window (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  131: `def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best
`,
  132: `def window_averages(nums, k):
    out = []
    total = 0
    for i, x in enumerate(nums):
        total += x
        if i >= k:
            total -= nums[i - k]
        if i >= k - 1:
            out.append(total / k)
    return out
`,
  133: `from collections import deque


def first_negatives(nums, k):
    negs = deque()
    out = []
    for i, x in enumerate(nums):
        if x < 0:
            negs.append(i)
        if negs and negs[0] <= i - k:
            negs.popleft()
        if i >= k - 1:
            out.append(nums[negs[0]] if negs else 0)
    return out
`,
  134: `def max_vowels(s, k):
    vowels = set("aeiou")
    count = sum(1 for ch in s[:k] if ch in vowels)
    best = count
    for i in range(k, len(s)):
        count += (s[i] in vowels) - (s[i - k] in vowels)
        best = max(best, count)
    return best
`,
  135: `def longest_unique_substring(s):
    last = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best
`,
  136: `def longest_k_distinct(s, k):
    counts = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        while len(counts) > k:
            counts[s[left]] -= 1
            if counts[s[left]] == 0:
                del counts[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
  137: `def character_replacement(s, k):
    counts = {}
    left = 0
    top = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        top = max(top, counts[ch])
        while right - left + 1 - top > k:
            counts[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
  138: `def longest_ones(nums, k):
    left = 0
    zeros = 0
    best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
  139: `def min_subarray_len(target, nums):
    left = 0
    total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best
`,
  140: `def longest_two_values(nums):
    counts = {}
    left = 0
    best = 0
    for right, x in enumerate(nums):
        counts[x] = counts.get(x, 0) + 1
        while len(counts) > 2:
            counts[nums[left]] -= 1
            if counts[nums[left]] == 0:
                del counts[nums[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
  141: `def contains_permutation(p, s):
    if len(p) > len(s):
        return False
    need = {}
    for ch in p:
        need[ch] = need.get(ch, 0) + 1
    window = {}
    for i, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1
        if i >= len(p):
            old = s[i - len(p)]
            window[old] -= 1
            if window[old] == 0:
                del window[old]
        if window == need:
            return True
    return False
`,
  142: `def find_anagrams(text, pattern):
    need = {}
    for ch in pattern:
        need[ch] = need.get(ch, 0) + 1
    window = {}
    out = []
    m = len(pattern)
    for i, ch in enumerate(text):
        window[ch] = window.get(ch, 0) + 1
        if i >= m:
            old = text[i - m]
            window[old] -= 1
            if window[old] == 0:
                del window[old]
        if i >= m - 1 and window == need:
            out.append(i - m + 1)
    return out
`,
  143: `def products_below_k(nums, k):
    if k <= 1:
        return 0
    product = 1
    left = 0
    count = 0
    for right, x in enumerate(nums):
        product *= x
        while product >= k:
            product //= nums[left]
            left += 1
        count += right - left + 1
    return count
`,
  144: `def longest_after_delete(nums):
    left = 0
    zeros = 0
    best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > 1:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best - 1
`,
  145: `def max_card_points(cards, k):
    n = len(cards)
    size = n - k
    total = sum(cards)
    if size == 0:
        return total
    window = sum(cards[:size])
    smallest = window
    for i in range(size, n):
        window += cards[i] - cards[i - size]
        smallest = min(smallest, window)
    return total - smallest
`,
  146: `def min_swaps_group_ones(data):
    m = sum(data)
    if m == 0:
        return 0
    window = sum(data[:m])
    best = window
    for i in range(m, len(data)):
        window += data[i] - data[i - m]
        best = max(best, window)
    return m - best
`,
  147: `def count_anagram_windows(text, word):
    need = {}
    for ch in word:
        need[ch] = need.get(ch, 0) + 1
    window = {}
    count = 0
    m = len(word)
    for i, ch in enumerate(text):
        window[ch] = window.get(ch, 0) + 1
        if i >= m:
            old = text[i - m]
            window[old] -= 1
            if window[old] == 0:
                del window[old]
        if i >= m - 1 and window == need:
            count += 1
    return count
`,
  148: `def exactly_k_distinct(nums, k):
    def at_most(limit):
        if limit < 0:
            return 0
        counts = {}
        left = 0
        total = 0
        for right, x in enumerate(nums):
            counts[x] = counts.get(x, 0) + 1
            while len(counts) > limit:
                counts[nums[left]] -= 1
                if counts[nums[left]] == 0:
                    del counts[nums[left]]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)
`,
  149: `from collections import deque


def max_sliding_window(nums, k):
    window = deque()
    out = []
    for i, x in enumerate(nums):
        while window and nums[window[-1]] <= x:
            window.pop()
        window.append(i)
        if window[0] <= i - k:
            window.popleft()
        if i >= k - 1:
            out.append(nums[window[0]])
    return out
`,
  150: `def longest_with_k_repeats(s, k):
    if len(s) < k:
        return 0
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if counts[ch] < k:
            return max(longest_with_k_repeats(s[:i], k), longest_with_k_repeats(s[i + 1:], k))
    return len(s)
`,
};
