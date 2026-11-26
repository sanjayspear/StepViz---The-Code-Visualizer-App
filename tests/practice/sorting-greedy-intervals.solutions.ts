// Reference solutions for Practice: Sorting, greedy & intervals (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  306: `def bubble_sort(nums):
    a = nums[:]
    for end in range(len(a) - 1, 0, -1):
        for j in range(end):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a


def selection_sort(nums):
    a = nums[:]
    for i in range(len(a)):
        smallest = i
        for j in range(i + 1, len(a)):
            if a[j] < a[smallest]:
                smallest = j
        a[i], a[smallest] = a[smallest], a[i]
    return a


def insertion_sort(nums):
    a = nums[:]
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x
    return a
`,
  307: `def sort_by_counting(nums):
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1
    return [0] * counts[0] + [1] * counts[1] + [2] * counts[2]
`,
  308: `def can_attend_all(meetings):
    meetings = sorted(meetings)
    for i in range(1, len(meetings)):
        if meetings[i][0] < meetings[i - 1][1]:
            return False
    return True
`,
  309: `def content_children(greed, cookies):
    greed, cookies = sorted(greed), sorted(cookies)
    child = 0
    for c in cookies:
        if child < len(greed) and c >= greed[child]:
            child += 1
    return child
`,
  310: `def merge_sort(nums):
    if len(nums) <= 1:
        return nums[:]
    mid = len(nums) // 2
    a, b = merge_sort(nums[:mid]), merge_sort(nums[mid:])
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    return out + a[i:] + b[j:]
`,
  311: `def quick_sort(nums):
    if len(nums) <= 1:
        return nums[:]
    pivot = nums[len(nums) // 2]
    smaller = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    bigger = [x for x in nums if x > pivot]
    return quick_sort(smaller) + equal + quick_sort(bigger)
`,
  312: `import heapq


def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
`,
  313: `def merge_intervals(intervals):
    out = []
    for start, end in sorted(intervals):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out
`,
  314: `def insert_interval(intervals, new):
    out = []
    start, end = new
    i = 0
    while i < len(intervals) and intervals[i][1] < start:
        out.append(intervals[i])
        i += 1
    while i < len(intervals) and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    return out + intervals[i:]
`,
  315: `def erase_overlap(intervals):
    removed = 0
    last_end = float("-inf")
    for start, end in sorted(intervals, key=lambda x: x[1]):
        if start >= last_end:
            last_end = end
        else:
            removed += 1
    return removed
`,
  316: `def min_meeting_rooms(meetings):
    starts = sorted(m[0] for m in meetings)
    ends = sorted(m[1] for m in meetings)
    rooms = best = 0
    j = 0
    for s in starts:
        while j < len(ends) and ends[j] <= s:
            j += 1
            rooms -= 1
        rooms += 1
        best = max(best, rooms)
    return best
`,
  317: `def min_platforms(arrivals, departures):
    arr, dep = sorted(arrivals), sorted(departures)
    i = j = 0
    used = best = 0
    while i < len(arr):
        if arr[i] <= dep[j]:
            used += 1
            best = max(best, used)
            i += 1
        else:
            used -= 1
            j += 1
    return best
`,
  318: `def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start, tank = 0, 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start
`,
  319: `def least_interval(tasks, n):
    counts = {}
    for t in tasks:
        counts[t] = counts.get(t, 0) + 1
    m = max(counts.values())
    k = sum(1 for c in counts.values() if c == m)
    return max(len(tasks), (m - 1) * (n + 1) + k)
`,
  320: `from functools import cmp_to_key


def largest_number(nums):
    texts = [str(x) for x in nums]
    def order(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0
    texts.sort(key=cmp_to_key(order))
    joined = "".join(texts)
    return "0" if joined.startswith("0") else joined
`,
};
