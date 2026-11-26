// C++ reference solutions for Practice: Basics & math. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  1: file(`vector<int> swapValues(int a, int b) {
    a = a + b;
    b = a - b;
    a = a - b;
    vector<int> out;
    out.push_back(a);
    out.push_back(b);
    return out;
}
`),
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
  9: file(`vector<int> primesUpTo(int n) {
    vector<int> out;
    if (n < 2) return out;
    vector<bool> crossed(n + 1, false);
    for (int p = 2; p * p <= n; p++) {
        if (!crossed[p]) {
            for (int m = p * p; m <= n; m += p) crossed[m] = true;
        }
    }
    for (int i = 2; i <= n; i++) {
        if (!crossed[i]) out.push_back(i);
    }
    return out;
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
  15: file(`string toBinary(int n) {
    if (n == 0) return "0";
    string out = "";
    while (n > 0) {
        out = char('0' + n % 2) + out;
        n /= 2;
    }
    return out;
}
`),
  16: file(`int fromBinary(string s) {
    int value = 0;
    for (char c : s) value = value * 2 + (c - '0');
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
  22: file(`string toRoman(int n) {
    vector<int> values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    vector<string> letters = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    string out = "";
    for (int i = 0; i < values.size(); i++) {
        while (n >= values[i]) {
            out += letters[i];
            n -= values[i];
        }
    }
    return out;
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

int fromRoman(string s) {
    int total = 0;
    for (int i = 0; i < s.size(); i++) {
        int v = value(s[i]);
        if (i + 1 < s.size() && v < value(s[i + 1])) total -= v;
        else total += v;
    }
    return total;
}
`),
  24: file(`string addStrings(string a, string b) {
    int i = a.size() - 1;
    int j = b.size() - 1;
    int carry = 0;
    string out = "";
    while (i >= 0 || j >= 0 || carry > 0) {
        int total = carry;
        if (i >= 0) total += a[i] - '0';
        if (j >= 0) total += b[j] - '0';
        out = char('0' + total % 10) + out;
        carry = total / 10;
        i--;
        j--;
    }
    return out;
}
`),
  25: file(`string multiplyStrings(string a, string b) {
    vector<int> places(a.size() + b.size(), 0);
    for (int i = a.size() - 1; i >= 0; i--) {
        for (int j = b.size() - 1; j >= 0; j--) {
            places[(a.size() - 1 - i) + (b.size() - 1 - j)] += (a[i] - '0') * (b[j] - '0');
        }
    }
    for (int k = 0; k + 1 < places.size(); k++) {
        places[k + 1] += places[k] / 10;
        places[k] %= 10;
    }
    int top = places.size() - 1;
    while (top > 0 && places[top] == 0) top--;
    string out = "";
    for (int k = top; k >= 0; k--) out += char('0' + places[k]);
    return out;
}
`),
};
