// CodeMirror 6 editor for the Home screen. Plain text look (no syntax colors),
// as in the Screen 1 screenshot; Python indentation rules for typing.
import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput } from '@codemirror/language';
import { python } from '@codemirror/lang-python';

interface Props {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
}

const theme = EditorView.theme(
  {
    '&': {
      height: '250px',
      backgroundColor: 'var(--color-code-bg)',
      color: 'var(--color-code-text)',
      borderRadius: '12px',
      fontSize: '15px',
    },
    '&.cm-focused': {
      outline: 'var(--focus-ring)',
      outlineOffset: '2px',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      lineHeight: 'var(--line-height-code)',
      overflow: 'auto',
    },
    '.cm-content': {
      padding: '16px 0',
      caretColor: 'var(--color-code-text)',
    },
    '.cm-line': {
      padding: '0 18px',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--color-code-text)',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection':
      {
        backgroundColor: 'var(--color-active-line)',
      },
  },
  { dark: true },
);

export function CodeEditor({ value, onChange, ariaLabel, ariaDescribedBy }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const contentAttrs: Record<string, string> = { 'aria-label': ariaLabel };
    if (ariaDescribedBy) contentAttrs['aria-describedby'] = ariaDescribedBy;

    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          drawSelection(),
          indentOnInput(),
          python(),
          EditorState.tabSize.of(4),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.contentAttributes.of(contentAttrs),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
          theme,
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // The editor is created once; later value changes are pushed in below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace the text when it changes from outside (an example chip was clicked).
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current !== value) {
      v.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={host} className="code-editor" />;
}
