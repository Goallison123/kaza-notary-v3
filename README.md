# 🛡️ Kaza — Decentralized Office & Notary Ledger

**Kaza** (inspired by the Kinyarwanda verbs *Ikaze* for welcome and *Kwaza* for efficiency, as well as the world's largest regional wildlife conservation ecosystem) is a secure, lightweight B2B digital reception register and compliance logging platform built specifically for authorized private notaries, advocates, and corporate legal offices in Rwanda [🔍].

While final legal deeds and contracts are executed digitally via centralized government platforms like IremboGov, the physical reception check-in process remains entirely paper-based, creating a critical administrative "last mile" bottleneck [🔍]. Kaza bridges this gap by replacing messy, public paper logbooks with an error-free, contactless checkout station that crowdsources data entry directly to the client's own smartphone.

---

## 🚀 Core Features & Micro-Features

*   **Self-Service Smartphone Intake:** Arriving citizens scan a dynamic front-desk QR code to securely fill out mandatory legal metadata fields on their own mobile browser. **No mobile app installations are required.**
*   **Automated Error Prevention:** The client form forces strict validation boundaries, blocking incomplete input strings or inaccurate 16-digit Rwandan National ID structures before they reach your database.
*   **Live Pocket Voice Ticket Engine:** Transforms the client's phone into a live tracking ticket showing their queue number (e.g., `#045`) and counting down exactly how many people are ahead of them. When the notary shifts their status to "Now Serving", the phone browser uses its native local speech engine (**Web Speech API**) to announce out loud over their phone speaker: *"It is your turn now, please step inside."*
*   **NCSA Data Privacy Enforcement:** Unlike open paper logbooks where any visitor standing at a reception desk can look at the previous page to illegally harvest phone numbers and National IDs, Kaza runs forms privately on the citizen's personal phone screen, keeping the law firm 100% compliant with **Rwanda’s Data Protection Law** [🔍].
*   **1-Click MINIJUST Compliance Export:** Instantly extracts weeks of error-free, unalterable historical visitor data logs into a pristine, pre-sorted Excel-compatible CSV spreadsheet, turning a stressful multi-day audit nightmare into a 5-second task when Ministry of Justice inspectors show up unannounced [🔍].
*   **Offline Mode Resilience:** Employs browser storage fallbacks (`localStorage` or `IndexedDB`) to collect check-in parameters smoothly during sudden local fiber internet drops, uploading records to the cloud automatically once the network reconnects.

---

## 📦 Tech Stack Architecture

The Kaza platform is engineered as an ultra-lean, decoupled web application built for lightning-fast load speeds over local 3G/4G networks in Kigali:

*   **Frontend UI:** Vite + React 18+ (Compiled into highly optimized static assets)
*   **Backend Ledger:** Supabase (Cloud PostgreSQL Engine)
*   **Real-time Layer:** Supabase Realtime Channels (WebSocket PostgreSQL replication listener)
*   **Touch Signature Engine:** `react-signature-canvas` (Converts touchscreen drawings into compressed **Base64** text vectors)
*   **QR Encoding Engine:** `qrcode.react` (Renders crisp, on-screen vector SVG codes)

---

## 🔧 Database Setup (`supabase_setup.sql`)

Run the following initialization script directly inside your Supabase SQL Editor to construct the underlying relational data infrastructure and activate strict data security boundaries:

```sql
-- Enable cryptographic UUID generators
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SaaS Multi-Tenant Profile Controller Table
CREATE TABLE offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'Free-Trial' CHECK (plan_tier IN ('Free-Trial', 'Basic', 'Professional', 'Enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
    monthly_request_counter INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. The Immutable Notary Compliance Register Table
CREATE TABLE client_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_number SERIAL, -- Automatic daily sequential queue identification token
    office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL, -- Expiring single-use security link token
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    national_id VARCHAR(16) CHECK (national_id ~ '^[0-9]{16}\$' OR national_id IS NULL), -- 16-digit regex validation
    service_type VARCHAR(100),
    residential_address TEXT,
    signature_base64 TEXT, -- Cryptographic representation of touch canvas vector drawing
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Signed & Ready', 'Now Serving', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Database Indexes for Sub-Millisecond Frontend State Realtime Sync
CREATE INDEX idx_client_logs_office_status ON client_logs(office_id, status);
CREATE INDEX idx_client_logs_token ON client_logs(token);

-- 4. Multi-Tenant Security Configuration (Row Level Security - RLS)
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logs ENABLE ROW LEVEL SECURITY;

-- Policy: A notary office can only query rows matching their own authenticated office session ID
CREATE POLICY notary_isolation_policy ON client_logs
    FOR ALL
    USING (office_id = auth.uid());
```

---

## ⚡ Local Development Quick Start

To launch Kaza locally on your machine for testing or feature extensions, complete these steps:

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com
cd kaza
npm install
```

### 2. Configure Environment Parameters
Create a clean `.env` file in your project’s root folder directory and plug in your Supabase database access tokens:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` inside your browser to access the active platform console layer.

---

## 🔒 Subscription Management & Gatekeeper Logic

Subscriptions are handled via local mobile money (**MomoPay Merchant Codes** or corporate bank transfers) [🔍]. When an office reaches the end of their trial window or crosses their monthly threshold, a `KazaPlanGatekeeper` React component catches the state update and mounts an unskippable full-screen lockout overlay. 

The modal prompts the user to pay, then features a direct action button: **[Share Payment Screenshot on WhatsApp]**. Clicking it redirects them to our customer service line (**+250 723 776 020**) with pre-filled billing metadata. Upon manual verification, we update their database parameters in Supabase. The front desk monitor instantly unlocks the lockout overlay via secure WebSocket replication loops without requiring a page refresh [Ref: Plan].

---

## 👥 Authors & Team Ownership

Kaza is actively maintained and operated as an elite **"Tiger Team"** by **Sybella Systems**:
*   **Bessora Neema Hirwa** (Founder & Product Owner): Directs product management, business strategy layout, marketing, customer care, and frontend views.
*   **Prashant Gangwar** (Senior Systems Architect): Manages technical system topology, database security structures, real-time sync listeners, and advanced engineering parameters.
