// Java reference solutions for Practice: Basics & math. Never shipped to students.
const main = (methods: string, imports = '') => `${imports ? `${imports}\n\n` : ''}public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  1: main(`    static int[] swap(int a, int b) {
        a = a + b;
        b = a - b;
        a = a - b;
        return new int[] {a, b};
    }
`),
  2: main(`    static boolean isEven(int n) {
        return n / 2 * 2 == n;
    }
`),
  3: main(`    static int digitSum(int n) {
        int total = 0;
        while (n > 0) {
            total += n % 10;
            n /= 10;
        }
        return total;
    }
`),
  4: main(`    static int reverseInt(int n) {
        int result = 0;
        while (n != 0) {
            result = result * 10 + n % 10;
            n /= 10;
        }
        return result;
    }
`),
  5: main(`    static boolean isPalindromeNumber(int n) {
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
  6: main(`    static int countDigits(int n) {
        n = Math.abs(n);
        if (n == 0) return 1;
        int count = 0;
        while (n > 0) {
            n /= 10;
            count++;
        }
        return count;
    }
`),
  7: main(`    static int factorialIter(int n) {
        int result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }

    static int factorialRec(int n) {
        if (n <= 1) return 1;
        return n * factorialRec(n - 1);
    }
`),
  8: main(`    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;
        }
        return true;
    }
`),
  9: main(
    `    static List<Integer> primesUpTo(int n) {
        List<Integer> out = new ArrayList<>();
        if (n < 2) return out;
        boolean[] crossed = new boolean[n + 1];
        for (int p = 2; p * p <= n; p++) {
            if (!crossed[p]) {
                for (int m = p * p; m <= n; m += p) crossed[m] = true;
            }
        }
        for (int i = 2; i <= n; i++) {
            if (!crossed[i]) out.add(i);
        }
        return out;
    }
`,
    'import java.util.*;',
  ),
  10: main(`    static int gcd(int a, int b) {
        while (b != 0) {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    static int lcm(int a, int b) {
        return a / gcd(a, b) * b;
    }
`),
  11: main(`    static boolean isArmstrong(int n) {
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
  12: main(`    static boolean isPerfect(int n) {
        if (n < 2) return false;
        int total = 0;
        for (int d = 1; d < n; d++) {
            if (n % d == 0) total += d;
        }
        return total == n;
    }
`),
  13: main(`    static long fib(int n) {
        long a = 0;
        long b = 1;
        for (int i = 0; i < n; i++) {
            long next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
`),
  14: main(`    static boolean isPowerOfTwo(int n) {
        if (n < 1) return false;
        while (n % 2 == 0) n /= 2;
        return n == 1;
    }
`),
  15: main(`    static String toBinary(int n) {
        if (n == 0) return "0";
        String out = "";
        while (n > 0) {
            out = (n % 2) + out;
            n /= 2;
        }
        return out;
    }
`),
  16: main(`    static int fromBinary(String s) {
        int value = 0;
        for (int i = 0; i < s.length(); i++) value = value * 2 + (s.charAt(i) - '0');
        return value;
    }
`),
  17: main(`    static int countOnes(int n) {
        int count = 0;
        while (n > 0) {
            count += n % 2;
            n /= 2;
        }
        return count;
    }
`),
  18: main(`    static long power(long x, int n) {
        long result = 1;
        while (n > 0) {
            if (n % 2 == 1) result *= x;
            x *= x;
            n /= 2;
        }
        return result;
    }
`),
  19: main(`    static int intSqrt(int n) {
        long low = 0;
        long high = n;
        long answer = 0;
        while (low <= high) {
            long mid = (low + high) / 2;
            if (mid * mid <= n) {
                answer = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return (int) answer;
    }
`),
  20: main(`    static boolean isLeap(int year) {
        if (year % 400 == 0) return true;
        if (year % 100 == 0) return false;
        return year % 4 == 0;
    }
`),
  21: main(`    static int sumMultiples(int limit) {
        int total = 0;
        for (int i = 1; i < limit; i++) {
            if (i % 3 == 0 || i % 5 == 0) total += i;
        }
        return total;
    }
`),
  22: main(`    static String toRoman(int n) {
        int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        String[] letters = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        String out = "";
        for (int i = 0; i < values.length; i++) {
            while (n >= values[i]) {
                out += letters[i];
                n -= values[i];
            }
        }
        return out;
    }
`),
  23: main(`    static int value(char c) {
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

    static int fromRoman(String s) {
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = value(s.charAt(i));
            if (i + 1 < s.length() && v < value(s.charAt(i + 1))) total -= v;
            else total += v;
        }
        return total;
    }
`),
  24: main(`    static String addStrings(String a, String b) {
        int i = a.length() - 1;
        int j = b.length() - 1;
        int carry = 0;
        String out = "";
        while (i >= 0 || j >= 0 || carry > 0) {
            int total = carry;
            if (i >= 0) total += a.charAt(i) - '0';
            if (j >= 0) total += b.charAt(j) - '0';
            out = (total % 10) + out;
            carry = total / 10;
            i--;
            j--;
        }
        return out;
    }
`),
  25: main(`    static String multiplyStrings(String a, String b) {
        int[] places = new int[a.length() + b.length()];
        for (int i = a.length() - 1; i >= 0; i--) {
            for (int j = b.length() - 1; j >= 0; j--) {
                places[(a.length() - 1 - i) + (b.length() - 1 - j)] += (a.charAt(i) - '0') * (b.charAt(j) - '0');
            }
        }
        for (int k = 0; k + 1 < places.length; k++) {
            places[k + 1] += places[k] / 10;
            places[k] %= 10;
        }
        int top = places.length - 1;
        while (top > 0 && places[top] == 0) top--;
        String out = "";
        for (int k = top; k >= 0; k--) out += places[k];
        return out;
    }
`),
};
