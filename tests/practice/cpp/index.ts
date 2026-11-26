// C++ reference solutions by topic (never shipped to students).
import { SOLUTIONS as BASICS_MATH } from './basics-math.solutions';
import { SOLUTIONS as STRINGS } from './strings.solutions';
import { SOLUTIONS as ARRAYS_MATRICES } from './arrays-matrices.solutions';
import { SOLUTIONS as HASH_MAPS_SETS } from './hash-maps-sets.solutions';

export const CPP_SOLUTIONS_BY_TOPIC: Record<string, Record<number, string>> = {
  'hash-maps-sets': HASH_MAPS_SETS,
  'arrays-matrices': ARRAYS_MATRICES,
  strings: STRINGS,
  'basics-math': BASICS_MATH,
};
