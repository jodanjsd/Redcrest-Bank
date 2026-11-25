import {
  BankAccount,
  BankTransaction,
  BillerOption,
  BranchLocation,
  CountryRegion,
  FaqItem,
  NigerianBank,
  PersonaProduct,
  TierLimitSpec,
} from '../types/banking';

export const COUNTRY_REGIONS: CountryRegion[] = [
  { code: 'NGN', country: 'Nigeria', symbol: '₦', rateFromNgn: 1 },
  { code: 'USD', country: 'United States', symbol: '$', rateFromNgn: 0.00062 },
  { code: 'GBP', country: 'United Kingdom', symbol: '£', rateFromNgn: 0.00049 },
  { code: 'GHS', country: 'Ghana', symbol: 'GH₵', rateFromNgn: 0.0094 },
];

export const TIER_LIMITS: Record<string, TierLimitSpec> = {
  'Tier 1': {
    tier: 'Tier 1',
    singleTransferLimitNgn: 50000,
    dailyTransferLimitNgn: 300000,
    maxBalanceNgn: 300000,
    kycRequirement: 'BVN or NIN + Phone OTP + Liveness Selfie',
  },
  'Tier 2': {
    tier: 'Tier 2',
    singleTransferLimitNgn: 200000,
    dailyTransferLimitNgn: 1000000,
    maxBalanceNgn: 1000000,
    kycRequirement: 'BVN + NIN + Government ID Verification',
  },
  'Tier 3': {
    tier: 'Tier 3',
    singleTransferLimitNgn: 5000000,
    dailyTransferLimitNgn: 10000000,
    maxBalanceNgn: null,
    kycRequirement: 'BVN + NIN + Verified Utility Bill / Address Check',
  },
  'SME Corporate': {
    tier: 'SME Corporate',
    singleTransferLimitNgn: 10000000,
    dailyTransferLimitNgn: 50000000,
    maxBalanceNgn: null,
    kycRequirement: 'CAC RC/BN Certificate + Director BVN + TIN',
  },
};

export const INITIAL_DEMO_ACCOUNT: BankAccount = {
  id: 'acct-demo-01',
  holderName: 'Adebayo Oluwaseun',
  nuban: '2048917362',
  accountType: 'Personal Savings',
  tier: 'Tier 2',
  balanceNgn: 842650.5,
  dailySpentNgn: 45000,
  cardLast4: '8492',
  cardFrozen: false,
  bvnMasked: '223••••9014',
  phone: '+234 803 412 8890',
  email: 'adebayo.o@redcrestmail.ng',
};

export const INITIAL_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-101',
    reference: 'NIP-20261125-99412',
    dateIso: '2026-11-25T09:14:00',
    description: 'Salary Inflow — Paystack Settlement',
    counterparty: 'Paystack Checkout Ltd',
    bankName: 'Access Bank',
    channel: 'Inward Credit',
    type: 'credit',
    amountNgn: 485000,
    feeNgn: 0,
    status: 'Completed',
  },
  {
    id: 'tx-102',
    reference: 'NIP-20261124-88201',
    dateIso: '2026-11-24T16:42:00',
    description: 'Vendor Settlement — Lekki Logistics',
    counterparty: 'Chinedu Okafor Enterprises',
    bankName: 'GTBank',
    channel: 'NIP Transfer',
    type: 'debit',
    amountNgn: 45000,
    feeNgn: 26.88,
    status: 'Completed',
  },
  {
    id: 'tx-103',
    reference: 'BILL-20261123-44109',
    dateIso: '2026-11-23T11:20:00',
    description: 'IKEDC Prepaid Meter Token (4521-9901)',
    counterparty: 'Ikeja Electric',
    bankName: 'Interswitch Bills',
    channel: 'Bill Payment',
    type: 'debit',
    amountNgn: 22500,
    feeNgn: 100,
    status: 'Completed',
  },
  {
    id: 'tx-104',
    reference: 'VTU-20261122-30918',
    dateIso: '2026-11-22T08:05:00',
    description: 'MTN Nigeria 25GB Monthly Data Plan',
    counterparty: '0803 412 8890',
    bankName: 'MTN Direct',
    channel: 'Airtime & Data',
    type: 'debit',
    amountNgn: 6500,
    feeNgn: 0,
    status: 'Completed',
  },
  {
    id: 'tx-105',
    reference: 'NIP-20261120-11294',
    dateIso: '2026-11-20T14:55:00',
    description: 'Client Retainer — Design Sprint',
    counterparty: 'Zainab Bello Studio',
    bankName: 'Zenith Bank',
    channel: 'Inward Credit',
    type: 'credit',
    amountNgn: 195000,
    feeNgn: 0,
    status: 'Completed',
  },
];

