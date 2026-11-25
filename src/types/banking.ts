export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'GHS';

export type PortalPage = 'home' | 'personal' | 'business' | 'about' | 'investors' | 'media';

export type CountryRegion = {
  code: CurrencyCode;
  country: string;
  symbol: string;
  rateFromNgn: number;
};

export type PersonaCategory = 'individual' | 'sme' | 'student' | 'diaspora';

export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'SME Corporate';

export interface TierLimitSpec {
  tier: AccountTier;
  singleTransferLimitNgn: number;
  dailyTransferLimitNgn: number;
  maxBalanceNgn: number | null;
  kycRequirement: string;
}

export interface BankAccount {
  id: string;
  holderName: string;
  nuban: string;
  accountType: 'Personal Savings' | 'Business Current' | 'Campus Flex';
  tier: AccountTier;
  balanceNgn: number;
  dailySpentNgn: number;
  cardLast4: string;
  cardFrozen: boolean;
  bvnMasked: string;
  phone: string;
  email: string;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionChannel = 'NIP Transfer' | 'Bill Payment' | 'Airtime & Data' | 'Inward Credit' | 'POS / Card';

export interface BankTransaction {
  id: string;
  reference: string;
  dateIso: string;
  description: string;
  counterparty: string;
  bankName: string;
  channel: TransactionChannel;
  type: TransactionType;
  amountNgn: number;
  feeNgn: number;
  status: 'Completed' | 'Reversed' | 'Pending Review';
}

export interface DisputeRecord {
  id: string;
  ticketNumber: string;
  createdAtIso: string;
  summary: string;
  status: 'Logged · SLA 24h' | 'Under Investigation' | 'Resolved';
}

export interface PersonaProduct {
  id: string;
  persona: PersonaCategory;
  name: string;
  summary: string;
  tierLabel: string;
  dailyLimit: string;
  monthlyFee: string;
  onboardingMode: 'personal' | 'sme';
  highlights: string[];
}

export interface NigerianBank {
  code: string;
  name: string;
  category: 'Commercial' | 'Microfinance / Digital';
}

export interface BillerOption {
  id: string;
  category: 'Airtime & Data' | 'Electricity' | 'Cable TV';
  provider: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  quickAmountsNgn: number[];
}

export interface BranchLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  services: string;
  atmStatus: '24/7 Cash & Cardless' | '24/7 Cash Only';
  hours: string;
}

export interface FaqItem {
  id: string;
  category: 'Account Tiers' | 'NIP Transfers' | 'Card & Security' | 'SME & CAC';
  question: string;
  answer: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionBadge?: string;
}
