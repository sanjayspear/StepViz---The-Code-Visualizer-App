// C and C++ linked structures: pointer members (ListNode* next), functions that give back pointers,
// trees, cycles, and how the frames and the explainer show them.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const run = (src: string) => runCpp(parser.parse(src)!, { maxSteps: 5000, maxSeconds: 5 });
const explain = (src: string, r: ReturnType<typeof run>) => explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });

const LIST = `#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v) : val(v), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    while (head) {
        ListNode* next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

int main() {
    ListNode* head = new ListNode(1);
    head->next = new ListNode(2);
    head->next->next = new ListNode(3);
    head = reverseList(head);
    for (ListNode* p = head; p != nullptr; p = p->next) cout << p->val << " ";
    cout << endl;
    head->val = 30;
    return 0;
}`;

test('a linked list: ListNode* next, new ListNode(1), a function giving back a pointer, while (head), a->next->val', () => {
  const r = run(LIST);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('3 2 1 \n');
  // Frames cut text at 40 characters, so the start of the object shows.
  const made = r.steps.find((s) => s.line === 22 && s.frames.length === 1)!;
  expect(made.frames[0].vars.head).toBe('points to new ListNode {val: 1, next: n…');
  expect(r.steps.some((s) => s.frames.some((f) => f.name === 'reverseList(new ListNode)'))).toBe(true);
});

test('the explainer tells what changed in an object made with new: linked in, set to nullptr, the same node as prev', () => {
  const r = run(LIST);
  const e = explain(LIST, r);
  const what = (line: number) => r.steps.map((s, i) => (s.line === line && s.kind === 'assign' ? e[i].what : null)).filter((x): x is string => !!x);
  expect(what(23)[0]).toMatch(/head->next now points to the new ListNode \{val: 2, next: nullptr\}|The new ListNode \{val: 2, next: nullptr\} is linked in: head->next points to it/);
  expect(what(24)[0]).toMatch(/head->next->next/);
  const rewire = what(14);
  expect(rewire[0]).toMatch(/head->next (is set to nullptr|now points to nothing)/);
  expect(rewire[1]).toMatch(/head->next (now points to the same ListNode as prev|is linked to the ListNode that prev points to)/);
  expect(what(28)[0]).toBe('head->val changes from 3 to 30.');
});

test('a tree with TreeNode* left = nullptr members, recursion on it, and a list that comes back round (cycle)', () => {
  const src = `#include <iostream>
#include <algorithm>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
    TreeNode(int v) {
        val = v;
    }
};

struct Node {
    int val;
    Node* next;
};

int depth(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + max(depth(root->left), depth(root->right));
}

int main() {
    TreeNode* root = new TreeNode(4);
    root->left = new TreeNode(2);
    root->left->right = new TreeNode(3);
    cout << depth(root) << endl;
    Node* c = new Node();
    c->val = 9;
    c->next = c;
    cout << (c->next == c) << c->next->next->val << endl;
    return 0;
}`;
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('3\n19\n');
  // A list that comes back round still shows (inside an object, a pointer to an object is not opened again).
  expect(r.steps.at(-1)!.frames[0].vars.c).toBe('points to new Node {val: 9, next: point…');
});

test('reading a member through nullptr stops with a plain-words crash; a struct holding itself stays on Home', () => {
  const crash = run(`#include <iostream>
using namespace std;
struct ListNode {
    int val;
    ListNode* next = nullptr;
};
int main() {
    ListNode* a = new ListNode();
    cout << a->next->val << endl;
    return 0;
}`);
  expect(crash.status).toBe('runtime-error');
  expect(crash.error?.type).toBe('NullPointer');
  const home = run(`struct Box {
    int v;
    Box inner;
};
int main() {
    return 0;
}`);
  expect(home.status).toBe('syntax-error');
  expect(home.error?.message).toBe("Line 3: A Box can't hold a whole Box inside itself: use a pointer, like Box* inner;");
});

test('a graph whose nodes point to each other through a vector<Node*> member shows without going round for ever', () => {
  const r = run(`#include <iostream>
#include <vector>
using namespace std;
struct Node {
    int val;
    vector<Node*> neighbors;
    Node(int x) : val(x) {}
};
int main() {
    Node* a = new Node(1);
    Node* b = new Node(2);
    a->neighbors.push_back(b);
    b->neighbors.push_back(a);
    vector<Node*> all = {a, b};
    cout << a->neighbors[0]->neighbors[0]->val << endl;
    return 0;
}`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('1\n');
  expect(r.steps.at(-1)!.frames[0].vars.a).toBe("points to new Node {val: 1, neighbors: …");
});
