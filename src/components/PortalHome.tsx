import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  Landmark,
  MapPin,
  Moon,
  Search,
  ShieldAlert,
  Smartphone,
  Sun,
  UserCheck,
} from 'lucide-react';
import {
  BRANCH_LOCATIONS,
  COUNTRY_REGIONS,
  FAQ_ITEMS,
  PERSONA_PRODUCTS,
  TIER_LIMITS,
} from '../data/mockBankingData';
import {
  BankAccount,
  CurrencyCode,
  DisputeRecord,
  PersonaCategory,
} from '../types/banking';
import { formatMoney } from '../utils/formatCurrency';
import { CorporateSections } from './CorporateSections';
import { VirtualBankerWidget } from './VirtualBankerWidget';

interface PortalHomeProps {
  account: BankAccount;
  disputes: DisputeRecord[];
  currency: CurrencyCode;
  isDark: boolean;
  selectedPersona: PersonaCategory;
  onSelectPersona: (p: PersonaCategory) => void;
  onChangeCurrency: (c: CurrencyCode) => void;
  onToggleTheme: () => void;
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
  onEnterDashboard: () => void;
  onSetCardFrozen: (frozen: boolean) => void;
  onLogDispute: (summary: string) => DisputeRecord;
}

const HERO_SLIDES = [
  {
    id: 'slide-1',
    kicker: 'Retail & Instant NUBAN Onboarding',
    headline: 'Banking built for Nigeria’s everyday ambition.',
    subcopy:
      'Open a CBN Tier 1 account with your BVN or NIN in under five minutes, transfer seamlessly via NIP, and bank 24/7 with Kola.',
    ctaLabel: 'Open Instant Account',
    ctaAction: 'personal' as const,
    imageSrc: '/src/assets/images/hero_nigerian_banking_photo_1795605556555.jpg',
    imageAlt: 'Smiling Nigerian banking professionals in a sunlit Lagos glass office atrium',
  },
  {
    id: 'slide-2',
    kicker: 'SME & Corporate Growth',
    headline: 'Scale your Nigerian business with instant CAC accounts.',
    subcopy:
      'Verify your RC number and director BVN online, collect instant POS and NIP settlements, and run bulk staff payroll in minutes.',
    ctaLabel: 'Open SME Business Account',
    ctaAction: 'sme' as const,
    imageSrc: '/src/assets/images/sme_nigerian_merchant_1795605572555.jpg',
    imageAlt: 'Nigerian entrepreneur smiling with a contactless payment terminal in her studio',
  },
  {
    id: 'slide-3',
    kicker: 'Omnichannel Cards & *9190# USSD',
    headline: 'One gateway across web, mobile, and offline USSD.',
    subcopy:
      'Manage your contactless debit cards, settle IKEDC/DStv utility bills, and freeze misplaced cards instantly with zero wait times.',
    ctaLabel: 'Launch Internet Banking',
    ctaAction: 'dashboard' as const,
    imageSrc: '/src/assets/images/personal_mobile_banking_1795605572819.jpg',
    imageAlt: 'Smiling Nigerian customer holding a smartphone and Redcrest Bank debit card',
  },
];

const PERSONA_IMAGES: Record<PersonaCategory, { src: string; alt: string }> = {
  individual: {
    src: '/src/assets/images/personal_mobile_banking_1795605572819.jpg',
    alt: 'Personal banking customer smiling with smartphone and Redcrest debit card',
  },
  sme: {
    src: '/src/assets/images/sme_nigerian_merchant_1795605572555.jpg',
    alt: 'Nigerian SME merchant accepting contactless POS payments',
  },
  student: {
    src: '/src/assets/images/personal_mobile_banking_1795605572819.jpg',
    alt: 'Young Nigerian managing mobile campus banking',
  },
  diaspora: {
    src: '/src/assets/images/diaspora_global_banking_1795605574640.jpg',
    alt: 'Nigerian professional in London checking mobile banking app',
  },
};

