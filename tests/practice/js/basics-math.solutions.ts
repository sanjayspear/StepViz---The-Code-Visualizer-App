// JavaScript reference solutions for Practice: Basics & math. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  1: `function swap(a, b) {
  a = a + b;
  b = a - b;
  a = a - b;
  return [a, b];
}
`,
  2: `function isEven(n) {
  return Math.trunc(n / 2) * 2 === n;
}
`,
  3: `function digitSum(n) {
  let total = 0;
  while (n > 0) {
    total += n % 10;
    n = Math.floor(n / 10);
  }
  return total;
}
`,
  4: `function reverseInt(n) {
  const sign = n < 0 ? -1 : 1;
  n = Math.abs(n);
  let result = 0;
  while (n > 0) {
    result = result * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return sign * result;
}
`,
  5: `function isPalindromeNumber(n) {
  if (n < 0) return false;
  let reversed = 0;
  let rest = n;
  while (rest > 0) {
    reversed = reversed * 10 + (rest % 10);
    rest = Math.floor(rest / 10);
  }
  return reversed === n;
}
`,
  6: `function countDigits(n) {
  n = Math.abs(n);
  if (n === 0) return 1;
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 10);
    count++;
  }
  return count;
}
`,
  7: `function factorialIter(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function factorialRec(n) {
  if (n <= 1) return 1;
  return n * factorialRec(n - 1);
}
`,
  8: `function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}
`,
  9: `function primesUpTo(n) {
  if (n < 2) return [];
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= n; m += p) isPrime[m] = false;
    }
  }
  const out = [];
  for (let i = 2; i <= n; i++) if (isPrime[i]) out.push(i);
  return out;
}
`,
  10: `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}
`,
  11: `function isArmstrong(n) {
  let k = 0;
  for (let rest = n; rest > 0; rest = Math.floor(rest / 10)) k++;
  let total = 0;
  for (let rest = n; rest > 0; rest = Math.floor(rest / 10)) total += (rest % 10) ** k;
  return total === n;
}
`,
  12: `function isPerfect(n) {
  if (n < 2) return false;
  let total = 0;
  for (let d = 1; d < n; d++) if (n % d === 0) total += d;
  return total === n;
}
`,
  13: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
`,
  14: `function isPowerOfTwo(n) {
  if (n < 1) return false;
  while (n % 2 === 0) n /= 2;
  return n === 1;
}
`,
  15: `function toBinary(n) {
  if (n === 0) return "0";
  let out = "";
  while (n > 0) {
    out = (n % 2) + out;
    n = Math.floor(n / 2);
  }
  return out;
}
`,
  16: `function fromBinary(s) {
  let value = 0;
  for (const ch of s) value = value * 2 + Number(ch);
  return value;
}
`,
  17: `function countOnes(n) {
  let count = 0;
  while (n > 0) {
    count += n % 2;
    n = Math.floor(n / 2);
  }
  return count;
}
`,
  18: `function power(x, n) {
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
}
`,
  19: `function intSqrt(n) {
  let low = 0;
  let high = n;
  let answer = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (mid * mid <= n) {
      answer = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return answer;
}
`,
  20: `function isLeap(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}
`,
  21: `function sumMultiples(limit) {
  let total = 0;
  for (let i = 1; i < limit; i++) if (i % 3 === 0 || i % 5 === 0) total += i;
  return total;
}
`,
  22: `function toRoman(n) {
  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [value, letters] of table) {
    while (n >= value) {
      out += letters;
      n -= value;
    }
  }
  return out;
}
`,
  23: `function fromRoman(s) {
  const value = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = value[s[i]];
    if (i + 1 < s.length && v < value[s[i + 1]]) total -= v;
    else total += v;
  }
  return total;
}
`,
  24: `function addStrings(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let out = "";
  while (i >= 0 || j >= 0 || carry) {
    const total = (i >= 0 ? Number(a[i]) : 0) + (j >= 0 ? Number(b[j]) : 0) + carry;
    out = (total % 10) + out;
    carry = Math.floor(total / 10);
    i--;
    j--;
  }
  return out;
}
`,
  25: `function multiplyStrings(a, b) {
  const places = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      places[a.length - 1 - i + (b.length - 1 - j)] += Number(a[i]) * Number(b[j]);
    }
  }
  for (let k = 0; k + 1 < places.length; k++) {
    places[k + 1] += Math.floor(places[k] / 10);
    places[k] %= 10;
  }
  while (places.length > 1 && places[places.length - 1] === 0) places.pop();
  return places.reverse().join("");
}
`,
};
