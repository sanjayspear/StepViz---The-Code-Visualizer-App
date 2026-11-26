// C reference solutions for Practice: recursion-backtracking (the questions that fit C). Never shipped to students.
const file = (functions: string) => `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <ctype.h>

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  191: file(`void printNumbers(int n) {
    if (n == 0) return;
    printNumbers(n - 1);
    printf("%d\\n", n);
}
`),
  192: file(`int arraySum(int nums[], int n) {
    if (n == 0) return 0;
    return nums[n - 1] + arraySum(nums, n - 1);
}
`),
  194: file(`bool isPalBetween(char s[], int i, int j) {
    if (i >= j) return true;
    if (s[i] != s[j]) return false;
    return isPalBetween(s, i + 1, j - 1);
}

bool isPalindromeRec(char s[]) {
    return isPalBetween(s, 0, strlen(s) - 1);
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
    int ways[m][n];
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) ways[r][c] = (r == 0 || c == 0) ? 1 : ways[r - 1][c] + ways[r][c - 1];
    }
    return ways[m - 1][n - 1];
}
`),
  198: file(`void hanoi(int n, char source[], char target[], char spare[]) {
    if (n == 0) return;
    hanoi(n - 1, source, spare, target);
    printf("Move disk %d from %s to %s\\n", n, source, target);
    hanoi(n - 1, spare, target, source);
}
`),
};
