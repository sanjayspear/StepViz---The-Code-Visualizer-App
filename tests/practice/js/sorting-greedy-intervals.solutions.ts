// JavaScript reference solutions for Practice: Sorting, greedy & intervals. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  306: `function bubbleSort(nums) {
  const a = [...nums];
  for (let end = a.length - 1; end > 0; end--) {
    for (let j = 0; j < end; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
  }
  return a;
}

function selectionSort(nums) {
  const a = [...nums];
  for (let i = 0; i < a.length; i++) {
    let smallest = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[smallest]) smallest = j;
    [a[i], a[smallest]] = [a[smallest], a[i]];
  }
  return a;
}

function insertionSort(nums) {
  const a = [...nums];
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
  return a;
}
`,
  307: `function sortByCounting(nums) {
  const counts = [0, 0, 0];
  for (const x of nums) counts[x]++;
  return [...new Array(counts[0]).fill(0), ...new Array(counts[1]).fill(1), ...new Array(counts[2]).fill(2)];
}
`,
  308: `function canAttendAll(meetings) {
  const m = meetings.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < m.length; i++) if (m[i][0] < m[i - 1][1]) return false;
  return true;
}
`,
  309: `function contentChildren(greed, cookies) {
  const g = greed.slice().sort((a, b) => a - b);
  const c = cookies.slice().sort((a, b) => a - b);
  let child = 0;
  for (const size of c) if (child < g.length && size >= g[child]) child++;
  return child;
}
`,
  310: `function mergeSort(nums) {
  if (nums.length <= 1) return [...nums];
  const mid = Math.floor(nums.length / 2);
  const a = mergeSort(nums.slice(0, mid));
  const b = mergeSort(nums.slice(mid));
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return [...out, ...a.slice(i), ...b.slice(j)];
}
`,
  311: `function quickSort(nums) {
  if (nums.length <= 1) return [...nums];
  const pivot = nums[Math.floor(nums.length / 2)];
  const smaller = nums.filter((x) => x < pivot);
  const equal = nums.filter((x) => x === pivot);
  const bigger = nums.filter((x) => x > pivot);
  return [...quickSort(smaller), ...equal, ...quickSort(bigger)];
}
`,
  312: `function kthLargest(nums, k) {
  return nums.slice().sort((a, b) => b - a)[k - 1];
}
`,
  313: `function mergeIntervals(intervals) {
  const out = [];
  for (const [start, end] of intervals.slice().sort((a, b) => a[0] - b[0])) {
    if (out.length && start <= out[out.length - 1][1]) out[out.length - 1][1] = Math.max(out[out.length - 1][1], end);
    else out.push([start, end]);
  }
  return out;
}
`,
  314: `function insertInterval(intervals, interval) {
  const out = [];
  let [start, end] = interval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < start) out.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  out.push([start, end]);
  return [...out, ...intervals.slice(i)];
}
`,
  315: `function eraseOverlap(intervals) {
  let removed = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of intervals.slice().sort((a, b) => a[1] - b[1])) {
    if (start >= lastEnd) lastEnd = end;
    else removed++;
  }
  return removed;
}
`,
  316: `function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let best = 0;
  let j = 0;
  for (const s of starts) {
    while (j < ends.length && ends[j] <= s) {
      j++;
      rooms--;
    }
    rooms++;
    best = Math.max(best, rooms);
  }
  return best;
}
`,
  317: `function minPlatforms(arrivals, departures) {
  const arr = arrivals.slice().sort((a, b) => a - b);
  const dep = departures.slice().sort((a, b) => a - b);
  let i = 0;
  let j = 0;
  let used = 0;
  let best = 0;
  while (i < arr.length) {
    if (arr[i] <= dep[j]) {
      used++;
      best = Math.max(best, used);
      i++;
    } else {
      used--;
      j++;
    }
  }
  return best;
}
`,
  318: `function canCompleteCircuit(gas, cost) {
  const total = (xs) => xs.reduce((a, b) => a + b, 0);
  if (total(gas) < total(cost)) return -1;
  let start = 0;
  let tank = 0;
  for (let i = 0; i < gas.length; i++) {
    tank += gas[i] - cost[i];
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return start;
}
`,
  319: `function leastInterval(tasks, n) {
  const counts = new Map();
  for (const t of tasks) counts.set(t, (counts.get(t) ?? 0) + 1);
  const m = Math.max(...counts.values());
  const k = [...counts.values()].filter((c) => c === m).length;
  return Math.max(tasks.length, (m - 1) * (n + 1) + k);
}
`,
  320: `function largestNumber(nums) {
  const texts = nums.map(String).sort((a, b) => (b + a > a + b ? 1 : b + a < a + b ? -1 : 0));
  const joined = texts.join("");
  return joined.startsWith("0") ? "0" : joined;
}
`,
};
