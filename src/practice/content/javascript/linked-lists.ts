// Practice, JavaScript: Linked lists (Q216-Q235). Tests come from the Python content;
// reference solutions in tests/practice/js/linked-lists.solutions.ts.
// Every starter brings its own ListNode class and two helpers, so the code can be visualised.
import { fromPython } from './shared';
import { LINKED_LISTS } from '../python/linked-lists';

const LIST = `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function build(values) {
  // A linked list holding these values, in order.
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
  return head;
}

function toList(head) {
  // The values of a linked list, as an array (to print it).
  const out = [];
  for (let node = head; node != null; node = node.next) out.push(node.val);
  return out;
}
`;

const fn = (name: string, args: string, comment: string, call: string) => `${LIST}
function ${name}(${args}) {
${comment
  .split('\n')
  .map((l) => `  // ${l}`)
  .join('\n')}
}

${call}
`;

export const LINKED_LISTS_JS = fromPython(LINKED_LISTS, {
  216: {
    example: 'Example: after addLast(1), addLast(2) and addFirst(0), toText() returns "0 -> 1 -> 2".',
    starter: `class ListNode {
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
    // Put x at the front.
  }

  addLast(x) {
    // Put x at the end.
  }

  delete(x) {
    // Remove the first node holding x. true if one was removed, false if x is not there.
  }

  size() {
  }

  toText() {
    // The values joined by " -> ", like "0 -> 1 -> 2" ("" when empty). console.log() it to see the list.
  }
}

const lst = new LinkedList();
lst.addLast(1);
lst.addLast(2);
lst.addFirst(0);
console.log(lst.toText());
`,
  },
  217: {
    example: 'Example: reverseIterative(build([1, 2, 3])) and reverseRecursive(build([1, 2, 3])) both give the list 3 -> 2 -> 1.',
    starter: `${LIST}
function reverseIterative(head) {
  // Reverse the list with a loop; return the new head.
}

function reverseRecursive(head) {
  // Reverse the list with recursion; return the new head.
}

