import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';
import { CategoryBlitzSessionProvider } from '../../hooks/useCategoryBlitzSession';

export default function CategoryBlitzLayout() {
  return (
    <CategoryBlitzSessionProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </CategoryBlitzSessionProvider>
  );
}
