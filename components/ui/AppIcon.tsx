/**
 * AppIcon — the ChatToSales product icon.
 *
 * Self-contained: the dark rounded background is baked into the SVG so the
 * icon can be dropped anywhere without a wrapper element.
 *
 * The same graphic lives as a standalone asset at /public/icon.svg
 * for use outside this codebase (browser favicons, email templates, etc.)
 */
interface AppIconProps {
  /** Rendered width & height in px. Defaults to 32. */
  size?: number;
  className?: string;
}

export function AppIcon({ size = 32, className }: Readonly<AppIconProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="512" height="512" rx="110" fill="#091810" />

      {/* Back chat card */}
      <rect x="70" y="96" width="215" height="168" rx="16" fill="#132c1c" />
      <rect x="98" y="136" width="148" height="12" rx="6" fill="#1d4228" />
      <rect x="98" y="162" width="110" height="12" rx="6" fill="#1d4228" />
      <rect x="98" y="188" width="130" height="12" rx="6" fill="#1d4228" />

      {/* Front chat card */}
      <rect x="148" y="148" width="228" height="182" rx="16" fill="#1b4a2b" />
      <rect x="178" y="196" width="162" height="14" rx="7" fill="#2e7a48" />
      <rect x="178" y="224" width="120" height="14" rx="7" fill="#2e7a48" />
      <rect x="178" y="252" width="142" height="14" rx="7" fill="#2e7a48" />

      {/* Naira badge — bottom-left */}
      <circle cx="148" cy="388" r="56" fill="#f59e0b" />
      <text
        x="148"
        y="406"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, Arial, sans-serif"
        fontWeight="700"
        fontSize="50"
        fill="#091810"
      >
        ₦
      </text>

      {/* Arrow badge — bottom-right */}
      <circle cx="368" cy="380" r="56" fill="#22c55e" />
      <line
        x1="338"
        y1="380"
        x2="390"
        y2="380"
        stroke="#091810"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M370 358 L392 380 L370 402"
        stroke="#091810"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
