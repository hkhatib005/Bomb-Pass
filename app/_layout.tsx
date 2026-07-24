import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { AuthProvider } from '../hooks/useAuth';
import { DailyRoundsProvider } from '../hooks/useDailyRounds';
import { PurchasesProvider } from '../hooks/usePurchases';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PurchasesProvider>
          <DailyRoundsProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
          </DailyRoundsProvider>
        </PurchasesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
