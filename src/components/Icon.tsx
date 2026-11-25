// Inline stroke icons: 2 px stroke, round caps (spec section 5). No emoji.
import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'logo'
  | 'arrow-right'
  | 'arrow-left'
  | 'lines'
  | 'boxes'
  | 'message'
  | 'chevron-down'
  | 'share';

const PATHS: Record<IconName, ReactNode> = {
  logo: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m8 9 3 3-3 3" />
      <path d="M13 15h3" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  lines: (
    <>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h9" />
    </>
  ),
  boxes: (
    <>
      <rect x="4" y="5" width="7" height="6" rx="1.5" />
      <rect x="13" y="5" width="7" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="5" rx="1.5" />
    </>
  ),
  message: <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  share: (
    <>
      <path d="M12 15V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
