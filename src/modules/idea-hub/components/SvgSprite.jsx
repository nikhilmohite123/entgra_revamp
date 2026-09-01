import React from 'react';

export default function SvgSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      {/* factory / commercialised */}
      <symbol
        id="icon-factory"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 20V8l5 3V8l5 3V4l10 5v11H2z" />
        <rect x="6" y="14" width="3" height="6" rx="0.5" />
        <rect x="11" y="14" width="3" height="6" rx="0.5" />
        <rect x="16" y="14" width="3" height="6" rx="0.5" />
      </symbol>

      {/* flask / NDP */}
      <symbol
        id="icon-flask"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 3h6M9 3v6l-5 10a1 1 0 0 0 .9 1.5h14.2A1 1 0 0 0 20 19L15 9V3" />
        <line x1="6.5" y1="14" x2="17.5" y2="14" />
      </symbol>

      {/* globe / outside-in */}
      <symbol
        id="icon-globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9" />
        <path d="M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </symbol>

      {/* home */}
      <symbol
        id="icon-home"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
        <path d="M3 12v9h18v-9" />
      </symbol>

      {/* notice finger */}
      <symbol
        id="icon-point"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11V6a2 2 0 1 1 4 0v5" />
        <path d="M13 6a2 2 0 1 1 4 0v5" />
        <path d="M17 8a2 2 0 1 1 4 0v4a8 8 0 0 1-16 0v-1a2 2 0 1 1 4 0" />
      </symbol>
    </svg>
  );
}
