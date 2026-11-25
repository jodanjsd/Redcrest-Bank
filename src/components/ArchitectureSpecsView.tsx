import React, { useState } from 'react';
import { Check, Copy, Database, LayoutGrid, Server } from 'lucide-react';

type SpecTab = 'schema' | 'api' | 'wireframes';

const POSTGRES_SCHEMA_SQL = `-- PostgreSQL Core Banking & CBN Tiered KYC Schema
CREATE TYPE kyc_tier AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'SME_CORPORATE');
CREATE TYPE tx_type AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE tx_status AS ENUM ('PENDING', 'COMPLETED', 'REVERSED', 'DISPUTED');

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(160) NOT NULL,
  phone_e164 VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  bvn_encrypted BYTEA,               -- AES-256-GCM at rest
  nin_encrypted BYTEA,
  ndpr_consent_at TIMESTAMPTZ NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,     -- 'DOJAH' | 'SMILE_ID' | 'YOUVERIFY'
  verification_type VARCHAR(24) NOT NULL, -- 'BVN' | 'NIN' | 'CAC_RC'
  cac_rc_number VARCHAR(32),
  liveness_score NUMERIC(4,2),
  verified_at TIMESTAMPTZ,
  status VARCHAR(24) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  nuban CHAR(10) UNIQUE NOT NULL,
  account_type VARCHAR(40) NOT NULL, -- 'PERSONAL_SAVINGS' | 'SME_CURRENT'
  tier kyc_tier NOT NULL DEFAULT 'TIER_1',
  ledger_balance_kobo BIGINT NOT NULL DEFAULT 0,
  daily_limit_kobo BIGINT NOT NULL,
  card_last4 CHAR(4),
  card_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  reference VARCHAR(48) UNIQUE NOT NULL,
  channel VARCHAR(32) NOT NULL,      -- 'NIP' | 'INTERSWITCH_BILL' | 'VTU'
  counterparty_name VARCHAR(160) NOT NULL,
  counterparty_bank_code VARCHAR(10),
  type tx_type NOT NULL,
  amount_kobo BIGINT NOT NULL,
  fee_kobo BIGINT NOT NULL DEFAULT 0,
  status tx_status NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE disputes_and_fraud (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  ticket_number VARCHAR(24) UNIQUE NOT NULL,
  category VARCHAR(48) NOT NULL,
  summary TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redis Keys (Session Caching & Rate Limiting)
-- sess:{userId}          -> TTL 300s (5-min auto-timeout)
-- otp:{phone}            -> TTL 180s, max 3 retries
-- nip:daily:{accountId}  -> Daily cumulative transfer kobo counter`;

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/kyc/personal/onboard',
    summary: 'Verify BVN/NIN + Liveness Selfie via Dojah/Smile ID, issue SMS OTP, and provision Tier 1 NUBAN.',
    request: `{
  "idType": "BVN",
  "idNumber": "22349018274",
  "phone": "+2348093217740",
  "email": "chisom@example.ng",
  "selfieBase64": "...",
  "ndprConsent": true
}`,
    response: `{
  "status": "OTP_REQUIRED",
  "verificationId": "kyc_9812fa",
  "demoOtpChannel": "TERMII_SMS"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/kyc/sme/onboard',
    summary: 'Validate CAC RC/BN registration + Director BVN + TIN and provision Corporate SME Current NUBAN.',
    request: `{
  "cacNumber": "RC-1849203",
  "businessName": "Eko Craft & Logistics Ltd",
  "directorBvn": "22198374612",
  "tin": "10482910-0001",
  "ndprConsent": true
}`,
    response: `{
  "status": "PROVISIONED",
  "nuban": "2084910234",
  "tier": "SME_CORPORATE",
  "dailyLimitNgn": 50000000
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/transfers/nip',
    summary: 'Execute real-time NIBSS NIP transfer after verifying 4-digit PIN, 2FA OTP, and CBN Tier limits.',
    request: `{
  "sourceNuban": "2048917362",
  "destinationBankCode": "058",
  "destinationNuban": "0149283710",
  "amountKobo": 1500000,
  "pin": "1234",
  "otp": "482910"
}`,
    response: `{
  "reference": "NIP-20261125-99412",
  "status": "COMPLETED",
  "feeKobo": 2688,
  "receiptUrl": "/api/v1/receipts/NIP-20261125-99412.pdf"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/bills/pay',
    summary: 'Settle Nigerian telecom airtime/data or utility bills (IKEDC, EKEDC, DStv) via Interswitch/Paystack.',
    request: `{
  "billerId": "ikedc-power",
  "customerIdentifier": "45210098412",
  "amountKobo": 1000000,
  "pin": "1234",
  "otp": "482910"
}`,
    response: `{
  "reference": "BILL-20261125-77210",
  "token": "4810-2938-1102-9481-5521",
  "status": "COMPLETED"
}`,
  },
  {
    method: 'POST',
    path: '/api/assistant',
    summary: 'Live server-side Gemini 4 Hydrogen route powering Kola 24/7 Virtual Banker self-service actions.',
    request: `{
  "message": "Block my lost debit card",
  "accountContext": { "nuban": "2048917362", "tier": "Tier 2" }
}`,
    response: `{
  "reply": "Your debit card ending in 8492 has been blocked across ATM, POS, and web.",
  "action": "BLOCK_CARD",
  "disputeSummary": ""
}`,
  },
];

const WIREFRAME_ZONES = [
  {
    page: '01. Public Portal (5-Zone Homepage)',
    layout: '12-Column Responsive Grid · Sticky 3-Zone Header + Utility Strip',
    blocks: [
      'Zone 1: Top Navigation (Wordmark · 4 Persona/Support Links · Internet Banking CTA) + Utility Strip (NGN/USD/GBP/GHS, Search, Theme Toggle)',
      'Zone 2: Hero Split (Headline + Open Account CTA + Live NUBAN Gateway Card) + 4 Quick-Action Tiles',
      'Zone 3: Persona Router Tabs (Individual, Entrepreneur/SME, Student, Diaspora) filtering tiered account cards',
      'Zone 4: CBN Tiered KYC Comparison Matrix + Embedded Kola Virtual Banker Chat Hub',
      'Zone 5: Categorized FAQs, City-Filtered Branch/ATM Locator, Anonymous Fraud Report, Press & NDPR Alert Subscriptions',
    ],
  },
  {
    page: '02. Digital Onboarding Modal (US-01 & US-02)',
    layout: 'Centered 640px Stepper Dialog · 3 Progressive Steps',
    blocks: [
      'Step 1: Personal Tier 1 (BVN/NIN + Phone + Liveness Selfie) vs SME (CAC RC + Director BVN + TIN) + NDPR Consent',
      'Step 2: 6-Digit SMS/Email OTP Challenge with Auto-fill Demo Trigger',
      'Step 3: Instant 10-Digit NUBAN Issuance Card + Direct Handoff into Internet Banking Dashboard',
    ],
  },
  {
    page: '03. Core Internet Banking Dashboard (US-03 to US-05)',
    layout: '240px Sidebar + Fluid Main Viewport + 5-Minute Inactivity Lock',
    blocks: [
      'Account Overview: Privacy-masked NGN Balance, CBN Daily Limit Progress Bar, Searchable Ledger with CSV & Print PDF',
      'NIP Funds Transfer: Bank Selector, 10-digit NUBAN Auto-Lookup, 4-Digit PIN + 2FA OTP Modal, Automated Receipt',
      'Bills & Airtime: MTN/Airtel/Glo/IKEDC/EKEDC/DStv with Preset Amounts & Token Receipt',
      'Card & Disputes: Instant Debit Card Freeze/Unfreeze Toggle + Kola Dispute Ticket Log',
    ],
  },
];

export const ArchitectureSpecsView: React.FC = () => {
  const [tab, setTab] = useState<SpecTab>('schema');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-medium text-[#0B2545] dark:text-[#60A5FA]">
            Engineering &amp; Product Blueprint
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-zinc-950 dark:text-white">
            Database Schema, Core Banking APIs &amp; UX Wireframes
          </h1>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          {[
            { id: 'schema', label: 'PostgreSQL + Redis Schema', icon: Database },
            { id: 'api', label: 'KYC & Core Banking APIs', icon: Server },
            { id: 'wireframes', label: 'UI/UX Wireframes', icon: LayoutGrid },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as SpecTab)}
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'schema' && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#14161A]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
            <p className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              schema.sql · PostgreSQL 16 + Redis Cache Keys
            </p>
            <button
              type="button"
              onClick={() => handleCopy(POSTGRES_SCHEMA_SQL)}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
            {POSTGRES_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {tab === 'api' && (
        <div className="space-y-4">
          {API_ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14161A]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-[#0B2545] px-2 py-0.5 font-mono text-[11px] font-bold text-white dark:bg-[#1D4ED8]">
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm font-semibold text-zinc-950 dark:text-white">
                    {ep.path}
                  </code>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{ep.summary}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-zinc-500">Request Payload</p>
                  <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-[11px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {ep.request}
                  </pre>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-zinc-500">Response Payload</p>
                  <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-[11px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'wireframes' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {WIREFRAME_ZONES.map((wf) => (
            <div
              key={wf.page}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]"
            >
              <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                {wf.page}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#0B2545] dark:text-[#60A5FA]">
                {wf.layout}
              </p>
              <ul className="mt-4 space-y-2.5 border-t border-zinc-200 pt-4 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {wf.blocks.map((block) => (
                  <li key={block} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                    {block}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
