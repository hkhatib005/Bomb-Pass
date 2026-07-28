import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainMenu } from '../components/MainMenu';
import { colors } from '../constants/theme';
import { GAMES } from '../content/games';
import { useDailyRounds } from '../hooks/useDailyRounds';
import { usePurchases } from '../hooks/usePurchases';
import type { Game } from '../types/game';

function GameCard({ game, index }: { game: Game; index: number }) {
  const router = useRouter();
  const { isPro } = usePurchases();
  const { loaded, remaining, canPlay } = useDailyRounds(game.id, isPro);

  const isUnbuilt = !game.route;
  const isFeatured = index === 0;
  // Trial games (Bomb Pass, Chameleon) draw from the shared daily pool.
  // Every other game is Pro-only and ignores that pool entirely.
  const isPlayable = game.hasFreeTrial ? canPlay : isPro;
  const isLockedOut = game.hasFreeTrial ? loaded && !canPlay : !isPro;

  const handlePress = () => {
    if (!isPlayable) {
      router.push('/go-pro');
      return;
    }
    if (game.route) {
      router.push(game.route);
      return;
    }
    Alert.alert('Coming soon', `${game.title} is still in development.`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isFeatured && styles.cardFeatured,
        pressed && styles.cardPressed,
        (isUnbuilt || isLockedOut) && styles.cardDimmed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
        {isPro ? (
          <View style={styles.unlimitedBadge}>
            <Text style={styles.unlimitedBadgeText}>UNLIMITED</Text>
          </View>
        ) : game.hasFreeTrial ? (
          <View style={[styles.roundsBadge, isLockedOut && styles.roundsBadgeLocked]}>
            <Text style={[styles.roundsBadgeText, isLockedOut && styles.roundsBadgeTextLocked]}>
              {!loaded ? '···' : remaining > 0 ? `${remaining} LEFT` : 'LOCKED'}
            </Text>
          </View>
        ) : (
          <View style={styles.roundsBadge}>
            <Text style={styles.roundsBadgeText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle}>{game.title}</Text>
      <Text style={styles.cardDescription}>{game.description}</Text>
      <Text style={styles.cardMeta}>
        {game.minPlayers}–{game.maxPlayers} players
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>House Party</Text>
          <Text style={styles.title}>Pick a game.{'\n'}Pass the phone.</Text>
        </View>
        <MainMenu />
      </View>

      <FlatList
        data={GAMES}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <GameCard game={item} index={index} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.flame,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginTop: 6,
  },
  list: {
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
  },
  cardFeatured: {
    borderColor: colors.flame,
  },
  cardPressed: {
    backgroundColor: colors.cardRaised,
  },
  cardDimmed: {
    opacity: 0.55,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkFaint,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
    marginTop: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.inkDim,
    marginTop: 6,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unlimitedBadge: {
    backgroundColor: colors.mint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unlimitedBadgeText: {
    color: colors.mintInk,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roundsBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.spark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roundsBadgeLocked: {
    borderColor: colors.inkFaint,
  },
  roundsBadgeText: {
    color: colors.spark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roundsBadgeTextLocked: {
    color: colors.inkFaint,
  },
});
