import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  statusBarStyle?: 'light-content' | 'dark-content';
}

export function Screen({
  children,
  scrollable = false,
  isRefreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  statusBarStyle = 'dark-content',
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#153E35"
            colors={['#153E35']}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1" style={contentContainerStyle}>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={[containerStyle, style]}>
      <StatusBar barStyle={statusBarStyle} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}
