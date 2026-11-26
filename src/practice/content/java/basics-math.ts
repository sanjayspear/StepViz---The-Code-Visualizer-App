// Practice, Java: Basics & math (Q1-Q25). Tests come from the Python content;
// reference solutions in tests/practice/java/basics-math.solutions.ts.
import { fromPython } from '../javascript/shared';
import { BASICS_MATH } from '../python/basics-math';
import { javaStarter, one } from './shared';

const NO_TEXT = {
  names: ['toString', 'valueOf', 'StringBuilder', 'format', 'chars'],
  patterns: [{ regex: '\\+"…"|"…"\\+', shown: '+ ""' }],
  why: 'This question asks you to work with the number itself, not its text.',
};

export const BASICS_MATH_JAVA = fromPython(BASICS_MATH, {
  1: {
    example: 'Example: swap(3, 5) returns [5, 3].',
    starter: one(
      'int[] swap(int a, int b)',
      'Swap a and b without a third variable, then return them: return new int[] {a, b};',
      'System.out.println(Arrays.toString(swap(3, 5)));',
      'import java.util.*;',
    ),
    hint: 'Store the total in a: a = a + b. Now b = a - b gives the old a, and a = a - b gives the old b. Like two friends trading seats without a spare chair: one stands up holding the "total" while the other moves.',
  },
  2: {
    example: 'Example: isEven(4) returns true, isEven(7) returns false.',
    starter: one('boolean isEven(int n)', 'Return true if n is even, false if it is odd. Do not use %.', 'System.out.println(isEven(4));'),
    hint: 'Whole-number division drops the remainder: n / 2 * 2 gives back n only when n is even. (Or check the last bit: n & 1 is 0 for even numbers.) Like sharing sweets between two people: if nothing is left over, the number was even.',
    forbid: { ops: ['%', '%='], names: ['floorMod'], why: 'This question asks you to find the answer without %.' },
  },
  3: {
    example: 'Example: digitSum(1234) returns 10.',
    starter: one('int digitSum(int n)', 'Add up the digits of n (n is 0 or more).', 'System.out.println(digitSum(1234));'),
    hint: 'n % 10 is the last digit and n / 10 removes it (int division drops the rest). Keep adding the last digit and removing it until n is 0. Like counting coins by taking them off a stack one at a time.',
  },
  4: {
    example: 'Example: reverseInt(123) returns 321, reverseInt(-45) returns -54.',
    starter: one('int reverseInt(int n)', 'Return n with its digits in reverse order; keep the minus sign of a negative n.', 'System.out.println(reverseInt(-123));'),
    hint: 'Build the answer digit by digit: result = result * 10 + n % 10, then n = n / 10. In Java this works for negative numbers too, because -123 % 10 is -3 and -123 / 10 is -12. Like reading a car number plate in a mirror: the digits come out last-first.',
  },
  5: {
    example: 'Example: isPalindromeNumber(121) returns true, isPalindromeNumber(10) returns false.',
    starter: one('boolean isPalindromeNumber(int n)', 'true if n reads the same forwards and backwards. Do not turn n into text.', 'System.out.println(isPalindromeNumber(121));'),
    hint: 'A negative number is never a palindrome (it starts with a minus). For the rest, build the reversed number with % 10 and / 10, then compare it with the original. Like checking a word in a mirror: if the mirror shows the same thing, it is a palindrome.',
    forbid: NO_TEXT,
  },
  6: {
    example: 'Example: countDigits(12345) returns 5.',
    starter: one('int countDigits(int n)', 'How many digits does n have? (0 has one digit; ignore a minus sign.)', 'System.out.println(countDigits(12345));'),
    hint: 'Make n positive (Math.abs), then keep doing n = n / 10 and count how many times until n is 0. Treat 0 on its own: it has one digit. Like counting the floors of a building by walking down one floor at a time until you reach the ground.',
  },
  7: {
    example: 'Example: factorialIter(4) and factorialRec(4) both return 24.',
    starter: javaStarter(
      [
        ['int factorialIter(int n)', 'n! with a loop: 1 * 2 * 3 * ... * n (0! is 1)'],
        ['int factorialRec(int n)', 'n! by calling itself: n! = n * (n - 1)!'],
      ],
      'System.out.println(factorialIter(4));\nSystem.out.println(factorialRec(4));',
    ),
    hint: 'Loop: start with result = 1 and multiply by 2, 3, ... up to n. Recursion: if n is 0 or 1 the answer is 1 (the stopping point); otherwise return n * factorialRec(n - 1). Like a stack of boxes: each box waits for the one below it to finish counting.',
  },
  8: {
    example: 'Example: isPrime(7) returns true, isPrime(9) returns false.',
    starter: one('boolean isPrime(int n)', 'true if n is a prime number (only 1 and n divide it, and n > 1).', 'System.out.println(isPrime(7));'),
  },
  9: {
    example: 'Example: primesUpTo(10) returns [2, 3, 5, 7].',
    starter: one(
      'List<Integer> primesUpTo(int n)',
      'A list of all primes from 2 to n, using the Sieve of Eratosthenes.',
      'System.out.println(primesUpTo(10));',
      'import java.util.*;',
    ),
    hint: 'Make a boolean[] of size n + 1 and mark 0 and 1 as "not prime". For each p that is still unmarked, cross out its multiples p*p, p*p + p, ... The numbers never crossed out are the primes. Like a teacher crossing names off a list: whatever is never crossed out stays.',
  },
  10: {
    example: 'Example: gcd(12, 18) returns 6, lcm(4, 6) returns 12.',
    starter: javaStarter(
      [
        ['int gcd(int a, int b)', 'The greatest common divisor of two positive numbers.'],
        ['int lcm(int a, int b)', 'The least common multiple of two positive numbers.'],
      ],
      'System.out.println(gcd(12, 18));\nSystem.out.println(lcm(4, 6));',
    ),
    hint: 'Euclid: while b is not 0, set (a, b) to (b, a % b) using a spare variable; then a is the GCD. The LCM is a / gcd(a, b) * b. Like cutting two ribbons into the longest equal pieces with nothing left over: that piece length is the GCD.',
  },
  11: {
    example: 'Example: isArmstrong(153) returns true, because 1³ + 5³ + 3³ = 153.',
    starter: one('boolean isArmstrong(int n)', 'true if the sum of each digit raised to the number of digits equals n.', 'System.out.println(isArmstrong(153));'),
    hint: 'First count the digits (k). Then go through the digits with % 10 and / 10, adding the digit multiplied by itself k times each time. Compare the total with n. Like a team where each player scores by the size of the team: the scores must add up to the team number.',
  },
  12: {
    example: 'Example: isPerfect(28) returns true, because 1 + 2 + 4 + 7 + 14 = 28.',
    starter: one('boolean isPerfect(int n)', 'true if the divisors of n smaller than n add up to n.', 'System.out.println(isPerfect(28));'),
    hint: 'Add every d from 1 to n - 1 that divides n (n % d == 0), then compare the sum with n. 1 is not perfect (it has no smaller divisors). Like a puzzle whose pieces, put together, make exactly the picture on the box.',
  },
  13: {
    example: 'Example: fib(10) returns 55 (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55).',
    starter: one('long fib(int n)', 'The nth Fibonacci number (fib(0) is 0, fib(1) is 1), in O(n) time.\nIt grows fast, so it is a long.', 'System.out.println(fib(10));'),
    hint: 'Keep only the last two numbers in longs a = 0 and b = 1, and repeat n times: next = a + b, a = b, b = next. Then a is the answer. (Calling fib twice inside fib is far too slow for fib(70).) Like climbing stairs while remembering only the last two steps you stood on.',
  },
  14: {
    example: 'Example: isPowerOfTwo(16) returns true, isPowerOfTwo(18) returns false.',
    starter: one('boolean isPowerOfTwo(int n)', 'true if n is 1, 2, 4, 8, 16, ...', 'System.out.println(isPowerOfTwo(16));'),
  },
  15: {
    example: 'Example: toBinary(10) returns "1010".',
    starter: one('String toBinary(int n)', 'The binary digits of n (n is 0 or more) as text. Do not use Integer.toBinaryString().', 'System.out.println(toBinary(10));'),
    hint: 'n % 2 is the last binary digit and n / 2 removes it. Put each digit in front of the text you have so far, until n is 0. 0 is "0". Like paying with only 1-coins and 2-coins: each step tells you whether a coin is left over.',
    forbid: { names: ['toBinaryString', 'toString', 'format'], why: 'This question asks you to build the binary digits yourself, without Integer.toBinaryString().' },
  },
  16: {
    example: 'Example: fromBinary("1010") returns 10.',
    starter: one('int fromBinary(String s)', 'The number written by the binary digits in s.', 'System.out.println(fromBinary("1010"));'),
  },
  17: {
    example: 'Example: countOnes(11) returns 3, because 11 is 1011 in binary.',
    starter: one('int countOnes(int n)', 'How many 1 digits does n (0 or more) have in binary?', 'System.out.println(countOnes(11));'),
    hint: 'Look at the last bit with n % 2 (or n & 1), add it to a count, then drop it with n / 2. Stop when n is 0. Like counting the lights that are on along a row of switches, one switch at a time.',
  },
  18: {
    example: 'Example: power(2, 10) returns 1024.',
    starter: one('long power(long x, int n)', 'x to the power n (n is 0 or more) in O(log n) steps.', 'System.out.println(power(2, 10));'),
    hint: 'Square and halve: while n > 0, if n is odd multiply the result by x; then x = x * x and n = n / 2. That needs only about log2(n) rounds, which is why the last test (n is ten million) stays quick. Like folding paper: each fold doubles the layers, so you reach a huge number in a few folds.',
    forbid: { names: ['pow'], why: 'The point here is to build the O(log n) method yourself, so Math.pow() is not allowed.' },
  },
  19: {
    example: 'Example: intSqrt(17) returns 4, because 4 × 4 = 16 and 5 × 5 = 25.',
    starter: one('int intSqrt(int n)', 'The largest whole number r with r * r <= n (n is 0 or more). Do not use Math.sqrt().', 'System.out.println(intSqrt(17));'),
    hint: 'Binary search between 0 and n: look at mid = (low + high) / 2; if mid * mid is too big, search lower, otherwise remember mid and search higher. Use long for mid * mid, or it overflows an int on big n. Like guessing a number when someone says "higher" or "lower": halving the range each time finds it fast.',
    forbid: { names: ['sqrt', 'cbrt', 'pow', 'hypot'], why: 'This question asks you to find the square root yourself, without Math.sqrt() or Math.pow().' },
  },
  20: {
    example: 'Example: isLeap(2024) returns true, isLeap(1900) returns false.',
    starter: one('boolean isLeap(int year)', 'true if year is a leap year.', 'System.out.println(isLeap(2024));'),
  },
  21: {
    example: 'Example: sumMultiples(10) returns 23 (3 + 5 + 6 + 9).',
    starter: one('int sumMultiples(int limit)', 'The sum of all numbers below limit that are multiples of 3 or 5.', 'System.out.println(sumMultiples(1000));'),
    hint: 'Go through every number from 1 up to limit - 1 and add it when it divides by 3 or by 5 (use ||, so 15 is counted once). Like collecting every third and every fifth card from a deck, but never picking the same card twice.',
  },
  22: {
    example: 'Example: toRoman(1994) returns "MCMXCIV".',
    starter: one('String toRoman(int n)', 'n (1 to 3999) as a Roman numeral.', 'System.out.println(toRoman(1994));'),
  },
  23: {
    example: 'Example: fromRoman("MCMXCIV") returns 1994.',
    starter: one('int fromRoman(String s)', 'The number written by the Roman numeral s.', 'System.out.println(fromRoman("MCMXCIV"));'),
  },
  24: {
    example: 'Example: addStrings("999", "1") returns "1000".',
    starter: one(
      'String addStrings(String a, String b)',
      'a and b are whole numbers written as text. Return their sum as text,\nadding digit by digit like on paper.',
      'System.out.println(addStrings("999", "1"));',
    ),
    hint: 'Start at the right end of both texts. Add the two digits (a.charAt(i) - \'0\') and the carry; put total % 10 in front of the answer and carry total / 10 to the next column. When both texts run out, put the last carry in front if it is 1. (Long numbers do not fit in a long.) Like adding on paper at school, column by column.',
  },
  25: {
    example: 'Example: multiplyStrings("123", "456") returns "56088".',
    starter: one(
      'String multiplyStrings(String a, String b)',
      'a and b are whole numbers written as text. Return their product as text,\nmultiplying digit by digit like on paper.',
      'System.out.println(multiplyStrings("123", "456"));',
    ),
    hint: 'Make an int[] of a.length() + b.length() zeros. Digit i of a times digit j of b (counting from the right) adds to place i + j; afterwards, carry from each place to the next one. Remove the leading zeros (but keep one "0"). Like long multiplication at school: each row is shifted one place left, then the rows are added up.',
  },
});
