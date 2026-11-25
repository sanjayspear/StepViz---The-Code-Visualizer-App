// Built-in examples. Sources are final: Factorial from section 6 of the spec,
// the other three as approved by the product owner.

export type ExampleId = 'factorial' | 'bubble-sort' | 'fibonacci' | 'for-loop';

export interface Example {
  id: ExampleId;
  /** Label on the "Try an example" chip. */
  chip: string;
  /** Program title in the Step-through top bar. */
  title: string;
  source: string;
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
  },
  {
    id: 'fibonacci',
    chip: 'Fibonacci',
    title: 'fibonacci(5)',
    source: `a, b = 0, 1
for i in range(5):
    print(a)
    a, b = b, a + b`,
  },
  {
    id: 'for-loop',
    chip: 'For loop',
    title: 'For loop: sum of 1 to 3',
    source: `total = 0
for i in range(1, 4):
    total = total + i
print(total)`,
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];

/** The example whose source is exactly the given text, if any. */
export function exampleForSource(source: string): Example | undefined {
  return EXAMPLES.find((e) => e.source === source);
}

/** Title for the Step-through top bar. */
export function titleForSource(source: string): string {
  return exampleForSource(source)?.title ?? 'Your code';
}
