type IconProps = { name: string; size?: number };

export default function Icon({ name, size = 20 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { color: 'var(--text)' } as React.CSSProperties,
  };

  switch (name) {
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
          <path d="M7 9h10M7 13h6" />
        </svg>
      );
    case 'team':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M3 21v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1M11 21v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1" />
        </svg>
      );
    case 'finance':
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M7 21V10M12 21V6M17 21V14" />
          <rect x="2.5" y="3" width="19" height="4" rx="1" />
        </svg>
      );
    case 'process':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <path d="M10 6h4a2 2 0 0 1 2 2v4M7 10v4a2 2 0 0 0 2 2h4" />
        </svg>
      );
    case 'sales':
      return (
        <svg {...common}>
          <path d="M3 17l5-5 4 4 7-7" />
          <path d="M21 8h-6V2" />
        </svg>
      );
    case 'founder':
      return (
        <svg {...common}>
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
          <path d="M12 12v3" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case 'business':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
          <path d="M7 11h2M11 11h2M15 11h2M7 15h2M11 15h2M15 15h2" />
        </svg>
      );
    case 'chevrons':
      return (
        <svg {...common}>
          <path d="M9 6l-6 6 6 6" />
          <path d="M21 6l-6 6 6 6" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case 'chevron-up':
      return (
        <svg {...common}>
          <path d="M18 15l-6-6-6 6" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case 'send':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text)' }}>
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
