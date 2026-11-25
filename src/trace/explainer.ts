// Rule-based explainer (Phase 2, E1). Builds the "What is happening" sentence and
// the "In real life" line for each step from the step's KIND and from what
// actually changed in the trace. No rules per language: only a few words differ
// (print, input, function). Every name and value in the text comes from the trace.
import { errorSentence, genericExplanation } from './explain';
import type { StepKind, Trace, TraceFrame, TraceStep } from './types';

type Lang = 'python' | 'javascript' | 'java' | 'cpp' | 'c';

const WORDS: Record<Lang, { lang: string; print: string; input: string; fn: string; catchPart: string; throws: string }> = {
  python: { lang: 'Python', print: 'print', input: 'input()', fn: 'function', catchPart: 'except part', throws: 'raises' },
  javascript: { lang: 'JavaScript', print: 'console.log', input: 'the input', fn: 'function', catchPart: 'catch part', throws: 'throws' },
  java: { lang: 'Java', print: 'System.out.println', input: 'Scanner', fn: 'method', catchPart: 'catch part', throws: 'throws' },
  cpp: { lang: 'C++', print: 'cout', input: 'cin', fn: 'function', catchPart: 'catch part', throws: 'throws' },
  c: { lang: 'C', print: 'printf', input: 'scanf', fn: 'function', catchPart: 'catch part', throws: 'throws' },
};

/** What-variants and real-life lines are chosen per sub-kind (a finer kind). */
type SubKind =
  | 'define'
  | 'assign-new'
  | 'assign-change'
  | 'assign-same'
  | 'assign-several'
  | 'assign-simultaneous'
  | 'assign-from-call'
  | 'input'
  | 'print'
  | 'branch-taken'
  | 'branch-skipped'
  | 'branch-else'
  | 'loop-start'
  | 'loop-next'
  | 'loop-end'
  | 'call'
  | 'return'
  | 'return-nothing'
  | 'swap'
  | 'switch-case'
  | 'switch-default'
  | 'switch-none'
  | 'catch'
  | 'catch-throw'
  | 'other';