export const NIGERIAN_BANKS: NigerianBank[] = [
  { code: '000', name: 'Redcrest Bank (Internal)', category: 'Commercial' },
  { code: '033', name: 'United Bank for Africa (UBA)', category: 'Commercial' },
  { code: '044', name: 'Access Bank', category: 'Commercial' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)', category: 'Commercial' },
  { code: '057', name: 'Zenith Bank', category: 'Commercial' },
  { code: '011', name: 'First Bank of Nigeria', category: 'Commercial' },
  { code: '221', name: 'Stanbic IBTC Bank', category: 'Commercial' },
  { code: '070', name: 'Fidelity Bank', category: 'Commercial' },
  { code: '50211', name: 'Kuda Microfinance Bank', category: 'Microfinance / Digital' },
  { code: '999992', name: 'OPay Digital Services', category: 'Microfinance / Digital' },
  { code: '50515', name: 'Moniepoint MFB', category: 'Microfinance / Digital' },
];

export const BILLER_OPTIONS: BillerOption[] = [
  {
    id: 'mtn-airtime',
    category: 'Airtime & Data',
    provider: 'MTN Nigeria',
    identifierLabel: 'Nigerian Mobile Number',
    identifierPlaceholder: '0803 412 8890',
    quickAmountsNgn: [1000, 2000, 5000, 10000],
  },
  {
    id: 'airtel-data',
    category: 'Airtime & Data',
    provider: 'Airtel Nigeria',
    identifierLabel: 'Nigerian Mobile Number',
    identifierPlaceholder: '0802 550 1120',
    quickAmountsNgn: [1500, 3000, 6000, 12000],
  },
  {
    id: 'glo-airtime',
    category: 'Airtime & Data',
    provider: 'Glo Mobile',
    identifierLabel: 'Nigerian Mobile Number',
    identifierPlaceholder: '0805 219 4400',
    quickAmountsNgn: [1000, 2500, 5000, 10000],
  },
  {
    id: 'ikedc-power',
    category: 'Electricity',
    provider: 'Ikeja Electric (IKEDC Prepaid)',
    identifierLabel: 'Prepaid Meter Number',
    identifierPlaceholder: '45210098412',
    quickAmountsNgn: [5000, 10000, 20000, 50000],
  },
  {
    id: 'ekedc-power',
    category: 'Electricity',
    provider: 'Eko Electricity (EKEDC)',
    identifierLabel: 'Prepaid Meter Number',
    identifierPlaceholder: '62004819204',
    quickAmountsNgn: [5000, 15000, 25000, 50000],
  },
  {
    id: 'dstv-cable',
    category: 'Cable TV',
    provider: 'DStv Compact / Premium',
    identifierLabel: 'Smartcard / IUC Number',
    identifierPlaceholder: '7029481029',
    quickAmountsNgn: [15700, 25000, 37000, 44500],
  },
];