console.log(toList(reverseIterative(build([1, 2, 3]))));
console.log(toList(reverseRecursive(build([1, 2, 3]))));
`,
    hint: "With a loop: keep prev = null; for each node, remember its next, point it back at prev, and move prev and the node one step on. With recursion: reverse the rest of the list first, then make the next node point back at this one and cut this node's own link. Like turning a conga line around, one dancer at a time.",
  },
  218: {
    example: 'Example: middleNode(build([1, 2, 3, 4, 5])) returns the node holding 3.',
    starter: fn('middleNode', 'head', 'The middle node in one pass (the second middle one when there are two).', 'console.log(toList(middleNode(build([1, 2, 3, 4, 5]))));'),
  },
  219: {
    example: 'Example: hasCycle(head) returns true when the last node links back to an earlier one.',
    starter: fn(
      'hasCycle',
      'head',
      'true if following next from head ever comes back to a node already visited.',
      'const head = build([3, 2, 0, -4]);\nhead.next.next.next.next = head.next; // -4 links back to 2\nconsole.log(hasCycle(head));',
    ),
  },
  220: {
    example: 'Example: mergeTwo(build([1, 2, 4]), build([1, 3, 4])) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4.',
    starter: fn('mergeTwo', 'a, b', 'a and b are sorted. One sorted list made of their nodes; return its head.', 'console.log(toList(mergeTwo(build([1, 2, 4]), build([1, 3, 4]))));'),
    hint: 'Start with a dummy node and a tail pointer. While both lists have nodes, attach the smaller front node to the tail and move on in that list. Then attach whatever is left. Return dummy.next. Like merging two sorted queues at a ticket gate: always let the next person with the earlier ticket through.',
  },
  221: {
    example: 'Example: deleteDuplicates(build([1, 1, 2, 3, 3])) gives 1 -> 2 -> 3.',
    starter: fn('deleteDuplicates', 'head', 'The list is sorted. Keep each value once; return the head.', 'console.log(toList(deleteDuplicates(build([1, 1, 2, 3, 3]))));'),
  },
  222: {
    example: 'Example: isPalindromeList(build([1, 2, 2, 1])) returns true.',
    starter: fn('isPalindromeList', 'head', 'true if the values read the same forwards and backwards.', 'console.log(isPalindromeList(build([1, 2, 2, 1])));'),
    hint: 'Find the middle with slow and fast pointers, reverse the second half, then walk both halves together comparing values. (Copying the values into an array also works, using more memory.) Like folding a paper strip in half to check the two halves line up.',
  },
  223: {
    example: 'Example: lists 4 -> 1 -> 8 -> 9 -> 10 and 5 -> 6 -> 2 -> 8 -> 9 -> 10 that share the nodes from 8 on: the answer is the node holding 8.',
    starter: fn(
      'getIntersection',
      'a, b',
      'The first node that both lists share (the same node, not just the same value), or null.',
      'const common = build([8, 9, 10]);\nconst a = new ListNode(4, new ListNode(1, common));\nconst b = new ListNode(5, new ListNode(6, new ListNode(2, common)));\nconsole.log(getIntersection(a, b) === common); // true when it finds the shared node',
    ),
    hint: 'Walk pointer p through a then b, and pointer q through b then a. Both travel the same total distance, so they reach the shared node at the same moment (or both reach null). Compare nodes with ===, which asks "the same node?". Like two friends on different routes who swap routes halfway and meet at the same corner.',
  },
  224: {
    example: 'Example: for 3 -> 2 -> 0 -> -4 where -4 links back to 2, detectCycleStart returns the node holding 2.',
    starter: fn(
      'detectCycleStart',
      'head',
      'The node where the cycle begins, or null if there is no cycle.',
      'const head = build([3, 2, 0, -4]);\nhead.next.next.next.next = head.next; // -4 links back to 2\nconsole.log(detectCycleStart(head) === head.next); // true when it finds the node holding 2',
    ),
  },
  225: {
    example: 'Example: removeNthFromEnd(build([1, 2, 3, 4, 5]), 2) gives 1 -> 2 -> 3 -> 5.',
    starter: fn('removeNthFromEnd', 'head, n', 'Remove the nth node counting from the end (n = 1 is the last), in one pass. Return the head.', 'console.log(toList(removeNthFromEnd(build([1, 2, 3, 4, 5]), 2)));'),
  },
  226: {
    example: 'Example: addTwoNumbers(build([2, 4, 3]), build([5, 6, 4])) gives 7 -> 0 -> 8 (342 + 465 = 807).',
    starter: fn('addTwoNumbers', 'a, b', "Each list holds a number's digits, ones digit first. Return their sum the same way.", 'console.log(toList(addTwoNumbers(build([2, 4, 3]), build([5, 6, 4]))));'),
    hint: 'Add digit by digit like on paper, starting with the ones: digit = (x + y + carry) % 10 and carry = Math.floor((x + y + carry) / 10). Keep going while either list has digits or there is a carry. Like column addition at school, done right to left.',
  },
  227: {
    example: 'Example: reorderList(head) with head = 1 -> 2 -> 3 -> 4 changes it to 1 -> 4 -> 2 -> 3.',
    starter: fn(
      'reorderList',
      'head',
      'Change the list itself to first, last, second, second-last, ... (return nothing).',
      'const head = build([1, 2, 3, 4, 5]);\nreorderList(head);\nconsole.log(toList(head));',
    ),
  },
  228: {
    example: 'Example: rotateRight(build([1, 2, 3, 4, 5]), 2) gives 4 -> 5 -> 1 -> 2 -> 3.',
    starter: fn('rotateRight', 'head, k', 'Move the last k nodes to the front (k may be bigger than the length). Return the head.', 'console.log(toList(rotateRight(build([1, 2, 3, 4, 5]), 2)));'),
  },
  229: {
    example: 'Example: swapPairs(build([1, 2, 3, 4])) gives 2 -> 1 -> 4 -> 3.',
    starter: fn('swapPairs', 'head', 'Swap every two neighbouring nodes (move the nodes, not just their values). Return the head.', 'console.log(toList(swapPairs(build([1, 2, 3, 4]))));'),
  },
  230: {
    example: 'Example: oddEvenList(build([1, 2, 3, 4, 5])) gives 1 -> 3 -> 5 -> 2 -> 4.',
    starter: fn('oddEvenList', 'head', 'Nodes at positions 1, 3, 5, ... first, then positions 2, 4, 6, ... (each group keeps its order).', 'console.log(toList(oddEvenList(build([1, 2, 3, 4, 5]))));'),
  },
  231: {
    example: 'Example: partitionList(build([1, 4, 3, 2, 5, 2]), 3) gives 1 -> 2 -> 2 -> 4 -> 3 -> 5.',
    starter: fn('partitionList', 'head, x', 'Nodes with values less than x first, then the rest; each group keeps its order.', 'console.log(toList(partitionList(build([1, 4, 3, 2, 5, 2]), 3)));'),
    hint: 'Build two chains with dummy heads: "less" and "the rest". Move each node to the end of the right chain, then join less to the rest and end the rest with null. Like sorting post into two trays and stacking one tray on the other.',
  },
  232: {
    example: 'Example: copyRandomList(head) gives new nodes with the same values, next links and random links.',
    starter: `class Node {
  constructor(val, next = null, random = null) {
    this.val = val;
    this.next = next;
    this.random = random;
  }
}

