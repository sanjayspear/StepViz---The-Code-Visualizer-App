// Reference solutions for Practice: Stacks & queues (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  151: `def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return not stack
`,
  152: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, x):
        self.items.append(x)

    def pop(self):
        return self.items.pop() if self.items else None

    def peek(self):
        return self.items[-1] if self.items else None

    def is_empty(self):
        return len(self.items) == 0
`,
  153: `class MyQueue:
    def __init__(self):
        self.inbox = []
        self.outbox = []

    def push(self, x):
        self.inbox.append(x)

    def _move(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._move()
        return self.outbox.pop()

    def peek(self):
        self._move()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox
`,
  154: `from collections import deque


class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return len(self.q) == 0
`,
  155: `def reverse_with_stack(s):
    stack = list(s)
    out = ""
    while stack:
        out += stack.pop()
    return out
`,
  156: `def remove_adjacent_duplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)
`,
  157: `from collections import deque


def binary_numbers(n):
    out = []
    q = deque(["1"])
    for _ in range(n):
        item = q.popleft()
        out.append(item)
        q.append(item + "0")
        q.append(item + "1")
    return out
`,
  158: `class MinStack:
    def __init__(self):
        self.items = []

    def push(self, x):
        smallest = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, smallest))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]
`,
  159: `def eval_postfix(expr):
    stack = []
    for tok in expr.split():
        if tok in "+-*/" and len(tok) == 1:
            b = stack.pop()
            a = stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(tok))
    return stack[-1]
`,
  160: `def infix_to_postfix(expr):
    prec = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3}
    out = ""
    stack = []
    for ch in expr:
        if ch.isalpha():
            out += ch
        elif ch == "(":
            stack.append(ch)
        elif ch == ")":
            while stack[-1] != "(":
                out += stack.pop()
            stack.pop()
        else:
            while stack and stack[-1] != "(" and (prec[stack[-1]] > prec[ch] or (prec[stack[-1]] == prec[ch] and ch != "^")):
                out += stack.pop()
            stack.append(ch)
    while stack:
        out += stack.pop()
    return out
`,
  161: `def next_greater(nums):
    out = [-1] * len(nums)
    waiting = []
    for i, x in enumerate(nums):
        while waiting and nums[waiting[-1]] < x:
            out[waiting.pop()] = x
        waiting.append(i)
    return out
`,
  162: `def daily_temperatures(temps):
    out = [0] * len(temps)
    waiting = []
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:
            j = waiting.pop()
            out[j] = i - j
        waiting.append(i)
    return out
`,
  163: `def simplify_path(path):
    stack = []
    for part in path.split("/"):
        if part == "" or part == ".":
            continue
        if part == "..":
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return "/" + "/".join(stack)
`,
  164: `def decode_string(s):
    stack = []
    text = ""
    number = 0
    for ch in s:
        if ch.isdigit():
            number = number * 10 + int(ch)
        elif ch == "[":
            stack.append((text, number))
            text, number = "", 0
        elif ch == "]":
            old_text, k = stack.pop()
            text = old_text + text * k
        else:
            text += ch
    return text
`,
  165: `class MyCircularQueue:
    def __init__(self, k):
        self.data = [0] * k
        self.k = k
        self.head = 0
        self.count = 0

    def enqueue(self, value):
        if self.count == self.k:
            return False
        self.data[(self.head + self.count) % self.k] = value
        self.count += 1
        return True

    def dequeue(self):
        if self.count == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.count -= 1
        return True

    def front(self):
        return -1 if self.count == 0 else self.data[self.head]

    def rear(self):
        return -1 if self.count == 0 else self.data[(self.head + self.count - 1) % self.k]

    def is_empty(self):
        return self.count == 0

    def is_full(self):
        return self.count == self.k
`,
  166: `def stock_span(prices):
    stack = []
    out = []
    for p in prices:
        span = 1
        while stack and stack[-1][0] <= p:
            span += stack.pop()[1]
        stack.append((p, span))
        out.append(span)
    return out
`,
  167: `def asteroid_collision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
            elif stack[-1] == -a:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(a)
    return stack
`,
  168: `def largest_rectangle(heights):
    stack = []
    best = 0
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] + 1 if stack else 0
            best = max(best, height * (i - left))
        stack.append(i)
    return best
`,
  169: `def calculate(s):
    result, sign, number = 0, 1, 0
    stack = []
    for ch in s:
        if ch.isdigit():
            number = number * 10 + int(ch)
        elif ch in "+-":
            result += sign * number
            number = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            stack.append((result, sign))
            result, sign = 0, 1
        elif ch == ")":
            result += sign * number
            number = 0
            old_result, old_sign = stack.pop()
            result = old_result + old_sign * result
    return result + sign * number
`,
  170: `def longest_valid_parentheses(s):
    stack = [-1]
    best = 0
    for i, ch in enumerate(s):
        if ch == "(":
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best
`,
};
