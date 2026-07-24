import { LegalPage, Section } from '../../components/LegalPage';

const CONTACT_EMAIL = 'support@bombpass.app';

export default function PrivacyScreen() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="July 23, 2026">
      <Section title="Overview">
        House Party is built to work fully offline with no account required. This policy covers the small amount
        of data collected if you choose to sign in or make a purchase.
      </Section>

      <Section title="Information We Collect">
        • Account info: if you sign in, we store your email address and the display name you choose.{'\n'}
        • Purchase status: whether you've unlocked Pro, and your subscription status, managed by our payment
        provider (RevenueCat) and the App Store or Google Play.{'\n'}
        • We do not collect location data, contacts, photos, or microphone/camera data, and we don't run
        advertising or third-party analytics/tracking SDKs.
      </Section>

      <Section title="How We Use It">
        Account info is used only to let you sign in and, if we add cross-device sync in the future, to restore
        your Pro unlock on another device. We don't sell your data or share it for advertising.
      </Section>

      <Section title="Third-Party Services">
        • Supabase — hosts authentication and account data.{'\n'}
        • RevenueCat — manages in-app purchase and subscription status.{'\n'}
        • Apple App Store / Google Play — process all payments; we never see your card details.
      </Section>

      <Section title="Data Retention & Deletion">
        You can permanently delete your account and its data at any time from Account → Delete Account. This
        removes your account record immediately; it does not cancel an active subscription, which is managed
        separately through your Apple ID or Google Play account.
      </Section>

      <Section title="Children's Privacy">
        House Party is not directed at children under 13, and we don't knowingly collect personal information
        from them. If you believe a child has provided us information, contact us and we'll delete it.
      </Section>

      <Section title="Security">
        We use industry-standard practices (via Supabase) to protect your account data, but no method of
        transmission or storage is 100% secure.
      </Section>

      <Section title="Changes to This Policy">
        We may update this policy occasionally. Material changes will be reflected in the "Last updated" date
        above.
      </Section>

      <Section title="Contact">
        Questions about this policy or your data? Reach us at {CONTACT_EMAIL}.
      </Section>
    </LegalPage>
  );
}
