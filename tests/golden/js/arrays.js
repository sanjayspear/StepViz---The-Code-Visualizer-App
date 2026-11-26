const xs = [10, 1, 5, 100, 25];
console.log([...xs].sort(), [...xs].sort((m, n) => m - n));
console.log(xs.map(v => v * 2), xs.filter(v => v > 5), xs.reduce((s, v) => s + v), xs.indexOf(5), xs.includes(7));
console.log(xs.slice(1, 3), xs.join("-"), xs.length, [1, [2, [3]]].flat(), Array.from({ length: 3 }, (_, i) => i * i));
const ys = [3, 1, 2];
ys.splice(1, 1, "a", "b");
ys.push(9); ys.unshift(0);
console.log(ys, ys.pop(), ys.shift(), ys);
console.log([1, 2, 3].find(v => v > 1), [1, 2, 3].some(v => v > 2), [1, 2, 3].every(v => v > 0), [3, 1].reverse());
