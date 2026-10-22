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

export function WelcomeIllustration({ width = 280, height = 220 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="heroCardGrad" x1="40" y1="30" x2="240" y2="190" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1C4D42" />
          <Stop offset="100%" stopColor="#10332B" />
        </LinearGradient>
        <LinearGradient id="coinGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#E5FA7A" />
          <Stop offset="100%" stopColor="#C2E838" />
        </LinearGradient>
        <LinearGradient id="subtleHalo" x1="140" y1="20" x2="140" y2="200" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#D8F36A" stopOpacity={0.18} />
          <Stop offset="100%" stopColor="#153E35" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Ambient background glow circle */}
      <Circle cx="140" cy="110" r="95" fill="url(#subtleHalo)" />

      {/* Decorative background dashed orbit ring */}
      <Circle
        cx="140"
        cy="110"
        r="80"
        stroke="#153E35"
        strokeOpacity={0.12}
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Shadow layer for main card */}
      <Rect x="46" y="52" width="188" height="116" rx="20" fill="#0E2B24" fillOpacity={0.15} />

      {/* Central Modern Ledger Card */}
      <Rect x="44" y="46" width="192" height="120" rx="22" fill="url(#heroCardGrad)" />

      {/* Interior card geometric pattern */}
      <Circle cx="210" cy="65" r="35" stroke="#FFFFFF" strokeOpacity={0.06} strokeWidth="2" />
      <Circle cx="210" cy="65" r="50" stroke="#FFFFFF" strokeOpacity={0.04} strokeWidth="1.5" />

      {/* Card Header Tag */}
      <Rect x="60" y="62" width="60" height="14" rx="7" fill="#FFFFFF" fillOpacity={0.12} />
      <Circle cx="68" cy="69" r="3" fill="#D8F36A" />

      {/* Large Balance amount text representation */}
      <Rect x="60" y="86" width="100" height="18" rx="6" fill="#FFFFFF" />
      <Rect x="60" y="112" width="64" height="8" rx="4" fill="#FFFFFF" fillOpacity={0.4} />

      {/* Mini status indicator badge inside card */}
      <Rect x="160" y="130" width="62" height="22" rx="11" fill="#D8F36A" />
      <SvgText
        x="191"
        y="145"
        fill="#153E35"
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
      >
        ACTIVE
      </SvgText>

      {/* Floating Rupee Coin 1 (Top Left) */}
      <G transform="translate(24, 25)">
        <Circle cx="22" cy="22" r="20" fill="url(#coinGrad)" />
        <Circle cx="22" cy="22" r="17" stroke="#153E35" strokeOpacity={0.15} strokeWidth="1" />
        <SvgText
          x="22"
          y="28"
          fill="#153E35"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
        >
          ₹
        </SvgText>
      </G>

      {/* Floating Rupee Coin 2 (Bottom Right) */}
      <G transform="translate(216, 136)">
        <Circle cx="18" cy="18" r="16" fill="url(#coinGrad)" />
        <Circle cx="18" cy="18" r="13" stroke="#153E35" strokeOpacity={0.15} strokeWidth="1" />
        <SvgText
          x="18"
          y="23"
          fill="#153E35"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
        >
          ₹
        </SvgText>
      </G>

      {/* Friend node badge (Top Right) */}
      <G transform="translate(198, 22)">
        <Circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#E1E6DE" strokeWidth="2" />
        <Circle cx="20" cy="16" r="6" fill="#153E35" fillOpacity={0.7} />
        <Path
          d="M10 31C10 26 14 24 20 24C26 24 30 26 30 31"
          fill="#153E35"
          fillOpacity={0.7}
        />
      </G>

      {/* Secondary node badge (Bottom Left) */}
      <G transform="translate(30, 145)">
        <Circle cx="16" cy="16" r="15" fill="#FFFFFF" stroke="#E1E6DE" strokeWidth="2" />
        <Circle cx="16" cy="13" r="5" fill="#247A57" />
        <Path
          d="M8 25C8 21 11.5 19.5 16 19.5C20.5 19.5 24 21 24 25"
          fill="#247A57"
        />
      </G>
    </Svg>
  );
}
