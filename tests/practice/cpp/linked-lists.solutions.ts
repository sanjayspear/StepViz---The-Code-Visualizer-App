// C++ reference solutions for Practice: Linked lists. Never shipped to students.
const NODE = `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
`;
const file = (functions: string, node = NODE) => `#include <iostream>
#include <vector>
#include <string>
using namespace std;

${node}
${functions}
int main() {
    return 0;
}
`;
const MERGE = `ListNode* mergeTwo(ListNode* a, ListNode* b) {
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    while (a != nullptr && b != nullptr) {
        if (a->val <= b->val) {
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }
    tail->next = a != nullptr ? a : b;
    return dummy->next;
}
`;
const REVERSE = `ListNode* reverseIterative(ListNode* head) {
    ListNode* prev = nullptr;
    while (head != nullptr) {
        ListNode* next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}
`;

export const SOLUTIONS: Record<number, string> = {
  216: file(`class LinkedList {
public:
    ListNode* head = nullptr;

    LinkedList() {
    }

    void addFirst(int x) {
        ListNode* node = new ListNode(x);
        node->next = head;
        head = node;
    }

    void addLast(int x) {
        ListNode* node = new ListNode(x);
        if (head == nullptr) {
            head = node;
            return;
        }
        ListNode* cur = head;
        while (cur->next != nullptr) cur = cur->next;
        cur->next = node;
    }

    bool remove(int x) {
        if (head == nullptr) return false;
        if (head->val == x) {
            head = head->next;
            return true;
        }
        for (ListNode* cur = head; cur->next != nullptr; cur = cur->next) {
            if (cur->next->val == x) {
                cur->next = cur->next->next;
                return true;
            }
        }
        return false;
    }

    int size() {
        int n = 0;
        for (ListNode* cur = head; cur != nullptr; cur = cur->next) n++;
        return n;
    }

    string toText() {
        string out = "";
        for (ListNode* cur = head; cur != nullptr; cur = cur->next) {
            if (!out.empty()) out += " -> ";
            out += to_string(cur->val);
        }
        return out;
    }
};
`),
  217: file(`${REVERSE}
ListNode* reverseRecursive(ListNode* head) {
    if (head == nullptr || head->next == nullptr) return head;
    ListNode* rest = reverseRecursive(head->next);
    head->next->next = head;
    head->next = nullptr;
    return rest;
}
`),
  218: file(`ListNode* middleNode(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
`),
  219: file(`bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}
`),
  220: file(MERGE),
  221: file(`ListNode* deleteDuplicates(ListNode* head) {
    ListNode* cur = head;
    while (cur != nullptr && cur->next != nullptr) {
        if (cur->next->val == cur->val) cur->next = cur->next->next;
        else cur = cur->next;
    }
    return head;
}
`),
  222: file(`bool isPalindromeList(ListNode* head) {
    vector<int> values;
    for (ListNode* n = head; n != nullptr; n = n->next) values.push_back(n->val);
    int i = 0;
    int j = values.size() - 1;
    while (i < j) {
        if (values[i] != values[j]) return false;
        i++;
        j--;
    }
    return true;
}
`),
  223: file(`ListNode* getIntersection(ListNode* a, ListNode* b) {
    ListNode* p = a;
    ListNode* q = b;
    while (p != q) {
        p = p == nullptr ? b : p->next;
        q = q == nullptr ? a : q->next;
    }
    return p;
}
`),
  224: file(`ListNode* detectCycleStart(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            ListNode* p = head;
            while (p != slow) {
                p = p->next;
                slow = slow->next;
            }
            return p;
        }
    }
    return nullptr;
}
`),
  225: file(`ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode* dummy = new ListNode(0);
    dummy->next = head;
    ListNode* fast = dummy;
    ListNode* slow = dummy;
    for (int i = 0; i < n; i++) fast = fast->next;
    while (fast->next != nullptr) {
        fast = fast->next;
        slow = slow->next;
    }
    slow->next = slow->next->next;
    return dummy->next;
}
`),
  226: file(`ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    int carry = 0;
    while (a != nullptr || b != nullptr || carry > 0) {
        int total = carry;
        if (a != nullptr) {
            total += a->val;
            a = a->next;
        }
        if (b != nullptr) {
            total += b->val;
            b = b->next;
        }
        tail->next = new ListNode(total % 10);
        tail = tail->next;
        carry = total / 10;
    }
    return dummy->next;
}
`),
  227: file(`${REVERSE}
void reorderList(ListNode* head) {
    if (head == nullptr || head->next == nullptr) return;
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast->next != nullptr && fast->next->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = reverseIterative(slow->next);
    slow->next = nullptr;
    ListNode* first = head;
    while (second != nullptr) {
        ListNode* a = first->next;
        ListNode* b = second->next;
        first->next = second;
        second->next = a;
        first = a;
        second = b;
    }
}
`),
  228: file(`ListNode* rotateRight(ListNode* head, int k) {
    if (head == nullptr) return head;
    int n = 1;
    ListNode* tail = head;
    while (tail->next != nullptr) {
        tail = tail->next;
        n++;
    }
    k = k % n;
    if (k == 0) return head;
    ListNode* cut = head;
    for (int i = 1; i < n - k; i++) cut = cut->next;
    ListNode* newHead = cut->next;
    cut->next = nullptr;
    tail->next = head;
    return newHead;
}
`),
  229: file(`ListNode* swapPairs(ListNode* head) {
    ListNode* dummy = new ListNode(0);
    dummy->next = head;
    ListNode* prev = dummy;
    while (prev->next != nullptr && prev->next->next != nullptr) {
        ListNode* a = prev->next;
        ListNode* b = a->next;
        a->next = b->next;
        b->next = a;
        prev->next = b;
        prev = a;
    }
    return dummy->next;
}
`),
  230: file(`ListNode* oddEvenList(ListNode* head) {
    if (head == nullptr) return head;
    ListNode* odd = head;
    ListNode* even = head->next;
    ListNode* evenHead = even;
    while (even != nullptr && even->next != nullptr) {
        odd->next = even->next;
        odd = odd->next;
        even->next = odd->next;
        even = even->next;
    }
    odd->next = evenHead;
    return head;
}
`),
  231: file(`ListNode* partitionList(ListNode* head, int x) {
    ListNode* less = new ListNode(0);
    ListNode* rest = new ListNode(0);
    ListNode* a = less;
    ListNode* b = rest;
    for (ListNode* n = head; n != nullptr; n = n->next) {
        if (n->val < x) {
            a->next = n;
            a = n;
        } else {
            b->next = n;
            b = n;
        }
    }
    b->next = nullptr;
    a->next = rest->next;
    return less->next;
}
`),
  232: file(
    `Node* copyRandomList(Node* head) {
    if (head == nullptr) return nullptr;
    for (Node* n = head; n != nullptr; n = n->next->next) {
        Node* copy = new Node(n->val);
        copy->next = n->next;
        n->next = copy;
    }
    for (Node* n = head; n != nullptr; n = n->next->next) {
        if (n->random != nullptr) n->next->random = n->random->next;
    }
    Node* newHead = head->next;
    for (Node* n = head; n != nullptr; n = n->next) {
        Node* copy = n->next;
        n->next = copy->next;
        if (copy->next != nullptr) copy->next = copy->next->next;
    }
    return newHead;
}
`,
    `struct Node {
    int val;
    Node* next;
    Node* random;
    Node(int x) : val(x), next(nullptr), random(nullptr) {}
};
`,
  ),
  233: file(`${MERGE}
ListNode* sortList(ListNode* head) {
    if (head == nullptr || head->next == nullptr) return head;
    ListNode* slow = head;
    ListNode* fast = head->next;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = slow->next;
    slow->next = nullptr;
    return mergeTwo(sortList(head), sortList(second));
}
`),
  234: file(`ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode* check = head;
    for (int i = 0; i < k; i++) {
        if (check == nullptr) return head;
        check = check->next;
    }
    ListNode* prev = reverseKGroup(check, k);
    ListNode* cur = head;
    for (int i = 0; i < k; i++) {
        ListNode* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
`),
  235: file(`${MERGE}
ListNode* mergeKLists(vector<ListNode*>& lists) {
    if (lists.empty()) return nullptr;
    vector<ListNode*> now = lists;
    while (now.size() > 1) {
        vector<ListNode*> next;
        for (int i = 0; i < now.size(); i += 2) {
            if (i + 1 < now.size()) next.push_back(mergeTwo(now[i], now[i + 1]));
            else next.push_back(now[i]);
        }
        now = next;
    }
    return now[0];
}
`),
};
