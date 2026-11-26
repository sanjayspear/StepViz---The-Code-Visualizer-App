// JavaScript reference solutions for Practice: Stacks & queues. Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  151: `function isBalanced(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (ch in pairs) {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}
`,
  152: `class Stack {
  constructor() {
    this.items = [];
  }

  push(x) {
    this.items.push(x);
  }

  pop() {
    return this.items.length ? this.items.pop() : null;
  }

  peek() {
    return this.items.length ? this.items[this.items.length - 1] : null;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
`,
  153: `class MyQueue {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }

  push(x) {
    this.inbox.push(x);
  }

  move() {
    if (this.outbox.length === 0) while (this.inbox.length) this.outbox.push(this.inbox.pop());
  }

  pop() {
    this.move();
    return this.outbox.pop();
  }

  peek() {
    this.move();
    return this.outbox[this.outbox.length - 1];
  }

  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}
`,
  154: `class MyStack {
  constructor() {
    this.q = [];
  }

  push(x) {
    this.q.push(x);
    for (let i = 0; i < this.q.length - 1; i++) this.q.push(this.q.shift());
  }

  pop() {
    return this.q.shift();
  }

  top() {
    return this.q[0];
  }

  empty() {
    return this.q.length === 0;
  }
}
`,
  155: `function reverseWithStack(s) {
  const stack = [...s];
  let out = "";
  while (stack.length) out += stack.pop();
  return out;
}
`,
  156: `function removeAdjacentDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join("");
}
`,
  157: `function binaryNumbers(n) {
  const out = [];
  const q = ["1"];
  for (let i = 0; i < n; i++) {
    const item = q.shift();
    out.push(item);
    q.push(item + "0", item + "1");
  }
  return out;
}
`,
  158: `class MinStack {
  constructor() {
    this.items = [];
  }

  push(x) {
    const n = this.items.length;
    this.items.push([x, n ? Math.min(x, this.items[n - 1][1]) : x]);
  }

  pop() {
    this.items.pop();
  }

  top() {
    return this.items[this.items.length - 1][0];
  }

  getMin() {
    return this.items[this.items.length - 1][1];
  }
}
`,
  159: `function evalPostfix(expr) {
  const stack = [];
  for (const tok of expr.split(" ")) {
    if (["+", "-", "*", "/"].includes(tok)) {
      const b = stack.pop();
      const a = stack.pop();
      if (tok === "+") stack.push(a + b);
      else if (tok === "-") stack.push(a - b);
      else if (tok === "*") stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else stack.push(Number(tok));
  }
  return stack[stack.length - 1];
}
`,
  160: `function infixToPostfix(expr) {
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  let out = "";
  const stack = [];
  for (const ch of expr) {
    if (/[a-z]/i.test(ch)) out += ch;
    else if (ch === "(") stack.push(ch);
    else if (ch === ")") {
      while (stack[stack.length - 1] !== "(") out += stack.pop();
      stack.pop();
    } else {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === "(" || !(prec[top] > prec[ch] || (prec[top] === prec[ch] && ch !== "^"))) break;
        out += stack.pop();
      }
      stack.push(ch);
    }
  }
  while (stack.length) out += stack.pop();
  return out;
}
`,
  161: `function nextGreater(nums) {
  const out = new Array(nums.length).fill(-1);
  const waiting = [];
  nums.forEach((x, i) => {
    while (waiting.length && nums[waiting[waiting.length - 1]] < x) out[waiting.pop()] = x;
    waiting.push(i);
  });
  return out;
}
`,
  162: `function dailyTemperatures(temps) {
  const out = new Array(temps.length).fill(0);
  const waiting = [];
  temps.forEach((t, i) => {
    while (waiting.length && temps[waiting[waiting.length - 1]] < t) {
      const j = waiting.pop();
      out[j] = i - j;
    }
    waiting.push(i);
  });
  return out;
}
`,
  163: `function simplifyPath(path) {
  const stack = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}
`,
  164: `function decodeString(s) {
  const stack = [];
  let text = "";
  let number = 0;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") number = number * 10 + Number(ch);
    else if (ch === "[") {
      stack.push([text, number]);
      text = "";
      number = 0;
    } else if (ch === "]") {
      const [oldText, k] = stack.pop();
      text = oldText + text.repeat(k);
    } else text += ch;
  }
  return text;
}
`,
  165: `class MyCircularQueue {
  constructor(k) {
    this.data = new Array(k).fill(0);
    this.k = k;
    this.head = 0;
    this.count = 0;
  }

  enqueue(value) {
    if (this.count === this.k) return false;
    this.data[(this.head + this.count) % this.k] = value;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.k;
    this.count--;
    return true;
  }

  front() {
    return this.count === 0 ? -1 : this.data[this.head];
  }

  rear() {
    return this.count === 0 ? -1 : this.data[(this.head + this.count - 1) % this.k];
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.k;
  }
}
`,
  166: `function stockSpan(prices) {
  const stack = [];
  const out = [];
  for (const p of prices) {
    let span = 1;
    while (stack.length && stack[stack.length - 1][0] <= p) span += stack.pop()[1];
    stack.push([p, span]);
    out.push(span);
  }
  return out;
}
`,
  167: `function asteroidCollision(asteroids) {
  const stack = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) stack.pop();
      else if (top === -a) {
        stack.pop();
        alive = false;
      } else alive = false;
    }
    if (alive) stack.push(a);
  }
  return stack;
}
`,
  168: `function largestRectangle(heights) {
  const stack = [];
  let best = 0;
  const bars = [...heights, 0];
  bars.forEach((h, i) => {
    while (stack.length && bars[stack[stack.length - 1]] > h) {
      const height = bars[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  });
  return best;
}
`,
  169: `function calculate(s) {
  let result = 0;
  let sign = 1;
  let number = 0;
  const stack = [];
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") number = number * 10 + Number(ch);
    else if (ch === "+" || ch === "-") {
      result += sign * number;
      number = 0;
      sign = ch === "+" ? 1 : -1;
    } else if (ch === "(") {
      stack.push([result, sign]);
      result = 0;
      sign = 1;
    } else if (ch === ")") {
      result += sign * number;
      number = 0;
      const [oldResult, oldSign] = stack.pop();
      result = oldResult + oldSign * result;
    }
  }
  return result + sign * number;
}
`,
  170: `function longestValidParentheses(s) {
  const stack = [-1];
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") stack.push(i);
    else {
      stack.pop();
      if (stack.length === 0) stack.push(i);
      else best = Math.max(best, i - stack[stack.length - 1]);
    }
  }
  return best;
}
`,
};