function copyRandomList(head) {
  // A deep copy: brand-new nodes whose next and random links point inside the copy.
}

const a = new Node(7);
const b = new Node(13);
const c = new Node(11);
a.next = b;
b.next = c;
b.random = a;
c.random = a;
const copy = copyRandomList(a);
console.log(copy != null && copy !== a); // true when it makes new nodes
`,
    hint: "First pass: make a copy of every node and keep a Map old node -> new node. Second pass: set each copy's next and random to the copies of the old node's next and random (null stays null). Like photocopying a seating plan and then redrawing every arrow between the new seats.",
  },
  233: {
    example: 'Example: sortList(build([4, 2, 1, 3])) gives 1 -> 2 -> 3 -> 4.',
    starter: fn('sortList', 'head', 'Sort the list in O(n log n) by moving nodes (no sort()). Return the head.', 'console.log(toList(sortList(build([4, 2, 1, 3]))));'),
    hint: 'Merge sort: find the middle with slow and fast pointers and cut the list in two, sort each half the same way, then merge the two sorted halves. A list of 0 or 1 nodes is already sorted. Like sorting a pile of exam papers by splitting it with a friend, then merging your two sorted piles.',
    forbid: { names: ['sort', 'toSorted'], why: 'This question asks you to sort the nodes yourself, without sort().' },
  },
  234: {
    example: 'Example: reverseKGroup(build([1, 2, 3, 4, 5]), 2) gives 2 -> 1 -> 4 -> 3 -> 5.',
    starter: fn('reverseKGroup', 'head, k', 'Reverse each group of k nodes; a last group shorter than k stays as it is. Return the head.', 'console.log(toList(reverseKGroup(build([1, 2, 3, 4, 5]), 2)));'),
  },
  235: {
    example: 'Example: mergeKLists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])]) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6.',
    starter: fn(
      'mergeKLists',
      'lists',
      'lists holds the heads of sorted linked lists (some may be null). One sorted list of all the nodes.',
      'console.log(toList(mergeKLists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])])));',
    ),
    hint: 'Merge the lists in pairs, like merge sort: merge list 0 with 1, 2 with 3, and so on, then merge those results in pairs again until one list is left. Each round halves the number of lists. (JavaScript has no built-in heap, which is the other common way.) Like a knock-out tournament where pairs of sorted queues join until there is one.',
  },
});
