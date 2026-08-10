# House Party

Party games for a phone that gets passed around. Built with Expo + React Native.

## Run locally

```
npm install
cp .env.example .env   # fill in the keys below
npx expo start
```

## EAS cloud builds also need these keys — separately from `.env`

`.env` is git-ignored and only exists on your machine, so `eas build` (which clones the repo and
builds in Expo's cloud) never sees it. Without this step, cloud builds compile with empty
Supabase/RevenueCat keys — sign-in and purchases silently show their "not configured" fallback
UI instead of erroring loudly, so this is easy to miss until you actually test a real build.

Mirror every `EXPO_PUBLIC_*` value from `.env` into EAS itself, once per environment you build with
(at minimum `production`):

```
npx eas-cli env:create --scope project --environment production \
  --name EXPO_PUBLIC_SUPABASE_URL --value "<your value>" \
  --type string --visibility plaintext --non-interactive

npx eas-cli env:create --scope project --environment production \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<your value>" \
  --type string --visibility plaintext --non-interactive

npx eas-cli env:create --scope project --environment production \
  --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "<your value>" \
  --type string --visibility plaintext --non-interactive
```

Check what's already set with `npx eas-cli env:list --environment production`. If you rotate any
key (e.g. a new Supabase project), update it here too, or future cloud builds will silently revert
to the old value.

## Account (Supabase + Sign in with Apple)

Sign-in lives in `app/account.tsx`, backed by `lib/supabase.ts` / `hooks/useAuth.tsx`. Auth is
**Sign in with Apple only** — there is no manual email/password sign-up. Signing in is optional;
every game works fully signed out, and Apple sign-in only exists to sync a Pro unlock and display
name across devices.

**Purchases never require signing in.** StoreKit/RevenueCat purchases and restores work fully
anonymously to keep checkout friction low — see "Payments (RevenueCat)" below for how identity
and restore interact.

1. Create a project at supabase.com.
2. Project Settings → API → copy the **Project URL** and **anon public** key into `.env` as
   `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Authentication → Providers → enable **Apple**, per Supabase's
   [Sign in with Apple guide](https://supabase.com/docs/guides/auth/social-login/auth-apple).
4. In your Apple Developer account, enable the **Sign in with Apple** capability for
   `com.bombpass.app` (already configured in `app.json` via `expo-apple-authentication`).
5. No database tables are required — display name is stored on the auth user itself
   (`user_metadata.display_name`).
6. Deploy the delete-account function (lets users self-delete from Account → Delete Account):
   ```
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase functions deploy delete-account
   ```
   No extra secrets needed — Supabase auto-injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` into every Edge Function.

## Payments (RevenueCat)

Paywall lives in `app/go-pro.tsx`, backed by `hooks/usePurchases.tsx`.

1. Create a project at revenuecat.com and connect it to your App Store Connect / Google Play
   Console app (`com.bombpass.app`).
2. Create the products in App Store Connect / Play Console: one non-consumable ("lifetime unlock")
   and one auto-renewing subscription.
3. In RevenueCat: add both products to an **Offering**, and attach both to a single **Entitlement**
   named `pro` (the app checks `customerInfo.entitlements.active.pro`).
4. Project settings → API keys → copy the public iOS and Android keys into `.env` as
   `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
5. Purchases only work in dev/production builds on a real device or simulator with a sandbox
   account — not in Expo Go, and not on web.

Until these are configured, sign-in and purchases will show a console warning and fail gracefully;
Bomb Pass and Chameleon still work within their free daily allowance regardless. In a **development**
build, Go Pro falls back to preview pricing (clearly marked as dev-only) so the paywall UI is
reviewable before real products exist. In a **production** build it never shows fake prices — if
RevenueCat has no current offering, Go Pro shows a "temporarily unavailable" card with a retry
button instead.

**Recommended pricing** (used as the dev preview pricing shown above): **$3.99/month**,
**$9.99/year**, or **$19.99 one-time** for lifetime access. Set up all three as an Offering in
RevenueCat, each attached to the `pro` entitlement, to match.

**Free tier**: Bomb Pass and Chameleon each get their own 2 free rounds a day (independent pools,
not shared) via `hooks/useDailyRounds.tsx` / `Game.hasFreeTrial` in `content/games.ts`, reset at
local midnight.
Every other game (Most Likely To, Would You Rather, Truth or Dare, Category Blitz) is Pro-only —
no free rounds at all. Pro removes both restrictions everywhere.

**Identity policy — Apple sign-in is optional, purchases are not gated behind it:**

- By default every customer is an **anonymous RevenueCat App User ID** (a random ID StoreKit/the
  RevenueCat SDK generates on-device). Purchasing and restoring both work fully signed out —
  restoration is handled by StoreKit itself based on the App Store account on the device, not by
  our own account system.
- If a user *optionally* signs in with Apple, `hooks/usePurchases.tsx` calls `Purchases.logIn(user.id)`
  using the **Supabase user UUID** as the RevenueCat App User ID. This doesn't change how purchases
  or restores work — it's purely additive, giving that user extra cross-device profile syncing
  (their Pro entitlement and RevenueCat customer record follow their Supabase account instead of
  staying tied to one device's anonymous ID).
- This means a given person's purchase history can briefly exist under an anonymous ID and later
  get merged into their signed-in Supabase-UUID identity the first time they sign in. RevenueCat's
  **Project settings → Restore Behavior** should stay set to **"Transfer to new App User ID"** (the
  default) so that merge happens automatically — only switch it to "Keep existing App User ID" if
  you intentionally want a stricter, non-transferring account-recovery policy instead.

## Admin — viewing accounts, subscriptions, and comping free Pro

There's no separate admin panel in the app. Instead, use the dashboards you already get for free:

- **Supabase dashboard** (`supabase.com/dashboard` → your project → Authentication → Users) —
  every signed-up account: email, signup date, last sign-in. Delete or ban anyone from here.
- **RevenueCat dashboard** (`app.revenuecat.com` → your project → Customers) — search any user
  (by email or their Supabase user id, which is also their RevenueCat App User ID) to see their
  subscription/purchase history. Use the **Grant** button on a customer's page to give them free
  promotional Pro access for a chosen duration (or lifetime) — no code required.

## Legal pages

`app/legal/terms.tsx` and `app/legal/privacy.tsx` are the in-app Terms of Use / Privacy Policy
screens, linked from Settings and the Go Pro paywall. **Apple requires a publicly hosted privacy
policy URL** in App Store Connect (an in-app screen alone isn't enough) — static, ready-to-host
copies are in `legal/privacy.html` and `legal/terms.html`. Push them to GitHub Pages (or any static
host) and put that URL in App Store Connect's "Privacy Policy URL" field and Play Console's Data
Safety section.

Support/contact email across the in-app screens and the HTML files is `hkhatib005@gmail.com`.
