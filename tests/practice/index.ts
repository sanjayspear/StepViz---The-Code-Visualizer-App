// Reference solutions by topic (never shipped to students).
import { SOLUTIONS as BASICS_MATH } from './basics-math.solutions';
import { SOLUTIONS as STRINGS } from './strings.solutions';
import { SOLUTIONS as HASH_MAPS_SETS } from './hash-maps-sets.solutions';
import { SOLUTIONS as ARRAYS_MATRICES } from './arrays-matrices.solutions';

export const SOLUTIONS_BY_TOPIC: Record<string, Record<number, string>> = {
  'basics-math': BASICS_MATH,
  strings: STRINGS,
  'arrays-matrices': ARRAYS_MATRICES,
  'hash-maps-sets': HASH_MAPS_SETS,
};
