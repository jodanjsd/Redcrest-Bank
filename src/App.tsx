/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AccountOpeningModal } from './components/AccountOpeningModal';
import { ArchitectureSpecsView } from './components/ArchitectureSpecsView';
import { DirectionFourUssdMobile } from './components/DirectionFourUssdMobile';
import { DirectionThreeBento } from './components/DirectionThreeBento';
import { DirectionTwoConversational } from './components/DirectionTwoConversational';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { InternetBankingDashboard } from './components/InternetBankingDashboard';
import {
  AboutPage,
  BusinessPage,
  InvestorsPage,
  MediaPage,
  PersonalPage,
} from './components/MenuPages';
import { PortalHome } from './components/PortalHome';
import { VirtualBankerWidget } from './components/VirtualBankerWidget';
import {
  INITIAL_DEMO_ACCOUNT,
  INITIAL_TRANSACTIONS,
} from './data/mockBankingData';
import {
  BankAccount,
  BankTransaction,
  CurrencyCode,
  DisputeRecord,
  PersonaCategory,
  PortalPage,
} from './types/banking';

type WorkspaceDirection = 'd1' | 'd2' | 'd3' | 'd4' | 'specs';

export default function App() {
  const [direction, setDirection] = useState<WorkspaceDirection>('d1');
  const [activeView, setActiveView] = useState<'portal' | 'dashboard'>('portal');
  const [portalPage, setPortalPage] = useState<PortalPage>('home');
  const [pageSubFocus, setPageSubFocus] = useState<string | undefined>(undefined);
  const [isDark, setIsDark] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [selectedPersona, setSelectedPersona] = useState<PersonaCategory>('individual');

  const [account, setAccount] = useState<BankAccount>(INITIAL_DEMO_ACCOUNT);
  const [transactions, setTransactions] = useState<BankTransaction[]>(INITIAL_TRANSACTIONS);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<'personal' | 'sme'>('personal');
  const [assistantDrawerOpen, setAssistantDrawerOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigatePage = (page: PortalPage, subFocus?: string) => {
    setDirection('d1');
    setActiveView('portal');
    setPortalPage(page);
    setPageSubFocus(subFocus);
    if (!subFocus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'personal' || page === 'business' || page === 'investors' || page === 'media') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenOnboarding = (mode: 'personal' | 'sme' = 'personal') => {
    setOnboardingMode(mode);
    setOnboardingOpen(true);
  };

  const handleCompleteOnboarding = (newAccount: BankAccount) => {
    setAccount(newAccount);
    setTransactions([
      {
        id: `tx-open-${Date.now()}`,
        reference: `OBD-${Math.floor(100000 + Math.random() * 900000)}`,
        dateIso: new Date().toISOString(),
        description: `Opening Welcome Credit (${newAccount.tier})`,
        counterparty: 'Redcrest Digital Onboarding',
        bankName: 'Redcrest Bank',
        channel: 'Inward Credit',
        type: 'credit',
        amountNgn: newAccount.balanceNgn,
        feeNgn: 0,
        status: 'Completed',
      },
      ...INITIAL_TRANSACTIONS,
    ]);
    setOnboardingOpen(false);
    setDirection('d1');
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteTransaction = (
    payload: Omit<BankTransaction, 'id' | 'dateIso' | 'reference' | 'status'>
  ): BankTransaction => {
    const prefix = payload.channel === 'NIP Transfer' ? 'NIP' : 'BILL';
    const created: BankTransaction = {
      ...payload,
      id: `tx-${Date.now()}`,
      reference: `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        10000 + Math.random() * 90000
      )}`,
      dateIso: new Date().toISOString(),
      status: 'Completed',
    };

    setTransactions((prev) => [created, ...prev]);
    setAccount((prev) => ({
      ...prev,
      balanceNgn: Math.max(0, prev.balanceNgn - (payload.amountNgn + payload.feeNgn)),
      dailySpentNgn: prev.dailySpentNgn + payload.amountNgn,
    }));

    return created;
  };

  const handleSetCardFrozen = (frozen: boolean) => {
    setAccount((prev) => ({ ...prev, cardFrozen: frozen }));
  };

  const handleLogDispute = (summary: string): DisputeRecord => {
    const record: DisputeRecord = {
      id: `disp-${Date.now()}`,
      ticketNumber: `DSP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAtIso: new Date().toISOString(),
      summary,
      status: 'Logged · SLA 24h',
    };
    setDisputes((prev) => [record, ...prev]);
    return record;
  };

  const handleUpgradeTier = () => {
    setAccount((prev) => ({
      ...prev,
      tier: 'Tier 2',
    }));
  };

  const enterDashboard = () => {
    setDirection('d1');
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#090D16] dark:text-slate-100">
      <Header
        activeView={direction === 'd1' ? activeView : 'portal'}
        activePage={portalPage}
        onNavigatePage={handleNavigatePage}
        onOpenOnboarding={handleOpenOnboarding}
        onToggleDashboard={() => {
          setDirection('d1');
          setActiveView((prev) => (prev === 'portal' ? 'dashboard' : 'portal'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Workspace Switcher Toolbar */}
      <div className="border-b border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-[#0F1624]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Creative directions and architecture specs"
            className="flex items-center gap-1.5"
          >
            {(
              [
                { id: 'd1', label: '01. Navy Sovereign Portal' },
                { id: 'd2', label: '02. Conversational Gateway' },
                { id: 'd3', label: '03. Bento Command Center' },
                { id: 'd4', label: '04. USSD Micro-Portal' },
                { id: 'specs', label: 'Schema, API & Wireframes' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={direction === item.id}
                type="button"
                onClick={() => {
                  setDirection(item.id);
                  if (item.id === 'd1') {
                    setActiveView('portal');
                    setPortalPage('home');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  direction === item.id
                    ? 'bg-[#0B2545] text-white shadow-xs dark:bg-[#1D4ED8]'
                    : 'text-slate-600 hover:text-[#0B2545] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {direction === 'd1' &&
        (activeView === 'dashboard' ? (
          <InternetBankingDashboard
            account={account}
            transactions={transactions}
            disputes={disputes}
            currency={currency}
            onExecuteTransaction={handleExecuteTransaction}
            onSetCardFrozen={handleSetCardFrozen}
            onUpgradeTier={handleUpgradeTier}
            onOpenAssistant={() => setAssistantDrawerOpen(true)}
          />
        ) : portalPage === 'home' ? (
          <PortalHome
            account={account}
            disputes={disputes}
            currency={currency}
            isDark={isDark}
            selectedPersona={selectedPersona}
            onSelectPersona={setSelectedPersona}
            onChangeCurrency={setCurrency}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
            onSetCardFrozen={handleSetCardFrozen}
            onLogDispute={handleLogDispute}
          />
        ) : portalPage === 'personal' ? (
          <PersonalPage
            currency={currency}
            subFocus={pageSubFocus}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
          />
        ) : portalPage === 'business' ? (
          <BusinessPage
            currency={currency}
            subFocus={pageSubFocus}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
          />
        ) : portalPage === 'about' ? (
          <AboutPage
            currency={currency}
            subFocus={pageSubFocus}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
          />
        ) : portalPage === 'investors' ? (
          <InvestorsPage
            currency={currency}
            subFocus={pageSubFocus}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
          />
        ) : (
          <MediaPage
            currency={currency}
            subFocus={pageSubFocus}
            onOpenOnboarding={handleOpenOnboarding}
            onEnterDashboard={enterDashboard}
          />
        ))}

      {direction === 'd2' && (
        <DirectionTwoConversational
          account={account}
          transactions={transactions}
          currency={currency}
          onExecuteTransaction={handleExecuteTransaction}
          onSetCardFrozen={handleSetCardFrozen}
          onLogDispute={handleLogDispute}
          onOpenOnboarding={handleOpenOnboarding}
        />
      )}

      {direction === 'd3' && (
        <DirectionThreeBento
          account={account}
          transactions={transactions}
          currency={currency}
          onExecuteTransaction={handleExecuteTransaction}
          onLogDispute={handleLogDispute}
          onOpenOnboarding={handleOpenOnboarding}
        />
      )}

      {direction === 'd4' && (
        <DirectionFourUssdMobile
          account={account}
          transactions={transactions}
          currency={currency}
          onExecuteTransaction={handleExecuteTransaction}
          onSetCardFrozen={handleSetCardFrozen}
          onOpenOnboarding={handleOpenOnboarding}
        />
      )}

      {direction === 'specs' && <ArchitectureSpecsView />}

      <Footer
        onNavigatePage={handleNavigatePage}
        onOpenOnboarding={handleOpenOnboarding}
        onOpenAssistant={() => setAssistantDrawerOpen(true)}
      />

      <AccountOpeningModal
        isOpen={onboardingOpen}
        initialMode={onboardingMode}
        onClose={() => setOnboardingOpen(false)}
        onCompleteAccount={handleCompleteOnboarding}
      />

      <VirtualBankerWidget
        account={account}
        disputes={disputes}
        isDrawerOpen={assistantDrawerOpen}
        onToggleDrawer={setAssistantDrawerOpen}
        onSetCardFrozen={handleSetCardFrozen}
        onLogDispute={handleLogDispute}
        embedded={false}
      />
    </div>
  );
}
