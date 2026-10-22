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

export function SummaryAnalyticsIllustration({ width = 280, height = 220 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="heroSummaryBg" x1="0" y1="0" x2="240" y2="180" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1C4D42" />
          <Stop offset="100%" stopColor="#10332B" />
        </LinearGradient>
        <LinearGradient id="chartLineGrad" x1="50" y1="140" x2="230" y2="90" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#D8F36A" />
          <Stop offset="100%" stopColor="#FFFFFF" />
        </LinearGradient>
        <LinearGradient id="chartAreaGrad" x1="140" y1="80" x2="140" y2="150" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#D8F36A" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#D8F36A" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Ambient background ring */}
      <Circle cx="140" cy="110" r="95" fill="#EEF2E9" fillOpacity={0.5} />

      {/* Main Dashboard Hero Card */}
      <Rect
        x="24"
        y="25"
        width="232"
        height="170"
        rx="22"
        fill="url(#heroSummaryBg)"
      />

      {/* Card Header */}
      <SvgText x="44" y="52" fill="#D8F36A" fontSize="11" fontWeight="bold" letterSpacing="1">
        PORTFOLIO SUMMARY
      </SvgText>
      <SvgText x="44" y="78" fill="#FFFFFF" fontSize="22" fontWeight="800">
        ₹14,500
      </SvgText>
      <SvgText x="135" y="76" fill="#A0ABA4" fontSize="12" fontWeight="500">
        Net Outstanding
      </SvgText>

      {/* Chart Fill Area */}
      <Path
        d="M44 140 C80 135, 110 115, 145 120 C180 125, 205 95, 234 90 L234 150 L44 150 Z"
        fill="url(#chartAreaGrad)"
      />

      {/* Chart Line */}
      <Path
        d="M44 140 C80 135, 110 115, 145 120 C180 125, 205 95, 234 90"
        stroke="url(#chartLineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Chart Trend Nodes */}
      <Circle cx="44" cy="140" r="4" fill="#FFFFFF" />
      <Circle cx="145" cy="120" r="4" fill="#D8F36A" />
      <Circle cx="234" cy="90" r="5" fill="#D8F36A" stroke="#153E35" strokeWidth="2" />

      {/* Stat Metric Pod 1: Total Lent */}
      <G transform="translate(40, 158)">
        <Rect x="0" y="0" width="60" height="26" rx="8" fill="#FFFFFF" fillOpacity={0.1} />
        <SvgText x="30" y="11" fill="#A0ABA4" fontSize="8" fontWeight="600" textAnchor="middle">
          LENT
        </SvgText>
        <SvgText x="30" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
          ₹22,000
        </SvgText>
      </G>

      {/* Stat Metric Pod 2: Repaid */}
      <G transform="translate(108, 158)">
        <Rect x="0" y="0" width="60" height="26" rx="8" fill="#FFFFFF" fillOpacity={0.1} />
        <SvgText x="30" y="11" fill="#D8F36A" fontSize="8" fontWeight="600" textAnchor="middle">
          REPAID
        </SvgText>
        <SvgText x="30" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
          ₹7,500
        </SvgText>
      </G>

      {/* Stat Metric Pod 3: Overdue */}
      <G transform="translate(176, 158)">
        <Rect x="0" y="0" width="60" height="26" rx="8" fill="#C94E42" fillOpacity={0.25} />
        <SvgText x="30" y="11" fill="#FF8D80" fontSize="8" fontWeight="600" textAnchor="middle">
          OVERDUE
        </SvgText>
        <SvgText x="30" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
          ₹3,000
        </SvgText>
      </G>
    </Svg>
  );
}
