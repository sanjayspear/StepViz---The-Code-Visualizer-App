// Practice URLs (hash routes, so they work on GitHub Pages and with Back / refresh):
//   #/practice                     Practice home
//   #/practice/all?q=&d=EM&hide=1   all questions, with search and filters
//   #/practice/topic/strings?...    one topic's questions
//   #/practice/q/7?from=strings&... one question; `from` and the filters are the list it was
//                                   opened from, so previous / next follow that list
import { useEffect, useState } from 'react';
import { DIFFICULTIES, NO_FILTERS, topicById, type Difficulty, type ListFilters } from './data';

export type PracticeRoute =
  | { screen: 'home' }
  | { screen: 'list'; scope: string; filters: ListFilters }
  | { screen: 'question'; id: number; scope: string; filters: ListFilters };

/** null: not a Practice address (the visualiser's Home). */
export function parsePracticeHash(hash: string): PracticeRoute | null {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'practice') return null;
  const params = new URLSearchParams(query);
  const filters: ListFilters = {
    q: params.get('q') ?? '',
    diff: DIFFICULTIES.filter((d) => (params.get('d') ?? '').includes(d)),
    hideSolved: params.get('hide') === '1',
  };
  const scope = (s: string | null | undefined) => (s && topicById(s) ? s : 'all');
  if (parts.length === 1) return { screen: 'home' };
  if (parts[1] === 'all' && parts.length === 2) return { screen: 'list', scope: 'all', filters };
  if (parts[1] === 'topic' && parts.length === 3 && topicById(parts[2])) return { screen: 'list', scope: parts[2], filters };
  if (parts[1] === 'q' && parts.length === 3 && /^\d+$/.test(parts[2])) {
    return { screen: 'question', id: Number(parts[2]), scope: scope(params.get('from')), filters };
  }
  return { screen: 'home' };
}

function query(filters: ListFilters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams(extra);
  if (filters.q.trim()) p.set('q', filters.q.trim());
  if (filters.diff.length) p.set('d', filters.diff.join(''));
  if (filters.hideSolved) p.set('hide', '1');
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const practiceHomeHref = () => '#/practice';
export const listHref = (scope: string, filters: ListFilters = NO_FILTERS) =>
  `#/practice/${scope === 'all' ? 'all' : `topic/${scope}`}${query(filters)}`;
export const questionHref = (id: number, scope = 'all', filters: ListFilters = NO_FILTERS) =>
  `#/practice/q/${id}${query(filters, scope === 'all' ? {} : { from: scope })}`;

export function go(href: string, replace = false) {
  if (replace) window.history.replaceState(null, '', href);
  else window.location.hash = href;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/** The current location.hash, kept up to date. */
export function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export const toggleDifficulty = (list: Difficulty[], d: Difficulty): Difficulty[] =>
  DIFFICULTIES.filter((x) => (x === d ? !list.includes(d) : list.includes(x)));
