// Reference solutions for Practice: Basics & math (Python). Never shipped to students:
// tests/practice-python.spec.ts runs each one through the same test harness the app uses,
// and every test set must pass before it ships.
export const SOLUTIONS: Record<number, string> = {
  1: `def swap(a, b):
    a = a + b
    b = a - b
    a = a - b
    return a, b
`,
  2: `def is_even(n):
    return n // 2 * 2 == n
`,
  3: `def digit_sum(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total
`,
  4: `def reverse_int(n):
    sign = -1 if n < 0 else 1
    n = abs(n)
    result = 0
    while n > 0:
        result = result * 10 + n % 10
        n //= 10
    return sign * result
`,
  5: `def is_palindrome_number(n):
    if n < 0:
        return False
    original, reversed_n = n, 0
    while n > 0:
        reversed_n = reversed_n * 10 + n % 10
        n //= 10
    return original == reversed_n
`,
  6: `def count_digits(n):
    n = abs(n)
    if n == 0:
        return 1
    count = 0
    while n > 0:
        count += 1
        n //= 10
    return count
`,
  7: `def factorial_iter(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


def factorial_rec(n):
    if n <= 1:
        return 1
    return n * factorial_rec(n - 1)
`,
  8: `def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True
`,
  9: `def primes_up_to(n):
    if n < 2:
        return []
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    p = 2
    while p * p <= n:
        if is_p[p]:
            for m in range(p * p, n + 1, p):
                is_p[m] = False
        p += 1
    return [i for i in range(n + 1) if is_p[i]]
`,
  10: `def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a


def lcm(a, b):
    return a * b // gcd(a, b)
`,
  11: `def is_armstrong(n):
    k = len(str(n))
    total = 0
    m = n
    while m > 0:
        total += (m % 10) ** k
        m //= 10
    return total == n
`,
  12: `def is_perfect(n):
    if n < 2:
        return False
    total = 1
    d = 2
    while d * d <= n:
        if n % d == 0:
            total += d
            if d != n // d:
                total += n // d
        d += 1
    return total == n
`,
  13: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
`,
  14: `def is_power_of_two(n):
    if n < 1:
        return False
    while n % 2 == 0:
        n //= 2
    return n == 1
`,
  15: `def to_binary(n):
    if n == 0:
        return "0"
    digits = []
    while n > 0:
        digits.append(str(n % 2))
        n //= 2
    return "".join(reversed(digits))
`,
  16: `def from_binary(s):
    value = 0
    for ch in s:
        value = value * 2 + (1 if ch == "1" else 0)
    return value
`,
  17: `def count_ones(n):
    count = 0
    while n > 0:
        count += n & 1
        n >>= 1
    return count
`,
  18: `def power(x, n):
    result = 1
    while n > 0:
        if n % 2 == 1:
            result *= x
        x *= x
        n //= 2
    return result
`,
  19: `def int_sqrt(n):
    low, high = 0, n
    answer = 0
    while low <= high:
        mid = (low + high) // 2
        if mid * mid <= n:
            answer = mid
            low = mid + 1
        else:
            high = mid - 1
    return answer
`,
  20: `def is_leap(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0
`,
  21: `def sum_multiples(limit):
    return sum(i for i in range(1, limit) if i % 3 == 0 or i % 5 == 0)
`,
  22: `def to_roman(n):
    pairs = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
             (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = ""
    for value, letters in pairs:
        while n >= value:
            out += letters
            n -= value
    return out
`,
  23: `def from_roman(s):
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        v = values[ch]
        if i + 1 < len(s) and v < values[s[i + 1]]:
            total -= v
        else:
            total += v
    return total
`,
  24: `def add_strings(a, b):
    i, j = len(a) - 1, len(b) - 1
    carry = 0
    out = []
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += ord(a[i]) - ord("0")
            i -= 1
        if j >= 0:
            total += ord(b[j]) - ord("0")
            j -= 1
        out.append(chr(ord("0") + total % 10))
        carry = total // 10
    return "".join(reversed(out))
`,
  25: `def multiply_strings(a, b):
    places = [0] * (len(a) + len(b))
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            d = (ord(a[i]) - 48) * (ord(b[j]) - 48)
            p = (len(a) - 1 - i) + (len(b) - 1 - j)
            places[p] += d
    for p in range(len(places) - 1):
        places[p + 1] += places[p] // 10
        places[p] %= 10
    while len(places) > 1 and places[-1] == 0:
        places.pop()
    return "".join(str(d) for d in reversed(places))
`,
};
