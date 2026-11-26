// Reference solutions for Practice: Hash maps & sets (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  86: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
`,
  87: `def contains_duplicate(nums):
    return len(set(nums)) != len(nums)
`,
  88: `def element_frequency(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    return counts
`,
  89: `def most_frequent(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    best = None
    for x, c in counts.items():
        if best is None or c > counts[best] or (c == counts[best] and x < best):
            best = x
    return best
`,
  90: `def appear_once(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    return [x for x in nums if counts[x] == 1]
`,
  91: `def same_elements(a, b):
    counts = {}
    for x in a:
        counts[x] = counts.get(x, 0) + 1
    for x in b:
        counts[x] = counts.get(x, 0) - 1
    return all(v == 0 for v in counts.values())
`,
  92: `def common_in_three(a, b, c):
    i = j = k = 0
    out = []
    while i < len(a) and j < len(b) and k < len(c):
        if a[i] == b[j] == c[k]:
            if not out or out[-1] != a[i]:
                out.append(a[i])
            i += 1
            j += 1
            k += 1
        else:
            smallest = min(a[i], b[j], c[k])
            if a[i] == smallest:
                i += 1
            if b[j] == smallest:
                j += 1
            if c[k] == smallest:
                k += 1
    return out
`,
  93: `def is_isomorphic(s, t):
    if len(s) != len(t):
        return False
    to_t, to_s = {}, {}
    for a, b in zip(s, t):
        if to_t.get(a, b) != b or to_s.get(b, a) != a:
            return False
        to_t[a] = b
        to_s[b] = a
    return True
`,
  94: `def word_pattern(pattern, s):
    words = s.split()
    if len(words) != len(pattern):
        return False
    to_word, to_letter = {}, {}
    for p, w in zip(pattern, words):
        if to_word.get(p, w) != w or to_letter.get(w, p) != p:
            return False
        to_word[p] = w
        to_letter[w] = p
    return True
`,
  95: `def can_construct(note, magazine):
    counts = {}
    for ch in magazine:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in note:
        if counts.get(ch, 0) == 0:
            return False
        counts[ch] -= 1
    return True
`,
  96: `def is_happy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1
`,
  97: `def nearby_duplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False
`,
  98: `def top_k_frequent(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in counts.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        for x in buckets[c]:
            if len(out) < k:
                out.append(x)
    return out
`,
  99: `def frequency_sort(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    order = sorted(counts, key=lambda ch: (-counts[ch], ch))
    return "".join(ch * counts[ch] for ch in order)
`,
  100: `def subarray_sum_count(nums, k):
    seen = {0: 1}
    total = 0
    count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
`,
  101: `def longest_zero_sum(nums):
    first = {0: -1}
    total = 0
    best = 0
    for i, x in enumerate(nums):
        total += x
        if total in first:
            best = max(best, i - first[total])
        else:
            first[total] = i
    return best
`,
  102: `def longest_equal_01(nums):
    first = {0: -1}
    total = 0
    best = 0
    for i, x in enumerate(nums):
        total += 1 if x == 1 else -1
        if total in first:
            best = max(best, i - first[total])
        else:
            first[total] = i
    return best
`,
  103: `def pairs_with_difference(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    if k == 0:
        return sum(1 for c in counts.values() if c >= 2)
    return sum(1 for x in counts if x + k in counts)
`,
  104: `def pairs_divisible_by_k(nums, k):
    seen = {}
    count = 0
    for x in nums:
        r = x % k
        count += seen.get((k - r) % k, 0)
        seen[r] = seen.get(r, 0) + 1
    return count
`,
  105: `def valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            d = board[r][c]
            if d == ".":
                continue
            b = r // 3 * 3 + c // 3
            if d in rows[r] or d in cols[c] or d in boxes[b]:
                return False
            rows[r].add(d)
            cols[c].add(d)
            boxes[b].add(d)
    return True
`,
  106: `def four_sum_count(a, b, c, d):
    sums = {}
    for x in a:
        for y in b:
            sums[x + y] = sums.get(x + y, 0) + 1
    count = 0
    for z in c:
        for w in d:
            count += sums.get(-(z + w), 0)
    return count
`,
  107: `class MyHashMap:
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]

    def put(self, key, value):
        bucket = self.buckets[key % self.size]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])

    def get(self, key):
        for k, v in self.buckets[key % self.size]:
            if k == key:
                return v
        return -1

    def remove(self, key):
        bucket = self.buckets[key % self.size]
        for i, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(i)
                return
`,
  108: `from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)
`,
  109: `def group_shifted(strings):
    groups = {}
    for w in strings:
        key = tuple((ord(w[i]) - ord(w[i - 1])) % 26 for i in range(1, len(w)))
        groups.setdefault(key, []).append(w)
    return list(groups.values())
`,
  110: `def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
`,
};
