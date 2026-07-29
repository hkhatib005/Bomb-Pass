import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './useAuth';

/** RevenueCat entitlement identifier that both the lifetime unlock and the subscription grant. */
const PRO_ENTITLEMENT_ID = 'pro';

/** Accounts that always get Pro, regardless of purchase status — for testing/admin use. */
const ADMIN_EMAILS = ['leje0z1@aol.com'];

const REVENUECAT_API_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
      : undefined;

/** RevenueCat has no web SDK — purchases are a no-op there and everything reads as not-pro. */
const PURCHASES_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

interface PurchaseResult {
  error: string | null;
  cancelled?: boolean;
}

interface PurchasesContextValue {
  isReady: boolean;
  isPro: boolean;
  offering: PurchasesOffering | null;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(!PURCHASES_SUPPORTED);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const configured = useRef(false);

  useEffect(() => {
    if (!PURCHASES_SUPPORTED) return;
    if (!REVENUECAT_API_KEY) {
      console.warn('Missing RevenueCat API key — set EXPO_PUBLIC_REVENUECAT_IOS_KEY / _ANDROID_KEY in .env.');
      setIsReady(true);
      return;
    }
    if (configured.current) return;
    configured.current = true;

    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    Purchases.addCustomerInfoUpdateListener(setCustomerInfo);

    Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()])
      .then(([info, offerings]) => {
        setCustomerInfo(info);
        setOffering(offerings.current);
      })
      .finally(() => setIsReady(true));
  }, []);

  // Tie the RevenueCat app-user to the Supabase account so a purchase made
  // signed-in on one device restores automatically when signed in elsewhere.
  useEffect(() => {
    if (!PURCHASES_SUPPORTED || !configured.current) return;
    if (user) {
      Purchases.logIn(user.id)
        .then(({ customerInfo: info }) => setCustomerInfo(info))
        .catch(() => {});
    } else {
      // No-op (and throws) when the SDK's current user is already anonymous,
      // which is the common case: launching signed-out, or signing out.
      Purchases.logOut()
        .then(setCustomerInfo)
        .catch(() => {});
    }
  }, [user?.id]);

  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));

  const value = useMemo<PurchasesContextValue>(
    () => ({
      isReady,
      isPro: isAdmin || customerInfo?.entitlements.active[PRO_ENTITLEMENT_ID] != null,
      offering,
      purchase: async (pkg) => {
        if (!PURCHASES_SUPPORTED) return { error: 'Purchases are only available on iOS and Android.' };
        try {
          const { customerInfo: info } = await Purchases.purchasePackage(pkg);
          setCustomerInfo(info);
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
    }),
    [isReady, customerInfo, offering, isAdmin]
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
