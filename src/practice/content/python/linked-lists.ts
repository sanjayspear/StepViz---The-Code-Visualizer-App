// Practice, Python: Linked lists (Q216-Q235). Reference solutions: tests/practice/linked-lists.solutions.ts.
// Every starter brings its own ListNode class and two helpers, so the code can be visualised.
import type { PracticeContent, Value } from '../types';

const LIST = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def build(values):
    # A linked list holding these values, in order.
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def to_list(head):
    # The values of a linked list, as a Python list (to print it).
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out
`;

const L = (values: Value[]): Value => ({ $list: values });

export const LINKED_LISTS: PracticeContent[] = [
  {
    id: 216,
    example: 'Example: after add_last(1), add_last(2) and add_first(0), to_text() returns "0 -> 1 -> 2".',
    starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None

    def add_first(self, x):
        # Put x at the front.
        pass

    def add_last(self, x):
        # Put x at the end.
        pass

    def delete(self, x):
        # Remove the first node holding x. True if one was removed, False if x is not there.
        pass

    def size(self):
        pass

    def to_text(self):
        # The values joined by " -> ", like "0 -> 1 -> 2" ("" when empty). print() it to see the list.
        pass


lst = LinkedList()
lst.add_last(1)
lst.add_last(2)
lst.add_first(0)
print(lst.to_text())
`,
    tests: [
      {
        call: '$ops',
        cls: 'LinkedList',
        ops: [['LinkedList'], ['add_last', 1], ['add_last', 2], ['add_first', 0], ['to_text'], ['delete', 1], ['to_text'], ['delete', 5], ['size']],
        expected: [null, null, null, null, '0 -> 1 -> 2', true, '0 -> 2', false, 2],
      },
      { call: '$ops', cls: 'LinkedList', ops: [['LinkedList'], ['to_text'], ['size'], ['delete', 1], ['add_first', 3], ['to_text']], expected: [null, '', 0, false, null, '3'] },
      {
        call: '$ops',
        cls: 'LinkedList',
        ops: [['LinkedList'], ['add_last', 1], ['add_last', 2], ['add_last', 3], ['delete', 3], ['delete', 1], ['to_text'], ['add_last', 4], ['to_text']],
        expected: [null, null, null, null, true, true, '2', null, '2 -> 4'],
      },
    ],
    hint: 'Each node holds a value and a link to the next node; the list only remembers its head. add_first makes a node pointing at the old head. add_last and delete walk along the links; to delete, make the node before it skip over it (the head is a special case). Like a treasure hunt where each clue says where the next one is.',
  },
  {
    id: 217,
    example: 'Example: reverse_iterative(build([1, 2, 3])) and reverse_recursive(build([1, 2, 3])) both give the list 3 -> 2 -> 1.',
    starter: `${LIST}

def reverse_iterative(head):
    # Reverse the list with a loop; return the new head.
    pass


def reverse_recursive(head):
    # Reverse the list with recursion; return the new head.
    pass


print(to_list(reverse_iterative(build([1, 2, 3]))))
print(to_list(reverse_recursive(build([1, 2, 3]))))
`,
    tests: [
      { call: 'reverse_iterative', args: [L([1, 2, 3, 4, 5])], expected: L([5, 4, 3, 2, 1]) },
      { call: 'reverse_iterative', args: [L([])], expected: null },
      { call: 'reverse_iterative', args: [L([1, 2])], expected: L([2, 1]) },
      { call: 'reverse_recursive', args: [L([1, 2, 3, 4, 5])], expected: L([5, 4, 3, 2, 1]) },
      { call: 'reverse_recursive', args: [L([])], expected: null },
      { call: 'reverse_recursive', args: [L([7])], expected: L([7]) },
    ],
    hint: 'With a loop: keep prev = None; for each node, remember its next, point it back at prev, and move prev and the node one step on. With recursion: reverse the rest of the list first, then make the next node point back at this one and cut this node\'s own link. Like turning a conga line around, one dancer at a time.',
  },
  {
    id: 218,
    example: 'Example: middle_node(build([1, 2, 3, 4, 5])) returns the node holding 3.',
    starter: `${LIST}

def middle_node(head):
    # The middle node in one pass (the second middle one when there are two).
    pass


print(to_list(middle_node(build([1, 2, 3, 4, 5]))))
`,
    tests: [
      { call: 'middle_node', args: [L([1, 2, 3, 4, 5])], expected: L([3, 4, 5]) },
      { call: 'middle_node', args: [L([1, 2, 3, 4, 5, 6])], expected: L([4, 5, 6]) },
      { call: 'middle_node', args: [L([1])], expected: L([1]) },
      { call: 'middle_node', args: [L([1, 2])], expected: L([2]) },
    ],
    hint: 'Move a slow pointer one step and a fast pointer two steps at a time. When the fast one runs off the end, the slow one is in the middle. Like two runners where one is twice as fast: when the fast one finishes, the slow one is halfway.',
  },
  {
    id: 219,
    example: 'Example: has_cycle(head) returns True when the last node links back to an earlier one.',
    starter: `${LIST}

def has_cycle(head):
    # True if following next from head ever comes back to a node already visited.
    pass


head = build([3, 2, 0, -4])
head.next.next.next.next = head.next  # -4 links back to 2
print(has_cycle(head))
`,
    tests: [
      { call: 'has_cycle', args: [{ $cycle: [3, 2, 0, -4], pos: 1 }], expected: true },
      { call: 'has_cycle', args: [{ $cycle: [1, 2], pos: 0 }], expected: true },
      { call: 'has_cycle', args: [L([1])], expected: false },
      { call: 'has_cycle', args: [L([])], expected: false },
      { call: 'has_cycle', args: [L([1, 2, 3])], expected: false },
    ],
    hint: 'Floyd\'s idea: a slow pointer moves one step, a fast pointer two. If there is a loop, the fast one laps the slow one and they meet; if not, the fast one reaches the end. Like two runners on a track: on a circular track the faster one catches up from behind.',
  },
  {
    id: 220,
    example: 'Example: merge_two(build([1, 2, 4]), build([1, 3, 4])) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4.',
    starter: `${LIST}

def merge_two(a, b):
    # a and b are sorted. One sorted list made of their nodes; return its head.
    pass


print(to_list(merge_two(build([1, 2, 4]), build([1, 3, 4]))))
`,
    tests: [
      { call: 'merge_two', args: [L([1, 2, 4]), L([1, 3, 4])], expected: L([1, 1, 2, 3, 4, 4]) },
      { call: 'merge_two', args: [L([]), L([])], expected: null },
      { call: 'merge_two', args: [L([]), L([0])], expected: L([0]) },
      { call: 'merge_two', args: [L([5]), L([1, 2])], expected: L([1, 2, 5]) },
    ],
    hint: 'Start with a dummy node and a tail pointer. While both lists have nodes, attach the smaller front node to the tail and move on in that list. Then attach whatever is left. Return dummy.next. Like merging two sorted queues at a ticket gate: always let the next person with the earlier ticket through.',
  },
  {
    id: 221,
    example: 'Example: delete_duplicates(build([1, 1, 2, 3, 3])) gives 1 -> 2 -> 3.',
    starter: `${LIST}

def delete_duplicates(head):
    # The list is sorted. Keep each value once; return the head.
    pass


print(to_list(delete_duplicates(build([1, 1, 2, 3, 3]))))
`,
    tests: [
      { call: 'delete_duplicates', args: [L([1, 1, 2])], expected: L([1, 2]) },
      { call: 'delete_duplicates', args: [L([1, 1, 2, 3, 3])], expected: L([1, 2, 3]) },
      { call: 'delete_duplicates', args: [L([])], expected: null },
      { call: 'delete_duplicates', args: [L([1, 1, 1])], expected: L([1]) },
    ],
    hint: 'Walk the list. While the next node holds the same value as the current one, skip it (current.next = current.next.next); otherwise move on. Like a queue where twins standing together are asked to send only one of them.',
  },
  {
    id: 222,
    example: 'Example: is_palindrome_list(build([1, 2, 2, 1])) returns True.',
    starter: `${LIST}

def is_palindrome_list(head):
    # True if the values read the same forwards and backwards.
    pass


print(is_palindrome_list(build([1, 2, 2, 1])))
`,
    tests: [
      { call: 'is_palindrome_list', args: [L([1, 2, 2, 1])], expected: true },
      { call: 'is_palindrome_list', args: [L([1, 2])], expected: false },
      { call: 'is_palindrome_list', args: [L([1])], expected: true },
      { call: 'is_palindrome_list', args: [L([1, 2, 3, 2, 1])], expected: true },
      { call: 'is_palindrome_list', args: [L([])], expected: true },
    ],
    hint: 'Find the middle with slow and fast pointers, reverse the second half, then walk both halves together comparing values. (Copying the values into a Python list also works, using more memory.) Like folding a paper strip in half to check the two halves line up.',
  },
  {
    id: 223,
    example: 'Example: lists 4 -> 1 -> 8 -> 9 -> 10 and 5 -> 6 -> 2 -> 8 -> 9 -> 10 that share the nodes from 8 on: the answer is the node holding 8.',
    starter: `${LIST}

def get_intersection(a, b):
    # The first node that both lists share (the same node, not just the same value), or None.
    pass


common = build([8, 9, 10])
a = ListNode(4, ListNode(1, common))
b = ListNode(5, ListNode(6, ListNode(2, common)))
print(get_intersection(a, b) is common)  # True when it finds the shared node
`,
    tests: [
      { call: 'get_intersection', setup: { intersect: { a: [4, 1], b: [5, 6, 2], common: [8, 9, 10] } }, returns: 'value', expected: 8 },
      { call: 'get_intersection', setup: { intersect: { a: [2, 6, 4], b: [1, 5], common: [] } }, returns: 'value', expected: null },
      { call: 'get_intersection', setup: { intersect: { a: [], b: [], common: [7] } }, returns: 'value', expected: 7 },
      { call: 'get_intersection', setup: { intersect: { a: [1, 2, 3], b: [], common: [4] } }, returns: 'value', expected: 4 },
    ],
    hint: 'Walk pointer p through a then b, and pointer q through b then a. Both travel the same total distance, so they reach the shared node at the same moment (or both reach None). Compare nodes with is, not values. Like two friends on different routes who swap routes halfway and meet at the same corner.',
  },
  {
    id: 224,
    example: 'Example: for 3 -> 2 -> 0 -> -4 where -4 links back to 2, detect_cycle_start returns the node holding 2.',
    starter: `${LIST}

def detect_cycle_start(head):
    # The node where the cycle begins, or None if there is no cycle.
    pass


head = build([3, 2, 0, -4])
head.next.next.next.next = head.next  # -4 links back to 2
print(detect_cycle_start(head) is head.next)  # True when it finds the node holding 2
`,
    tests: [
      { call: 'detect_cycle_start', args: [{ $cycle: [3, 2, 0, -4], pos: 1 }], returns: 'index', expected: 1 },
      { call: 'detect_cycle_start', args: [{ $cycle: [1, 2], pos: 0 }], returns: 'index', expected: 0 },
      { call: 'detect_cycle_start', args: [L([1])], returns: 'index', expected: -1 },
      { call: 'detect_cycle_start', args: [{ $cycle: [1, 2, 3, 4], pos: 3 }], returns: 'index', expected: 3 },
    ],
    hint: 'First find a meeting point with slow and fast pointers. Then start one pointer again at the head and move both one step at a time: where they meet is the start of the cycle (the distances work out the same). Like finding where a roundabout begins by sending a second walker from the start of the road.',
  },
  {
    id: 225,
    example: 'Example: remove_nth_from_end(build([1, 2, 3, 4, 5]), 2) gives 1 -> 2 -> 3 -> 5.',
    starter: `${LIST}

def remove_nth_from_end(head, n):
    # Remove the nth node counting from the end (n = 1 is the last), in one pass. Return the head.
    pass


print(to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 2)))
`,
    tests: [
      { call: 'remove_nth_from_end', args: [L([1, 2, 3, 4, 5]), 2], expected: L([1, 2, 3, 5]) },
      { call: 'remove_nth_from_end', args: [L([1]), 1], expected: null },
      { call: 'remove_nth_from_end', args: [L([1, 2]), 1], expected: L([1]) },
      { call: 'remove_nth_from_end', args: [L([1, 2]), 2], expected: L([2]) },
    ],
    hint: 'Use a dummy node before the head. Move a front pointer n + 1 steps ahead, then move both pointers until the front one falls off the end: the back pointer is just before the node to remove. Like holding a stick of fixed length along a fence: when its front reaches the end, its back is at the right post.',
  },
  {
    id: 226,
    example: 'Example: add_two_numbers(build([2, 4, 3]), build([5, 6, 4])) gives 7 -> 0 -> 8 (342 + 465 = 807).',
    starter: `${LIST}

def add_two_numbers(a, b):
    # Each list holds a number's digits, ones digit first. Return their sum the same way.
    pass


print(to_list(add_two_numbers(build([2, 4, 3]), build([5, 6, 4]))))
`,
    tests: [
      { call: 'add_two_numbers', args: [L([2, 4, 3]), L([5, 6, 4])], expected: L([7, 0, 8]) },
      { call: 'add_two_numbers', args: [L([0]), L([0])], expected: L([0]) },
      { call: 'add_two_numbers', args: [L([9, 9, 9, 9, 9, 9, 9]), L([9, 9, 9, 9])], expected: L([8, 9, 9, 9, 0, 0, 0, 1]) },
      { call: 'add_two_numbers', args: [L([5]), L([5])], expected: L([0, 1]) },
    ],
    hint: 'Add digit by digit like on paper, starting with the ones: digit = (x + y + carry) % 10 and carry = (x + y + carry) // 10. Keep going while either list has digits or there is a carry. Like column addition at school, done right to left.',
  },
  {
    id: 227,
    example: 'Example: reorder_list(head) with head = 1 -> 2 -> 3 -> 4 changes it to 1 -> 4 -> 2 -> 3.',
    starter: `${LIST}

def reorder_list(head):
    # Change the list itself to first, last, second, second-last, ... (return nothing).
    pass


head = build([1, 2, 3, 4, 5])
reorder_list(head)
print(to_list(head))
`,
    tests: [
      { call: 'reorder_list', args: [L([1, 2, 3, 4])], expected: null, mutated: { arg: 0, value: L([1, 4, 2, 3]) } },
      { call: 'reorder_list', args: [L([1, 2, 3, 4, 5])], expected: null, mutated: { arg: 0, value: L([1, 5, 2, 4, 3]) } },
      { call: 'reorder_list', args: [L([1])], expected: null, mutated: { arg: 0, value: L([1]) } },
      { call: 'reorder_list', args: [L([1, 2])], expected: null, mutated: { arg: 0, value: L([1, 2]) } },
    ],
    hint: 'Three steps: find the middle, reverse the second half (cutting it off from the first), then weave the two halves together one node from each. Like shuffling two halves of a deck of cards into each other.',
  },
  {
    id: 228,
    example: 'Example: rotate_right(build([1, 2, 3, 4, 5]), 2) gives 4 -> 5 -> 1 -> 2 -> 3.',
    starter: `${LIST}

def rotate_right(head, k):
    # Move the last k nodes to the front (k may be bigger than the length). Return the head.
    pass


print(to_list(rotate_right(build([1, 2, 3, 4, 5]), 2)))
`,
    tests: [
      { call: 'rotate_right', args: [L([1, 2, 3, 4, 5]), 2], expected: L([4, 5, 1, 2, 3]) },
      { call: 'rotate_right', args: [L([0, 1, 2]), 4], expected: L([2, 0, 1]) },
      { call: 'rotate_right', args: [L([]), 1], expected: null },
      { call: 'rotate_right', args: [L([1, 2]), 0], expected: L([1, 2]) },
      { call: 'rotate_right', args: [L([1, 2]), 2], expected: L([1, 2]) },
    ],
    hint: 'Count the length n and find the tail. Only k % n matters. Join the tail to the head to make a ring, walk n - k % n steps from the head to the new tail, and cut the ring after it. Like a necklace: open the clasp at a different bead.',
  },
  {
    id: 229,
    example: 'Example: swap_pairs(build([1, 2, 3, 4])) gives 2 -> 1 -> 4 -> 3.',
    starter: `${LIST}

def swap_pairs(head):
    # Swap every two neighbouring nodes (move the nodes, not just their values). Return the head.
    pass


print(to_list(swap_pairs(build([1, 2, 3, 4]))))
`,
    tests: [
      { call: 'swap_pairs', args: [L([1, 2, 3, 4])], expected: L([2, 1, 4, 3]) },
      { call: 'swap_pairs', args: [L([])], expected: null },
      { call: 'swap_pairs', args: [L([1])], expected: L([1]) },
      { call: 'swap_pairs', args: [L([1, 2, 3])], expected: L([2, 1, 3]) },
    ],
    hint: 'Use a dummy node before the head and a pointer prev. While two nodes a and b follow prev: link prev to b, a to what came after b, and b to a; then move prev to a. Like dancers in a line swapping places with their partner, pair by pair.',
  },
  {
    id: 230,
    example: 'Example: odd_even_list(build([1, 2, 3, 4, 5])) gives 1 -> 3 -> 5 -> 2 -> 4.',
    starter: `${LIST}

def odd_even_list(head):
    # Nodes at positions 1, 3, 5, ... first, then positions 2, 4, 6, ... (each group keeps its order).
    pass


print(to_list(odd_even_list(build([1, 2, 3, 4, 5]))))
`,
    tests: [
      { call: 'odd_even_list', args: [L([1, 2, 3, 4, 5])], expected: L([1, 3, 5, 2, 4]) },
      { call: 'odd_even_list', args: [L([2, 1, 3, 5, 6, 4, 7])], expected: L([2, 3, 6, 7, 1, 5, 4]) },
      { call: 'odd_even_list', args: [L([])], expected: null },
      { call: 'odd_even_list', args: [L([1, 2])], expected: L([1, 2]) },
    ],
    hint: 'Keep two chains, odd and even, and remember where the even chain starts. Each odd node links to the node two ahead, and so does each even node. At the end, hang the even chain after the last odd node. Like children lining up by counting "one, two": the ones step forward, then the twos follow.',
  },
  {
    id: 231,
    example: 'Example: partition_list(build([1, 4, 3, 2, 5, 2]), 3) gives 1 -> 2 -> 2 -> 4 -> 3 -> 5.',
    starter: `${LIST}

def partition_list(head, x):
    # Nodes with values less than x first, then the rest; each group keeps its order.
    pass


print(to_list(partition_list(build([1, 4, 3, 2, 5, 2]), 3)))
`,
    tests: [
      { call: 'partition_list', args: [L([1, 4, 3, 2, 5, 2]), 3], expected: L([1, 2, 2, 4, 3, 5]) },
      { call: 'partition_list', args: [L([2, 1]), 2], expected: L([1, 2]) },
      { call: 'partition_list', args: [L([]), 0], expected: null },
      { call: 'partition_list', args: [L([3, 1, 2]), 5], expected: L([3, 1, 2]) },
    ],
    hint: 'Build two chains with dummy heads: "less" and "the rest". Move each node to the end of the right chain, then join less to the rest and end the rest with None. Like sorting post into two trays and stacking one tray on the other.',
  },
  {
    id: 232,
    example: 'Example: copy_random_list(head) gives new nodes with the same values, next links and random links.',
    starter: `class Node:
    def __init__(self, val, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random


def copy_random_list(head):
    # A deep copy: brand-new nodes whose next and random links point inside the copy.
    pass


a, b, c = Node(7), Node(13), Node(11)
a.next, b.next = b, c
b.random, c.random = a, a
copy = copy_random_list(a)
print(copy is not None and copy is not a)  # True when it makes new nodes
`,
    tests: [
      { call: 'copy_random_list', args: [{ $randlist: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] }], expected: { $randlist: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] }, copy: true },
      { call: 'copy_random_list', args: [{ $randlist: [[1, 1], [2, 1]] }], expected: { $randlist: [[1, 1], [2, 1]] }, copy: true },
      { call: 'copy_random_list', args: [{ $randlist: [[3, null], [3, 0], [3, null]] }], expected: { $randlist: [[3, null], [3, 0], [3, null]] }, copy: true },
      { call: 'copy_random_list', args: [{ $randlist: [] }], expected: null, copy: true },
    ],
    hint: 'First pass: make a copy of every node and keep a dictionary old node -> new node. Second pass: set each copy\'s next and random to the copies of the old node\'s next and random (None stays None). Like photocopying a seating plan and then redrawing every arrow between the new seats.',
  },
  {
    id: 233,
    example: 'Example: sort_list(build([4, 2, 1, 3])) gives 1 -> 2 -> 3 -> 4.',
    starter: `${LIST}

def sort_list(head):
    # Sort the list in O(n log n) by moving nodes (no sort() or sorted()). Return the head.
    pass


print(to_list(sort_list(build([4, 2, 1, 3]))))
`,
    tests: [
      { call: 'sort_list', args: [L([4, 2, 1, 3])], expected: L([1, 2, 3, 4]) },
      { call: 'sort_list', args: [L([-1, 5, 3, 4, 0])], expected: L([-1, 0, 3, 4, 5]) },
      { call: 'sort_list', args: [L([])], expected: null },
      { call: 'sort_list', args: [L([1])], expected: L([1]) },
      { call: 'sort_list', args: [L([2, 2, 1, 1])], expected: L([1, 1, 2, 2]) },
    ],
    hint: 'Merge sort: find the middle with slow and fast pointers and cut the list in two, sort each half the same way, then merge the two sorted halves. A list of 0 or 1 nodes is already sorted. Like sorting a pile of exam papers by splitting it with a friend, then merging your two sorted piles.',
    forbid: { names: ['sorted', 'sort'], why: 'This question asks you to sort the nodes yourself, without sort() or sorted().' },
  },
  {
    id: 234,
    example: 'Example: reverse_k_group(build([1, 2, 3, 4, 5]), 2) gives 2 -> 1 -> 4 -> 3 -> 5.',
    starter: `${LIST}

def reverse_k_group(head, k):
    # Reverse each group of k nodes; a last group shorter than k stays as it is. Return the head.
    pass


print(to_list(reverse_k_group(build([1, 2, 3, 4, 5]), 2)))
`,
    tests: [
      { call: 'reverse_k_group', args: [L([1, 2, 3, 4, 5]), 2], expected: L([2, 1, 4, 3, 5]) },
      { call: 'reverse_k_group', args: [L([1, 2, 3, 4, 5]), 3], expected: L([3, 2, 1, 4, 5]) },
      { call: 'reverse_k_group', args: [L([1, 2]), 1], expected: L([1, 2]) },
      { call: 'reverse_k_group', args: [L([1, 2, 3, 4]), 4], expected: L([4, 3, 2, 1]) },
    ],
    hint: 'Use a dummy node before the head. Check that k nodes follow the group\'s start; if not, stop. Reverse those k nodes, then link the node before the group to the new first node and the old first node (now last) to the rest. Move on to the next group. Like turning around each carriage of k seats on a train, but leaving a short last carriage alone.',
  },
  {
    id: 235,
    example: 'Example: merge_k_lists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])]) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6.',
    starter: `${LIST}

def merge_k_lists(lists):
    # lists holds the heads of sorted linked lists (some may be None). One sorted list of all the nodes.
    pass


print(to_list(merge_k_lists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])])))
`,
    tests: [
      { call: 'merge_k_lists', args: [[L([1, 4, 5]), L([1, 3, 4]), L([2, 6])]], expected: L([1, 1, 2, 3, 4, 4, 5, 6]) },
      { call: 'merge_k_lists', args: [[]], expected: null },
      { call: 'merge_k_lists', args: [[L([])]], expected: null },
      { call: 'merge_k_lists', args: [[L([2]), L([1])]], expected: L([1, 2]) },
    ],
    hint: 'Put the front node of every list into a heap (heapq), keyed by (value, list number) so ties never compare nodes. Pop the smallest, attach it to the answer, and push the node after it. Like several sorted queues merging at one gate: always let in the earliest ticket among the front people.',
  },
];
