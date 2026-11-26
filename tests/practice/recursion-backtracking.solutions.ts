// Reference solutions for Practice: Recursion & backtracking (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  191: `def print_numbers(n):
    if n == 0:
        return
    print_numbers(n - 1)
    print(n)
`,
  192: `def array_sum(nums):
    if not nums:
        return 0
    return nums[0] + array_sum(nums[1:])
`,
  193: `def reverse_string(s):
    if s == "":
        return ""
    return reverse_string(s[1:]) + s[0]
`,
  194: `def is_palindrome_rec(s):
    if len(s) <= 1:
        return True
    if s[0] != s[-1]:
        return False
    return is_palindrome_rec(s[1:-1])
`,
  195: `def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    if n % 2 == 0:
        return half * half
    return half * half * x
`,
  196: `def count_paths(m, n):
    memo = {}
    def paths(r, c):
        if r == 0 or c == 0:
            return 1
        if (r, c) not in memo:
            memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)
        return memo[(r, c)]
    return paths(m - 1, n - 1)
`,
  197: `def flood_fill(image, sr, sc, color):
    old = image[sr][sc]
    if old == color:
        return image
    def paint(r, c):
        if r < 0 or c < 0 or r >= len(image) or c >= len(image[0]) or image[r][c] != old:
            return
        image[r][c] = color
        paint(r + 1, c)
        paint(r - 1, c)
        paint(r, c + 1)
        paint(r, c - 1)
    paint(sr, sc)
    return image
`,
  198: `def hanoi(n, source, target, spare):
    if n == 0:
        return
    hanoi(n - 1, source, spare, target)
    print("Move disk", n, "from", source, "to", target)
    hanoi(n - 1, spare, target, source)
`,
  199: `def subsets(nums):
    out = []
    def backtrack(i, chosen):
        if i == len(nums):
            out.append(chosen[:])
            return
        backtrack(i + 1, chosen)
        chosen.append(nums[i])
        backtrack(i + 1, chosen)
        chosen.pop()
    backtrack(0, [])
    return out
