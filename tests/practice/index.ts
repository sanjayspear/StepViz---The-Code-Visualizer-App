// Reference solutions by topic (never shipped to students).
import { SOLUTIONS as BASICS_MATH } from './basics-math.solutions';
import { SOLUTIONS as STRINGS } from './strings.solutions';
import { SOLUTIONS as LINKED_LISTS } from './linked-lists.solutions';
import { SOLUTIONS as RECURSION_BACKTRACKING } from './recursion-backtracking.solutions';
import { SOLUTIONS as BINARY_SEARCH } from './binary-search.solutions';
import { SOLUTIONS as STACKS_QUEUES } from './stacks-queues.solutions';
import { SOLUTIONS as SLIDING_WINDOW } from './sliding-window.solutions';
import { SOLUTIONS as TWO_POINTERS } from './two-pointers.solutions';
import { SOLUTIONS as HASH_MAPS_SETS } from './hash-maps-sets.solutions';
import { SOLUTIONS as ARRAYS_MATRICES } from './arrays-matrices.solutions';

export const SOLUTIONS_BY_TOPIC: Record<string, Record<number, string>> = {
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
