import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  MapPin,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import {
  ABOUT_PILLARS,
  BRANCH_LOCATIONS,
  FAQ_ITEMS,
  INVESTOR_DOCUMENTS,
  INVESTOR_QUARTERS,
  PERSONA_PRODUCTS,
  PRESS_UPDATES,
  TIER_LIMITS,
} from '../data/mockBankingData';
import { CurrencyCode } from '../types/banking';
import { formatMoney, formatNgn } from '../utils/formatCurrency';

interface MenuPageSharedProps {
  currency: CurrencyCode;
  subFocus?: string;
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
  onEnterDashboard: () => void;
}

/* ============================================================================
 * 1. PERSONAL BANKING PAGE — Airy Sky-Tint & Crisp White Lifestyle Style
 * ============================================================================ */
export const PersonalPage: React.FC<MenuPageSharedProps> = ({
  currency,
  subFocus,
  onOpenOnboarding,
  onEnterDashboard,
}) => {
  const initialTrack =
    subFocus === 'student' || subFocus === 'diaspora' || subFocus === 'salary'
      ? subFocus
      : 'tier1';
  const [activeTrack, setActiveTrack] = useState<'tier1' | 'salary' | 'student' | 'diaspora'>(
    initialTrack
  );
  const [monthlySaveNgn, setMonthlySaveNgn] = useState(75000);
  const [saveMonths, setSaveMonths] = useState(12);
  const [selectedCardTheme, setSelectedCardTheme] = useState<'navy' | 'gold'>('navy');

  React.useEffect(() => {
    if (
      subFocus === 'tier1' ||
      subFocus === 'salary' ||
      subFocus === 'student' ||
      subFocus === 'diaspora'
    ) {
      setActiveTrack(subFocus);
    }
  }, [subFocus]);

  const projectedPrincipal = monthlySaveNgn * saveMonths;
  const projectedInterest = Math.round(projectedPrincipal * (0.135 * (saveMonths / 12)) * 0.55);
  const projectedTotal = projectedPrincipal + projectedInterest;

  const personalProducts = PERSONA_PRODUCTS.filter((p) => p.persona !== 'sme');

  return (
    <div className="space-y-16 pb-20">
      {/* Bright Sky-Blue & White Asymmetric Hero */}
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-[#EFF6FF] to-[#DBEAFE]/60 dark:border-slate-800 dark:from-[#090D16] dark:via-[#0F172A] dark:to-[#0B2545]/40">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <div className="space-y-5 lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-[#1D4ED8] dark:text-[#FCD34D]">
              Personal &amp; Retail Banking
            </p>
            <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.1] font-bold tracking-tight text-[#0B2545] dark:text-white [text-wrap:balance]">
              Everyday banking shaped around your goals.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Open a CBN Tier 1 account in minutes, earn up to 13.5% p.a. in automated Naira vaults, and spend seamlessly with contactless Navy and Gold cards.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'tier1', label: 'Tier 1 Savings' },
                { id: 'salary', label: 'Salary & Goals' },
                { id: 'student', label: 'Campus Flex' },
                { id: 'diaspora', label: 'Diaspora Naira' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTrack(tab.id as 'tier1' | 'salary' | 'student' | 'diaspora')
                  }
                  className={`min-h-[38px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                    activeTrack === tab.id
                      ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                      : 'border border-blue-200 bg-white text-[#0B2545] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenOnboarding('personal')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                <span>Open Personal NUBAN</span>
                <ArrowRight className="h-4 w-4 text-[#FCD34D]" />
              </button>
              <button
                type="button"
                onClick={onEnterDashboard}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                Access Internet Banking
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-lg dark:border-slate-800">
              <img
                src={
                  activeTrack === 'diaspora'
                    ? '/src/assets/images/diaspora_global_banking_1795605574640.jpg'
                    : '/src/assets/images/personal_mobile_banking_1795605572819.jpg'
                }
                alt={
                  activeTrack === 'diaspora'
                    ? 'Nigerian professional managing diaspora finances on mobile'
                    : 'Smiling Redcrest Bank personal customer using mobile banking and debit card'
                }
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Goal Vault Simulator + Card Customizer */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Interactive Savings Yield Calculator */}
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#14161A] sm:p-8 lg:col-span-7">
            <p className="text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
              Automated Target Vaults · 13.5% p.a.
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-[#0B2545] dark:text-white">
              Plan Your Naira Savings Goal
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Monthly Deposit</span>
                  <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                    {formatNgn(monthlySaveNgn)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={5000}
                  value={monthlySaveNgn}
                  onChange={(e) => setMonthlySaveNgn(Number(e.target.value))}
                  className="mt-2 w-full accent-[#0B2545]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Lock Duration
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSaveMonths(m)}
                      className={`min-h-[38px] rounded-lg border text-xs font-semibold transition-colors ${
                        saveMonths === m
                          ? 'border-[#0B2545] bg-[#0B2545] text-white dark:border-[#1D4ED8] dark:bg-[#1D4ED8]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-xl border border-blue-100 bg-[#EFF6FF]/70 p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-slate-500">Total Saved</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#0B2545] dark:text-white">
                    {formatMoney(projectedPrincipal, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Projected Yield</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    +{formatMoney(projectedInterest, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Payout at Maturity</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#1D4ED8] dark:text-[#FCD34D]">
                    {formatMoney(projectedTotal, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contactless Card Showcase */}
          <div className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#14161A] sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                  Instant Card Issuance
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCardTheme('navy')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                      selectedCardTheme === 'navy'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Sovereign Navy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCardTheme('gold')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                      selectedCardTheme === 'gold'
                        ? 'bg-[#D97706] text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Gold Virtual
                  </button>
                </div>
              </div>

              {/* Crisp Card Preview */}
              <div
                className={`mt-5 flex h-48 flex-col justify-between rounded-2xl p-6 text-white shadow-md transition-colors ${
                  selectedCardTheme === 'navy'
                    ? 'bg-gradient-to-br from-[#06152B] via-[#0B2545] to-[#1D4ED8]'
                    : 'bg-gradient-to-br from-[#0B2545] via-[#1E3A8A] to-[#B45309]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight">Redcrest Bank</span>
                  <CreditCard className="h-5 w-5 text-[#FCD34D]" />
                </div>
                <div>
                  <p className="font-mono text-base tracking-[0.2em] text-slate-100">
                    5399 •••• •••• 8492
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-200">
                    <span>{selectedCardTheme === 'navy' ? 'VERVE CONTACTLESS' : 'USD / NGN VIRTUAL'}</span>
                    <span className="font-mono text-[#FCD34D]">VALID 11/29</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenOnboarding('personal')}
              className="mt-6 min-h-[42px] w-full rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
            >
              Request Instant Card with Tier 1 Account
            </button>
          </div>
        </div>
      </section>

      {/* Personal Product Grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0B2545] dark:text-white">
          Compare Personal Account Tiers
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {personalProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A]"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                    {product.tierLabel}
                  </span>
                  <span className="font-mono text-slate-500">{product.dailyLimit}</span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-[#0B2545] dark:text-white">
                  {product.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {product.summary}
                </p>
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onOpenOnboarding('personal')}
                className="mt-6 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-[#0B2545] px-4 py-2 text-xs font-semibold text-[#0B2545] hover:bg-[#0B2545] hover:text-white dark:border-[#60A5FA] dark:text-[#60A5FA]"
              >
                Open {product.name}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * 2. BUSINESS & SME BANKING PAGE — Executive Dark-Navy & Structured Grid Style
 * ============================================================================ */
export const BusinessPage: React.FC<MenuPageSharedProps> = ({
  currency,
  subFocus,
  onOpenOnboarding,
  onEnterDashboard,
}) => {
  const [monthlyPosTurnover, setMonthlyPosTurnover] = useState(4500000);
  const [staffCount, setStaffCount] = useState(18);

  React.useEffect(() => {
    if (subFocus === 'kyc-tiers') {
      const el = document.getElementById('business-kyc-matrix');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subFocus]);

  const preApprovedCredit = Math.round(monthlyPosTurnover * 0.35);
  const estimatedPayrollFeeSavings = staffCount * 52;
  const businessProducts = PERSONA_PRODUCTS.filter((p) => p.persona === 'sme');

  return (
    <div className="space-y-16 pb-20">
      {/* Executive Dark Navy Corporate Masthead */}
      <section className="border-b-4 border-[#F59E0B] bg-[#06152B] text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <div className="space-y-5 lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-[#FCD34D]">
              SME &amp; Corporate Treasury
            </p>
            <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.1] font-bold tracking-tight [text-wrap:balance]">
              Built for Nigerian commerce, payroll, and scale.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Open a corporate current account online with your CAC RC/BN certificate and director BVN. Settle POS and NIP collections instantaneously with zero monthly maintenance fees.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenOnboarding('sme')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#06152B] hover:bg-[#FCD34D]"
              >
                <span>Open SME Corporate NUBAN</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onEnterDashboard}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
              >
                Corporate Internet Banking
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0B2545]">
              <img
                src="/src/assets/images/sme_nigerian_merchant_1795605572555.jpg"
                alt="Nigerian female SME founder using contactless payment terminal"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Working Capital & Bulk Payroll Estimator */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] sm:p-8 lg:col-span-7">
            <p className="text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
              Merchant Growth Simulator
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-[#0B2545] dark:text-white">
              POS Inventory Credit &amp; Payroll Estimator
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">
                    Monthly POS &amp; NIP Collection Turnover
                  </span>
                  <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                    {formatNgn(monthlyPosTurnover)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={25000000}
                  step={500000}
                  value={monthlyPosTurnover}
                  onChange={(e) => setMonthlyPosTurnover(Number(e.target.value))}
                  className="mt-2 w-full accent-[#0B2545]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">
                    Monthly Staff Payroll Headcount
                  </span>
                  <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                    {staffCount} Staff
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={250}
                  step={2}
                  value={staffCount}
                  onChange={(e) => setStaffCount(Number(e.target.value))}
                  className="mt-2 w-full accent-[#0B2545]"
                />
              </div>

              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-slate-500">90-Day Inventory Credit</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#0B2545] dark:text-[#FCD34D]">
                    {formatMoney(preApprovedCredit, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Settlement Speed</p>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">
                    T+0 Instant
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Payroll Fee Cap</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#0B2545] dark:text-white">
                    {formatMoney(estimatedPayrollFeeSavings, currency)} / run
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CAC Readiness Checklist */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#0B2545] p-6 text-white sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FCD34D]">
                <FileCheck2 className="h-4 w-4" />
                <span>CAC Digital Onboarding Checklist</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">Open in under 10 minutes</h3>
              <ul className="mt-5 space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD34D]" />
                  <span>Active CAC Registration (RC or BN) certificate number</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD34D]" />
                  <span>Primary Director 11-digit BVN &amp; Nigerian mobile number</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD34D]" />
                  <span>FIRS Tax Identification Number (TIN) for corporate limits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD34D]" />
                  <span>Up to ₦50,000,000 daily NIP transfer clearance</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onOpenOnboarding('sme')}
              className="mt-6 min-h-[42px] w-full rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#0B2545] hover:bg-slate-100"
            >
              Verify CAC &amp; Generate Corporate NUBAN
            </button>
          </div>
        </div>
      </section>

      {/* Business Products + CBN Tier Matrix */}
      <section
        id="business-kyc-matrix"
        className="mx-auto max-w-[1200px] space-y-10 px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {businessProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A]"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0B2545] dark:text-[#60A5FA]">
                  {product.tierLabel}
                </span>
                <span className="font-mono text-slate-500">{product.monthlyFee}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#0B2545] dark:text-white">
                {product.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {product.summary}
              </p>
              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] sm:p-8">
          <h2 className="text-xl font-bold text-[#0B2545] dark:text-white">
            CBN Tiered KYC Regulatory Limits
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="py-3 pr-4 font-medium">Account Tier</th>
                  <th className="py-3 pr-4 font-medium">KYC Requirement</th>
                  <th className="py-3 pr-4 text-right font-medium">Single Transfer</th>
                  <th className="py-3 text-right font-medium">Daily Transfer Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {Object.values(TIER_LIMITS).map((spec) => (
                  <tr key={spec.tier}>
                    <td className="py-3 pr-4 font-bold text-[#0B2545] dark:text-white">
                      {spec.tier}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                      {spec.kycRequirement}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-200">
                      {formatMoney(spec.singleTransferLimitNgn, currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold tabular-nums text-[#0B2545] dark:text-[#60A5FA]">
                      {formatMoney(spec.dailyTransferLimitNgn, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * 3. ABOUT US PAGE — Editorial Heritage, Governance, Branches & Help Desk
 * ============================================================================ */
export const AboutPage: React.FC<MenuPageSharedProps> = ({
  subFocus,
  onOpenOnboarding,
}) => {
  const [branchCity, setBranchCity] = useState('ALL');
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0].id);
  const [fraudDetails, setFraudDetails] = useState('');
  const [fraudReceipt, setFraudReceipt] = useState('');

  React.useEffect(() => {
    if (subFocus === 'branches' || subFocus === 'support') {
      const el = document.getElementById(`about-${subFocus}`);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subFocus]);

  const filteredBranches = useMemo(
    () =>
      BRANCH_LOCATIONS.filter((b) => branchCity === 'ALL' || b.city === branchCity),
    [branchCity]
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Editorial White & Stone Heritage Header */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-[#FCD34D]">
                <Building2 className="h-4 w-4" />
                <span>About Redcrest Bank Nigeria Plc · RC 1904821</span>
              </div>
              <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.1] font-bold tracking-tight text-[#0B2545] dark:text-white [text-wrap:balance]">
                Trustworthy commercial governance meets instant digital speed.
              </h1>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Headquartered at 57 Adeola Odeku Street, Victoria Island, Lagos, Redcrest Bank is licensed by the Central Bank of Nigeria with deposits insured by the NDIC. We serve retail savers, entrepreneurs, students, and diaspora families across Nigeria and global corridors.
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
                <div>
                  <p className="font-mono text-2xl font-bold text-[#0B2545] dark:text-white">
                    99.4%
                  </p>
                  <p className="text-xs text-slate-500">NIP Uptime</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-[#0B2545] dark:text-white">
                    5 Hubs
                  </p>
                  <p className="text-xs text-slate-500">Regional Desks</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-[#0B2545] dark:text-white">
                    NDPA
                  </p>
                  <p className="text-xs text-slate-500">Data Certified</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-800">
                <img
                  src="/src/assets/images/hero_nigerian_banking_photo_1795605556555.jpg"
                  alt="Redcrest Bank leadership and advisory team at Victoria Island headquarters"
                  referrerPolicy="no-referrer"
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {ABOUT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#14161A]"
              >
                <ShieldCheck className="h-5 w-5 text-[#0B2545] dark:text-[#60A5FA]" />
                <h2 className="mt-3 text-base font-bold text-[#0B2545] dark:text-white">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches & 24/7 ATMs */}
      <section id="about-branches" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0B2545] dark:text-white">
              National Branch &amp; 24/7 ATM Network
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Visit any flagship advisory desk for instant card pickup or SME trade support.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            {['ALL', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setBranchCity(city)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  branchCity === city
                    ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                    : 'text-slate-600 hover:text-[#0B2545] dark:text-slate-400'
                }`}
              >
                {city === 'ALL' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#14161A]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-[#0B2545] dark:text-white">{branch.name}</p>
                <MapPin className="h-4 w-4 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{branch.address}</p>
              <p className="mt-3 text-[11px] text-slate-500">{branch.services}</p>
              <p className="mt-2 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {branch.atmStatus} · {branch.hours}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Help FAQs + Fraud Desk */}
      <section id="about-support" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <h2 className="text-2xl font-bold text-[#0B2545] dark:text-white">
              Compliance &amp; Customer FAQs
            </h2>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#14161A]">
              {FAQ_ITEMS.map((faq) => {
                const open = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="p-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(open ? '' : faq.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-semibold text-[#0B2545] dark:text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] lg:col-span-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#0B2545] dark:text-[#60A5FA]" />
              <h3 className="text-lg font-bold text-[#0B2545] dark:text-white">
                Anonymous Whistleblowing &amp; Fraud Desk
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Submit suspicious SMS, phishing links, or governance reports securely without logging in.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!fraudDetails.trim()) return;
                setFraudReceipt(`FRD-${Math.floor(100000 + Math.random() * 900000)}`);
                setFraudDetails('');
              }}
              className="mt-4 space-y-3"
            >
              <textarea
                rows={4}
                value={fraudDetails}
                onChange={(e) => setFraudDetails(e.target.value)}
                placeholder="Describe suspicious contact, link, or transaction reference..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-950 focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="min-h-[42px] w-full rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                Submit Encrypted Report
              </button>
              {fraudReceipt && (
                <p className="rounded-lg border border-emerald-600/30 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Logged anonymously. Reference: <span className="font-mono font-bold">{fraudReceipt}</span>
                </p>
              )}
            </form>
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onOpenOnboarding('personal')}
                className="text-xs font-semibold text-[#0B2545] hover:underline dark:text-[#60A5FA]"
              >
                Open an Insured Redcrest Account →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * 4. INVESTOR RELATIONS PAGE — Institutional NGX Financial Terminal Style
 * ============================================================================ */
export const InvestorsPage: React.FC<MenuPageSharedProps> = ({ subFocus }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(INVESTOR_QUARTERS[0].period);
  const [downloadedDocId, setDownloadedDocId] = useState('');

  React.useEffect(() => {
    if (subFocus === 'filings') {
      const el = document.getElementById('investor-filings-room');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subFocus]);

  const activeQuarter =
    INVESTOR_QUARTERS.find((q) => q.period === selectedPeriod) ?? INVESTOR_QUARTERS[0];

  const handleDownloadBrief = (docId: string, title: string, summary: string) => {
    const content = `REDCREST BANK NIGERIA PLC — INVESTOR FILING SUMMARY\nDocument: ${title}\n\n${summary}\n\nSelected Period (${activeQuarter.period}):\n- Gross Earnings: ${activeQuarter.grossEarnings}\n- Profit Before Tax: ${activeQuarter.profitBeforeTax}\n- Capital Adequacy Ratio: ${activeQuarter.capitalAdequacy}\n- NPL Ratio: ${activeQuarter.nplRatio}\n- Digital Channel Share: ${activeQuarter.digitalShare}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadedDocId(docId);
  };

  const carPercent = parseFloat(activeQuarter.capitalAdequacy);
  const digitalPercent = parseFloat(activeQuarter.digitalShare);

  return (
    <div className="space-y-14 pb-20">
      {/* NGX Institutional Equity Strip */}
      <section className="border-b border-slate-800 bg-[#0B2545] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FCD34D]">
                <TrendingUp className="h-4 w-4" />
                <span>NGX Ticker: REDCREST · ISIN: NGREDCREST04</span>
              </div>
              <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.8rem)] font-bold tracking-tight">
                Investor Relations &amp; Financial Disclosures
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-6 rounded-xl border border-white/15 bg-[#06152B] px-5 py-4 font-mono">
              <div>
                <p className="text-[11px] text-slate-400">NGX Share Price</p>
                <p className="mt-1 text-lg font-bold text-white">₦34.80</p>
                <p className="text-[11px] text-emerald-400">+2.4% Today</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Market Cap</p>
                <p className="mt-1 text-lg font-bold text-white">₦1.24T</p>
                <p className="text-[11px] text-slate-400">35.6B Shares</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Dividend Yield</p>
                <p className="mt-1 text-lg font-bold text-[#FCD34D]">8.4%</p>
                <p className="text-[11px] text-slate-400">FY25–26 Interim</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quarterly Analytical Grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-[#0B2545] dark:text-white">
                Quarterly Earnings &amp; Basel III Capital Ratios
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a reporting period to inspect earnings, asset quality, and digital share.
              </p>
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
              {INVESTOR_QUARTERS.map((q) => (
                <button
                  key={q.period}
                  type="button"
                  onClick={() => setSelectedPeriod(q.period)}
                  className={`min-h-[36px] rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    selectedPeriod === q.period
                      ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                      : 'text-slate-600 hover:text-[#0B2545] dark:text-slate-400'
                  }`}
                >
                  {q.period}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Gross Earnings</p>
              <p className="mt-1.5 font-mono text-xl font-bold text-[#0B2545] dark:text-white">
                {activeQuarter.grossEarnings}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {activeQuarter.yoyGrowth}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Profit Before Tax</p>
              <p className="mt-1.5 font-mono text-xl font-bold text-[#0B2545] dark:text-white">
                {activeQuarter.profitBeforeTax}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">NGX Reported</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Capital Adequacy</p>
              <p className="mt-1.5 font-mono text-xl font-bold text-[#0B2545] dark:text-white">
                {activeQuarter.capitalAdequacy}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">CBN Floor: 15.0%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">NPL Ratio</p>
              <p className="mt-1.5 font-mono text-xl font-bold text-[#0B2545] dark:text-white">
                {activeQuarter.nplRatio}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">CBN Ceiling: 5.0%</p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
              <p className="text-xs text-slate-500">Digital Revenue</p>
              <p className="mt-1.5 font-mono text-xl font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                {activeQuarter.digitalShare}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Web, App &amp; USSD</p>
            </div>
          </div>

          {/* Analytical Ratio Comparison Bars */}
          <div className="mt-6 grid gap-6 border-t border-slate-200 pt-6 dark:border-slate-800 md:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  Capital Adequacy Cushion vs 15.0% CBN Minimum
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  {activeQuarter.capitalAdequacy}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-[#0B2545] dark:bg-[#60A5FA]"
                  style={{ width: `${Math.min(100, (carPercent / 30) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  Digital Channel Share of Fee Income
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  {activeQuarter.digitalShare}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-[#F59E0B]"
                  style={{ width: `${Math.min(100, digitalPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NGX Filings & Investor Calendar */}
      <section id="investor-filings-room" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] lg:col-span-8">
            <h2 className="text-lg font-bold text-[#0B2545] dark:text-white">
              NGX Filings &amp; Pillar III Reports
            </h2>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {INVESTOR_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="h-3.5 w-3.5 text-[#0B2545] dark:text-[#60A5FA]" />
                      <span>{doc.meta}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#0B2545] dark:text-white">
                      {doc.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{doc.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadBrief(doc.id, doc.title, doc.summary)}
                    className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B2545] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{downloadedDocId === doc.id ? 'Downloaded' : 'Download'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A] lg:col-span-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-[#FCD34D]">
              <Calendar className="h-4 w-4" />
              <span>Shareholder Calendar</span>
            </div>
            <ul className="mt-4 space-y-4 text-xs">
              <li className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <p className="font-mono font-semibold text-[#0B2545] dark:text-white">
                  28 Jan 2027
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                  FY 2026 Full-Year Earnings Conference Call (Lagos &amp; London)
                </p>
              </li>
              <li className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <p className="font-mono font-semibold text-[#0B2545] dark:text-white">
                  14 Mar 2027
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                  Publication of Audited Annual Report &amp; Dividend Qualification
                </p>
              </li>
              <li>
                <p className="font-mono font-semibold text-[#0B2545] dark:text-white">
                  18 Apr 2027
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                  Annual General Meeting — Eko Convention Centre, Victoria Island
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * 5. MEDIA CENTER PAGE — Editorial Magazine Newsroom & Press Kit Style
 * ============================================================================ */
export const MediaPage: React.FC<MenuPageSharedProps> = ({ subFocus }) => {
  const [mediaCategory, setMediaCategory] = useState('ALL');
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);
  const [kitDownloaded, setKitDownloaded] = useState(false);

  React.useEffect(() => {
    if (subFocus === 'presskit') {
      const el = document.getElementById('media-press-kit');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subFocus]);

  const filteredReleases = useMemo(() => {
    if (mediaCategory === 'ALL') return PRESS_UPDATES;
    return PRESS_UPDATES.filter((r) => r.category === mediaCategory);
  }, [mediaCategory]);

  const featuredStory = PRESS_UPDATES[0];
  const activeRelease = PRESS_UPDATES.find((r) => r.id === activeReleaseId) ?? null;

  const handleDownloadMediaKit = () => {
    const content = `REDCREST BANK NIGERIA PLC — 2026 MEDIA FACT SHEET\nHead Office: 57 Adeola Odeku Street, Victoria Island, Lagos\nPress Contact: media@redcrestbank.ng\n\nHighlights:\n- 99.4% Q3 NIP settlement uptime across Lagos and Abuja data centers\n- Full NDPA consent & CBN Tiered KYC onboarding in under 5 minutes\n- Zero monthly maintenance fee for digitally onboarded CAC SME accounts\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'redcrest-media-fact-sheet-2026.txt';
    link.click();
    URL.revokeObjectURL(url);
    setKitDownloaded(true);
  };

  return (
    <div className="space-y-14 pb-20">
      {/* Editorial Newsroom Masthead */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-[#FCD34D]">
                <Newspaper className="h-4 w-4" />
                <span>Redcrest Newsroom · Official Press Desk</span>
              </div>
              <h1 className="mt-2 text-[clamp(2rem,3.6vw,3rem)] font-bold tracking-tight text-[#0B2545] dark:text-white">
                Media Center &amp; Briefings
              </h1>
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
              {['ALL', 'Infrastructure', 'Press Releases', 'Sustainability'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMediaCategory(cat)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mediaCategory === cat
                      ? 'bg-[#0B2545] text-white dark:bg-[#1D4ED8]'
                      : 'text-slate-600 hover:text-[#0B2545] dark:text-slate-400'
                  }`}
                >
                  {cat === 'ALL' ? 'All Stories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Editorial Lead Story */}
          <div className="mt-8 grid items-center gap-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#14161A] lg:grid-cols-12 lg:p-8">
            <div className="overflow-hidden rounded-xl lg:col-span-6">
              <img
                src="/src/assets/images/diaspora_global_banking_1795605574640.jpg"
                alt="Redcrest Bank global diaspora and infrastructure announcement"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
            <div className="space-y-4 lg:col-span-6">
              <p className="text-xs font-semibold text-[#1D4ED8] dark:text-[#FCD34D]">
                Featured Briefing · {featuredStory.date}
              </p>
              <h2 className="text-2xl font-bold text-[#0B2545] dark:text-white">
                {featuredStory.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {featuredStory.body}
              </p>
              <button
                type="button"
                onClick={() => setActiveReleaseId(featuredStory.id)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                <span>Open Full Release</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#FCD34D]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Archive Grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {filteredReleases.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#14161A]"
            >
              <div>
                <p className="text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                  {item.category} · {item.date}
                </p>
                <h3 className="mt-2 text-lg font-bold text-[#0B2545] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.excerpt}
                </p>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveReleaseId(item.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:underline dark:text-[#60A5FA]"
                >
                  <span>Read Full Release</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Media Fact Sheet & Press Office */}
      <section id="media-press-kit" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-[#0B2545] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FCD34D]">
              <Users className="h-4 w-4" />
              <span>Corporate Communications &amp; Press Kit</span>
            </div>
            <h2 className="text-xl font-bold">
              Journalist Fact Sheet &amp; Executive Biographies
            </h2>
            <p className="text-xs text-slate-300">
              Media inquiries: media@redcrestbank.ng · Victoria Island Press Desk, Lagos.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadMediaKit}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-xs font-bold text-[#06152B] hover:bg-[#FCD34D]"
          >
            <Download className="h-4 w-4" />
            <span>{kitDownloaded ? 'Media Kit Downloaded' : 'Download 2026 Media Fact Sheet'}</span>
          </button>
        </div>
      </section>

      {activeRelease && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#14161A] sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500">
                  {activeRelease.category} · {activeRelease.date}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#0B2545] dark:text-white">
                  {activeRelease.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReleaseId(null)}
                aria-label="Close press release"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {activeRelease.body}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
              <span>Press Office: media@redcrestbank.ng</span>
              <button
                type="button"
                onClick={() => setActiveReleaseId(null)}
                className="min-h-[38px] rounded-lg bg-[#0B2545] px-4 py-1.5 font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
