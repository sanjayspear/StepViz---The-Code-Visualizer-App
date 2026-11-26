// Practice, C++: Stacks & queues (Q151-Q170). Tests come from the Python content;
// reference solutions in tests/practice/cpp/stacks-queues.solutions.ts.
import { fromPython } from '../javascript/shared';
import { STACKS_QUEUES } from '../python/stacks-queues';
import type { PracticeTest } from '../types';
import { cppStarter, PRINT_INTS } from './shared';

const fn = (header: string, comment: string, setup: string, print: string) => cppStarter([[header, comment]], `${setup}\n${print}`, ['stack', 'queue'], PRINT_INTS);
const show = (expr: string) => `cout << ${expr} << endl;`;

/** Q152 in C++: int values only, and pop() / peek() give -1 when the stack is empty. */
const q152: PracticeTest[] = [
  {
    call: '$ops',
    cls: 'Stack',
    ops: [['Stack'], ['push', 1], ['push', 2], ['peek'], ['pop'], ['peek'], ['isEmpty'], ['pop'], ['isEmpty'], ['pop']],
    expected: [null, null, null, 2, 2, 1, false, 1, true, -1],
  },
  { call: '$ops', cls: 'Stack', ops: [['Stack'], ['isEmpty'], ['peek'], ['push', 5], ['isEmpty']], expected: [null, true, -1, null, false] },
  { call: '$ops', cls: 'Stack', ops: [['Stack'], ['push', 1], ['push', 2], ['push', 3], ['pop'], ['pop'], ['push', 4], ['peek']], expected: [null, null, null, null, 3, 2, null, 4] },
];

const cls = (body: string, main: string) =>
  `#include <iostream>\n#include <vector>\n#include <stack>\n#include <queue>\nusing namespace std;\n\n${body.trim()}\n\nint main() {\n${main
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n')}\n    return 0;\n}\n`;

