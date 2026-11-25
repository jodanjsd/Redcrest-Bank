import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Lock,
  Printer,
  Receipt,
  Search,
  ShieldAlert,
  Smartphone,
  Unlock,
} from 'lucide-react';
import {
  BILLER_OPTIONS,
  NIGERIAN_BANKS,
  TIER_LIMITS,
} from '../data/mockBankingData';
import {
  BankAccount,
  BankTransaction,
  CurrencyCode,
  DisputeRecord,
} from '../types/banking';
import { formatMoney, formatNgn } from '../utils/formatCurrency';
import { BrandLogo } from './BrandLogo';

interface InternetBankingDashboardProps {
  account: BankAccount;
  transactions: BankTransaction[];
  disputes: DisputeRecord[];
  currency: CurrencyCode;
  onExecuteTransaction: (tx: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>) => BankTransaction;
  onSetCardFrozen: (frozen: boolean) => void;
  onUpgradeTier: () => void;
  onOpenAssistant: () => void;
}

type DashboardTab = 'overview' | 'transfer' | 'bills' | 'security';

interface PendingAuthAction {
  kind: 'transfer' | 'bill';
  summary: string;
  amountNgn: number;
  feeNgn: number;
  payload: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>;
}

export const InternetBankingDashboard: React.FC<InternetBankingDashboardProps> = ({
  account,
  transactions,
  disputes,
  currency,
  onExecuteTransaction,
  onSetCardFrozen,
  onUpgradeTier,
  onOpenAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [hideBalance, setHideBalance] = useState(false);

  // 5-minute session inactivity timeout (300,000 ms)
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    if (isSessionLocked) return;
    let timeoutId = window.setTimeout(() => setIsSessionLocked(true), 5 * 60 * 1000);
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsSessionLocked(true), 5 * 60 * 1000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isSessionLocked]);

  // Statement filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // Transfer form state
  const [destBankCode, setDestBankCode] = useState('058');
  const [destNuban, setDestNuban] = useState('0149283710');
  const [transferAmount, setTransferAmount] = useState('15000');
  const [narration, setNarration] = useState('Invoice settlement');
  const [transferError, setTransferError] = useState('');

  // Bills form state
  const [selectedBillerId, setSelectedBillerId] = useState(BILLER_OPTIONS[0].id);
  const [billerIdentifier, setBillerIdentifier] = useState('0803 412 8890');
  const [billAmount, setBillAmount] = useState('5000');
  const [billError, setBillError] = useState('');

  // 2FA + 4-digit PIN modal
  const [pendingAction, setPendingAction] = useState<PendingAuthAction | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Automated Receipt modal
  const [receiptTx, setReceiptTx] = useState<BankTransaction | null>(null);

  const tierSpec = TIER_LIMITS[account.tier] ?? TIER_LIMITS['Tier 1'];
  const remainingDailyLimit = Math.max(0, tierSpec.dailyTransferLimitNgn - account.dailySpentNgn);
  const dailyPercent = Math.min(
    100,
    Math.round((account.dailySpentNgn / tierSpec.dailyTransferLimitNgn) * 100)
  );

  // Deterministic Nigerian beneficiary name lookup from NUBAN
  const resolvedBeneficiary = useMemo(() => {
    if (!/^\d{10}$/.test(destNuban)) return '';
    const sampleNames = [
      'Tunde Adeyemi',
      'Ngozi Eze',
      'Ibrahim Musa',
      'Folake Williams',
      'Kelechi Okonkwo',
      'Amina Abdullahi',
    ];
    const index = Number(destNuban.slice(-2)) % sampleNames.length;
    return sampleNames[index];
  }, [destNuban]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesChannel = channelFilter === 'ALL' || tx.channel === channelFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.bankName.toLowerCase().includes(q);
      return matchesChannel && matchesSearch;
    });
  }, [transactions, channelFilter, searchQuery]);

  const handleDownloadCsv = () => {
    const headers = ['Date', 'Reference', 'Description', 'Counterparty', 'Bank', 'Channel', 'Type', 'Amount (NGN)', 'Fee (NGN)', 'Status'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.dateIso).toISOString(),
      tx.reference,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.counterparty.replace(/"/g, '""')}"`,
      `"${tx.bankName}"`,
      tx.channel,
      tx.type,
      tx.amountNgn.toFixed(2),
      tx.feeNgn.toFixed(2),
      tx.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `redcrest-statement-${account.nuban}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    const amount = Number(transferAmount);
    const selectedBank = NIGERIAN_BANKS.find((b) => b.code === destBankCode) ?? NIGERIAN_BANKS[0];

    if (!/^\d{10}$/.test(destNuban)) {
      setTransferError('Enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 100) {
      setTransferError('Minimum NIP transfer amount is ₦100.00.');
      return;
    }
    if (amount > tierSpec.singleTransferLimitNgn) {
      setTransferError(
        `Amount exceeds your ${account.tier} single-transfer limit of ${formatNgn(tierSpec.singleTransferLimitNgn)}.`
      );
      return;
    }
    if (amount > remainingDailyLimit) {
      setTransferError(
        `Exceeds remaining daily transfer limit (${formatNgn(remainingDailyLimit)} left today).`
      );
      return;
    }
    const fee = selectedBank.code === '000' ? 0 : amount <= 5000 ? 10.75 : amount <= 50000 ? 26.88 : 53.75;
    if (amount + fee > account.balanceNgn) {
      setTransferError('Insufficient account balance including NIP statutory fee.');
      return;
    }

    setPinInput('');
    setOtpInput('');
    setAuthError('');
    setPendingAction({
      kind: 'transfer',
      summary: `NIP Transfer to ${resolvedBeneficiary} (${selectedBank.name} · ${destNuban})`,
      amountNgn: amount,
      feeNgn: fee,
      payload: {
        description: narration.trim() || `Transfer to ${resolvedBeneficiary}`,
        counterparty: resolvedBeneficiary,
        bankName: selectedBank.name,
        channel: 'NIP Transfer',
        type: 'debit',
        amountNgn: amount,
        feeNgn: fee,
      },
    });
  };

  const activeBiller =
    BILLER_OPTIONS.find((b) => b.id === selectedBillerId) ?? BILLER_OPTIONS[0];

  const handleInitiateBill = (e: React.FormEvent) => {
    e.preventDefault();
    setBillError('');
    const amount = Number(billAmount);
    if (!billerIdentifier.trim()) {
      setBillError(`Enter a valid ${activeBiller.identifierLabel}.`);
      return;
    }
    if (!Number.isFinite(amount) || amount < 100) {
      setBillError('Enter an amount of at least ₦100.');
      return;
    }
    const fee = activeBiller.category === 'Airtime & Data' ? 0 : 100;
    if (amount + fee > account.balanceNgn) {
      setBillError('Insufficient balance for this bill payment.');
      return;
    }

    setPinInput('');
    setOtpInput('');
    setAuthError('');
    setPendingAction({
      kind: 'bill',
      summary: `${activeBiller.provider} (${billerIdentifier.trim()})`,
      amountNgn: amount,
      feeNgn: fee,
      payload: {
        description: `${activeBiller.provider} · ${billerIdentifier.trim()}`,
        counterparty: activeBiller.provider,
        bankName: 'Interswitch Bills',
        channel: activeBiller.category === 'Airtime & Data' ? 'Airtime & Data' : 'Bill Payment',
        type: 'debit',
        amountNgn: amount,
        feeNgn: fee,
      },
    });
  };

  const handleConfirmPinAndOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (pinInput.trim() !== '1234') {
      setAuthError('Incorrect 4-digit Transaction PIN. (Demo PIN: 1234)');
      return;
    }
    if (otpInput.trim() !== '482910') {
      setAuthError('Invalid 2FA OTP token. (Demo OTP: 482910)');
      return;
    }
    if (!pendingAction) return;

    const executed = onExecuteTransaction(pendingAction.payload);
    setPendingAction(null);
    setReceiptTx(executed);
  };

  if (isSessionLocked) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-[#14161A]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-zinc-950 dark:text-white">
            Session Locked for Security
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Internet Banking locks automatically after 5 minutes of inactivity. Enter your 4-digit PIN (1234) to resume.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (unlockPin === '1234') {
                setIsSessionLocked(false);
                setUnlockPin('');
                setUnlockError('');
              } else {
                setUnlockError('Invalid PIN. Use 1234 to unlock.');
              }
            }}
            className="mt-5 space-y-4"
          >
            <input
              type="password"
              maxLength={4}
              value={unlockPin}
              onChange={(e) => setUnlockPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-lg tracking-widest text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {unlockError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{unlockError}</p>
            )}
            <button
              type="submit"
              className="w-full min-h-[42px] rounded-lg bg-[#0B2545] px-4 py-2 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
            >
              Unlock Session
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Workspace Grid: 240px Sidebar + Main Content */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#14161A]">
            <img
              src="/src/assets/images/personal_mobile_banking_1795605572819.jpg"
              alt={account.holderName}
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-full border border-zinc-200 object-cover object-top dark:border-zinc-700"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {account.accountType}
              </p>
              <p className="mt-0.5 truncate font-display text-sm font-bold text-zinc-950 dark:text-white">
                {account.holderName}
              </p>
              <p className="mt-0.5 font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
                {account.nuban} · {account.tier}
              </p>
            </div>
          </div>

          <nav aria-label="Banking dashboard sections" className="space-y-1">
            {[
              { id: 'overview', label: 'Account Overview', icon: LayoutDashboard },
              { id: 'transfer', label: 'NIP Funds Transfer', icon: ArrowRightLeft },
              { id: 'bills', label: 'Bills & Airtime', icon: Smartphone },
              { id: 'security', label: 'Card & Disputes', icon: ShieldAlert },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={onOpenAssistant}
              className="flex min-h-[40px] w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Ask Kola Virtual Banker
            </button>
            <button
              type="button"
              onClick={() => setIsSessionLocked(true)}
              className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <Lock className="h-3.5 w-3.5" />
              Lock Session
            </button>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="min-w-0 space-y-6">
          {/* Top Breadcrumb Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Internet Banking /{' '}
                {activeTab === 'overview'
                  ? 'Account Overview'
                  : activeTab === 'transfer'
                  ? 'NIP Funds Transfer'
                  : activeTab === 'bills'
                  ? 'Bills & Airtime'
                  : 'Card & Disputes'}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {activeTab === 'overview' && 'Account Summary & Statement'}
                {activeTab === 'transfer' && 'Send Money via NIBSS NIP'}
                {activeTab === 'bills' && 'Airtime, Data & Utility Bills'}
                {activeTab === 'security' && 'Card Controls & Transaction Disputes'}
              </h1>
            </div>

            {activeTab === 'overview' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 whitespace-nowrap"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Account Balance + Tier Limit Row */}
              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Available Ledger Balance · {currency}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHideBalance((prev) => !prev)}
                      aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {hideBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <span>{hideBalance ? 'Show' : 'Hide'}</span>
                    </button>
                  </div>

                  <p className="mt-2 font-mono text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white sm:text-4xl">
                    {hideBalance ? '•••••••••' : formatMoney(account.balanceNgn, currency)}
                  </p>
                  {currency !== 'NGN' && !hideBalance && (
                    <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      Base NGN Ledger: {formatNgn(account.balanceNgn)}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('transfer')}
                      className="min-h-[40px] rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
                    >
                      New NIP Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bills')}
                      className="min-h-[40px] rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      Pay Bills &amp; Airtime
                    </button>
                  </div>
                </div>

                {/* CBN Tier & Daily Limit Box */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      CBN Compliance Tier
                    </span>
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white">
                      {account.tier}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-lg font-bold tabular-nums text-zinc-950 dark:text-white">
                    {formatNgn(remainingDailyLimit)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    remaining of {formatNgn(tierSpec.dailyTransferLimitNgn)} daily limit
                  </p>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-[#0B2545] dark:bg-[#60A5FA]"
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                    Single limit: <span className="font-mono tabular-nums">{formatNgn(tierSpec.singleTransferLimitNgn)}</span>
                  </p>

                  {account.tier === 'Tier 1' && (
                    <button
                      type="button"
                      onClick={onUpgradeTier}
                      className="mt-3 text-xs font-semibold text-[#0B2545] hover:underline dark:text-[#60A5FA]"
                    >
                      Upgrade to Tier 2 (₦1M/day)
                    </button>
                  )}
                </div>
              </div>

              {/* Filterable Transaction History Table */}
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#14161A]">
                <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reference, counterparty, bank..."
                      className="min-h-[38px] w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pr-3 pl-9 text-xs text-zinc-950 focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
                    {['ALL', 'NIP Transfer', 'Bill Payment', 'Airtime & Data', 'Inward Credit'].map(
                      (ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setChannelFilter(ch)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                            channelFilter === ch
                              ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                              : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                          }`}
                        >
                          {ch === 'ALL' ? 'All' : ch}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="p-10 text-center">
                    <FileText className="mx-auto h-7 w-7 text-zinc-400" />
                    <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                      No matching transactions
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Try clearing your search filter or initiate a transfer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Description &amp; Reference</th>
                          <th className="px-4 py-3 font-medium">Channel</th>
                          <th className="px-4 py-3 font-medium text-right">Amount</th>
                          <th className="px-4 py-3 font-medium text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono tabular-nums text-zinc-500 whitespace-nowrap">
                              {new Date(tx.dateIso).toLocaleDateString('en-NG', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-zinc-950 dark:text-zinc-100">
                                {tx.description}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                                {tx.counterparty} · {tx.bankName} · {tx.reference}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                              {tx.channel}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                                tx.type === 'credit'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-zinc-950 dark:text-zinc-100'
                              }`}
                            >
                              {tx.type === 'credit' ? '+' : '-'}
                              {formatMoney(tx.amountNgn, currency)}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setReceiptTx(tx)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#0B2545] hover:underline dark:text-[#60A5FA]"
                              >
                                <Receipt className="h-3.5 w-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'transfer' && (
            <div className="max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
              <form onSubmit={handleInitiateTransfer} className="space-y-4">
                <div>
                  <label
                    htmlFor="nip-bank"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Destination Bank (NIBSS NIP)
                  </label>
                  <select
                    id="nip-bank"
                    value={destBankCode}
                    onChange={(e) => setDestBankCode(e.target.value)}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  >
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name} ({bank.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="nip-nuban"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Beneficiary 10-Digit NUBAN
                  </label>
                  <input
                    id="nip-nuban"
                    type="text"
                    maxLength={10}
                    value={destNuban}
                    onChange={(e) => setDestNuban(e.target.value.replace(/\D/g, ''))}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  {resolvedBeneficiary && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Account Name: {resolvedBeneficiary}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="nip-amount"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Amount (NGN)
                  </label>
                  <input
                    id="nip-amount"
                    type="number"
                    min={100}
                    step="0.01"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-base tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Available: <span className="font-mono tabular-nums">{formatNgn(account.balanceNgn)}</span> · Single limit:{' '}
                    <span className="font-mono tabular-nums">{formatNgn(tierSpec.singleTransferLimitNgn)}</span>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="nip-narration"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Narration
                  </label>
                  <input
                    id="nip-narration"
                    type="text"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                {transferError && (
                  <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {transferError}
                  </p>
                )}

                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
                >
                  Continue to PIN &amp; 2FA Verification
                </button>
              </form>
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
              <form onSubmit={handleInitiateBill} className="space-y-4">
                <div>
                  <label
                    htmlFor="biller-select"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Service Provider
                  </label>
                  <select
                    id="biller-select"
                    value={selectedBillerId}
                    onChange={(e) => {
                      const next = BILLER_OPTIONS.find((b) => b.id === e.target.value);
                      setSelectedBillerId(e.target.value);
                      if (next) {
                        setBillerIdentifier(next.identifierPlaceholder);
                        setBillAmount(String(next.quickAmountsNgn[0]));
                      }
                    }}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  >
                    {BILLER_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.category} — {b.provider}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="biller-id"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {activeBiller.identifierLabel}
                  </label>
                  <input
                    id="biller-id"
                    type="text"
                    value={billerIdentifier}
                    onChange={(e) => setBillerIdentifier(e.target.value)}
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bill-amount"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Amount (NGN)
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {activeBiller.quickAmountsNgn.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBillAmount(String(preset))}
                        className={`rounded-lg border px-3 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                          Number(billAmount) === preset
                            ? 'border-[#0B2545] bg-[#0B2545]/10 font-semibold text-[#0B2545] dark:border-[#60A5FA] dark:text-[#60A5FA]'
                            : 'border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {formatNgn(preset)}
                      </button>
                    ))}
                  </div>
                  <input
                    id="bill-amount"
                    type="number"
                    min={100}
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="mt-2.5 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-base tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                {billError && (
                  <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {billError}
                  </p>
                )}

                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
                >
                  Verify &amp; Pay Bill
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card Controls */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                    <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                      Verve / Mastercard •••• {account.cardLast4}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      account.cardFrozen
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {account.cardFrozen ? 'Frozen' : 'Active'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Instantly block ATM withdrawals, POS terminals, and online card spending if your card is misplaced. You can also instruct Kola via chat.
                </p>
                <button
                  type="button"
                  onClick={() => onSetCardFrozen(!account.cardFrozen)}
                  className={`mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                    account.cardFrozen
                      ? 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950'
                      : 'border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {account.cardFrozen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {account.cardFrozen ? 'Unblock Debit Card' : 'Freeze Debit Card Immediately'}
                </button>
              </div>

              {/* Logged Disputes */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                    Transaction Disputes ({disputes.length})
                  </h2>
                  <button
                    type="button"
                    onClick={onOpenAssistant}
                    className="text-xs font-medium text-[#0B2545] hover:underline dark:text-[#60A5FA]"
                  >
                    Log with Kola
                  </button>
                </div>

                {disputes.length === 0 ? (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    No active transaction disputes. Use Kola Virtual Banker if an NIP or POS transaction debited without value.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {disputes.map((d) => (
                      <li key={d.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-zinc-950 dark:text-white">
                            {d.ticketNumber}
                          </span>
                          <span className="text-amber-700 dark:text-amber-400">{d.status}</span>
                        </div>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{d.summary}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4-Digit Transaction PIN + 2FA OTP Verification Modal */}
      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#14161A]">
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
              Authorize Transaction
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {pendingAction.summary}
            </p>
            <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 font-mono text-xs tabular-nums dark:bg-zinc-900">
              <div className="flex justify-between">
                <span className="text-zinc-500">Principal</span>
                <span className="font-semibold text-zinc-950 dark:text-white">
                  {formatNgn(pendingAction.amountNgn)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-zinc-500">CBN / Gateway Fee</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {formatNgn(pendingAction.feeNgn)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPinAndOtp} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  4-Digit Transaction PIN (Demo: 1234)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm tracking-widest text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  2FA SMS / Token OTP (Demo: 482910)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="482910"
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm tracking-widest text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              {authError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{authError}</p>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('1234');
                    setOtpInput('482910');
                  }}
                  className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Auto-fill Demo 2FA
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingAction(null)}
                    className="min-h-[40px] rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
                  >
                    Confirm &amp; Execute
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated Transaction Receipt Modal */}
      {receiptTx && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#14161A]">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div>
                <div className="text-[#0B2545] dark:text-white">
                  <BrandLogo size="sm" />
                </div>
                <p className="mt-1 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                  {receiptTx.status} · {receiptTx.channel}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount</span>
                <span className="font-mono text-base font-bold tabular-nums text-zinc-950 dark:text-white">
                  {formatNgn(receiptTx.amountNgn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Reference</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-200">{receiptTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Beneficiary / Biller</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{receiptTx.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Institution</span>
                <span className="text-zinc-900 dark:text-zinc-200">{receiptTx.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Timestamp</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {new Date(receiptTx.dateIso).toLocaleString('en-NG')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="min-h-[40px] rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