/** Everyday comparisons, each tagged with the sub-kind it fits. */
const LIFE: Record<SubKind, string[]> = {
  catch: [
    'Like a safety net catching an acrobat who slips.',
    'Like a backup plan kicking in when the first plan fails.',
    'Like a goalkeeper stopping the ball before it goes in.',
    'Like a spare tyre that gets you home after a flat.',
    'Like a lifeguard stepping in before things go wrong.',
  ],
  'catch-throw': [
    'Like raising your hand to say "something is wrong here", and the teacher comes over.',
    'Like pulling the alarm cord, and the guard takes over.',
    'Like passing a problem up to a manager who knows what to do.',
    'Like throwing a ball and a teammate catching it.',
    'Like sending a warning flare that someone sees and answers.',
  ],
  define: [
    'Like writing a recipe on a card to use later.',
    'Like saving a phone number before you need to call it.',
    'Like teaching a helper a new trick they will use later.',
    'Like writing down the rules of a game before anyone plays.',
    'Like filing instructions in a drawer for later.',
  ],
  'assign-new': [
    'Like labelling a jar and putting something inside.',
    'Like writing a name on a new box and dropping a note in it.',
    'Like opening a new notebook page and writing the first number.',
    'Like sticking a note with a value on a new folder.',
    'Like setting up a new piggy bank with its first coin.',
  ],
  'assign-change': [
    'Like updating the score on a scoreboard.',
    'Like rubbing out a number on a whiteboard and writing a new one.',
    'Like changing the time on an alarm clock.',
    'Like crossing out an old price and writing the new one.',
    'Like moving a bookmark to a new page.',
  ],
  'assign-same': [
    'Like checking a clock that already shows the right time.',
    'Like writing the same number again over the old one.',
    'Like saving a file that has not changed.',
    'Like setting a dial to the number it already points at.',
    'Like topping up a glass that is already full.',
  ],
  'assign-several': [
    'Like updating two scores at once.',
    'Like filling in several boxes on a form.',
    'Like writing a few numbers on a whiteboard, one after another.',
    'Like labelling several jars in a row.',
    'Like setting the time on two clocks.',
  ],
  'assign-simultaneous': [
    'Like two people swapping seats in one move.',
    'Like both hands of a clock moving at the same moment.',
    'Like two dancers changing places on the same beat.',
    'Like a scoreboard where both scores change at once.',
    'Like passing two cards to each other at the same time.',
  ],
  'assign-from-call': [
    'Like writing down the answer your friend just gave you.',
    'Like copying the result from a calculator onto paper.',
    'Like putting the reply you got into your notes.',
    'Like catching a ball someone threw back to you.',
    'Like filing a letter that just came back in the post.',
  ],
  input: [
    'Like taking the next card from a pile someone handed you.',
    'Like reading the next answer on a form someone filled in.',
    'Like picking the next note from a stack of notes.',
    'Like reading the next number off a list you were given.',
    'Like taking the next ticket from a ticket machine.',
  ],
  print: [
    'Like reading your answer out loud.',
    'Like writing a message on a whiteboard for everyone to see.',
    'Like a shop sign lighting up with a message.',
    'Like printing a receipt at the till.',
    'Like a scoreboard showing a new number.',
  ],
  'branch-taken': [
    'Like seeing a green light and driving on.',
    'Like a door that opens because you have the right key.',
    'Like following a sign because it points your way.',
    'Like answering yes to a question and taking the yes path.',
    'Like a recipe step that says "if the water boils, add the pasta", and it is boiling.',
  ],
  'branch-skipped': [
    'Like walking past a shop that is closed.',
    'Like skipping a recipe step that does not apply.',
    'Like a red light telling you not to turn.',
    'Like a door that stays shut, so you walk on.',
    'Like answering no to a question and taking the other path.',
  ],
  'branch-else': [
    'Like taking the other road when the first one is closed.',
    'Like ordering your second choice because the first is sold out.',
    'Like using plan B because plan A does not fit.',
    'Like taking the stairs because the lift is not working.',
    'Like choosing the other door when the first one is locked.',
  ],
  'loop-start': [
    'Like starting the first lap of a race.',
    'Like opening a book at page one.',
    'Like taking the first item off a to-do list.',
    'Like starting to count on your fingers.',
    'Like the first song on a playlist starting.',
  ],
  'loop-next': [
    'Like turning to the next page of a book.',
    'Like running another lap of the track.',
    'Like moving to the next item on a shopping list.',
    'Like the next song on a playlist starting.',
    'Like stepping up to the next stair.',
  ],
  'loop-end': [
    'Like a playlist stopping after the last song.',
    'Like finishing the last lap and crossing the line.',
    'Like ticking off the last item on a to-do list.',
    'Like closing a book after the last page.',
    'Like a timer ringing when the time is up.',
  ],
  call: [
    'Like asking a friend a question and waiting for the answer.',
    'Like handing a task to a helper and waiting for them to finish.',
    'Like opening a new notebook for a side job.',
    'Like calling a friend and holding the line while they check something.',
    'Like starting a new job: you get a fresh sheet of paper just for it.',
  ],
  return: [
    'Like handing back a finished homework sheet.',
    'Like a friend calling back with the answer.',
    'Like a helper returning with the thing you asked for.',
    'Like closing a notebook after writing down the result.',
    'Like a waiter bringing the dish you ordered.',
  ],
  'return-nothing': [
    'Like a helper saying "done" after finishing a chore.',
    'Like a friend finishing a task with nothing to hand back.',
    'Like closing a notebook when the job is done.',
    'Like a delivery driver who only had to drop something off.',
    'Like finishing a chore that needs no report.',
  ],
  swap: [
    'Like two kids trading places in a line.',
    'Like swapping two books on a shelf.',
    'Like two people swapping seats in one move.',
    'Like switching two cards in your hand.',
    'Like moving two cups so the smaller one comes first.',
  ],
  'switch-case': [
    'Like a lift going straight to the floor you pressed.',
    'Like sorting a letter into the box with the right number.',
    'Like a menu where you jump straight to the dish you ordered.',
    'Like a train taking the track for its destination.',
    'Like turning to the chapter whose number you were given.',
  ],
  'switch-default': [
    'Like a "for everything else" box when no labelled box fits.',
    'Like ordering the house special because your dish is not on the menu.',
    'Like a lost-property desk taking anything that has no owner.',
    'Like the last door in a hallway that opens for everyone.',
    'Like a teacher saying "if none of these apply, do this".',
  ],
  'switch-none': [
    'Like pressing a lift button for a floor that does not exist: nothing happens.',
    'Like checking every box on a list and finding none that fits.',
    'Like a vending machine ignoring a code it does not know.',
    'Like looking for your name on a list and not finding it.',
    'Like a key that fits none of the doors, so you walk on.',
  ],
  other: [
    'Like following the next instruction in a recipe.',
    'Like doing the next step on a checklist.',
    'Like reading the next line of a set of directions.',
    'Like taking the next step on a path.',
    'Like moving your finger to the next line of a list.',
  ],
};

