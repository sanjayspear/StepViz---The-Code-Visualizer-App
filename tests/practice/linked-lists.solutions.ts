// Reference solutions for Practice: Linked lists (Python). Never shipped to students.
// They use the harness's own node class (or define one), like a student's answer may.
const NODE = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
`;

export const SOLUTIONS: Record<number, string> = {
  216: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None

    def add_first(self, x):
        self.head = ListNode(x, self.head)

    def add_last(self, x):
        if self.head is None:
            self.head = ListNode(x)
            return
        n = self.head
        while n.next is not None:
            n = n.next
        n.next = ListNode(x)

    def delete(self, x):
        if self.head is None:
            return False
        if self.head.val == x:
            self.head = self.head.next
            return True
        n = self.head
        while n.next is not None:
            if n.next.val == x:
                n.next = n.next.next
                return True
            n = n.next
        return False

    def size(self):
        count, n = 0, self.head
        while n is not None:
            count += 1
            n = n.next
        return count

    def to_text(self):
        parts, n = [], self.head
        while n is not None:
            parts.append(str(n.val))
            n = n.next
        return " -> ".join(parts)
`,
  217: `def reverse_iterative(head):
    prev = None
    while head is not None:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev


def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head
`,
  218: `def middle_node(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow
`,
  219: `def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
`,
  220: `${NODE}

def merge_two(a, b):
    dummy = tail = ListNode()
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next
`,
  221: `def delete_duplicates(head):
    n = head
    while n is not None and n.next is not None:
        if n.next.val == n.val:
            n.next = n.next.next
        else:
            n = n.next
    return head
`,
  222: `def is_palindrome_list(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow is not None:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    a, b = head, prev
    while b is not None:
        if a.val != b.val:
            return False
        a, b = a.next, b.next
    return True
`,
  223: `def get_intersection(a, b):
    p, q = a, b
    while p is not q:
        p = p.next if p is not None else b
        q = q.next if q is not None else a
    return p
`,
  224: `def detect_cycle_start(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p = p.next
                slow = slow.next
            return p
    return None
`,
  225: `${NODE}

def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    front = back = dummy
    for _ in range(n + 1):
        front = front.next
    while front is not None:
        front = front.next
        back = back.next
    back.next = back.next.next
    return dummy.next
`,
  226: `${NODE}

def add_two_numbers(a, b):
    dummy = tail = ListNode()
    carry = 0
    while a is not None or b is not None or carry:
        total = carry
        if a is not None:
            total += a.val
            a = a.next
        if b is not None:
            total += b.val
            b = b.next
        tail.next = ListNode(total % 10)
        tail = tail.next
        carry = total // 10
    return dummy.next
`,
  227: `def reorder_list(head):
    if head is None:
        return
    slow = fast = head
    while fast.next is not None and fast.next.next is not None:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second is not None:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first, second = head, prev
    while second is not None:
        a, b = first.next, second.next
        first.next = second
        second.next = a
        first, second = a, b
`,
  228: `def rotate_right(head, k):
    if head is None:
        return None
    n, tail = 1, head
    while tail.next is not None:
        tail = tail.next
        n += 1
    k %= n
    if k == 0:
        return head
    tail.next = head
    new_tail = head
    for _ in range(n - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return new_head
`,
  229: `${NODE}

def swap_pairs(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None and prev.next.next is not None:
        a, b = prev.next, prev.next.next
        prev.next = b
        a.next = b.next
        b.next = a
        prev = a
    return dummy.next
`,
  230: `def odd_even_list(head):
    if head is None:
        return None
    odd, even = head, head.next
    even_head = even
    while even is not None and even.next is not None:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head
`,
  231: `${NODE}

def partition_list(head, x):
    less = less_tail = ListNode()
    rest = rest_tail = ListNode()
    while head is not None:
        if head.val < x:
            less_tail.next = head
            less_tail = head
        else:
            rest_tail.next = head
            rest_tail = head
        head = head.next
    rest_tail.next = None
    less_tail.next = rest.next
    return less.next
`,
  232: `class Node:
    def __init__(self, val, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random


def copy_random_list(head):
    copies = {None: None}
    n = head
    while n is not None:
        copies[n] = Node(n.val)
        n = n.next
    n = head
    while n is not None:
        copies[n].next = copies[n.next]
        copies[n].random = copies[n.random]
        n = n.next
    return copies[head]
`,
  233: `${NODE}

def sort_list(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    a, b = sort_list(head), sort_list(second)
    dummy = tail = ListNode()
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next
`,
  234: `${NODE}

def reverse_k_group(head, k):
    dummy = ListNode(0, head)
    before = dummy
    while True:
        check = before
        for _ in range(k):
            check = check.next
            if check is None:
                return dummy.next
        first = before.next
        after = check.next
        prev, cur = after, first
        while cur is not after:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        before.next = check
        before = first
`,
  235: `import heapq

${NODE}

def merge_k_lists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node is not None:
            heapq.heappush(heap, (node.val, i, node))
    dummy = tail = ListNode()
    while heap:
        _v, i, node = heapq.heappop(heap)
        tail.next = node
        tail = node
        if node.next is not None:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
`,
};
