import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';
import { colors } from '../constants/theme';
import { GAMES } from '../content/games';
import { FREE_ROUNDS_PER_DAY } from '../hooks/useDailyRounds';
import { usePurchases } from '../hooks/usePurchases';

const PURCHASES_AVAILABLE = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Dev-only placeholder pricing so the paywall is reviewable before RevenueCat products exist.
 * Never shown in a production runtime — see README for RevenueCat setup.
 */
const DEV_PREVIEW_PLANS: PlanOption[] = [
  { id: 'preview-monthly', label: 'Monthly', sublabel: 'Cancel anytime', price: '$3.99', pkg: null },
  { id: 'preview-yearly', label: 'Yearly', sublabel: 'Best value — cancel anytime', price: '$9.99', pkg: null },
  { id: 'preview-lifetime', label: 'Lifetime access', sublabel: 'Pay once, own it forever', price: '$19.99', pkg: null },
];

/** Initial-selection preference when a real offering has more than one package. */
const PACKAGE_TYPE_PRIORITY = [PACKAGE_TYPE.ANNUAL, PACKAGE_TYPE.LIFETIME, PACKAGE_TYPE.MONTHLY];

interface PlanOption {
  id: string;
  label: string;
  sublabel?: string;
  price: string;
  pkg: PurchasesPackage | null;
}

function packageLabel(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case PACKAGE_TYPE.LIFETIME:
      return 'Lifetime access';
    case PACKAGE_TYPE.ANNUAL:
      return 'Yearly';
    case PACKAGE_TYPE.MONTHLY:
      return 'Monthly';
    case PACKAGE_TYPE.WEEKLY:
      return 'Weekly';
    default:
      return pkg.product.title;
  }
}

function packageSublabel(pkg: PurchasesPackage): string | undefined {
  return pkg.packageType === PACKAGE_TYPE.LIFETIME ? 'Pay once, own it forever' : 'Cancel anytime';
}

function preferredInitialPlanId(plans: PlanOption[]): string | null {
  for (const type of PACKAGE_TYPE_PRIORITY) {
    const match = plans.find((plan) => plan.pkg?.packageType === type);
    if (match) return match.id;
  }
  return plans[0]?.id ?? null;
}

