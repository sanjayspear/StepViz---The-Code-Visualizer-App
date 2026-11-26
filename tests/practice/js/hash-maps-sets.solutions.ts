// JavaScript reference solutions for Practice: Hash maps & sets. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  86: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
  87: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}
`,
  88: `function elementFrequency(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  return counts;
}
`,
  89: `function mostFrequent(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  let best = null;
  for (const [x, c] of counts) {
    if (best === null || c > counts.get(best) || (c === counts.get(best) && x < best)) best = x;
  }
  return best;
}
`,
  90: `function appearOnce(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  return nums.filter((x) => counts.get(x) === 1);
}
`,
  91: `function sameElements(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const x of a) counts.set(x, (counts.get(x) ?? 0) + 1);
  for (const x of b) {
    if (!counts.get(x)) return false;
    counts.set(x, counts.get(x) - 1);
  }
  return true;
}
`,
  92: `function commonInThree(a, b, c) {
  const out = [];
  let i = 0;
  let j = 0;
  let k = 0;
  while (i < a.length && j < b.length && k < c.length) {
    if (a[i] === b[j] && b[j] === c[k]) {
      if (out[out.length - 1] !== a[i]) out.push(a[i]);
      i++;
      j++;
      k++;
    } else {
      const smallest = Math.min(a[i], b[j], c[k]);
      if (a[i] === smallest) i++;
      else if (b[j] === smallest) j++;
      else k++;
    }
  }
  return out;
}
`,
  93: `function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const st = new Map();
  const ts = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];
    if ((st.has(a) && st.get(a) !== b) || (ts.has(b) && ts.get(b) !== a)) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
}
`,
  94: `function wordPattern(pattern, s) {
  const words = s.split(" ");
  if (words.length !== pattern.length) return false;
  const lw = new Map();
  const wl = new Map();
  for (let i = 0; i < words.length; i++) {
    const l = pattern[i];
    const w = words[i];
    if ((lw.has(l) && lw.get(l) !== w) || (wl.has(w) && wl.get(w) !== l)) return false;
    lw.set(l, w);
    wl.set(w, l);
  }
  return true;
}
`,
  95: `function canConstruct(note, magazine) {
  const counts = new Map();
  for (const ch of magazine) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of note) {
    if (!counts.get(ch)) return false;
    counts.set(ch, counts.get(ch) - 1);
  }
  return true;
}
`,
  96: `function isHappy(n) {
  const seen = new Set();
  while (n !== 1) {
    if (seen.has(n)) return false;
    seen.add(n);
    let next = 0;
    while (n > 0) {
      next += (n % 10) ** 2;
      n = Math.floor(n / 10);
    }
    n = next;
  }
  return true;
}
`,
  97: `function nearbyDuplicate(nums, k) {
  const last = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;
    last.set(nums[i], i);
  }
  return false;
}
`,
  98: `function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a)).slice(0, k);
}
`,
  99: `function frequencySort(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const chars = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || (a < b ? -1 : a > b ? 1 : 0));
  return chars.map((ch) => ch.repeat(counts.get(ch))).join("");
}
`,
  100: `function subarraySumCount(nums, k) {
  const seen = new Map([[0, 1]]);
  let total = 0;
  let count = 0;
  for (const x of nums) {
    total += x;
    count += seen.get(total - k) ?? 0;
    seen.set(total, (seen.get(total) ?? 0) + 1);
  }
  return count;
}
`,
  101: `function longestZeroSum(nums) {
  const first = new Map([[0, -1]]);
  let total = 0;
  let best = 0;
  nums.forEach((x, i) => {
    total += x;
    if (first.has(total)) best = Math.max(best, i - first.get(total));
    else first.set(total, i);
  });
  return best;
}
`,
  102: `function longestEqual01(nums) {
  const first = new Map([[0, -1]]);
  let total = 0;
  let best = 0;
  nums.forEach((x, i) => {
    total += x === 1 ? 1 : -1;
    if (first.has(total)) best = Math.max(best, i - first.get(total));
    else first.set(total, i);
  });
  return best;
}
`,
  103: `function pairsWithDifference(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  let pairs = 0;
  for (const [x, c] of counts) {
    if (k === 0 ? c >= 2 : counts.has(x + k)) pairs++;
  }
  return pairs;
}
`,
  104: `function pairsDivisibleByK(nums, k) {
  const seen = new Map();
  let count = 0;
  for (const x of nums) {
    const r = ((x % k) + k) % k;
    count += seen.get((k - r) % k) ?? 0;
    seen.set(r, (seen.get(r) ?? 0) + 1);
  }
  return count;
}
`,
  105: `function validSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const d = board[r][c];
      if (d === ".") continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r].has(d) || cols[c].has(d) || boxes[b].has(d)) return false;
      rows[r].add(d);
      cols[c].add(d);
      boxes[b].add(d);
    }
  }
  return true;
}
`,
  106: `function fourSumCount(a, b, c, d) {
  const sums = new Map();
  for (const x of a) for (const y of b) sums.set(x + y, (sums.get(x + y) ?? 0) + 1);
  let count = 0;
  for (const z of c) for (const w of d) count += sums.get(-(z + w)) ?? 0;
  return count;
}
`,
  107: `class MyHashMap {
  constructor() {
    this.buckets = Array.from({ length: 1000 }, () => []);
  }

  put(key, value) {
    const bucket = this.buckets[key % 1000];
    for (const pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value;
        return;
      }
    }
    bucket.push([key, value]);
  }

  get(key) {
    for (const pair of this.buckets[key % 1000]) if (pair[0] === key) return pair[1];
    return -1;
  }

  remove(key) {
    const bucket = this.buckets[key % 1000];
    const i = bucket.findIndex((pair) => pair[0] === key);
    if (i >= 0) bucket.splice(i, 1);
  }
}
`,
  108: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = new Map();
  }

  get(key) {
    if (!this.items.has(key)) return -1;
    const value = this.items.get(key);
    this.items.delete(key);
    this.items.set(key, value);
    return value;
  }

  put(key, value) {
    this.items.delete(key);
    this.items.set(key, value);
    if (this.items.size > this.capacity) this.items.delete(this.items.keys().next().value);
  }
}
`,
  109: `function groupShifted(words) {
  const groups = new Map();
  for (const w of words) {
    const gaps = [];
    for (let i = 1; i < w.length; i++) gaps.push((w.charCodeAt(i) - w.charCodeAt(i - 1) + 26) % 26);
    const key = gaps.join(",");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
`,
  110: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}
`,
};
