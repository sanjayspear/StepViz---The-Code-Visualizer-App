// C++ reference solutions for Practice: Recursion & backtracking. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  191: file(`void printNumbers(int n) {
    if (n == 0) return;
    printNumbers(n - 1);
    cout << n << endl;
}
`),
  192: file(`int sumFrom(vector<int>& nums, int i) {
    if (i == nums.size()) return 0;
    return nums[i] + sumFrom(nums, i + 1);
}

int arraySum(vector<int>& nums) {
    return sumFrom(nums, 0);
}
`),
  193: file(`string reverseString(string s) {
    if (s.size() <= 1) return s;
    return reverseString(s.substr(1)) + s[0];
}
`),
  194: file(`bool isPalindromeRec(string s) {
    if (s.size() <= 1) return true;
    if (s[0] != s[s.size() - 1]) return false;
    return isPalindromeRec(s.substr(1, s.size() - 2));
}
`),
  195: file(`long long power(long long x, int n) {
    if (n == 0) return 1;
    long long half = power(x, n / 2);
    if (n % 2 == 0) return half * half;
    return half * half * x;
}
`),
  196: file(`int countPaths(int m, int n) {
    vector<vector<int>> ways(m, vector<int>(n, 1));
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) ways[r][c] = ways[r - 1][c] + ways[r][c - 1];
    }
    return ways[m - 1][n - 1];
}
`),
  197: file(`void fill(vector<vector<int>>& image, int r, int c, int from, int to) {
    if (r < 0 || c < 0 || r >= image.size() || c >= image[0].size()) return;
    if (image[r][c] != from) return;
    image[r][c] = to;
    fill(image, r + 1, c, from, to);
    fill(image, r - 1, c, from, to);
    fill(image, r, c + 1, from, to);
    fill(image, r, c - 1, from, to);
}

vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color) {
    int from = image[sr][sc];
    if (from != color) fill(image, sr, sc, from, color);
    return image;
}
`),
  198: file(`void hanoi(int n, string source, string target, string spare) {
    if (n == 0) return;
    hanoi(n - 1, source, spare, target);
    cout << "Move disk " << n << " from " << source << " to " << target << endl;
    hanoi(n - 1, spare, target, source);
}
`),
  199: file(`void build(vector<int>& nums, int i, vector<int>& now, vector<vector<int>>& out) {
    if (i == nums.size()) {
        out.push_back(now);
        return;
    }
    build(nums, i + 1, now, out);
    now.push_back(nums[i]);
    build(nums, i + 1, now, out);
    now.pop_back();
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> out;
    vector<int> now;
    build(nums, 0, now, out);
    return out;
}
`),
  200: file(`void build(vector<int>& nums, int start, vector<int>& now, vector<vector<int>>& out) {
    out.push_back(now);
    for (int i = start; i < nums.size(); i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;
        now.push_back(nums[i]);
        build(nums, i + 1, now, out);
        now.pop_back();
    }
}

vector<vector<int>> subsetsWithDup(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    vector<int> now;
    build(nums, 0, now, out);
    return out;
}
`),
  201: file(`void build(vector<int>& nums, vector<int>& used, vector<int>& now, vector<vector<int>>& out) {
    if (now.size() == nums.size()) {
        out.push_back(now);
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if (used[i]) continue;
        used[i] = 1;
        now.push_back(nums[i]);
        build(nums, used, now, out);
        now.pop_back();
        used[i] = 0;
    }
}

vector<vector<int>> permutations(vector<int>& nums) {
    vector<vector<int>> out;
    vector<int> now;
    vector<int> used(nums.size(), 0);
    build(nums, used, now, out);
    return out;
}
`),
  202: file(`void build(vector<int>& nums, vector<int>& used, vector<int>& now, vector<vector<int>>& out) {
    if (now.size() == nums.size()) {
        out.push_back(now);
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if (used[i]) continue;
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
        used[i] = 1;
        now.push_back(nums[i]);
        build(nums, used, now, out);
        now.pop_back();
        used[i] = 0;
    }
}