export default function GoProScreen() {
  const router = useRouter();
  const { isReady, isPro, offering, error, purchase, restore, refresh } = usePurchases();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const planListY = useRef(0);
  const hasAutoScrolled = useRef(false);

  const plans = useMemo<PlanOption[]>(() => {
    if (offering && offering.availablePackages.length > 0) {
      return offering.availablePackages.map((pkg) => ({
        id: pkg.identifier,
        label: packageLabel(pkg),
        sublabel: packageSublabel(pkg),
        price: pkg.product.priceString,
        pkg,
      }));
    }
    // Placeholder App Store prices are only acceptable in development preview builds.
    return __DEV__ ? DEV_PREVIEW_PLANS : [];
  }, [offering]);

  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.id === selectedId)) {
      setSelectedId(preferredInitialPlanId(plans));
    }
  }, [plans, selectedId]);

  // Jump straight to pricing when arriving to buy — no reason to make the sale wait behind the feature list.
  useEffect(() => {
    if (hasAutoScrolled.current || !isReady || isPro || !PURCHASES_AVAILABLE || plans.length === 0) return;
    hasAutoScrolled.current = true;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(planListY.current - 16, 0), animated: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [isReady, isPro, plans.length]);

  const selectedPlan = plans.find((p) => p.id === selectedId) ?? null;
  const isLivePricing = plans[0]?.pkg != null;

  const handleContinue = async () => {
    if (!selectedPlan) return;
    if (!selectedPlan.pkg) {
      Alert.alert(
        'Preview pricing',
        'This is the recommended price — real purchases turn on once RevenueCat is connected (see README).'
      );
      return;
    }
    setPurchasing(true);
    const result = await purchase(selectedPlan.pkg);
    setPurchasing(false);
    if (result.error) {
      Alert.alert('Purchase failed', result.error);
    } else if (!result.cancelled) {
      Alert.alert('Welcome to Pro', 'Unlimited rounds on every game. Enjoy!');
      router.back();
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restore();
    setRestoring(false);
    Alert.alert(result.error ? 'Restore' : 'Restored', result.error ?? 'Your purchase has been restored.');
  };

  const handleRetry = async () => {
    setRetrying(true);
    await refresh();
    setRetrying(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Go Pro</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>UNLIMITED PLAY</Text>
        <Text style={styles.title}>Every game.{'\n'}No daily limit.</Text>
        <Text style={styles.subtitle}>
          Bomb Pass and Chameleon give you {FREE_ROUNDS_PER_DAY} free rounds a day. Every other game is Pro
          only. Go Pro for unlimited rounds on everything.
        </Text>

        <View style={styles.featureList}>
          {GAMES.map((game) => (
            <View key={game.id} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>🎲</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{game.title}</Text>
                <Text style={styles.featureSubtitle}>
                  {game.hasFreeTrial ? `${FREE_ROUNDS_PER_DAY} free rounds/day without Pro` : 'Pro only'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {isPro ? (
          <View style={styles.proCard}>
            <Text style={styles.proCardTitle}>You're Pro 🎉</Text>
            <Text style={styles.proCardBody}>Unlimited rounds on every game, no daily limit.</Text>
          </View>
        ) : !PURCHASES_AVAILABLE ? (
          <View style={styles.proCard}>
            <Text style={styles.proCardBody}>Purchases are only available in the iOS and Android apps.</Text>
          </View>
        ) : !isReady ? (
          <ActivityIndicator color={colors.spark} style={styles.loader} />
        ) : plans.length === 0 ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableTitle}>Pricing temporarily unavailable</Text>
            <Text style={styles.unavailableBody}>
              {error ?? "We couldn't load pricing from the App Store. Check your connection and try again."}
            </Text>
            <Pressable style={styles.retryButton} onPress={handleRetry} disabled={retrying}>
              {retrying ? (
                <ActivityIndicator color={colors.flameInk} />
              ) : (
                <Text style={styles.retryButtonText}>Try Again</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={styles.planList}
              onLayout={(e) => {
                planListY.current = e.nativeEvent.layout.y;
              }}
            >
              {plans.map((plan) => {
                const selected = plan.id === selectedId;
                return (
                  <Pressable
                    key={plan.id}
                    style={[styles.planCard, selected && styles.planCardSelected]}
                    onPress={() => setSelectedId(plan.id)}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.planText}>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      {plan.sublabel && <Text style={styles.planSublabel}>{plan.sublabel}</Text>}
                    </View>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </Pressable>
                );
              })}
            </View>
            {!isLivePricing && (
              <Text style={styles.previewNote}>
                Dev preview pricing — connect RevenueCat to enable real purchases.
              </Text>
            )}

            <Pressable style={styles.ctaButton} onPress={handleContinue} disabled={purchasing}>
              {purchasing ? (
                <ActivityIndicator color={colors.flameInk} />
              ) : (
                <Text style={styles.ctaButtonText}>
                  {isLivePricing ? `Go Pro · ${selectedPlan?.price ?? ''}` : 'Go Pro'}
                </Text>
              )}
            </Pressable>
            <Text style={styles.billingNote}>
              Charged to your App Store account. Subscriptions renew automatically until canceled.
              Purchases can be restored on any device signed in to the same App Store account.
            </Text>
          </>
        )}

        <View style={styles.footerLinks}>
          {!isPro && PURCHASES_AVAILABLE && (
            <>
              <Pressable onPress={handleRestore} disabled={restoring}>
                <Text style={styles.footerLinkText}>{restoring ? 'Restoring…' : 'Restore Purchases'}</Text>
              </Pressable>
              <Text style={styles.footerDivider}>|</Text>
            </>
          )}
          <Pressable onPress={() => router.push('/legal/terms')}>
            <Text style={styles.footerLinkText}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.footerDivider}>|</Text>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.flame,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  featureList: {
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,209,102,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  proCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.mint,
    borderRadius: 18,
    padding: 20,
  },
  proCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  proCardBody: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
  },
  loader: {
    marginTop: 20,
  },
  unavailableCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  unavailableTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  unavailableBody: {
    fontSize: 14,
    color: colors.inkDim,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    backgroundColor: colors.spark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.flameInk,
  },
  planList: {
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  planCardSelected: {
    borderColor: colors.spark,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.spark,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.spark,
  },
  planText: {
    flex: 1,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  planSublabel: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.spark,
  },
  previewNote: {
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 10,
  },
  ctaButton: {
    backgroundColor: colors.spark,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 18,
  },
  ctaButtonText: {
    color: colors.flameInk,
    fontSize: 17,
    fontWeight: '800',
  },
  billingNote: {
    fontSize: 11,
    color: colors.inkFaint,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 28,
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkDim,
  },
  footerDivider: {
    fontSize: 13,
    color: colors.inkFaint,
  },
});
