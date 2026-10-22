import React from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

export function OrganizedLoansIllustration({ width = 280, height = 220 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="orgCardGrad" x1="0" y1="0" x2="240" y2="120" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F9FAF7" />
        </LinearGradient>
        <LinearGradient id="tagGrad" x1="0" y1="0" x2="80" y2="30" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1C4D42" />
          <Stop offset="100%" stopColor="#10332B" />
        </LinearGradient>
        <LinearGradient id="accentBadge" x1="0" y1="0" x2="60" y2="24" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#E2F97E" />
          <Stop offset="100%" stopColor="#C4E840" />
        </LinearGradient>
      </Defs>

      {/* Decorative background grid pattern */}
      <Circle cx="140" cy="110" r="90" fill="#EEF2E9" fillOpacity={0.6} />

      {/* Background card (peeking) */}
      <Rect
        x="36"
        y="32"
        width="208"
        height="120"
        rx="20"
        fill="#FFFFFF"
        stroke="#E1E6DE"
        strokeWidth="1.5"
        strokeOpacity={0.6}
        transform="rotate(-4 140 92)"
      />

      {/* Foreground primary loan card */}
      <Rect
        x="30"
        y="45"
        width="220"
        height="136"
        rx="22"
        fill="url(#orgCardGrad)"
        stroke="#E1E6DE"
        strokeWidth="1.5"
      />

      {/* Borrower avatar & initials */}
      <Circle cx="64" cy="80" r="20" fill="url(#tagGrad)" />
      <SvgText
        x="64"
        y="86"
        fill="#FFFFFF"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
      >
        RV
      </SvgText>

      {/* Friend Name & Date label */}
      <SvgText
        x="96"
        y="76"
        fill="#16231F"
        fontSize="16"
        fontWeight="bold"
      >
        Rahul Verma
      </SvgText>
      <SvgText
        x="96"
        y="94"
        fill="#68756E"
        fontSize="12"
        fontWeight="500"
      >
        Borrowed for trip
      </SvgText>

      {/* Amount tag */}
      <Rect x="176" y="66" width="60" height="28" rx="8" fill="#EEF2E9" />
      <SvgText
        x="206"
        y="85"
        fill="#153E35"
        fontSize="13"
        fontWeight="800"
        textAnchor="middle"
      >
        ₹2,500
      </SvgText>

      {/* Divider line */}
      <Path d="M48 116H232" stroke="#E1E6DE" strokeWidth="1" strokeDasharray="3 3" />

      {/* Due Date chip on bottom left */}
      <G transform="translate(48, 128)">
        <Rect x="0" y="0" width="105" height="28" rx="14" fill="#EEF2E9" stroke="#E1E6DE" strokeWidth="1" />
        {/* Calendar Mini Icon */}
        <Rect x="10" y="7" width="14" height="14" rx="3" stroke="#68756E" strokeWidth="1.2" fill="none" />
        <Path d="M10 11H24" stroke="#68756E" strokeWidth="1.2" />
        <Circle cx="13" cy="8" r="1" fill="#68756E" />
        <Circle cx="21" cy="8" r="1" fill="#68756E" />
        <SvgText
          x="30"
          y="18"
          fill="#16231F"
          fontSize="11"
          fontWeight="600"
        >
          Due 28 Oct
        </SvgText>
      </G>

      {/* Status Pill on bottom right */}
      <G transform="translate(162, 128)">
        <Rect x="0" y="0" width="74" height="28" rx="14" fill="url(#accentBadge)" />
        <Path
          d="M14 14L19 19L27 10"
          stroke="#153E35"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgText
          x="35"
          y="18"
          fill="#153E35"
          fontSize="11"
          fontWeight="bold"
        >
          Tracked
        </SvgText>
      </G>

      {/* Floating Plus circle CTA icon */}
      <G transform="translate(225, 20)">
        <Circle cx="18" cy="18" r="18" fill="url(#tagGrad)" />
        <Path d="M18 11V25M11 18H25" stroke="#D8F36A" strokeWidth="2.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
