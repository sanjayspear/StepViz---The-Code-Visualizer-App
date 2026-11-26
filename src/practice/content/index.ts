// Which questions have hand-written content in which language (added topic by topic).
import type { CodeLanguage } from '../../examples';
import type { PracticeContent } from './types';
import { BASICS_MATH } from './python/basics-math';

const BY_LANGUAGE: Partial<Record<CodeLanguage, Map<number, PracticeContent>>> = {
  python: new Map(BASICS_MATH.map((c) => [c.id, c])),
};

export function contentFor(id: number, language: CodeLanguage): PracticeContent | undefined {
  return BY_LANGUAGE[language]?.get(id);
}
