import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SummaryDto } from '@miniledger/contracts';
import { formatInr } from '../../utils/currency';
import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react-native';

interface SummaryCardProps {
  summary?: SummaryDto;
  loading?: boolean;
}

export function SummaryCard({ summary, loading = false }: SummaryCardProps) {
  const outstanding = summary?.outstandingAmount ?? '0.00';
  const totalLent = summary?.totalLent ?? '0.00';
  const totalRepaid = summary?.totalRepaid ?? '0.00';
  const overdue = summary?.overdueAmount ?? '0.00';

  const hasOverdue = parseFloat(overdue) > 0;

  return (
    <View className="relative w-full overflow-hidden rounded-card bg-brand p-5 shadow-lg shadow-brand/20">
      {/* Decorative SVG Motif in background */}
      <View className="absolute -right-12 -top-12 pointer-events-none opacity-20">
        <Svg width="220" height="220" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="motifGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#D8F36A" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#247A57" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="100"
            cy="100"
            r="80"
            stroke="url(#motifGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <Circle
            cx="100"
            cy="100"
            r="55"
            stroke="#D8F36A"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 40,100 Q 100,20 160,100 T 280,100"
            stroke="#D8F36A"
            strokeWidth="1.5"
            fill="none"
          />
        </Svg>
      </View>

      {/* Card Header: Label & Live Indicator */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs uppercase tracking-widest font-semibold text-emerald-200/80">
          Total Outstanding
        </Text>
        <View className="flex-row items-center bg-white/10 px-2.5 py-1 rounded-full">
          <View className="w-1.5 h-1.5 rounded-full bg-brand-accent mr-1.5" />
          <Text className="text-[11px] font-medium text-emerald-100">
            {summary?.activeLoansCount ?? 0} active
          </Text>
        </View>
      </View>

      {/* Main Headline: Outstanding Amount */}
      <View className="mb-6">
        <Text
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {loading ? '₹••••' : formatInr(outstanding)}
        </Text>
        <Text className="text-xs text-emerald-200/70 mt-0.5">
          Money currently waiting to come back
        </Text>
      </View>

      {/* Supporting Strip: 3 Metrics */}
      <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
        {/* Total Lent */}
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <ArrowUpRight size={12} color="#A7F3D0" />
            <Text className="text-[11px] font-medium text-emerald-200/70 ml-0.5">
              Total lent
            </Text>
          </View>
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {loading ? '••••' : formatInr(totalLent)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-[1px] h-8 bg-white/10 mx-2" />

        {/* Total Repaid */}
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <CheckCircle2 size={12} color="#A7F3D0" />
            <Text className="text-[11px] font-medium text-emerald-200/70 ml-0.5">
              Total repaid
            </Text>
          </View>
          <Text className="text-sm font-bold text-emerald-100" numberOfLines={1}>
            {loading ? '••••' : formatInr(totalRepaid)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-[1px] h-8 bg-white/10 mx-2" />

        {/* Overdue Amount (Never hidden) */}
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <AlertCircle
              size={12}
              color={hasOverdue ? '#FCA5A5' : '#A7F3D0'}
            />
            <Text
              className={`text-[11px] font-medium ml-0.5 ${
                hasOverdue ? 'text-red-300 font-semibold' : 'text-emerald-200/70'
              }`}
            >
              Overdue
            </Text>
          </View>
          <Text
            className={`text-sm font-bold ${
              hasOverdue ? 'text-red-300' : 'text-white/80'
            }`}
            numberOfLines={1}
          >
            {loading ? '••••' : formatInr(overdue)}
          </Text>
        </View>
      </View>
    </View>
  );
}
