// What the AI is told about one step, and how its reply is read.
// The model only sees facts from the exact trace for that step.
import type { Trace, TraceFrame } from '../trace/types';

const LANGUAGE_NAMES: Record<Trace['language'], string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
};

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

const SYSTEM = `You explain one step of a running program to a complete beginner.
Reply with JSON only: {"what": "...", "life": "..."}
- "what": one or two short sentences saying what this step did and why. No jargon.
- "life": one short everyday comparison that starts with "Like".
- Use only the facts you are given. Only mention variable names and numbers that appear in the facts.
- Do not mention step numbers. Do not invent values.
- A correct plain description is given. "what" must say the same thing in friendly words and add nothing new: no guesses about what happens later, no counts of rounds.
- "life" must fit this exact event (making a box, changing a value, a loop round, printing...).`;

const frameText = (f: TraceFrame) => {
  const vars = Object.entries(f.vars)
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ');
  return `${f.name} (${f.status})${vars ? `: ${vars}` : ''}${f.returns ? ` → ${f.returns}` : ''}`;
};

/** Facts about step `index` of the trace, as plain lines of text. */
export function stepFacts(trace: Trace, index: number): string[] {
  const step = trace.steps[index];
  const prev = index > 0 ? trace.steps[index - 1] : undefined;
  const code = (trace.source.split('\n')[step.line - 1] ?? '').trim();
  const facts = [`Language: ${LANGUAGE_NAMES[trace.language]}`, `Line ${step.line}: ${code}`];
  const top = step.frames[step.frames.length - 1];
  if (prev && step.frames.length > prev.frames.length) facts.push(`A new call started: ${top.name}`);
  if (top?.status === 'returning') facts.push(`${top.name} is returning: ${top.returns ?? ''}`);
  facts.push('Call stack, newest last:', ...step.frames.map((f) => `- ${frameText(f)}`));
  if (prev) {
    const changed: string[] = [];
    const before = prev.frames[prev.frames.length - 1]?.vars ?? {};
    for (const [k, v] of Object.entries(top?.vars ?? {})) if (before[k] !== v && v !== '?') changed.push(`${k} is now ${v}`);
    if (changed.length) facts.push(`Changed: ${changed.join(', ')}`);
  }
  const newOutput = step.output.slice(prev?.output.length ?? 0).trimEnd();
  if (newOutput) facts.push(`Printed: ${newOutput}`);
  if (step.list) {
    const values = `[${step.list.values.join(', ')}]`;
    facts.push(`${trace.listView?.list ?? 'list'} = ${values}`);
    if (step.list.swap) {
      const [a, b] = step.list.swap;
      facts.push(`About to swap ${step.list.values[a]} and ${step.list.values[b]}`);
    } else if (step.list.compare?.length) {
      facts.push(`Looking at: ${step.list.compare.map((i) => step.list!.values[i]).join(' and ')}`);
    }
  }
  if (step.explain.what) facts.push(`Plain description: ${step.explain.what}`);
  return facts;
}

export function buildMessages(trace: Trace, index: number): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: stepFacts(trace, index).join('\n') },
  ];
}

/** The model's reply as { what, life }, or null if it is not usable. */
export function parseReply(text: string): { what: string; life: string } | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const { what, life } = (data ?? {}) as { what?: unknown; life?: unknown };
  if (typeof what !== 'string' || typeof life !== 'string') return null;
  const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
  const w = clean(what);
  const l = clean(life);
  if (!w || !l || w.length > 300 || l.length > 240) return null;
  return { what: w, life: l };
}
