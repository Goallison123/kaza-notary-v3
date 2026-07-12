import LegalPage, { LegalSection, P, UL } from './LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage type="privacy">
      <LegalSection title="1. Overview">
        <P>
          Kaza ("we", "us", "our") is a digital notary register platform operated by Sybella Systems, based in Kigali, Rwanda.
          This Privacy Policy explains how we collect, use, store, and protect personal data when clients use our
          check-in forms and when offices use our dashboard to manage records.
        </P>
        <P>
          By using Kaza, you consent to the practices described in this policy. This policy applies to both
          office staff (notaries, receptionists, administrators) and walk-in clients who submit forms.
        </P>
      </LegalSection>

      <LegalSection title="2. Data We Collect">
        <P>When a client checks in via a Kaza scan form, we collect:</P>
        <UL>
          <li><strong>Full name</strong> — used to identify and call the client</li>
          <li><strong>Phone number</strong> — used for follow-up communication by the office</li>
          <li><strong>National ID</strong> — collected where required by the office for notarial records</li>
          <li><strong>Service type / category</strong> — the reason for the visit (e.g., land transfer, affidavit)</li>
          <li><strong>Residential address</strong> — optional, collected at the office's discretion</li>
          <li><strong>Signature</strong> — a touch-drawn signature captured on the client's phone</li>
          <li><strong>Form responses</strong> — any additional fields the office has configured for that service</li>
        </UL>
        <P>When an office registers an account, we also collect:</P>
        <UL>
          <li><strong>Email address</strong> — for authentication and account recovery</li>
          <li><strong>Office name and MoMo code</strong> — for billing and identification</li>
          <li><strong>Team member emails</strong> — when inviting staff to collaborate</li>
        </UL>
      </LegalSection>

      <LegalSection title="3. How We Use Your Data">
        <P>We use collected data strictly for operating the Kaza platform:</P>
        <UL>
          <li>To assign a queue number and manage the waiting room order</li>
          <li>To display client information to the receiving office's staff dashboard</li>
          <li>To generate downloadable records (CSV/Excel) for the office's internal filing</li>
          <li>To send in-app notifications when a new form is submitted</li>
          <li>To enforce plan limits (monthly request counts, category counts, team seats)</li>
          <li>To process subscription payments and plan upgrades via WhatsApp confirmation</li>
        </UL>
        <P>We do <strong>not</strong> use client data for advertising, sell data to third parties, or share data
        with any external organization.</P>
      </LegalSection>

      <LegalSection title="4. Data Storage and Hosting">
        <P>
          All data is stored in a PostgreSQL database hosted on Supabase, a secure cloud database provider.
          Data is encrypted in transit (TLS) and at rest. Database access is restricted to authenticated
          users via Row Level Security policies — each office can only see records belonging to their own office.
        </P>
        <P>
          Supabase data centers are hosted in compliant cloud regions. We do not store data on any local
          servers or personal devices.
        </P>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <P>
          Client records remain in the office's Kaza dashboard indefinitely unless the office deletes them.
          Offices are responsible for exporting and archiving records in accordance with their local
          notarial regulations. We do not auto-delete records unless explicitly requested by the office.
        </P>
        <P>
          If an office cancels their subscription and requests account deletion, we will permanently
          remove all associated records within 30 days.
        </P>
      </LegalSection>

      <LegalSection title="6. Client Rights">
        <P>Clients who submit forms have the right to:</P>
        <UL>
          <li>Request a copy of the data they submitted from the receiving office</li>
          <li>Request correction of inaccurate data through the receiving office</li>
          <li>Withdraw consent for data processing by contacting the receiving office</li>
        </UL>
        <P>
          Since Kaza is a tool used by offices to manage their own client data, data requests should be
          directed to the office first. Sybella Systems will cooperate with any formal data request
          forwarded by the office.
        </P>
      </LegalSection>

      <LegalSection title="7. Cookies and Local Storage">
        <P>
          Kaza uses browser local storage to maintain your login session. We do not use third-party
          tracking cookies, advertising cookies, or analytics cookies. No data is shared with
          advertising networks.
        </P>
      </LegalSection>

      <LegalSection title="8. Children's Data">
        <P>
          Kaza is designed for adult clients visiting notary offices. We do not knowingly collect data
          from children under 18. If a minor's data is submitted by a parent or guardian on their behalf,
          that data is treated the same as any other client record.
        </P>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with
          an updated revision date. Continued use of Kaza after changes constitutes acceptance of the
          updated policy.
        </P>
      </LegalSection>

      <LegalSection title="10. Contact">
        <P>
          For privacy-related questions or requests, contact Sybella Systems at
          <a href="mailto:support@sybella.systems" className="text-[#003366] font-semibold"> support@sybella.systems</a>
          {" "}or via WhatsApp at +250 723 776 020.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
