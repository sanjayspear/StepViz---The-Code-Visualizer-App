function counter() {
  let n = 0;
  return () => ++n;
}
const c = counter();
c(); c();
console.log(c());
const fns = [];
for (let i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map(f => f()).join(","));
var vs = [];
for (var j = 0; j < 3; j++) vs.push(() => j);
console.log(vs.map(f => f()).join(","));
