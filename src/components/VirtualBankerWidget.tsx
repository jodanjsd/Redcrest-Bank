import React, { useState } from 'react';
import {
  AlertCircle,
  MessageSquare,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react';
import { TIER_LIMITS } from '../data/mockBankingData';
import { AssistantMessage, BankAccount, DisputeRecord } from '../types/banking';
import { formatNgn } from '../utils/formatCurrency';

interface VirtualBankerWidgetProps {
  account: BankAccount;
  disputes: DisputeRecord[];
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
  onSetCardFrozen: (frozen: boolean) => void;
  onLogDispute: (summary: string) => DisputeRecord;
  embedded?: boolean;
}

export const VirtualBankerWidget: React.FC<VirtualBankerWidgetProps> = ({
  account,
  disputes,
  isDrawerOpen,
  onToggleDrawer,
  onSetCardFrozen,
  onLogDispute,
  embedded = false,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: `Hello ${account.holderName.split(' ')[0]}. I am Kola, your 24/7 Virtual Banker. Ask me to check your balance, freeze a lost debit card, log a failed NIP dispute, or explain CBN tier limits.`,
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickPrompts = [
    'Check my account balance',
    account.cardFrozen ? 'Unblock my debit card' : 'Block my lost debit card',
    'Log a failed transfer dispute',
    'What is my daily transfer limit?',
  ];

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMsg('');
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const tierSpec = TIER_LIMITS[account.tier] ?? TIER_LIMITS['Tier 1'];
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          accountContext: {
            holderName: account.holderName,
            nuban: account.nuban,
            accountType: account.accountType,
            tier: account.tier,
            balanceNgn: account.balanceNgn,
            dailyLimitNgn: tierSpec.dailyTransferLimitNgn,
            cardFrozen: account.cardFrozen,
            disputeCount: disputes.length,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Assistant error (${res.status})`);
      }

      let actionBadge: string | undefined;
      if (data.action === 'CHECK_BALANCE') {
        actionBadge = `Live Balance: ${formatNgn(account.balanceNgn)}`;
      } else if (data.action === 'BLOCK_CARD') {
        onSetCardFrozen(true);
        actionBadge = `Card •••• ${account.cardLast4} Frozen`;
      } else if (data.action === 'UNBLOCK_CARD') {
        onSetCardFrozen(false);
        actionBadge = `Card •••• ${account.cardLast4} Reactivated`;
      } else if (data.action === 'LOG_DISPUTE') {
        const created = onLogDispute(data.disputeSummary || trimmed);
        actionBadge = `Ticket ${created.ticketNumber} Logged`;
      }

      const assistantMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionBadge,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach Kola Virtual Banker right now.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const panelBody = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/hero_nigerian_banking_photo_1795605556555.jpg"
            alt="Kola Virtual Banking Specialist"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full border border-zinc-200 object-cover object-top dark:border-zinc-700"
          />
          <div>
            <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
              Kola · 24/7 Virtual Banker
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Account <span className="font-mono tabular-nums">{account.nuban}</span> · {account.tier}
            </p>
          </div>
        </div>
        {!embedded && (
          <button
            type="button"
            onClick={() => onToggleDrawer(false)}
            aria-label="Close virtual banker"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
              }`}
            >
              <p>{msg.text}</p>
              {msg.actionBadge && (
                <p className="mt-2 border-t border-zinc-200 pt-1.5 font-mono text-xs font-medium text-emerald-700 dark:border-zinc-700 dark:text-emerald-400">
                  Action Executed · {msg.actionBadge}
                </p>
              )}
            </div>
            <span className="mt-1 text-[11px] text-zinc-400">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Kola is checking your request...
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Kola about transfers, card freeze, disputes..."
            className="min-h-[40px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-[#60A5FA]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message to Kola"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white transition-colors hover:bg-[#133C73] disabled:opacity-40 dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="h-[460px] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#14161A]">
        {panelBody}
      </div>
    );
  }

  return (
    <>
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => onToggleDrawer(true)}
          className="fixed right-5 bottom-5 z-40 inline-flex min-h-[48px] items-center gap-2.5 rounded-xl bg-[#0B2545] px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#133C73] dark:bg-[#1D4ED8]"
        >
          <MessageSquare className="h-4 w-4 text-[#FCD34D]" />
          <span>Ask Kola · 24/7 Banker</span>
        </button>
      )}

      {isDrawerOpen && (
        <aside
          aria-label="Kola Virtual Banking Assistant"
          className="fixed right-4 bottom-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#14161A]"
        >
          {panelBody}
          {account.cardFrozen && (
            <div className="flex items-center gap-2 border-t border-amber-300/60 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>Debit card •••• {account.cardLast4} is currently frozen.</span>
            </div>
          )}
        </aside>
      )}
    </>
  );
};
