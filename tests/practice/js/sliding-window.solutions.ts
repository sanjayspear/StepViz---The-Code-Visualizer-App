// JavaScript reference solutions for Practice: Sliding window. Never shipped to students.
const COUNT_WINDOW = `function windowMatches(text, word) {
  const need = new Map();
  for (const ch of word) need.set(ch, (need.get(ch) ?? 0) + 1);
  const window = new Map();
  const same = () => window.size === need.size && [...need].every(([ch, n]) => window.get(ch) === n);
  const starts = [];
  const m = word.length;
  for (let i = 0; i < text.length; i++) {
    window.set(text[i], (window.get(text[i]) ?? 0) + 1);
    if (i >= m) {
      const old = text[i - m];
      window.set(old, window.get(old) - 1);
      if (window.get(old) === 0) window.delete(old);
    }
    if (i >= m - 1 && same()) starts.push(i - m + 1);
  }
  return starts;
}
`;

export const SOLUTIONS: Record<number, string> = {
  131: `function maxSumK(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  let best = window;
  for (let i = k; i < nums.length; i++) {
    window += nums[i] - nums[i - k];
    best = Math.max(best, window);
  }
  return best;
}
`,
  132: `function windowAverages(nums, k) {
  const out = [];
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
    if (i >= k) total -= nums[i - k];
    if (i >= k - 1) out.push(total / k);
  }
  return out;
}
`,
  133: `function firstNegatives(nums, k) {
  const negs = [];
  let head = 0;
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) negs.push(i);
    if (head < negs.length && negs[head] <= i - k) head++;
    if (i >= k - 1) out.push(head < negs.length ? nums[negs[head]] : 0);
  }
  return out;
}
`,
  134: `function maxVowels(s, k) {
  const isVowel = (ch) => "aeiou".includes(ch);
  let count = 0;
  for (let i = 0; i < k; i++) if (isVowel(s[i])) count++;
  let best = count;
  for (let i = k; i < s.length; i++) {
    count += (isVowel(s[i]) ? 1 : 0) - (isVowel(s[i - k]) ? 1 : 0);
    best = Math.max(best, count);
  }
  return best;
}
`,
  135: `function longestUniqueSubstring(s) {
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  136: `function longestKDistinct(s, k) {
  const counts = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) ?? 0) + 1);
    while (counts.size > k) {
      counts.set(s[left], counts.get(s[left]) - 1);
      if (counts.get(s[left]) === 0) counts.delete(s[left]);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  137: `function characterReplacement(s, k) {
  const counts = new Map();
  let left = 0;
  let top = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) ?? 0) + 1);
    top = Math.max(top, counts.get(s[right]));
    while (right - left + 1 - top > k) {
      counts.set(s[left], counts.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  138: `function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) if (nums[left++] === 0) zeros--;
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  139: `function minSubarrayLen(target, nums) {
  let left = 0;
  let total = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
`,
  140: `function longestTwoValues(nums) {
  const counts = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1);
    while (counts.size > 2) {
      counts.set(nums[left], counts.get(nums[left]) - 1);
      if (counts.get(nums[left]) === 0) counts.delete(nums[left]);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
  141: `${COUNT_WINDOW}
function containsPermutation(p, s) {
  return windowMatches(s, p).length > 0;
}
`,
  142: `${COUNT_WINDOW}
function findAnagrams(text, pattern) {
  return windowMatches(text, pattern);
}
`,
  143: `function productsBelowK(nums, k) {
  if (k <= 1) return 0;
  let product = 1;
  let left = 0;
  let count = 0;
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right];
    while (product >= k) product /= nums[left++];
    count += right - left + 1;
  }
  return count;
}
`,
  144: `function longestAfterDelete(nums) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > 1) if (nums[left++] === 0) zeros--;
    best = Math.max(best, right - left + 1);
  }
  return best - 1;
}
`,
  145: `function maxCardPoints(cards, k) {
  const n = cards.length;
  const size = n - k;
  const total = cards.reduce((a, b) => a + b, 0);
  if (size === 0) return total;
  let window = 0;
  for (let i = 0; i < size; i++) window += cards[i];
  let smallest = window;
  for (let i = size; i < n; i++) {
    window += cards[i] - cards[i - size];
    smallest = Math.min(smallest, window);
  }
  return total - smallest;
}
`,
  146: `function minSwapsGroupOnes(data) {
  const m = data.reduce((a, b) => a + b, 0);
  if (m === 0) return 0;
  let window = 0;
  for (let i = 0; i < m; i++) window += data[i];
  let best = window;
  for (let i = m; i < data.length; i++) {
    window += data[i] - data[i - m];
    best = Math.max(best, window);
  }
  return m - best;
}
`,
  147: `${COUNT_WINDOW}
function countAnagramWindows(text, word) {
  return windowMatches(text, word).length;
}
`,
  148: `function exactlyKDistinct(nums, k) {
  const atMost = (limit) => {
    if (limit < 0) return 0;
    const counts = new Map();
    let left = 0;
    let total = 0;
    for (let right = 0; right < nums.length; right++) {
      counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1);
      while (counts.size > limit) {
        counts.set(nums[left], counts.get(nums[left]) - 1);
        if (counts.get(nums[left]) === 0) counts.delete(nums[left]);
        left++;
      }
      total += right - left + 1;
    }
    return total;
  };
  return atMost(k) - atMost(k - 1);
}
`,
  149: `function maxSlidingWindow(nums, k) {
  const window = [];
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    while (window.length && nums[window[window.length - 1]] <= nums[i]) window.pop();
    window.push(i);
    if (window[0] <= i - k) window.shift();
    if (i >= k - 1) out.push(nums[window[0]]);
  }
  return out;
}
`,
  150: `function longestWithKRepeats(s, k) {
  if (s.length < k) return 0;
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) < k) return Math.max(longestWithKRepeats(s.slice(0, i), k), longestWithKRepeats(s.slice(i + 1), k));
  }
  return s.length;
}
`,
};
