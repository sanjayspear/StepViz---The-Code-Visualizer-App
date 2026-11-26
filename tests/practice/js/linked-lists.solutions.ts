// JavaScript reference solutions for Practice: Linked lists. Never shipped to students.
const NODE = `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
`;

export const SOLUTIONS: Record<number, string> = {
  216: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  addFirst(x) {
    this.head = new ListNode(x, this.head);
  }

  addLast(x) {
    if (this.head === null) {
      this.head = new ListNode(x);
      return;
    }
    let n = this.head;
    while (n.next !== null) n = n.next;
    n.next = new ListNode(x);
  }

  delete(x) {
    if (this.head === null) return false;
    if (this.head.val === x) {
      this.head = this.head.next;
      return true;
    }
    for (let n = this.head; n.next !== null; n = n.next) {
      if (n.next.val === x) {
        n.next = n.next.next;
        return true;
      }
    }
    return false;
  }

  size() {
    let count = 0;
    for (let n = this.head; n !== null; n = n.next) count++;
    return count;
  }

  toText() {
    const parts = [];
    for (let n = this.head; n !== null; n = n.next) parts.push(n.val);
    return parts.join(" -> ");
  }
}
`,
  217: `function reverseIterative(head) {
  let prev = null;
  while (head !== null) {
    const next = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  return prev;
}

function reverseRecursive(head) {
  if (head === null || head.next === null) return head;
  const newHead = reverseRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}
`,
  218: `function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
`,
  219: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
`,
  220: `${NODE}
function mergeTwo(a, b) {
  const dummy = new ListNode();
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}
`,
  221: `function deleteDuplicates(head) {
  let n = head;
  while (n !== null && n.next !== null) {
    if (n.next.val === n.val) n.next = n.next.next;
    else n = n.next;
  }
  return head;
}
`,
  222: `function isPalindromeList(head) {
  const values = [];
  for (let n = head; n !== null; n = n.next) values.push(n.val);
  for (let i = 0, j = values.length - 1; i < j; i++, j--) if (values[i] !== values[j]) return false;
  return true;
}
`,
  223: `function getIntersection(a, b) {
  let p = a;
  let q = b;
  while (p !== q) {
    p = p !== null ? p.next : b;
    q = q !== null ? q.next : a;
  }
  return p;
}
`,
  224: `function detectCycleStart(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) {
        p = p.next;
        slow = slow.next;
      }
      return p;
    }
  }
  return null;
}
`,
  225: `${NODE}
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let front = dummy;
  let back = dummy;
  for (let i = 0; i <= n; i++) front = front.next;
  while (front !== null) {
    front = front.next;
    back = back.next;
  }
  back.next = back.next.next;
  return dummy.next;
}
`,
  226: `${NODE}
function addTwoNumbers(a, b) {
  const dummy = new ListNode();
  let tail = dummy;
  let carry = 0;
  while (a !== null || b !== null || carry) {
    let total = carry;
    if (a !== null) {
      total += a.val;
      a = a.next;
    }
    if (b !== null) {
      total += b.val;
      b = b.next;
    }
    tail.next = new ListNode(total % 10);
    tail = tail.next;
    carry = Math.floor(total / 10);
  }
  return dummy.next;
}
`,
  227: `function reorderList(head) {
  if (head === null) return;
  let slow = head;
  let fast = head;
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second !== null) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let first = head;
  second = prev;
  while (second !== null) {
    const a = first.next;
    const b = second.next;
    first.next = second;
    second.next = a;
    first = a;
    second = b;
  }
}
`,
  228: `function rotateRight(head, k) {
  if (head === null) return null;
  let n = 1;
  let tail = head;
  while (tail.next !== null) {
    tail = tail.next;
    n++;
  }
  k %= n;
  if (k === 0) return head;
  tail.next = head;
  let newTail = head;
  for (let i = 0; i < n - k - 1; i++) newTail = newTail.next;
  const newHead = newTail.next;
  newTail.next = null;
  return newHead;
}
`,
  229: `${NODE}
function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null && prev.next.next !== null) {
    const a = prev.next;
    const b = a.next;
    prev.next = b;
    a.next = b.next;
    b.next = a;
    prev = a;
  }
  return dummy.next;
}
`,
  230: `function oddEvenList(head) {
  if (head === null) return null;
  let odd = head;
  let even = head.next;
  const evenHead = even;
  while (even !== null && even.next !== null) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead;
  return head;
}
`,
  231: `${NODE}
function partitionList(head, x) {
  const less = new ListNode();
  const rest = new ListNode();
  let lessTail = less;
  let restTail = rest;
  for (let n = head; n !== null; n = n.next) {
    if (n.val < x) lessTail = lessTail.next = n;
    else restTail = restTail.next = n;
  }
  restTail.next = null;
  lessTail.next = rest.next;
  return less.next;
}
`,
  232: `class Node {
  constructor(val, next = null, random = null) {
    this.val = val;
    this.next = next;
    this.random = random;
  }
}

function copyRandomList(head) {
  const copies = new Map([[null, null]]);
  for (let n = head; n !== null; n = n.next) copies.set(n, new Node(n.val));
  for (let n = head; n !== null; n = n.next) {
    copies.get(n).next = copies.get(n.next);
    copies.get(n).random = copies.get(n.random);
  }
  return copies.get(head);
}
`,
  233: `${NODE}
function sortList(head) {
  if (head === null || head.next === null) return head;
  let slow = head;
  let fast = head.next;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const second = slow.next;
  slow.next = null;
  let a = sortList(head);
  let b = sortList(second);
  const dummy = new ListNode();
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}
`,
  234: `${NODE}
function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  while (true) {
    let check = before;
    for (let i = 0; i < k; i++) {
      check = check.next;
      if (check === null) return dummy.next;
    }
    const first = before.next;
    const after = check.next;
    let prev = after;
    let cur = first;
    while (cur !== after) {
      const next = cur.next;
      cur.next = prev;
      prev = cur;
      cur = next;
    }
    before.next = check;
    before = first;
  }
}
`,
  235: `${NODE}
function mergeTwo(a, b) {
  const dummy = new ListNode();
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}

function mergeKLists(lists) {
  if (lists.length === 0) return null;
  while (lists.length > 1) {
    const next = [];
    for (let i = 0; i < lists.length; i += 2) next.push(i + 1 < lists.length ? mergeTwo(lists[i], lists[i + 1]) : lists[i]);
    lists = next;
  }
  return lists[0];
}
`,
};
