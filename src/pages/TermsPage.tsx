import LegalPage, { LegalSection, P, UL } from './LegalPage';

export default function TermsPage() {
  return (
    <LegalPage type="terms">
      <LegalSection title="1. Acceptance of Terms">
        <P>
          By signing up for an account, scanning a Kaza check-in form, or using the Kaza dashboard,
          you agree to these Terms of Service. If you do not agree, do not use the platform.
        </P>
        <P>
          These terms constitute a binding agreement between you (the "User") and Sybella Systems
          ("Kaza", "we", "us"), the operator of the platform.
        </P>
      </LegalSection>

      <LegalSection title="2. Service Description">
        <P>
          Kaza is a digital notary register platform that allows offices to generate QR-code-based
          check-in forms, collect client information and signatures on mobile devices, manage a
          live queue, and export records for filing. The platform is offered in three tiers:
          Free-Trial, Basic, and Professional, plus a custom Enterprise option.
        </P>
      </LegalSection>

      <LegalSection title="3. Account Registration">
        <P>
          To use Kaza as an office, you must register with a valid email address and create a password.
          You are responsible for maintaining the security of your account credentials and for all
          activity under your account.
        </P>
        <P>
          Team members invited by an office admin are issued their own credentials. The inviting
          office is responsible for managing team access and removing members who no longer require access.
        </P>
      </LegalSection>

      <LegalSection title="4. Plan Tiers and Limits">
        <P>Kaza offers the following plans:</P>
        <UL>
          <li><strong>Free-Trial</strong> — 14-day full access, no payment required</li>
          <li><strong>Basic (15,000 RWF/month)</strong> — 200 requests/month, 3 categories, 1 branch, CSV export</li>
          <li><strong>Professional (45,000 RWF/month)</strong> — Unlimited requests, all categories, 5 branches, team members, analytics, reports</li>
          <li><strong>Enterprise</strong> — Custom pricing, contact us</li>
        </UL>
        <P>
          Monthly request limits reset automatically at the start of each billing cycle. If you exceed
          your plan's request limit, the intake form will be locked until the next cycle or until you upgrade.
        </P>
      </LegalSection>

      <LegalSection title="5. Payment and Billing">
        <P>
          Subscriptions are paid via MTN MoMoPay. After selecting a plan, you must send payment and
          share your confirmation screenshot via WhatsApp to +250 723 776 020. Your plan is activated
          manually by Sybella Systems once payment is confirmed.
        </P>
        <P>
          Subscriptions are billed monthly. There are no automatic recurring charges — you must
          initiate each payment. If payment is not received before your subscription expires, your
          account will be locked and you will see the renewal screen.
        </P>
        <P>
          Refunds are issued at the discretion of Sybella Systems. If you experience a service
          interruption due to a platform outage, contact us to discuss a prorated credit.
        </P>
      </LegalSection>

      <LegalSection title="6. Acceptable Use">
        <P>You agree not to:</P>
        <UL>
          <li>Use Kaza to collect data for purposes other than legitimate office check-in and record management</li>
          <li>Submit false, misleading, or fraudulent client information</li>
          <li>Share your account credentials with unauthorized users</li>
          <li>Attempt to access, modify, or disrupt another office's data or the platform's infrastructure</li>
          <li>Use the platform to store data that violates Rwandan law or international regulations</li>
          <li>Reverse-engineer, decompile, or attempt to extract the source code of the platform</li>
        </UL>
      </LegalSection>

      <LegalSection title="7. Client Data Ownership">
        <P>
          The client data collected through Kaza belongs to the receiving office, not to Sybella Systems.
          The office is responsible for the accuracy, legality, and proper handling of the data it collects.
          Sybella Systems acts as a data processor and does not claim ownership of client records.
        </P>
        <P>
          Offices are responsible for complying with applicable data protection laws in Rwanda,
          including any obligations to inform clients about data collection.
        </P>
      </LegalSection>

      <LegalSection title="8. Service Availability">
        <P>
          We strive for high uptime but do not guarantee uninterrupted service. The platform may
          experience downtime for maintenance, updates, or factors outside our control (network outages,
          hosting provider incidents). We are not liable for any business losses resulting from
          service downtime.
        </P>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <P>
          Kaza is provided "as is" without warranties of any kind. Sybella Systems is not liable for
          indirect, incidental, or consequential damages arising from the use of the platform. Our
          total liability for any claim is limited to the amount you have paid us in the preceding
          3 months.
        </P>
      </LegalSection>

      <LegalSection title="10. Account Termination">
        <P>
          You may cancel your account at any time by contacting us. We reserve the right to suspend or
          terminate accounts that violate these Terms, fail to pay, or pose a security risk to the
          platform. Upon termination, your data will be deleted within 30 days unless legally required
          to retain it.
        </P>
      </LegalSection>

      <LegalSection title="11. Changes to These Terms">
        <P>
          We may update these Terms from time to time. Material changes will be communicated via email
          or in-app notification. Continued use of Kaza after changes take effect constitutes acceptance.
        </P>
      </LegalSection>

      <LegalSection title="12. Governing Law">
        <P>
          These Terms are governed by the laws of the Republic of Rwanda. Any disputes will be
          resolved in the courts of Kigali, Rwanda.
        </P>
      </LegalSection>

      <LegalSection title="13. Contact">
        <P>
          For questions about these Terms, contact Sybella Systems at
          <a href="mailto:support@sybella.systems" className="text-[#003366] font-semibold"> support@sybella.systems</a>
          {" "}or via WhatsApp at +250 723 776 020.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
