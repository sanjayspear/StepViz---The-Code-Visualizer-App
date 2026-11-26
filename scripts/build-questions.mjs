#!/usr/bin/env node
// Builds src/practice/questions.json from docs/320-questions.pdf.
//
// The PDF's text is read with pdfjs-dist and put back in reading order by its position
// on the page (top to bottom, then left to right). This matters: in the file itself a
// page's heading comes before the questions drawn above it (Q25 is drawn at the top of
// page 2, above "2. Strings"), so plain text extraction puts Q25 under Strings.
// Each question belongs to the heading above it on the page; the heading's own range
// ("Strings (26–55)") is then checked against that, and any mismatch is reported.
//
// The run stops (exit code 1) unless there are exactly 320 questions numbered 1-320 in
// order, 14 topics, and an E, M or H on every question.
//
// Usage: node scripts/build-questions.mjs [--check]   (--check: verify only, write nothing)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = 'docs/320-questions.pdf';
const OUT = 'src/practice/questions.json';
const EXPECTED_QUESTIONS = 320;
const EXPECTED_TOPICS = 14;
const HEADING_SIZE = 15; // headings are 16.5 pt, question text 12 pt

const check = process.argv.includes('--check');
const problems = [];
const cleanups = [];
const fail = (msg) => problems.push(msg);

/** All text lines of the PDF in reading order: { page, y, size, text }. */
async function readLines() {
  const data = new Uint8Array(readFileSync(join(ROOT, PDF)));
  const doc = await getDocument({ data, verbosity: 0 }).promise;
  const lines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const { items } = await page.getTextContent();
    const rows = [];
    for (const it of items) {
      if (!it.str) continue;
      const y = it.transform[5];
      let row = rows.find((r) => Math.abs(r.y - y) < 2);
      if (!row) rows.push((row = { y, items: [] }));
      row.items.push({ x: it.transform[4], width: it.width, size: Math.abs(it.transform[0]), str: it.str });
    }
    rows.sort((a, b) => b.y - a.y); // top of the page first
    for (const row of rows) {
      row.items.sort((a, b) => a.x - b.x);
      let text = '';
      let end = null;
      for (const it of row.items) {
        // A visible gap between two pieces is a space (pieces already ending in a space need none).
        if (end !== null && it.x - end > 1.5 && !/\s$/.test(text) && !/^\s/.test(it.str)) text += ' ';
        text += it.str;
        end = it.x + it.width;
      }
      lines.push({ page: p, y: row.y, size: Math.max(...row.items.map((i) => i.size)), text: text.replace(/\s+/g, ' ').trim() });
    }
  }
  return lines;
}

/**
 * The question text exactly as printed. Read by position, the lines come out clean (plain text
 * extraction instead splits "T ake", leaves "BST ." and breaks quoted lists at commas), so no
 * blanket text rules are applied: they would damage real text such as "regions of O surrounded
 * by X" or "matching with . and *". Suspicious patterns are reported for a person to look at.
 */
function clean(id, raw) {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (/\b[A-Z] [a-z]{2,}/.test(t.replace(/\b(A|I|O|X) /g, ''))) cleanups.push(`Q${id}: check for a split word: "${t}"`);
  if (/\s[,;:]/.test(t) || /\w \.$/.test(t)) cleanups.push(`Q${id}: check the spacing around punctuation: "${t}"`);
  return t;
}

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const lines = await readLines();
const topics = [];
const questions = [];
let current = null; // the question being read (its text may run over several lines)
let topic = null;

const finish = () => {
  if (!current) return;
  const m = /^(.*?)\s*\((E|M|H)\)$/.exec(current.text);
  if (!m) fail(`Q${current.id}: no (E), (M) or (H) at the end: "${current.text}"`);
  const title = clean(current.id, m ? m[1] : current.text);
  if (current.lines > 1) cleanups.push(`Q${current.id}: joined ${current.lines} lines into one`);
  questions.push({ id: current.id, topic: current.topic, difficulty: m ? m[2] : '?', title });
  current = null;
};

