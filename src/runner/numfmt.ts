// Exact number formatting, shared by the Java and C/C++ interpreters.
//
// C's printf (and C++'s cout) round the exact binary value of a double, and an exact tie goes
// to the even digit: printf("%.1f", 0.25) is 0.2 and printf("%.0f", 2.5) is 2. JavaScript's
// toFixed picks the larger number on a tie, so it is not used for C.
//
// Java's Formatter (%.2f, %e) rounds the shortest decimal form of the double half-up:
// String.format("%.1f", 0.15) is 0.2 and "%.3f" of 1.0005 is 1.001.

/** x = m * 2^e for a finite x > 0. */
function decompose(x: number): { m: bigint; e: number } {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x);
  const hi = view.getUint32(0);
  const lo = view.getUint32(4);
  const expBits = (hi >>> 20) & 0x7ff;
  const mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  return expBits === 0 ? { m: mant, e: -1074 } : { m: mant | (1n << 52n), e: expBits - 1075 };
}

/** round(x * 10^p) for a finite x > 0, exactly, with ties to even. */
function roundScaled(x: number, p: number): bigint {
  const { m, e } = decompose(x);
  let num = m;
  let den = 1n;
  if (e >= 0) num <<= BigInt(e);
  else den <<= BigInt(-e);
  if (p >= 0) num *= 10n ** BigInt(p);
  else den *= 10n ** BigInt(-p);
  const q = num / den;
  const twice = 2n * (num % den);
  return twice > den || (twice === den && (q & 1n) === 1n) ? q + 1n : q;
}

const sign = (x: number) => (x < 0 || Object.is(x, -0) ? '-' : '');
const special = (x: number, upper = false) => {
  const t = Number.isNaN(x) ? 'nan' : `${x < 0 ? '-' : ''}inf`;
  return upper ? t.toUpperCase() : t;
};

/** printf("%.pf", x) */
export function cFixed(x: number, p: number): string {
  if (!Number.isFinite(x)) return special(x);
  const a = Math.abs(x);
  const n = a === 0 ? 0n : roundScaled(a, p);
  const digits = n.toString().padStart(p + 1, '0');
  const int = digits.slice(0, digits.length - p);
  return `${sign(x)}${int}${p > 0 ? `.${digits.slice(digits.length - p)}` : ''}`;
}

/** The first s significant digits of x > 0 (rounded exactly) and the power of ten of the first one. */
function cSig(a: number, s: number): { digits: string; exp: number } {
  let exp = Math.floor(Math.log10(a));
  for (let tries = 0; tries < 3; tries++) {
    const n = roundScaled(a, s - 1 - exp);
    const text = n.toString();
    if (text.length > s) exp++; // rounded up to the next power of ten (or log10 guessed low)
    else if (text.length < s) exp--; // log10 guessed high
    else return { digits: text, exp };
  }
  const n = roundScaled(a, s - 1 - exp);
  return { digits: n.toString().slice(0, s), exp };
}

const expText = (e: number) => `e${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`;

/** printf("%.pe", x) */
export function cExp(x: number, p: number): string {
  if (!Number.isFinite(x)) return special(x);
  const a = Math.abs(x);
  if (a === 0) return `${sign(x)}0${p > 0 ? `.${'0'.repeat(p)}` : ''}e+00`;
  const { digits, exp } = cSig(a, p + 1);
  return `${sign(x)}${digits[0]}${p > 0 ? `.${digits.slice(1)}` : ''}${expText(exp)}`;
}

/** printf("%.Pg", x), which is also how cout writes a double (P = its precision, 6 by default). */
export function cGeneral(x: number, precision: number): string {
  if (!Number.isFinite(x)) return special(x);
  const P = precision === 0 ? 1 : precision;
  const a = Math.abs(x);
  if (a === 0) return `${sign(x)}0`;
  const { exp } = cSig(a, P);
  const strip = (t: string) => (t.includes('.') ? t.replace(/0+$/, '').replace(/\.$/, '') : t);
  if (exp < -4 || exp >= P) {
    const t = cExp(x, P - 1);
    const at = t.indexOf('e');
    return strip(t.slice(0, at)) + t.slice(at);
  }
  return strip(cFixed(x, P - 1 - exp));
}

/** The shortest decimal digits of x > 0 (what Java's Double.toString uses) and the power of ten of the first. */
function shortest(a: number): { digits: string; exp: number } {
  const [m, e] = a.toExponential().split('e');
  return { digits: m.replace('.', ''), exp: Number(e) };
}

/** Round a digit string half-up to keep `keep` digits; may carry into a new leading digit. */
function halfUp(digits: string, keep: number): { digits: string; carried: boolean } {
  if (keep >= digits.length) return { digits: digits.padEnd(keep, '0'), carried: false };
  if (keep < 0) return { digits: '', carried: false };
  let n = BigInt(digits.slice(0, keep) || '0');
  if (digits[keep] >= '5') n += 1n;
  const text = keep === 0 ? (n > 0n ? '1' : '') : n.toString().padStart(keep, '0');
  return { digits: text, carried: text.length > keep };
}

/** Java's String.format("%.pf", x) */
export function javaFixed(x: number, p: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return x > 0 ? 'Infinity' : '-Infinity';
  const a = Math.abs(x);
  if (a === 0) return `${sign(x)}0${p > 0 ? `.${'0'.repeat(p)}` : ''}`;
  const { digits, exp } = shortest(a);
  // Digits before the point: exp + 1 (none when exp < 0); keep those plus p after it.
  const keep = exp + 1 + p;
  let { digits: kept, carried } = halfUp(digits, keep);
  let intLen = exp + 1;
  if (carried) intLen++;
  if (keep <= 0) {
    kept = carried ? '1' : '';
    intLen = carried ? 1 - p : 0;
  }
  const all = (intLen < 0 ? '0'.repeat(-intLen) : '') + kept;
  const total = Math.max(intLen, 0) + p;
  const padded = all.padStart(total, '0').padEnd(total, '0');
  const int = padded.slice(0, padded.length - p) || '0';
  return `${sign(x)}${int}${p > 0 ? `.${padded.slice(padded.length - p)}` : ''}`;
}

/** Java's String.format("%.pe", x): 1.23e+04 */
export function javaExp(x: number, p: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return x > 0 ? 'Infinity' : '-Infinity';
  const a = Math.abs(x);
  if (a === 0) return `${sign(x)}0${p > 0 ? `.${'0'.repeat(p)}` : ''}e+00`;
  const { digits, exp } = shortest(a);
  const { digits: kept, carried } = halfUp(digits, p + 1);
  const d = carried ? kept.slice(0, p + 1) : kept;
  return `${sign(x)}${d[0]}${p > 0 ? `.${d.slice(1)}` : ''}${expText(carried ? exp + 1 : exp)}`;
}
