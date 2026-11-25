import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { PortalPage } from '../types/banking';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeView: 'portal' | 'dashboard';
  activePage: PortalPage;
  onNavigatePage: (page: PortalPage, subFocus?: string) => void;
  onOpenOnboarding: (mode?: 'personal' | 'sme') => void;
  onToggleDashboard: () => void;
}

interface NavSubItem {
  label: string;
  description: string;
  action: () => void;
}

interface NavMenuItem {
  id: PortalPage;
  label: string;
  subItems: NavSubItem[];
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  activePage,
  onNavigatePage,
  onOpenOnboarding,
  onToggleDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);

  const handleAction = (fn: () => void) => {
    setOpenDesktopMenu(null);
    setMobileMenuOpen(false);
    fn();
  };

  const navMenus: NavMenuItem[] = [
    {
      id: 'personal',
      label: 'Personal',
      subItems: [
        {
          label: 'Tier 1 Instant Savings',
          description: 'Open with BVN or NIN in under 5 mins',
          action: () => onNavigatePage('personal', 'tier1'),
        },
        {
          label: 'Salary & Goal Vaults',
          description: 'Up to 13.5% p.a. yield & savings calculator',
          action: () => onNavigatePage('personal', 'salary'),
        },
        {
          label: 'Student Campus Flex',
          description: '2% data cashback & zero card fee',
          action: () => onNavigatePage('personal', 'student'),
        },
        {
          label: 'Diaspora Naira Bridge',
          description: 'Manage USD, GBP & NGN seamlessly',
          action: () => onNavigatePage('personal', 'diaspora'),
        },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      subItems: [
        {
          label: 'SME Business Current',
          description: 'Corporate NUBAN & working capital estimator',
          action: () => onNavigatePage('business', 'overview'),
        },
        {
          label: 'Open Corporate Account (CAC)',
          description: 'Instant verification with RC/BN & Director BVN',
          action: () => onOpenOnboarding('sme'),
        },
        {
          label: 'CBN Tiered KYC Limits',
          description: 'Compare single & daily transfer ceilings',
          action: () => onNavigatePage('business', 'kyc-tiers'),
        },
      ],
    },
    {
      id: 'about',
      label: 'About Us',
      subItems: [
        {
          label: 'Mission & Lagos HQ',
          description: 'Governance, CBN license & NDIC cover',
          action: () => onNavigatePage('about'),
        },
        {
          label: 'Branches & 24/7 ATMs',
          description: 'Lagos, Abuja, Port Harcourt & Kano hubs',
          action: () => onNavigatePage('about', 'branches'),
        },
        {
          label: 'Help & Fraud Desk',
          description: 'FAQs & anonymous whistleblowing',
          action: () => onNavigatePage('about', 'support'),
        },
      ],
    },
    {
      id: 'investors',
      label: 'Investors',
      subItems: [
        {
          label: 'NGX Financial Terminal',
          description: 'Quarterly earnings, CAR & NPL ratios',
          action: () => onNavigatePage('investors'),
        },
        {
          label: 'NGX Filings & Annual Reports',
          description: 'Downloadable Pillar III & AGM briefs',
          action: () => onNavigatePage('investors', 'filings'),
        },
      ],
    },
    {
      id: 'media',
      label: 'Media',
      subItems: [
        {
          label: 'Newsroom & Press Releases',
          description: 'Official corporate & infrastructure briefings',
          action: () => onNavigatePage('media'),
        },
        {
          label: '2026 Media Fact Sheet',
          description: 'Downloadable press kit & media contacts',
          action: () => onNavigatePage('media', 'presskit'),
        },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#090D16]/95">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line brand logo lockup (Home) */}
        <button
          type="button"
          onClick={() => handleAction(() => onNavigatePage('home'))}
          title="Return to Redcrest Bank Home"
          className="text-[#0B2545] transition-colors hover:text-[#1D4ED8] dark:text-white dark:hover:text-[#F59E0B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B2545]"
        >
          <BrandLogo />
        </button>

        {/* Zone 2: Concise nav links routing to distinct pages + dropdown sub-menus */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <button
            type="button"
            onClick={() => handleAction(() => onNavigatePage('home'))}
            className={`min-h-[40px] py-2 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'portal' && activePage === 'home'
                ? 'font-semibold text-[#0B2545] underline decoration-[#F59E0B] decoration-2 underline-offset-8 dark:text-white'
                : 'hover:text-[#0B2545] dark:hover:text-[#F59E0B]'
            }`}
          >
            Home
          </button>

          {navMenus.map((menu) => {
            const isOpen = openDesktopMenu === menu.id;
            const isCurrent = activeView === 'portal' && activePage === menu.id;
            return (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setOpenDesktopMenu(menu.id)}
                onMouseLeave={() => setOpenDesktopMenu(null)}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => handleAction(() => onNavigatePage(menu.id))}
                  className={`inline-flex min-h-[40px] items-center gap-1 py-2 transition-colors whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'font-semibold text-[#0B2545] underline decoration-[#F59E0B] decoration-2 underline-offset-8 dark:text-white'
                      : 'hover:text-[#0B2545] dark:hover:text-[#F59E0B]'
                  }`}
                >
                  <span>{menu.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[#0B2545] dark:text-[#F59E0B]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 z-50 w-72 pt-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-[#0F172A]">
                      {menu.subItems.map((sub) => (
                        <button
                          key={sub.label}
                          type="button"
                          onClick={() => handleAction(sub.action)}
                          className="block w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80"
                        >
                          <p className="text-xs font-semibold text-[#0B2545] dark:text-white">
                            {sub.label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {sub.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Zone 3: Single primary CTA (+ mobile menu toggle) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAction(onToggleDashboard)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#0B2545] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB] sm:px-4 sm:text-sm whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
          >
            {activeView === 'dashboard' ? 'Exit Banking' : 'Internet Banking'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer with Expandable Sub-Menus */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="max-h-[80vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#090D16] md:hidden"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleAction(() => onNavigatePage('home'))}
              className="flex min-h-[44px] w-full items-center border-b border-slate-100 px-2 text-left text-sm font-semibold text-[#0B2545] dark:border-slate-800/70 dark:text-white"
            >
              Home Overview
            </button>
            {navMenus.map((menu) => {
              const expanded = openMobileSub === menu.id;
              return (
                <div
                  key={menu.id}
                  className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/70"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAction(() => onNavigatePage(menu.id))}
                      className="flex min-h-[44px] flex-1 items-center px-2 text-left text-sm font-semibold text-[#0B2545] dark:text-white"
                    >
                      {menu.label}
                    </button>
                    <button
                      type="button"
                      aria-label={`Toggle ${menu.label} sub-menu`}
                      onClick={() =>
                        setOpenMobileSub((prev) => (prev === menu.id ? null : menu.id))
                      }
                      className="inline-flex h-10 w-10 items-center justify-center text-slate-400"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {expanded && (
                    <div className="mb-2 space-y-1 pl-3">
                      {menu.subItems.map((sub) => (
                        <button
                          key={sub.label}
                          type="button"
                          onClick={() => handleAction(sub.action)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
