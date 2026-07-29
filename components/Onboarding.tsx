import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { GAMES } from '../content/games';

const GAME_EMOJI: Record<string, string> = {
  'bomb-pass': '💣',
  chameleon: '🦎',
  'most-likely-to': '🤔',
  'would-you-rather': '🔀',
  'truth-or-dare': '🎯',
  'category-blitz': '⚡',
};

interface Slide {
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  accentInk: string;
  content?: 'games' | 'badges';
}

const SLIDES: Slide[] = [
  {
    icon: '🎉',
    eyebrow: 'WELCOME',
    title: 'House Party',
    body: 'Party games built for passing the phone around the room. No account needed — just pick a game and go.',
    accent: colors.flame,
    accentInk: colors.flameInk,
  },
  {
    icon: '🎲',
    eyebrow: 'SIX GAMES',
    title: 'Endless replay',
    body: 'Fresh prompts every round, built for groups of 2–12.',
    accent: colors.mint,
    accentInk: colors.mintInk,
    content: 'games',
  },
  {
    icon: '⭐',
    eyebrow: 'FREE, EVERY DAY',
    title: 'Play free, every day',
    body: 'Bomb Pass and Chameleon each give you 2 free rounds a day.',
    accent: colors.spark,
    accentInk: colors.flameInk,
    content: 'badges',
  },
];

function FloatingDot({
  color,
  size,
  delay,
  distance = 12,
  style,
}: {
  color: string;
  size: number;
  delay: number;
  distance?: number;
  style: StyleProp<ViewStyle>;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -distance,
          duration: 1600,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, distance, translateY]);

  return (
    <Animated.View
      style={[
        styles.floatingDot,
        style,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY }] },
      ]}
    />
  );
}

function BouncyButton({
  onPress,
  style,
  textStyle,
  children,
}: {
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<import('react-native').TextStyle>;
  children: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable style={style} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
        <Text style={textStyle}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function Onboarding({
  onContinueFree,
  onGoPro,
}: {
  onContinueFree: () => void;
  onGoPro: () => void;
}) {
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(18)).current;
  const iconScale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    fade.setValue(0);
    slideX.setValue(18);
    iconScale.setValue(0.4);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideX, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, friction: 5, tension: 90, delay: 70, useNativeDriver: true }),
    ]).start();
  }, [step, fade, slideX, iconScale]);

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    if (!isLast) setStep((s) => s + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FloatingDot color={colors.flame} size={8} delay={0} style={{ top: 64, left: 28 }} />
      <FloatingDot color={colors.mint} size={6} delay={280} distance={9} style={{ top: 130, right: 36 }} />
      <FloatingDot color={colors.spark} size={5} delay={550} distance={8} style={{ top: 210, left: 56 }} />
      <FloatingDot color={colors.spark} size={7} delay={180} distance={11} style={{ bottom: 210, right: 44 }} />
      <FloatingDot color={colors.flame} size={6} delay={420} distance={10} style={{ bottom: 260, left: 34 }} />
      <FloatingDot color={colors.mint} size={5} delay={650} distance={8} style={{ bottom: 150, right: 90 }} />

      <View style={styles.headerRow}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && { backgroundColor: s.accent, width: 20 },
              ]}
            />
          ))}
        </View>
        {!isLast && (
          <Pressable onPress={onContinueFree} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <Animated.View
          style={[styles.iconCircle, { backgroundColor: slide.accent + '1f', transform: [{ scale: iconScale }] }]}
        >
          <Text style={styles.icon}>{slide.icon}</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }] }}>
          <Text style={[styles.eyebrow, { color: slide.accent }]}>{slide.eyebrow}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>

          {slide.content === 'games' && (
            <View style={styles.chipRow}>
              {GAMES.map((g) => (
                <View key={g.id} style={styles.chip}>
                  <Text style={styles.chipEmoji}>{GAME_EMOJI[g.id] ?? '🎮'}</Text>
                  <Text style={styles.chipText}>{g.title}</Text>
                </View>
              ))}
            </View>
          )}

          {slide.content === 'badges' && (
            <View style={styles.badgeRow}>
              <View style={styles.badgePreview}>
                <Text style={styles.badgePreviewText}>2 LEFT</Text>
              </View>
              <Text style={styles.badgeArrow}>→</Text>
              <View style={[styles.badgePreview, styles.badgePreviewMint]}>
                <Text style={styles.badgePreviewMintText}>UNLIMITED</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <BouncyButton
          onPress={isLast ? onGoPro : next}
          style={[styles.primaryButton, { backgroundColor: slide.accent }]}
          textStyle={[styles.primaryButtonText, { color: slide.accentInk }]}
        >
          {isLast ? 'Go Pro' : 'Next'}
        </BouncyButton>
        {isLast && (
          <Pressable style={styles.secondaryButton} onPress={onContinueFree}>
            <Text style={styles.secondaryButtonText}>Continue Free</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
  },
  floatingDot: {
    position: 'absolute',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    height: 40,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkDim,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 52,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontSize: 15,
    color: colors.inkDim,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 22,
  },
  badgePreview: {
    borderWidth: 1,
    borderColor: colors.spark,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  badgePreviewText: {
    color: colors.spark,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeArrow: {
    color: colors.inkFaint,
    fontSize: 18,
    fontWeight: '700',
  },
  badgePreviewMint: {
    borderColor: colors.mint,
    backgroundColor: colors.mint,
  },
  badgePreviewMintText: {
    color: colors.mintInk,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkDim,
  },
});
