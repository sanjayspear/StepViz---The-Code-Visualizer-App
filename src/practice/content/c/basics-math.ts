// Practice, C: Basics & math (the questions of Q1-Q25 that fit C). Tests come from the Python content;
// reference solutions in tests/practice/c/basics-math.solutions.ts. Q1, Q9, Q15, Q22, Q24 and Q25 give back
// a list or text, which C functions can't do without malloc: they show C as coming soon.
import { fromPython } from '../javascript/shared';
import { BASICS_MATH } from '../python/basics-math';
import { cStarter, one } from './shared';

const num = (header: string, comment: string, expr: string, format = '%d') => one(header, comment, `printf("${format}\\n", ${expr});`);
const yes = (header: string, comment: string, expr: string) => one(header, comment, `printf("%s\\n", ${expr} ? "true" : "false");`);

export const BASICS_MATH_C = fromPython(
  BASICS_MATH,
  {
    2: {
      example: 'Example: isEven(4) returns true, isEven(7) returns false.',
      starter: yes('bool isEven(int n)', 'Return true if n is even, false if it is odd. Do not use %.', 'isEven(4)'),
      hint: 'Whole-number division drops the remainder: n / 2 * 2 gives back n only when n is even. (Or check the last bit: n & 1 is 0 for even numbers.) Like sharing sweets between two people: if nothing is left over, the number was even.',
      forbid: { ops: ['%', '%='], names: ['fmod', 'remainder', 'div'], why: 'This question asks you to find the answer without %.' },
    },
    3: {
      example: 'Example: digitSum(1234) returns 10.',
      starter: num('int digitSum(int n)', 'Add up the digits of n (n is 0 or more).', 'digitSum(1234)'),
      hint: 'n % 10 is the last digit and n / 10 removes it (int division drops the rest). Keep adding the last digit and removing it until n is 0. Like counting coins by taking them off a stack one at a time.',
    },
    4: {
      example: 'Example: reverseInt(123) returns 321, reverseInt(-45) returns -54.',
      starter: num('int reverseInt(int n)', 'Return n with its digits in reverse order; keep the minus sign of a negative n.', 'reverseInt(-123)'),
      hint: 'Build the answer digit by digit: result = result * 10 + n % 10, then n = n / 10. In C this works for negative numbers too, because -123 % 10 is -3 and -123 / 10 is -12. Like reading a car number plate in a mirror: the digits come out last-first.',
    },
    5: {
      example: 'Example: isPalindromeNumber(121) returns true, isPalindromeNumber(10) returns false.',
      starter: yes('bool isPalindromeNumber(int n)', 'true if n reads the same forwards and backwards. Do not turn n into text.', 'isPalindromeNumber(121)'),
      hint: 'A negative number is never a palindrome (it starts with a minus). For the rest, build the reversed number with % 10 and / 10, then compare it with the original. Like checking a word in a mirror: if the mirror shows the same thing, it is a palindrome.',
      forbid: { names: ['sprintf', 'snprintf', 'itoa'], why: 'This question asks you to work with the number itself, not its text.' },
    },
    6: {
      example: 'Example: countDigits(12345) returns 5.',
      starter: num('int countDigits(int n)', 'How many digits does n have? (0 has one digit; ignore a minus sign.)', 'countDigits(12345)'),
      hint: 'Make n positive (abs from <stdlib.h>), then keep doing n = n / 10 and count how many times until n is 0. Treat 0 on its own: it has one digit. Like counting the floors of a building by walking down one floor at a time until you reach the ground.',
    },
    7: {
      example: 'Example: factorialIter(4) and factorialRec(4) both return 24.',
      starter: cStarter(
        [
          ['int factorialIter(int n)', 'n! with a loop: 1 * 2 * 3 * ... * n (0! is 1)'],
          ['int factorialRec(int n)', 'n! by calling itself: n! = n * (n - 1)!'],
        ],
        'printf("%d\\n", factorialIter(4));\nprintf("%d\\n", factorialRec(4));',
      ),
      hint: 'Loop: start with result = 1 and multiply by 2, 3, ... up to n. Recursion: if n is 0 or 1 the answer is 1 (the stopping point); otherwise return n * factorialRec(n - 1). Like a stack of boxes: each box waits for the one below it to finish counting.',
    },
    8: {
      example: 'Example: isPrime(7) returns true, isPrime(9) returns false.',
      starter: yes('bool isPrime(int n)', 'true if n is a prime number (only 1 and n divide it, and n > 1).', 'isPrime(7)'),
    },
    10: {
      example: 'Example: gcd(12, 18) returns 6, lcm(4, 6) returns 12.',
      starter: cStarter(
        [
          ['int gcd(int a, int b)', 'The greatest common divisor of two positive numbers.'],
          ['int lcm(int a, int b)', 'The least common multiple of two positive numbers.'],
        ],
        'printf("%d\\n", gcd(12, 18));\nprintf("%d\\n", lcm(4, 6));',
      ),
      hint: 'Euclid: while b is not 0, set (a, b) to (b, a % b) using a spare variable; then a is the GCD. The LCM is a / gcd(a, b) * b. Like cutting two ribbons into the longest equal pieces with nothing left over: that piece length is the GCD.',
    },
    11: {
      example: 'Example: isArmstrong(153) returns true, because 1³ + 5³ + 3³ = 153.',
      starter: yes('bool isArmstrong(int n)', 'true if the sum of each digit raised to the number of digits equals n.', 'isArmstrong(153)'),
      hint: 'First count the digits (k). Then go through the digits with % 10 and / 10, adding the digit multiplied by itself k times each time. Compare the total with n. Like a team where each player scores by the size of the team: the scores must add up to the team number.',
    },
    12: {
      example: 'Example: isPerfect(28) returns true, because 1 + 2 + 4 + 7 + 14 = 28.',
      starter: yes('bool isPerfect(int n)', 'true if the divisors of n smaller than n add up to n.', 'isPerfect(28)'),
      hint: 'Add every d from 1 to n - 1 that divides n (n % d == 0), then compare the sum with n. 1 is not perfect (it has no smaller divisors). Like a puzzle whose pieces, put together, make exactly the picture on the box.',
    },
    13: {
      example: 'Example: fib(10) returns 55 (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55).',
      starter: num('long long fib(int n)', 'The nth Fibonacci number (fib(0) is 0, fib(1) is 1), in O(n) time.\nIt grows fast, so it is a long long.', 'fib(10)', '%lld'),
      hint: 'Keep only the last two numbers in long longs a = 0 and b = 1, and repeat n times: next = a + b, a = b, b = next. Then a is the answer. (Calling fib twice inside fib is far too slow for fib(70).) Like climbing stairs while remembering only the last two steps you stood on.',
    },
    14: {
      example: 'Example: isPowerOfTwo(16) returns true, isPowerOfTwo(18) returns false.',
      starter: yes('bool isPowerOfTwo(int n)', 'true if n is 1, 2, 4, 8, 16, ...', 'isPowerOfTwo(16)'),
    },
    16: {
      example: 'Example: fromBinary("1010") returns 10.',
      starter: num('int fromBinary(char s[])', 'The number written by the binary digits in s.', 'fromBinary("1010")'),
      hint: 'Go through the characters of s until the end mark \'\\0\': value = value * 2 + (s[i] - \'0\'). Like reading a row of light switches from left to right, doubling what you have each time you move along.',
    },
    17: {
      example: 'Example: countOnes(11) returns 3, because 11 is 1011 in binary.',
      starter: num('int countOnes(int n)', 'How many 1 digits does n (0 or more) have in binary?', 'countOnes(11)'),
      hint: 'Look at the last bit with n % 2 (or n & 1), add it to a count, then drop it with n / 2. Stop when n is 0. Like counting the lights that are on along a row of switches, one switch at a time.',
    },
    18: {
      example: 'Example: power(2, 10) returns 1024.',
      starter: num('long long power(long long x, int n)', 'x to the power n (n is 0 or more) in O(log n) steps.', 'power(2, 10)', '%lld'),
      hint: 'Square and halve: while n > 0, if n is odd multiply the result by x; then x = x * x and n = n / 2. That needs only about log2(n) rounds, which is why the last test (n is ten million) stays quick. Like folding paper: each fold doubles the layers, so you reach a huge number in a few folds.',
      forbid: { names: ['pow', 'powl', 'exp'], why: 'The point here is to build the O(log n) method yourself, so pow() is not allowed.' },
    },
    19: {
      example: 'Example: intSqrt(17) returns 4, because 4 × 4 = 16 and 5 × 5 = 25.',
      starter: num('int intSqrt(int n)', 'The largest whole number r with r * r <= n (n is 0 or more). Do not use sqrt().', 'intSqrt(17)'),
      hint: 'Binary search between 0 and n: look at mid = (low + high) / 2; if mid * mid is too big, search lower, otherwise remember mid and search higher. Use long long for mid * mid, or it overflows an int on big n. Like guessing a number when someone says "higher" or "lower": halving the range each time finds it fast.',
      forbid: { names: ['sqrt', 'cbrt', 'pow', 'hypot'], why: 'This question asks you to find the square root yourself, without sqrt() or pow().' },
    },
    20: {
      example: 'Example: isLeap(2024) returns true, isLeap(1900) returns false.',
      starter: yes('bool isLeap(int year)', 'true if year is a leap year.', 'isLeap(2024)'),
    },
    21: {
      example: 'Example: sumMultiples(10) returns 23 (3 + 5 + 6 + 9).',
      starter: num('int sumMultiples(int limit)', 'The sum of all numbers below limit that are multiples of 3 or 5.', 'sumMultiples(1000)'),
      hint: 'Go through every number from 1 up to limit - 1 and add it when it divides by 3 or by 5 (use ||, so 15 is counted once). Like collecting every third and every fifth card from a deck, but never picking the same card twice.',
    },
    23: {
      example: 'Example: fromRoman("MCMXCIV") returns 1994.',
      starter: one('int fromRoman(char s[])', 'The number written by the Roman numeral s.', 'printf("%d\\n", fromRoman("MCMXCIV"));', ['string.h']),
    },
  },
  { partial: true },
);
