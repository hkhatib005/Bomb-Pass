import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { GAMES } from '../content/games';
import type { Game } from '../types/game';

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (game: Game) => {
    if (game.route) {
      router.push(game.route);
    }
    // Games with no route yet (locked or not-yet-built) are no-ops until they ship.
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.eyebrow}>House Party</Text>
      <Text style={styles.title}>Pick a game.{'\n'}Pass the phone.</Text>

      <FlatList
        data={GAMES}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isPlayable = Boolean(item.route);
          const isFeatured = index === 0;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                isFeatured && styles.cardFeatured,
                pressed && isPlayable && styles.cardPressed,
                !isPlayable && styles.cardDimmed,
              ]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
                {item.isFree ? (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                ) : (
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Text style={styles.cardMeta}>
                {item.minPlayers}–{item.maxPlayers} players
              </Text>
            </Pressable>
          );
        }}
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
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.flame,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginTop: 6,
    marginBottom: 20,
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
  freeBadge: {
    backgroundColor: colors.mint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freeBadgeText: {
    color: colors.mintInk,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.spark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proBadgeText: {
    color: colors.spark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
