import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import {
  WelcomeIllustration,
  OrganizedLoansIllustration,
  DueDatesIllustration,
  SummaryAnalyticsIllustration,
} from '../../components/illustrations';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  badge: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: Slide[] = [
    {
      id: '1',
      badge: 'PEER-TO-PEER LENDING',
      title: 'Track money lent to friends with calm clarity',
      description:
        'Never wonder who owes what or when. MiniLedger gives informal lending the structure, dignity, and accuracy it deserves.',
      illustration: <WelcomeIllustration width={SCREEN_WIDTH - 64} height={210} />,
    },
    {
      id: '2',
      badge: 'EFFORTLESS ENTRY',
      title: 'Record every loan in seconds',
      description:
        'Add a friend’s name, the agreed amount, and a clear due date. You can even record past loans to bring old records up to date.',
      illustration: <OrganizedLoansIllustration width={SCREEN_WIDTH - 64} height={210} />,
    },
    {
      id: '3',
      badge: 'PROACTIVE REMINDERS',
      title: 'Spot overdue receivables at a glance',
      description:
        'Active, overdue, and settled loans are clearly color-coded with high visual contrast so you know exactly which items need attention.',
      illustration: <DueDatesIllustration width={SCREEN_WIDTH - 64} height={210} />,
    },
    {
      id: '4',
      badge: 'PORTFOLIO INTELLIGENCE',
      title: 'Know your money at a single glance',
      description:
        'Always see your total lent, total repaid, and overdue amounts computed live with exact financial decimal precision.',
      illustration: <SummaryAnalyticsIllustration width={SCREEN_WIDTH - 64} height={210} />,
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('Auth', { screen: 'Login' });
      } catch (_) {}
    }
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <Screen scrollable={false} contentContainerStyle={styles.screen}>
      {/* Top Header / Skip Button */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MINILEDGER</Text>
          </View>
        </View>

        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleFinish}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Swipeable Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {/* Visual Asset Container */}
            <View style={styles.illustrationCard}>
              {item.illustration}
            </View>

            {/* Slide Content */}
            <View style={styles.contentContainer}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{item.badge}</Text>
              </View>

              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.descText}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls Area */}
      <View style={styles.bottomArea}>
        {/* Synchronized Page Indicator Dots */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <Button
            label={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            icon={
              isLastSlide ? (
                <CheckCircle2 size={18} color="#D8F36A" />
              ) : (
                <ArrowRight size={18} color="#D8F36A" />
              )
            }
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EEF2E9',
    borderWidth: 1,
    borderColor: '#E1E6DE',
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#153E35',
    letterSpacing: 1.2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 62, 53, 0.06)',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#153E35',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2E9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8E2D6',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#153E35',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16231F',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  descText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#68756E',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: '#153E35',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D8E2D6',
  },
  buttonContainer: {
    width: '100%',
  },
});
