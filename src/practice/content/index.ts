// Which questions have hand-written content in which language (added topic by topic).
import type { CodeLanguage } from '../../examples';
import type { PracticeContent } from './types';
import { BASICS_MATH } from './python/basics-math';
import { STRINGS } from './python/strings';
import { LINKED_LISTS } from './python/linked-lists';
import { RECURSION_BACKTRACKING } from './python/recursion-backtracking';
import { BINARY_SEARCH } from './python/binary-search';
import { STACKS_QUEUES } from './python/stacks-queues';
import { SLIDING_WINDOW } from './python/sliding-window';
import { TWO_POINTERS } from './python/two-pointers';
import { HASH_MAPS_SETS } from './python/hash-maps-sets';
import { ARRAYS_MATRICES } from './python/arrays-matrices';

/** Python content by topic id (questions.json). */
export const PYTHON_TOPICS: Record<string, PracticeContent[]> = {
  'basics-math': BASICS_MATH,
  strings: STRINGS,
  'arrays-matrices': ARRAYS_MATRICES,
  'hash-maps-sets': HASH_MAPS_SETS,
  'two-pointers': TWO_POINTERS,
  'sliding-window': SLIDING_WINDOW,
  'stacks-queues': STACKS_QUEUES,
  'binary-search': BINARY_SEARCH,
  'recursion-backtracking': RECURSION_BACKTRACKING,
  'linked-lists': LINKED_LISTS,
};

const BY_LANGUAGE: Partial<Record<CodeLanguage, Map<number, PracticeContent>>> = {
  python: new Map(Object.values(PYTHON_TOPICS).flatMap((list) => list.map((c) => [c.id, c] as const))),
};

export function contentFor(id: number, language: CodeLanguage): PracticeContent | undefined {
  return BY_LANGUAGE[language]?.get(id);
}
