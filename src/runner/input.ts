// Reads the text typed into the input box the way Java's Scanner and C++'s cin
// do: words for nextInt / next / cin >>, whole lines for nextLine / getline.
export class Input {
  private pos = 0;
  /** `noMore` makes the language's error for running out of input. */
  constructor(
    private text: string,
    private noMore: (message: string) => Error,
  ) {}
  private skipSpace() {
    while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) this.pos++;
  }
  hasNext(): boolean {
    const save = this.pos;
    this.skipSpace();
    const has = this.pos < this.text.length;
    this.pos = save;
    return has;
  }
  peekWord(): string | null {
    const save = this.pos;
    const w = this.hasNext() ? this.word() : null;
    this.pos = save;
    return w;
  }
  word(): string {
    this.skipSpace();
    if (this.pos >= this.text.length) throw this.noMore('No more input');
    const start = this.pos;
    while (this.pos < this.text.length && !/\s/.test(this.text[this.pos])) this.pos++;
    return this.text.slice(start, this.pos);
  }
  hasNextLine(): boolean {
    return this.pos < this.text.length;
  }
  line(): string {
    if (this.pos >= this.text.length) throw this.noMore('No line found');
    const end = this.text.indexOf('\n', this.pos);
    const line = end < 0 ? this.text.slice(this.pos) : this.text.slice(this.pos, end);
    this.pos = end < 0 ? this.text.length : end + 1;
    return line.replace(/\r$/, '');
  }
}