export const STACKS_QUEUES_CPP = fromPython(STACKS_QUEUES, {
  151: {
    example: 'Example: isBalanced("{[]}") returns true, isBalanced("([)]") returns false.',
    starter: fn(
      'bool isBalanced(string s)',
      'true if every (, [ and { is closed by the right bracket in the right order.\nCharacters that are not brackets do not matter.',
      '',
      'cout << boolalpha << isBalanced("{[]}") << endl;',
    ),
  },
  152: {
    example: 'Example: Stack s; s.push(1); s.push(2); s.pop() returns 2; s.peek() returns 1.',
    starter: cls(
      `class Stack {
public:
    // A stack of int values kept in a vector. pop() and peek() give -1 when the stack is empty.
    Stack() {
    }

    void push(int x) {
    }

    int pop() {
        return 0;
    }

    int peek() {
        return 0;
    }

    bool isEmpty() {
        return false;
    }
};`,
      'Stack s;\ns.push(1);\ns.push(2);\ncout << s.pop() << endl;\ncout << s.peek() << endl;',
    ),
    tests: q152,
    hint: 'Keep a vector<int>. push adds to the end (push_back), pop removes and returns the last item (back, then pop_back), peek returns the last item without removing it, isEmpty checks empty(). Like a stack of plates: you only touch the top one.',
  },
  153: {
    example: 'Example: MyQueue q; q.push(1); q.push(2); q.peek() returns 1; q.pop() returns 1.',
    starter: cls(
      `class MyQueue {
public:
    // A first-in first-out queue built from two stacks (stack<int> with push, top and pop only).
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

    bool empty() {
        return false;
    }
};`,
      'MyQueue q;\nq.push(1);\nq.push(2);\ncout << q.peek() << endl;\ncout << q.pop() << endl;',
    ),
    hint: 'Push onto an "in" stack. To pop or peek, if the "out" stack is empty, move everything from "in" to "out" (taking from the top reverses the order); then the top of "out" is the front of the queue. Like pouring a pile of coins into a second pile: the coin that was at the bottom ends up on top.',
    forbid: {
      names: ['deque'],
      patterns: [{ regex: '(queue|priority_queue|vector)<', shown: 'a queue or vector' }],
      why: 'This question asks you to use two stacks only (push, top and pop), not a queue or a vector.',
    },
  },
  154: {
    example: 'Example: MyStack s; s.push(1); s.push(2); s.top() returns 2; s.pop() returns 2.',
    starter: cls(
      `class MyStack {
public:
    // A last-in first-out stack built from a queue (queue<int> with push, front, pop and size only).
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

    bool empty() {
        return false;
    }
};`,
      'MyStack s;\ns.push(1);\ns.push(2);\ncout << s.top() << endl;\ncout << s.pop() << endl;',
    ),
    hint: 'Use one queue. After pushing a new item, rotate the queue: take the front and push it to the back, size - 1 times, so the newest item is now at the front. Then pop and top just use the front. Like a revolving door that turns until the last person to enter is first to leave.',
    forbid: {
      names: ['deque'],
      patterns: [{ regex: '(stack|vector|priority_queue)<', shown: 'a stack or vector' }],
      why: 'This question asks you to use queue operations only (push, front and pop), not a stack or a vector.',
    },
  },
  155: {
    example: 'Example: reverseWithStack("hello") returns "olleh".',
    starter: fn('string reverseWithStack(string s)', 'Reverse s by pushing its letters on a stack and popping them off.', '', show('reverseWithStack("hello")')),
    hint: 'Push every letter onto a stack<char>; then take them off one by one (top, then pop) onto the result: the last letter in comes out first. Like stacking books and taking them off again: the order is reversed.',
    forbid: { names: ['reverse', 'rbegin', 'rend'], why: 'This question asks you to reverse with a stack, not reverse().' },
  },
  156: {
    example: 'Example: removeAdjacentDuplicates("abbaca") returns "ca".',
    starter: fn('string removeAdjacentDuplicates(string s)', 'Remove two equal letters standing side by side, again and again, until none are left.', '', show('removeAdjacentDuplicates("abbaca")')),
    hint: 'Go through the letters with a string used as a stack: if the letter equals its last letter (back), remove that one (pop_back; the pair disappears); otherwise add the letter (push_back). The stack holds the answer. Like a game of matching tiles that vanish when two of the same land together.',
  },
  157: {
    example: 'Example: binaryNumbers(5) returns [1, 10, 11, 100, 101].',
    starter: fn('vector<string> binaryNumbers(int n)', 'The binary forms of 1 to n, as text, using a queue (no bitset).', '', 'vector<string> r = binaryNumbers(5);\nfor (string x : r) cout << x << " ";\ncout << endl;'),
    hint: 'Start a queue<string> with "1". Take the front item (front, then pop), add it to the answer, and push item + "0" and item + "1" at the back. Repeat n times. Like a family tree written row by row: each name has two children, written in order.',
    forbid: { names: ['bitset'], why: 'This question asks you to build the binary numbers with a queue, not bitset.' },
  },
  158: {
    example: 'Example: after pushing -2, 0, -3: getMin() returns -3; after pop(), getMin() returns -2.',
    starter: cls(
      `class MinStack {
public:
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
};`,
      'MinStack s;\ns.push(-2);\ns.push(0);\ns.push(-3);\ncout << s.getMin() << endl;',
    ),
    hint: 'Keep two stacks: the values, and the smallest value so far at each height (push min(x, the current smallest)). Pop both together; the smallest is always the top of the second stack. Like a stack of boxes where each box has a note saying the lightest box from here down.',
  },
  159: {
    example: 'Example: evalPostfix("2 3 1 * + 9 -") returns -4.',
    starter: fn(
      'int evalPostfix(string expr)',
      'Numbers and + - * / separated by spaces, operators after their two numbers.\n"/" is whole-number division that cuts toward zero (like int division in C++).',
      '',
      show('evalPostfix("2 3 1 * + 9 -")'),
    ),
    hint: 'Read the tokens left to right (build each one until a space). Push numbers (stoi) on a stack; for an operator, pop the second number, then the first, apply the operator, and push the result. The last number on the stack is the answer. Like a calculator that waits until it has two numbers before you press the button.',
  },
  160: {
    example: 'Example: infixToPostfix("a+b*c") returns "abc*+".',
    starter: fn(
      'string infixToPostfix(string expr)',
      'Letters, + - * / ^ and brackets, no spaces. Write it in postfix (operators after their operands).\n* and / come before + and -; ^ comes first and groups right to left.',
      '',
      show('infixToPostfix("(a+b)*c")'),
    ),
  },
  161: {
    example: 'Example: nextGreater({4, 5, 2, 25}) returns [5, 25, 25, -1].',
    starter: fn('vector<int> nextGreater(vector<int>& nums)', 'For each number, the first bigger number to its right, or -1.', 'vector<int> nums = {4, 5, 2, 25};', 'vector<int> r = nextGreater(nums);\nprintVector(r);'),
  },
  162: {
    example: 'Example: dailyTemperatures({73, 74, 75, 71, 69, 72, 76, 73}) returns [1, 1, 4, 2, 1, 1, 0, 0].',
    starter: fn('vector<int> dailyTemperatures(vector<int>& temps)', 'For each day, how many days until a warmer day (0 if none).', 'vector<int> temps = {73, 74, 75, 71, 69, 72, 76, 73};', 'vector<int> r = dailyTemperatures(temps);\nprintVector(r);'),
  },
  163: {
    example: 'Example: simplifyPath("/a/./b/../c/") returns "/a/c".',
    starter: fn(
      'string simplifyPath(string path)',
      'A Unix path: "." stays, ".." goes up one folder, extra slashes do not count.\nReturn the shortest form (it starts with "/" and has no "/" at the end).',
      '',
      show('simplifyPath("/a/./b/../c/")'),
    ),
    hint: 'Read the folder names between the slashes one by one. Skip empty names and "."; for "..", remove the last folder from a vector<string> used as a stack (if there is one); add anything else. Join the stack with "/" after a leading "/". Like walking through folders: ".." takes you back to the folder you came from.',
  },
  164: {
    example: 'Example: decodeString("3[a2[c]]") returns "accaccacc".',
    starter: fn('string decodeString(string s)', 'k[text] means text repeated k times; brackets can be inside brackets.', '', show('decodeString("3[a2[c]]")')),
    hint: 'Keep the current text and number. At "[", push the text so far and the number on two stacks and start fresh; at "]", pop them and set text = oldText + text repeated number times. Digits build the number (it may have several digits). Like opening nested boxes: finish the inner box before going back to the outer one.',
  },
  165: {
    example: 'Example: MyCircularQueue q(3): three enqueues return true, a fourth returns false (full).',
    starter: cls(
      `class MyCircularQueue {
public:
    // A queue of fixed size k kept in a vector of k places that wraps around.
    MyCircularQueue(int k) {
    }

    bool enqueue(int value) {
        // Add at the back; false if the queue is full.
        return false;
    }

    bool dequeue() {
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

    bool isEmpty() {
        return false;
    }

    bool isFull() {
        return false;
    }
};`,
      'MyCircularQueue q(3);\ncout << boolalpha << q.enqueue(1) << endl;\ncout << q.front() << endl;',
    ),
  },
  166: {
    example: 'Example: stockSpan({100, 80, 60, 70, 60, 75, 85}) returns [1, 1, 1, 2, 1, 4, 6].',
    starter: fn(
      'vector<int> stockSpan(vector<int>& prices)',
      "For each day, how many days in a row up to and including it had a price <= that day's price.",
      'vector<int> prices = {100, 80, 60, 70, 60, 75, 85};',
      'vector<int> r = stockSpan(prices);\nprintVector(r);',
    ),
    hint: 'Keep a stack of positions. For a new price, pop every position whose price is <= it; the span is today minus the position left on top (or today + 1 if the stack is empty); then push today. Like a tall person in a crowd who can see over everyone shorter in front.',
  },
  167: {
    example: 'Example: asteroidCollision({10, 2, -5}) returns [10].',
    starter: fn(
      'vector<int> asteroidCollision(vector<int>& asteroids)',
      'Positive moves right, negative moves left, size is the absolute value.\nWhen two meet, the smaller one explodes (both if equal). What is left, in order?',
      'vector<int> asteroids = {10, 2, -5};',
      'vector<int> r = asteroidCollision(asteroids);\nprintVector(r);',
    ),
  },
  168: {
    example: 'Example: largestRectangle({2, 1, 5, 6, 2, 3}) returns 10.',
    starter: fn('int largestRectangle(vector<int>& heights)', 'Bars of width 1 with these heights. The area of the largest rectangle inside them.', 'vector<int> heights = {2, 1, 5, 6, 2, 3};', show('largestRectangle(heights)')),
  },
  169: {
    example: 'Example: calculate("(1+(4+5+2)-3)+(6+8)") returns 23.',
    starter: fn('int calculate(string s)', 'Whole numbers, + and - (also a minus in front of brackets), brackets and spaces.', '', show('calculate("(1+(4+5+2)-3)+(6+8)")')),
    forbid: null,
  },
  170: {
    example: 'Example: longestValidParentheses(")()())") returns 4 ("()()").',
    starter: fn('int longestValidParentheses(string s)', 'The length of the longest part of s made of correctly matched ( and ).', '', show('longestValidParentheses(")()())")')),
  },
});
