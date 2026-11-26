// JavaScript reference solutions for Practice: Binary search. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  171: `function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
`,
  172: `function searchInsert(nums, target) {
  let low = 0;
  let high = nums.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low;
}
`,
  173: `function countOccurrences(nums, target) {
  const firstAtLeast = (x) => {
    let low = 0;
    let high = nums.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (nums[mid] < x) low = mid + 1;
      else high = mid;
    }
    return low;
  };
  return firstAtLeast(target + 1) - firstAtLeast(target);
}
`,
  174: `function floorSqrt(n) {
  let low = 0;
  let high = n;
  let answer = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (mid * mid <= n) {
      answer = mid;
      low = mid + 1;
    } else high = mid - 1;
  }
  return answer;
}
`,
  175: `function isPerfectSquare(n) {
  let low = 1;
  let high = n;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (mid * mid === n) return true;
    if (mid * mid < n) low = mid + 1;
    else high = mid - 1;
  }
  return false;
}
`,
  176: `function guessNumber(n, guess) {
  let low = 1;
  let high = n;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const r = guess(mid);
    if (r === 0) return mid;
    if (r < 0) high = mid - 1;
    else low = mid + 1;
  }
}
`,
  177: `function firstBadVersion(n, isBad) {
  let low = 1;
  let high = n;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (isBad(mid)) high = mid;
    else low = mid + 1;
  }
  return low;
}
`,
  178: `function nextLetter(letters, target) {
  let low = 0;
  let high = letters.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (letters[mid] <= target) low = mid + 1;
    else high = mid;
  }
  return letters[low % letters.length];
}
`,
  179: `function searchRange(nums, target) {
  const edge = (leftmost) => {
    let low = 0;
    let high = nums.length - 1;
    let found = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (nums[mid] === target) {
        found = mid;
        if (leftmost) high = mid - 1;
        else low = mid + 1;
      } else if (nums[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
    return found;
  };
  return [edge(true), edge(false)];
}
`,
  180: `function findPeak(nums) {
  let low = 0;
  let high = nums.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] < nums[mid + 1]) low = mid + 1;
    else high = mid;
  }
  return low;
}
`,
  181: `function searchRotated(nums, target) {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) high = mid - 1;
      else low = mid + 1;
    } else if (nums[mid] < target && target <= nums[high]) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
`,
  182: `function findMinRotated(nums) {
  let low = 0;
  let high = nums.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] > nums[high]) low = mid + 1;
    else high = mid;
  }
  return nums[low];
}
`,
  183: `function searchMatrix(matrix, target) {
  if (matrix.length === 0 || matrix[0].length === 0) return false;
  let r = 0;
  let c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    const v = matrix[r][c];
    if (v === target) return true;
    if (v > target) c--;
    else r++;
  }
  return false;
}
`,
  184: `function singleInSorted(nums) {
  let low = 0;
  let high = nums.length - 1;
  while (low < high) {
    let mid = Math.floor((low + high) / 2);
    if (mid % 2 === 1) mid--;
    if (nums[mid] === nums[mid + 1]) low = mid + 2;
    else high = mid;
  }
  return nums[low];
}
`,
  185: `function minEatingSpeed(piles, h) {
  let low = 1;
  let high = Math.max(...piles);
  while (low < high) {
    const k = Math.floor((low + high) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    if (hours <= h) high = k;
    else low = k + 1;
  }
  return low;
}
`,
  186: `function shipWithinDays(weights, days) {
  const daysNeeded = (cap) => {
    let count = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        count++;
        load = 0;
      }
      load += w;
    }
    return count;
  };
  let low = Math.max(...weights);
  let high = weights.reduce((a, b) => a + b, 0);
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (daysNeeded(mid) <= days) high = mid;
    else low = mid + 1;
  }
  return low;
}
`,
  187: `function kthSmallestMatrix(matrix, k) {
  const n = matrix.length;
  const countAtMost = (x) => {
    let r = n - 1;
    let c = 0;
    let count = 0;
    while (r >= 0 && c < n) {
      if (matrix[r][c] <= x) {
        count += r + 1;
        c++;
      } else r--;
    }
    return count;
  };
  let low = matrix[0][0];
  let high = matrix[n - 1][n - 1];
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (countAtMost(mid) >= k) high = mid;
    else low = mid + 1;
  }
  return low;
}
`,
  188: `function searchUnknown(reader, target) {
  let high = 1;
  while (reader.get(high) < target) high *= 2;
  let low = Math.floor(high / 2);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const v = reader.get(mid);
    if (v === target) return mid;
    if (v < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
`,
  189: `function splitArray(nums, k) {
  const runsNeeded = (limit) => {
    let runs = 1;
    let total = 0;
    for (const x of nums) {
      if (total + x > limit) {
        runs++;
        total = 0;
      }
      total += x;
    }
    return runs;
  };
  let low = Math.max(...nums);
  let high = nums.reduce((a, b) => a + b, 0);
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (runsNeeded(mid) <= k) high = mid;
    else low = mid + 1;
  }
  return low;
}
`,
  190: `function medianSorted(a, b) {
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length;
  const n = b.length;
  const half = Math.floor((m + n + 1) / 2);
  let low = 0;
  let high = m;
  while (low <= high) {
    const i = Math.floor((low + high) / 2);
    const j = half - i;
    const aLeft = i > 0 ? a[i - 1] : -Infinity;
    const aRight = i < m ? a[i] : Infinity;
    const bLeft = j > 0 ? b[j - 1] : -Infinity;
    const bRight = j < n ? b[j] : Infinity;
    if (aLeft <= bRight && bLeft <= aRight) {
      if ((m + n) % 2 === 1) return Math.max(aLeft, bLeft);
      return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;
    }
    if (aLeft > bRight) high = i - 1;
    else low = i + 1;
  }
}
`,
};
