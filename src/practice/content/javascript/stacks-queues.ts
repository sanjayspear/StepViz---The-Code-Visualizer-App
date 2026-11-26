// Practice, JavaScript: stacks-queues. Tests come from the Python content; reference solutions in tests/practice/js/stacks-queues.solutions.ts.
import { fromPython } from './shared';
import { STACKS_QUEUES } from '../python/stacks-queues';

export const STACKS_QUEUES_JS = fromPython(STACKS_QUEUES, {
  151: {
    example: 'Example: isBalanced("{[]}") returns true, isBalanced("([)]") returns false.',
    starter: `function isBalanced(s) {
  // true if every (, [ and { is closed by the right bracket in the right order.
  // Characters that are not brackets do not matter.
}

console.log(isBalanced("{[]}"));
`,
  },
  152: {
    example: 'Example: s = new Stack(); s.push(1); s.push(2); s.pop() returns 2; s.peek() returns 1.',
    starter: `class Stack {
  // A stack kept in an array. pop() and peek() give null when the stack is empty.
  constructor() {
  }

  push(x) {
  }

  pop() {
  }

  peek() {
  }

  isEmpty() {
  }
}

const s = new Stack();
s.push(1);
s.push(2);
console.log(s.pop(), s.peek());
`,
  },
  153: {
    example: 'Example: q = new MyQueue(); q.push(1); q.push(2); q.peek() returns 1; q.pop() returns 1.',
    starter: `class MyQueue {
  // A first-in first-out queue built from two stacks (arrays used only with push() and pop()).
  constructor() {
  }

  push(x) {
  }

  pop() {
    // Remove and return the front item.
  }

  peek() {
    // The front item.
  }

  empty() {
  }
}

const q = new MyQueue();
q.push(1);
q.push(2);
console.log(q.peek(), q.pop());
`,
    forbid: { names: ['shift', 'unshift', 'splice', 'reverse', 'toReversed'], why: 'This question asks you to use two stacks only (push() and pop()), not shift(), unshift(), splice() or reverse().' },
    hint: "Push onto an \"in\" stack. To pop or peek, if the \"out\" stack is empty, move everything from \"in\" to \"out\" (popping reverses the order); then the top of \"out\" is the front of the queue. Like pouring a pile of coins into a second pile: the coin that was at the bottom ends up on top.",
  },
  154: {
    example: 'Example: s = new MyStack(); s.push(1); s.push(2); s.top() returns 2; s.pop() returns 2.',
    starter: `class MyStack {
  // A last-in first-out stack built from a queue (an array used only with push() and shift()).
  constructor() {
  }

  push(x) {
  }

  pop() {
    // Remove and return the top item.
  }

  top() {
  }

  empty() {
  }
}

const s = new MyStack();
s.push(1);
s.push(2);
console.log(s.top(), s.pop());
`,
    hint: "Use one array as the queue. After pushing a new item, rotate the queue: shift() and push() the other items (length - 1 of them), so the newest item is now at the front. Then pop and top just use the front. Like a revolving door that turns until the last person to enter is first to leave.",
    forbid: { names: ['unshift', 'splice', 'reverse', 'toReversed'], why: 'This question asks you to use queue operations only (push() and shift()), not unshift(), splice() or reverse().' },
  },
  155: {
    example: 'Example: reverseWithStack("hello") returns "olleh".',
    starter: `function reverseWithStack(s) {
  // Reverse s by pushing its letters on a stack and popping them off.
}

console.log(reverseWithStack("hello"));
`,
    forbid: { names: ['reverse', 'toReversed', 'reduceRight'], why: 'This question asks you to reverse with a stack, not reverse().' },
    hint: "Push every letter onto an array (the stack); then pop them one by one onto the result: the last letter in comes out first. Like stacking books and taking them off again: the order is reversed.",
  },
  156: {
    example: 'Example: removeAdjacentDuplicates("abbaca") returns "ca".',
    starter: `function removeAdjacentDuplicates(s) {
  // Remove two equal letters standing side by side, again and again, until none are left.
}

console.log(removeAdjacentDuplicates("abbaca"));
`,
  },
  157: {
    example: 'Example: binaryNumbers(5) returns ["1", "10", "11", "100", "101"].',
    starter: `function binaryNumbers(n) {
  // The binary forms of 1 to n, as text, using a queue (no toString(2)).
}

console.log(binaryNumbers(5));
`,
    forbid: { names: ['toString'], why: 'This question asks you to build the binary numbers with a queue, not toString(2).' },
  },
  158: {
    example: 'Example: after pushing -2, 0, -3: getMin() returns -3; after pop(), getMin() returns -2.',
    starter: `class MinStack {
  // A stack that can also tell its smallest item in O(1).
  constructor() {
  }

  push(x) {
  }

  pop() {
  }

  top() {
  }

  getMin() {
  }
}

const s = new MinStack();
s.push(-2);
s.push(0);
s.push(-3);
console.log(s.getMin());
`,
  },
  159: {
    example: 'Example: evalPostfix("2 3 1 * + 9 -") returns -4.',
    starter: `function evalPostfix(expr) {
  // Numbers and + - * / separated by spaces, operators after their two numbers.
  // "/" is whole-number division that cuts toward zero (int(a / b)).
}

console.log(evalPostfix("2 3 1 * + 9 -"));
`,
  },
  160: {
    example: 'Example: infixToPostfix("a+b*c") returns "abc*+".',
    starter: `function infixToPostfix(expr) {
  // Letters, + - * / ^ and brackets, no spaces. Write it in postfix (operators after their operands).
  // * and / come before + and -; ^ comes first and groups right to left.
}

console.log(infixToPostfix("(a+b)*c"));
`,
  },
  161: {
    example: 'Example: nextGreater([4, 5, 2, 25]) returns [5, 25, 25, -1].',
    starter: `function nextGreater(nums) {
  // For each number, the first bigger number to its right, or -1.
}

console.log(nextGreater([4, 5, 2, 25]));
`,
  },
  162: {
    example: 'Example: dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]) returns [1, 1, 4, 2, 1, 1, 0, 0].',
    starter: `function dailyTemperatures(temps) {
  // For each day, how many days until a warmer day (0 if none).
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
`,
  },
  163: {
    example: 'Example: simplifyPath("/a/./b/../c/") returns "/a/c".',
    starter: `function simplifyPath(path) {
  // A Unix path: "." stays, ".." goes up one folder, extra slashes don't count.
  // Return the shortest form (it starts with "/" and has no "/" at the end).
}

console.log(simplifyPath("/a/./b/../c/"));
`,
  },
  164: {
    example: 'Example: decodeString("3[a2[c]]") returns "accaccacc".',
    starter: `function decodeString(s) {
  // k[text] means text repeated k times; brackets can be inside brackets.
}

console.log(decodeString("3[a2[c]]"));
`,
  },
  165: {
    example: 'Example: q = new MyCircularQueue(3): three enqueues return true, a fourth returns false (full).',
    starter: `class MyCircularQueue {
  // A queue of fixed size k kept in a array of k places that wraps around.
  constructor(k) {
  }

  enqueue(value) {
    // Add at the back; false if the queue is full.
  }

  dequeue() {
    // Remove the front; false if the queue is empty.
  }

  front() {
    // The front value, or -1 if empty.
  }

  rear() {
    // The back value, or -1 if empty.
  }

  isEmpty() {
  }

  isFull() {
  }
}

const q = new MyCircularQueue(3);
console.log(q.enqueue(1), q.front());
`,
  },
  166: {
    example: 'Example: stockSpan([100, 80, 60, 70, 60, 75, 85]) returns [1, 1, 1, 2, 1, 4, 6].',
    starter: `function stockSpan(prices) {
  // For each day, how many days in a row up to and including it had a price <= that day's price.
}

console.log(stockSpan([100, 80, 60, 70, 60, 75, 85]));
`,
  },
  167: {
    example: 'Example: asteroidCollision([10, 2, -5]) returns [10].',
    starter: `function asteroidCollision(asteroids) {
  // Positive moves right, negative moves left, size is the absolute value.
  // When two meet, the smaller one explodes (both if equal). What is left, in order?
}

console.log(asteroidCollision([10, 2, -5]));
`,
  },
  168: {
    example: 'Example: largestRectangle([2, 1, 5, 6, 2, 3]) returns 10.',
    starter: `function largestRectangle(heights) {
  // Bars of width 1 with these heights. The area of the largest rectangle inside them.
}

console.log(largestRectangle([2, 1, 5, 6, 2, 3]));
`,
  },
  169: {
    example: 'Example: calculate("(1+(4+5+2)-3)+(6+8)") returns 23.',
    starter: `function calculate(s) {
  // Whole numbers, + and - (also a minus in front of brackets), brackets and spaces.
}

console.log(calculate("(1+(4+5+2)-3)+(6+8)"));
`,
    forbid: { names: ['eval', 'Function'], why: 'This question asks you to calculate by hand, without eval().' },
  },
  170: {
    example: 'Example: longestValidParentheses(")()())") returns 4 ("()()").',
    starter: `function longestValidParentheses(s) {
  // The length of the longest part of s made of correctly matched ( and ).
}

console.log(longestValidParentheses(")()())"));
`,
    hint: 'Keep a stack of positions, starting with -1 (a "wall"). Push the position of each "("; for ")", pop, and if the stack is now empty push this position as the new wall, otherwise the valid part reaches from just after the stack top to here. Like measuring stretches of a zip that are properly closed.',
  },
});
