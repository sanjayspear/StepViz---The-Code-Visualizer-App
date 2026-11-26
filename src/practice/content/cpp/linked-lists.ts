// Practice, C++: Linked lists (Q216-Q235). Tests come from the Python content;
// reference solutions in tests/practice/cpp/linked-lists.solutions.ts.
// Every starter brings its own ListNode struct and two helpers, so the code can be visualised.
import { fromPython, jsTests } from '../javascript/shared';
import { LINKED_LISTS } from '../python/linked-lists';
import { cppStarter, type CppFunction } from './shared';

/** Q216 in C++: delete is a C++ word (it removes a box made with new), so the method is remove. */
const q216 = jsTests(LINKED_LISTS.find((c) => c.id === 216)!.tests).map((t) => ({ ...t, ops: t.ops!.map((op) => (op[0] === 'delete' ? ['remove', ...op.slice(1)] : op)) }));

const NODE = `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};`;

const HELPERS = `ListNode* build(vector<int> values) {
    // A linked list holding these values, in order.
    ListNode* head = nullptr;
    for (int i = values.size() - 1; i >= 0; i--) {
        ListNode* node = new ListNode(values[i]);
        node->next = head;
        head = node;
    }
    return head;
}

void printList(ListNode* head) {
    // Print the values of a linked list, like 1 -> 2 -> 3.
    for (ListNode* n = head; n != nullptr; n = n->next) {
        cout << n->val;
        if (n->next != nullptr) cout << " -> ";
    }
    cout << endl;
}`;

const list = (functions: CppFunction[], mainBody: string) => cppStarter(functions, mainBody, [], `${NODE}\n\n${HELPERS}`);
const one = (header: string, comment: string, mainBody: string) => list([[header, comment]], mainBody);
const built = (name: string, values: string) => `vector<int> ${name}Values = {${values}};\nListNode* ${name} = build(${name}Values);`;

