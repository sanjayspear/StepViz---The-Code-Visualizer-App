// console.log formatting like Node's util.inspect (depth 2, compact 3, breakLength 80,
// maxArrayLength 100), so a JavaScript program prints in StepViz exactly what it prints
// with `node`: [ 1, 'two' ], { a: 1 }, Map(1) { 'x' => 1 }, long arrays in columns.
// A port of the parts of lib/internal/util/inspect.js that ordinary programs reach;
// tests/inspect-js.spec.ts checks it against Node itself.

interface Ctx {
  seen: unknown[];
  circular: Map<unknown, number>;
  indentationLvl: number;
  currentDepth: number;
  depth: number;
  breakLength: number;
  compact: number;
  maxArrayLength: number;
}

const kObjectType = 0;
const kArrayExtrasType = 2;
const keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
// Kept before the worker's lockdown removes the global Function.
const fnToString = Function.prototype.toString;

const META = [
  '\\x00', '\\x01', '\\x02', '\\x03', '\\x04', '\\x05', '\\x06', '\\x07', '\\b', '\\t', '\\n', '\\x0B', '\\f', '\\r', '\\x0E', '\\x0F',
  '\\x10', '\\x11', '\\x12', '\\x13', '\\x14', '\\x15', '\\x16', '\\x17', '\\x18', '\\x19', '\\x1A', '\\x1B', '\\x1C', '\\x1D', '\\x1E', '\\x1F',
];

/** A string in quotes: 'single' unless it holds a single quote (then "double", or `backtick`). */
function strEscape(str: string): string {
  let quote = "'";
  if (str.includes("'")) {
    if (!str.includes('"')) quote = '"';
    else if (!str.includes('`') && !str.includes('${')) quote = '`';
  }
  let out = '';
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    if (ch === quote || ch === '\\') out += `\\${ch}`;
    else if (c < 32) out += META[c];
    else if (c === 127) out += '\\x7F';
    else out += ch;
  }
  return `${quote}${out}${quote}`;
}

function formatNumber(n: number): string {
  return Object.is(n, -0) ? '-0' : `${n}`;
}

function formatPrimitive(v: unknown): string {
  if (typeof v === 'string') return strEscape(v);
  if (typeof v === 'number') return formatNumber(v);
  if (typeof v === 'bigint') return `${v}n`;
  if (typeof v === 'symbol') return v.toString();
  return String(v); // boolean, undefined
}

function constructorName(obj: object): string | null {
  let o: object | null = obj;
  while (o) {
    const d = Object.getOwnPropertyDescriptor(o, 'constructor');
    if (d && typeof d.value === 'function' && d.value.name !== '') return d.value.name as string;
    o = Object.getPrototypeOf(o);
  }
  return null;
}

function getPrefix(constructor: string | null, tag: string, fallback: string, size = ''): string {
  if (constructor === null) {
    if (tag !== '' && fallback !== tag) return `[${fallback}${size}: null prototype] [${tag}] `;
    return `[${fallback}${size}: null prototype] `;
  }
  if (tag !== '' && constructor !== tag) return `${constructor}${size} [${tag}] `;
  return `${constructor}${size} `;
}

