// The Practice questions (built from docs/320-questions.pdf by scripts/build-questions.mjs).
import data from './questions.json';
import type { CodeLanguage } from '../examples';

export type Difficulty = 'E' | 'M' | 'H';

export interface Topic {
  id: string;
  name: string;
  first: number;
  last: number;
}

export interface Question {
  id: number;
  topic: string;
  difficulty: Difficulty;
  title: string;
}

export const TOPICS = data.topics as Topic[];
export const QUESTIONS = data.questions as Question[];
export const TOTAL = QUESTIONS.length;

const topicMap = new Map(TOPICS.map((t) => [t.id, t]));
export const topicById = (id: string): Topic | undefined => topicMap.get(id);
export const questionById = (id: number): Question | undefined => (Number.isInteger(id) && id >= 1 && id <= TOTAL ? QUESTIONS[id - 1] : undefined);

export const DIFFICULTIES: Difficulty[] = ['E', 'M', 'H'];
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { E: 'Easy', M: 'Medium', H: 'Hard' };

/**
 * Languages on the question page. `ready` turns on when that language's starter code and
 * tests exist (P2: Python first); the others show "coming soon" until then.
 */
export const PRACTICE_LANGUAGES: { value: CodeLanguage; label: string; ready: boolean }[] = [
  { value: 'python', label: 'Python', ready: false },
  { value: 'javascript', label: 'JavaScript', ready: false },
  { value: 'java', label: 'Java', ready: false },
  { value: 'cpp', label: 'C++', ready: false },
  { value: 'c', label: 'C', ready: false },
];

/** Lower case, accents removed: "Café" finds "cafe". */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** The question number in a search like "7", "q7", "Q 7" or "#7", if it is one. */
export function searchNumber(query: string): number | null {
  const m = /^(?:q|#)?\s*(\d+)$/i.exec(query.trim());
  return m ? Number(m[1]) : null;
}

/** Search by number ("7", "q7") or by title (every word must appear, in any order). */
export function matchesSearch(q: Question, query: string): boolean {
  const text = query.trim();
  if (!text) return true;
  const n = searchNumber(text);
  if (n !== null) return q.id === n;
  const title = fold(q.title);
  return fold(text)
    .split(/\s+/)
    .every((word) => title.includes(word));
}

export interface ListFilters {
  /** search text */
  q: string;
  /** difficulties to show; empty means all */
  diff: Difficulty[];
  hideSolved: boolean;
}

export const NO_FILTERS: ListFilters = { q: '', diff: [], hideSolved: false };

/** The questions of a list: a topic (or 'all'), then the search and filters, in question order. */
export function listQuestions(scope: string, filters: ListFilters, isSolved: (id: number) => boolean): Question[] {
  return QUESTIONS.filter(
    (q) =>
      (scope === 'all' || q.topic === scope) &&
      matchesSearch(q, filters.q) &&
      (filters.diff.length === 0 || filters.diff.includes(q.difficulty)) &&
      !(filters.hideSolved && isSolved(q.id)),
  );
}
