outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    if (i === 2) break outer;
    console.log(i, j);
  }
}
let k = 0;
while (true) { if (++k > 3) break; }
console.log(k);
do { k--; } while (k > 0);
console.log(k);
