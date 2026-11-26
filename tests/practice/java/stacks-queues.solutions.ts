// Java reference solutions for Practice: Stacks & queues. Never shipped to students.
const main = (methods: string, before = '') => `import java.util.*;
${before}
public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;

export const SOLUTIONS: Record<number, string> = {
  151: main(`    static boolean isBalanced(String s) {
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') stack.push(c);
            else if (c == ')' || c == ']' || c == '}') {
                char open = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (stack.isEmpty() || stack.peek() != open) return false;
                stack.pop();
            }
        }
        return stack.isEmpty();
    }
`),
  152: main(
    ``,
    `
class ArrayStack {
    List<Integer> items = new ArrayList<>();

    ArrayStack() {
    }

    void push(int x) {
        items.add(x);
    }

    Integer pop() {
        if (items.isEmpty()) return null;
        return items.remove(items.size() - 1);
    }

    Integer peek() {
        if (items.isEmpty()) return null;
        return items.get(items.size() - 1);
    }

    boolean isEmpty() {
        return items.isEmpty();
    }
}
`,
  ),
  153: main(
    ``,
    `
class MyQueue {
    Stack<Integer> inbox = new Stack<>();
    Stack<Integer> outbox = new Stack<>();

    MyQueue() {
    }

    void push(int x) {
        inbox.push(x);
    }

    void move() {
        if (outbox.isEmpty()) {
            while (!inbox.isEmpty()) outbox.push(inbox.pop());
        }
    }

    int pop() {
        move();
        return outbox.pop();
    }

    int peek() {
        move();
        return outbox.peek();
    }

    boolean empty() {
        return inbox.isEmpty() && outbox.isEmpty();
    }
}
`,
  ),
  154: main(
    ``,
    `
class MyStack {
    Queue<Integer> q = new LinkedList<>();

    MyStack() {
    }

    void push(int x) {
        q.offer(x);
        for (int i = 0; i < q.size() - 1; i++) q.offer(q.poll());
    }

    int pop() {
        return q.poll();
    }

    int top() {
        return q.peek();
    }

    boolean empty() {
        return q.isEmpty();
    }
}
`,
  ),
  155: main(`    static String reverseWithStack(String s) {
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < s.length(); i++) stack.push(s.charAt(i));
        String out = "";
        while (!stack.isEmpty()) out += stack.pop();
        return out;
    }
`),
  156: main(`    static String removeAdjacentDuplicates(String s) {
        StringBuilder stack = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (stack.length() > 0 && stack.charAt(stack.length() - 1) == c) stack.deleteCharAt(stack.length() - 1);
            else stack.append(c);
        }
        return stack.toString();
    }
`),
  157: main(`    static List<String> binaryNumbers(int n) {
        List<String> out = new ArrayList<>();
        Queue<String> q = new LinkedList<>();
        q.offer("1");
        for (int i = 0; i < n; i++) {
            String item = q.poll();
            out.add(item);
            q.offer(item + "0");
            q.offer(item + "1");
        }
        return out;
    }
`),
  158: main(
    ``,
    `
class MinStack {
    Stack<Integer> values = new Stack<>();
    Stack<Integer> mins = new Stack<>();

    MinStack() {
    }

    void push(int x) {
        values.push(x);
        mins.push(mins.isEmpty() ? x : Math.min(x, mins.peek()));
    }

    void pop() {
        values.pop();
        mins.pop();
    }

    int top() {
        return values.peek();
    }

    int getMin() {
        return mins.peek();
    }
}
`,
  ),
  159: main(`    static int evalPostfix(String expr) {
        Stack<Integer> stack = new Stack<>();
        for (String tok : expr.split(" ")) {
            if (tok.equals("+") || tok.equals("-") || tok.equals("*") || tok.equals("/")) {
                int b = stack.pop();
                int a = stack.pop();
                if (tok.equals("+")) stack.push(a + b);
                else if (tok.equals("-")) stack.push(a - b);
                else if (tok.equals("*")) stack.push(a * b);
                else stack.push(a / b);
            } else {
                stack.push(Integer.parseInt(tok));
            }
        }
        return stack.peek();
    }
`),
  160: main(`    static int prec(char c) {
        if (c == '+' || c == '-') return 1;
        if (c == '*' || c == '/') return 2;
        return 3;
    }

    static String infixToPostfix(String expr) {
        String out = "";
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < expr.length(); i++) {
            char c = expr.charAt(i);
            if (Character.isLetter(c)) out += c;
            else if (c == '(') stack.push(c);
            else if (c == ')') {
                while (stack.peek() != '(') out += stack.pop();
                stack.pop();
            } else {
                while (!stack.isEmpty() && stack.peek() != '(' && (prec(stack.peek()) > prec(c) || (prec(stack.peek()) == prec(c) && c != '^'))) out += stack.pop();
                stack.push(c);
            }
        }
        while (!stack.isEmpty()) out += stack.pop();
        return out;
    }