export const LINKED_LISTS_CPP = fromPython(LINKED_LISTS, {
  216: {
    example: 'Example: after addLast(1), addLast(2) and addFirst(0), toText() returns "0 -> 1 -> 2".',
    starter: `#include <iostream>
#include <string>
using namespace std;

${NODE}

class LinkedList {
public:
    ListNode* head = nullptr;

    LinkedList() {
    }

    void addFirst(int x) {
        // Put x at the front.
    }

    void addLast(int x) {
        // Put x at the end.
    }

    bool remove(int x) {
        // Remove the first node holding x. true if one was removed, false if x is not there.
        return false;
    }

    int size() {
        return 0;
    }

    string toText() {
        // The values joined by " -> ", like "0 -> 1 -> 2" ("" when empty). Print it to see the list.
        return "";
    }
};

int main() {
    LinkedList lst;
    lst.addLast(1);
    lst.addLast(2);
    lst.addFirst(0);
    cout << lst.toText() << endl;
    return 0;
}
`,
    tests: q216,
    hint: 'Each node holds a value and a pointer to the next node; the list only remembers its head. addFirst makes a node (new ListNode(x)) pointing at the old head. addLast and remove walk along the pointers; to remove, make the node before it skip over it (the head is a special case). Like a treasure hunt where each clue says where the next one is.',
  },
  217: {
    example: 'Example: reverseIterative(build({1, 2, 3})) and reverseRecursive(...) both give the list 3 -> 2 -> 1.',
    starter: list(
      [
        ['ListNode* reverseIterative(ListNode* head)', 'Reverse the list with a loop; return the new head.'],
        ['ListNode* reverseRecursive(ListNode* head)', 'Reverse the list with recursion; return the new head.'],
      ],
      `${built('a', '1, 2, 3')}\nprintList(reverseIterative(a));\n${built('b', '1, 2, 3')}\nprintList(reverseRecursive(b));`,
    ),
    hint: "With a loop: keep prev = nullptr; for each node, remember its next, point it back at prev, and move prev and the node one step on. With recursion: reverse the rest of the list first, then make the next node point back at this one (head->next->next = head) and cut this node's own link. Like turning a conga line around, one dancer at a time.",
  },
  218: {
    example: 'Example: middleNode(build({1, 2, 3, 4, 5})) returns the node holding 3.',
    starter: one('ListNode* middleNode(ListNode* head)', 'The middle node in one pass (the second middle one when there are two).', `${built('head', '1, 2, 3, 4, 5')}\nprintList(middleNode(head));`),
  },
  219: {
    example: 'Example: hasCycle(head) returns true when the last node links back to an earlier one.',
    starter: one(
      'bool hasCycle(ListNode* head)',
      'true if following next from head ever comes back to a node already visited.',
      `${built('head', '3, 2, 0, -4')}\nhead->next->next->next->next = head->next; // -4 links back to 2\ncout << boolalpha << hasCycle(head) << endl;`,
    ),
  },
  220: {
    example: 'Example: mergeTwo(build({1, 2, 4}), build({1, 3, 4})) gives 1 -> 1 -> 2 -> 3 -> 4 -> 4.',
    starter: one('ListNode* mergeTwo(ListNode* a, ListNode* b)', 'a and b are sorted. One sorted list made of their nodes; return its head.', `${built('a', '1, 2, 4')}\n${built('b', '1, 3, 4')}\nprintList(mergeTwo(a, b));`),
    hint: 'Start with a dummy node (new ListNode(0)) and a tail pointer. While both lists have nodes, attach the smaller front node to the tail and move on in that list. Then attach whatever is left. Return dummy->next. Like merging two sorted queues at a ticket gate: always let the next person with the earlier ticket through.',
  },
  221: {
    example: 'Example: deleteDuplicates(build({1, 1, 2, 3, 3})) gives 1 -> 2 -> 3.',
    starter: one('ListNode* deleteDuplicates(ListNode* head)', 'The list is sorted. Keep each value once; return the head.', `${built('head', '1, 1, 2, 3, 3')}\nprintList(deleteDuplicates(head));`),
  },
  222: {
    example: 'Example: isPalindromeList(build({1, 2, 2, 1})) returns true.',
    starter: one('bool isPalindromeList(ListNode* head)', 'true if the values read the same forwards and backwards.', `${built('head', '1, 2, 2, 1')}\ncout << boolalpha << isPalindromeList(head) << endl;`),
    hint: 'Find the middle with slow and fast pointers, reverse the second half, then walk both halves together comparing values. (Copying the values into a vector also works, using more memory.) Like folding a paper strip in half to check the two halves line up.',
  },
  223: {
    example: 'Example: lists 4 -> 1 -> 8 -> 9 -> 10 and 5 -> 6 -> 2 -> 8 -> 9 -> 10 that share the nodes from 8 on: the answer is the node holding 8.',
    starter: one(
      'ListNode* getIntersection(ListNode* a, ListNode* b)',
      'The first node that both lists share (the same node, not just the same value), or nullptr.',
      `${built('common', '8, 9, 10')}\nListNode* a = new ListNode(4);\na->next = new ListNode(1);\na->next->next = common;\nListNode* b = new ListNode(5);\nb->next = common;\ncout << boolalpha << (getIntersection(a, b) == common) << endl; // true when it finds the shared node`,
    ),
    hint: 'Walk pointer p through a then b, and pointer q through b then a. Both travel the same total distance, so they reach the shared node at the same moment (or both reach nullptr). Compare the pointers with ==, which asks "the same node?". Like two friends on different routes who swap routes halfway and meet at the same corner.',
  },
  224: {
    example: 'Example: for 3 -> 2 -> 0 -> -4 where -4 links back to 2, detectCycleStart returns the node holding 2.',
    starter: one(
      'ListNode* detectCycleStart(ListNode* head)',
      'The node where the cycle begins, or nullptr if there is no cycle.',
      `${built('head', '3, 2, 0, -4')}\nhead->next->next->next->next = head->next; // -4 links back to 2\ncout << boolalpha << (detectCycleStart(head) == head->next) << endl; // true when it finds the node holding 2`,
    ),
  },
  225: {
    example: 'Example: removeNthFromEnd(build({1, 2, 3, 4, 5}), 2) gives 1 -> 2 -> 3 -> 5.',
    starter: one('ListNode* removeNthFromEnd(ListNode* head, int n)', 'Remove the nth node counting from the end (n = 1 is the last), in one pass. Return the head.', `${built('head', '1, 2, 3, 4, 5')}\nprintList(removeNthFromEnd(head, 2));`),
  },
  226: {
    example: 'Example: addTwoNumbers(build({2, 4, 3}), build({5, 6, 4})) gives 7 -> 0 -> 8 (342 + 465 = 807).',
    starter: one('ListNode* addTwoNumbers(ListNode* a, ListNode* b)', "Each list holds a number's digits, ones digit first. Return their sum the same way.", `${built('a', '2, 4, 3')}\n${built('b', '5, 6, 4')}\nprintList(addTwoNumbers(a, b));`),
    hint: 'Add digit by digit like on paper, starting with the ones: digit = (x + y + carry) % 10 and carry = (x + y + carry) / 10. Keep going while either list has digits or there is a carry. Like column addition at school, done right to left.',
  },
  227: {
    example: 'Example: reorderList(head) with head = 1 -> 2 -> 3 -> 4 changes it to 1 -> 4 -> 2 -> 3.',
    starter: one('void reorderList(ListNode* head)', 'Change the list itself to first, last, second, second-last, ... (return nothing).', `${built('head', '1, 2, 3, 4, 5')}\nreorderList(head);\nprintList(head);`),
  },
  228: {
    example: 'Example: rotateRight(build({1, 2, 3, 4, 5}), 2) gives 4 -> 5 -> 1 -> 2 -> 3.',
    starter: one('ListNode* rotateRight(ListNode* head, int k)', 'Move the last k nodes to the front (k may be bigger than the length). Return the head.', `${built('head', '1, 2, 3, 4, 5')}\nprintList(rotateRight(head, 2));`),
  },
  229: {
    example: 'Example: swapPairs(build({1, 2, 3, 4})) gives 2 -> 1 -> 4 -> 3.',
    starter: one('ListNode* swapPairs(ListNode* head)', 'Swap every two neighbouring nodes (move the nodes, not just their values). Return the head.', `${built('head', '1, 2, 3, 4')}\nprintList(swapPairs(head));`),
  },
  230: {
    example: 'Example: oddEvenList(build({1, 2, 3, 4, 5})) gives 1 -> 3 -> 5 -> 2 -> 4.',
    starter: one('ListNode* oddEvenList(ListNode* head)', 'Nodes at positions 1, 3, 5, ... first, then positions 2, 4, 6, ... (each group keeps its order).', `${built('head', '1, 2, 3, 4, 5')}\nprintList(oddEvenList(head));`),
  },
  231: {
    example: 'Example: partitionList(build({1, 4, 3, 2, 5, 2}), 3) gives 1 -> 2 -> 2 -> 4 -> 3 -> 5.',
    starter: one('ListNode* partitionList(ListNode* head, int x)', 'Nodes with values less than x first, then the rest; each group keeps its order.', `${built('head', '1, 4, 3, 2, 5, 2')}\nprintList(partitionList(head, 3));`),
    hint: 'Build two chains with dummy heads: "less" and "the rest". Move each node to the end of the right chain, then join less to the rest and end the rest with nullptr. Like sorting post into two trays and stacking one tray on the other.',
  },
  232: {
    example: 'Example: copyRandomList(head) gives new nodes with the same values, next links and random links.',
    starter: `#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node* random;
    Node(int x) : val(x), next(nullptr), random(nullptr) {}
};

Node* copyRandomList(Node* head) {
    // A deep copy: brand-new nodes whose next and random pointers point inside the copy.
    return nullptr;
}

int main() {
    Node* a = new Node(7);
    Node* b = new Node(13);
    Node* c = new Node(11);
    a->next = b;
    b->next = c;
    b->random = a;
    c->random = a;
    Node* copy = copyRandomList(a);
    cout << boolalpha << (copy != nullptr && copy != a) << endl; // true when it makes new nodes
    return 0;
}
`,
    hint: "Three passes: put each copy right after its original (A -> A' -> B -> B' ...); then each copy's random is its original's random->next (the copy of that node), or nullptr; then split the two lists apart. Like photocopying a seating plan and then redrawing every arrow between the new seats.",
  },
  233: {
    example: 'Example: sortList(build({4, 2, 1, 3})) gives 1 -> 2 -> 3 -> 4.',
    starter: one('ListNode* sortList(ListNode* head)', 'Sort the list in O(n log n) by moving nodes (no sorting of a copy). Return the head.', `${built('head', '4, 2, 1, 3')}\nprintList(sortList(head));`),
    hint: 'Merge sort: find the middle with slow and fast pointers and cut the list in two, sort each half the same way, then merge the two sorted halves. A list of 0 or 1 nodes is already sorted. Like sorting a pile of exam papers by splitting it with a friend, then merging your two sorted piles.',
    forbid: {
      names: ['sort', 'stable_sort', 'partial_sort'],
      patterns: [{ regex: '(set|multiset|map|multimap|priority_queue)<', shown: 'a sorted container' }],
      why: 'This question asks you to sort the nodes yourself, without sort().',
    },
  },
  234: {
    example: 'Example: reverseKGroup(build({1, 2, 3, 4, 5}), 2) gives 2 -> 1 -> 4 -> 3 -> 5.',
    starter: one('ListNode* reverseKGroup(ListNode* head, int k)', 'Reverse each group of k nodes; a last group shorter than k stays as it is. Return the head.', `${built('head', '1, 2, 3, 4, 5')}\nprintList(reverseKGroup(head, 2));`),
  },
  235: {
    example: 'Example: mergeKLists of the lists 1 -> 4 -> 5, 1 -> 3 -> 4 and 2 -> 6 gives 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6.',
    starter: one(
      'ListNode* mergeKLists(vector<ListNode*>& lists)',
      'lists holds the heads of sorted linked lists (some may be nullptr). One sorted list of all the nodes.',
      `${built('a', '1, 4, 5')}\n${built('b', '1, 3, 4')}\n${built('c', '2, 6')}\nvector<ListNode*> lists = {a, b, c};\nprintList(mergeKLists(lists));`,
    ),
    hint: 'Merge the lists in pairs, like merge sort: merge list 0 with 1, 2 with 3, and so on, then merge those results in pairs again until one list is left. (A priority_queue of nodes ordered by value is the other common way.) Like a knock-out tournament where pairs of sorted queues join until there is one.',
  },
});
