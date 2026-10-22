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

export function DueDatesIllustration({ width = 280, height = 220 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="overdueBg" x1="0" y1="0" x2="240" y2="60" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF5F4" />
          <Stop offset="100%" stopColor="#FBE9E6" />
        </LinearGradient>
        <LinearGradient id="repaidBg" x1="0" y1="0" x2="240" y2="60" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F2FBF6" />
          <Stop offset="100%" stopColor="#EAF6EF" />
        </LinearGradient>
      </Defs>

      {/* Ambient background ring */}
      <Circle cx="140" cy="110" r="95" fill="#F6F7F2" />
      <Circle
        cx="140"
        cy="110"
        r="80"
        stroke="#E1E6DE"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* 1. TOP CARD: Overdue (Needs attention) */}
      <G transform="translate(24, 20)">
        <Rect
          x="0"
          y="0"
          width="232"
          height="54"
          rx="16"
          fill="url(#overdueBg)"
          stroke="#F5C6C2"
          strokeWidth="1.5"
        />
        {/* Warning Icon Badge */}
        <Circle cx="28" cy="27" r="14" fill="#C94E42" fillOpacity={0.15} />
        <Path
          d="M28 20V27M28 31H28.01"
          stroke="#C94E42"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <SvgText x="52" y="24" fill="#16231F" fontSize="13" fontWeight="bold">
          Vikram S.
        </SvgText>
        <SvgText x="52" y="38" fill="#C94E42" fontSize="11" fontWeight="600">
          Overdue 4 days
        </SvgText>

        <Rect x="160" y="14" width="60" height="26" rx="13" fill="#C94E42" />
        <SvgText x="190" y="31" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
          OVERDUE
        </SvgText>
      </G>

      {/* 2. MIDDLE CARD: Active / Upcoming */}
      <G transform="translate(24, 84)">
        <Rect
          x="0"
          y="0"
          width="232"
          height="54"
          rx="16"
          fill="#FFFFFF"
          stroke="#E1E6DE"
          strokeWidth="1.5"
        />
        {/* Clock/Calendar Icon */}
        <Circle cx="28" cy="27" r="14" fill="#153E35" fillOpacity={0.08} />
        <Circle cx="28" cy="27" r="8" stroke="#153E35" strokeWidth="1.5" />
        <Path d="M28 23V27L31 29" stroke="#153E35" strokeWidth="1.5" strokeLinecap="round" />

        <SvgText x="52" y="24" fill="#16231F" fontSize="13" fontWeight="bold">
          Priya Nair
        </SvgText>
        <SvgText x="52" y="38" fill="#68756E" fontSize="11" fontWeight="500">
          Due in 3 days
        </SvgText>

        <Rect x="164" y="14" width="56" height="26" rx="13" fill="#EEF2E9" />
        <SvgText x="192" y="31" fill="#153E35" fontSize="10" fontWeight="bold" textAnchor="middle">
          ACTIVE
        </SvgText>
      </G>

      {/* 3. BOTTOM CARD: Repaid (Settled) */}
      <G transform="translate(24, 148)">
        <Rect
          x="0"
          y="0"
          width="232"
          height="54"
          rx="16"
          fill="url(#repaidBg)"
          stroke="#BDE8CE"
          strokeWidth="1.5"
        />
        {/* Checkmark Icon */}
        <Circle cx="28" cy="27" r="14" fill="#247A57" fillOpacity={0.15} />
        <Path
          d="M23 27L26.5 30.5L33 24"
          stroke="#247A57"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <SvgText x="52" y="24" fill="#16231F" fontSize="13" fontWeight="bold">
          Amit Shah
        </SvgText>
        <SvgText x="52" y="38" fill="#247A57" fontSize="11" fontWeight="600">
          Settled on 19 Oct
        </SvgText>

        <Rect x="164" y="14" width="56" height="26" rx="13" fill="#247A57" />
        <SvgText x="192" y="31" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
          REPAID
        </SvgText>
      </G>
    </Svg>
  );
}
