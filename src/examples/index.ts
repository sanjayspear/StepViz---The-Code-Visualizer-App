// Built-in examples. Sources are final: Factorial from section 6 of the spec,
// the other three as approved by the product owner; JavaScript versions of the
// same four programs (Phase 2).

export type CodeLanguage = 'python' | 'javascript';

export type ExampleId = 'factorial' | 'bubble-sort' | 'fibonacci' | 'for-loop';

export interface Example {
  id: ExampleId;
  /** Label on the "Try an example" chip. */
  chip: string;
  /** Program title in the Step-through top bar. */
  title: string;
  /** Python source */
  source: string;
  /** JavaScript version of the same program */
  jsSource: string;
}

export const EXAMPLES: Example[] = [
  {
    id: 'factorial',
    chip: 'Factorial',
    title: 'factorial(3)',
    source: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

result = factorial(3)
print(result)`,
    jsSource: `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}

const result = factorial(3);
console.log(result);`,
  },
  {
    id: 'bubble-sort',
    chip: 'Bubble sort',
    title: 'Bubble sort',
    source: `nums = [5, 2, 8, 1]
for i in range(len(nums)):
    for j in range(len(nums) - i - 1):
        if nums[j] > nums[j + 1]:
            nums[j], nums[j + 1] = nums[j + 1], nums[j]
print(nums)`,
    jsSource: `const nums = [5, 2, 8, 1];
for (let i = 0; i < nums.length; i++) {
  for (let j = 0; j < nums.length - i - 1; j++) {
    if (nums[j] > nums[j + 1]) {
      [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
    }
  }
}
console.log(nums);`,
  },
  {
    id: 'fibonacci',
    chip: 'Fibonacci',
    title: 'fibonacci(5)',
    source: `a, b = 0, 1
for i in range(5):
    print(a)
    a, b = b, a + b`,
    jsSource: `let a = 0, b = 1;
for (let i = 0; i < 5; i++) {
  console.log(a);
  [a, b] = [b, a + b];
}`,
  },
  {
    id: 'for-loop',
    chip: 'For loop',
    title: 'For loop: sum of 1 to 3',
    source: `total = 0
for i in range(1, 4):
    total = total + i
print(total)`,
    jsSource: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
}
console.log(total);`,
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];

export function sourceOf(example: Example, language: CodeLanguage): string {
  return language === 'javascript' ? example.jsSource : example.source;
}

/** The example whose source (in either language) is exactly the given text, if any. */
export function exampleForSource(source: string): Example | undefined {
  return EXAMPLES.find((e) => e.source === source || e.jsSource === source);
}

/** Title for the Step-through top bar. */
export function titleForSource(source: string): string {
  return exampleForSource(source)?.title ?? 'Your code';
}
