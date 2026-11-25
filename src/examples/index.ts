// Built-in examples. Sources are final: Factorial from section 6 of the spec,
// the other three as approved by the product owner; JavaScript versions of the
// same four programs (Phase 2).

export type CodeLanguage = 'python' | 'javascript' | 'java';

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
  /** Java version of the same program */
  javaSource: string;
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
    javaSource: `public class Main {
    static int factorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(3);
        System.out.println(result);
    }
}`,
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
    javaSource: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 2, 8, 1};
        for (int i = 0; i < nums.length; i++) {
            for (int j = 0; j < nums.length - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }
        System.out.println(Arrays.toString(nums));
    }
}`,
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
    javaSource: `public class Main {
    public static void main(String[] args) {
        int a = 0, b = 1;
        for (int i = 0; i < 5; i++) {
            System.out.println(a);
            int next = a + b;
            a = b;
            b = next;
        }
    }
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
    javaSource: `public class Main {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 1; i <= 3; i++) {
            total = total + i;
        }
        System.out.println(total);
    }
}`,
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];

export function sourceOf(example: Example, language: CodeLanguage): string {
  return language === 'javascript' ? example.jsSource : language === 'java' ? example.javaSource : example.source;
}

/** The example whose source (in either language) is exactly the given text, if any. */
export function exampleForSource(source: string): Example | undefined {
  return EXAMPLES.find((e) => e.source === source || e.jsSource === source || e.javaSource === source);
}

/** Title for the Step-through top bar. */
export function titleForSource(source: string): string {
  return exampleForSource(source)?.title ?? 'Your code';
}
