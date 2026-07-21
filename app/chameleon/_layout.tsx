import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';
import { ChameleonSessionProvider } from '../../hooks/useChameleonSession';

export default function ChameleonLayout() {
  return (
    <ChameleonSessionProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </ChameleonSessionProvider>
  );
}
