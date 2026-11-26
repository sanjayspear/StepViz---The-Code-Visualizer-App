// C++ reference solutions for Practice: Stacks & queues. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <stack>
#include <queue>
using namespace std;

${functions}
int main() {
    return 0;
}
`;

export const SOLUTIONS: Record<number, string> = {
  151: file(`bool isBalanced(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else if (c == ')' || c == ']' || c == '}') {
            char open = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (st.empty() || st.top() != open) return false;
            st.pop();
        }
    }
    return st.empty();
}
`),
  152: file(`class Stack {
public:
    vector<int> items;

    Stack() {
    }

    void push(int x) {
        items.push_back(x);
    }

    int pop() {
        if (items.empty()) return -1;
        int x = items.back();
        items.pop_back();
        return x;
    }

    int peek() {
        if (items.empty()) return -1;
        return items.back();
    }

    bool isEmpty() {
        return items.empty();
    }
};
`),
  153: file(`class MyQueue {
public:
    stack<int> inbox;
    stack<int> outbox;

    MyQueue() {
    }

    void push(int x) {
        inbox.push(x);
    }

    void move() {
        if (outbox.empty()) {
            while (!inbox.empty()) {
                outbox.push(inbox.top());
                inbox.pop();
            }
        }
    }

    int pop() {
        move();
        int x = outbox.top();
        outbox.pop();
        return x;
    }

    int peek() {
        move();
        return outbox.top();
    }

    bool empty() {
        return inbox.empty() && outbox.empty();
    }
};
`),
  154: file(`class MyStack {
public:
    queue<int> q;

    MyStack() {
    }

    void push(int x) {
        q.push(x);
        for (int i = 0; i + 1 < q.size(); i++) {
            q.push(q.front());
            q.pop();
        }
    }

    int pop() {
        int x = q.front();
        q.pop();
        return x;
    }

    int top() {
        return q.front();
    }

    bool empty() {
        return q.empty();
    }
};
`),
  155: file(`string reverseWithStack(string s) {
    stack<char> st;
    for (char c : s) st.push(c);
    string out = "";
    while (!st.empty()) {
        out += st.top();
        st.pop();
    }
    return out;
}
`),
  156: file(`string removeAdjacentDuplicates(string s) {
    string st = "";
    for (char c : s) {
        if (!st.empty() && st.back() == c) st.pop_back();
        else st.push_back(c);
    }
    return st;
}
`),
  157: file(`vector<string> binaryNumbers(int n) {
    vector<string> out;
    queue<string> q;
    q.push("1");
    for (int i = 0; i < n; i++) {
        string item = q.front();
        q.pop();
        out.push_back(item);
        q.push(item + "0");
        q.push(item + "1");
    }
    return out;
}
`),
  158: file(`class MinStack {
public:
    vector<int> values;
    vector<int> mins;

    MinStack() {
    }

    void push(int x) {
        values.push_back(x);
        if (mins.empty()) mins.push_back(x);
        else mins.push_back(min(x, mins.back()));
    }

    void pop() {
        values.pop_back();
        mins.pop_back();
    }

    int top() {
        return values.back();
    }

    int getMin() {
        return mins.back();
    }
};
`),
  159: file(`int evalPostfix(string expr) {
    stack<int> st;
    string tok = "";
    expr += " ";
    for (char c : expr) {
        if (c != ' ') {
            tok += c;
            continue;
        }
        if (tok.empty()) continue;
        if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
            int b = st.top();
            st.pop();
            int a = st.top();
            st.pop();
            if (tok == "+") st.push(a + b);
            else if (tok == "-") st.push(a - b);
            else if (tok == "*") st.push(a * b);
            else st.push(a / b);
        } else {
            st.push(stoi(tok));
        }
        tok = "";
    }
    return st.top();
}
`),
  160: file(`int prec(char c) {
    if (c == '+' || c == '-') return 1;
    if (c == '*' || c == '/') return 2;
    return 3;
}

