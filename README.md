Save this as README.md in your project root — it doubles as a spec for Claude Code and as portfolio documentation.

Party Games
An offline-first party game app for people in the same room. One phone, passed around, no accounts, no wifi.
Overview
A bundle of pass-the-phone party games built with Expo and React Native. Two games are free; the rest unlock with a subscription. Everything runs locally — the only network call in the app is to RevenueCat for subscription status.
Tech Stack

Expo (React Native, TypeScript)
expo-router — file-based navigation
expo-av — tick and explosion audio
expo-haptics — pass and detonation feedback
expo-keep-awake — prevents screen sleep during rounds
AsyncStorage — onboarding flag, player names, settings
react-native-purchases (RevenueCat) — subscriptions

Games
Bomb Pass (free)
A category appears. Say an answer, tap, pass the phone. The fuse is randomized between 15 and 45 seconds and hidden from players. Whoever's holding it when it goes off loses a life. Three lives each, last player standing wins.
Chameleon (free)
Sixteen words on a grid. Everyone knows the secret word except the chameleon. Each player says one word connected to it — too obvious and the chameleon guesses, too vague and you look guilty. Discuss, vote, reveal.
Locked games
Additional games unlock with Pro.
Project Structure
/app                 expo-router screens
  /games
    /bomb-pass
    /chameleon
  onboarding.tsx
  paywall.tsx
  index.tsx
/components          shared UI
/hooks               game logic, isolated from components
/content
  categories.ts      category data
  games.ts           game registry, free/locked flags
/context
  SubscriptionContext.tsx
/types               shared TypeScript types
/assets
  /audio
Key Implementation Notes
Timer accuracy. The bomb fuse is stored as an absolute end timestamp (Date.now() + fuse), never a decrementing counter. A countdown that ticks down will pause or drift when the app backgrounds. Elapsed time is checked on a 100ms interval.
Fuse randomization. Range is 15000–45000ms, re-rolled every round. Tick audio accelerates as time runs out, with slight randomness in the acceleration curve so players can't learn to time it.
Pass cooldown. Roughly 1000ms after each pass before the next tap registers, so the phone can't be hot-potatoed without anyone answering.
Answer validation. None. The group polices answers — speech recognition would misfire and kill the pace.
Elimination. Lives-based rather than instant knockout, so nobody sits out for five minutes after an early loss.
Monetization
PlanPriceMonthly$4.99 (3-day free trial)Annual$29.99
One RevenueCat entitlement: pro. Prices are read from the RevenueCat offering at runtime rather than hardcoded, so they localize correctly.
Paywall requirements: annual pre-selected, trial terms in plain text, Restore Purchases button, and a close button visible immediately on mount — Apple rejects paywalls with hidden or delayed dismissals.
Design Principles

Ten seconds to play. Open the app, tap a game, go. No login, no tutorial gate.
Offline always. Parties happen in basements with bad wifi.
Audio carries the tension. For Bomb Pass specifically, the ticking is most of the experience.
Large tap targets. People are moving fast and handing a phone around.
No permissions, no tracking, no analytics.

Setup
bashnpm install
npx expo start
RevenueCat requires a development build rather than Expo Go:
bashnpx expo prebuild
npx expo run:ios
Add your RevenueCat API keys to .env before building:
EXPO_PUBLIC_RC_IOS_KEY=
EXPO_PUBLIC_RC_ANDROID_KEY=
Content Roadmap
Categories are the product. Bomb Pass needs 300+ to survive repeat play, mixing easy ones that keep the pace up with hard ones that create panic. Packs: General, Food, Sports, Geography, Movies, Kids, Hard Mode.
Status
In development.
