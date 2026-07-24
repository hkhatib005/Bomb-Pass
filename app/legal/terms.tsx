import { LegalPage, Section } from '../../components/LegalPage';

const CONTACT_EMAIL = 'support@bombpass.app';

export default function TermsScreen() {
  return (
    <LegalPage title="Terms of Use" updatedAt="July 23, 2026">
      <Section title="1. Acceptance of Terms">
        By downloading, installing, or using House Party (the "App"), you agree to these Terms of Use. If you
        don't agree, please don't use the App.
      </Section>

      <Section title="2. The App">
        House Party is a collection of local, pass-the-phone party games. Some games are free; others require a
        one-time purchase or subscription ("Pro") to unlock.
      </Section>

      <Section title="3. Accounts">
        Creating an account is optional. If you sign in, you're responsible for keeping your credentials secure
        and for all activity under your account. You can delete your account at any time from Account settings —
        this permanently removes your account and profile data.
      </Section>

      <Section title="4. Purchases & Subscriptions">
        Pro unlocks are billed through the Apple App Store or Google Play, using the payment method on file with
        your store account. Prices are shown before purchase and may include a one-time "lifetime" unlock or an
        auto-renewing subscription.{'\n\n'}
        Subscriptions renew automatically unless canceled at least 24 hours before the end of the current
        period. You can manage or cancel a subscription anytime in your Apple ID or Google Play account settings
        — not in the App itself. Refunds are handled by Apple or Google under their respective policies; we don't
        process refunds directly.
      </Section>

      <Section title="5. Acceptable Use">
        Don't use the App to harass others, violate any law, reverse-engineer the App, or interfere with its
        normal operation.
      </Section>

      <Section title="6. Content">
        Game prompts and categories are provided for entertainment. We don't control what players say or do while
        playing — please play responsibly and considerately.
      </Section>

      <Section title="7. Disclaimer & Limitation of Liability">
        The App is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we
        aren't liable for any indirect, incidental, or consequential damages arising from your use of the App.
      </Section>

      <Section title="8. Changes">
        We may update these Terms from time to time. Continuing to use the App after changes take effect means
        you accept the updated Terms.
      </Section>

      <Section title="9. Contact">
        Questions about these Terms? Reach us at {CONTACT_EMAIL}.
      </Section>
    </LegalPage>
  );
}