export const PERSONA_PRODUCTS: PersonaProduct[] = [
  {
    id: 'prod-tier1',
    persona: 'individual',
    name: 'Redcrest Instant Tier 1 Savings',
    summary:
      'Open an active 10-digit NUBAN in under 5 minutes with only your BVN or NIN and a quick selfie check.',
    tierLabel: 'CBN Tier 1',
    dailyLimit: '₦300,000 / day',
    monthlyFee: '₦0 maintenance',
    onboardingMode: 'personal',
    highlights: [
      'Instant NUBAN issued upon SMS OTP verification',
      'Zero minimum opening balance and free virtual Verve card',
      'Upgradeable to Tier 2 or Tier 3 from Internet Banking',
    ],
  },
  {
    id: 'prod-salary',
    persona: 'individual',
    name: 'Redcrest Salary & Goal Account',
    summary:
      'Automated savings buckets, free interbank NIP transfers on payday, and instant digital statements.',
    tierLabel: 'CBN Tier 2 / 3',
    dailyLimit: 'Up to ₦10,000,000 / day',
    monthlyFee: '₦0 on salary inflow',
    onboardingMode: 'personal',
    highlights: [
      'Downloadable PDF & CSV bank statements verified with QR stamp',
      'Automated electricity, cable TV, and airtime scheduling',
      'Up to 12.5% p.a. yield on locked savings vaults',
    ],
  },
  {
    id: 'prod-sme-current',
    persona: 'sme',
    name: 'Redcrest SME Business Current',
    summary:
      'Built for Nigerian merchants, agencies, and registered LLCs using CAC RC/BN details and director BVN.',
    tierLabel: 'SME Corporate',
    dailyLimit: '₦50,000,000 / day',
    monthlyFee: 'Zero COT · Flat NIP fees',
    onboardingMode: 'sme',
    highlights: [
      'Same-day CAC verification and multi-signatory maker-checker roles',
      'Instant POS terminal request and Paystack/Interswitch settlement',
      'Bulk payroll disbursement CSV upload for up to 500 staff',
    ],
  },
  {
    id: 'prod-sme-trade',
    persona: 'sme',
    name: 'Merchant POS & Inventory Credit',
    summary:
      'Turn daily card and transfer collections into working capital with transparent repayment schedules.',
    tierLabel: 'SME Corporate',
    dailyLimit: '₦50,000,000 / day',
    monthlyFee: '0.5% POS cap',
    onboardingMode: 'sme',
    highlights: [
      'Real-time NIP webhook notifications for store cashiers',
      'Pre-approved inventory credit after 90 days of turnover',
      'Dedicated relationship desk in Lagos, Abuja, and Kano',
    ],
  },
  {
    id: 'prod-student',
    persona: 'student',
    name: 'NextGen Campus Flex Account',
    summary:
      'Zero-fee digital banking for undergraduates and NYSC corps members across Nigerian universities.',
    tierLabel: 'CBN Tier 1',
    dailyLimit: '₦300,000 / day',
    monthlyFee: '₦0 forever',
    onboardingMode: 'personal',
    highlights: [
      '2% instant cashback on MTN, Airtel, and Glo data bundles',
      'Zero card issuance fee for campus debit card pickup',
      'USSD *9190# offline fallback when campus Wi-Fi drops',
    ],
  },
  {
    id: 'prod-diaspora',
    persona: 'diaspora',
    name: 'Diaspora Naira & Domiciliary Bridge',
    summary:
      'Hold USD, GBP, or NGN seamlessly, pay family utilities in Lagos or Abuja, and manage investments remotely.',
    tierLabel: 'CBN Tier 3',
    dailyLimit: '₦10,000,000 / day',
    monthlyFee: '₦0 Naira leg',
    onboardingMode: 'personal',
    highlights: [
      'Remote BVN + international passport verification',
      'Direct inward remittance settlement in NGN or USD',
      'Instant family bill settlement with verifiable receipts',
    ],
  },
];

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: 'br-vi',
    name: 'Victoria Island Flagship Hub',
    city: 'Lagos',
    address: '57 Adeola Odeku Street, Victoria Island, Lagos',
    services: 'Retail, SME Desk, FX & Domiciliary, Card Instant Print',
    atmStatus: '24/7 Cash & Cardless',
    hours: 'Mon–Fri 8:00 AM – 4:00 PM',
  },
  {
    id: 'br-ikeja',
    name: 'Ikeja Allen Avenue Branch',
    city: 'Lagos',
    address: '104 Allen Avenue, Ikeja, Lagos',
    services: 'Personal Banking, SME POS Pickup, CAC Advisory',
    atmStatus: '24/7 Cash & Cardless',
    hours: 'Mon–Fri 8:00 AM – 4:00 PM',
  },
  {
    id: 'br-abuja',
    name: 'Wuse II Regional Center',
    city: 'Abuja',
    address: 'Plot 812 Aminu Kano Crescent, Wuse II, FCT Abuja',
    services: 'Corporate, Retail, Government Collections',
    atmStatus: '24/7 Cash & Cardless',
    hours: 'Mon–Fri 8:00 AM – 4:00 PM',
  },
  {
    id: 'br-ph',
    name: 'New GRA Port Harcourt Branch',
    city: 'Port Harcourt',
    address: '28 Tombia Extension, New GRA, Port Harcourt',
    services: 'SME Trade, Personal Banking, Instant Card Issuance',
    atmStatus: '24/7 Cash Only',
    hours: 'Mon–Fri 8:00 AM – 4:00 PM',
  },
  {
    id: 'br-kano',
    name: 'Bompai Commercial Branch',
    city: 'Kano',
    address: '14 Post Office Road, Kano',
    services: 'Merchant Collections, Retail, Bulk Cash Deposit',
    atmStatus: '24/7 Cash Only',
    hours: 'Mon–Fri 8:00 AM – 4:00 PM',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Account Tiers',
    question: 'What are the CBN transaction limits for Tier 1, Tier 2, and Tier 3 accounts?',
    answer:
      'Tier 1 accounts (BVN or NIN + selfie) allow up to ₦50,000 per single transfer, ₦300,000 daily, and ₦300,000 maximum cumulative balance. Tier 2 raises daily transfers to ₦1,000,000, and Tier 3 (with verified utility address) removes the balance cap with up to ₦10,000,000 daily.',
  },
  {
    id: 'faq-2',
    category: 'NIP Transfers',
    question: 'How fast do interbank NIP transfers settle and what happens if a transfer fails?',
    answer:
      'NIBSS Instant Payment (NIP) transfers settle within seconds to any commercial or microfinance bank in Nigeria. If an account is debited without beneficiary credit, log a dispute directly with Kola (our 24/7 Virtual Banker) for automated NIBSS reconciliation within 24 hours.',
  },
  {
    id: 'faq-3',
    category: 'Card & Security',
    question: 'How do I block my debit card immediately if my phone or wallet is lost?',
    answer:
      'Ask Kola in the Virtual Banker chat to "Block my debit card" or toggle Freeze Card inside the Internet Banking dashboard. Freezing takes effect immediately across POS, ATM, and web channels.',
  },
  {
    id: 'faq-4',
    category: 'SME & CAC',
    question: 'What documents do I need to open an SME Business Current account online?',
    answer:
      'Enter your CAC Registration (RC or BN) number, business name, Tax Identification Number (optional at Tier 1 SME stage), and the primary director’s 11-digit BVN. Your corporate NUBAN is provisioned immediately upon OTP confirmation.',
  },
];

