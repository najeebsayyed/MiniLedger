import React from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

export function EmptyLedgerIllustration({ width = 180, height = 150 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 150" fill="none">
      <Defs>
        <LinearGradient id="bookCover" x1="0" y1="0" x2="160" y2="120" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1C4D42" />
          <Stop offset="100%" stopColor="#10332B" />
        </LinearGradient>
        <LinearGradient id="goldRibbon" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#E2F97E" />
          <Stop offset="100%" stopColor="#C4E840" />
        </LinearGradient>
      </Defs>

      {/* Ambient background circle */}
      <Circle cx="90" cy="75" r="65" fill="#EEF2E9" fillOpacity={0.6} />

      {/* Open Ledger Book Base */}
      {/* Left Page Shadow */}
      <Rect x="26" y="32" width="60" height="82" rx="6" fill="#DCE3D8" />
      {/* Right Page Shadow */}
      <Rect x="94" y="32" width="60" height="82" rx="6" fill="#DCE3D8" />

      {/* Left Page (White paper) */}
      <Rect x="24" y="30" width="62" height="82" rx="6" fill="#FFFFFF" stroke="#E1E6DE" strokeWidth="1.5" />
      {/* Right Page (White paper) */}
      <Rect x="94" y="30" width="62" height="82" rx="6" fill="#FFFFFF" stroke="#E1E6DE" strokeWidth="1.5" />

      {/* Book Spine */}
      <Rect x="85" y="28" width="10" height="86" rx="3" fill="url(#bookCover)" />

      {/* Ruled lines on Left Page */}
      <Path d="M34 46H76" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M34 58H76" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M34 70H76" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M34 82H60" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />

      {/* Ruled lines on Right Page */}
      <Path d="M104 46H146" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M104 58H146" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M104 70H146" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M104 82H130" stroke="#E1E6DE" strokeWidth="2" strokeLinecap="round" />

      {/* Bookmark Ribbon */}
      <Path
        d="M87 28V80L90 75L93 80V28"
        fill="url(#goldRibbon)"
      />

      {/* Stylized Pen lying diagonally */}
      <G transform="translate(115, 68) rotate(35)">
        <Rect x="0" y="0" width="8" height="52" rx="4" fill="url(#bookCover)" />
        <Path d="M0 52L4 60L8 52Z" fill="#D8F36A" />
        <Rect x="2" y="6" width="4" height="12" rx="2" fill="#D8F36A" />
      </G>

      {/* Sparkles / Stars */}
      <G transform="translate(20, 20)">
        <Path d="M10 0L12 7L19 10L12 13L10 20L8 13L1 10L8 7Z" fill="#D8F36A" />
      </G>
      <G transform="translate(150, 18)">
        <Circle cx="5" cy="5" r="3.5" fill="#153E35" fillOpacity={0.4} />
      </G>
      <G transform="translate(148, 115)">
        <Path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#D8F36A" />
      </G>
    </Svg>
  );
}