for (const line of lines) {
  const { text, size } = line;
  if (/^Page \d+ of \d+$/.test(text) || (text === '320 Coding Interview Questions' && size < HEADING_SIZE)) continue; // running header / footer
  if (size >= HEADING_SIZE) {
    const h = /^(\d+)\. (.+) \((\d+)[–-](\d+)\)$/.exec(text);
    if (!h) continue; // the document title
    finish();
    topic = { number: Number(h[1]), id: slug(h[2]), name: h[2], first: Number(h[3]), last: Number(h[4]) };
    topics.push(topic);
    continue;
  }
  const q = /^(\d+)\. (.*)$/.exec(text);
  if (q && topic && line.page >= 1 && Number(q[1]) === (current ? current.id : questions.at(-1)?.id ?? 0) + 1) {
    finish();
    current = { id: Number(q[1]), topic: topic.id, text: q[2], lines: 1 };
    continue;
  }
  if (current) {
    // The rest of the question on the next line ("... under a weight" / "limit. (M)").
    current.text = `${current.text} ${text}`;
    current.lines++;
  }
}
finish();

// ---- checks -----------------------------------------------------------------
if (questions.length !== EXPECTED_QUESTIONS) fail(`found ${questions.length} questions, expected ${EXPECTED_QUESTIONS}`);
questions.forEach((q, i) => {
  if (q.id !== i + 1) fail(`question ${i + 1} in reading order is numbered ${q.id}`);
});
if (topics.length !== EXPECTED_TOPICS) fail(`found ${topics.length} topics, expected ${EXPECTED_TOPICS}`);
topics.forEach((t, i) => {
  if (t.number !== i + 1) fail(`topic ${i + 1} in reading order is numbered ${t.number}`);
});
const mismatches = [];
for (const q of questions) {
  const t = topics.find((x) => x.id === q.topic);
  if (q.id < t.first || q.id > t.last) mismatches.push(`Q${q.id} sits under "${t.name}" (${t.first}–${t.last}) on the page`);
}
const covered = topics.reduce((n, t) => n + (t.last - t.first + 1), 0);
if (covered !== EXPECTED_QUESTIONS) fail(`the topic ranges cover ${covered} questions, expected ${EXPECTED_QUESTIONS}`);

// ---- report -------------------------------------------------------------------
const count = (pred) => questions.filter(pred).length;
console.log(`Questions: ${questions.length}   Topics: ${topics.length}`);
console.log(`Difficulty: E ${count((q) => q.difficulty === 'E')}, M ${count((q) => q.difficulty === 'M')}, H ${count((q) => q.difficulty === 'H')}`);
for (const t of topics) {
  const qs = questions.filter((q) => q.topic === t.id);
  const d = (x) => qs.filter((q) => q.difficulty === x).length;
  console.log(`  ${String(t.number).padStart(2)}. ${t.name.padEnd(28)} ${String(qs.length).padStart(2)} questions (range ${t.first}–${t.last})  E ${d('E')}  M ${d('M')}  H ${d('H')}`);
}
console.log(mismatches.length ? `Mismatches between page position and heading range:\n  ${mismatches.join('\n  ')}` : 'Mismatches between page position and heading range: none');
console.log(cleanups.length ? `Text cleanup:\n  ${cleanups.join('\n  ')}` : 'Text cleanup: none');
if (problems.length) {
  console.error(`\nSTOPPED, nothing written:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

const json = {
  source: PDF,
  topics: topics.map(({ id, name, first, last }) => ({ id, name, first, last })),
  questions,
};
const text = `${JSON.stringify(json, null, 2)}\n`;
if (check) {
  let same = false;
  try {
    same = readFileSync(join(ROOT, OUT), 'utf8') === text;
  } catch {
    same = false;
  }
  console.log(same ? `${OUT} is up to date.` : `${OUT} is out of date: run node scripts/build-questions.mjs`);
  process.exit(same ? 0 : 1);
}
writeFileSync(join(ROOT, OUT), text);
console.log(`Wrote ${OUT}`);
