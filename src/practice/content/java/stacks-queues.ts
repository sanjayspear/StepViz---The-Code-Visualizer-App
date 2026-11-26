// Practice, Java: Stacks & queues (Q151-Q170). Tests come from the Python content;
// reference solutions in tests/practice/java/stacks-queues.solutions.ts.
import { fromPython, jsTests } from '../javascript/shared';
import { STACKS_QUEUES } from '../python/stacks-queues';
import type { PracticeTest } from '../types';
import { one } from './shared';

const UTIL = 'import java.util.*;';
const call = (header: string, comment: string, expr: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${expr}));` : `System.out.println(${expr});`, UTIL);

/** Q152 in Java: Java already has a Stack class, so ours is ArrayStack; it holds int values only. */
const q152: PracticeTest[] = jsTests(STACKS_QUEUES.find((c) => c.id === 152)!.tests).map((t, i) => {
  const ops = t.ops!.map((op, k) => (k === 0 ? ['ArrayStack'] : op));
  if (i < 2) return { ...t, cls: 'ArrayStack', ops };
  return {
    call: '$ops',
    cls: 'ArrayStack',
    ops: [['ArrayStack'], ['push', 1], ['push', 2], ['push', 3], ['pop'], ['pop'], ['push', 4], ['peek']],
    expected: [null, null, null, null, 3, 2, null, 4],
  };
});

const cls = (body: string, main: string) => `import java.util.*;\n\n${body.trim()}\n\npublic class Main {\n    public static void main(String[] args) {\n${main
  .split('\n')
  .map((l) => `        ${l}`)
  .join('\n')}\n    }\n}\n`;

export const STACKS_QUEUES_JAVA = fromPython(STACKS_QUEUES, {
  151: {
    example: 'Example: isBalanced("{[]}") returns true, isBalanced("([)]") returns false.',
    starter: call(
      'boolean isBalanced(String s)',
      'true if every (, [ and { is closed by the right bracket in the right order.\nCharacters that are not brackets do not matter.',
      'isBalanced("{[]}")',
    ),
  },
  152: {
    example: 'Example: s = new ArrayStack(); s.push(1); s.push(2); s.pop() returns 2; s.peek() returns 1.',
    starter: cls(
      `class ArrayStack {
    // A stack of int values kept in an ArrayList. pop() and peek() give null when the stack is empty.
    ArrayStack() {
    }

    void push(int x) {
    }

    Integer pop() {
        return null;
    }

    Integer peek() {
        return null;
    }

    boolean isEmpty() {
        return false;
    }
}`,
      'ArrayStack s = new ArrayStack();\ns.push(1);\ns.push(2);\nSystem.out.println(s.pop());\nSystem.out.println(s.peek());',
    ),
    tests: q152,
    hint: 'Keep an ArrayList<Integer>. push adds to the end, pop removes and returns the last item (if any), peek returns the last item without removing it, isEmpty checks the size. Like a stack of plates: you only touch the top one.',
  },
  153: {
    example: 'Example: q = new MyQueue(); q.push(1); q.push(2); q.peek() returns 1; q.pop() returns 1.',
    starter: cls(
      `class MyQueue {
    // A first-in first-out queue built from two stacks (Stack<Integer> with push and pop only).
    MyQueue() {
    }

    void push(int x) {
    }

    int pop() {
        // Remove and return the front item.
        return 0;
    }

    int peek() {
        // The front item.
        return 0;
    }

    boolean empty() {
        return false;
    }
}`,
      'MyQueue q = new MyQueue();\nq.push(1);\nq.push(2);\nSystem.out.println(q.peek());\nSystem.out.println(q.pop());',
    ),
    forbid: {
      names: ['Queue', 'Deque', 'ArrayDeque', 'LinkedList', 'PriorityQueue'],
      patterns: [
        { regex: '\\.remove\\(0\\)', shown: 'remove(0)' },
        { regex: '\\.add\\(0,', shown: 'add(0, ...)' },
      ],
      why: 'This question asks you to use two stacks only (push and pop), not a queue or remove(0).',
    },
  },
  154: {
    example: 'Example: s = new MyStack(); s.push(1); s.push(2); s.top() returns 2; s.pop() returns 2.',
    starter: cls(
      `class MyStack {
    // A last-in first-out stack built from a queue (Queue<Integer> q = new LinkedList<>()
    // used only with offer, poll, peek and size).
    MyStack() {
    }

    void push(int x) {
    }

    int pop() {
        // Remove and return the top item.
        return 0;
    }

    int top() {
        return 0;
    }

    boolean empty() {
        return false;
    }
}`,
      'MyStack s = new MyStack();\ns.push(1);\ns.push(2);\nSystem.out.println(s.top());\nSystem.out.println(s.pop());',
    ),
    hint: 'Use one queue. After offering a new item, rotate the queue: poll and offer the other size - 1 items, so the newest item is now at the front. Then pop and top just use the front. Like a revolving door that turns until the last person to enter is first to leave.',
    forbid: {
      names: ['Stack', 'Deque', 'ArrayDeque', 'pollLast', 'peekLast', 'removeLast', 'getLast', 'addFirst', 'offerFirst', 'Collections'],
      why: 'This question asks you to use queue operations only (offer, poll and peek), not a stack or a deque.',
    },
  },
  155: {
    example: 'Example: reverseWithStack("hello") returns "olleh".',
    starter: call('String reverseWithStack(String s)', 'Reverse s by pushing its letters on a stack and popping them off.', 'reverseWithStack("hello")'),
    hint: 'Push every letter onto a Stack<Character>; then pop them one by one onto the result: the last letter in comes out first. Like stacking books and taking them off again: the order is reversed.',
    forbid: { names: ['reverse'], why: 'This question asks you to reverse with a stack, not reverse().' },
  },
  156: {
    example: 'Example: removeAdjacentDuplicates("abbaca") returns "ca".',
    starter: call('String removeAdjacentDuplicates(String s)', 'Remove two equal letters standing side by side, again and again, until none are left.', 'removeAdjacentDuplicates("abbaca")'),
    hint: 'Go through the letters with a stack (a StringBuilder works: look at its last letter): if the letter equals the top of the stack, remove the top (the pair disappears); otherwise add the letter. The stack holds the answer. Like a game of matching tiles that vanish when two of the same land together.',
  },
  157: {
    example: 'Example: binaryNumbers(5) returns [1, 10, 11, 100, 101].',
    starter: call('List<String> binaryNumbers(int n)', 'The binary forms of 1 to n, as text, using a queue (no Integer.toBinaryString()).', 'binaryNumbers(5)'),
    hint: 'Start a Queue<String> with "1". Take the front item (poll), add it to the answer, and offer item + "0" and item + "1" at the back. Repeat n times. Like a family tree written row by row: each name has two children, written in order.',
    forbid: { names: ['toBinaryString', 'toString', 'format'], why: 'This question asks you to build the binary numbers with a queue, not Integer.toBinaryString().' },
  },
  158: {
    example: 'Example: after pushing -2, 0, -3: getMin() returns -3; after pop(), getMin() returns -2.',
    starter: cls(
      `class MinStack {
    // A stack that can also tell its smallest item in O(1).
    MinStack() {
    }

    void push(int x) {
    }

    void pop() {
    }

    int top() {
        return 0;
    }

    int getMin() {
        return 0;
    }
}`,
      'MinStack s = new MinStack();\ns.push(-2);\ns.push(0);\ns.push(-3);\nSystem.out.println(s.getMin());',
    ),
    hint: 'Keep two stacks: the values, and the smallest value so far at each height (push Math.min(x, the current smallest)). Pop both together; the smallest is always the top of the second stack. Like a stack of boxes where each box has a note saying the lightest box from here down.',
  },
  159: {
    example: 'Example: evalPostfix("2 3 1 * + 9 -") returns -4.',
    starter: call(
      'int evalPostfix(String expr)',
      'Numbers and + - * / separated by spaces, operators after their two numbers.\n"/" is whole-number division that cuts toward zero (like int division in Java).',
      'evalPostfix("2 3 1 * + 9 -")',
    ),
  },
  160: {
    example: 'Example: infixToPostfix("a+b*c") returns "abc*+".',
    starter: call(
      'String infixToPostfix(String expr)',
      'Letters, + - * / ^ and brackets, no spaces. Write it in postfix (operators after their operands).\n* and / come before + and -; ^ comes first and groups right to left.',
      'infixToPostfix("(a+b)*c")',
    ),
  },
  161: {
    example: 'Example: nextGreater(new int[] {4, 5, 2, 25}) returns [5, 25, 25, -1].',
    starter: call('int[] nextGreater(int[] nums)', 'For each number, the first bigger number to its right, or -1.', 'nextGreater(new int[] {4, 5, 2, 25})', true),
  },
  162: {
    example: 'Example: dailyTemperatures(new int[] {73, 74, 75, 71, 69, 72, 76, 73}) returns [1, 1, 4, 2, 1, 1, 0, 0].',
    starter: call('int[] dailyTemperatures(int[] temps)', 'For each day, how many days until a warmer day (0 if none).', 'dailyTemperatures(new int[] {73, 74, 75, 71, 69, 72, 76, 73})', true),
  },
  163: {
    example: 'Example: simplifyPath("/a/./b/../c/") returns "/a/c".',
    starter: call(
      'String simplifyPath(String path)',
      'A Unix path: "." stays, ".." goes up one folder, extra slashes do not count.\nReturn the shortest form (it starts with "/" and has no "/" at the end).',
      'simplifyPath("/a/./b/../c/")',
    ),
    hint: 'Split on "/" (path.split("/")). Skip empty parts and "."; for "..", pop the last folder from a stack (if there is one); push anything else. Join the stack with "/" after a leading "/". Like walking through folders: ".." takes you back to the folder you came from.',
  },
  164: {
    example: 'Example: decodeString("3[a2[c]]") returns "accaccacc".',
    starter: call('String decodeString(String s)', 'k[text] means text repeated k times; brackets can be inside brackets.', 'decodeString("3[a2[c]]")'),
    hint: 'Keep the current text and number. At "[", push the text so far and the number on two stacks and start fresh; at "]", pop them and set text = oldText + text repeated number times. Digits build the number (it may have several digits). Like opening nested boxes: finish the inner box before going back to the outer one.',
  },
  165: {
    example: 'Example: q = new MyCircularQueue(3): three enqueues return true, a fourth returns false (full).',
    starter: cls(
      `class MyCircularQueue {
    // A queue of fixed size k kept in an int[k] that wraps around.
    MyCircularQueue(int k) {
    }

    boolean enqueue(int value) {
        // Add at the back; false if the queue is full.
        return false;
    }

    boolean dequeue() {
        // Remove the front; false if the queue is empty.
        return false;
    }

    int front() {
        // The front value, or -1 if empty.
        return 0;
    }

    int rear() {
        // The back value, or -1 if empty.
        return 0;
    }

    boolean isEmpty() {
        return false;
    }

    boolean isFull() {
        return false;
    }
}`,
      'MyCircularQueue q = new MyCircularQueue(3);\nSystem.out.println(q.enqueue(1));\nSystem.out.println(q.front());',
    ),
  },
  166: {
    example: 'Example: stockSpan(new int[] {100, 80, 60, 70, 60, 75, 85}) returns [1, 1, 1, 2, 1, 4, 6].',
    starter: call('int[] stockSpan(int[] prices)', "For each day, how many days in a row up to and including it had a price <= that day's price.", 'stockSpan(new int[] {100, 80, 60, 70, 60, 75, 85})', true),
    hint: "Keep a stack of positions. For a new price, pop every position whose price is <= it; the span is today minus the position left on top (or today + 1 if the stack is empty); then push today. Like a tall person in a crowd who can see over everyone shorter in front.",
  },
  167: {
    example: 'Example: asteroidCollision(new int[] {10, 2, -5}) returns [10].',
    starter: call(
      'int[] asteroidCollision(int[] asteroids)',
      'Positive moves right, negative moves left, size is the absolute value.\nWhen two meet, the smaller one explodes (both if equal). What is left, in order?',
      'asteroidCollision(new int[] {10, 2, -5})',
      true,
    ),
  },
  168: {
    example: 'Example: largestRectangle(new int[] {2, 1, 5, 6, 2, 3}) returns 10.',
    starter: call('int largestRectangle(int[] heights)', 'Bars of width 1 with these heights. The area of the largest rectangle inside them.', 'largestRectangle(new int[] {2, 1, 5, 6, 2, 3})'),
  },
  169: {
    example: 'Example: calculate("(1+(4+5+2)-3)+(6+8)") returns 23.',
    starter: call('int calculate(String s)', 'Whole numbers, + and - (also a minus in front of brackets), brackets and spaces.', 'calculate("(1+(4+5+2)-3)+(6+8)")'),
    forbid: null,
  },
  170: {
    example: 'Example: longestValidParentheses(")()())") returns 4 ("()()").',
    starter: call('int longestValidParentheses(String s)', 'The length of the longest part of s made of correctly matched ( and ).', 'longestValidParentheses(")()())")'),
  },
});
