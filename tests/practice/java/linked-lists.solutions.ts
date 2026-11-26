// Java reference solutions for Practice: Linked lists. Never shipped to students.
const NODE = `class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }
}
`;
const main = (methods: string, before = NODE) => `import java.util.*;

${before}
public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const MERGE = `    static ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) {
                tail.next = a;
                a = a.next;
            } else {
                tail.next = b;
                b = b.next;
            }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
`;

export const SOLUTIONS: Record<number, string> = {
  216: main(
    ``,
    `${NODE}
class MyLinkedList {
    ListNode head;

    MyLinkedList() {
    }

    void addFirst(int x) {
        ListNode node = new ListNode(x);
        node.next = head;
        head = node;
    }

    void addLast(int x) {
        if (head == null) {
            head = new ListNode(x);
            return;
        }
        ListNode n = head;
        while (n.next != null) n = n.next;
        n.next = new ListNode(x);
    }

    boolean delete(int x) {
        if (head == null) return false;
        if (head.val == x) {
            head = head.next;
            return true;
        }
        for (ListNode n = head; n.next != null; n = n.next) {
            if (n.next.val == x) {
                n.next = n.next.next;
                return true;
            }
        }
        return false;
    }

    int size() {
        int count = 0;
        for (ListNode n = head; n != null; n = n.next) count++;
        return count;
    }

    String toText() {
        String out = "";
        for (ListNode n = head; n != null; n = n.next) out += (out.isEmpty() ? "" : " -> ") + n.val;
        return out;
    }
}
`,
  ),
  217: main(`    static ListNode reverseIterative(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }

    static ListNode reverseRecursive(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseRecursive(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }
`),
  218: main(`    static ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
`),
  219: main(`    static boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
`),
  220: main(MERGE),
  221: main(`    static ListNode deleteDuplicates(ListNode head) {
        ListNode n = head;
        while (n != null && n.next != null) {
            if (n.next.val == n.val) n.next = n.next.next;
            else n = n.next;
        }
        return head;
    }
`),
  222: main(`    static boolean isPalindromeList(ListNode head) {
        List<Integer> values = new ArrayList<>();
        for (ListNode n = head; n != null; n = n.next) values.add(n.val);
        for (int i = 0, j = values.size() - 1; i < j; i++, j--) {
            if (!values.get(i).equals(values.get(j))) return false;
        }
        return true;
    }
`),
  223: main(`    static ListNode getIntersection(ListNode a, ListNode b) {
        ListNode p = a;
        ListNode q = b;
        while (p != q) {
            p = p != null ? p.next : b;
            q = q != null ? q.next : a;
        }
        return p;
    }
`),
  224: main(`    static ListNode detectCycleStart(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode p = head;
                while (p != slow) {
                    p = p.next;
                    slow = slow.next;
                }
                return p;
            }
        }
        return null;
    }
`),
  225: main(`    static ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode front = dummy;
        ListNode back = dummy;
        for (int i = 0; i <= n; i++) front = front.next;
        while (front != null) {
            front = front.next;
            back = back.next;
        }
        back.next = back.next.next;
        return dummy.next;
    }
`),
  226: main(`    static ListNode addTwoNumbers(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        int carry = 0;
        while (a != null || b != null || carry > 0) {
            int total = carry;
            if (a != null) {
                total += a.val;
                a = a.next;
            }
            if (b != null) {
                total += b.val;
                b = b.next;
            }
            tail.next = new ListNode(total % 10);
            tail = tail.next;
            carry = total / 10;
        }
        return dummy.next;
    }
`),
  227: main(`    static void reorderList(ListNode head) {
        if (head == null) return;
        ListNode slow = head;
        ListNode fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode second = slow.next;
        slow.next = null;
        ListNode prev = null;
        while (second != null) {
            ListNode next = second.next;
            second.next = prev;
            prev = second;
            second = next;
        }
        ListNode first = head;
        second = prev;
        while (second != null) {
            ListNode a = first.next;
            ListNode b = second.next;
            first.next = second;
            second.next = a;
            first = a;
            second = b;
        }
    }
`),
  228: main(`    static ListNode rotateRight(ListNode head, int k) {
        if (head == null) return null;
        int n = 1;
        ListNode tail = head;
        while (tail.next != null) {
            tail = tail.next;
            n++;
        }
        k %= n;
        if (k == 0) return head;
        tail.next = head;
        ListNode newTail = head;
        for (int i = 0; i < n - k - 1; i++) newTail = newTail.next;
        ListNode newHead = newTail.next;
        newTail.next = null;
        return newHead;
    }
`),
  229: main(`    static ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prev = dummy;
        while (prev.next != null && prev.next.next != null) {
            ListNode a = prev.next;
            ListNode b = a.next;
            prev.next = b;
            a.next = b.next;
            b.next = a;
            prev = a;
        }
        return dummy.next;
    }
`),
  230: main(`    static ListNode oddEvenList(ListNode head) {
        if (head == null) return null;
        ListNode odd = head;
        ListNode even = head.next;
        ListNode evenHead = even;
        while (even != null && even.next != null) {
            odd.next = even.next;
            odd = odd.next;
            even.next = odd.next;
            even = even.next;
        }
        odd.next = evenHead;
        return head;
    }
`),
  231: main(`    static ListNode partitionList(ListNode head, int x) {
        ListNode less = new ListNode(0);
        ListNode rest = new ListNode(0);
        ListNode lessTail = less;
        ListNode restTail = rest;
        for (ListNode n = head; n != null; n = n.next) {
            if (n.val < x) {
                lessTail.next = n;
                lessTail = n;
            } else {
                restTail.next = n;
                restTail = n;
            }
        }
        restTail.next = null;
        lessTail.next = rest.next;
        return less.next;
    }
`),
  232: main(
    `    static Node copyRandomList(Node head) {
        if (head == null) return null;
        for (Node n = head; n != null; n = n.next.next) {
            Node c = new Node(n.val);
            c.next = n.next;
            n.next = c;
        }
        for (Node n = head; n != null; n = n.next.next) {
            n.next.random = n.random == null ? null : n.random.next;
        }
        Node copyHead = head.next;
        for (Node n = head; n != null; n = n.next) {
            Node c = n.next;
            n.next = c.next;
            c.next = c.next == null ? null : c.next.next;
        }
        return copyHead;
    }
`,
    `class Node {
    int val;
    Node next;
    Node random;

    Node(int val) {
        this.val = val;
    }
}
`,
  ),
  233: main(`${MERGE}
    static ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head;
        ListNode fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode second = slow.next;
        slow.next = null;
        return mergeTwo(sortList(head), sortList(second));
    }
`),
  234: main(`    static ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode before = dummy;
        while (true) {
            ListNode check = before;
            for (int i = 0; i < k; i++) {
                check = check.next;
                if (check == null) return dummy.next;
            }
            ListNode first = before.next;
            ListNode after = check.next;
            ListNode prev = after;
            ListNode cur = first;
            while (cur != after) {
                ListNode next = cur.next;
                cur.next = prev;
                prev = cur;
                cur = next;
            }
            before.next = check;
            before = first;
        }
    }
`),
  235: main(`${MERGE}
    static ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        List<ListNode> current = new ArrayList<>();
        for (ListNode l : lists) current.add(l);
        while (current.size() > 1) {
            List<ListNode> next = new ArrayList<>();
            for (int i = 0; i < current.size(); i += 2) {
                next.add(i + 1 < current.size() ? mergeTwo(current.get(i), current.get(i + 1)) : current.get(i));
            }
            current = next;
        }
        return current.get(0);
    }
`),
};