`),
  161: main(`    static int[] nextGreater(int[] nums) {
        int[] out = new int[nums.length];
        for (int i = 0; i < out.length; i++) out[i] = -1;
        Stack<Integer> waiting = new Stack<>();
        for (int i = 0; i < nums.length; i++) {
            while (!waiting.isEmpty() && nums[waiting.peek()] < nums[i]) out[waiting.pop()] = nums[i];
            waiting.push(i);
        }
        return out;
    }
`),
  162: main(`    static int[] dailyTemperatures(int[] temps) {
        int[] out = new int[temps.length];
        Stack<Integer> waiting = new Stack<>();
        for (int i = 0; i < temps.length; i++) {
            while (!waiting.isEmpty() && temps[waiting.peek()] < temps[i]) {
                int j = waiting.pop();
                out[j] = i - j;
            }
            waiting.push(i);
        }
        return out;
    }
`),
  163: main(`    static String simplifyPath(String path) {
        List<String> stack = new ArrayList<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) {
                if (!stack.isEmpty()) stack.remove(stack.size() - 1);
            } else {
                stack.add(part);
            }
        }
        return "/" + String.join("/", stack);
    }
`),
  164: main(`    static String decodeString(String s) {
        Stack<String> texts = new Stack<>();
        Stack<Integer> counts = new Stack<>();
        String text = "";
        int number = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) number = number * 10 + (c - '0');
            else if (c == '[') {
                texts.push(text);
                counts.push(number);
                text = "";
                number = 0;
            } else if (c == ']') {
                String repeated = "";
                int k = counts.pop();
                for (int j = 0; j < k; j++) repeated += text;
                text = texts.pop() + repeated;
            } else {
                text += c;
            }
        }
        return text;
    }
`),
  165: main(
    ``,
    `
class MyCircularQueue {
    int[] data;
    int k;
    int head = 0;
    int count = 0;

    MyCircularQueue(int k) {
        this.k = k;
        data = new int[k];
    }

    boolean enqueue(int value) {
        if (count == k) return false;
        data[(head + count) % k] = value;
        count++;
        return true;
    }

    boolean dequeue() {
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

    boolean isEmpty() {
        return count == 0;
    }

    boolean isFull() {
        return count == k;
    }
}
`,
  ),
  166: main(`    static int[] stockSpan(int[] prices) {
        int[] out = new int[prices.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < prices.length; i++) {
            while (!stack.isEmpty() && prices[stack.peek()] <= prices[i]) stack.pop();
            out[i] = stack.isEmpty() ? i + 1 : i - stack.peek();
            stack.push(i);
        }
        return out;
    }
`),
  167: main(`    static int[] asteroidCollision(int[] asteroids) {
        List<Integer> stack = new ArrayList<>();
        for (int a : asteroids) {
            boolean alive = true;
            while (alive && a < 0 && !stack.isEmpty() && stack.get(stack.size() - 1) > 0) {
                int top = stack.get(stack.size() - 1);
                if (top < -a) stack.remove(stack.size() - 1);
                else if (top == -a) {
                    stack.remove(stack.size() - 1);
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) stack.add(a);
        }
        int[] out = new int[stack.size()];
        for (int i = 0; i < out.length; i++) out[i] = stack.get(i);
        return out;
    }
`),
  168: main(`    static int largestRectangle(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int best = 0;
        for (int i = 0; i <= heights.length; i++) {
            int h = i == heights.length ? 0 : heights[i];
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int height = heights[stack.pop()];
                int left = stack.isEmpty() ? 0 : stack.peek() + 1;
                best = Math.max(best, height * (i - left));
            }
            stack.push(i);
        }
        return best;
    }
`),
  169: main(`    static int calculate(String s) {
        int result = 0;
        int sign = 1;
        int number = 0;
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) number = number * 10 + (c - '0');
            else if (c == '+' || c == '-') {
                result += sign * number;
                number = 0;
                sign = c == '+' ? 1 : -1;
            } else if (c == '(') {
                stack.push(result);
                stack.push(sign);
                result = 0;
                sign = 1;
            } else if (c == ')') {
                result += sign * number;
                number = 0;
                int oldSign = stack.pop();
                int oldResult = stack.pop();
                result = oldResult + oldSign * result;
            }
        }
        return result + sign * number;
    }
`),
  170: main(`    static int longestValidParentheses(String s) {
        Stack<Integer> stack = new Stack<>();
        stack.push(-1);
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') stack.push(i);
            else {
                stack.pop();
                if (stack.isEmpty()) stack.push(i);
                else best = Math.max(best, i - stack.peek());
            }
        }
        return best;
    }
`),
};