export const PRESS_UPDATES = [
  {
    id: 'news-1',
    date: 'November 2026',
    category: 'Infrastructure',
    title: '99.4% NIP Instant Settlement Uptime Across Q3 Peak Retail Volume',
    excerpt:
      'Redcrest Bank completed dual-active NIBSS settlement routing across Lagos and Abuja data centers, cutting interbank transfer latency under 1.8 seconds.',
    body: 'Redcrest Bank Nigeria Plc today confirmed 99.4% transaction completion across its NIBSS Instant Payment (NIP) clearing gateway during the third quarter of 2026. The dual-active architecture spanning Tier III facilities in Victoria Island, Lagos and Wuse II, Abuja ensures seamless failover for retail transfers, merchant POS settlements, and SME bulk payroll runs.',
  },
  {
    id: 'news-2',
    date: 'October 2026',
    category: 'Press Releases',
    title: 'Full NDPA Data Consent & CBN Tiered KYC Verification Upgrade',
    excerpt:
      'All digital onboarding journeys now feature explicit NDPA consent controls, instant NIN/BVN cross-matching, and real-time CAC business validation.',
    body: 'In alignment with the Nigeria Data Protection Act (NDPA) and Central Bank of Nigeria (CBN) Tiered KYC guidelines, Redcrest Bank has deployed real-time liveness and identity verification across web, mobile, and agent channels. Customers can now open a compliant Tier 1 NUBAN in under five minutes with transparent consent receipts.',
  },
  {
    id: 'news-3',
    date: 'September 2026',
    category: 'Sustainability',
    title: 'Zero Maintenance Fee Business Accounts for Registered Nigerian MSMEs',
    excerpt:
      'Entrepreneurs opening corporate accounts digitally receive instant NUBAN provisioning and flat CBN-regulated NIP transfer tariffs.',
    body: 'To accelerate Nigerian MSME formalization, Redcrest Bank waived monthly account maintenance charges on all digitally onboarded SME Corporate Current accounts. Eligible businesses registered with the Corporate Affairs Commission (CAC) also gain access to instant POS deployment and working capital credit lines.',
  },
];

