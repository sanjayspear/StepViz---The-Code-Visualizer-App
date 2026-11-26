console.log(1 == "1", 1 === "1", null == undefined, null === undefined, NaN == NaN, [1] == 1, "" == 0, 0 == false);
console.log(typeof null, typeof [], typeof undefined, typeof (() => 1), typeof 1n, Array.isArray([]), Object.is(-0, 0));
let n = null;
console.log(n ?? "default", n?.x, 0 || "or", 0 ?? "nn", "a" && "b");
