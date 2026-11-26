const [a, b = 5, ...rest] = [1, undefined, 3, 4];
const { x, y: why = 2, ...others } = { x: 1, z: 3, w: 4 };
console.log(a, b, rest, x, why, others);
function sum(...nums) { return nums.reduce((s, n) => s + n, 0); }
console.log(sum(1, 2, 3), sum(...[4, 5]), Math.max(...[3, 9, 2]));
function greet(name = "you", greeting = `hi ${name}`) { return greeting; }
console.log(greet(), greet("Ann"));
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q);