// --------------------------------------------------------------------------
// Values in sentences

/** Fields of an object text like 'Dog {name: "Rex", age: 3}' or '{a: 1}', or null if it is not one (or cut short). */
function objectFields(v: string): { cls: string; keys: string[]; values: string[] } | null {
  const m = /^(\w+ )?\{(.*)\}$/.exec(v);
  if (!m) return null;
  const items = listItems(`[${m[2]}]`);
  if (!items) return null;
  const keys: string[] = [];
  const values: string[] = [];
  for (const item of items) {
    const k = /^(\w+): ([\s\S]*)$/.exec(item);
    if (!k) return null;
    keys.push(k[1]);
    values.push(k[2]);
  }
  return { cls: (m[1] ?? '').trim(), keys, values };
}

/** Items of a list text like "[1, 2, 'a']" (top level only), or null if cut short. */
function listItems(v: string): string[] | null {
  if (!v.startsWith('[') || !v.endsWith(']')) return null;
  const inner = v.slice(1, -1).trim();
  if (!inner) return [];
  const items: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '[' || ch === '{' || ch === '(') depth++;
    else if (ch === ']' || ch === '}' || ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      items.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  items.push(inner.slice(start).trim());
  return items;
}

/**
 * A value as it reads in a sentence. Lists of more than 6 items and text longer
 * than 20 characters are summarised; the frames still show the real values.
 */
export function sayValue(v: string): string {
  v = v.replace(/ \(same box as [^)]*\)$/, ''); // a C++ reference reads as its value
  if (v.startsWith('[')) {
    if (v.endsWith('…')) return 'a long list';
    const items = listItems(v);
    if (items && items.length > 6) {
      const numbers = items.every((x) => x !== '' && Number.isFinite(Number(x)));
      return `a list of ${items.length} ${numbers ? 'numbers' : 'items'}`;
    }
    return v;
  }
  const quoted = /^(["']).*\1$/.test(v) || (/^["']/.test(v) && v.endsWith('…'));
  if (quoted && (v.endsWith('…') || v.length - 2 > 20)) return 'a long piece of text';
  return v;
}

/** New printed text, as it reads in a sentence. */
function sayOutput(text: string): string {
  const lines = text.replace(/\n$/, '').split('\n');
  if (lines.length > 1) return `${lines.length} lines`;
  const line = lines[0];
  return line.length > 20 ? 'a long piece of text' : line;
}

const RETURN_NOTHING = new Set(['None', 'undefined', 'void']);

// --------------------------------------------------------------------------

interface Facts {
  step: TraceStep;
  prev: TraceStep | undefined;
  top: TraceFrame;
  words: (typeof WORDS)[Lang];
}

/** The same frame on the previous step (by position), if it is the same call. */
function prevFrameOf(f: Facts): TraceFrame | undefined {
  const i = f.step.frames.length - 1;
  const p = f.prev?.frames[i];
  return p && p.name === f.top.name ? p : undefined;
}

/**
 * How a condition reads with the step's values:
 * - with list items: "nums[j] > nums[j + 1] (here: 5 > 2)"
 * - otherwise the condition, plus facts such as "n is 3" for its variables.
 */
function conditionParts(f: Facts, condition: string): { text: string; facts: string } {
  const subscripts = condition.match(/[A-Za-z_][A-Za-z0-9_]*\[[^\]]*\]/g) ?? [];
  const compare = f.step.list?.compare;
  if (compare?.length === 2 && subscripts.length === 2) {
    let k = 0;
    const filled = condition.replace(/[A-Za-z_][A-Za-z0-9_]*\[[^\]]*\]/g, () => f.step.list!.values[compare[k++]]);
    return { text: `${condition} (here: ${filled})`, facts: '' };
  }
  const names = [...new Set(condition.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [])].filter((n) => n in f.top.vars);
  const facts = names.slice(0, 3).map((n) => `${n} is ${sayValue(f.top.vars[n])}`);
  return { text: condition, facts: facts.join(' and ') };
}

