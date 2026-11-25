import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { NIGERIAN_BANKS, TIER_LIMITS } from '../data/mockBankingData';
import {
  BankAccount,
  BankTransaction,
  CurrencyCode,
  DisputeRecord,
} from '../types/banking';
import { formatMoney, formatNgn } from '../utils/formatCurrency';

interface DirectionThreeBentoProps {
  account: BankAccount;
  transactions: BankTransaction[];
  currency: CurrencyCode;
  onExecuteTransaction: (
    tx: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>
  ) => BankTransaction;
  onLogDispute: (summary: string) => DisputeRecord;
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
}

const PAYROLL_BATCH = [
  { name: 'Chidinma Okafor', role: 'Operations Lead', nuban: '0192837465', bank: 'GTBank', netNgn: 35000 },
  { name: 'Yusuf Ibrahim', role: 'Logistics Supervisor', nuban: '2091847563', bank: 'UBA', netNgn: 28000 },
  { name: 'Toluwani Adeola', role: 'Store Cashier', nuban: '3019284751', bank: 'Access Bank', netNgn: 22000 },
];

export const DirectionThreeBento: React.FC<DirectionThreeBentoProps> = ({
  account,
  transactions,
  currency,
  onExecuteTransaction,
  onLogDispute,
  onOpenOnboarding,
}) => {
  const [selectedTx, setSelectedTx] = useState<BankTransaction>(transactions[0]);
  const [quickBank, setQuickBank] = useState('044');
  const [quickNuban, setQuickNuban] = useState('0291847561');
  const [quickAmount, setQuickAmount] = useState('18000');
  const [quickPin, setQuickPin] = useState('1234');
  const [quickNotice, setQuickNotice] = useState('');

  const [payrollSent, setPayrollSent] = useState(false);
  const [disputeMsg, setDisputeMsg] = useState('');

  const tierSpec = TIER_LIMITS[account.tier] ?? TIER_LIMITS['Tier 1'];
  const totalInflow = transactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, t) => acc + t.amountNgn, 0);
  const totalOutflow = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, t) => acc + t.amountNgn, 0);

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickNotice('');
    const amt = Number(quickAmount);
    if (!/^\d{10}$/.test(quickNuban) || !Number.isFinite(amt) || amt < 100) {
      setQuickNotice('Enter a valid 10-digit NUBAN and amount >= ₦100.');
      return;
    }
    if (amt > account.balanceNgn) {
      setQuickNotice('Insufficient balance.');
      return;
    }
    if (quickPin !== '1234') {
      setQuickNotice('Use demo PIN 1234.');
      return;
    }
    const bank = NIGERIAN_BANKS.find((b) => b.code === quickBank) ?? NIGERIAN_BANKS[0];
    const tx = onExecuteTransaction({
      description: `Bento Quick NIP (${quickNuban})`,
      counterparty: 'Merchant Beneficiary',
      bankName: bank.name,
      channel: 'NIP Transfer',
      type: 'debit',
      amountNgn: amt,
      feeNgn: 26.88,
    });
    setSelectedTx(tx);
    setQuickNotice(`Dispatched ${tx.reference}`);
  };

  const payrollTotal = PAYROLL_BATCH.reduce((sum, p) => sum + p.netNgn, 0);

  const handleRunPayroll = () => {
    if (payrollTotal > account.balanceNgn) return;
    const tx = onExecuteTransaction({
      description: `SME Batch Payroll (${PAYROLL_BATCH.length} staff)`,
      counterparty: 'Redcrest Bulk Disbursement',
      bankName: 'Multi-Bank NIP',
      channel: 'NIP Transfer',
      type: 'debit',
      amountNgn: payrollTotal,
      feeNgn: 80.64,
    });
    setSelectedTx(tx);
    setPayrollSent(true);
  };

  return (
    <div className="bg-[#F7F7F5] py-8 dark:bg-[#0C0E12]">
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Top Row: Treasury Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#D97706]">
              SME Treasury &amp; Merchant Operating Grid
            </p>
            <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
              Modular Bento Command Center
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onOpenOnboarding('sme')}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E293B] dark:bg-[#D97706] dark:text-zinc-950"
          >
            <Building2 className="h-4 w-4" />
            Onboard CAC Business
          </button>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Col-Span-2 Marquee Treasury Tile */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14171D] lg:col-span-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Consolidated Treasury Balance ({currency})</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-[#0F172A] dark:text-white">
                  {formatMoney(account.balanceNgn, currency)}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#D97706]">
                {account.tier} · {account.nuban}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-5 text-xs dark:border-zinc-800">
              <div>
                <p className="text-zinc-500">Period Inflows</p>
                <p className="mt-1 font-mono text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  +{formatMoney(totalInflow, currency)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Period Outflows</p>
                <p className="mt-1 font-mono text-base font-bold tabular-nums text-zinc-950 dark:text-white">
                  -{formatMoney(totalOutflow, currency)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Daily Limit Headroom</p>
                <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#0F172A] dark:text-zinc-200">
                  {formatMoney(Math.max(0, tierSpec.dailyTransferLimitNgn - account.dailySpentNgn), currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick NIP Tile */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14171D] lg:col-span-5">
            <h2 className="font-display text-sm font-bold text-[#0F172A] dark:text-white">
              Quick NIP Vendor Payout
            </h2>
            <form onSubmit={handleQuickSend} className="mt-3 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={quickBank}
                  onChange={(e) => setQuickBank(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  maxLength={10}
                  value={quickNuban}
                  onChange={(e) => setQuickNuban(e.target.value.replace(/\D/g, ''))}
                  placeholder="NUBAN"
                  className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="Amount NGN"
                  className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
                <input
                  type="password"
                  maxLength={4}
                  value={quickPin}
                  onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN (1234)"
                  className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 font-semibold text-white hover:bg-[#1E293B] dark:bg-[#D97706] dark:text-zinc-950"
              >
                <span>Execute Payout</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {quickNotice && (
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  {quickNotice}
                </p>
              )}
            </form>
          </div>

          {/* Ledger Table (7 cols) + Right-Hand Split-Pane Inspection Rail (5 cols) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14171D] lg:col-span-7">
            <div className="flex items-center justify-between pb-3">
              <h2 className="font-display text-sm font-bold text-[#0F172A] dark:text-white">
                Settlement Ledger (Select Row to Inspect)
              </h2>
              <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 font-medium">Counterparty</th>
                    <th className="py-2 font-medium">Channel</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {transactions.slice(0, 6).map((tx) => {
                    const active = selectedTx?.id === tx.id;
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => {
                          setSelectedTx(tx);
                          setDisputeMsg('');
                        }}
                        className={`cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#0F172A]/5 dark:bg-zinc-800/70'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                        }`}
                      >
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-zinc-950 dark:text-white">{tx.counterparty}</p>
                          <p className="font-mono text-[11px] text-zinc-500">{tx.reference}</p>
                        </td>
                        <td className="py-2.5 text-zinc-600 dark:text-zinc-400">{tx.channel}</td>
                        <td
                          className={`py-2.5 text-right font-mono font-semibold tabular-nums ${
                            tx.type === 'credit'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-zinc-950 dark:text-white'
                          }`}
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatMoney(tx.amountNgn, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right-Hand Inspection Rail + Bulk Payroll */}
          <div className="space-y-5 lg:col-span-5">
            {selectedTx && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14171D]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500">Transaction Inspector</p>
                  <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
                    {selectedTx.status}
                  </span>
                </div>
                <p className="mt-1 font-display text-base font-bold text-[#0F172A] dark:text-white">
                  {selectedTx.description}
                </p>
                <div className="mt-3 space-y-1.5 border-t border-zinc-200 pt-3 font-mono text-xs dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reference</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{selectedTx.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bank</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{selectedTx.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Amount</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">
                      {formatNgn(selectedTx.amountNgn)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rec = onLogDispute(`Inspector Dispute: ${selectedTx.reference}`);
                    setDisputeMsg(`Dispute ${rec.ticketNumber} opened for ${selectedTx.reference}`);
                  }}
                  className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-[#D97706]" />
                  Flag Settlement Dispute
                </button>
                {disputeMsg && (
                  <p className="mt-2 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                    {disputeMsg}
                  </p>
                )}
              </div>
            )}

            {/* SME Bulk Payroll Run */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14171D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#D97706]" />
                  <h3 className="font-display text-sm font-bold text-[#0F172A] dark:text-white">
                    SME Bulk Payroll Batch
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatNgn(payrollTotal)}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                {PAYROLL_BATCH.map((row) => (
                  <li key={row.nuban} className="flex justify-between">
                    <span>
                      {row.name} ({row.bank})
                    </span>
                    <span className="font-mono tabular-nums">{formatNgn(row.netNgn)}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={payrollSent || payrollTotal > account.balanceNgn}
                onClick={handleRunPayroll}
                className="mt-4 flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E293B] disabled:opacity-50 dark:bg-[#D97706] dark:text-zinc-950"
              >
                {payrollSent ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Batch Disbursed
                  </>
                ) : (
                  'Approve & Disburse Batch'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
