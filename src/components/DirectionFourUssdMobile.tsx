import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { NIGERIAN_BANKS, TIER_LIMITS } from '../data/mockBankingData';
import { BankAccount, BankTransaction, CurrencyCode } from '../types/banking';
import { formatMoney, formatNgn } from '../utils/formatCurrency';

interface DirectionFourUssdMobileProps {
  account: BankAccount;
  transactions: BankTransaction[];
  currency: CurrencyCode;
  onExecuteTransaction: (
    tx: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>
  ) => BankTransaction;
  onSetCardFrozen: (frozen: boolean) => void;
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
}

type MobileTab = 'accounts' | 'transfer' | 'bills' | 'support';

export const DirectionFourUssdMobile: React.FC<DirectionFourUssdMobileProps> = ({
  account,
  transactions,
  currency,
  onExecuteTransaction,
  onSetCardFrozen,
  onOpenOnboarding,
}) => {
  const [mobileTab, setMobileTab] = useState<MobileTab>('accounts');

  // Progressive 2-step mobile transfer
  const [step, setStep] = useState<1 | 2>(1);
  const [bankCode, setBankCode] = useState('033');
  const [nuban, setNuban] = useState('2019485712');
  const [amount, setAmount] = useState('3500');
  const [pin, setPin] = useState('1234');
  const [mobileNotice, setMobileNotice] = useState('');

  // Quick Mobile Bill
  const [billPhone, setBillPhone] = useState('0803 412 8890');
  const [billAmt, setBillAmt] = useState('1000');

  // Interactive USSD *9190# Simulator
  const [ussdScreen, setUssdScreen] = useState<string>(
    `Welcome to Redcrest *9190#\n1. Check Balance\n2. Airtime Self (₦1,000)\n3. Quick NIP (₦2,000)\n4. Freeze Debit Card`
  );
  const [ussdInput, setUssdInput] = useState('');

  const tierSpec = TIER_LIMITS[account.tier] ?? TIER_LIMITS['Tier 1'];

  const handleMobileTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileNotice('');
    const amt = Number(amount);
    if (step === 1) {
      if (!/^\d{10}$/.test(nuban) || !Number.isFinite(amt) || amt < 100) {
        setMobileNotice('Enter valid 10-digit NUBAN & amount.');
        return;
      }
      setStep(2);
      return;
    }

    if (pin !== '1234') {
      setMobileNotice('Invalid PIN (use 1234).');
      return;
    }
    if (amt > account.balanceNgn) {
      setMobileNotice('Insufficient funds.');
      return;
    }
    const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode) ?? NIGERIAN_BANKS[0];
    const tx = onExecuteTransaction({
      description: `Mobile Lite NIP (${nuban})`,
      counterparty: 'Verified Recipient',
      bankName: bank.name,
      channel: 'NIP Transfer',
      type: 'debit',
      amountNgn: amt,
      feeNgn: 10.75,
    });
    setStep(1);
    setMobileNotice(`Sent ${formatNgn(tx.amountNgn)} · Ref ${tx.reference}`);
  };

  const handleUssdCommand = (cmd: string) => {
    const choice = cmd.trim();
    setUssdInput('');
    if (choice === '1') {
      setUssdScreen(
        `Redcrest *9190# Balance\nAcct: ${account.nuban}\nAvail: ${formatNgn(account.balanceNgn)}\nTier: ${account.tier}\n\nEnter 0 for menu`
      );
    } else if (choice === '2') {
      if (account.balanceNgn >= 1000) {
        const tx = onExecuteTransaction({
          description: `USSD *9190# Self Airtime`,
          counterparty: account.phone,
          bankName: 'USSD Gateway',
          channel: 'Airtime & Data',
          type: 'debit',
          amountNgn: 1000,
          feeNgn: 0,
        });
        setUssdScreen(
          `Airtime Successful!\n₦1,000 sent to ${account.phone}\nRef: ${tx.reference}\n\nEnter 0 for menu`
        );
      } else {
        setUssdScreen(`Insufficient balance.\nEnter 0 for menu`);
      }
    } else if (choice === '3') {
      if (account.balanceNgn >= 2000) {
        const tx = onExecuteTransaction({
          description: `USSD *9190# Quick NIP`,
          counterparty: 'Saved Beneficiary',
          bankName: 'UBA',
          channel: 'NIP Transfer',
          type: 'debit',
          amountNgn: 2000,
          feeNgn: 10.75,
        });
        setUssdScreen(
          `Transfer Successful!\n₦2,000 sent via NIP\nRef: ${tx.reference}\n\nEnter 0 for menu`
        );
      } else {
        setUssdScreen(`Insufficient balance.\nEnter 0 for menu`);
      }
    } else if (choice === '4') {
      const nextState = !account.cardFrozen;
      onSetCardFrozen(nextState);
      setUssdScreen(
        `Card •••• ${account.cardLast4} is now ${nextState ? 'BLOCKED' : 'ACTIVE'}.\n\nEnter 0 for menu`
      );
    } else {
      setUssdScreen(
        `Welcome to Redcrest *9190#\n1. Check Balance\n2. Airtime Self (₦1,000)\n3. Quick NIP (₦2,000)\n4. ${
          account.cardFrozen ? 'Unblock' : 'Freeze'
        } Debit Card`
      );
    }
  };

  return (
    <div className="bg-zinc-100 py-10 dark:bg-[#090A0D]">
      <div className="mx-auto grid max-w-[1100px] items-start gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left: Mobile-First PWA Frame */}
        <div className="mx-auto w-full max-w-[410px] overflow-hidden rounded-3xl border-2 border-zinc-900 bg-white text-zinc-950 shadow-xl dark:border-zinc-700 lg:col-span-6">
          {/* High-Contrast Mobile Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <p className="font-display text-sm font-bold text-zinc-950">Redcrest Lite</p>
              <p className="font-mono text-[11px] text-zinc-600">
                3G/4G Mode · {account.nuban}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenOnboarding('personal')}
              className="min-h-[36px] rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-bold text-white"
            >
              Open Tier 1
            </button>
          </div>

          {/* Mobile Body */}
          <div className="min-h-[450px] p-5">
            {mobileTab === 'accounts' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                  <p className="text-xs text-zinc-300">
                    {account.holderName} · {account.tier}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
                    {formatMoney(account.balanceNgn, currency)}
                  </p>
                  <p className="mt-2 font-mono text-xs text-zinc-400">
                    Daily limit: {formatNgn(tierSpec.dailyTransferLimitNgn)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-zinc-950">Recent Activity</p>
                  <ul className="mt-2 divide-y divide-zinc-200">
                    {transactions.slice(0, 4).map((tx) => (
                      <li key={tx.id} className="flex items-center justify-between py-2.5 text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="truncate font-semibold text-zinc-950">{tx.description}</p>
                          <p className="font-mono text-[11px] text-zinc-500">{tx.bankName}</p>
                        </div>
                        <span className="font-mono font-bold tabular-nums text-zinc-950 whitespace-nowrap">
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatNgn(tx.amountNgn)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {mobileTab === 'transfer' && (
              <form onSubmit={handleMobileTransfer} className="space-y-4">
                <p className="font-display text-base font-bold text-zinc-950">
                  Progressive NIP Transfer · Step {step}/2
                </p>
                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800">Bank</label>
                      <select
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950"
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800">
                        10-Digit NUBAN
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={nuban}
                        onChange={(e) => setNuban(e.target.value.replace(/\D/g, ''))}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 px-3 font-mono text-sm text-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800">
                        Amount (NGN)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 px-3 font-mono text-base text-zinc-950"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="mb-3 rounded-xl bg-zinc-100 p-3 text-xs text-zinc-800">
                      Confirm sending <span className="font-mono font-bold">{formatNgn(Number(amount))}</span> to{' '}
                      <span className="font-mono">{nuban}</span>
                    </p>
                    <label className="block text-xs font-semibold text-zinc-800">
                      4-Digit PIN (Demo: 1234)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="mt-1 min-h-[44px] w-full rounded-xl border border-zinc-300 px-3 font-mono text-lg tracking-widest text-zinc-950"
                    />
                  </div>
                )}

                {mobileNotice && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-zinc-100 p-2.5 text-xs font-medium text-zinc-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{mobileNotice}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="min-h-[46px] w-full rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-bold text-white"
                >
                  {step === 1 ? 'Continue' : 'Authorize & Send'}
                </button>
              </form>
            )}

            {mobileTab === 'bills' && (
              <div className="space-y-4">
                <p className="font-display text-base font-bold text-zinc-950">
                  Instant Airtime Top-Up
                </p>
                <input
                  type="tel"
                  value={billPhone}
                  onChange={(e) => setBillPhone(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-zinc-300 px-3 font-mono text-sm text-zinc-950"
                />
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBillAmt(String(v))}
                      className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold ${
                        Number(billAmt) === v
                          ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                          : 'border-zinc-300 text-zinc-800'
                      }`}
                    >
                      ₦{v}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const amt = Number(billAmt);
                    if (amt <= account.balanceNgn) {
                      const tx = onExecuteTransaction({
                        description: `Mobile Airtime (${billPhone})`,
                        counterparty: billPhone,
                        bankName: 'MTN Nigeria',
                        channel: 'Airtime & Data',
                        type: 'debit',
                        amountNgn: amt,
                        feeNgn: 0,
                      });
                      setMobileNotice(`Recharged ${formatNgn(amt)} · ${tx.reference}`);
                    }
                  }}
                  className="min-h-[46px] w-full rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-bold text-white"
                >
                  Recharge {formatNgn(Number(billAmt))}
                </button>
                {mobileNotice && (
                  <p className="text-xs font-medium text-emerald-700">{mobileNotice}</p>
                )}
              </div>
            )}

            {mobileTab === 'support' && (
              <div className="space-y-4 text-xs">
                <p className="font-display text-base font-bold text-zinc-950">
                  Card &amp; Offline Help
                </p>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="font-bold text-zinc-950">
                    Debit Card •••• {account.cardLast4}: {account.cardFrozen ? 'BLOCKED' : 'ACTIVE'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSetCardFrozen(!account.cardFrozen)}
                    className="mt-3 min-h-[44px] w-full rounded-xl bg-zinc-950 px-4 py-2 font-bold text-white"
                  >
                    {account.cardFrozen ? 'Unblock Card' : 'Emergency Block Card'}
                  </button>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="font-bold text-zinc-950">24/7 Nigerian Toll-Free</p>
                  <p className="mt-1 font-mono text-zinc-700">+234 700 733 2737 · *9190#</p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom 4-Tab Thumb Bar */}
          <nav
            aria-label="Mobile quick tabs"
            className="grid grid-cols-4 border-t border-zinc-200 bg-white"
          >
            {(
              [
                { id: 'accounts', label: 'Accounts', icon: Wallet },
                { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
                { id: 'bills', label: 'Bills', icon: Smartphone },
                { id: 'support', label: 'Support', icon: HelpCircle },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMobileTab(tab.id);
                    setMobileNotice('');
                  }}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-bold ${
                    active ? 'text-[#DC2626]' : 'text-zinc-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Offline *9190# USSD Simulator */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] lg:col-span-6">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="h-5 w-5 text-[#DC2626]" />
            <div>
              <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Interactive *9190# USSD Fallback Simulator
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Zero-data banking session synced directly with your live account ledger.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs leading-relaxed whitespace-pre-line text-emerald-400">
            {ussdScreen}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['1', '2', '3', '4', '0'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleUssdCommand(num)}
                className="min-h-[42px] min-w-[48px] rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm font-bold text-zinc-950 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                {num === '0' ? 'Menu (0)' : `Press ${num}`}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUssdCommand(ussdInput);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={ussdInput}
              onChange={(e) => setUssdInput(e.target.value)}
              placeholder="Enter USSD option (1–4 or 0)..."
              className="min-h-[42px] flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <button
              type="submit"
              className="min-h-[42px] rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-bold text-white"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
