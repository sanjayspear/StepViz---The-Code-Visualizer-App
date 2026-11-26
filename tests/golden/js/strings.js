const s = "Hello, World";
console.log(s.length, s[4], s.charAt(1), s.indexOf("o"), s.slice(-5), s.substring(7), s.toUpperCase());
console.log(s.split(", "), s.replace("l", "L"), s.replaceAll("l", "L"), s.includes("World"), s.startsWith("He"));
console.log("  pad  ".trim() + "|", "ab".repeat(3), "5".padStart(3, "0"), `sum=${1 + 2}`, "a" < "B", "abc".at(-1));
console.log("x".charCodeAt(0), String.fromCharCode(65), [..."héllo"].length, "a,b,,c".split(","));