export const PortalHome: React.FC<PortalHomeProps> = ({
  account,
  disputes,
  currency,
  isDark,
  selectedPersona,
  onSelectPersona,
  onChangeCurrency,
  onToggleTheme,
  onOpenOnboarding,
  onEnterDashboard,
  onSetCardFrozen,
  onLogDispute,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [portalSearch, setPortalSearch] = useState('');
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);

  // FAQ & Branch Locator state
  const [faqCategory, setFaqCategory] = useState<string>('ALL');
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
  const [branchCity, setBranchCity] = useState<string>('ALL');

  // Anonymous Fraud / Whistleblowing form
  const [fraudChannel, setFraudChannel] = useState('Suspicious SMS / Phishing');
  const [fraudDetails, setFraudDetails] = useState('');
  const [fraudReceipt, setFraudReceipt] = useState('');

  // Alert Subscription form
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subTopics, setSubTopics] = useState<string[]>(['Product Updates']);
  const [subNdpr, setSubNdpr] = useState(false);
  const [subError, setSubError] = useState('');
  const [subConfirmed, setSubConfirmed] = useState(false);

  useEffect(() => {
    if (isHeroPaused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isHeroPaused]);

  const activeSlide = HERO_SLIDES[slideIndex] ?? HERO_SLIDES[0];

  const filteredProducts = useMemo(() => {
    return PERSONA_PRODUCTS.filter((p) => p.persona === selectedPersona);
  }, [selectedPersona]);

  const filteredFaqs = useMemo(() => {
    const q = portalSearch.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const catMatch = faqCategory === 'ALL' || item.category === faqCategory;
      const queryMatch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [faqCategory, portalSearch]);

  const filteredBranches = useMemo(() => {
    const q = portalSearch.trim().toLowerCase();
    return BRANCH_LOCATIONS.filter((b) => {
      const cityMatch = branchCity === 'ALL' || b.city === branchCity;
      const queryMatch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q);
      return cityMatch && queryMatch;
    });
  }, [branchCity, portalSearch]);

  const toggleTopic = (topic: string) => {
    setSubTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleFraudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fraudDetails.trim()) return;
    const ref = `FRD-${Math.floor(100000 + Math.random() * 900000)}`;
    setFraudReceipt(ref);
    setFraudDetails('');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');
    if (!subEmail.includes('@')) {
      setSubError('Enter a valid email address for regulatory and product alerts.');
      return;
    }
    if (subTopics.length === 0) {
      setSubError('Select at least one alert category.');
      return;
    }
    if (!subNdpr) {
      setSubError('Please confirm NDPA / NDPR consent to receive updates.');
      return;
    }
    setSubConfirmed(true);
  };

  return (
    <div className="space-y-16 pb-20 sm:space-y-24">
      {/* Zone 1B: Utility Bar */}
      <section className="bg-white dark:bg-[#090D16]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Globe className="h-3.5 w-3.5 text-[#0B2545] dark:text-[#60A5FA]" />
            <label htmlFor="region-select" className="sr-only">
              Country and Currency
            </label>
            <select
              id="region-select"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="min-h-[34px] rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {COUNTRY_REGIONS.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.country} · {region.code} ({region.symbol})
                </option>
              ))}
            </select>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="hidden md:inline">CBN Licensed · NDIC Insured</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={portalSearch}
                onChange={(e) => setPortalSearch(e.target.value)}
                placeholder="Search FAQs, branches..."
                aria-label="Quick search portal"
                className="min-h-[34px] w-40 rounded-md border border-slate-200 bg-slate-50 py-1 pr-2.5 pl-8 text-xs text-slate-900 focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Former Full-Bleed Hero Style with Sharp Horizontal Sliding Image */}
        <div
          className="relative overflow-hidden bg-[#06152B]"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
        >
          {/* Full-Header Horizontal Sliding Photo Track (100% Sharp, Zero Opacity Fade) */}
          <div
            className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div key={slide.id} className="h-full w-full shrink-0">
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            ))}
          </div>

          {/* Tight Left-Side Contrast Scrim Only — leaves the full photograph sharp and vivid */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#06152B]/85 via-[#06152B]/40 to-transparent lg:w-3/4" />

          <div className="relative mx-auto flex min-h-[460px] max-w-[1200px] flex-col justify-between px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[540px] lg:px-8 lg:py-20">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <p className="text-xs font-semibold tracking-wide text-[#FCD34D] drop-shadow-xs">
                  {activeSlide.kicker}
                </p>
                <h1 className="max-w-2xl text-[clamp(2rem,4vw,3.5rem)] leading-[1.08] font-bold tracking-tight text-white drop-shadow-sm [text-wrap:balance]">
                  {activeSlide.headline}
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-100 drop-shadow-xs sm:text-base">
                  {activeSlide.subcopy}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSlide.ctaAction === 'dashboard') {
                        onEnterDashboard();
                      } else {
                        onOpenOnboarding(activeSlide.ctaAction);
                      }
                    }}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-[#0B2545] border border-[#F59E0B]/80 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#133C73] whitespace-nowrap"
                  >
                    <span>{activeSlide.ctaLabel}</span>
                    <ArrowRight className="h-4 w-4 text-[#FCD34D]" />
                  </button>
                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-white/40 bg-[#06152B]/50 px-5 py-3 text-sm font-medium text-white backdrop-blur-xs transition-colors hover:bg-[#06152B]/75 whitespace-nowrap"
                  >
                    Demo Internet Banking
                  </button>
                </div>
              </div>

              {/* Compact Active Account Snapshot Card on Desktop Hero */}
              <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
                <div className="w-full max-w-sm rounded-2xl border border-white/25 bg-[#06152B]/80 p-6 text-white shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Active NUBAN Gateway</span>
                    <span className="font-mono text-[#FCD34D]">{account.tier}</span>
                  </div>
                  <p className="mt-2 font-mono text-3xl font-bold tabular-nums">
                    {formatMoney(account.balanceNgn, currency)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-300">
                    {account.nuban} · {account.holderName}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs">
                    <span className="text-slate-300">NIP Settlement</span>
                    <button
                      type="button"
                      onClick={onEnterDashboard}
                      className="font-semibold text-[#FCD34D] hover:underline"
                    >
                      Open Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Switcher Controls */}
            <div className="mt-8 flex items-center justify-between pt-4 pb-6 lg:pb-8">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Show slide ${idx + 1}`}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIndex ? 'w-8 bg-[#F59E0B]' : 'w-2.5 bg-white/55 hover:bg-white/85'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-[#06152B]/65 text-white hover:bg-[#06152B]/90"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-[#06152B]/65 text-white hover:bg-[#06152B]/90"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping 4-Column UBA-Style Quick-Action Bar */}
        <div className="relative z-10 mx-auto -mt-8 max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-[#14161A] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-zinc-200 dark:lg:divide-zinc-800">
            <button
              type="button"
              onClick={() => onOpenOnboarding('personal')}
              className="flex min-h-[76px] items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 lg:border-b-0"
            >
              <div>
                <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                  Open an Account
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Instant NUBAN via BVN, NIN or CAC
                </p>
              </div>
              <UserCheck className="h-5 w-5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
            </button>

            <button
              type="button"
              onClick={onEnterDashboard}
              className="flex min-h-[76px] items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 lg:border-b-0"
            >
              <div>
                <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                  Internet Banking
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  NIP transfers, bills &amp; statements
                </p>
              </div>
              <Landmark className="h-5 w-5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
            </button>

            <a
              href="#support"
              className="flex min-h-[76px] items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 sm:border-b-0"
            >
              <div>
                <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                  Help &amp; Branch Locator
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  FAQs, 24/7 ATMs &amp; fraud desk
                </p>
              </div>
              <HelpCircle className="h-5 w-5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
            </a>

            <button
              type="button"
              onClick={() => setShowDownloadSheet((v) => !v)}
              className="flex min-h-[76px] items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                  Mobile App &amp; *9190#
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  iOS, Android &amp; offline USSD
                </p>
              </div>
              <Smartphone className="h-5 w-5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
            </button>
          </div>

          {showDownloadSheet && (
            <div className="mt-3 flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                  Redcrest Mobile &amp; Offline USSD Banking
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Available on Apple App Store &amp; Google Play. No data? Dial{' '}
                  <span className="font-mono font-semibold text-zinc-950 dark:text-white">
                    *9190#
                  </span>{' '}
                  from your registered Nigerian line for instant transfers and airtime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloadSheet(false)}
                className="min-h-[38px] rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Zone 3: UBA-Style Visual Persona Router ("Find Your Perfect Fit") */}
      <section id="personas" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
              Tailored Nigerian Banking
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Find Your Perfect Fit
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Customer personas"
            className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
          >
            {(
              [
                { id: 'individual', label: 'Individual' },
                { id: 'sme', label: 'Entrepreneur / SME' },
                { id: 'student', label: 'Student' },
                { id: 'diaspora', label: 'Diaspora' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={selectedPersona === tab.id}
                type="button"
                onClick={() => onSelectPersona(tab.id)}
                className={`min-h-[40px] rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedPersona === tab.id
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filteredProducts.map((product, idx) => {
            const media =
              idx === 0
                ? PERSONA_IMAGES[selectedPersona]
                : selectedPersona === 'individual'
                ? PERSONA_IMAGES.diaspora
                : PERSONA_IMAGES.sme;
            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#14161A]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[#06152B] to-[#0B2545]">
                  <img
                    src={media.src}
                    alt={media.alt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold">{product.tierLabel}</span>
                    <span className="font-mono tabular-nums">{product.dailyLimit}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {product.monthlyFee}
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-bold text-zinc-950 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {product.summary}
                    </p>

                    <ul className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                      {product.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenOnboarding(product.onboardingMode)}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
                    >
                      <span>
                        {product.onboardingMode === 'sme'
                          ? 'Open SME Account with CAC'
                          : 'Open Personal Account'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FCD34D]" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Zone 4: Core Banking Onboarding Hub & Embedded AI Virtual Banker */}
      <section id="kyc-tiers" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] sm:p-7 lg:col-span-6">
            <div>
              <p className="text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
                CBN Tiered KYC Framework
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Instant Account Opening &amp; Tier Limits
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Start with a Tier 1 account using BVN or NIN, or register an SME corporate current account using your CAC RC/BN certificate.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <th className="py-2.5 pr-3 font-medium">Account Tier</th>
                      <th className="py-2.5 pr-3 font-medium text-right">Single Limit</th>
                      <th className="py-2.5 font-medium text-right">Daily Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {Object.values(TIER_LIMITS).map((spec) => (
                      <tr key={spec.tier}>
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold text-zinc-950 dark:text-white">{spec.tier}</p>
                          <p className="text-[11px] text-zinc-500">{spec.kycRequirement}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                          {formatMoney(spec.singleTransferLimitNgn, currency)}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                          {formatMoney(spec.dailyTransferLimitNgn, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenOnboarding('personal')}
                className="min-h-[42px] rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
              >
                Start Personal Tier 1
              </button>
              <button
                type="button"
                onClick={() => onOpenOnboarding('sme')}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <Building2 className="h-3.5 w-3.5" />
                Start Business / SME
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <VirtualBankerWidget
              account={account}
              disputes={disputes}
              isDrawerOpen={false}
              onToggleDrawer={() => {}}
              onSetCardFrozen={onSetCardFrozen}
              onLogDispute={onLogDispute}
              embedded={true}
            />
          </div>
        </div>
      </section>

      {/* Zone 5: Support, FAQ, Branch Locator, Fraud Center, Press & Subscriptions */}
      <section id="support" className="mx-auto max-w-[1200px] space-y-14 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
                  Help &amp; Security Center
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Answers on CBN limits, NIP clearing timelines, and card protection.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
                {['ALL', 'Account Tiers', 'NIP Transfers', 'Card & Security', 'SME & CAC'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFaqCategory(cat)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        faqCategory === cat
                          ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                          : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400'
                      }`}
                    >
                      {cat === 'ALL' ? 'All' : cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-[#14161A]">
              {filteredFaqs.map((faq) => {
                const open = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="p-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(open ? '' : faq.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-[#0B2545] dark:text-[#60A5FA]" />
              <h3 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Anonymous Fraud &amp; Whistleblowing
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Report phishing links, compromised cards, or suspected misconduct directly to our CBN-mandated Fraud Desk without logging in.
            </p>

            <form onSubmit={handleFraudSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Incident Category
                </label>
                <select
                  value={fraudChannel}
                  onChange={(e) => setFraudChannel(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                >
                  <option>Suspicious SMS / Phishing</option>
                  <option>Unauthorized NIP Debit</option>
                  <option>Lost / Skimmed ATM Card</option>
                  <option>Anonymous Whistleblowing Tip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Incident Details (No PIN or password required)
                </label>
                <textarea
                  rows={3}
                  value={fraudDetails}
                  onChange={(e) => setFraudDetails(e.target.value)}
                  placeholder="Describe the sender number, suspicious link, or transaction reference..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="min-h-[42px] w-full rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
              >
                Submit Encrypted Report
              </button>

              {fraudReceipt && (
                <p className="rounded-lg border border-emerald-600/30 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Report logged anonymously. Reference:{' '}
                  <span className="font-mono font-semibold">{fraudReceipt}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Branch & ATM Locator */}
        <div id="branches" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
                Branches &amp; 24/7 ATMs
              </h2>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Card issuance hubs, SME advisory desks, and cardless ATMs across Nigeria.
              </p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
              {['ALL', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setBranchCity(city)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    branchCity === city
                      ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  {city === 'ALL' ? 'All Cities' : city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14161A]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                    {branch.name}
                  </p>
                  <MapPin className="h-4 w-4 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">{branch.address}</p>
                <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {branch.services}
                </p>
                <p className="mt-2 border-t border-zinc-200 pt-2.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {branch.atmStatus} · {branch.hours}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* About Us, Investor Relations & Media Center */}
      <CorporateSections onOpenOnboarding={onOpenOnboarding} />

      {/* Update Subscriptions */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] sm:p-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
              Stay Informed
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold text-zinc-950 dark:text-white">
              Subscribe to Alerts &amp; Updates
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Receive CBN FX circulars, product launches, NGX investor filings, and career openings via Email or SMS.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4 lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="you@company.ng"
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nigerian Mobile (Optional SMS Alerts)
                </label>
                <input
                  type="tel"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-950 focus:border-[#0B2545] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['Product Updates', 'Financial News', 'Careers'].map((topic) => {
                  const active = subTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`min-h-[36px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-[#0B2545] bg-[#0B2545]/10 text-[#0B2545] dark:border-[#60A5FA] dark:text-[#60A5FA]'
                          : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-[#0B2545] px-5 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
              >
                Subscribe to Updates
              </button>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={subNdpr}
                onChange={(e) => setSubNdpr(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[#0B2545]"
              />
              <span>
                I agree to receive selected alerts under NDPA / NDPR opt-in rules.
              </span>
            </label>

            {subError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{subError}</p>
            )}

            {subConfirmed && (
              <p className="rounded-lg border border-emerald-600/30 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                Subscription confirmed for {subTopics.join(', ')}.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};
