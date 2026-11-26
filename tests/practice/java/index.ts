// Java reference solutions by topic (never shipped to students).
import { SOLUTIONS as BASICS_MATH } from './basics-math.solutions';
import { SOLUTIONS as STRINGS } from './strings.solutions';
import { SOLUTIONS as ARRAYS_MATRICES } from './arrays-matrices.solutions';
import { SOLUTIONS as HASH_MAPS_SETS } from './hash-maps-sets.solutions';
import { SOLUTIONS as TWO_POINTERS } from './two-pointers.solutions';
import { SOLUTIONS as SLIDING_WINDOW } from './sliding-window.solutions';
import { SOLUTIONS as STACKS_QUEUES } from './stacks-queues.solutions';
import { SOLUTIONS as BINARY_SEARCH } from './binary-search.solutions';
import { SOLUTIONS as RECURSION_BACKTRACKING } from './recursion-backtracking.solutions';
import { SOLUTIONS as LINKED_LISTS } from './linked-lists.solutions';
import { SOLUTIONS as TREES_BST } from './trees-bst.solutions';

export const JAVA_SOLUTIONS_BY_TOPIC: Record<string, Record<number, string>> = {
  'trees-bst': TREES_BST,
  'linked-lists': LINKED_LISTS,
  'recursion-backtracking': RECURSION_BACKTRACKING,
  'binary-search': BINARY_SEARCH,
  'stacks-queues': STACKS_QUEUES,
  'sliding-window': SLIDING_WINDOW,
  'two-pointers': TWO_POINTERS,
  'hash-maps-sets': HASH_MAPS_SETS,
  'arrays-matrices': ARRAYS_MATRICES,
  strings: STRINGS,
  'basics-math': BASICS_MATH,
};