const short = (condition: string | undefined) => (condition && condition.length <= 40 ? condition : undefined);

/** Text variants for each sub-kind, given the facts of the step. */
function whatVariants(sub: SubKind, f: Facts): string[] {
  const d = f.step.detail ?? {};
  const cond = short(d.condition);
  switch (sub) {
    case 'define': {
      const name = d.targets?.[0] ?? 'it';
      return [
        `${f.words.lang} saves the ${f.words.fn} ${name} for later. Nothing inside it runs yet.`,
        `${name} is defined now, but its code waits until it is called.`,
      ];
    }
    case 'input': {
      // Several values read at once: scanf("%s %d", ...) or cin >> a >> b.
      const read = (d.targets ?? []).filter((t) => t in f.top.vars);
      if (read.length > 1) {
        const list = (xs: string[]) => `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
        return [`We read ${list(read.map((t) => sayValue(f.top.vars[t])))} with ${f.words.input} and store them in ${list(read)}.`];
      }
      const name = d.targets?.[0];
      const value = name && name in f.top.vars ? sayValue(f.top.vars[name]) : undefined;
      if (!name || value === undefined) return [`We read the next value with ${f.words.input}.`];
      return [`We read ${value} with ${f.words.input} and store it in ${name}.`, `${name} gets ${value}, the next value from the input.`];
    }
    case 'print': {
      const out = sayOutput(f.step.output.slice(f.prev?.output.length ?? 0));
      return [`${f.words.print} shows ${out} on the screen.`, `${out} appears on the screen, written by ${f.words.print}.`, `The screen now shows ${out}.`];
    }
    case 'branch-taken': {
      const { text: c, facts } = cond ? conditionParts(f, cond) : { text: 'the condition', facts: '' };
      const yes = facts ? `Yes, ${facts}` : 'Yes';
      const because = facts ? ` because ${facts}` : '';
      return [
        `Is ${c}? ${yes}, so the code inside the if runs.`,
        `${c} is true${because}, so we go into the if.`,
        `The check ${c} comes out true${because}, so its code runs.`,
      ];
    }
    case 'branch-skipped':
    case 'branch-else': {
      const { text: c, facts } = cond ? conditionParts(f, cond) : { text: 'the condition', facts: '' };
      const no = facts ? `No, ${facts}` : 'No';
      const because = facts ? ` because ${facts}` : '';
      const then = sub === 'branch-else' ? 'so the else part runs instead' : 'so we skip the code inside the if';
      return [`Is ${c}? ${no}, ${then}.`, `${c} is false${because}, ${then}.`];
    }
    case 'loop-start': {
      const v = d.loopVar;
      if (v && v in f.top.vars) {
        const val = sayValue(f.top.vars[v]);
        return [`The loop starts. ${v} is ${val} for the first round.`, `Round one of the loop: ${v} starts at ${val}.`];
      }
      const c = cond ?? 'the condition';
      return [`The loop starts: ${c} is true.`, `${c} is true, so the loop begins.`];
    }
    case 'loop-next': {
      const v = d.loopVar;
      if (v && v in f.top.vars) {
        const val = sayValue(f.top.vars[v]);
        return [`Next round of the loop: ${v} is now ${val}.`, `The loop goes around again, with ${v} = ${val}.`, `Another round: ${v} becomes ${val}.`];
      }
      return [`Checking the condition again: ${cond ?? 'the condition'} is still true.`];
    }
    case 'loop-end': {
      if (cond) return [`The loop is finished: ${cond} is no longer true.`, `${cond} is now false, so the loop stops.`];
      const v = d.loopVar;
      return [
        'The loop is finished: there is nothing left to go through.',
        v ? `There are no more values for ${v}, so the loop stops.` : 'There is nothing left to go through, so the loop stops.',
      ];
    }
    case 'call': {
      const callee = f.top.name;
      const caller = f.step.frames[f.step.frames.length - 2]?.name;
      // Java: the object a method works on (this) is named in the label already (rex.bark()).
      const args = Object.entries(f.top.vars)
        .filter(([k]) => k !== 'this')
        .map(([k, v]) => `${k} = ${sayValue(v)}`)
        .join(', ');
      const made = /^new (\w+)\(/.exec(callee);
      if (made) {
        return args
          ? [`We make a new ${made[1]} object. ${callee} starts in a new box with ${args}.`, `A new ${made[1]} object is being made: ${callee} gets its own box with ${args}.`]
          : [`We make a new ${made[1]} object. ${callee} starts in a new box of its own.`];
      }
      if (!caller || caller === 'Global' || caller.startsWith('main(')) {
        return args
          ? [`We call ${callee}. A new box, called a frame, opens with ${args}.`, `${callee} starts in a new box with ${args}.`]
          : [`We call ${callee}. A new box, called a frame, opens on top.`, `${callee} starts in a new box of its own.`];
      }
      return [`We call ${callee}. A new box opens on top, and ${caller} waits for it.`, `${caller} pauses and calls ${callee}, which gets its own new box.`];
    }
    case 'return': {
      const value = sayValue((f.top.returns ?? '').replace(/^returns /, ''));
      const made = /^new (\w+)\(/.exec(f.top.name);
      if (made) return [`The new ${made[1]} object is ready: ${value}. This box is removed on the next step.`, `${f.top.name} is done and hands back the new ${made[1]} object.`];
      return [`${f.top.name} is done and returns ${value}. Its box is removed on the next step.`, `${f.top.name} hands back ${value}. Its box will disappear next.`];
    }
    case 'return-nothing':
      return [`${f.top.name} is done and gives nothing back. Its box is removed on the next step.`, `${f.top.name} has finished its work. Its box will disappear next.`];
    case 'switch-case':
    case 'switch-default':
    case 'switch-none': {
      const c = cond ?? 'the value';
      const value = cond && cond in f.top.vars ? sayValue(f.top.vars[cond]) : undefined;
      const is = value !== undefined ? `${c} is ${value}` : `The switch checks ${c}`;
      if (sub === 'switch-none') return [`${is} and no case matches, so the whole switch is skipped.`];
      if (sub === 'switch-default') return [`${is} and no case matches, so the default part runs.`];
      const label = d.caseLabel!;
      return [`${is}, so the switch jumps to case ${label}.`, `The switch looks at ${c}${value !== undefined ? ` (${value})` : ''} and goes to case ${label}.`];
    }
    case 'swap': {
      const [a, b] = f.step.list?.swap ?? [0, 0];
      const values = f.step.list?.values ?? [];
      return [`${values[a]} and ${values[b]} are about to swap places.`, `${values[a]} and ${values[b]} trade places now.`];
    }
    default:
      return [];
  }
}

/** Assignment sentences: one clause per name ("total changes from 1 to 3"). */
function assignment(f: Facts): { sub: SubKind; variants: string[] } | null {
  const targets = (f.step.detail?.targets ?? []).filter((t) => t in f.top.vars);
  if (!targets.length) return null;
  const before = prevFrameOf(f)?.vars ?? {};
  const prevTop = f.prev?.frames[f.prev.frames.length - 1];

  // A value that just came back from a call: "result gets the answer 6 from factorial(3)".
  if (targets.length === 1 && f.prev?.kind === 'return' && prevTop?.returns && f.prev.frames.length > f.step.frames.length) {
    const value = prevTop.returns.replace(/^returns /, '');
    if (f.top.vars[targets[0]] === value) {
      const v = sayValue(value);
      const made = /^new (\w+)\(/.exec(prevTop.name);
      if (made) {
        return { sub: 'assign-from-call', variants: [`The new ${made[1]} object is stored in ${targets[0]}.`, `${targets[0]} now holds the new ${made[1]} object.`] };
      }
      return {
        sub: 'assign-from-call',
        variants: [`${targets[0]} gets the answer ${v} from ${prevTop.name}.`, `The answer ${v} from ${prevTop.name} is stored in ${targets[0]}.`],
      };
    }
  }

  type Change = 'new' | 'change' | 'same';
  const changes = targets.map((t) => {
    const was = before[t];
    const now = f.top.vars[t];
    const kind: Change = was === undefined || was === '?' ? 'new' : was === now ? 'same' : 'change';
    return { t, was: was ? sayValue(was) : '', now: sayValue(now), kind };
  });
  // A list where one item changed, or an item was added to / removed from the end.
  if (changes.length === 1 && changes[0].kind === 'change') {
    const t = changes[0].t;
    const was = listItems(before[t] ?? '');
    const now = listItems(f.top.vars[t]);
    if (was && now) {
      const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
      if (now.length === was.length + 1 && same(now.slice(0, -1), was)) {
        const v = sayValue(now[now.length - 1]);
        return { sub: 'assign-change', variants: [`${v} is added to the end of ${t}.`, `${t} grows by one: ${v} goes on the end.`] };
      }
      if (now.length === was.length - 1 && same(now, was.slice(0, -1))) {
        const v = sayValue(was[was.length - 1]);
        return { sub: 'assign-change', variants: [`${v} is taken off the end of ${t}.`, `${t} gets shorter: ${v} is removed from the end.`] };
      }
      if (now.length === 0 && was.length > 1) {
        return { sub: 'assign-change', variants: [`${t} is emptied: it has no items now.`, `All the items are taken out of ${t}, so it is empty now.`] };
      }
      // One item put in, or taken out, somewhere other than the end.
      const firstDiff = (a: string[], b: string[]) => a.findIndex((x, i) => x !== b[i]);
      if (now.length === was.length + 1) {
        const i = firstDiff(now, was);
        if (i >= 0 && same([...now.slice(0, i), ...now.slice(i + 1)], was)) {
          const v = sayValue(now[i]);
          return { sub: 'assign-change', variants: [`${v} is put in at position ${i} of ${t}.`, `${t} grows by one: ${v} goes in at position ${i}.`] };
        }
      }
      if (now.length === was.length - 1) {
        const i = firstDiff(was, now);
        if (i >= 0 && same([...was.slice(0, i), ...was.slice(i + 1)], now)) {
          const v = sayValue(was[i]);
          return { sub: 'assign-change', variants: [`${v} is taken out of ${t} at position ${i}.`, `${t} gets shorter: ${v} at position ${i} is removed.`] };
        }
      }
      if (now.length === was.length) {
        const diff = now.map((x, i) => (x === was[i] ? -1 : i)).filter((i) => i >= 0);
        if (diff.length === 1) {
          const i = diff[0];
          return {
            sub: 'assign-change',
            variants: [
              `${t}[${i}] changes from ${sayValue(was[i])} to ${sayValue(now[i])}.`,
              `Position ${i} of ${t} was ${sayValue(was[i])} and is now ${sayValue(now[i])}.`,
            ],
          };
        }
      }
    }
  }
  // An object where fields changed: "this.name changes from null to "Rex"."
  if (changes.length === 1 && changes[0].kind === 'change') {
    const t = changes[0].t;
    const was = objectFields(before[t] ?? '');
    const now = objectFields(f.top.vars[t]);
    if (was && now && was.cls === now.cls && was.keys.join() === now.keys.join()) {
      const diff = now.keys.filter((_k, i) => now.values[i] !== was.values[i]);
      const at = (o: NonNullable<typeof was>, k: string) => sayValue(o.values[o.keys.indexOf(k)]);
      if (diff.length === 1) {
        const k = diff[0];
        return {
          sub: 'assign-change',
          variants: [`${t}.${k} changes from ${at(was, k)} to ${at(now, k)}.`, `In ${t}, ${k} was ${at(was, k)} and is now ${at(now, k)}.`],
        };
      }
      if (diff.length > 1) {
        return { sub: 'assign-several', variants: [`${t} changes: ${diff.map((k) => `${k} becomes ${at(now, k)}`).join(', ')}.`] };
      }
    }
  }
  const clause = (c: (typeof changes)[number], variant: number) => {
    if (c.kind === 'new') {
      if (c.now === '?' || c.now === 'undefined') return variant === 0 ? `We make a box called ${c.t}. It has no value yet` : `A new box called ${c.t} is ready, but empty`;
      return [`We make a box called ${c.t} and put ${c.now} in it`, `A new box called ${c.t} now holds ${c.now}`, `${c.t} is created and set to ${c.now}`][variant % 3];
    }
    if (c.kind === 'same') return [`${c.t} stays ${c.now}`, `${c.t} is set again, but it stays ${c.now}`][variant % 2];
    return [`${c.t} changes from ${c.was} to ${c.now}`, `${c.t} was ${c.was} and is now ${c.now}`, `the box ${c.t} gets a new value: ${c.now} instead of ${c.was}`][variant % 3];
  };
  /** Short clauses for sentences with several names, so they read evenly. */
  const shortClause = (c: (typeof changes)[number]) =>
    c.kind === 'new' ? `${c.t} starts at ${c.now}` : c.kind === 'same' ? `${c.t} stays ${c.now}` : `${c.t} changes from ${c.was} to ${c.now}`;
  const sentence = (variant: number) => {
    const parts = changes.length > 1 ? changes.map(shortClause) : [clause(changes[0], variant)];
    let text = parts.length > 1 ? `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}` : parts[0];
    if (changes.length > 1 && changes.every((c) => c.kind === 'new')) text = `We make new boxes: ${text}`;
    // Capitalise, unless the sentence starts with a variable name ("total changes ...").
    const startsWithName = changes.some((c) => text.startsWith(`${c.t} `));
    return `${startsWithName ? text : text.charAt(0).toUpperCase() + text.slice(1)}.`;
  };
  let sub: SubKind;
  // "Swapping seats" fits only when existing boxes change together (a, b = b, a + b);
  // setting up new boxes at once (a, b = 0, 1) is like filling in several boxes.
  const together = f.step.detail?.simultaneous && changes.every((c) => c.kind !== 'new');
  if (changes.length > 1) sub = together ? 'assign-simultaneous' : 'assign-several';
  else sub = changes[0].kind === 'new' ? 'assign-new' : changes[0].kind === 'same' ? 'assign-same' : 'assign-change';
  return { sub, variants: [sentence(0), sentence(1), sentence(2)].filter((v, i, all) => all.indexOf(v) === i) };
}

/** Explanations for every step of a live trace. Hand-written fixtures are not passed here. */
export function explainTrace(trace: Trace): TraceStep['explain'][] {
  const lang = (trace.language in WORDS ? trace.language : 'python') as Lang;
  const words = WORDS[lang];
  // A fixed starting point per program, so the same program always reads the same.
  const seed = [...trace.source].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const seen = new Map<SubKind, number>();
  const pick = (sub: SubKind, list: string[], salt: number) => {
    if (!list.length) return '';
    const k = seen.get(sub) ?? 0;
    return list[(seed + salt + k) % list.length];
  };

  return trace.steps.map((step, i) => {
    if (step.kind === 'crash' || step.error) {
      const d = step.detail;
      if (d?.thrown) {
        const type = d.errorType;
        const what = type ? `${/^[aeiou]/i.test(type) ? 'an' : 'a'} ${type}${d.errorMessage ? ` with the message "${d.errorMessage}"` : ''}` : `the value ${d.errorMessage ?? ''}`;
        return { what: `The program ${words.throws} ${what}, and no ${words.catchPart} takes it, so the program stops.`, life: '' };
      }
      return { what: errorSentence(step.error?.type ?? '', lang), life: '' };
    }
    const f: Facts = { step, prev: trace.steps[i - 1], top: step.frames[step.frames.length - 1], words };
    const kind: StepKind = step.kind ?? 'other';

    let sub: SubKind = 'other';
    let variants: string[] = [];
    if (kind === 'assign') {
      const a = assignment(f);
      if (a) ({ sub, variants } = a);
    } else if (kind === 'return') {
      const value = (f.top.returns ?? '').replace(/^returns /, '');
      sub = RETURN_NOTHING.has(value) || !value ? 'return-nothing' : 'return';
      variants = whatVariants(sub, f);
    } else if (kind === 'switch-case') {
      const label = step.detail?.caseLabel;
      sub = !label ? 'switch-none' : label === 'default' ? 'switch-default' : 'switch-case';
      variants = whatVariants(sub, f);
    } else if (kind === 'catch') {
      const d = step.detail ?? {};
      const type = d.errorType;
      if (d.thrown) {
        // A thrown exception has a type (and maybe a message); C++ can also throw a plain value (throw 5;).
        sub = 'catch-throw';
        const a = type && /^[aeiou]/i.test(type) ? 'an' : 'a';
        const what = type ? `${a} ${type}${d.errorMessage ? ` with the message "${d.errorMessage}"` : ''}` : `the value ${d.errorMessage ?? ''}`;
        variants = d.finallyOnly
          ? [`The program ${words.throws} ${what}. Nothing catches it here, so the finally part runs first.`]
          : [
              `The program ${words.throws} ${what}, and the ${words.catchPart} takes over.`,
              `This line ${words.throws} ${what}. Instead of stopping, the program jumps to the ${words.catchPart}.`,
            ];
      } else if (d.finallyOnly) {
        sub = 'catch';
        variants = [`${errorSentence(type ?? '', lang)} Nothing catches it here, so the finally part runs first.`];
      } else {
        sub = 'catch';
        const problem = errorSentence(type ?? '', lang);
        const part = words.catchPart;
        variants = [`${problem} Instead of stopping, the program jumps to the ${part}.`, `${problem} The ${part} takes over, so the program does not stop.`];
      }
    } else if (kind === 'branch-skipped') {
      sub = step.detail?.toElse ? 'branch-else' : 'branch-skipped';
      variants = whatVariants(sub, f);
    } else if (kind !== 'other') {
      sub = kind as SubKind;
      variants = whatVariants(sub, f);
    }

    // The line that called a function that gave nothing back (rex.birthday();): the call is over.
    const prevTop = f.prev?.frames[f.prev.frames.length - 1];
    if (kind === 'other' && f.prev?.kind === 'return' && prevTop && f.prev.frames.length > step.frames.length) {
      const callerName = f.top.name;
      sub = 'return-nothing';
      variants = [`Back in ${callerName}: ${prevTop.name} has finished, so the program carries on.`, `${prevTop.name} is over, and ${callerName} carries on from where it stopped.`];
    }
    let what = pick(sub, variants, 0);
    if (!what) {
      sub = 'other';
      what = genericExplanation(trace.source, step.line).what;
    }
    const life = pick(sub, LIFE[sub], 2);
    seen.set(sub, (seen.get(sub) ?? 0) + 1);
    return { what, life };
  });
}
