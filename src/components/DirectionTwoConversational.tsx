import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Unlock,
} from 'lucide-react';
import { NIGERIAN_BANKS, TIER_LIMITS } from '../data/mockBankingData';
import {
  BankAccount,
  BankTransaction,
  CurrencyCode,
  DisputeRecord,
} from '../types/banking';
import { formatMoney, formatNgn } from '../utils/formatCurrency';

interface DirectionTwoConversationalProps {
  account: BankAccount;
  transactions: BankTransaction[];
  currency: CurrencyCode;
  onExecuteTransaction: (
    tx: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>
  ) => BankTransaction;
  onSetCardFrozen: (frozen: boolean) => void;
  onLogDispute: (summary: string) => DisputeRecord;
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
}

type StreamItem =
  | { id: string; kind: 'text'; role: 'user' | 'assistant'; text: string; meta?: string }
  | { id: string; kind: 'transfer_form'; completedTx?: BankTransaction }
  | { id: string; kind: 'airtime_form'; completedTx?: BankTransaction }
  | { id: string; kind: 'balance_card' };

export const DirectionTwoConversational: React.FC<DirectionTwoConversationalProps> = ({
  account,
  transactions,
  currency,
  onExecuteTransaction,
  onSetCardFrozen,
  onLogDispute,
  onOpenOnboarding,
}) => {
  const [stream, setStream] = useState<StreamItem[]>([
    {
      id: 's-1',
      kind: 'text',
      role: 'assistant',
      text: `Welcome back, ${account.holderName.split(' ')[0]}. Type a banking command or pick an inline action below to transfer via NIP, top up airtime, check CBN tier limits, or freeze your card.`,
      meta: `NUBAN ${account.nuban} · ${account.tier}`,
    },
    { id: 's-2', kind: 'balance_card' },
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Inline Transfer state
  const [bankCode, setBankCode] = useState('058');
  const [nuban, setNuban] = useState('0149283710');
  const [amount, setAmount] = useState('12500');
  const [pin, setPin] = useState('1234');
  const [formError, setFormError] = useState('');

  // Inline Airtime state
  const [telco, setTelco] = useState('MTN Nigeria');
  const [phone, setPhone] = useState('0803 412 8890');
  const [airtimeAmt, setAirtimeAmt] = useState('2000');

  const tierSpec = TIER_LIMITS[account.tier] ?? TIER_LIMITS['Tier 1'];

  const appendUserAndAction = (label: string, nextItem: StreamItem) => {
    setFormError('');
    setStream((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, kind: 'text', role: 'user', text: label },
      nextItem,
    ]);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = promptInput.trim();
    if (!q || isSending) return;

    const lower = q.toLowerCase();
    setPromptInput('');

    if (lower.includes('transfer') || lower.includes('send')) {
      appendUserAndAction(q, { id: `tf-${Date.now()}`, kind: 'transfer_form' });
      return;
    }
    if (lower.includes('airtime') || lower.includes('data') || lower.includes('recharge')) {
      appendUserAndAction(q, { id: `af-${Date.now()}`, kind: 'airtime_form' });
      return;
    }
    if (lower.includes('balance')) {
      appendUserAndAction(q, { id: `bc-${Date.now()}`, kind: 'balance_card' });
      return;
    }

    setStream((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, kind: 'text', role: 'user', text: q },
    ]);
    setIsSending(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          accountContext: {
            holderName: account.holderName,
            nuban: account.nuban,
            accountType: account.accountType,
            tier: account.tier,
            balanceNgn: account.balanceNgn,
            dailyLimitNgn: tierSpec.dailyTransferLimitNgn,
            cardFrozen: account.cardFrozen,
            disputeCount: 0,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assistant error');

      let meta: string | undefined;
      if (data.action === 'BLOCK_CARD') {
        onSetCardFrozen(true);
        meta = `Card •••• ${account.cardLast4} frozen`;
      } else if (data.action === 'UNBLOCK_CARD') {
        onSetCardFrozen(false);
        meta = `Card •••• ${account.cardLast4} reactivated`;
      } else if (data.action === 'LOG_DISPUTE') {
        const d = onLogDispute(data.disputeSummary || q);
        meta = `Dispute ${d.ticketNumber} logged`;
      }

      setStream((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          kind: 'text',
          role: 'assistant',
          text: data.reply,
          meta,
        },
      ]);
    } catch (err: unknown) {
      setStream((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          kind: 'text',
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Unable to process command.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleInlineTransfer = (itemId: string) => {
    setFormError('');
    const amt = Number(amount);
    if (!/^\d{10}$/.test(nuban)) {
      setFormError('Enter a valid 10-digit NUBAN.');
      return;
    }
    if (!Number.isFinite(amt) || amt < 100 || amt > account.balanceNgn) {
      setFormError('Enter an amount within your available balance.');
      return;
    }
    if (pin !== '1234') {
      setFormError('Enter demo PIN 1234 to authorize.');
      return;
    }
    const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode) ?? NIGERIAN_BANKS[0];
    const tx = onExecuteTransaction({
      description: `Command NIP Transfer (${nuban})`,
      counterparty: 'Verified Recipient',
      bankName: bank.name,
      channel: 'NIP Transfer',
      type: 'debit',
      amountNgn: amt,
      feeNgn: 26.88,
    });
    setStream((prev) =>
      prev.map((item) =>
        item.id === itemId && item.kind === 'transfer_form'
          ? { ...item, completedTx: tx }
          : item
      )
    );
  };

  const handleInlineAirtime = (itemId: string) => {
    const amt = Number(airtimeAmt);
    if (!Number.isFinite(amt) || amt < 100 || amt > account.balanceNgn) return;
    const tx = onExecuteTransaction({
      description: `${telco} Airtime (${phone})`,
      counterparty: phone,
      bankName: telco,
      channel: 'Airtime & Data',
      type: 'debit',
      amountNgn: amt,
      feeNgn: 0,
    });
    setStream((prev) =>
      prev.map((item) =>
        item.id === itemId && item.kind === 'airtime_form'
          ? { ...item, completedTx: tx }
          : item
      )
    );
  };

  return (
    <div className="bg-[#F4F6F8] py-8 dark:bg-[#0D1114]">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left/Main Column: Narrow Central Command Stream */}
        <section className="flex h-[680px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#13181C] lg:col-span-8">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div>
              <p className="font-display text-base font-bold text-zinc-950 dark:text-white">
                Conversational Command Gateway
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inline NIP transfers, airtime top-up, card locks &amp; Gemini 4 virtual banking
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenOnboarding('personal')}
              className="rounded-lg bg-[#047857] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#065F46] whitespace-nowrap"
            >
              Open NUBAN
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {stream.map((item) => {
              if (item.kind === 'text') {
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col ${
                      item.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        item.role === 'user'
                          ? 'bg-[#047857] text-white'
                          : 'border border-zinc-200 bg-[#F4F6F8] text-zinc-900 dark:border-zinc-800 dark:bg-[#1A2026] dark:text-zinc-100'
                      }`}
                    >
                      <p>{item.text}</p>
                      {item.meta && (
                        <p className="mt-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                          {item.meta}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.kind === 'balance_card') {
                return (
                  <div
                    key={item.id}
                    className="max-w-md rounded-2xl border border-zinc-200 bg-[#F4F6F8] p-4 dark:border-zinc-800 dark:bg-[#1A2026]"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{account.accountType}</span>
                      <span className="font-mono">{account.tier}</span>
                    </div>
                    <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-zinc-950 dark:text-white">
                      {formatMoney(account.balanceNgn, currency)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      NUBAN {account.nuban} · Daily limit remaining:{' '}
                      {formatNgn(Math.max(0, tierSpec.dailyTransferLimitNgn - account.dailySpentNgn))}
                    </p>
                  </div>
                );
              }

              if (item.kind === 'transfer_form') {
                if (item.completedTx) {
                  return (
                    <div
                      key={item.id}
                      className="max-w-md rounded-2xl border border-emerald-600/30 bg-emerald-50 p-4 text-xs dark:bg-emerald-950/30"
                    >
                      <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>NIP Transfer Dispatched · {item.completedTx.reference}</span>
                      </div>
                      <p className="mt-2 font-mono text-base font-bold tabular-nums text-zinc-950 dark:text-white">
                        {formatNgn(item.completedTx.amountNgn)}
                      </p>
                      <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                        {item.completedTx.bankName} · {item.completedTx.description}
                      </p>
                    </div>
                  );
                }
                return (
                  <div
                    key={item.id}
                    className="max-w-md space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 text-xs dark:border-zinc-700 dark:bg-[#1A2026]"
                  >
                    <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                      Inline NIP Transfer Card
                    </p>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="min-h-[38px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        maxLength={10}
                        value={nuban}
                        onChange={(e) => setNuban(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit NUBAN"
                        className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-mono text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount NGN"
                        className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-mono text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit PIN (1234)"
                      className="min-h-[38px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-mono text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    {formError && <p className="text-red-600 dark:text-red-400">{formError}</p>}
                    <button
                      type="button"
                      onClick={() => handleInlineTransfer(item.id)}
                      className="min-h-[38px] w-full rounded-lg bg-[#047857] px-4 py-2 font-semibold text-white hover:bg-[#065F46]"
                    >
                      Send Instantly
                    </button>
                  </div>
                );
              }

              if (item.kind === 'airtime_form') {
                if (item.completedTx) {
                  return (
                    <div
                      key={item.id}
                      className="max-w-md rounded-2xl border border-emerald-600/30 bg-emerald-50 p-4 text-xs dark:bg-emerald-950/30"
                    >
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Airtime Recharged · {item.completedTx.reference}
                      </p>
                      <p className="mt-1 font-mono text-zinc-900 dark:text-white">
                        {formatNgn(item.completedTx.amountNgn)} · {item.completedTx.description}
                      </p>
                    </div>
                  );
                }
                return (
                  <div
                    key={item.id}
                    className="max-w-md space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 text-xs dark:border-zinc-700 dark:bg-[#1A2026]"
                  >
                    <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                      Quick Airtime Top-Up
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={telco}
                        onChange={(e) => setTelco(e.target.value)}
                        className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      >
                        <option>MTN Nigeria</option>
                        <option>Airtel Nigeria</option>
                        <option>Glo Mobile</option>
                      </select>
                      <input
                        type="number"
                        value={airtimeAmt}
                        onChange={(e) => setAirtimeAmt(e.target.value)}
                        className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="min-h-[38px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineAirtime(item.id)}
                      className="min-h-[38px] w-full rounded-lg bg-[#047857] px-4 py-2 font-semibold text-white hover:bg-[#065F46]"
                    >
                      Buy Airtime Now
                    </button>
                  </div>
                );
              }
              return null;
            })}
            {isSending && (
              <p className="text-xs text-zinc-500">Kola is preparing your response...</p>
            )}
          </div>

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  appendUserAndAction('Send money via NIP', {
                    id: `tf-${Date.now()}`,
                    kind: 'transfer_form',
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-[#047857]" />
                Send Money (NIP)
              </button>
              <button
                type="button"
                onClick={() =>
                  appendUserAndAction('Buy airtime', {
                    id: `af-${Date.now()}`,
                    kind: 'airtime_form',
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <Smartphone className="h-3.5 w-3.5 text-[#047857]" />
                Buy Airtime
              </button>
              <button
                type="button"
                onClick={() =>
                  appendUserAndAction('Show my balance', {
                    id: `bc-${Date.now()}`,
                    kind: 'balance_card',
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#047857]" />
                Check Balance
              </button>
            </div>

            <form onSubmit={handleCommandSubmit} className="flex gap-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder='Type e.g. "Send 15k to GTBank", "Block my card", or ask about BVN...'
                className="min-h-[42px] flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-950 focus:border-[#047857] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isSending || !promptInput.trim()}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#047857] px-4 py-2 text-sm font-medium text-white hover:bg-[#065F46] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Live Ledger & Card Status Drawer */}
        <aside className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#13181C]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Live Ledger Drawer</span>
              <span className="font-mono text-xs text-[#047857] dark:text-emerald-400">
                {account.tier}
              </span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-zinc-950 dark:text-white">
              {formatMoney(account.balanceNgn, currency)}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <CreditCard className="h-3.5 w-3.5" />
                Card •••• {account.cardLast4}
              </span>
              <button
                type="button"
                onClick={() => onSetCardFrozen(!account.cardFrozen)}
                className="inline-flex items-center gap-1 font-medium text-[#047857] hover:underline dark:text-emerald-400"
              >
                {account.cardFrozen ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {account.cardFrozen ? 'Unblock' : 'Freeze'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#13181C]">
            <h3 className="font-display text-sm font-bold text-zinc-950 dark:text-white">
              Recent Stream Receipts
            </h3>
            <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
              {transactions.slice(0, 6).map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                      {tx.description}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-500">{tx.reference}</p>
                  </div>
                  <span
                    className={`font-mono font-semibold tabular-nums whitespace-nowrap ${
                      tx.type === 'credit'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-zinc-950 dark:text-zinc-100'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {formatMoney(tx.amountNgn, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
