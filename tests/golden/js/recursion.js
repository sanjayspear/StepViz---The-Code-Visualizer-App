function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
console.log(fib(15), fact(20), fact(25));
function hanoi(n, from, to, via) {
  if (n === 0) return 0;
  return hanoi(n - 1, from, via, to) + 1 + hanoi(n - 1, via, to, from);
}
console.log(hanoi(5, "A", "C", "B"));
