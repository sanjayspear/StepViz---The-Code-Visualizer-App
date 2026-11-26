// C reference solutions for Practice: stacks-queues (the questions that fit C). Never shipped to students.
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
  151: file(`bool isBalanced(char s[]) {
    char st[strlen(s) + 1];
    int top = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[top] = c;
            top++;
        } else if (c == ')' || c == ']' || c == '}') {
            char open = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || st[top - 1] != open) return false;
            top--;
        }
    }
    return top == 0;
}
`),
  159: file(`int evalPostfix(char expr[]) {
    int st[strlen(expr) + 1];
    int top = 0;
    int i = 0;
    while (expr[i] != '\\0') {
        if (expr[i] == ' ') {
            i++;
            continue;
        }
        bool number = isdigit(expr[i]) || (expr[i] == '-' && isdigit(expr[i + 1]));
        if (number) {
            int sign = 1;
            if (expr[i] == '-') {
                sign = -1;
                i++;
            }
            int v = 0;
            while (isdigit(expr[i])) {
                v = v * 10 + (expr[i] - '0');
                i++;
            }
            st[top] = sign * v;
            top++;
        } else {
            int b = st[top - 1];
            int a = st[top - 2];
            top -= 2;
            int r;
            if (expr[i] == '+') r = a + b;
            else if (expr[i] == '-') r = a - b;
            else if (expr[i] == '*') r = a * b;
            else r = a / b;
            st[top] = r;
            top++;
            i++;
        }
    }
    return st[top - 1];
}
`),
  168: file(`int largestRectangle(int heights[], int n) {
    int st[n + 1];
    int top = 0;
    int best = 0;
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (top > 0 && heights[st[top - 1]] > h) {
            int height = heights[st[top - 1]];
            top--;
            int left = top == 0 ? 0 : st[top - 1] + 1;
            if (height * (i - left) > best) best = height * (i - left);
        }
        st[top] = i;
        top++;
    }
    return best;
}
`),
  169: file(`int calculate(char s[]) {
    int st[2 * strlen(s) + 2];
    int top = 0;
    int result = 0;
    int sign = 1;
    int number = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (isdigit(c)) number = number * 10 + (c - '0');
        else if (c == '+' || c == '-') {
            result += sign * number;
            number = 0;
            sign = c == '+' ? 1 : -1;
        } else if (c == '(') {
            st[top] = result;
            st[top + 1] = sign;
            top += 2;
            result = 0;
            sign = 1;
        } else if (c == ')') {
            result += sign * number;
            number = 0;
            int oldSign = st[top - 1];
            int oldResult = st[top - 2];
            top -= 2;
            result = oldResult + oldSign * result;
        }
    }
    return result + sign * number;
}
`),
  170: file(`int longestValidParentheses(char s[]) {
    int st[strlen(s) + 2];
    int top = 0;
    st[top] = -1;
    top++;
    int best = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == '(') {
            st[top] = i;
            top++;
        } else {
            top--;
            if (top == 0) {
                st[top] = i;
                top++;
            } else if (i - st[top - 1] > best) {
                best = i - st[top - 1];
            }
        }
    }
    return best;
}
`),
};
