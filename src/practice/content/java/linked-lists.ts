// Practice, Java: Linked lists (Q216-Q235). Tests come from the Python content;
// reference solutions in tests/practice/java/linked-lists.solutions.ts.
// Every starter brings its own ListNode class and two helpers in Main, so the code can be visualised.
import { fromPython, jsTests } from '../javascript/shared';
import { LINKED_LISTS } from '../python/linked-lists';
import { javaStarter, type JavaMethod } from './shared';

/** Q216 in Java: java.util already has a LinkedList class, so ours is MyLinkedList. */
const q216 = jsTests(LINKED_LISTS.find((c) => c.id === 216)!.tests).map((t) => ({ ...t, cls: 'MyLinkedList', ops: t.ops!.map((op, k) => (k === 0 ? ['MyLinkedList'] : op)) }));

const NODE = `import java.util.*;

class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }
}`;

const HELPERS = `    static ListNode build(int[] values) {
        // A linked list holding these values, in order.
        ListNode head = null;
        for (int i = values.length - 1; i >= 0; i--) {
            ListNode node = new ListNode(values[i]);
            node.next = head;
            head = node;
        }
        return head;
    }

    static List<Integer> toList(ListNode head) {
        // The values of a linked list, as a list (to print it).
        List<Integer> out = new ArrayList<>();
        for (ListNode n = head; n != null; n = n.next) out.add(n.val);
        return out;
    }`;

const list = (methods: JavaMethod[], mainBody: string) => javaStarter(methods, mainBody, NODE, HELPERS);
const one = (header: string, comment: string, mainBody: string) => list([[header, comment]], mainBody);

