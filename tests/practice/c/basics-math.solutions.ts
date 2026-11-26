// C reference solutions for Practice: basics-math (the questions that fit C). Never shipped to students.
const file = (functions: string) => `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  2: file(`bool isEven(int n) {
    return n / 2 * 2 == n;
}
`),
  3: file(`int digitSum(int n) {
    int total = 0;
    while (n > 0) {
        total += n % 10;
        n /= 10;
    }
    return total;
}
`),
  4: file(`int reverseInt(int n) {
    int result = 0;
    while (n != 0) {
        result = result * 10 + n % 10;
        n /= 10;
    }
    return result;
}
`),
  5: file(`bool isPalindromeNumber(int n) {
    if (n < 0) return false;
    int reversed = 0;
    int rest = n;
    while (rest > 0) {
        reversed = reversed * 10 + rest % 10;
        rest /= 10;
    }
    return reversed == n;
}
`),
  6: file(`int countDigits(int n) {
    n = abs(n);
    if (n == 0) return 1;
    int count = 0;
    while (n > 0) {
        n /= 10;
        count++;
    }
    return count;
}
`),
  7: file(`int factorialIter(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}

int factorialRec(int n) {
    if (n <= 1) return 1;
    return n * factorialRec(n - 1);
}
`),
  8: file(`bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) return false;
    }
    return true;
}
`),
  10: file(`int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int lcm(int a, int b) {
    return a / gcd(a, b) * b;
}
`),
  11: file(`bool isArmstrong(int n) {
    int k = 0;
    for (int rest = n; rest > 0; rest /= 10) k++;
    int total = 0;
    for (int rest = n; rest > 0; rest /= 10) {
        int d = rest % 10;
        int p = 1;
        for (int i = 0; i < k; i++) p *= d;
        total += p;
    }
    return total == n;
}
`),
  12: file(`bool isPerfect(int n) {
    if (n < 2) return false;
    int total = 0;
    for (int d = 1; d < n; d++) {
        if (n % d == 0) total += d;
    }
    return total == n;
}
`),
  13: file(`long long fib(int n) {
    long long a = 0;
    long long b = 1;
    for (int i = 0; i < n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return a;
}
`),
  14: file(`bool isPowerOfTwo(int n) {
    if (n < 1) return false;
    while (n % 2 == 0) n /= 2;
    return n == 1;
}
`),
  16: file(`int fromBinary(char s[]) {
    int value = 0;
    for (int i = 0; s[i] != '\\0'; i++) value = value * 2 + (s[i] - '0');
    return value;
}
`),
  17: file(`int countOnes(int n) {
    int count = 0;
    while (n > 0) {
        count += n % 2;
        n /= 2;
    }
    return count;
}
`),
  18: file(`long long power(long long x, int n) {
    long long result = 1;
    while (n > 0) {
        if (n % 2 == 1) result *= x;
        x *= x;
        n /= 2;
    }
    return result;
}
`),
  19: file(`int intSqrt(int n) {
    long long low = 0;
    long long high = n;
    long long answer = 0;
    while (low <= high) {
        long long mid = (low + high) / 2;
        if (mid * mid <= n) {
            answer = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return answer;
}
`),
  20: file(`bool isLeap(int year) {
    if (year % 400 == 0) return true;
    if (year % 100 == 0) return false;
    return year % 4 == 0;
}
`),
  21: file(`int sumMultiples(int limit) {
    int total = 0;
    for (int i = 1; i < limit; i++) {
        if (i % 3 == 0 || i % 5 == 0) total += i;
    }
    return total;
}
`),
  23: file(`int value(char c) {
    switch (c) {
        case 'I': return 1;
        case 'V': return 5;
        case 'X': return 10;
        case 'L': return 50;
        case 'C': return 100;
        case 'D': return 500;
        default: return 1000;
    }
}

int fromRoman(char s[]) {
    int total = 0;
    int n = strlen(s);
    for (int i = 0; i < n; i++) {
        int v = value(s[i]);
        if (i + 1 < n && v < value(s[i + 1])) total -= v;
        else total += v;
    }
    return total;
}
`),
};
