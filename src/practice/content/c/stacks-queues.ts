// Practice, C: the questions of stacks-queues that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/stacks-queues.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q152, Q153, Q154, Q155, Q156, Q157, Q158, Q160, Q161, Q162, Q163, Q164, Q165, Q166, Q167.
import { fromPython } from '../javascript/shared';
import { STACKS_QUEUES } from '../python/stacks-queues';
import { cStarter } from './shared';

export const STACKS_QUEUES_C = fromPython(
  STACKS_QUEUES,
  {
  151: {
    example: "Example: isBalanced(\"{[]}\") returns true, isBalanced(\"([)]\") returns false.",
    starter: cStarter([["bool isBalanced(char s[])", "true if every (, [ and { is closed by the right bracket in the right order.\nCharacters that are not brackets do not matter."]], "printf(\"%s\\n\", isBalanced(\"()[]{}\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "C has no built-in stack: use an array and a top position (push: a[top] = x, top++; pop: top--). Push every opening bracket. For a closing bracket, the stack must not be empty and its top must be the matching opener: pop it. At the end the stack must be empty. Like Russian dolls: each one must close the doll opened most recently.",
  },
  159: {
    example: "Example: evalPostfix(\"2 3 1 * + 9 -\") returns -4.",
    starter: cStarter([["int evalPostfix(char expr[])", "Numbers and + - * / separated by spaces, operators after their two numbers.\n\"/\" is whole-number division that cuts toward zero (like int division in C++)."]], "printf(\"%d\\n\", evalPostfix(\"2 3 1 * + 9 -\"));", ["string.h"], ''),
    hint: "C has no built-in stack: use an array and a top position (push: a[top] = x, top++; pop: top--). Read the tokens left to right (build each number digit by digit until a space). Push numbers; for an operator, pop the second number, then the first, apply the operator, and push the result. The last number on the stack is the answer. Like a calculator that waits until it has two numbers before you press the button.",
  },
  168: {
    example: "Example: largestRectangle({2, 1, 5, 6, 2, 3}) returns 10.",
    starter: cStarter([["int largestRectangle(int heights[], int n)", "Bars of width 1 with these heights. The area of the largest rectangle inside them."]], "int heights[] = {2, 1, 5, 6, 2, 3};\nprintf(\"%d\\n\", largestRectangle(heights, 6));", [], ''),
    hint: "C has no built-in stack: use an array and a top position (push: a[top] = x, top++; pop: top--). Keep positions with rising heights on it. When a lower bar comes, pop the taller bars: each popped bar is the height of a rectangle that stretches from just after the new top to just before the current bar. Add a 0-height bar at the end to empty the stack. Like a city skyline where each building's widest window runs until a shorter building blocks it.",
  },
  169: {
    example: "Example: calculate(\"(1+(4+5+2)-3)+(6+8)\") returns 23.",
    starter: cStarter([["int calculate(char s[])", "Whole numbers, + and - (also a minus in front of brackets), brackets and spaces."]], "printf(\"%d\\n\", calculate(\"1 + 1\"));", ["string.h"], ''),
    hint: "Keep a running result and a sign (+1 or -1). Read whole numbers and add sign * number. At \"(\", push the result and the sign, and start a fresh result; at \")\", finish it: result = pushed_result + pushed_sign * result. Like doing the sum inside each bracket on a scrap of paper, then bringing the answer back.",
    forbid: null,
  },
  170: {
    example: "Example: longestValidParentheses(\")()())\") returns 4 (\"()()\").",
    starter: cStarter([["int longestValidParentheses(char s[])", "The length of the longest part of s made of correctly matched ( and )."]], "printf(\"%d\\n\", longestValidParentheses(\"(()\"));", ["string.h"], ''),
    hint: "C has no built-in stack: use an array and a top position (push: a[top] = x, top++; pop: top--). Store positions on it, starting with -1 (a \"wall\"). Push the position of each \"(\"; for \")\", pop, and if the stack is now empty push this position as the new wall, otherwise the valid part reaches from just after the top to here. Like measuring stretches of a zip that are properly closed.",
  },
  },
  { partial: true },
);