`,
  200: `def subsets_with_dup(nums):
    nums = sorted(nums)
    out = []
    def backtrack(start, chosen):
        out.append(chosen[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            chosen.append(nums[i])
            backtrack(i + 1, chosen)
            chosen.pop()
    backtrack(0, [])
    return out
`,
  201: `def permutations(nums):
    out = []
    used = [False] * len(nums)
    def backtrack(chosen):
        if len(chosen) == len(nums):
            out.append(chosen[:])
            return
        for i in range(len(nums)):
            if not used[i]:
                used[i] = True
                chosen.append(nums[i])
                backtrack(chosen)
                chosen.pop()
                used[i] = False
    backtrack([])
    return out
`,
  202: `def unique_permutations(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out = []
    def backtrack(chosen):
        if len(chosen) == len(nums):
            out.append(chosen[:])
            return
        for x in counts:
            if counts[x] > 0:
                counts[x] -= 1
                chosen.append(x)
                backtrack(chosen)
                chosen.pop()
                counts[x] += 1
    backtrack([])
    return out
`,
  203: `def combine(n, k):
    out = []
    def backtrack(start, chosen):
        if len(chosen) == k:
            out.append(chosen[:])
            return
        for x in range(start, n + 1):
            chosen.append(x)
            backtrack(x + 1, chosen)
            chosen.pop()
    backtrack(1, [])
    return out
`,
  204: `def combination_sum(candidates, target):
    out = []
    def backtrack(start, remaining, chosen):
        if remaining == 0:
            out.append(chosen[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] <= remaining:
                chosen.append(candidates[i])
                backtrack(i, remaining - candidates[i], chosen)
                chosen.pop()
    backtrack(0, target, [])
    return out
`,
  205: `def combination_sum_once(candidates, target):
    nums = sorted(candidates)
    out = []
    def backtrack(start, remaining, chosen):
        if remaining == 0:
            out.append(chosen[:])
            return
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            if nums[i] > remaining:
                break
            chosen.append(nums[i])
            backtrack(i + 1, remaining - nums[i], chosen)
            chosen.pop()
    backtrack(0, target, [])
    return out
`,
  206: `def letter_combinations(digits):
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    if not digits:
        return []
    out = []
    def backtrack(i, text):
        if i == len(digits):
            out.append(text)
            return
        for ch in keys[digits[i]]:
            backtrack(i + 1, text + ch)
    backtrack(0, "")
    return out
`,
  207: `def generate_parentheses(n):
    out = []
    def backtrack(text, opened, closed):
        if len(text) == 2 * n:
            out.append(text)
            return
        if opened < n:
            backtrack(text + "(", opened + 1, closed)
        if closed < opened:
            backtrack(text + ")", opened, closed + 1)
    backtrack("", 0, 0)
    return out
`,
  208: `def palindrome_partitions(s):
    out = []
    def backtrack(start, parts):
        if start == len(s):
            out.append(parts[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:
                parts.append(piece)
                backtrack(end, parts)
                parts.pop()
    backtrack(0, [])
    return out
`,
  209: `def word_exists(board, word):
    rows, cols = len(board), len(board[0])
    def found(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        saved = board[r][c]
        board[r][c] = "#"
        ok = found(r + 1, c, i + 1) or found(r - 1, c, i + 1) or found(r, c + 1, i + 1) or found(r, c - 1, i + 1)
        board[r][c] = saved
        return ok
    return any(found(r, c, 0) for r in range(rows) for c in range(cols))
`,
  210: `def rat_paths(maze):
    n = len(maze)
    out = []
    if maze[0][0] == 0:
        return out
    seen = {(0, 0)}
    def walk(r, c, path):
        if (r, c) == (n - 1, n - 1):
            out.append(path)
            return
        for letter, dr, dc in (("D", 1, 0), ("L", 0, -1), ("R", 0, 1), ("U", -1, 0)):
            a, b = r + dr, c + dc
            if 0 <= a < n and 0 <= b < n and maze[a][b] == 1 and (a, b) not in seen:
                seen.add((a, b))
                walk(a, b, path + letter)
                seen.remove((a, b))
    walk(0, 0, "")
    return out
`,
  211: `def restore_ip(s):
    out = []
    def backtrack(start, parts):
        if len(parts) == 4:
            if start == len(s):
                out.append(".".join(parts))
            return
        for size in (1, 2, 3):
            piece = s[start:start + size]
            if len(piece) < size:
                break
            if (piece[0] == "0" and size > 1) or int(piece) > 255:
                continue
            parts.append(piece)
            backtrack(start + size, parts)
            parts.pop()
    backtrack(0, [])
    return out
`,
  212: `def gray_code(n):
    if n == 0:
        return [0]
    smaller = gray_code(n - 1)
    top = 1 << (n - 1)
    return smaller + [top + x for x in reversed(smaller)]
`,
  213: `def solve_n_queens(n):
    out = []
    cols, downs, ups = set(), set(), set()
    placed = []
    def backtrack(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in placed])
            return
        for c in range(n):
            if c in cols or r - c in downs or r + c in ups:
                continue
            cols.add(c)
            downs.add(r - c)
            ups.add(r + c)
            placed.append(c)
            backtrack(r + 1)
            placed.pop()
            cols.remove(c)
            downs.remove(r - c)
            ups.remove(r + c)
    backtrack(0)
    return out
`,
  214: `def solve_sudoku(board):
    def allowed(r, c, d):
        for i in range(9):
            if board[r][i] == d or board[i][c] == d:
                return False
            if board[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == d:
                return False
        return True
    def solve():
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    for d in "123456789":
                        if allowed(r, c, d):
                            board[r][c] = d
                            if solve():
                                return True
                            board[r][c] = "."
                    return False
        return True
    solve()
`,
  215: `def word_break_all(s, words):
    words = set(words)
    memo = {}
    def sentences(start):
        if start == len(s):
            return [""]
        if start in memo:
            return memo[start]
        out = []
        for end in range(start + 1, len(s) + 1):
            word = s[start:end]
            if word in words:
                for rest in sentences(end):
                    out.append(word + (" " + rest if rest else ""))
        memo[start] = out
        return out
    return sentences(0)
`,
};
