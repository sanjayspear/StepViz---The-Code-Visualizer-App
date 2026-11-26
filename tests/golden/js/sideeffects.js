let i = 0;
const arr = [10, 20, 30];
console.log(arr[i++], arr[i++], i);
let x = 5;
x += x++ + ++x;
console.log(x);
let calls = 0;
function hit() { calls++; return true; }
if (hit() || hit()) console.log("calls", calls);
let z = 0;
while (z++ < 3);
console.log(z);
for (let a = 0, b = 10; a < b; a += 3, b -= 3) console.log(a, b);
