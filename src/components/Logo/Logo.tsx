interface LogoProps {
  showTagline?: boolean;
  iconSize?: number;
}

export function Logo({ showTagline = false, iconSize = 32 }: LogoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cifra-logo-gradient" x1="0" y1="24" x2="48" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2563EB" />
              <stop offset="1" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <path
            d="M13 15C7.477 15 3 19.477 3 25s4.477 10 10 10c4.2 0 7.8-2.6 9.3-6.3l3.4-8.4c1.5-3.7 5.1-6.3 9.3-6.3 5.523 0 10 4.477 10 10s-4.477 10-10 10c-4.2 0-7.8-2.6-9.3-6.3l-3.4-8.4C21.3 15.6 17.7 13 13.5 13"
            stroke="url(#cifra-logo-gradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-lg font-bold tracking-tight">
          <span className="text-white">CIFRA </span>
          <span className="bg-brand-gradient bg-clip-text text-transparent">Wealth</span>
        </span>
      </div>
      {showTagline && (
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Inteligência para o seu futuro
        </p>
      )}
    </div>
  );
}
