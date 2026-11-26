// JavaScript reference solutions for Practice: Arrays & matrices. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  56: `function findMinMax(nums) {
  let smallest = nums[0];
  let largest = nums[0];
  for (const x of nums) {
    if (x < smallest) smallest = x;
    if (x > largest) largest = x;
  }
  return [smallest, largest];
}
`,
  57: `function secondLargest(nums) {
  let first = null;
  let second = null;
  for (const x of nums) {
    if (first === null || x > first) {
      second = first;
      first = x;
    } else if (x !== first && (second === null || x > second)) {
      second = x;
    }
  }
  return second;
}
`,
  58: `function reverseInPlace(nums) {
  let i = 0;
  let j = nums.length - 1;
  while (i < j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
    i++;
    j--;
  }
}
`,
  59: `function isSorted(nums) {
  for (let i = 1; i < nums.length; i++) if (nums[i - 1] > nums[i]) return false;
  return true;
}
`,
  60: `function removeDuplicatesSorted(nums) {
  if (nums.length === 0) return 0;
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];
  }
  return k;
}
`,
  61: `function moveZeros(nums) {
  let w = 0;
  for (const x of nums) if (x !== 0) nums[w++] = x;
  while (w < nums.length) nums[w++] = 0;
}
`,
  62: `function rotateRight(nums, k) {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  const flip = (i, j) => {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
      j--;
    }
  };
  flip(0, n - 1);
  flip(0, k - 1);
  flip(k, n - 1);
}
`,
  63: `function missingNumber(nums) {
  const n = nums.length;
  let total = (n * (n + 1)) / 2;
  for (const x of nums) total -= x;
  return total;
}
`,
  64: `function singleNumber(nums) {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}
`,
  65: `function findDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return x;
    seen.add(x);
  }
}
`,
  66: `function mergeSorted(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
`,
  67: `function intersection(a, b) {
  const inA = new Set(a);
  const found = new Set();
  for (const x of b) if (inA.has(x)) found.add(x);
  return [...found];
}
`,
  68: `function union(a, b) {
  return [...new Set([...a, ...b])];
}
`,
  69: `function plusOne(digits) {
  const out = [...digits];
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < 9) {
      out[i]++;
      return out;
    }
    out[i] = 0;
  }
  return [1, ...out];
}
`,
  70: `function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}
`,
  71: `function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const p of prices) {
    cheapest = Math.min(cheapest, p);
    best = Math.max(best, p - cheapest);
  }
  return best;
}
`,
  72: `function maxProfitMany(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
  return total;
}
`,
  73: `function maxSubarray(nums) {
  let current = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}
`,
  74: `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}
`,
  75: `function majorityThird(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const out = [];
  for (const [x, c] of counts) if (c > Math.floor(nums.length / 3)) out.push(x);
  return out;
}
`,
  76: `function pascal(n) {
  const rows = [];
  for (let r = 0; r < n; r++) {
    const row = [1];
    for (let j = 1; j < r; j++) row.push(rows[r - 1][j - 1] + rows[r - 1][j]);
    if (r > 0) row.push(1);
    rows.push(row);
  }
  return rows;
}
`,
  77: `function transpose(matrix) {
  return matrix[0].map((_, c) => matrix.map((row) => row[c]));
}
`,
  78: `function rotateMatrix(matrix) {
  const n = matrix.length;
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
  }
  for (const row of matrix) row.reverse();
}
`,
  79: `function spiralOrder(matrix) {
  const out = [];
  if (matrix.length === 0) return out;
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}
`,
  80: `function setZeroes(matrix) {
  const rows = new Set();
  const cols = new Set();
  matrix.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) {
        rows.add(r);
        cols.add(c);
      }
    }),
  );
  matrix.forEach((row, r) => row.forEach((_, c) => {
    if (rows.has(r) || cols.has(c)) row[c] = 0;
  }));
}
`,
  81: `function leaders(nums) {
  const out = [];
  let biggest = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] > biggest) {
      out.push(nums[i]);
      biggest = nums[i];
    }
  }
  return out.reverse();
}
`,
  82: `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}
`,
  83: `function nextPermutation(nums) {
  let i = nums.length - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  if (i >= 0) {
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  let a = i + 1;
  let b = nums.length - 1;
  while (a < b) {
    [nums[a], nums[b]] = [nums[b], nums[a]];
    a++;
    b--;
  }
}
`,
  84: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;
    let length = 1;
    while (set.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}
`,
  85: `function trap(height) {
  const n = height.length;
  const left = new Array(n).fill(0);
  const right = new Array(n).fill(0);
  for (let i = 0; i < n; i++) left[i] = Math.max(height[i], i > 0 ? left[i - 1] : 0);
  for (let i = n - 1; i >= 0; i--) right[i] = Math.max(height[i], i + 1 < n ? right[i + 1] : 0);
  let water = 0;
  for (let i = 0; i < n; i++) water += Math.min(left[i], right[i]) - height[i];
  return water;
}
`,
};
