// JavaScript reference solutions for Practice: Recursion & backtracking. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  191: `function printNumbers(n) {
  if (n === 0) return;
  printNumbers(n - 1);
  console.log(n);
}
`,
  192: `function arraySum(nums) {
  if (nums.length === 0) return 0;
  return nums[0] + arraySum(nums.slice(1));
}
`,
  193: `function reverseString(s) {
  if (s === "") return "";
  return reverseString(s.slice(1)) + s[0];
}
`,
  194: `function isPalindromeRec(s) {
  if (s.length <= 1) return true;
  if (s[0] !== s[s.length - 1]) return false;
  return isPalindromeRec(s.slice(1, -1));
}
`,
  195: `function power(x, n) {
  if (n === 0) return 1;
  const half = power(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}
`,
  196: `function countPaths(m, n) {
  const memo = new Map();
  const paths = (r, c) => {
    if (r === 0 || c === 0) return 1;
    const key = r + "," + c;
    if (!memo.has(key)) memo.set(key, paths(r - 1, c) + paths(r, c - 1));
    return memo.get(key);
  };
  return paths(m - 1, n - 1);
}
`,
  197: `function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;
  const paint = (r, c) => {
    if (r < 0 || c < 0 || r >= image.length || c >= image[0].length || image[r][c] !== old) return;
    image[r][c] = color;
    paint(r + 1, c);
    paint(r - 1, c);
    paint(r, c + 1);
    paint(r, c - 1);
  };
  paint(sr, sc);
  return image;
}
`,
  198: `function hanoi(n, source, target, spare) {
  if (n === 0) return;
  hanoi(n - 1, source, spare, target);
  console.log("Move disk", n, "from", source, "to", target);
  hanoi(n - 1, spare, target, source);
}
`,
  199: `function subsets(nums) {
  const out = [];
  const chosen = [];
  const backtrack = (i) => {
    if (i === nums.length) {
      out.push([...chosen]);
      return;
    }
    backtrack(i + 1);
    chosen.push(nums[i]);
    backtrack(i + 1);
    chosen.pop();
  };
  backtrack(0);
  return out;
}
`,
  200: `function subsetsWithDup(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  const out = [];
  const chosen = [];
  const backtrack = (start) => {
    out.push([...chosen]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      chosen.push(nums[i]);
      backtrack(i + 1);
      chosen.pop();
    }
  };
  backtrack(0);
  return out;
}
`,
  201: `function permutations(nums) {
  const out = [];
  const used = new Array(nums.length).fill(false);
  const chosen = [];
  const backtrack = () => {
    if (chosen.length === nums.length) {
      out.push([...chosen]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      chosen.push(nums[i]);
      backtrack();
      chosen.pop();
      used[i] = false;
    }
  };
  backtrack();
  return out;
}
`,
  202: `function uniquePermutations(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const out = [];
  const chosen = [];
  const backtrack = () => {
    if (chosen.length === nums.length) {
      out.push([...chosen]);
      return;
    }
    for (const [x, c] of counts) {
      if (c === 0) continue;
      counts.set(x, c - 1);
      chosen.push(x);
      backtrack();
      chosen.pop();
      counts.set(x, c);
    }
  };
  backtrack();
  return out;
}
`,
  203: `function combine(n, k) {
  const out = [];
  const chosen = [];
  const backtrack = (start) => {
    if (chosen.length === k) {
      out.push([...chosen]);
      return;
    }
    for (let x = start; x <= n; x++) {
      chosen.push(x);
      backtrack(x + 1);
      chosen.pop();
    }
  };
  backtrack(1);
  return out;
}
`,
  204: `function combinationSum(candidates, target) {
  const out = [];
  const chosen = [];
  const backtrack = (start, remaining) => {
    if (remaining === 0) {
      out.push([...chosen]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) continue;
      chosen.push(candidates[i]);
      backtrack(i, remaining - candidates[i]);
      chosen.pop();
    }
  };
  backtrack(0, target);
  return out;
}
`,
  205: `function combinationSumOnce(candidates, target) {
  const nums = candidates.slice().sort((a, b) => a - b);
  const out = [];
  const chosen = [];
  const backtrack = (start, remaining) => {
    if (remaining === 0) {
      out.push([...chosen]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      if (nums[i] > remaining) break;
      chosen.push(nums[i]);
      backtrack(i + 1, remaining - nums[i]);
      chosen.pop();
    }
  };
  backtrack(0, target);
  return out;
}
`,
  206: `function letterCombinations(digits) {
  const keys = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  if (digits === "") return [];
  const out = [];
  const backtrack = (i, text) => {
    if (i === digits.length) {
      out.push(text);
      return;
    }
    for (const ch of keys[digits[i]]) backtrack(i + 1, text + ch);
  };
  backtrack(0, "");
  return out;
}
`,
  207: `function generateParentheses(n) {
  const out = [];
  const backtrack = (text, opened, closed) => {
    if (text.length === 2 * n) {
      out.push(text);
      return;
    }
    if (opened < n) backtrack(text + "(", opened + 1, closed);
    if (closed < opened) backtrack(text + ")", opened, closed + 1);
  };
  backtrack("", 0, 0);
  return out;
}
`,
  208: `function palindromePartitions(s) {
  const out = [];
  const parts = [];
  const isPal = (t) => {
    for (let i = 0, j = t.length - 1; i < j; i++, j--) if (t[i] !== t[j]) return false;
    return true;
  };
  const backtrack = (start) => {
    if (start === s.length) {
      out.push([...parts]);
      return;
    }
    for (let end = start + 1; end <= s.length; end++) {
      const piece = s.slice(start, end);
      if (!isPal(piece)) continue;
      parts.push(piece);
      backtrack(end);
      parts.pop();
    }
  };
  backtrack(0);
  return out;
}
`,
  209: `function wordExists(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  const found = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    const saved = board[r][c];
    board[r][c] = "#";
    const ok = found(r + 1, c, i + 1) || found(r - 1, c, i + 1) || found(r, c + 1, i + 1) || found(r, c - 1, i + 1);
    board[r][c] = saved;
    return ok;
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (found(r, c, 0)) return true;
  return false;
}
`,
  210: `function ratPaths(maze) {
  const n = maze.length;
  const out = [];
  if (maze[0][0] === 0) return out;
  const seen = new Set(["0,0"]);
  const walk = (r, c, path) => {
    if (r === n - 1 && c === n - 1) {
      out.push(path);
      return;
    }
    for (const [letter, dr, dc] of [["D", 1, 0], ["L", 0, -1], ["R", 0, 1], ["U", -1, 0]]) {
      const a = r + dr;
      const b = c + dc;
      const key = a + "," + b;
      if (a >= 0 && a < n && b >= 0 && b < n && maze[a][b] === 1 && !seen.has(key)) {
        seen.add(key);
        walk(a, b, path + letter);
        seen.delete(key);
      }
    }
  };
  walk(0, 0, "");
  return out;
}
`,
  211: `function restoreIp(s) {
  const out = [];
  const parts = [];
  const backtrack = (start) => {
    if (parts.length === 4) {
      if (start === s.length) out.push(parts.join("."));
      return;
    }
    for (let size = 1; size <= 3; size++) {
      const piece = s.slice(start, start + size);
      if (piece.length < size) break;
      if ((piece[0] === "0" && size > 1) || Number(piece) > 255) continue;
      parts.push(piece);
      backtrack(start + size);
      parts.pop();
    }
  };
  backtrack(0);
  return out;
}
`,
  212: `function grayCode(n) {
  if (n === 0) return [0];
  const smaller = grayCode(n - 1);
  const top = 1 << (n - 1);
  return [...smaller, ...smaller.slice().reverse().map((x) => top + x)];
}
`,
  213: `function solveNQueens(n) {
  const out = [];
  const cols = new Set();
  const downs = new Set();
  const ups = new Set();
  const placed = [];
  const backtrack = (r) => {
    if (r === n) {
      out.push(placed.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || downs.has(r - c) || ups.has(r + c)) continue;
      cols.add(c);
      downs.add(r - c);
      ups.add(r + c);
      placed.push(c);
      backtrack(r + 1);
      placed.pop();
      cols.delete(c);
      downs.delete(r - c);
      ups.delete(r + c);
    }
  };
  backtrack(0);
  return out;
}
`,
  214: `function solveSudoku(board) {
  const allowed = (r, c, d) => {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === d || board[i][c] === d) return false;
      if (board[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === d) return false;
    }
    return true;
  };
  const solve = () => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== ".") continue;
        for (const d of "123456789") {
          if (!allowed(r, c, d)) continue;
          board[r][c] = d;
          if (solve()) return true;
          board[r][c] = ".";
        }
        return false;
      }
    }
    return true;
  };
  solve();
}
`,
  215: `function wordBreakAll(s, words) {
  const dict = new Set(words);
  const memo = new Map();
  const sentences = (start) => {
    if (start === s.length) return [""];
    if (memo.has(start)) return memo.get(start);
    const out = [];
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.slice(start, end);
      if (!dict.has(word)) continue;
      for (const rest of sentences(end)) out.push(rest ? word + " " + rest : word);
    }
    memo.set(start, out);
    return out;
  };
  return sentences(0);
}
`,
};
