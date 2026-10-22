import React from 'react';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark';
}

export function MiniLedgerLogo({ size = 64 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Defs>
        <LinearGradient id="logoBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1C4D42" />
          <Stop offset="100%" stopColor="#10332B" />
        </LinearGradient>
        <LinearGradient id="accentGlow" x1="16" y1="16" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#E2F97E" />
          <Stop offset="100%" stopColor="#C4E840" />
        </LinearGradient>
      </Defs>

      {/* Outer rounded squircle container */}
      <Rect x="4" y="4" width="72" height="72" rx="22" fill="url(#logoBg)" />

      {/* Decorative inner ledger page layer */}
      <Rect
        x="18"
        y="18"
        width="44"
        height="44"
        rx="12"
        stroke="#FFFFFF"
        strokeOpacity={0.12}
        strokeWidth="2"
      />

      {/* Interlocking Ledger 'M' & 'L' motif */}
      {/* Left pillar of M */}
      <Path
        d="M26 52V30C26 28.8954 26.8954 28 28 28H29C30.1046 28 31 28.8954 31 30V48H35V52H28C26.8954 52 26 51.1046 26 50Z"
        fill="#FFFFFF"
      />

      {/* Dynamic Chevron / Fold */}
      <Path
        d="M31 32L40 43L49 32"
        stroke="url(#accentGlow)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right pillar of M extending into L horizontal balance shelf */}
      <Path
        d="M49 28H51C52.1046 28 53 28.8954 53 30V50C53 51.1046 52.1046 52 51 52H38V48H49V30C49 28.8954 48.1046 28 47 28Z"
        fill="#FFFFFF"
      />

      {/* Balance coin dot in Citrus accent */}
      <Circle cx="40" cy="24" r="3.5" fill="url(#accentGlow)" />
    </Svg>
  );
}
