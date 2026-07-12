import LegalPage, { LegalSection, P, UL } from './LegalPage';

export default function SecurityPage() {
  return (
    <LegalPage type="security">
      <LegalSection title="1. Security Philosophy">
        <P>
          Kaza handles sensitive personal data — national IDs, signatures, and legal service records.
          We treat data security as a first-class concern, not an afterthought. This document explains
          the technical and operational measures we take to protect your data.
        </P>
      </LegalSection>

      <LegalSection title="2. Encryption">
        <P>
          <strong>In transit:</strong> All communication between client devices, the dashboard, and
          our database is encrypted using TLS (Transport Layer Security). No data is transmitted
          in plaintext over the network.
        </P>
        <P>
          <strong>At rest:</strong> The database stores all data encrypted at rest using
          AES-256, the industry standard for database-level encryption. Backups are also encrypted.
        </P>
        <P>
          <strong>Signatures:</strong> Client touch-signatures are stored as base64-encoded images
          in the database and are only accessible to authenticated office staff.
        </P>
      </LegalSection>

      <LegalSection title="3. Authentication">
        <P>
          Office accounts authenticate via Supabase Auth using email and password. Passwords are
          hashed using bcrypt — we never store plaintext passwords and cannot recover them if lost.
        </P>
        <P>
          Session tokens are JWT-based and expire automatically. Users must re-authenticate after
          the session expires. There are no shared credentials — each team member has their own login.
        </P>
      </LegalSection>

      <LegalSection title="4. Row Level Security (RLS)">
        <P>
          Every table in our database has Row Level Security enabled. This means that even at the
          database level, an office can only read, create, update, or delete records that belong
          to their own office. There is no way for one office to access another office's data,
          even in the event of a query error or API misuse.
        </P>
        <P>
          Each table has four separate policies (one per CRUD verb: SELECT, INSERT, UPDATE, DELETE),
          each scoped to the authenticated office owner. Anonymous access is limited to the
          scan-form submission endpoint only.
        </P>
      </LegalSection>

      <LegalSection title="5. Data Access Controls">
        <P>Within an office account, access is tiered:</P>
        <UL>
          <li><strong>Admins</strong> — Full access to all settings, records, team management, and billing</li>
          <li><strong>Staff</strong> — Access to the dashboard, queue, and records, but not billing or plan settings</li>
          <li><strong>Clients (walk-in)</strong> — Can only submit their own form via a unique, time-limited scan token. They cannot see the dashboard or other clients' data.</li>
        </UL>
        <P>
          Scan tokens are single-use, expire after 7 days, and are unique per client. A token cannot
          be reused once the form has been submitted.
        </P>
      </LegalSection>

      <LegalSection title="6. Infrastructure">
        <P>
          Kaza is built on Supabase (PostgreSQL database + Auth + Realtime) and deployed on Vercel.
          Both providers maintain industry-standard security certifications:
        </P>
        <UL>
          <li>Supabase: SOC 2 Type II compliant, with encrypted databases and isolated network access</li>
          <li>Vercel: Edge network with DDoS protection, TLS termination, and isolated build environments</li>
        </UL>
        <P>
          We do not run any on-premise servers. All infrastructure is managed by these providers
          with 24/7 monitoring.
        </P>
      </LegalSection>

      <LegalSection title="7. Realtime Data">
        <P>
          The live queue monitor and client receipt screen use Supabase Realtime (WebSocket
          subscriptions) to update instantly. Realtime channels are scoped by office ID — a client
          viewing their receipt only receives updates about their own queue position, not other
          clients' personal details.
        </P>
      </LegalSection>

      <LegalSection title="8. What We Do NOT Store">
        <P>We deliberately do not collect or store:</P>
        <UL>
          <li>Credit card or banking details — payments are handled externally via MoMoPay</li>
          <li>Biometric data (fingerprints, facial scans)</li>
          <li>GPS location data from client devices</li>
          <li>Third-party analytics or advertising tracking data</li>
        </UL>
      </LegalSection>

      <LegalSection title="9. Incident Response">
        <P>
          In the event of a suspected data breach or security incident, Sybella Systems will:
        </P>
        <UL>
          <li>Investigate and contain the incident within 24 hours of discovery</li>
          <li>Notify affected offices via email within 72 hours</li>
          <li>Provide a written incident report upon request</li>
          <li>Patch the vulnerability and review related systems to prevent recurrence</li>
        </UL>
        <P>
          If you discover a security vulnerability, please report it responsibly to
          <a href="mailto:security@sybella.systems" className="text-[#003366] font-semibold"> security@sybella.systems</a>.
          Do not publicly disclose vulnerabilities until we have had time to address them.
        </P>
      </LegalSection>

      <LegalSection title="10. Data Export and Deletion">
        <P>
          Offices can export all their records at any time via the CSV/Excel export feature. Offices
          can request complete data deletion by contacting support. Deletion requests are processed
          within 30 days and remove all associated client logs, categories, team members, and notifications.
        </P>
      </LegalSection>

      <LegalSection title="11. Compliance">
        <P>
          Kaza is designed to support offices in complying with Rwandan data protection regulations
          (Law N°058/2021 on the Protection of Personal Data and Privacy). Offices remain the data
          controllers and are responsible for informing their clients about data collection practices.
          Sybella Systems acts as the data processor.
        </P>
      </LegalSection>

      <LegalSection title="12. Contact">
        <P>
          For security questions or to report a vulnerability, contact
          <a href="mailto:security@sybella.systems" className="text-[#003366] font-semibold"> security@sybella.systems</a>
          {" "}or via WhatsApp at +250 723 776 020.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
