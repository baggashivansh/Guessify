type IconProps = { className?: string };

export function IconParty({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" d="M16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 18c.8-2.2 2.6-3.5 4.5-3.5s3.7 1.3 4.5 3.5M13 14.5c1.2 1.8 3.2 2.8 5.5 2.8" />
    </svg>
  );
}

export function IconSolo({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 4.5V2M12 22v-2.5M4.5 12H2M22 12h-2.5" />
    </svg>
  );
}

export function IconDaily({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
      <path strokeLinecap="round" d="M8.5 14.5h3M8.5 17.5h7" />
    </svg>
  );
}

export function IconChevron({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
