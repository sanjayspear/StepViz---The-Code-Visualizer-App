// A button for a feature from a later phase. Clicking it shows a small
// "Coming soon" note next to it for a moment, so no button does nothing silently.
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import './ComingSoon.css';

const NOTE_MS = 2000;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Where the note sits relative to the button. */
  align?: 'start' | 'center' | 'end';
}

export function ComingSoonButton({ align = 'center', children, onClick, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span className="coming-soon">
      <button
        type="button"
        {...rest}
        onClick={(e) => {
          onClick?.(e);
          setVisible(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setVisible(false), NOTE_MS);
        }}
      >
        {children}
      </button>
      <span className={`coming-soon__note coming-soon__note--${align}`} role="status" aria-live="polite">
        {visible ? 'Coming soon' : ''}
      </span>
    </span>
  );
}
