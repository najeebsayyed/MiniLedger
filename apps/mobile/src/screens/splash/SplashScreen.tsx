import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/navigation-types';
import { MiniLedgerLogo } from '../../components/illustrations/MiniLedgerLogo';
import { useAuth } from '../../features/auth/AuthContext';

type Props = {
  navigation?: any;
  onFinish?: () => void;
};

export function SplashScreen({ navigation, onFinish }: Props) {
  const { isAuthenticated, hasOnboarded, isLoading } = useAuth();

  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Coordinated entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(dotScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    // Only route when session & onboarding checks have finished
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (navigation) {
        if (isAuthenticated) {
          navigation.replace('App', { screen: 'Home' });
        } else if (!hasOnboarded) {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Auth', { screen: 'Login' });
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, hasOnboarded, navigation, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Decorative background ambient glows */}
      <View style={styles.ambientTopGlow} />
      <View style={styles.ambientBottomGlow} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <MiniLedgerLogo size={88} />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <View style={styles.wordmarkRow}>
          <Text style={styles.title}>MiniLedger</Text>
          <Animated.View
            style={[
              styles.citrusDot,
              { transform: [{ scale: dotScale }] },
            ]}
          />
        </View>

        <Text style={styles.tagline}>Calm, clear personal lending</Text>
      </Animated.View>

      {/* Subtle bottom badge */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>PEER LENDING LEDGER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#153E35',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(216, 243, 106, 0.08)',
  },
  ambientBottomGlow: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.75,
  },
  citrusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8F36A',
    marginLeft: 4,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D8F36A',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E8EFEA',
    letterSpacing: 1.5,
  },
});