export const LINKED_LISTS_JAVA = fromPython(LINKED_LISTS, {
  216: {
    example: 'Example: after addLast(1), addLast(2) and addFirst(0), toText() returns "0 -> 1 -> 2".',
    starter: `class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }
}

class MyLinkedList {
    ListNode head;

    MyLinkedList() {
    }

    void addFirst(int x) {
        // Put x at the front.
    }

    void addLast(int x) {
        // Put x at the end.
    }

    boolean delete(int x) {
        // Remove the first node holding x. true if one was removed, false if x is not there.
        return false;
    }

    int size() {
        return 0;
    }

    String toText() {
        // The values joined by " -> ", like "0 -> 1 -> 2" ("" when empty). Print it to see the list.
        return "";
    }
}

public class Main {
    public static void main(String[] args) {
        MyLinkedList lst = new MyLinkedList();
        lst.addLast(1);
        lst.addLast(2);
        lst.addFirst(0);
        System.out.println(lst.toText());
    }
}
`,
    tests: q216,
    hint: 'Each node holds a value and a link to the next node; the list only remembers its head. addFirst makes a node pointing at the old head. addLast and delete walk along the links; to delete, make the node before it skip over it (the head is a special case). Like a treasure hunt where each clue says where the next one is.',
  },
  217: {
    example: 'Example: reverseIterative(build(new int[] {1, 2, 3})) and reverseRecursive(...) both give the list 3 -> 2 -> 1.',
    starter: list(
      [
        ['ListNode reverseIterative(ListNode head)', 'Reverse the list with a loop; return the new head.'],
        ['ListNode reverseRecursive(ListNode head)', 'Reverse the list with recursion; return the new head.'],
      ],
      'System.out.println(toList(reverseIterative(build(new int[] {1, 2, 3}))));\nSystem.out.println(toList(reverseRecursive(build(new int[] {1, 2, 3}))));',
    ),
    hint: "With a loop: keep prev = null; for each node, remember its next, point it back at prev, and move prev and the node one step on. With recursion: reverse the rest of the list first, then make the next node point back at this one and cut this node's own link. Like turning a conga line around, one dancer at a time.",
  },
  218: {
    example: 'Example: middleNode(build(new int[] {1, 2, 3, 4, 5})) returns the node holding 3.',
    starter: one('ListNode middleNode(ListNode head)', 'The middle node in one pass (the second middle one when there are two).', 'System.out.println(toList(middleNode(build(new int[] {1, 2, 3, 4, 5}))));'),
  },
  219: {
    example: 'Example: hasCycle(head) returns true when the last node links back to an earlier one.',
    starter: one(
      'boolean hasCycle(ListNode head)',
      'true if following next from head ever comes back to a node already visited.',
      'ListNode head = build(new int[] {3, 2, 0, -4});\nhead.next.next.next.next = head.next; // -4 links back to 2\nSystem.out.println(hasCycle(head));',
    ),
  },
  220: {
    example: 'Example: mergeTwo(build(new int[] {1, 2, 4}), build(new int[] {1, 3, 4})) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4.',
    starter: one('ListNode mergeTwo(ListNode a, ListNode b)', 'a and b are sorted. One sorted list made of their nodes; return its head.', 'System.out.println(toList(mergeTwo(build(new int[] {1, 2, 4}), build(new int[] {1, 3, 4}))));'),
    hint: 'Start with a dummy node (new ListNode(0)) and a tail pointer. While both lists have nodes, attach the smaller front node to the tail and move on in that list. Then attach whatever is left. Return dummy.next. Like merging two sorted queues at a ticket gate: always let the next person with the earlier ticket through.',
  },
  221: {
    example: 'Example: deleteDuplicates(build(new int[] {1, 1, 2, 3, 3})) gives 1 -> 2 -> 3.',
    starter: one('ListNode deleteDuplicates(ListNode head)', 'The list is sorted. Keep each value once; return the head.', 'System.out.println(toList(deleteDuplicates(build(new int[] {1, 1, 2, 3, 3}))));'),
  },
  222: {
    example: 'Example: isPalindromeList(build(new int[] {1, 2, 2, 1})) returns true.',
    starter: one('boolean isPalindromeList(ListNode head)', 'true if the values read the same forwards and backwards.', 'System.out.println(isPalindromeList(build(new int[] {1, 2, 2, 1})));'),
    hint: 'Find the middle with slow and fast pointers, reverse the second half, then walk both halves together comparing values. (Copying the values into an ArrayList also works, using more memory.) Like folding a paper strip in half to check the two halves line up.',
  },
  223: {
    example: 'Example: lists 4 -> 1 -> 8 -> 9 -> 10 and 5 -> 6 -> 2 -> 8 -> 9 -> 10 that share the nodes from 8 on: the answer is the node holding 8.',
    starter: one(
      'ListNode getIntersection(ListNode a, ListNode b)',
      'The first node that both lists share (the same node, not just the same value), or null.',
      'ListNode common = build(new int[] {8, 9, 10});\nListNode a = new ListNode(4);\na.next = new ListNode(1);\na.next.next = common;\nListNode b = new ListNode(5);\nb.next = common;\nSystem.out.println(getIntersection(a, b) == common); // true when it finds the shared node',
    ),
    hint: 'Walk pointer p through a then b, and pointer q through b then a. Both travel the same total distance, so they reach the shared node at the same moment (or both reach null). Compare nodes with ==, which asks "the same node?". Like two friends on different routes who swap routes halfway and meet at the same corner.',
  },
  224: {
    example: 'Example: for 3 -> 2 -> 0 -> -4 where -4 links back to 2, detectCycleStart returns the node holding 2.',
    starter: one(
      'ListNode detectCycleStart(ListNode head)',
      'The node where the cycle begins, or null if there is no cycle.',
      'ListNode head = build(new int[] {3, 2, 0, -4});\nhead.next.next.next.next = head.next; // -4 links back to 2\nSystem.out.println(detectCycleStart(head) == head.next); // true when it finds the node holding 2',
    ),
  },
  225: {
    example: 'Example: removeNthFromEnd(build(new int[] {1, 2, 3, 4, 5}), 2) gives 1 -> 2 -> 3 -> 5.',
    starter: one('ListNode removeNthFromEnd(ListNode head, int n)', 'Remove the nth node counting from the end (n = 1 is the last), in one pass. Return the head.', 'System.out.println(toList(removeNthFromEnd(build(new int[] {1, 2, 3, 4, 5}), 2)));'),
  },
  226: {
    example: 'Example: addTwoNumbers(build(new int[] {2, 4, 3}), build(new int[] {5, 6, 4})) gives 7 -> 0 -> 8 (342 + 465 = 807).',
    starter: one('ListNode addTwoNumbers(ListNode a, ListNode b)', "Each list holds a number's digits, ones digit first. Return their sum the same way.", 'System.out.println(toList(addTwoNumbers(build(new int[] {2, 4, 3}), build(new int[] {5, 6, 4}))));'),
    hint: 'Add digit by digit like on paper, starting with the ones: digit = (x + y + carry) % 10 and carry = (x + y + carry) / 10. Keep going while either list has digits or there is a carry. Like column addition at school, done right to left.',
  },
  227: {
    example: 'Example: reorderList(head) with head = 1 -> 2 -> 3 -> 4 changes it to 1 -> 4 -> 2 -> 3.',
    starter: one(
      'void reorderList(ListNode head)',
      'Change the list itself to first, last, second, second-last, ... (return nothing).',
      'ListNode head = build(new int[] {1, 2, 3, 4, 5});\nreorderList(head);\nSystem.out.println(toList(head));',
    ),
  },
  228: {
    example: 'Example: rotateRight(build(new int[] {1, 2, 3, 4, 5}), 2) gives 4 -> 5 -> 1 -> 2 -> 3.',
    starter: one('ListNode rotateRight(ListNode head, int k)', 'Move the last k nodes to the front (k may be bigger than the length). Return the head.', 'System.out.println(toList(rotateRight(build(new int[] {1, 2, 3, 4, 5}), 2)));'),
  },
  229: {
    example: 'Example: swapPairs(build(new int[] {1, 2, 3, 4})) gives 2 -> 1 -> 4 -> 3.',
    starter: one('ListNode swapPairs(ListNode head)', 'Swap every two neighbouring nodes (move the nodes, not just their values). Return the head.', 'System.out.println(toList(swapPairs(build(new int[] {1, 2, 3, 4}))));'),
  },
  230: {
    example: 'Example: oddEvenList(build(new int[] {1, 2, 3, 4, 5})) gives 1 -> 3 -> 5 -> 2 -> 4.',
    starter: one('ListNode oddEvenList(ListNode head)', 'Nodes at positions 1, 3, 5, ... first, then positions 2, 4, 6, ... (each group keeps its order).', 'System.out.println(toList(oddEvenList(build(new int[] {1, 2, 3, 4, 5}))));'),
  },
  231: {
    example: 'Example: partitionList(build(new int[] {1, 4, 3, 2, 5, 2}), 3) gives 1 -> 2 -> 2 -> 4 -> 3 -> 5.',
    starter: one('ListNode partitionList(ListNode head, int x)', 'Nodes with values less than x first, then the rest; each group keeps its order.', 'System.out.println(toList(partitionList(build(new int[] {1, 4, 3, 2, 5, 2}), 3)));'),
    hint: 'Build two chains with dummy heads: "less" and "the rest". Move each node to the end of the right chain, then join less to the rest and end the rest with null. Like sorting post into two trays and stacking one tray on the other.',
  },
  232: {
    example: 'Example: copyRandomList(head) gives new nodes with the same values, next links and random links.',
    starter: `import java.util.*;

class Node {
    int val;
    Node next;
    Node random;

    Node(int val) {
        this.val = val;
    }
}

public class Main {
    static Node copyRandomList(Node head) {
        // A deep copy: brand-new nodes whose next and random links point inside the copy.
        return null;
    }

    public static void main(String[] args) {
        Node a = new Node(7);
        Node b = new Node(13);
        Node c = new Node(11);
        a.next = b;
        b.next = c;
        b.random = a;
        c.random = a;
        Node copy = copyRandomList(a);
        System.out.println(copy != null && copy != a); // true when it makes new nodes
    }
}
`,
    hint: "Three passes: put each copy right after its original (A -> A' -> B -> B' ...); then each copy's random is its original's random.next (the copy of that node), or null; then split the two lists apart. Like photocopying a seating plan and then redrawing every arrow between the new seats.",
  },
  233: {
    example: 'Example: sortList(build(new int[] {4, 2, 1, 3})) gives 1 -> 2 -> 3 -> 4.',
    starter: one('ListNode sortList(ListNode head)', 'Sort the list in O(n log n) by moving nodes (no sorting of a copy). Return the head.', 'System.out.println(toList(sortList(build(new int[] {4, 2, 1, 3}))));'),
    hint: 'Merge sort: find the middle with slow and fast pointers and cut the list in two, sort each half the same way, then merge the two sorted halves. A list of 0 or 1 nodes is already sorted. Like sorting a pile of exam papers by splitting it with a friend, then merging your two sorted piles.',
    forbid: { names: ['sort', 'stream', 'PriorityQueue', 'TreeMap', 'TreeSet'], why: 'This question asks you to sort the nodes yourself, without sort().' },
  },
  234: {
    example: 'Example: reverseKGroup(build(new int[] {1, 2, 3, 4, 5}), 2) gives 2 -> 1 -> 4 -> 3 -> 5.',
    starter: one('ListNode reverseKGroup(ListNode head, int k)', 'Reverse each group of k nodes; a last group shorter than k stays as it is. Return the head.', 'System.out.println(toList(reverseKGroup(build(new int[] {1, 2, 3, 4, 5}), 2)));'),
  },
  235: {
    example: 'Example: mergeKLists of the lists 1 -> 4 -> 5, 1 -> 3 -> 4 and 2 -> 6 gives 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6.',
    starter: one(
      'ListNode mergeKLists(ListNode[] lists)',
      'lists holds the heads of sorted linked lists (some may be null). One sorted list of all the nodes.',
      'ListNode[] lists = {build(new int[] {1, 4, 5}), build(new int[] {1, 3, 4}), build(new int[] {2, 6})};\nSystem.out.println(toList(mergeKLists(lists)));',
    ),
    hint: 'Merge the lists in pairs, like merge sort: merge list 0 with 1, 2 with 3, and so on, then merge those results in pairs again until one list is left. (A PriorityQueue of nodes ordered by value is the other common way.) Like a knock-out tournament where pairs of sorted queues join until there is one.',
  },
});
