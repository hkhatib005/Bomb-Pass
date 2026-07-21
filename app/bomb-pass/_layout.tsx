import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';
import { BombPassSessionProvider } from '../../hooks/useBombPassSession';

export default function BombPassLayout() {
  return (
    <BombPassSessionProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </BombPassSessionProvider>
  );
}
