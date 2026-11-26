// Java reference solutions for Practice: Recursion & backtracking. Never shipped to students.
const main = (methods: string) => `import java.util.*;

public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  191: main(`    static void printNumbers(int n) {
        if (n == 0) return;
        printNumbers(n - 1);
        System.out.println(n);
    }
`),
  192: main(`    static int arraySum(int[] nums) {
        return sumFrom(nums, 0);
    }

    static int sumFrom(int[] nums, int i) {
        if (i == nums.length) return 0;
        return nums[i] + sumFrom(nums, i + 1);
    }
`),
  193: main(`    static String reverseString(String s) {
        if (s.isEmpty()) return "";
        return reverseString(s.substring(1)) + s.charAt(0);
    }
`),
  194: main(`    static boolean isPalindromeRec(String s) {
        if (s.length() <= 1) return true;
        if (s.charAt(0) != s.charAt(s.length() - 1)) return false;
        return isPalindromeRec(s.substring(1, s.length() - 1));
    }
`),
  195: main(`    static long power(long x, int n) {
        if (n == 0) return 1;
        long half = power(x, n / 2);
        if (n % 2 == 0) return half * half;
        return half * half * x;
    }
`),
  196: main(`    static int paths(int r, int c, int[][] memo) {
        if (r == 0 || c == 0) return 1;
        if (memo[r][c] == 0) memo[r][c] = paths(r - 1, c, memo) + paths(r, c - 1, memo);
        return memo[r][c];
    }

    static int countPaths(int m, int n) {
        return paths(m - 1, n - 1, new int[m][n]);
    }
`),
  197: main(`    static void paint(int[][] image, int r, int c, int old, int color) {
        if (r < 0 || c < 0 || r >= image.length || c >= image[0].length || image[r][c] != old) return;
        image[r][c] = color;
        paint(image, r + 1, c, old, color);
        paint(image, r - 1, c, old, color);
        paint(image, r, c + 1, old, color);
        paint(image, r, c - 1, old, color);
    }

    static int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int old = image[sr][sc];
        if (old != color) paint(image, sr, sc, old, color);
        return image;
    }
`),
  198: main(`    static void hanoi(int n, String source, String target, String spare) {
        if (n == 0) return;
        hanoi(n - 1, source, spare, target);
        System.out.println("Move disk " + n + " from " + source + " to " + target);
        hanoi(n - 1, spare, target, source);
    }
`),
  199: main(`    static void build(int[] nums, int i, List<Integer> chosen, List<List<Integer>> out) {
        if (i == nums.length) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        build(nums, i + 1, chosen, out);
        chosen.add(nums[i]);
        build(nums, i + 1, chosen, out);
        chosen.remove(chosen.size() - 1);
    }

    static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        build(nums, 0, new ArrayList<>(), out);
        return out;
    }
`),
  200: main(`    static void build(int[] nums, int start, List<Integer> chosen, List<List<Integer>> out) {
        out.add(new ArrayList<>(chosen));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            chosen.add(nums[i]);
            build(nums, i + 1, chosen, out);
            chosen.remove(chosen.size() - 1);
        }
    }

    static List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        build(nums, 0, new ArrayList<>(), out);
        return out;
    }
