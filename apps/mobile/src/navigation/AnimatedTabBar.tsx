import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react-native';

interface TabItemProps {
  label: string;
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ label, routeName, isFocused, onPress, onLongPress }: TabItemProps) {
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      tension: 68,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.92,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const iconScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.08],
  });

  const pillOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const pillScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  const getIcon = () => {
    const color = isFocused ? '#153E35' : '#94A3B8';
    const size = 22;

    switch (routeName) {
      case 'Home':
        return <LayoutDashboard size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'Ledger':
        return <BookOpen size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'Settings':
        return <Settings size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      default:
        return <LayoutDashboard size={size} color={color} />;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        {/* Animated active pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity: pillOpacity,
              transform: [{ scale: pillScale }],
            },
          ]}
        />

        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          {getIcon()}
        </Animated.View>

        {/* Tab Label */}
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Top subtle highlight border */}
      <View style={styles.topBorder} />

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              label={label}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  topBorder: {
    height: 3,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 52,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -2,
    width: 58,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDF5EB', // Soft, serene tint of MiniLedger forest
    zIndex: 0,
  },
  iconWrapper: {
    zIndex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.2,
    zIndex: 1,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#153E35',
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: '#94A3B8',
  },
});
