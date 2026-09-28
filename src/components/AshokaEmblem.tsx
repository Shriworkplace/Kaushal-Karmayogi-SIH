import React from 'react';

/**
 * State Emblem of India (Ashoka Lion Capital) SVG with "सत्यमेव जयते" (Satyameva Jayate)
 * Rendered in official government gold / bronze or monochrome navy.
 */
export const AshokaEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-10 h-14',
  color = '#B45309',
}) => {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      {/* Three Lions Top Contour */}
      <path
        d="M 50 8 C 45 8, 41 12, 41 17 C 41 21, 44 24, 46 25 C 44 26, 42 28, 42 32 C 38 29, 34 29, 32 32 C 30 35, 31 39, 34 42 C 31 43, 29 46, 30 50 C 31 54, 35 56, 39 55 C 38 58, 39 62, 42 64 C 44 65, 47 65, 49 63 C 49 67, 51 67, 51 63 C 53 65, 56 65, 58 64 C 61 62, 62 58, 61 55 C 65 56, 69 54, 70 50 C 71 46, 69 43, 66 42 C 69 39, 70 35, 68 32 C 66 29, 62 29, 58 32 C 58 28, 56 26, 54 25 C 56 24, 59 21, 59 17 C 59 12, 55 8, 50 8 Z"
        fill={color}
      />
      {/* Lion details / manes */}
      <path
        d="M 46 36 C 44 38, 44 42, 47 44 C 48 40, 48 38, 46 36 Z M 54 36 C 52 38, 52 40, 53 44 C 56 42, 56 38, 54 36 Z"
        fill="#ffffff"
        opacity="0.6"
      />
      {/* Abacus Base Profile */}
      <rect x="25" y="70" width="50" height="12" rx="2" fill={color} />
      {/* Ashoka Chakra in Abacus */}
      <circle cx="50" cy="76" r="4.5" fill="#ffffff" stroke={color} strokeWidth="1" />
      <circle cx="50" cy="76" r="1.5" fill={color} />
      {/* Galloping Horse (left) and Bull (right) representations */}
      <path
        d="M 32 73 C 30 73, 28 75, 29 77 C 31 78, 34 77, 34 75 Z"
        fill="#ffffff"
        opacity="0.8"
      />
      <path
        d="M 68 73 C 66 73, 65 75, 66 77 C 68 78, 71 77, 71 75 Z"
        fill="#ffffff"
        opacity="0.8"
      />
      {/* Lower Bell-shaped Lotus */}
      <path
        d="M 28 84 C 34 94, 66 94, 72 84 C 65 87, 35 87, 28 84 Z"
        fill={color}
      />
      <line x1="22" y1="96" x2="78" y2="96" stroke={color} strokeWidth="1.5" />
      {/* Devanagari "सत्यमेव जयते" (Satyameva Jayate) */}
      <text
        x="50"
        y="110"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', serif"
        fontSize="8.5"
        fontWeight="bold"
        fill={color}
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
      <text
        x="50"
        y="122"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill={color}
        letterSpacing="1"
        opacity="0.85"
      >
        SATYAMEVA JAYATE
      </text>
    </svg>
  );
};
