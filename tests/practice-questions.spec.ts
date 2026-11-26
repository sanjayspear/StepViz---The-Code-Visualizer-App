// The Practice questions (src/practice/questions.json) built from docs/320-questions.pdf
// by scripts/build-questions.mjs.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import data from '../src/practice/questions.json' with { type: 'json' };

const { topics, questions } = data;

test('320 questions numbered 1-320 in order, 14 topics, an E/M/H on each', () => {
  expect(questions).toHaveLength(320);
  questions.forEach((q, i) => expect(q.id).toBe(i + 1));
  expect(topics).toHaveLength(14);
  for (const q of questions) {
    expect(['E', 'M', 'H']).toContain(q.difficulty);
    expect(Object.keys(q).sort()).toEqual(['difficulty', 'id', 'title', 'topic']);
  }
  const count = (d: string) => questions.filter((q) => q.difficulty === d).length;
  expect([count('E'), count('M'), count('H')]).toEqual([135, 162, 23]);
});

test('every question belongs to the topic whose range holds it (Q25 is Basics & math, Q55 Strings)', () => {
  const sizes = topics.map((t) => questions.filter((q) => q.topic === t.id).length);
  expect(sizes).toEqual([25, 30, 30, 25, 20, 20, 20, 20, 25, 20, 25, 20, 25, 15]);
  for (const q of questions) {
    const t = topics.find((x) => x.id === q.topic)!;
    expect(q.id, `Q${q.id}`).toBeGreaterThanOrEqual(t.first);
    expect(q.id, `Q${q.id}`).toBeLessThanOrEqual(t.last);
  }
  expect(topics.map((t) => t.name)).toEqual([
    'Basics & math', 'Strings', 'Arrays & matrices', 'Hash maps & sets', 'Two pointers', 'Sliding window', 'Stacks & queues',
    'Binary search', 'Recursion & backtracking', 'Linked lists', 'Trees & BST', 'Graphs', 'Dynamic programming', 'Sorting, greedy & intervals',
  ]);
  expect(questions[24].topic).toBe('basics-math');
  expect(questions[54].topic).toBe('strings');
});

test('titles are clean and exactly as printed', () => {
  for (const q of questions) {
    expect(q.title, `Q${q.id}`).not.toMatch(/\s{2}|^\s|\s$|\((E|M|H)\)$/);
  }
  const title = (id: number) => questions[id - 1].title;
  expect(title(40)).toBe('Check if one string is a rotation of another ("waterbottle", "erbottlewat").');
  expect(title(145)).toBe('Take k cards from either end of a row to get the max total points.');
  expect(title(198)).toBe('Print the moves to solve the Tower of Hanoi for n disks.');
  expect(title(247)).toBe('Convert a sorted array into a balanced BST.');
  expect(title(276)).toBe('Capture all regions of O surrounded by X in a board.');
  expect(title(304)).toBe('Implement regular expression matching with . and *.');
  expect(title(127)).toBe('Find the minimum boats needed if each boat holds two people under a weight limit.');
});

test('questions.json is exactly what the script builds from the PDF', () => {
  const out = execFileSync('node', ['scripts/build-questions.mjs', '--check'], { encoding: 'utf8' });
  expect(out).toContain('src/practice/questions.json is up to date.');
  expect(out).toContain('Mismatches between page position and heading range: none');
});