export const ABOUT_PILLARS = [
  {
    title: 'Customer-First Governance',
    detail:
      'Licensed by the Central Bank of Nigeria with full NDIC deposit insurance and independent board audit oversight.',
  },
  {
    title: 'Pan-African Digital Rails',
    detail:
      'Built for high-volume NGN retail, SME trade, and cross-border diaspora remittances across Nigeria, Ghana, the UK, and the US.',
  },
  {
    title: 'Security & Privacy by Design',
    detail:
      'End-to-end TLS 1.3 transit encryption, AES-256 identity vaulting, mandatory 2FA on debits, and strict NDPA/NDPR compliance.',
  },
];

export const INVESTOR_QUARTERS = [
  {
    period: 'Q3 2026',
    grossEarnings: '₦312.4B',
    profitBeforeTax: '₦98.6B',
    capitalAdequacy: '21.4%',
    nplRatio: '2.1%',
    digitalShare: '86.5%',
    yoyGrowth: '+24.8% YoY',
  },
  {
    period: 'Q2 2026',
    grossEarnings: '₦278.9B',
    profitBeforeTax: '₦84.2B',
    capitalAdequacy: '20.9%',
    nplRatio: '2.3%',
    digitalShare: '84.1%',
    yoyGrowth: '+21.2% YoY',
  },
  {
    period: 'Q1 2026',
    grossEarnings: '₦241.0B',
    profitBeforeTax: '₦71.5B',
    capitalAdequacy: '20.5%',
    nplRatio: '2.4%',
    digitalShare: '81.9%',
    yoyGrowth: '+18.7% YoY',
  },
  {
    period: 'FY 2025',
    grossEarnings: '₦942.8B',
    profitBeforeTax: '₦289.0B',
    capitalAdequacy: '20.2%',
    nplRatio: '2.5%',
    digitalShare: '79.4%',
    yoyGrowth: '+27.4% YoY',
  },
];

export const INVESTOR_DOCUMENTS = [
  {
    id: 'doc-q3-2026',
    title: 'Q3 2026 Unaudited Financial Statements',
    meta: 'NGX Filing · October 2026',
    summary:
      'Unaudited interim statement of profit or loss, balance sheet, and CBN Capital Adequacy disclosures for the nine months ended September 30, 2026.',
  },
  {
    id: 'doc-fy-2025',
    title: 'FY 2025 Annual Report & Pillar III Risk Disclosure',
    meta: 'Audited Report · March 2026',
    summary:
      'Audited consolidated financial results, Basel III liquidity metrics, sustainability impact review, and board remuneration report.',
  },
  {
    id: 'doc-agm-2026',
    title: '2026 Investor Presentation & Dividend Notice',
    meta: 'Shareholder Brief · May 2026',
    summary:
      'Digital channel growth telemetry, SME loan book quality, and interim dividend payment schedule for registered shareholders.',
  },
];

