// 2-D arrays (tables) in Java, C++ and C, and vector<vector<int>> (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let cpp: Parser;
let c: Parser;
let java: Parser;
test.beforeAll(async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
  c = await createParser({ engine, grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' });
  java = await createParser({ engine, grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const opts = { maxSteps: 2000, maxSeconds: 5 };
const explainOf = (language: 'java' | 'cpp' | 'c', src: string, r: ReturnType<typeof runCpp>) =>
  explainTrace({ language, source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });

test('Java: new int[2][3], {{...}}, rows of different lengths, for-each over rows, deepToString', () => {
  const src = `import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[][] g = new int[2][3];
        g[1][2] = 5;
        int[][] m = {{1, 2}, {3, 4}};
        int total = 0;
        for (int[] row : m) {
            for (int x : row) {
                total += x;
            }
        }
        int[][] jag = new int[2][];
        jag[0] = new int[]{7};
        System.out.println(Arrays.deepToString(g) + " " + total + " " + m[1].length + " " + jag[1] + " " + Arrays.deepToString(jag));
        System.out.println(g[2][0]);
    }
}`;
  const r = runJava(java.parse(src)!, opts);
  const e = explainOf('java', src, r);
  expect(r.steps[0].frames[0].vars.g).toBe('[[0, 0, 0], [0, 0, 0]]');
  expect(e[1].what).toMatch(/^(g\[1\]\[2\] changes from 0 to 5|Row 1 of g: position 2 was 0 and is now 5)\.$/);
  expect(r.steps.at(-1)!.output).toBe('[[0, 0, 0], [0, 0, 5]] 10 2 null [[7], null]\n');
  expect(r.error).toMatchObject({ type: 'ArrayIndexOutOfBoundsException', message: 'Index 2 out of bounds for length 2' });
});

test('C++: int g[2][3] with a partly filled {...}, a table passed to a function, vector<vector<int>> with (n, value), push_back of rows, resize', () => {
  const src = `#include <iostream>
#include <vector>
using namespace std;

int sum(int g[][3], int rows) {
    int t = 0;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < 3; j++) {
            t += g[i][j];
        }
    }
    return t;
}

int main() {
    int g[2][3] = {{1, 2, 3}, {4}};
    g[1][2] = 9;
    vector<vector<int>> m(2, vector<int>(3, 0));
    m[0][1] = 7;
    vector<int> row = {5, 6};
    m.push_back(row);
    m.push_back({8});
    row[0] = 100;
    m[3].resize(3, 1);
    for (auto& r : m) {
        r[0] = r[0] + 1;
    }
    cout << sum(g, 2) << " " << m.size() << " " << m[2][0] << " " << m[3][2] << " " << m[0][1] << endl;
    return 0;
}`;
  const r = runCpp(cpp.parse(src)!, opts);
  expect(r.status).toBe('ok');
  expect(r.steps[0].frames[0].vars.g).toBe('[[1, 2, 3], [4, 0, 0]]');
  expect(explainOf('cpp', src, r)[1].what).toMatch(/^(g\[1\]\[2\] changes from 0 to 9|Row 1 of g: position 2 was 0 and is now 9)\.$/);
  // row was copied into m (changing row later does not change m[2]).
  expect(r.steps.at(-1)!.output).toBe('19 4 6 1 7\n');
  expect(runCpp(cpp.parse('int main() {\n    int g[][3] = {{1}};\n    int h[2][] = {{1}};\n    return 0;\n}')!, opts).status).toBe('syntax-error');
});

test('C: a table of names (char names[3][10]) shown as text, filled with scanf', () => {
  const src = '#include <stdio.h>\n\nint main() {\n    char names[3][10] = {"Sam", "Bo"};\n    scanf("%s", names[2]);\n    printf("%s %s %s\\n", names[0], names[1], names[2]);\n    return 0;\n}';
  const r = runCpp(c.parse(src)!, { ...opts, input: 'Zed', dialect: 'c' });
  expect(r.status).toBe('ok');
  expect(r.steps[0].frames[0].vars.names).toBe('["Sam", "Bo", ""]');
  expect(r.steps.at(-1)!.output).toBe('Sam Bo Zed\n');
});
