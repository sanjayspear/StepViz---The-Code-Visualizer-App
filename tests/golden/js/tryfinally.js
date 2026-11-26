function f() {
  try {
    return "try";
  } finally {
    console.log("finally runs");
  }
}
console.log(f());
function g() {
  for (let i = 0; i < 3; i++) {
    try {
      if (i === 1) continue;
      if (i === 2) break;
      console.log("body", i);
    } finally {
      console.log("fin", i);
    }
  }
}
g();
try {
  null.x;
} catch (e) {
  console.log(e instanceof TypeError, e.name);
}
try { throw new Error("boom"); } catch ({ message }) { console.log(message); }
