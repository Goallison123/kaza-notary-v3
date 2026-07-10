/**
 * KazaLogo — three variants:
 *   "animated"  full SVG with the K→network morph animation (landing page hero)
 *   "static"    the peak frame: 5 country nodes + notary lock at confluence (navbar/topbar)
 *   "icon"      compact square version of the static mark for favicon-sized use
 */

interface KazaLogoProps {
  variant?: 'animated' | 'static' | 'icon';
  /** Width/height in px; height is derived proportionally */
  size?: number;
  className?: string;
  /** Show the KAZA wordmark + tagline below the mark */
  wordmark?: boolean;
}

export default function KazaLogo({
  variant = 'animated',
  size = 240,
  className = '',
  wordmark = false,
}: KazaLogoProps) {
  if (variant === 'icon') {
    /* Compact 1:1 icon — static peak frame, no wordmark */
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        aria-label="Kaza logo"
      >
        <defs>
          <linearGradient id="ico-brand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="ico-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7C11" />
          </linearGradient>
        </defs>

        {/* Network lines */}
        <line x1="26" y1="28" x2="49" y2="50" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
        <line x1="74" y1="28" x2="49" y2="50" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
        <line x1="26" y1="72" x2="49" y2="50" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
        <line x1="74" y1="72" x2="49" y2="50" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
        <line x1="49" y1="14" x2="49" y2="50" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />

        {/* Country nodes */}
        <circle cx="26" cy="28" r="7" fill="#1E3A8A" />
        <circle cx="74" cy="28" r="7" fill="#3B82F6" />
        <circle cx="74" cy="72" r="7" fill="#06B6D4" />
        <circle cx="26" cy="72" r="7" fill="#2563EB" />
        <circle cx="49" cy="14" r="7" fill="#1E40AF" />

        {/* Notary lock at confluence */}
        <circle cx="50" cy="50" r="14" fill="none" stroke="url(#ico-bronze)" strokeWidth="1.2" opacity="0.4" />
        <rect x="43" y="44" width="14" height="13" rx="3" fill="url(#ico-bronze)" />
        <circle cx="50" cy="50" r="1.5" fill="white" />
      </svg>
    );
  }

  if (variant === 'static') {
    /* Static peak frame — nodes + lock — used wherever a logo mark is needed */
    const vbW = wordmark ? 800 : 420;
    const vbH = wordmark ? 650 : 380;
    const aspect = vbW / vbH;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={size}
        height={Math.round(size / aspect)}
        className={className}
        aria-label="Kaza logo"
      >
        <defs>
          <linearGradient id="st-brand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="st-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7C11" />
          </linearGradient>
        </defs>

        {/* Network lines */}
        <line x1="280" y1="180" x2="400" y2="240" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
        <line x1="390" y1="140" x2="400" y2="240" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
        <line x1="520" y1="190" x2="400" y2="240" stroke="#06B6D4" strokeWidth="2" opacity="0.4" />
        <line x1="510" y1="320" x2="400" y2="240" stroke="#1E40AF" strokeWidth="2" opacity="0.4" />
        <line x1="290" y1="310" x2="400" y2="240" stroke="#2563EB" strokeWidth="2" opacity="0.4" />

        {/* Angola */}
        <circle cx="280" cy="180" r="10" fill="#1E3A8A" stroke="#F8FAFC" strokeWidth="2" />
        {/* Zambia */}
        <circle cx="390" cy="140" r="10" fill="#3B82F6" stroke="#F8FAFC" strokeWidth="2" />
        {/* Zimbabwe */}
        <circle cx="520" cy="190" r="10" fill="#06B6D4" stroke="#F8FAFC" strokeWidth="2" />
        {/* Botswana */}
        <circle cx="510" cy="320" r="10" fill="#1E40AF" stroke="#F8FAFC" strokeWidth="2" />
        {/* Namibia / Caprivi */}
        <circle cx="290" cy="310" r="10" fill="#2563EB" stroke="#F8FAFC" strokeWidth="2" />

        {/* Notary lock at Kasane confluence */}
        <circle cx="400" cy="240" r="24" fill="none" stroke="url(#st-bronze)" strokeWidth="1.5" opacity="0.4" />
        <rect x="388" y="228" width="24" height="24" rx="5" fill="url(#st-bronze)" />
        <circle cx="400" cy="240" r="2" fill="#F8FAFC" />

        {/* Wordmark */}
        {wordmark && (
          <g transform="translate(0, 20)">
            <text x="400" y="490" fontFamily="'Helvetica Neue','Segoe UI',Inter,sans-serif" fontWeight="800" fontSize="72" fill="#0F172A" letterSpacing="16" textAnchor="middle">KAZA</text>
            <text x="400" y="535" fontFamily="'Segoe UI',Inter,sans-serif" fontWeight="700" fontSize="14" fill="#64748B" letterSpacing="8" textAnchor="middle">DECENTRALIZED OFFICE &amp; NOTARY LEDGER</text>
            <line x1="340" y1="565" x2="460" y2="565" stroke="url(#st-bronze)" strokeWidth="3" />
          </g>
        )}
      </svg>
    );
  }

  /* ── ANIMATED variant ─────────────────────────────────────────────────── */
  const vbW = wordmark ? 800 : 500;
  const vbH = wordmark ? 650 : 390;
  const aspect = vbW / vbH;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={size}
      height={Math.round(size / aspect)}
      className={className}
      aria-label="Kaza logo"
    >
      <defs>
        <linearGradient id="an-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="an-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>

        <style>{`
          .kaza-morphpath {
            animation: kazaMorph 7s infinite ease-in-out;
          }
          .kaza-hud {
            animation: kazaHud 7s infinite ease-in-out;
          }
          @keyframes kazaMorph {
            0%, 30% {
              d: path("M 330,120 L 370,120 L 370,220 L 450,120 L 500,120 L 410,230 L 500,340 L 450,340 L 370,240 L 370,340 L 330,340 Z");
              fill: #1E3A8A;
            }
            50%, 80% {
              d: path("M 280,180 L 390,140 L 400,240 L 520,190 L 520,200 L 400,240 L 510,320 L 460,320 L 400,240 L 290,310 L 280,300 Z");
              fill: url(#an-brand);
            }
            100% {
              d: path("M 330,120 L 370,120 L 370,220 L 450,120 L 500,120 L 410,230 L 500,340 L 450,340 L 370,240 L 370,340 L 330,340 Z");
              fill: #1E3A8A;
            }
          }
          @keyframes kazaHud {
            0%, 35%, 75%, 100% { opacity: 0; transform: scale(0.8); transform-origin: 400px 230px; }
            50%, 70%           { opacity: 1; transform: scale(1);   transform-origin: 400px 230px; }
          }
        `}</style>
      </defs>

      <g transform="translate(0, -10)">
        {/* Morphing K → network path */}
        <path
          className="kaza-morphpath"
          d="M 330,120 L 370,120 L 370,220 L 450,120 L 500,120 L 410,230 L 500,340 L 450,340 L 370,240 L 370,340 L 330,340 Z"
        />

        {/* HUD nodes — appear only on the map frame */}
        <g className="kaza-hud" opacity="0">
          <circle cx="280" cy="180" r="10" fill="#1E3A8A" stroke="#F8FAFC" strokeWidth="2" />
          <circle cx="390" cy="140" r="10" fill="#3B82F6" stroke="#F8FAFC" strokeWidth="2" />
          <circle cx="520" cy="190" r="10" fill="#06B6D4" stroke="#F8FAFC" strokeWidth="2" />
          <circle cx="510" cy="320" r="10" fill="#1E40AF" stroke="#F8FAFC" strokeWidth="2" />
          <circle cx="290" cy="310" r="10" fill="#2563EB" stroke="#F8FAFC" strokeWidth="2" />

          {/* Notary lock */}
          <circle cx="400" cy="240" r="24" fill="none" stroke="url(#an-bronze)" strokeWidth="1.5" opacity="0.4" />
          <rect x="388" y="228" width="24" height="24" rx="5" fill="url(#an-bronze)" />
          <circle cx="400" cy="240" r="2" fill="#F8FAFC" />
        </g>
      </g>

      {/* Wordmark */}
      {wordmark && (
        <g transform="translate(0, 20)">
          <text x="400" y="490" fontFamily="'Helvetica Neue','Segoe UI',Inter,sans-serif" fontWeight="800" fontSize="72" fill="#0F172A" letterSpacing="16" textAnchor="middle">KAZA</text>
          <text x="400" y="535" fontFamily="'Segoe UI',Inter,sans-serif" fontWeight="700" fontSize="14" fill="#64748B" letterSpacing="8" textAnchor="middle">DECENTRALIZED OFFICE &amp; NOTARY LEDGER</text>
          <line x1="340" y1="565" x2="460" y2="565" stroke="url(#an-bronze)" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}