vector<vector<int>> uniquePermutations(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    vector<int> now;
    vector<int> used(nums.size(), 0);
    build(nums, used, now, out);
    return out;
}
`),
  203: file(`void build(int n, int k, int start, vector<int>& now, vector<vector<int>>& out) {
    if (now.size() == k) {
        out.push_back(now);
        return;
    }
    for (int x = start; x <= n; x++) {
        now.push_back(x);
        build(n, k, x + 1, now, out);
        now.pop_back();
    }
}

vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> out;
    vector<int> now;
    build(n, k, 1, now, out);
    return out;
}
`),
  204: file(`void build(vector<int>& c, int start, int left, vector<int>& now, vector<vector<int>>& out) {
    if (left == 0) {
        out.push_back(now);
        return;
    }
    for (int i = start; i < c.size(); i++) {
        if (c[i] > left) continue;
        now.push_back(c[i]);
        build(c, i, left - c[i], now, out);
        now.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    vector<vector<int>> out;
    vector<int> now;
    build(candidates, 0, target, now, out);
    return out;
}
`),
  205: file(`void build(vector<int>& c, int start, int left, vector<int>& now, vector<vector<int>>& out) {
    if (left == 0) {
        out.push_back(now);
        return;
    }
    for (int i = start; i < c.size(); i++) {
        if (i > start && c[i] == c[i - 1]) continue;
        if (c[i] > left) break;
        now.push_back(c[i]);
        build(c, i + 1, left - c[i], now, out);
        now.pop_back();
    }
}

vector<vector<int>> combinationSumOnce(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> out;
    vector<int> now;
    build(candidates, 0, target, now, out);
    return out;
}
`),
  206: file(`void build(string& digits, int i, string now, vector<string>& keys, vector<string>& out) {
    if (i == digits.size()) {
        out.push_back(now);
        return;
    }
    string letters = keys[digits[i] - '0'];
    for (char c : letters) build(digits, i + 1, now + c, keys, out);
}

vector<string> letterCombinations(string digits) {
    vector<string> out;
    if (digits.empty()) return out;
    vector<string> keys = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    build(digits, 0, "", keys, out);
    return out;
}
`),
  207: file(`void build(int open, int close, string now, vector<string>& out) {
    if (open == 0 && close == 0) {
        out.push_back(now);
        return;
    }
    if (open > 0) build(open - 1, close, now + "(", out);
    if (close > open) build(open, close - 1, now + ")", out);
}

vector<string> generateParentheses(int n) {
    vector<string> out;
    build(n, n, "", out);
    return out;
}
`),
  208: file(`bool isPal(string& s, int i, int j) {
    while (i < j) {
        if (s[i] != s[j]) return false;
        i++;
        j--;
    }
    return true;
}

void build(string& s, int start, vector<string>& now, vector<vector<string>>& out) {
    if (start == s.size()) {
        out.push_back(now);
        return;
    }
    for (int end = start + 1; end <= s.size(); end++) {
        if (!isPal(s, start, end - 1)) continue;
        now.push_back(s.substr(start, end - start));
        build(s, end, now, out);
        now.pop_back();
    }
}

vector<vector<string>> palindromePartitions(string s) {
    vector<vector<string>> out;
    vector<string> now;
    build(s, 0, now, out);
    return out;
}
`),
  209: file(`bool walk(vector<vector<char>>& board, string& word, int r, int c, int i) {
    if (i == word.size()) return true;
    if (r < 0 || c < 0 || r >= board.size() || c >= board[0].size()) return false;
    if (board[r][c] != word[i]) return false;
    char keep = board[r][c];
    board[r][c] = '#';
    bool found = walk(board, word, r + 1, c, i + 1) || walk(board, word, r - 1, c, i + 1) || walk(board, word, r, c + 1, i + 1) || walk(board, word, r, c - 1, i + 1);
    board[r][c] = keep;
    return found;
}

bool wordExists(vector<vector<char>>& board, string word) {
    for (int r = 0; r < board.size(); r++) {
        for (int c = 0; c < board[0].size(); c++) {
            if (walk(board, word, r, c, 0)) return true;
        }
    }
    return false;
}
`),
  210: file(`void walk(vector<vector<int>>& maze, int r, int c, string path, vector<string>& out) {
    int n = maze.size();
    if (r < 0 || c < 0 || r >= n || c >= n || maze[r][c] != 1) return;
    if (r == n - 1 && c == n - 1) {
        out.push_back(path);
        return;
    }
    maze[r][c] = 2;
    walk(maze, r + 1, c, path + "D", out);
    walk(maze, r, c - 1, path + "L", out);
    walk(maze, r, c + 1, path + "R", out);
    walk(maze, r - 1, c, path + "U", out);
    maze[r][c] = 1;
}

vector<string> ratPaths(vector<vector<int>>& maze) {
    vector<string> out;
    walk(maze, 0, 0, "", out);
    return out;
}
`),
  211: file(`bool validPart(string p) {
    if (p.empty() || p.size() > 3) return false;
    if (p.size() > 1 && p[0] == '0') return false;
    return stoi(p) <= 255;
}

void build(string& s, int start, int parts, string now, vector<string>& out) {
    if (parts == 4) {
        if (start == s.size()) out.push_back(now);
        return;
    }
    for (int len = 1; len <= 3 && start + len <= s.size(); len++) {
        string p = s.substr(start, len);
        if (!validPart(p)) continue;
        build(s, start + len, parts + 1, parts == 0 ? p : now + "." + p, out);
    }
}

vector<string> restoreIp(string s) {
    vector<string> out;
    build(s, 0, 0, "", out);
    return out;
}
`),
  212: file(`vector<int> grayCode(int n) {
    if (n == 0) {
        vector<int> base = {0};
        return base;
    }
    vector<int> out = grayCode(n - 1);
    for (int i = out.size() - 1; i >= 0; i--) out.push_back(out[i] + (1 << (n - 1)));
    return out;
}
`),
  213: file(`bool safe(vector<string>& board, int r, int c) {
    int n = board.size();
    for (int i = 0; i < r; i++) {
        if (board[i][c] == 'Q') return false;
        int d = r - i;
        if (c - d >= 0 && board[i][c - d] == 'Q') return false;
        if (c + d < n && board[i][c + d] == 'Q') return false;
    }
    return true;
}

void place(vector<string>& board, int r, vector<vector<string>>& out) {
    if (r == board.size()) {
        out.push_back(board);
        return;
    }
    for (int c = 0; c < board.size(); c++) {
        if (!safe(board, r, c)) continue;
        board[r][c] = 'Q';
        place(board, r + 1, out);
        board[r][c] = '.';
    }
}

vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> out;
    vector<string> board(n, string(n, '.'));
    place(board, 0, out);
    return out;
}
`),
  214: file(`bool fits(vector<vector<char>>& board, int r, int c, char d) {
    for (int i = 0; i < 9; i++) {
        if (board[r][i] == d || board[i][c] == d) return false;
        if (board[r / 3 * 3 + i / 3][c / 3 * 3 + i % 3] == d) return false;
    }
    return true;
}

bool solve(vector<vector<char>>& board) {
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] != '.') continue;
            for (char d = '1'; d <= '9'; d++) {
                if (!fits(board, r, c, d)) continue;
                board[r][c] = d;
                if (solve(board)) return true;
                board[r][c] = '.';
            }
            return false;
        }
    }
    return true;
}

void solveSudoku(vector<vector<char>>& board) {
    solve(board);
}
`),
  215: file(`vector<string> from(string& s, int start, vector<string>& words, vector<vector<string>>& memo, vector<int>& done) {
    if (done[start]) return memo[start];
    vector<string> out;
    if (start == s.size()) {
        out.push_back("");
    } else {
        for (string w : words) {
            if (s.substr(start, w.size()) != w) continue;
            vector<string> rest = from(s, start + w.size(), words, memo, done);
            for (string r : rest) out.push_back(r.empty() ? w : w + " " + r);
        }
    }
    memo[start] = out;
    done[start] = 1;
    return out;
}

vector<string> wordBreakAll(string s, vector<string> words) {
    vector<vector<string>> memo(s.size() + 1);
    vector<int> done(s.size() + 1, 0);
    return from(s, 0, words, memo, done);
}
`),
};
