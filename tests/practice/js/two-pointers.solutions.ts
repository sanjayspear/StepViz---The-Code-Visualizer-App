// JavaScript reference solutions for Practice: Two pointers. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  111: `function twoSumSorted(nums, target) {
  let i = 0;
  let j = nums.length - 1;
  while (i < j) {
    const s = nums[i] + nums[j];
    if (s === target) return [i, j];
    if (s < target) i++;
    else j--;
  }
  return [];
}
`,
  112: `function reverseVowels(s) {
  const chars = [...s];
  const vowels = "aeiouAEIOU";
  let i = 0;
  let j = chars.length - 1;
  while (i < j) {
    if (!vowels.includes(chars[i])) i++;
    else if (!vowels.includes(chars[j])) j--;
    else {
      [chars[i], chars[j]] = [chars[j], chars[i]];
      i++;
      j--;
    }
  }
  return chars.join("");
}
`,
  113: `function removeElement(nums, val) {
  let k = 0;
  for (const x of nums) if (x !== val) nums[k++] = x;
  return k;
}
`,
  114: `function sortedSquares(nums) {
  const n = nums.length;
  const out = new Array(n).fill(0);
  let i = 0;
  let j = n - 1;
  for (let w = n - 1; w >= 0; w--) {
    if (Math.abs(nums[i]) > Math.abs(nums[j])) out[w] = nums[i] * nums[i++];
    else out[w] = nums[j] * nums[j--];
  }
  return out;
}
`,
  115: `function mergeInto(a, m, b, n) {
  let i = m - 1;
  let j = n - 1;
  let w = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && a[i] > b[j]) a[w--] = a[i--];
    else a[w--] = b[j--];
  }
}
`,
  116: `function negativesFirst(nums) {
  let k = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) {
      [nums[i], nums[k]] = [nums[k], nums[i]];
      k++;
    }
  }
}
`,
  117: `function backspaceCompare(s, t) {
  const real = (text) => {
    const out = [];
    for (const ch of text) {
      if (ch === "#") out.pop();
      else out.push(ch);
    }
    return out.join("");
  };
  return real(s) === real(t);
}
`,
  118: `function palindromeAfterOneDelete(s) {
  const isPal = (i, j) => {
    while (i < j) if (s[i++] !== s[j--]) return false;
    return true;
  };
  let i = 0;
  let j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return isPal(i + 1, j) || isPal(i, j - 1);
    i++;
    j--;
  }
  return true;
}
`,
  119: `function hasPairWithDifference(nums, k) {
  let i = 0;
  let j = 1;
  while (j < nums.length) {
    if (i === j) {
      j++;
      continue;
    }
    const d = nums[j] - nums[i];
    if (d === k) return true;
    if (d < k) j++;
    else i++;
  }
  return false;
}
`,
  120: `function maxArea(height) {
  let i = 0;
  let j = height.length - 1;
  let best = 0;
  while (i < j) {
    best = Math.max(best, (j - i) * Math.min(height[i], height[j]));
    if (height[i] < height[j]) i++;
    else j--;
  }
  return best;
}
`,
  121: `function threeSum(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let lo = i + 1;
    let hi = nums.length - 1;
    while (lo < hi) {
      const s = nums[i] + nums[lo] + nums[hi];
      if (s < 0) lo++;
      else if (s > 0) hi--;
      else {
        out.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
        lo++;
        hi--;
      }
    }
  }
  return out;
}
`,
  122: `function threeSumClosest(nums, target) {
  nums = nums.slice().sort((a, b) => a - b);
  let best = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    let lo = i + 1;
    let hi = nums.length - 1;
    while (lo < hi) {
      const s = nums[i] + nums[lo] + nums[hi];
      if (Math.abs(s - target) < Math.abs(best - target)) best = s;
      if (s < target) lo++;
      else if (s > target) hi--;
      else return s;
    }
  }
  return best;
}
`,
  123: `function fourSum(nums, target) {
  nums = nums.slice().sort((a, b) => a - b);
  const out = [];
  const n = nums.length;
  for (let a = 0; a < n; a++) {
    if (a > 0 && nums[a] === nums[a - 1]) continue;
    for (let b = a + 1; b < n; b++) {
      if (b > a + 1 && nums[b] === nums[b - 1]) continue;
      let lo = b + 1;
      let hi = n - 1;
      while (lo < hi) {
        const s = nums[a] + nums[b] + nums[lo] + nums[hi];
        if (s < target) lo++;
        else if (s > target) hi--;
        else {
          out.push([nums[a], nums[b], nums[lo], nums[hi]]);
          while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
          lo++;
          hi--;
        }
      }
    }
  }
  return out;
}
`,
  124: `function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) mid++;
    else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}
`,
  125: `function removeExtraDuplicates(nums) {
  let k = 0;
  for (const x of nums) {
    if (k < 2 || x !== nums[k - 2]) nums[k++] = x;
  }
  return k;
}
`,
  126: `function countPairsBelow(nums, target) {
  let i = 0;
  let j = nums.length - 1;
  let count = 0;
  while (i < j) {
    if (nums[i] + nums[j] < target) {
      count += j - i;
      i++;
    } else j--;
  }
  return count;
}
`,
  127: `function numBoats(people, limit) {
  people = people.slice().sort((a, b) => a - b);
  let i = 0;
  let j = people.length - 1;
  let boats = 0;
  while (i <= j) {
    if (people[i] + people[j] <= limit) i++;
    j--;
    boats++;
  }
  return boats;
}
`,
  128: `function shortestUnsorted(nums) {
  const n = nums.length;
  let end = -1;
  let start = 0;
  let biggest = -Infinity;
  for (let i = 0; i < n; i++) {
    if (nums[i] < biggest) end = i;
    else biggest = nums[i];
  }
  let smallest = Infinity;
  for (let i = n - 1; i >= 0; i--) {
    if (nums[i] > smallest) start = i;
    else smallest = nums[i];
  }
  return end === -1 ? 0 : end - start + 1;
}
`,
  129: `function smallestDifference(a, b) {
  let i = 0;
  let j = 0;
  let best = Infinity;
  while (i < a.length && j < b.length) {
    best = Math.min(best, Math.abs(a[i] - b[j]));
    if (a[i] < b[j]) i++;
    else j++;
  }
  return best;
}
`,
  130: `function triangleCount(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  let count = 0;
  for (let k = nums.length - 1; k > 1; k--) {
    let lo = 0;
    let hi = k - 1;
    while (lo < hi) {
      if (nums[lo] + nums[hi] > nums[k]) {
        count += hi - lo;
        hi--;
      } else lo++;
    }
  }
  return count;
}
`,
};
