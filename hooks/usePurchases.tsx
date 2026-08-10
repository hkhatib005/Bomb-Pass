import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './useAuth';

/** RevenueCat entitlement identifier that both the lifetime unlock and the subscription grant. */
const PRO_ENTITLEMENT_ID = 'pro';

const REVENUECAT_API_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
      : undefined;

/** This app intentionally supports native StoreKit/Play purchases only — purchases are a no-op on web and everything reads as not-pro. */
const PURCHASES_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

const UNREACHABLE_ERROR = 'Could not reach the store. Check your connection and try again.';

interface PurchaseResult {
  error: string | null;
  cancelled?: boolean;
}

interface PurchasesContextValue {
  isReady: boolean;
  isPro: boolean;
  offering: PurchasesOffering | null;
  /** Set when RevenueCat isn't configured, or the last fetch/refresh failed — surface this instead of a silent blank state. */
  error: string | null;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  /** Re-fetches customer info and offerings — used to retry after a failed initial load. */
  refresh: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

async function fetchPurchasesState(): Promise<{ info: CustomerInfo; offering: PurchasesOffering | null }> {
  const [info, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
  return { info, offering: offerings.current };
}

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(!PURCHASES_SUPPORTED);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = useRef(false);

  useEffect(() => {
    if (!PURCHASES_SUPPORTED) return;
    if (!REVENUECAT_API_KEY) {
      console.warn('Missing RevenueCat API key — set EXPO_PUBLIC_REVENUECAT_IOS_KEY / _ANDROID_KEY in .env.');
      setError('Purchases aren’t configured yet.');
      setIsReady(true);
      return;
    }
    if (!configured.current) {
      configured.current = true;
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    }

    Purchases.addCustomerInfoUpdateListener(setCustomerInfo);

    fetchPurchasesState()
      .then(({ info, offering: current }) => {
        setCustomerInfo(info);
        setOffering(current);
        setError(null);
      })
      .catch((err: any) => setError(err?.message ?? UNREACHABLE_ERROR))
      .finally(() => setIsReady(true));

    return () => {
      Purchases.removeCustomerInfoUpdateListener(setCustomerInfo);
    };
  }, []);

  // Tie the RevenueCat app-user to the Supabase account so a purchase made
  // signed-in on one device restores automatically when signed in elsewhere.
  useEffect(() => {
    if (!PURCHASES_SUPPORTED || !configured.current) return;
    let cancelled = false;

    if (user) {
      Purchases.logIn(user.id)
        .then(({ customerInfo: info }) => {
          if (!cancelled) setCustomerInfo(info);
        })
        .catch((err: any) => console.warn('RevenueCat logIn failed:', err?.message ?? err));
    } else {
      // logOut() throws when the SDK's current user is already anonymous
      // (the common case: launching signed-out), so check first and skip it.
      Purchases.isAnonymous()
        .then((isAnonymous) => {
          if (cancelled || isAnonymous) return;
          return Purchases.logOut().then((info) => {
            if (!cancelled) setCustomerInfo(info);
          });
        })
        .catch((err: any) => console.warn('RevenueCat logOut failed:', err?.message ?? err));
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const value = useMemo<PurchasesContextValue>(
    () => ({
      isReady,
      isPro: customerInfo?.entitlements.active[PRO_ENTITLEMENT_ID] != null,
      offering,
      error,
      purchase: async (pkg) => {
        if (!PURCHASES_SUPPORTED) return { error: 'Purchases are only available on iOS and Android.' };
        try {
          const { customerInfo: info } = await Purchases.purchasePackage(pkg);
          setCustomerInfo(info);
          if (info.entitlements.active[PRO_ENTITLEMENT_ID] == null) {
            return { error: 'Purchase completed, but Pro isn’t active yet. Try restoring purchases.' };
          }
          return { error: null };
        } catch (err: any) {
          if (err?.userCancelled) return { error: null, cancelled: true };
          return { error: err?.message ?? 'Purchase failed.' };
        }
      },
      restore: async () => {
        if (!PURCHASES_SUPPORTED) return { error: 'Purchases are only available on iOS and Android.' };
        try {
          const info = await Purchases.restorePurchases();
          setCustomerInfo(info);
          const restored = info.entitlements.active[PRO_ENTITLEMENT_ID] != null;
          return { error: restored ? null : 'No previous purchases found for this account.' };
        } catch (err: any) {
          return { error: err?.message ?? 'Restore failed.' };
        }
      },
      refresh: async () => {
        if (!PURCHASES_SUPPORTED || !configured.current) return;
        try {
          const { info, offering: current } = await fetchPurchasesState();
          setCustomerInfo(info);
          setOffering(current);
          setError(null);
        } catch (err: any) {
          setError(err?.message ?? UNREACHABLE_ERROR);
        }
      },
    }),
    [isReady, customerInfo, offering, error]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return ctx;
}