`),
  201: main(`    static void build(int[] nums, boolean[] used, List<Integer> chosen, List<List<Integer>> out) {
        if (chosen.size() == nums.length) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            chosen.add(nums[i]);
            build(nums, used, chosen, out);
            chosen.remove(chosen.size() - 1);
            used[i] = false;
        }
    }

    static List<List<Integer>> permutations(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        build(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
`),
  202: main(`    static void build(int[] nums, boolean[] used, List<Integer> chosen, List<List<Integer>> out) {
        if (chosen.size() == nums.length) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            chosen.add(nums[i]);
            build(nums, used, chosen, out);
            chosen.remove(chosen.size() - 1);
            used[i] = false;
        }
    }

    static List<List<Integer>> uniquePermutations(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        build(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
`),
  203: main(`    static void build(int n, int k, int start, List<Integer> chosen, List<List<Integer>> out) {
        if (chosen.size() == k) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        for (int x = start; x <= n; x++) {
            chosen.add(x);
            build(n, k, x + 1, chosen, out);
            chosen.remove(chosen.size() - 1);
        }
    }

    static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        build(n, k, 1, new ArrayList<>(), out);
        return out;
    }
`),
  204: main(`    static void build(int[] c, int start, int remaining, List<Integer> chosen, List<List<Integer>> out) {
        if (remaining == 0) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        for (int i = start; i < c.length; i++) {
            if (c[i] > remaining) continue;
            chosen.add(c[i]);
            build(c, i, remaining - c[i], chosen, out);
            chosen.remove(chosen.size() - 1);
        }
    }

    static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> out = new ArrayList<>();
        build(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }
`),
  205: main(`    static void build(int[] c, int start, int remaining, List<Integer> chosen, List<List<Integer>> out) {
        if (remaining == 0) {
            out.add(new ArrayList<>(chosen));
            return;
        }
        for (int i = start; i < c.length; i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            if (c[i] > remaining) break;
            chosen.add(c[i]);
            build(c, i + 1, remaining - c[i], chosen, out);
            chosen.remove(chosen.size() - 1);
        }
    }

    static List<List<Integer>> combinationSumOnce(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> out = new ArrayList<>();
        build(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }
`),
  206: main(`    static String[] KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    static void build(String digits, int i, String text, List<String> out) {
        if (i == digits.length()) {
            out.add(text);
            return;
        }
        String letters = KEYS[digits.charAt(i) - '0'];
        for (int k = 0; k < letters.length(); k++) build(digits, i + 1, text + letters.charAt(k), out);
    }

    static List<String> letterCombinations(String digits) {
        List<String> out = new ArrayList<>();
        if (!digits.isEmpty()) build(digits, 0, "", out);
        return out;
    }
`),
  207: main(`    static void build(int n, String text, int opened, int closed, List<String> out) {
        if (text.length() == 2 * n) {
            out.add(text);
            return;
        }
        if (opened < n) build(n, text + "(", opened + 1, closed, out);
        if (closed < opened) build(n, text + ")", opened, closed + 1, out);
    }

    static List<String> generateParentheses(int n) {
        List<String> out = new ArrayList<>();
        build(n, "", 0, 0, out);
        return out;
    }
`),
  208: main(`    static boolean isPal(String t) {
        for (int i = 0, j = t.length() - 1; i < j; i++, j--) {
            if (t.charAt(i) != t.charAt(j)) return false;
        }
        return true;
    }

    static void build(String s, int start, List<String> parts, List<List<String>> out) {
        if (start == s.length()) {
            out.add(new ArrayList<>(parts));
            return;
        }
        for (int end = start + 1; end <= s.length(); end++) {
            String piece = s.substring(start, end);
            if (!isPal(piece)) continue;
            parts.add(piece);
            build(s, end, parts, out);
            parts.remove(parts.size() - 1);
        }
    }

    static List<List<String>> palindromePartitions(String s) {
        List<List<String>> out = new ArrayList<>();
        build(s, 0, new ArrayList<>(), out);
        return out;
    }
`),
  209: main(`    static boolean found(char[][] board, String word, int r, int c, int i) {
        if (i == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != word.charAt(i)) return false;
        char saved = board[r][c];
        board[r][c] = '#';
        boolean ok = found(board, word, r + 1, c, i + 1) || found(board, word, r - 1, c, i + 1)
            || found(board, word, r, c + 1, i + 1) || found(board, word, r, c - 1, i + 1);
        board[r][c] = saved;
        return ok;
    }

    static boolean wordExists(char[][] board, String word) {
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                if (found(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }
`),
  210: main(`    static void walk(int[][] maze, boolean[][] seen, int r, int c, String path, List<String> out) {
        int n = maze.length;
        if (r == n - 1 && c == n - 1) {
            out.add(path);
            return;
        }
        int[] dr = {1, 0, 0, -1};
        int[] dc = {0, -1, 1, 0};
        String letters = "DLRU";
        for (int k = 0; k < 4; k++) {
            int a = r + dr[k];
            int b = c + dc[k];
            if (a >= 0 && a < n && b >= 0 && b < n && maze[a][b] == 1 && !seen[a][b]) {
                seen[a][b] = true;
                walk(maze, seen, a, b, path + letters.charAt(k), out);
                seen[a][b] = false;
            }
        }
    }

    static List<String> ratPaths(int[][] maze) {
        List<String> out = new ArrayList<>();
        int n = maze.length;
        if (maze[0][0] == 0) return out;
        boolean[][] seen = new boolean[n][n];
        seen[0][0] = true;
        walk(maze, seen, 0, 0, "", out);
        return out;
    }
`),
  211: main(`    static void build(String s, int start, List<String> parts, List<String> out) {
        if (parts.size() == 4) {
            if (start == s.length()) out.add(String.join(".", parts));
            return;
        }
        for (int size = 1; size <= 3; size++) {
            if (start + size > s.length()) break;
            String piece = s.substring(start, start + size);
            if ((piece.charAt(0) == '0' && size > 1) || Integer.parseInt(piece) > 255) continue;
            parts.add(piece);
            build(s, start + size, parts, out);
            parts.remove(parts.size() - 1);
        }
    }

    static List<String> restoreIp(String s) {
        List<String> out = new ArrayList<>();
        build(s, 0, new ArrayList<>(), out);
        return out;
    }
`),
  212: main(`    static List<Integer> grayCode(int n) {
        List<Integer> out = new ArrayList<>();
        if (n == 0) {
            out.add(0);
            return out;
        }
        List<Integer> smaller = grayCode(n - 1);
        int top = 1 << (n - 1);
        out.addAll(smaller);
        for (int i = smaller.size() - 1; i >= 0; i--) out.add(top + smaller.get(i));
        return out;
    }
`),
  213: main(`    static void place(int n, int r, int[] cols, List<List<String>> out) {
        if (r == n) {
            List<String> board = new ArrayList<>();
            for (int c : cols) {
                String row = "";
                for (int k = 0; k < n; k++) row += k == c ? "Q" : ".";
                board.add(row);
            }
            out.add(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            boolean ok = true;
            for (int q = 0; q < r; q++) {
                if (cols[q] == c || Math.abs(cols[q] - c) == r - q) {
                    ok = false;
                    break;
                }
            }
            if (!ok) continue;
            cols[r] = c;
            place(n, r + 1, cols, out);
        }
    }

    static List<List<String>> solveNQueens(int n) {
        List<List<String>> out = new ArrayList<>();
        place(n, 0, new int[n], out);
        return out;
    }
`),
  214: main(`    static boolean allowed(char[][] board, int r, int c, char d) {
        for (int i = 0; i < 9; i++) {
            if (board[r][i] == d || board[i][c] == d) return false;
            if (board[3 * (r / 3) + i / 3][3 * (c / 3) + i % 3] == d) return false;
        }
        return true;
    }

    static boolean solve(char[][] board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != '.') continue;
                for (char d = '1'; d <= '9'; d++) {
                    if (!allowed(board, r, c, d)) continue;
                    board[r][c] = d;
                    if (solve(board)) return true;
                    board[r][c] = '.';
                }
                return false;
            }
        }
        return true;
    }

    static void solveSudoku(char[][] board) {
        solve(board);
    }
`),
  215: main(`    static List<String> sentences(String s, int start, Set<String> dict, Map<Integer, List<String>> memo) {
        if (memo.containsKey(start)) return memo.get(start);
        List<String> out = new ArrayList<>();
        if (start == s.length()) {
            out.add("");
            return out;
        }
        for (int end = start + 1; end <= s.length(); end++) {
            String word = s.substring(start, end);
            if (!dict.contains(word)) continue;
            for (String rest : sentences(s, end, dict, memo)) out.add(rest.isEmpty() ? word : word + " " + rest);
        }
        memo.put(start, out);
        return out;
    }

    static List<String> wordBreakAll(String s, String[] words) {
        Set<String> dict = new HashSet<>();
        for (String w : words) dict.add(w);
        return sentences(s, 0, dict, new HashMap<>());
    }
`),
};
