// Which questions have hand-written content in which language (added topic by topic).
import type { CodeLanguage } from '../../examples';
import type { PracticeContent } from './types';
import { BASICS_MATH } from './python/basics-math';
import { STRINGS } from './python/strings';
import { SORTING_GREEDY_INTERVALS } from './python/sorting-greedy-intervals';
import { DYNAMIC_PROGRAMMING } from './python/dynamic-programming';
import { GRAPHS } from './python/graphs';
import { TREES_BST } from './python/trees-bst';
import { LINKED_LISTS } from './python/linked-lists';
import { RECURSION_BACKTRACKING } from './python/recursion-backtracking';
import { BINARY_SEARCH } from './python/binary-search';
import { STACKS_QUEUES } from './python/stacks-queues';
import { SLIDING_WINDOW } from './python/sliding-window';
import { TWO_POINTERS } from './python/two-pointers';
import { HASH_MAPS_SETS } from './python/hash-maps-sets';
import { ARRAYS_MATRICES } from './python/arrays-matrices';
import { SORTING_GREEDY_INTERVALS_C } from './c/sorting-greedy-intervals';
import { RECURSION_BACKTRACKING_C } from './c/recursion-backtracking';
import { BINARY_SEARCH_C } from './c/binary-search';
import { STACKS_QUEUES_C } from './c/stacks-queues';
import { SLIDING_WINDOW_C } from './c/sliding-window';
import { TWO_POINTERS_C } from './c/two-pointers';
import { HASH_MAPS_SETS_C } from './c/hash-maps-sets';
import { ARRAYS_MATRICES_C } from './c/arrays-matrices';
import { STRINGS_C } from './c/strings';
import { BASICS_MATH_C } from './c/basics-math';
import { TREES_BST_CPP } from './cpp/trees-bst';
import { LINKED_LISTS_CPP } from './cpp/linked-lists';
import { GRAPHS_CPP } from './cpp/graphs';
import { DYNAMIC_PROGRAMMING_CPP } from './cpp/dynamic-programming';
import { SORTING_GREEDY_INTERVALS_CPP } from './cpp/sorting-greedy-intervals';
import { RECURSION_BACKTRACKING_CPP } from './cpp/recursion-backtracking';
import { BINARY_SEARCH_CPP } from './cpp/binary-search';
import { STACKS_QUEUES_CPP } from './cpp/stacks-queues';
import { SLIDING_WINDOW_CPP } from './cpp/sliding-window';
import { TWO_POINTERS_CPP } from './cpp/two-pointers';
import { HASH_MAPS_SETS_CPP } from './cpp/hash-maps-sets';
import { ARRAYS_MATRICES_CPP } from './cpp/arrays-matrices';
import { STRINGS_CPP } from './cpp/strings';
import { BASICS_MATH_CPP } from './cpp/basics-math';
import { SORTING_GREEDY_INTERVALS_JAVA } from './java/sorting-greedy-intervals';
import { DYNAMIC_PROGRAMMING_JAVA } from './java/dynamic-programming';
import { GRAPHS_JAVA } from './java/graphs';
import { TREES_BST_JAVA } from './java/trees-bst';
import { LINKED_LISTS_JAVA } from './java/linked-lists';
import { RECURSION_BACKTRACKING_JAVA } from './java/recursion-backtracking';
import { BINARY_SEARCH_JAVA } from './java/binary-search';
import { STACKS_QUEUES_JAVA } from './java/stacks-queues';
import { SLIDING_WINDOW_JAVA } from './java/sliding-window';
import { TWO_POINTERS_JAVA } from './java/two-pointers';
import { HASH_MAPS_SETS_JAVA } from './java/hash-maps-sets';
import { ARRAYS_MATRICES_JAVA } from './java/arrays-matrices';
import { STRINGS_JAVA } from './java/strings';
import { BASICS_MATH_JAVA } from './java/basics-math';
import { SORTING_GREEDY_INTERVALS_JS } from './javascript/sorting-greedy-intervals';
import { DYNAMIC_PROGRAMMING_JS } from './javascript/dynamic-programming';
import { GRAPHS_JS } from './javascript/graphs';
import { TREES_BST_JS } from './javascript/trees-bst';
import { LINKED_LISTS_JS } from './javascript/linked-lists';
import { RECURSION_BACKTRACKING_JS } from './javascript/recursion-backtracking';
import { BINARY_SEARCH_JS } from './javascript/binary-search';
import { STACKS_QUEUES_JS } from './javascript/stacks-queues';
import { SLIDING_WINDOW_JS } from './javascript/sliding-window';
import { TWO_POINTERS_JS } from './javascript/two-pointers';
import { HASH_MAPS_SETS_JS } from './javascript/hash-maps-sets';
import { ARRAYS_MATRICES_JS } from './javascript/arrays-matrices';
import { STRINGS_JS } from './javascript/strings';
import { BASICS_MATH_JS } from './javascript/basics-math';

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
  'trees-bst': TREES_BST,
  graphs: GRAPHS,
  'dynamic-programming': DYNAMIC_PROGRAMMING,
  'sorting-greedy-intervals': SORTING_GREEDY_INTERVALS,
};

