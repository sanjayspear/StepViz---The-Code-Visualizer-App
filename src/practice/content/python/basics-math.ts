// Practice, Python: Basics & math (Q1-Q25). Reference solutions: tests/practice/basics-math.solutions.ts.
import type { PracticeContent } from '../types';

export const BASICS_MATH: PracticeContent[] = [
  {
    id: 1,
    example: 'Example: swap(3, 5) returns (5, 3).',
    starter: `def swap(a, b):
    # Swap a and b without a third variable, then return them: return a, b
    pass


print(swap(3, 5))
`,
    tests: [
      { call: 'swap', args: [3, 5], expected: [5, 3] },
      { call: 'swap', args: [-1, 8], expected: [8, -1] },
      { call: 'swap', args: [0, 0], expected: [0, 0] },
      { call: 'swap', args: [100, -100], expected: [-100, 100] },
    ],
    hint: 'Store the total in a: a = a + b. Now b = a - b gives the old a, and a = a - b gives the old b. (Python can also write a, b = b, a.) Like two friends trading seats without a spare chair: one stands up holding the "total" while the other moves.',
  },
  {
    id: 2,
    example: 'Example: is_even(4) returns True, is_even(7) returns False.',
    starter: `def is_even(n):
    # Return True if n is even, False if it is odd. Do not use %.
    pass


print(is_even(4))
`,
    tests: [
      { call: 'is_even', args: [4], expected: true },
      { call: 'is_even', args: [7], expected: false },
      { call: 'is_even', args: [0], expected: true },
      { call: 'is_even', args: [-3], expected: false },
      { call: 'is_even', args: [-10], expected: true },
    ],
    hint: 'Whole-number division drops the remainder: n // 2 * 2 gives back n only when n is even. (Or check the last bit: n & 1 is 0 for even numbers.) Like sharing sweets between two people: if nothing is left over, the number was even.',
    forbid: { ops: ['%'], names: ['divmod'], why: 'This question asks you to find the answer without %.' },
  },
  {
    id: 3,
    example: 'Example: digit_sum(1234) returns 10.',
    starter: `def digit_sum(n):
    # Add up the digits of n (n is 0 or more).
    pass


print(digit_sum(1234))
`,
    tests: [
      { call: 'digit_sum', args: [1234], expected: 10 },
      { call: 'digit_sum', args: [0], expected: 0 },
      { call: 'digit_sum', args: [9], expected: 9 },
      { call: 'digit_sum', args: [99999], expected: 45 },
      { call: 'digit_sum', args: [1000], expected: 1 },
    ],
    hint: 'n % 10 is the last digit and n // 10 removes it. Keep adding the last digit and removing it until n is 0. Like counting coins by taking them off a stack one at a time.',
  },
  {
    id: 4,
    example: 'Example: reverse_int(123) returns 321, reverse_int(-45) returns -54.',
    starter: `def reverse_int(n):
    # Return n with its digits in reverse order; keep the minus sign of a negative n.
    pass


print(reverse_int(-123))
`,
    tests: [
      { call: 'reverse_int', args: [123], expected: 321 },
      { call: 'reverse_int', args: [-123], expected: -321 },
      { call: 'reverse_int', args: [120], expected: 21 },
      { call: 'reverse_int', args: [0], expected: 0 },
      { call: 'reverse_int', args: [7], expected: 7 },
    ],
    hint: 'Remember the sign, then work with the number without it. Build the answer digit by digit: result = result * 10 + n % 10, then n = n // 10. Put the sign back at the end. Like reading a car number plate in a mirror: the digits come out last-first.',
  },
  {
    id: 5,
    example: 'Example: is_palindrome_number(121) returns True, is_palindrome_number(10) returns False.',
    starter: `def is_palindrome_number(n):
    # True if n reads the same forwards and backwards. Do not turn n into text.
    pass


print(is_palindrome_number(121))
`,
    tests: [
      { call: 'is_palindrome_number', args: [121], expected: true },
      { call: 'is_palindrome_number', args: [-121], expected: false },
      { call: 'is_palindrome_number', args: [10], expected: false },
      { call: 'is_palindrome_number', args: [0], expected: true },
      { call: 'is_palindrome_number', args: [12321], expected: true },
      { call: 'is_palindrome_number', args: [123], expected: false },
    ],
    hint: 'A negative number is never a palindrome (it starts with a minus). For the rest, build the reversed number with % 10 and // 10, then compare it with the original. Like checking a word in a mirror: if the mirror shows the same thing, it is a palindrome.',
    forbid: { names: ['str', 'repr', 'format'], why: 'This question asks you to work with the number itself, not its text.' },
  },
  {
    id: 6,
    example: 'Example: count_digits(12345) returns 5.',
    starter: `def count_digits(n):
    # How many digits does n have? (0 has one digit; ignore a minus sign.)
    pass


print(count_digits(12345))
`,
    tests: [
      { call: 'count_digits', args: [12345], expected: 5 },
      { call: 'count_digits', args: [0], expected: 1 },
      { call: 'count_digits', args: [7], expected: 1 },
      { call: 'count_digits', args: [-987], expected: 3 },
      { call: 'count_digits', args: [1000000], expected: 7 },
    ],
    hint: 'Make n positive, then keep doing n = n // 10 and count how many times until n is 0. Treat 0 on its own: it has one digit. Like counting the floors of a building by walking down one floor at a time until you reach the ground.',
  },
  {
    id: 7,
    example: 'Example: factorial_iter(4) and factorial_rec(4) both return 24.',
    starter: `def factorial_iter(n):
    # n! with a loop: 1 * 2 * 3 * ... * n (0! is 1)
    pass


def factorial_rec(n):
    # n! by calling itself: n! = n * (n - 1)!
    pass


print(factorial_iter(4), factorial_rec(4))
`,
    tests: [
      { call: 'factorial_iter', args: [0], expected: 1 },
      { call: 'factorial_iter', args: [1], expected: 1 },
      { call: 'factorial_iter', args: [5], expected: 120 },
      { call: 'factorial_iter', args: [10], expected: 3628800 },
      { call: 'factorial_rec', args: [0], expected: 1 },
      { call: 'factorial_rec', args: [1], expected: 1 },
      { call: 'factorial_rec', args: [5], expected: 120 },
      { call: 'factorial_rec', args: [10], expected: 3628800 },
    ],
    hint: 'Loop: start with result = 1 and multiply by 2, 3, ... up to n. Recursion: if n is 0 or 1 the answer is 1 (the stopping point); otherwise return n * factorial_rec(n - 1). Like a stack of boxes: each box waits for the one below it to finish counting.',
  },
  {
    id: 8,
    example: 'Example: is_prime(7) returns True, is_prime(9) returns False.',
    starter: `def is_prime(n):
    # True if n is a prime number (only 1 and n divide it, and n > 1).
    pass


print(is_prime(7))
`,
    tests: [
      { call: 'is_prime', args: [2], expected: true },
      { call: 'is_prime', args: [3], expected: true },
      { call: 'is_prime', args: [4], expected: false },
      { call: 'is_prime', args: [1], expected: false },
      { call: 'is_prime', args: [0], expected: false },
      { call: 'is_prime', args: [97], expected: true },
      { call: 'is_prime', args: [91], expected: false },
      { call: 'is_prime', args: [7919], expected: true },
    ],
    hint: 'Numbers below 2 are not prime. Try dividing n by every d from 2 while d * d <= n; if any d divides evenly (n % d == 0), it is not prime. Like checking if a bag of sweets can be shared into equal groups: if no group size works, the number is prime.',
  },
  {
    id: 9,
    example: 'Example: primes_up_to(10) returns [2, 3, 5, 7].',
    starter: `def primes_up_to(n):
    # A list of all primes from 2 to n, using the Sieve of Eratosthenes.
    pass


print(primes_up_to(10))
`,
    tests: [
      { call: 'primes_up_to', args: [10], expected: [2, 3, 5, 7] },
      { call: 'primes_up_to', args: [1], expected: [] },
      { call: 'primes_up_to', args: [2], expected: [2] },
      { call: 'primes_up_to', args: [30], expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29] },
      { call: 'primes_up_to', args: [97], expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97] },
    ],
    hint: 'Make a list of True values for 0..n, then set 0 and 1 to False. For each p that is still True, cross out its multiples p*p, p*p + p, ... by setting them to False. The numbers left True are the primes. Like a teacher crossing names off a list: whatever is never crossed out stays.',
  },
  {
    id: 10,
    example: 'Example: gcd(12, 18) returns 6, lcm(4, 6) returns 12.',
    starter: `def gcd(a, b):
    # The greatest common divisor of two positive numbers.
    pass


def lcm(a, b):
    # The least common multiple of two positive numbers.
    pass


print(gcd(12, 18), lcm(4, 6))
`,
    tests: [
      { call: 'gcd', args: [12, 18], expected: 6 },
      { call: 'gcd', args: [17, 5], expected: 1 },
      { call: 'gcd', args: [48, 180], expected: 12 },
      { call: 'gcd', args: [7, 7], expected: 7 },
      { call: 'lcm', args: [4, 6], expected: 12 },
      { call: 'lcm', args: [7, 3], expected: 21 },
      { call: 'lcm', args: [12, 18], expected: 36 },
      { call: 'lcm', args: [5, 5], expected: 5 },
    ],
    hint: 'Euclid: while b is not 0, replace (a, b) with (b, a % b); then a is the GCD. The LCM is a * b // gcd(a, b). Like cutting two ribbons into the longest equal pieces with nothing left over: that piece length is the GCD.',
  },
  {
    id: 11,
    example: 'Example: is_armstrong(153) returns True, because 1³ + 5³ + 3³ = 153.',
    starter: `def is_armstrong(n):
    # True if the sum of each digit raised to the number of digits equals n.
    pass


print(is_armstrong(153))
`,
    tests: [
      { call: 'is_armstrong', args: [153], expected: true },
      { call: 'is_armstrong', args: [370], expected: true },
      { call: 'is_armstrong', args: [9474], expected: true },
      { call: 'is_armstrong', args: [9475], expected: false },
      { call: 'is_armstrong', args: [10], expected: false },
      { call: 'is_armstrong', args: [5], expected: true },
    ],
    hint: 'First count the digits (k). Then go through the digits with % 10 and // 10, adding digit ** k each time. Compare the total with n. Like a team where each player scores by the size of the team: the scores must add up to the team number.',
  },
  {
    id: 12,
    example: 'Example: is_perfect(28) returns True, because 1 + 2 + 4 + 7 + 14 = 28.',
    starter: `def is_perfect(n):
    # True if the divisors of n smaller than n add up to n.
    pass


print(is_perfect(28))
`,
    tests: [
      { call: 'is_perfect', args: [6], expected: true },
      { call: 'is_perfect', args: [28], expected: true },
      { call: 'is_perfect', args: [496], expected: true },
      { call: 'is_perfect', args: [12], expected: false },
      { call: 'is_perfect', args: [1], expected: false },
      { call: 'is_perfect', args: [8128], expected: true },
    ],
    hint: 'Add every d from 1 to n - 1 that divides n (n % d == 0), then compare the sum with n. 1 is not perfect (it has no smaller divisors). Like a puzzle whose pieces, put together, make exactly the picture on the box.',
  },
  {
    id: 13,
    example: 'Example: fib(10) returns 55 (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55).',
    starter: `def fib(n):
    # The nth Fibonacci number (fib(0) is 0, fib(1) is 1), in O(n) time.
    pass


print(fib(10))
`,
    tests: [
      { call: 'fib', args: [0], expected: 0 },
      { call: 'fib', args: [1], expected: 1 },
      { call: 'fib', args: [2], expected: 1 },
      { call: 'fib', args: [10], expected: 55 },
      { call: 'fib', args: [50], expected: 12586269025 },
      { call: 'fib', args: [70], expected: 190392490709135 },
    ],
    hint: 'Keep only the last two numbers: start with a, b = 0, 1 and repeat n times: a, b = b, a + b. Then a is the answer. (Calling fib twice inside fib is far too slow for fib(70).) Like climbing stairs while remembering only the last two steps you stood on.',
  },
  {
    id: 14,
    example: 'Example: is_power_of_two(16) returns True, is_power_of_two(18) returns False.',
    starter: `def is_power_of_two(n):
    # True if n is 1, 2, 4, 8, 16, ...
    pass


print(is_power_of_two(16))
`,
    tests: [
      { call: 'is_power_of_two', args: [1], expected: true },
      { call: 'is_power_of_two', args: [2], expected: true },
      { call: 'is_power_of_two', args: [16], expected: true },
      { call: 'is_power_of_two', args: [18], expected: false },
      { call: 'is_power_of_two', args: [0], expected: false },
      { call: 'is_power_of_two', args: [-8], expected: false },
      { call: 'is_power_of_two', args: [1024], expected: true },
    ],
    hint: 'Numbers below 1 are not powers of two. Otherwise keep halving n while it is even; it is a power of two only if you end at 1. (A shortcut: n & (n - 1) is 0 for powers of two.) Like folding a sheet of paper in half again and again: a power of two folds all the way down to one.',
  },
  {
    id: 15,
    example: 'Example: to_binary(10) returns "1010".',
    starter: `def to_binary(n):
    # The binary digits of n (n is 0 or more) as text. Do not use bin() or format().
    pass


print(to_binary(10))
`,
    tests: [
      { call: 'to_binary', args: [10], expected: '1010' },
      { call: 'to_binary', args: [0], expected: '0' },
      { call: 'to_binary', args: [1], expected: '1' },
      { call: 'to_binary', args: [2], expected: '10' },
      { call: 'to_binary', args: [255], expected: '11111111' },
    ],
    hint: 'n % 2 is the last binary digit and n // 2 removes it. Collect the digits until n is 0, then put them in reverse order. 0 is "0". Like paying with only 1-coins and 2-coins: each step tells you whether a coin is left over.',
    forbid: { names: ['bin', 'format'], why: 'This question asks you to build the binary digits yourself, without bin() or format().' },
  },
  {
    id: 16,
    example: 'Example: from_binary("1010") returns 10.',
    starter: `def from_binary(s):
    # The number written by the binary digits in s.
    pass


print(from_binary("1010"))
`,
    tests: [
      { call: 'from_binary', args: ['1010'], expected: 10 },
      { call: 'from_binary', args: ['0'], expected: 0 },
      { call: 'from_binary', args: ['1'], expected: 1 },
      { call: 'from_binary', args: ['11111111'], expected: 255 },
      { call: 'from_binary', args: ['100000'], expected: 32 },
    ],
    hint: 'Read the digits from left to right: start with 0 and for each digit do value = value * 2 + digit. Like an odometer that counts in twos: each new digit doubles what was there and adds itself.',
  },
  {
    id: 17,
    example: 'Example: count_ones(11) returns 3, because 11 is 1011 in binary.',
    starter: `def count_ones(n):
    # How many 1 digits does n (0 or more) have in binary?
    pass


print(count_ones(11))
`,
    tests: [
      { call: 'count_ones', args: [11], expected: 3 },
      { call: 'count_ones', args: [0], expected: 0 },
      { call: 'count_ones', args: [1], expected: 1 },
      { call: 'count_ones', args: [255], expected: 8 },
      { call: 'count_ones', args: [1024], expected: 1 },
    ],
    hint: 'Look at the last bit with n % 2 (or n & 1), add it to a count, then drop it with n // 2. Stop when n is 0. Like counting the lights that are on along a row of switches, one switch at a time.',
  },
  {
    id: 18,
    example: 'Example: power(2, 10) returns 1024.',
    starter: `def power(x, n):
    # x to the power n (n is 0 or more) in O(log n) steps.
    pass


print(power(2, 10))
`,
    tests: [
      { call: 'power', args: [2, 10], expected: 1024 },
      { call: 'power', args: [3, 0], expected: 1 },
      { call: 'power', args: [5, 3], expected: 125 },
      { call: 'power', args: [-2, 3], expected: -8 },
      { call: 'power', args: [2, 50], expected: 1125899906842624 },
      { call: 'power', args: [1, 10000000], expected: 1 },
    ],
    hint: 'Square and halve: while n > 0, if n is odd multiply the result by x; then x = x * x and n = n // 2. That needs only about log2(n) rounds, which is why the last test (n is ten million) stays quick. Like folding paper: each fold doubles the layers, so you reach a huge number in a few folds.',
    forbid: { ops: ['**'], names: ['pow'], why: 'The point here is to build the O(log n) method yourself, so ** and pow() are not allowed.' },
  },
  {
    id: 19,
    example: 'Example: int_sqrt(17) returns 4, because 4 × 4 = 16 and 5 × 5 = 25.',
    starter: `def int_sqrt(n):
    # The largest whole number r with r * r <= n (n is 0 or more). Do not use sqrt().
    pass


print(int_sqrt(17))
`,
    tests: [
      { call: 'int_sqrt', args: [17], expected: 4 },
      { call: 'int_sqrt', args: [0], expected: 0 },
      { call: 'int_sqrt', args: [1], expected: 1 },
      { call: 'int_sqrt', args: [16], expected: 4 },
      { call: 'int_sqrt', args: [2], expected: 1 },
      { call: 'int_sqrt', args: [2147395599], expected: 46339 },
    ],
    hint: 'Binary search between 0 and n: look at mid = (low + high) // 2; if mid * mid is too big, search lower, otherwise remember mid and search higher. Like guessing a number when someone says "higher" or "lower": halving the range each time finds it fast.',
    forbid: { names: ['sqrt', 'isqrt', 'pow'], ops: ['**'], why: 'This question asks you to find the square root yourself, without sqrt(), ** or pow().' },
  },
  {
    id: 20,
    example: 'Example: is_leap(2024) returns True, is_leap(1900) returns False.',
    starter: `def is_leap(year):
    # True if year is a leap year.
    pass


print(is_leap(2024))
`,
    tests: [
      { call: 'is_leap', args: [2024], expected: true },
      { call: 'is_leap', args: [2023], expected: false },
      { call: 'is_leap', args: [2000], expected: true },
      { call: 'is_leap', args: [1900], expected: false },
      { call: 'is_leap', args: [2400], expected: true },
    ],
    hint: 'A year is a leap year if it divides by 4, except years that divide by 100, unless they also divide by 400. Check the 400 rule first, then 100, then 4. Like a school rule with exceptions: "everyone gets a break, except on Fridays, unless it is a holiday".',
  },
  {
    id: 21,
    example: 'Example: sum_multiples(10) returns 23 (3 + 5 + 6 + 9).',
    starter: `def sum_multiples(limit):
    # The sum of all numbers below limit that are multiples of 3 or 5.
    pass


print(sum_multiples(1000))
`,
    tests: [
      { call: 'sum_multiples', args: [10], expected: 23 },
      { call: 'sum_multiples', args: [1], expected: 0 },
      { call: 'sum_multiples', args: [16], expected: 60 },
      { call: 'sum_multiples', args: [1000], expected: 233168 },
    ],
    hint: 'Go through every number from 1 up to limit - 1 and add it when it divides by 3 or by 5 (use "or", so 15 is counted once). Like collecting every third and every fifth card from a deck, but never picking the same card twice.',
  },
  {
    id: 22,
    example: 'Example: to_roman(1994) returns "MCMXCIV".',
    starter: `def to_roman(n):
    # n (1 to 3999) as a Roman numeral.
    pass


print(to_roman(1994))
`,
    tests: [
      { call: 'to_roman', args: [3], expected: 'III' },
      { call: 'to_roman', args: [4], expected: 'IV' },
      { call: 'to_roman', args: [9], expected: 'IX' },
      { call: 'to_roman', args: [58], expected: 'LVIII' },
      { call: 'to_roman', args: [1994], expected: 'MCMXCIV' },
      { call: 'to_roman', args: [3999], expected: 'MMMCMXCIX' },
    ],
    hint: 'List the values from big to small, including the special pairs: 1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I. Take the biggest one that still fits as often as it fits, then move on. Like paying an amount with the biggest notes first.',
  },
  {
    id: 23,
    example: 'Example: from_roman("MCMXCIV") returns 1994.',
    starter: `def from_roman(s):
    # The number written by the Roman numeral s.
    pass


print(from_roman("MCMXCIV"))
`,
    tests: [
      { call: 'from_roman', args: ['III'], expected: 3 },
      { call: 'from_roman', args: ['IV'], expected: 4 },
      { call: 'from_roman', args: ['IX'], expected: 9 },
      { call: 'from_roman', args: ['LVIII'], expected: 58 },
      { call: 'from_roman', args: ['MCMXCIV'], expected: 1994 },
      { call: 'from_roman', args: ['MMMCMXCIX'], expected: 3999 },
    ],
    hint: 'Give each letter its value (I 1, V 5, X 10, L 50, C 100, D 500, M 1000). Go left to right: if a letter is smaller than the one after it, subtract it (the I in IV); otherwise add it. Like reading a price tag where "1 less than 5" is written as IV.',
  },
  {
    id: 24,
    example: 'Example: add_strings("999", "1") returns "1000".',
    starter: `def add_strings(a, b):
    # a and b are whole numbers written as text. Return their sum as text,
    # adding digit by digit like on paper.
    pass


print(add_strings("999", "1"))
`,
    tests: [
      { call: 'add_strings', args: ['999', '1'], expected: '1000' },
      { call: 'add_strings', args: ['0', '0'], expected: '0' },
      { call: 'add_strings', args: ['123', '456'], expected: '579' },
      { call: 'add_strings', args: ['1', '99999'], expected: '100000' },
      { call: 'add_strings', args: ['123456789123456789', '987654321987654321'], expected: '1111111111111111110' },
    ],
    hint: 'Start at the right end of both strings. Add the two digits and the carry; write down total % 10 and carry total // 10 to the next column. When both strings run out, write the last carry if it is 1, then reverse what you wrote. Like adding on paper at school, column by column.',
  },
  {
    id: 25,
    example: 'Example: multiply_strings("123", "456") returns "56088".',
    starter: `def multiply_strings(a, b):
    # a and b are whole numbers written as text. Return their product as text,
    # multiplying digit by digit like on paper.
    pass


print(multiply_strings("123", "456"))
`,
    tests: [
      { call: 'multiply_strings', args: ['123', '456'], expected: '56088' },
      { call: 'multiply_strings', args: ['0', '52'], expected: '0' },
      { call: 'multiply_strings', args: ['2', '3'], expected: '6' },
      { call: 'multiply_strings', args: ['99', '99'], expected: '9801' },
      { call: 'multiply_strings', args: ['123456789', '987654321'], expected: '121932631112635269' },
    ],
    hint: 'Make a list of len(a) + len(b) zeros. Digit i of a times digit j of b (counting from the right) adds to place i + j; afterwards, carry from each place to the next one. Remove the leading zeros (but keep one "0"). Like long multiplication at school: each row is shifted one place left, then the rows are added up.',
  },
];
