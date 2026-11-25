// AI accuracy guard, reply parsing and the facts the model is given (Node).
import { test, expect } from '@playwright/test';
import { checkGrounded } from '../src/ai/guard';
import { buildMessages, parseReply, stepFacts } from '../src/ai/prompt';
import { FACTORIAL_TRACE } from '../src/examples/factorialTrace';
import { FIBONACCI_TRACE } from '../src/examples/fibonacciTrace';
import { BUBBLE_SORT_TRACE } from '../src/examples/bubbleSortTrace';

// Factorial step 2 (index 1): line 6 calls factorial(3); Global has result = ?, n = 3.
const STEP2 = 1;

test('accepts text whose numbers and names are all in the step', () => {
  expect(checkGrounded(['We call factorial(3), so a new box opens with n = 3.', 'Like starting a new job.'], FACTORIAL_TRACE, STEP2)).toEqual({ ok: true });
  // Line number and the code on that line count as trace data.
  expect(checkGrounded(['Line 6 asks factorial for an answer and waits.'], FACTORIAL_TRACE, STEP2).ok).toBe(true);
  // English words that are not program names are not checked.
  expect(checkGrounded(['The total is not known yet, so we wait.'], FACTORIAL_TRACE, STEP2).ok).toBe(true);
});

test('rejects a number that is not in the step', () => {
  expect(checkGrounded(['n is 4 now.'], FACTORIAL_TRACE, STEP2)).toEqual({ ok: false, reason: 'number 4 is not in the trace for this step' });
  // result is still "?" on this step, so 7 is not a fact. (6 is: it is the line number.)
  expect(checkGrounded(['result will be 7.'], FACTORIAL_TRACE, STEP2).ok).toBe(false);
  expect(checkGrounded(['Like counting to 10.'], FACTORIAL_TRACE, STEP2).ok).toBe(false);
  expect(checkGrounded(['We now have 2.5 apples.'], FACTORIAL_TRACE, STEP2).ok).toBe(false);
});

test('rejects a number word that is not in the step, and allows one that is', () => {
  expect(checkGrounded(['Five friends are waiting.'], FACTORIAL_TRACE, STEP2).ok).toBe(false);
  expect(checkGrounded(['We call factorial with three.'], FACTORIAL_TRACE, STEP2).ok).toBe(true);
  // "one" is usually not a number in plain English ("a new one opens").
  expect(checkGrounded(['This box pauses and a new one opens.'], FACTORIAL_TRACE, STEP2).ok).toBe(true);
});

test('rejects a program variable name that is not part of this step', () => {
  // Last step (print(result)): the factorial frames are gone, so n is not part of it.
  expect(checkGrounded(['n is gone now.'], FACTORIAL_TRACE, 13)).toEqual({ ok: false, reason: 'name "n" is not in the trace for this step' });
  // The code on the line counts: step 1 is "def factorial(n):".
  expect(checkGrounded(['factorial takes n.'], FACTORIAL_TRACE, 0).ok).toBe(true);
  // Fibonacci step 1: a and b exist; the article "a" is never treated as a name.
  expect(checkGrounded(['We make a box for b.'], FIBONACCI_TRACE, 0).ok).toBe(true);
});

test('list values count as facts on a list step', () => {
  // Bubble sort step 5 (index 4): about to swap 5 and 2 in [5, 2, 8, 1].
  expect(checkGrounded(['5 is bigger than 2, so nums swaps them.', 'Like two kids trading places.'], BUBBLE_SORT_TRACE, 4).ok).toBe(true);
  expect(checkGrounded(['5 is bigger than 3.'], BUBBLE_SORT_TRACE, 4).ok).toBe(false);
});

test('parseReply reads the JSON reply and rejects anything else', () => {
  expect(parseReply('{"what": "We call factorial(3).", "life": "Like a new job."}')).toEqual({ what: 'We call factorial(3).', life: 'Like a new job.' });
  expect(parseReply('Sure! {"what":"  a  b ","life":"c"} done')).toEqual({ what: 'a b', life: 'c' });
  expect(parseReply('not json')).toBeNull();
  expect(parseReply('{"what": "only what"}')).toBeNull();
  expect(parseReply('{"what": "", "life": "x"}')).toBeNull();
  expect(parseReply(`{"what": "${'x'.repeat(400)}", "life": "y"}`)).toBeNull();
});

test('the model is given only facts from the trace for that step', () => {
  const facts = stepFacts(FACTORIAL_TRACE, 1);
  expect(facts).toEqual([
    'Language: Python',
    'Line 6: result = factorial(3)',
    'A new call started: factorial(3)',
    'Call stack, newest last:',
    '- Global (waiting): factorial = function, result = ?',
    '- factorial(3) (running): n = 3',
    'Changed: n is now 3',
    `Plain description: ${FACTORIAL_TRACE.steps[1].explain.what}`,
  ]);
  const last = stepFacts(FACTORIAL_TRACE, 13);
  expect(last).toContain('Printed: 6');
  const swap = stepFacts(BUBBLE_SORT_TRACE, 4);
  expect(swap).toContain('nums = [5, 2, 8, 1]');
  expect(swap).toContain('About to swap 5 and 2');
  const messages = buildMessages(FACTORIAL_TRACE, 1);
  expect(messages.map((m) => m.role)).toEqual(['system', 'user']);
  expect(messages[1].content).toBe(facts.join('\n'));
});
