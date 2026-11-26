// Practice, Python: Stacks & queues (Q151-Q170). Reference solutions: tests/practice/stacks-queues.solutions.ts.
import type { PracticeContent } from '../types';

export const STACKS_QUEUES: PracticeContent[] = [
  {
    id: 151,
    example: 'Example: is_balanced("{[]}") returns True, is_balanced("([)]") returns False.',
    starter: `def is_balanced(s):
    # True if every (, [ and { is closed by the right bracket in the right order.
    # Characters that are not brackets do not matter.
    pass


print(is_balanced("{[]}"))
`,
    tests: [
      { call: 'is_balanced', args: ['()[]{}'], expected: true },
      { call: 'is_balanced', args: ['(]'], expected: false },
      { call: 'is_balanced', args: ['([)]'], expected: false },
      { call: 'is_balanced', args: ['{[]}'], expected: true },
      { call: 'is_balanced', args: [''], expected: true },
      { call: 'is_balanced', args: ['(('], expected: false },
      { call: 'is_balanced', args: ['a(b)c'], expected: true },
    ],
    hint: 'Push every opening bracket on a stack. For a closing bracket, the stack must not be empty and its top must be the matching opener: pop it. At the end the stack must be empty. Like Russian dolls: each one must close the doll opened most recently.',
  },
  {
    id: 152,
    example: 'Example: s = Stack(); s.push(1); s.push(2); s.pop() returns 2; s.peek() returns 1.',
    starter: `class Stack:
    # A stack kept in a list. pop() and peek() give None when the stack is empty.
    def __init__(self):
        pass

    def push(self, x):
        pass

    def pop(self):
        pass

    def peek(self):
        pass

    def is_empty(self):
        pass


s = Stack()
s.push(1)
s.push(2)
print(s.pop(), s.peek())
`,
    tests: [
      {
        call: '$ops',
        cls: 'Stack',
        ops: [['Stack'], ['push', 1], ['push', 2], ['peek'], ['pop'], ['peek'], ['is_empty'], ['pop'], ['is_empty'], ['pop']],
        expected: [null, null, null, 2, 2, 1, false, 1, true, null],
      },
      { call: '$ops', cls: 'Stack', ops: [['Stack'], ['is_empty'], ['peek'], ['push', 5], ['is_empty']], expected: [null, true, null, null, false] },
      { call: '$ops', cls: 'Stack', ops: [['Stack'], ['push', 'a'], ['push', 'b'], ['push', 'c'], ['pop'], ['pop'], ['push', 'd'], ['peek']], expected: [null, null, null, null, 'c', 'b', null, 'd'] },
    ],
    hint: 'Keep a list. push appends to the end, pop removes and returns the last item (if any), peek returns the last item without removing it, is_empty checks the length. Like a stack of plates: you only touch the top one.',
  },
  {
    id: 153,
    example: 'Example: q = MyQueue(); q.push(1); q.push(2); q.peek() returns 1; q.pop() returns 1.',
    starter: `class MyQueue:
    # A first-in first-out queue built from two stacks (lists used only with append and pop()).
    def __init__(self):
        pass

    def push(self, x):
        pass

    def pop(self):
        # Remove and return the front item.
        pass

    def peek(self):
        # The front item.
        pass

    def empty(self):
        pass


q = MyQueue()
q.push(1)
q.push(2)
print(q.peek(), q.pop())
`,
    tests: [
      { call: '$ops', cls: 'MyQueue', ops: [['MyQueue'], ['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']], expected: [null, null, null, 1, 1, false] },
      { call: '$ops', cls: 'MyQueue', ops: [['MyQueue'], ['empty'], ['push', 7], ['pop'], ['empty']], expected: [null, true, null, 7, true] },
      {
        call: '$ops',
        cls: 'MyQueue',
        ops: [['MyQueue'], ['push', 1], ['push', 2], ['pop'], ['push', 3], ['pop'], ['peek'], ['pop'], ['empty']],
        expected: [null, null, null, 1, null, 2, 3, 3, true],
      },
    ],
    hint: 'Push onto an "in" stack. To pop or peek, if the "out" stack is empty, move everything from "in" to "out" (popping reverses the order); then the top of "out" is the front of the queue. Like pouring a pile of coins into a second pile: the coin that was at the bottom ends up on top.',
    forbid: { names: ['deque', 'insert', 'Queue'], patterns: [{ regex: '\\.pop\\(0\\)', shown: 'pop(0)' }], why: 'This question asks you to use two stacks only (append and pop()), not deque, insert or pop(0).' },
  },
  {
    id: 154,
    example: 'Example: s = MyStack(); s.push(1); s.push(2); s.top() returns 2; s.pop() returns 2.',
    starter: `from collections import deque


class MyStack:
    # A last-in first-out stack built from queues (deque used only with append and popleft).
    def __init__(self):
        pass

    def push(self, x):
        pass

    def pop(self):
        # Remove and return the top item.
        pass

    def top(self):
        pass

    def empty(self):
        pass


s = MyStack()
s.push(1)
s.push(2)
print(s.top(), s.pop())
`,
    tests: [
      { call: '$ops', cls: 'MyStack', ops: [['MyStack'], ['push', 1], ['push', 2], ['top'], ['pop'], ['empty']], expected: [null, null, null, 2, 2, false] },
      { call: '$ops', cls: 'MyStack', ops: [['MyStack'], ['empty'], ['push', 9], ['top'], ['pop'], ['empty']], expected: [null, true, null, 9, 9, true] },
      {
        call: '$ops',
        cls: 'MyStack',
        ops: [['MyStack'], ['push', 1], ['push', 2], ['push', 3], ['pop'], ['push', 4], ['pop'], ['top']],
        expected: [null, null, null, null, 3, null, 4, 2],
      },
    ],
    hint: 'Use one queue. After appending a new item, rotate the queue: popleft and append the other len - 1 items, so the newest item is now at the front. Then pop and top just use the front. Like a revolving door that turns until the last person to enter is first to leave.',
    forbid: { names: ['reverse', 'reversed', 'insert'], why: 'This question asks you to use queue operations only (append and popleft), not insert or reverse.' },
  },
  {
    id: 155,
    example: 'Example: reverse_with_stack("hello") returns "olleh".',
    starter: `def reverse_with_stack(s):
    # Reverse s by pushing its letters on a stack and popping them off.
    pass


print(reverse_with_stack("hello"))
`,
    tests: [
      { call: 'reverse_with_stack', args: ['hello'], expected: 'olleh' },
      { call: 'reverse_with_stack', args: [''], expected: '' },
      { call: 'reverse_with_stack', args: ['ab'], expected: 'ba' },
      { call: 'reverse_with_stack', args: ['stack!'], expected: '!kcats' },
    ],
    hint: 'Append every letter to a list (the stack); then pop them one by one into the result: the last letter in comes out first. Like stacking books and taking them off again: the order is reversed.',
    forbid: { names: ['reversed', 'reverse'], patterns: [{ regex: '::-1\\]', shown: '[::-1]' }], why: 'This question asks you to reverse with a stack, not reversed(), .reverse() or [::-1].' },
  },
  {
    id: 156,
    example: 'Example: remove_adjacent_duplicates("abbaca") returns "ca".',
    starter: `def remove_adjacent_duplicates(s):
    # Remove two equal letters standing side by side, again and again, until none are left.
    pass


print(remove_adjacent_duplicates("abbaca"))
`,
    tests: [
      { call: 'remove_adjacent_duplicates', args: ['abbaca'], expected: 'ca' },
      { call: 'remove_adjacent_duplicates', args: ['azxxzy'], expected: 'ay' },
      { call: 'remove_adjacent_duplicates', args: [''], expected: '' },
      { call: 'remove_adjacent_duplicates', args: ['aa'], expected: '' },
      { call: 'remove_adjacent_duplicates', args: ['abc'], expected: 'abc' },
    ],
    hint: 'Go through the letters with a stack: if the letter equals the top of the stack, pop (the pair disappears); otherwise push it. The stack holds the answer. Like a game of matching tiles that vanish when two of the same land together.',
  },
  {
    id: 157,
    example: 'Example: binary_numbers(5) returns ["1", "10", "11", "100", "101"].',
    starter: `def binary_numbers(n):
    # The binary forms of 1 to n, as text, using a queue (no bin() or format()).
    pass


print(binary_numbers(5))
`,
    tests: [
      { call: 'binary_numbers', args: [5], expected: ['1', '10', '11', '100', '101'] },
      { call: 'binary_numbers', args: [1], expected: ['1'] },
      { call: 'binary_numbers', args: [0], expected: [] },
      { call: 'binary_numbers', args: [8], expected: ['1', '10', '11', '100', '101', '110', '111', '1000'] },
    ],
    hint: 'Start the queue with "1". Take the front item, add it to the answer, and put item + "0" and item + "1" at the back. Repeat n times. Like a family tree written row by row: each name has two children, written in order.',
    forbid: { names: ['bin', 'format'], why: 'This question asks you to build the binary numbers with a queue, not bin() or format().' },
  },
  {
    id: 158,
    example: 'Example: after pushing -2, 0, -3: get_min() returns -3; after pop(), get_min() returns -2.',
    starter: `class MinStack:
    # A stack that can also tell its smallest item in O(1).
    def __init__(self):
        pass

    def push(self, x):
        pass

    def pop(self):
        pass

    def top(self):
        pass

    def get_min(self):
        pass


s = MinStack()
s.push(-2)
s.push(0)
s.push(-3)
print(s.get_min())
`,
    tests: [
      {
        call: '$ops',
        cls: 'MinStack',
        ops: [['MinStack'], ['push', -2], ['push', 0], ['push', -3], ['get_min'], ['pop'], ['top'], ['get_min']],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      { call: '$ops', cls: 'MinStack', ops: [['MinStack'], ['push', 5], ['push', 5], ['push', 7], ['get_min'], ['pop'], ['pop'], ['get_min']], expected: [null, null, null, null, 5, null, null, 5] },
      { call: '$ops', cls: 'MinStack', ops: [['MinStack'], ['push', 3], ['push', 1], ['get_min'], ['pop'], ['get_min'], ['top']], expected: [null, null, null, 1, null, 3, 3] },
    ],
    hint: 'Store pairs on the stack: (value, smallest value so far including this one). The smallest is then always the second part of the top pair, even after popping. Like a stack of boxes where each box has a note saying the lightest box from here down.',
  },
  {
    id: 159,
    example: 'Example: eval_postfix("2 3 1 * + 9 -") returns -4.',
    starter: `def eval_postfix(expr):
    # Numbers and + - * / separated by spaces, operators after their two numbers.
    # "/" is whole-number division that cuts toward zero (int(a / b)).
    pass


print(eval_postfix("2 3 1 * + 9 -"))
`,
    tests: [
      { call: 'eval_postfix', args: ['2 3 1 * + 9 -'], expected: -4 },
      { call: 'eval_postfix', args: ['4 13 5 / +'], expected: 6 },
      { call: 'eval_postfix', args: ['10 6 9 3 + -11 * / * 17 + 5 +'], expected: 22 },
      { call: 'eval_postfix', args: ['5'], expected: 5 },
    ],
    hint: 'Read the tokens left to right. Push numbers on a stack; for an operator, pop the second number, then the first, apply the operator, and push the result. The last number on the stack is the answer. Like a calculator that waits until it has two numbers before you press the button.',
  },
  {
    id: 160,
    example: 'Example: infix_to_postfix("a+b*c") returns "abc*+".',
    starter: `def infix_to_postfix(expr):
    # Letters, + - * / ^ and brackets, no spaces. Write it in postfix (operators after their operands).
    # * and / come before + and -; ^ comes first and groups right to left.
    pass


print(infix_to_postfix("(a+b)*c"))
`,
    tests: [
      { call: 'infix_to_postfix', args: ['a+b*c'], expected: 'abc*+' },
      { call: 'infix_to_postfix', args: ['(a+b)*c'], expected: 'ab+c*' },
      { call: 'infix_to_postfix', args: ['a+b*(c^d-e)^(f+g*h)-i'], expected: 'abcd^e-fgh*+^*+i-' },
      { call: 'infix_to_postfix', args: ['a'], expected: 'a' },
      { call: 'infix_to_postfix', args: ['a-b-c'], expected: 'ab-c-' },
    ],
    hint: 'Shunting-yard: letters go straight to the output. An operator first pops operators of higher priority (or equal, unless it is ^) from the stack to the output, then is pushed. "(" is pushed; ")" pops to the output until "(". At the end pop everything. Like a railway yard holding carriages on a side track until it is their turn.',
  },
  {
    id: 161,
    example: 'Example: next_greater([4, 5, 2, 25]) returns [5, 25, 25, -1].',
    starter: `def next_greater(nums):
    # For each number, the first bigger number to its right, or -1.
    pass


print(next_greater([4, 5, 2, 25]))
`,
    tests: [
      { call: 'next_greater', args: [[4, 5, 2, 25]], expected: [5, 25, 25, -1] },
      { call: 'next_greater', args: [[13, 7, 6, 12]], expected: [-1, 12, 12, -1] },
      { call: 'next_greater', args: [[]], expected: [] },
      { call: 'next_greater', args: [[1, 1]], expected: [-1, -1] },
    ],
    hint: 'Keep a stack of positions still waiting for a bigger number. For each new number, pop every waiting position whose number is smaller and give it this number as its answer; then push the new position. Like people in a queue who leave as soon as someone taller than them arrives behind.',
  },
  {
    id: 162,
    example: 'Example: daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]) returns [1, 1, 4, 2, 1, 1, 0, 0].',
    starter: `def daily_temperatures(temps):
    # For each day, how many days until a warmer day (0 if none).
    pass


print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
`,
    tests: [
      { call: 'daily_temperatures', args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { call: 'daily_temperatures', args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { call: 'daily_temperatures', args: [[30, 60, 90]], expected: [1, 1, 0] },
      { call: 'daily_temperatures', args: [[50]], expected: [0] },
    ],
    hint: 'Same as the next greater element, but the answer is the distance: when day i pops a waiting day j, the answer for j is i - j. Like a weather diary where each cold day waits for the next warmer one.',
  },
  {
    id: 163,
    example: 'Example: simplify_path("/a/./b/../c/") returns "/a/c".',
    starter: `def simplify_path(path):
    # A Unix path: "." stays, ".." goes up one folder, extra slashes don't count.
    # Return the shortest form (it starts with "/" and has no "/" at the end).
    pass


print(simplify_path("/a/./b/../c/"))
`,
    tests: [
      { call: 'simplify_path', args: ['/home/'], expected: '/home' },
      { call: 'simplify_path', args: ['/../'], expected: '/' },
      { call: 'simplify_path', args: ['/home//foo/'], expected: '/home/foo' },
      { call: 'simplify_path', args: ['/a/./b/../../c/'], expected: '/c' },
      { call: 'simplify_path', args: ['/a/./b/../c/'], expected: '/a/c' },
    ],
    hint: 'Split on "/". Skip empty parts and "."; for "..", pop the last folder from a stack (if there is one); push anything else. Join the stack with "/" after a leading "/". Like walking through folders: ".." takes you back to the folder you came from.',
  },
  {
    id: 164,
    example: 'Example: decode_string("3[a2[c]]") returns "accaccacc".',
    starter: `def decode_string(s):
    # k[text] means text repeated k times; brackets can be inside brackets.
    pass


print(decode_string("3[a2[c]]"))
`,
    tests: [
      { call: 'decode_string', args: ['3[a]2[bc]'], expected: 'aaabcbc' },
      { call: 'decode_string', args: ['3[a2[c]]'], expected: 'accaccacc' },
      { call: 'decode_string', args: ['2[abc]3[cd]ef'], expected: 'abcabccdcdcdef' },
      { call: 'decode_string', args: ['abc'], expected: 'abc' },
      { call: 'decode_string', args: ['10[x]'], expected: 'xxxxxxxxxx' },
    ],
    hint: 'Keep the current text and number. At "[", push (text so far, number) on a stack and start fresh; at "]", pop them and set text = old_text + text * number. Digits build the number (it may have several digits). Like opening nested boxes: finish the inner box before going back to the outer one.',
  },
  {
    id: 165,
    example: 'Example: q = MyCircularQueue(3): three enqueues return True, a fourth returns False (full).',
    starter: `class MyCircularQueue:
    # A queue of fixed size k kept in a list of k places that wraps around.
    def __init__(self, k):
        pass

    def enqueue(self, value):
        # Add at the back; False if the queue is full.
        pass

    def dequeue(self):
        # Remove the front; False if the queue is empty.
        pass

    def front(self):
        # The front value, or -1 if empty.
        pass

    def rear(self):
        # The back value, or -1 if empty.
        pass

    def is_empty(self):
        pass

    def is_full(self):
        pass


q = MyCircularQueue(3)
print(q.enqueue(1), q.front())
`,
    tests: [
      {
        call: '$ops',
        cls: 'MyCircularQueue',
        ops: [['MyCircularQueue', 3], ['enqueue', 1], ['enqueue', 2], ['enqueue', 3], ['enqueue', 4], ['rear'], ['is_full'], ['dequeue'], ['enqueue', 4], ['rear']],
        expected: [null, true, true, true, false, 3, true, true, true, 4],
      },
      { call: '$ops', cls: 'MyCircularQueue', ops: [['MyCircularQueue', 1], ['front'], ['rear'], ['dequeue'], ['is_empty'], ['enqueue', 5], ['front'], ['is_full']], expected: [null, -1, -1, false, true, true, 5, true] },
      {
        call: '$ops',
        cls: 'MyCircularQueue',
        ops: [['MyCircularQueue', 2], ['enqueue', 1], ['enqueue', 2], ['dequeue'], ['dequeue'], ['enqueue', 3], ['enqueue', 4], ['front'], ['rear'], ['dequeue'], ['front']],
        expected: [null, true, true, true, true, true, true, 3, 4, true, 4],
      },
    ],
    hint: 'Keep a list of k places, the position of the front, and how many items there are. The back is at (front + count) % k; adding or removing just moves those numbers, wrapping round with % k. Like a round table with k seats where people keep moving clockwise.',
  },
  {
    id: 166,
    example: 'Example: stock_span([100, 80, 60, 70, 60, 75, 85]) returns [1, 1, 1, 2, 1, 4, 6].',
    starter: `def stock_span(prices):
    # For each day, how many days in a row up to and including it had a price <= that day's price.
    pass


print(stock_span([100, 80, 60, 70, 60, 75, 85]))
`,
    tests: [
      { call: 'stock_span', args: [[100, 80, 60, 70, 60, 75, 85]], expected: [1, 1, 1, 2, 1, 4, 6] },
      { call: 'stock_span', args: [[10, 4, 5, 90, 120, 80]], expected: [1, 1, 2, 4, 5, 1] },
      { call: 'stock_span', args: [[]], expected: [] },
      { call: 'stock_span', args: [[5, 5]], expected: [1, 2] },
    ],
    hint: 'Keep a stack of (price, span). For a new price, pop every entry with a price <= it and add its span to today\'s span (which starts at 1); then push (price, span). Like a tall person in a crowd who can see over everyone shorter in front.',
  },
  {
    id: 167,
    example: 'Example: asteroid_collision([10, 2, -5]) returns [10].',
    starter: `def asteroid_collision(asteroids):
    # Positive moves right, negative moves left, size is the absolute value.
    # When two meet, the smaller one explodes (both if equal). What is left, in order?
    pass


print(asteroid_collision([10, 2, -5]))
`,
    tests: [
      { call: 'asteroid_collision', args: [[5, 10, -5]], expected: [5, 10] },
      { call: 'asteroid_collision', args: [[8, -8]], expected: [] },
      { call: 'asteroid_collision', args: [[10, 2, -5]], expected: [10] },
      { call: 'asteroid_collision', args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
      { call: 'asteroid_collision', args: [[1, -2, -2, -2]], expected: [-2, -2, -2] },
    ],
    hint: 'Use a stack of survivors. A left-moving asteroid fights the right-moving ones on top of the stack: pop the smaller ones; if an equal one is on top, both go; if a bigger one is there, the new one goes. Otherwise it survives: push it. Like bumper cars where the heavier car always wins.',
  },
  {
    id: 168,
    example: 'Example: largest_rectangle([2, 1, 5, 6, 2, 3]) returns 10.',
    starter: `def largest_rectangle(heights):
    # Bars of width 1 with these heights. The area of the largest rectangle inside them.
    pass


print(largest_rectangle([2, 1, 5, 6, 2, 3]))
`,
    tests: [
      { call: 'largest_rectangle', args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { call: 'largest_rectangle', args: [[2, 4]], expected: 4 },
      { call: 'largest_rectangle', args: [[]], expected: 0 },
      { call: 'largest_rectangle', args: [[1, 1, 1, 1]], expected: 4 },
      { call: 'largest_rectangle', args: [[6, 2, 5, 4, 5, 1, 6]], expected: 12 },
    ],
    hint: 'Keep a stack of positions with rising heights. When a lower bar comes, pop the taller bars: each popped bar is the height of a rectangle that stretches from just after the new stack top to just before the current bar. Add a 0-height bar at the end to empty the stack. Like a city skyline where each building\'s widest window lasts until a lower building cuts it off.',
  },
  {
    id: 169,
    example: 'Example: calculate("(1+(4+5+2)-3)+(6+8)") returns 23.',
    starter: `def calculate(s):
    # Whole numbers, + and - (also a minus in front of brackets), brackets and spaces.
    pass


print(calculate("(1+(4+5+2)-3)+(6+8)"))
`,
    tests: [
      { call: 'calculate', args: ['1 + 1'], expected: 2 },
      { call: 'calculate', args: [' 2-1 + 2 '], expected: 3 },
      { call: 'calculate', args: ['(1+(4+5+2)-3)+(6+8)'], expected: 23 },
      { call: 'calculate', args: ['-(2+3)'], expected: -5 },
      { call: 'calculate', args: ['10 - (4 - (1 + 2))'], expected: 9 },
    ],
    hint: 'Keep a running result and a sign (+1 or -1). Read whole numbers and add sign * number. At "(", push the result and the sign, and start a fresh result; at ")", finish it: result = pushed_result + pushed_sign * result. Like doing the sum inside each bracket on a scrap of paper, then bringing the answer back.',
    forbid: { names: ['eval', 'exec', 'compile'], why: 'This question asks you to calculate by hand, without eval().' },
  },
  {
    id: 170,
    example: 'Example: longest_valid_parentheses(")()())") returns 4 ("()()").',
    starter: `def longest_valid_parentheses(s):
    # The length of the longest part of s made of correctly matched ( and ).
    pass


print(longest_valid_parentheses(")()())"))
`,
    tests: [
      { call: 'longest_valid_parentheses', args: ['(()'], expected: 2 },
      { call: 'longest_valid_parentheses', args: [')()())'], expected: 4 },
      { call: 'longest_valid_parentheses', args: [''], expected: 0 },
      { call: 'longest_valid_parentheses', args: ['()(())'], expected: 6 },
      { call: 'longest_valid_parentheses', args: ['()(()'], expected: 2 },
    ],
    hint: 'Keep a stack of positions, starting with -1 (a "wall"). Push the position of each "("; for ")", pop, and if the stack is now empty push this position as the new wall, otherwise the valid part reaches from just after the stack top to here. Like measuring stretches of a zip that are properly closed.',
  },
];
