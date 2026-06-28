interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = 'h-8 w-8' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M20 6C13.4 6 8 11.4 8 18c0 6.6 5.4 12 12 12 3.2 0 6.1-1.2 8.3-3.2"
        stroke="#1E1B4B"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M20 6v12h9"
        stroke="#1E1B4B"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.5 8.5c2.8 2.2 4.5 5.6 4.5 9.5a9.5 9.5 0 0 1-3.2 7.1"
        stroke="#6366F1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="14.5" cy="19" r="1.6" fill="#22C55E" />
      <circle cx="19" cy="19" r="1.6" fill="#EAB308" />
      <circle cx="23.5" cy="19" r="1.6" fill="#EF4444" />
    </svg>
  );
}