function functionBase(value: Function, constructor: string | null): string {
  const source = fnToString.call(value);
  if (/^class[\s{]/.test(source)) {
    let base = `[class ${value.name || '(anonymous)'}`;
    const parent = Object.getPrototypeOf(value);
    if (parent && parent.name) base += ` extends ${parent.name}`;
    return `${base}]`;
  }
  let type = 'Function';
  if (constructor === 'AsyncFunction') type = 'AsyncFunction';
  else if (constructor === 'GeneratorFunction') type = 'GeneratorFunction';
  else if (constructor === 'AsyncGeneratorFunction') type = 'AsyncGeneratorFunction';
  return value.name === '' ? `[${type} (anonymous)]` : `[${type}: ${value.name}]`;
}

function formatValue(ctx: Ctx, value: unknown, recurseTimes: number): string {
  if (typeof value !== 'object' && typeof value !== 'function') return formatPrimitive(value);
  if (value === null) return 'null';
  if (ctx.seen.includes(value)) {
    let index = 1;
    if (!ctx.circular.has(value)) {
      ctx.circular.set(value, ctx.circular.size + 1);
      index = ctx.circular.size;
    } else index = ctx.circular.get(value)!;
    return `[Circular *${index}]`;
  }
  return formatRaw(ctx, value as object, recurseTimes);
}

function ownKeys(value: object, nonIndex: boolean): (string | symbol)[] {
  const keys: (string | symbol)[] = Object.keys(value).filter((k) => !nonIndex || !/^(0|[1-9]\d*)$/.test(k) || Number(k) >= 2 ** 32 - 1);
  for (const s of Object.getOwnPropertySymbols(value)) if (Object.getOwnPropertyDescriptor(value, s)?.enumerable) keys.push(s);
  return keys;
}

function formatRaw(ctx: Ctx, value: object, recurseTimes: number): string {
  const constructor = constructorName(value);
  const tagValue = (value as { [Symbol.toStringTag]?: unknown })[Symbol.toStringTag];
  let tag = typeof tagValue === 'string' && tagValue !== '' ? tagValue : '';
  if (tag !== '' && constructor !== null && tag === constructor) tag = '';
  let base = '';
  let braces: [string, string];
  let formatter: (ctx: Ctx, v: object, r: number) => string[] = () => [];
  let extrasType = kObjectType;
  let keys: (string | symbol)[];

  if (Array.isArray(value)) {
    keys = ownKeys(value, true);
    const prefix = constructor !== 'Array' || tag !== '' ? getPrefix(constructor, tag, 'Array', `(${value.length})`) : '';
    braces = [`${prefix}[`, ']'];
    if (value.length === 0 && keys.length === 0) return `${braces[0]}]`;
    extrasType = kArrayExtrasType;
    formatter = formatArray as typeof formatter;
  } else if (value instanceof Set) {
    keys = ownKeys(value, false);
    const prefix = getPrefix(constructor, tag, 'Set', `(${value.size})`);
    formatter = formatSet as typeof formatter;
    if (value.size === 0 && keys.length === 0) return `${prefix}{}`;
    braces = [`${prefix}{`, '}'];
  } else if (value instanceof Map) {
    keys = ownKeys(value, false);
    const prefix = getPrefix(constructor, tag, 'Map', `(${value.size})`);
    formatter = formatMap as typeof formatter;
    if (value.size === 0 && keys.length === 0) return `${prefix}{}`;
    braces = [`${prefix}{`, '}'];
  } else {
    keys = ownKeys(value, false);
    braces = ['{', '}'];
    if (typeof value === 'function') {
      base = functionBase(value as Function, constructor);
      if (keys.length === 0) return base;
    } else if (value instanceof Date) {
      base = Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
      if (keys.length === 0) return base;
    } else if (value instanceof RegExp) {
      base = `/${value.source}/${value.flags}`;
      if (keys.length === 0) return base;
    } else if (value instanceof Error) {
      // Node prints the stack trace; here only the first line of it.
      base = value.message ? `${value.name}: ${value.message}` : value.name;
      keys = keys.filter((k) => k !== 'stack' && k !== 'message');
      if (keys.length === 0) return base;
    } else if (constructor === 'Object' && tag === '') {
      if (keys.length === 0) return '{}';
    } else {
      braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
      if (keys.length === 0) return `${braces[0]}}`;
    }
  }

  if (recurseTimes > ctx.depth) {
    const name = getPrefix(constructor, tag, Array.isArray(value) ? 'Array' : 'Object').slice(0, -1);
    return `[${Array.isArray(value) ? 'Array' : name}]`;
  }
  recurseTimes += 1;
  ctx.seen.push(value);
  ctx.currentDepth = recurseTimes;
  const output = formatter(ctx, value, recurseTimes);
  for (const k of keys) output.push(formatProperty(ctx, value, recurseTimes, k, extrasType));
  ctx.seen.pop();

  if (ctx.circular.has(value)) {
    const reference = `<ref *${ctx.circular.get(value)}>`;
    base = base === '' ? reference : `${reference} ${base}`;
  }
  return reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value);
}