string infixToPostfix(string expr) {
    string out = "";
    stack<char> st;
    for (char c : expr) {
        if (isalpha(c)) out += c;
        else if (c == '(') st.push(c);
        else if (c == ')') {
            while (st.top() != '(') {
                out += st.top();
                st.pop();
            }
            st.pop();
        } else {
            while (!st.empty() && st.top() != '(' && (prec(st.top()) > prec(c) || (prec(st.top()) == prec(c) && c != '^'))) {
                out += st.top();
                st.pop();
            }
            st.push(c);
        }
    }
    while (!st.empty()) {
        out += st.top();
        st.pop();
    }
    return out;
}
`),
  161: file(`vector<int> nextGreater(vector<int>& nums) {
    vector<int> out(nums.size(), -1);
    stack<int> waiting;
    for (int i = 0; i < nums.size(); i++) {
        while (!waiting.empty() && nums[waiting.top()] < nums[i]) {
            out[waiting.top()] = nums[i];
            waiting.pop();
        }
        waiting.push(i);
    }
    return out;
}
`),
  162: file(`vector<int> dailyTemperatures(vector<int>& temps) {
    vector<int> out(temps.size(), 0);
    stack<int> waiting;
    for (int i = 0; i < temps.size(); i++) {
        while (!waiting.empty() && temps[waiting.top()] < temps[i]) {
            int j = waiting.top();
            waiting.pop();
            out[j] = i - j;
        }
        waiting.push(i);
    }
    return out;
}
`),
  163: file(`string simplifyPath(string path) {
    vector<string> st;
    string part = "";
    path += "/";
    for (char c : path) {
        if (c != '/') {
            part += c;
            continue;
        }
        if (part == "..") {
            if (!st.empty()) st.pop_back();
        } else if (!part.empty() && part != ".") {
            st.push_back(part);
        }
        part = "";
    }
    string out = "";
    for (string s : st) out += "/" + s;
    return out.empty() ? "/" : out;
}
`),
  164: file(`string decodeString(string s) {
    stack<string> texts;
    stack<int> counts;
    string text = "";
    int number = 0;
    for (char c : s) {
        if (isdigit(c)) number = number * 10 + (c - '0');
        else if (c == '[') {
            texts.push(text);
            counts.push(number);
            text = "";
            number = 0;
        } else if (c == ']') {
            string repeated = "";
            int k = counts.top();
            counts.pop();
            for (int j = 0; j < k; j++) repeated += text;
            text = texts.top() + repeated;
            texts.pop();
        } else {
            text += c;
        }
    }
    return text;
}
`),
  165: file(`class MyCircularQueue {
public:
    vector<int> data;
    int k;
    int head = 0;
    int count = 0;

    MyCircularQueue(int k) {
        this->k = k;
        for (int i = 0; i < k; i++) data.push_back(0);
    }

    bool enqueue(int value) {
        if (count == k) return false;
        data[(head + count) % k] = value;
        count++;
        return true;
    }

    bool dequeue() {
        if (count == 0) return false;
        head = (head + 1) % k;
        count--;
        return true;
    }

    int front() {
        return count == 0 ? -1 : data[head];
    }

    int rear() {
        return count == 0 ? -1 : data[(head + count - 1) % k];
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == k;
    }
};
`),
  166: file(`vector<int> stockSpan(vector<int>& prices) {
    vector<int> out(prices.size(), 0);
    stack<int> st;
    for (int i = 0; i < prices.size(); i++) {
        while (!st.empty() && prices[st.top()] <= prices[i]) st.pop();
        out[i] = st.empty() ? i + 1 : i - st.top();
        st.push(i);
    }
    return out;
}
`),
  167: file(`vector<int> asteroidCollision(vector<int>& asteroids) {
    vector<int> st;
    for (int a : asteroids) {
        bool alive = true;
        while (alive && a < 0 && !st.empty() && st.back() > 0) {
            if (st.back() < -a) st.pop_back();
            else if (st.back() == -a) {
                st.pop_back();
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) st.push_back(a);
    }
    return st;
}
`),
  168: file(`int largestRectangle(vector<int>& heights) {
    stack<int> st;
    int best = 0;
    int n = heights.size();
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (!st.empty() && heights[st.top()] > h) {
            int height = heights[st.top()];
            st.pop();
            int left = st.empty() ? 0 : st.top() + 1;
            best = max(best, height * (i - left));
        }
        st.push(i);
    }
    return best;
}
`),
  169: file(`int calculate(string s) {
    int result = 0;
    int sign = 1;
    int number = 0;
    stack<int> st;
    for (char c : s) {
        if (isdigit(c)) number = number * 10 + (c - '0');
        else if (c == '+' || c == '-') {
            result += sign * number;
            number = 0;
            sign = c == '+' ? 1 : -1;
        } else if (c == '(') {
            st.push(result);
            st.push(sign);
            result = 0;
            sign = 1;
        } else if (c == ')') {
            result += sign * number;
            number = 0;
            int oldSign = st.top();
            st.pop();
            int oldResult = st.top();
            st.pop();
            result = oldResult + oldSign * result;
        }
    }
    return result + sign * number;
}
`),
  170: file(`int longestValidParentheses(string s) {
    stack<int> st;
    st.push(-1);
    int best = 0;
    for (int i = 0; i < s.size(); i++) {
        if (s[i] == '(') st.push(i);
        else {
            st.pop();
            if (st.empty()) st.push(i);
            else best = max(best, i - st.top());
        }
    }
    return best;
}
`),
};