/** JavaScript content by topic id (tests from the Python content, see javascript/shared.ts). */
export const JS_TOPICS: Record<string, PracticeContent[]> = {
  'sorting-greedy-intervals': SORTING_GREEDY_INTERVALS_JS,
  'dynamic-programming': DYNAMIC_PROGRAMMING_JS,
  graphs: GRAPHS_JS,
  'trees-bst': TREES_BST_JS,
  'linked-lists': LINKED_LISTS_JS,
  'recursion-backtracking': RECURSION_BACKTRACKING_JS,
  'binary-search': BINARY_SEARCH_JS,
  'stacks-queues': STACKS_QUEUES_JS,
  'sliding-window': SLIDING_WINDOW_JS,
  'two-pointers': TWO_POINTERS_JS,
  'hash-maps-sets': HASH_MAPS_SETS_JS,
  'arrays-matrices': ARRAYS_MATRICES_JS,
  strings: STRINGS_JS,
  'basics-math': BASICS_MATH_JS,
};

const byId = (topics: Record<string, PracticeContent[]>) => new Map(Object.values(topics).flatMap((list) => list.map((c) => [c.id, c] as const)));
/** Java content by topic id (tests from the Python content; answers run in StepViz's Java interpreter). */
export const JAVA_TOPICS: Record<string, PracticeContent[]> = {
  'sorting-greedy-intervals': SORTING_GREEDY_INTERVALS_JAVA,
  'dynamic-programming': DYNAMIC_PROGRAMMING_JAVA,
  graphs: GRAPHS_JAVA,
  'trees-bst': TREES_BST_JAVA,
  'linked-lists': LINKED_LISTS_JAVA,
  'recursion-backtracking': RECURSION_BACKTRACKING_JAVA,
  'binary-search': BINARY_SEARCH_JAVA,
  'stacks-queues': STACKS_QUEUES_JAVA,
  'sliding-window': SLIDING_WINDOW_JAVA,
  'two-pointers': TWO_POINTERS_JAVA,
  'hash-maps-sets': HASH_MAPS_SETS_JAVA,
  'arrays-matrices': ARRAYS_MATRICES_JAVA,
  strings: STRINGS_JAVA,
  'basics-math': BASICS_MATH_JAVA,
};

/** C++ content by topic id (tests from the Python content; answers run in StepViz's C++ interpreter). */
export const CPP_TOPICS: Record<string, PracticeContent[]> = {
  'trees-bst': TREES_BST_CPP,
  'linked-lists': LINKED_LISTS_CPP,
  graphs: GRAPHS_CPP,
  'dynamic-programming': DYNAMIC_PROGRAMMING_CPP,
  'sorting-greedy-intervals': SORTING_GREEDY_INTERVALS_CPP,
  'recursion-backtracking': RECURSION_BACKTRACKING_CPP,
  'binary-search': BINARY_SEARCH_CPP,
  'stacks-queues': STACKS_QUEUES_CPP,
  'sliding-window': SLIDING_WINDOW_CPP,
  'two-pointers': TWO_POINTERS_CPP,
  'hash-maps-sets': HASH_MAPS_SETS_CPP,
  'arrays-matrices': ARRAYS_MATRICES_CPP,
  strings: STRINGS_CPP,
  'basics-math': BASICS_MATH_CPP,
};

/** C content by topic id: only the questions that fit C (the others show C as coming soon). */
export const C_TOPICS: Record<string, PracticeContent[]> = {
  'sorting-greedy-intervals': SORTING_GREEDY_INTERVALS_C,
  'recursion-backtracking': RECURSION_BACKTRACKING_C,
  'binary-search': BINARY_SEARCH_C,
  'stacks-queues': STACKS_QUEUES_C,
  'sliding-window': SLIDING_WINDOW_C,
  'two-pointers': TWO_POINTERS_C,
  'hash-maps-sets': HASH_MAPS_SETS_C,
  'arrays-matrices': ARRAYS_MATRICES_C,
  strings: STRINGS_C,
  'basics-math': BASICS_MATH_C,
};

const BY_LANGUAGE: Partial<Record<CodeLanguage, Map<number, PracticeContent>>> = {
  python: byId(PYTHON_TOPICS),
  javascript: byId(JS_TOPICS),
  java: byId(JAVA_TOPICS),
  cpp: byId(CPP_TOPICS),
  c: byId(C_TOPICS),
};

export function contentFor(id: number, language: CodeLanguage): PracticeContent | undefined {
  return BY_LANGUAGE[language]?.get(id);
}