function formatProperty(ctx: Ctx, value: object, recurseTimes: number, key: string | symbol, type: number): string {
  const desc = Object.getOwnPropertyDescriptor(value, key) ?? { value: (value as Record<string | symbol, unknown>)[key], enumerable: true };
  let str: string;
  if (desc.value !== undefined || !('get' in desc || 'set' in desc)) {
    ctx.indentationLvl += 2;
    str = formatValue(ctx, desc.value, recurseTimes);
    ctx.indentationLvl -= 2;
  } else if (desc.get !== undefined) {
    str = desc.set !== undefined ? '[Getter/Setter]' : '[Getter]';
  } else str = desc.set !== undefined ? '[Setter]' : 'undefined';
  if (type === kArrayExtrasType && typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key)) return str;
  let name: string;
  if (typeof key === 'symbol') name = `[${key.toString()}]`;
  else if (key === '__proto__') name = "['__proto__']";
  else if (desc.enumerable === false) name = `[${key}]`;
  else if (keyStrRegExp.test(key)) name = key;
  else name = strEscape(key);
  return `${name}: ${str}`;
}

function formatArray(ctx: Ctx, value: unknown[], recurseTimes: number): string[] {
  const len = Math.min(ctx.maxArrayLength, value.length);
  const output: string[] = [];
  let holes = 0;
  const flushHoles = () => {
    if (holes) output.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`);
    holes = 0;
  };
  for (let i = 0; i < len; i++) {
    if (!Object.prototype.hasOwnProperty.call(value, i)) {
      holes++;
      continue;
    }
    flushHoles();
    output.push(formatProperty(ctx, value, recurseTimes, String(i), kArrayExtrasType));
  }
  flushHoles();
  const remaining = value.length - len;
  if (remaining > 0) output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  return output;
}

function formatSet(ctx: Ctx, value: Set<unknown>, recurseTimes: number): string[] {
  const output: string[] = [];
  ctx.indentationLvl += 2;
  for (const v of value) output.push(formatValue(ctx, v, recurseTimes));
  ctx.indentationLvl -= 2;
  return output;
}

function formatMap(ctx: Ctx, value: Map<unknown, unknown>, recurseTimes: number): string[] {
  const output: string[] = [];
  ctx.indentationLvl += 2;
  for (const [k, v] of value) output.push(`${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
  ctx.indentationLvl -= 2;
  return output;
}

/** Long arrays of short items are laid out in columns, like Node. */
function groupArrayElements(ctx: Ctx, output: string[], value: unknown[] | undefined): string[] {
  let totalLength = 0;
  let maxLength = 0;
  let outputLength = output.length;
  if (value && ctx.maxArrayLength < value.length) outputLength--; // the "... n more items" part
  const separatorSpace = 2;
  const dataLen: number[] = [];
  for (let i = 0; i < outputLength; i++) {
    const len = output[i].length;
    dataLen[i] = len;
    totalLength += len + separatorSpace;
    if (maxLength < len) maxLength = len;
  }
  const actualMax = maxLength + separatorSpace;
  if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (totalLength / actualMax > 5 || maxLength <= 6)) {
    const averageBias = Math.sqrt(actualMax - totalLength / output.length);
    const biasedMax = Math.max(actualMax - 3 - averageBias, 1);
    const columns = Math.min(
      Math.round(Math.sqrt(2.5 * biasedMax * outputLength) / biasedMax),
      Math.floor((ctx.breakLength - ctx.indentationLvl) / actualMax),
      ctx.compact * 4,
      15,
    );
    if (columns <= 1) return output;
    const tmp: string[] = [];
    const maxLineLength: number[] = [];
    for (let i = 0; i < columns; i++) {
      let lineLength = 0;
      for (let j = i; j < output.length; j += columns) if (dataLen[j] > lineLength) lineLength = dataLen[j];
      maxLineLength.push(lineLength + separatorSpace);
    }
    let padStart = true;
    if (value !== undefined) {
      for (let i = 0; i < output.length; i++) {
        if (typeof value[i] !== 'number' && typeof value[i] !== 'bigint') {
          padStart = false;
          break;
        }
      }
    }
    for (let i = 0; i < outputLength; i += columns) {
      const max = Math.min(i + columns, outputLength);
      let str = '';
      let j = i;
      for (; j < max - 1; j++) {
        const padding = maxLineLength[j - i];
        str += padStart ? `${output[j]}, `.padStart(padding, ' ') : `${output[j]}, `.padEnd(padding, ' ');
      }
      if (padStart) str += output[j].padStart(maxLineLength[j - i] - separatorSpace, ' ');
      else str += output[j];
      tmp.push(str);
    }
    if (value && ctx.maxArrayLength < value.length) tmp.push(output[outputLength]);
    return tmp;
  }
  return output;
}

function isBelowBreakLength(ctx: Ctx, output: string[], start: number, base: string): boolean {
  let totalLength = output.length + start;
  if (totalLength + output.length > ctx.breakLength) return false;
  for (const entry of output) {
    totalLength += entry.length;
    if (totalLength > ctx.breakLength) return false;
  }
  return base === '' || !base.includes('\n');
}

function reduceToSingleString(ctx: Ctx, output: string[], base: string, braces: [string, string], extrasType: number, recurseTimes: number, value: object): string {
  const entries = output.length;
  if (extrasType === kArrayExtrasType && entries > 6) output = groupArrayElements(ctx, output, value as unknown[]);
  if (ctx.currentDepth - recurseTimes < ctx.compact && entries === output.length) {
    const start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;
    if (isBelowBreakLength(ctx, output, start, base)) {
      const joined = output.join(', ');
      if (!joined.includes('\n')) return `${base ? `${base} ` : ''}${braces[0]} ${joined} ${braces[1]}`;
    }
  }
  const indentation = `\n${' '.repeat(ctx.indentationLvl)}`;
  return `${base ? `${base} ` : ''}${braces[0]}${indentation}  ${output.join(`,${indentation}  `)}${indentation}${braces[1]}`;
}

/** util.inspect(value) with Node's defaults. */
export function inspect(value: unknown): string {
  const ctx: Ctx = { seen: [], circular: new Map(), indentationLvl: 0, currentDepth: 0, depth: 2, breakLength: 80, compact: 3, maxArrayLength: 100 };
  return formatValue(ctx, value, 0);
}

/** console.log(a, b, ...): like Node's util.format (with %s %d %i %f %j %o %O %c %% when the first value is text). */
export function formatLog(args: unknown[]): string {
  if (!args.length) return '';
  const first = args[0];
  let rest = args;
  let out = '';
  if (typeof first === 'string' && args.length > 1 && first.includes('%')) {
    let a = 1;
    let last = 0;
    for (let i = 0; i < first.length - 1; i++) {
      if (first[i] !== '%') continue;
      const c = first[i + 1];
      if (a >= args.length && c !== '%') break;
      let piece: string | null = null;
      switch (c) {
        case 's': {
          const v = args[a++];
          if (typeof v === 'string') piece = v;
          else if (typeof v === 'number') piece = formatNumber(v);
          else if (typeof v === 'bigint') piece = `${v}n`;
          else if (typeof v === 'object' && v !== null) piece = inspect(v);
          else piece = String(v);
          break;
        }
        case 'd':
        case 'i': {
          const v = args[a++];
          if (typeof v === 'bigint') piece = `${v}n`;
          else if (typeof v === 'symbol') piece = 'NaN';
          else {
            const n = c === 'i' ? parseInt(String(v)) : Number(v);
            piece = formatNumber(typeof v === 'object' && v !== null ? NaN : n);
          }
          break;
        }
        case 'f': {
          const v = args[a++];
          piece = typeof v === 'symbol' ? 'NaN' : formatNumber(parseFloat(String(v)));
          break;
        }
        case 'j': {
          const v = args[a++];
          try {
            piece = JSON.stringify(v) ?? 'undefined';
          } catch {
            piece = '[Circular]';
          }
          break;
        }
        case 'o':
        case 'O':
          piece = inspect(args[a++]);
          break;
        case 'c':
          a++;
          piece = '';
          break;
        case '%':
          out += first.slice(last, i) + '%';
          last = i + 2;
          i++;
          continue;
      }
      if (piece === null) continue;
      out += first.slice(last, i) + piece;
      last = i + 2;
      i++;
    }
    out += first.slice(last);
    rest = args.slice(a);
    if (!rest.length) return out;
    out += ' ';
  } else {
    out = typeof first === 'string' ? first : inspect(first);
    rest = args.slice(1);
    if (!rest.length) return out;
    out += ' ';
  }
  return out + rest.map((v) => (typeof v === 'string' ? v : inspect(v))).join(' ');
}
