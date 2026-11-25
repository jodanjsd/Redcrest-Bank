import React from 'react';
import { PortalPage } from '../types/banking';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigatePage: (page: PortalPage, subFocus?: string) => void;
  onOpenOnboarding: (mode?: 'personal' | 'sme') => void;
  onOpenAssistant: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
  onOpenOnboarding,
  onOpenAssistant,
}) => {
  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-[#0B0C0E] dark:text-zinc-400">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <div className="text-[#0B2545] dark:text-white">
              <BrandLogo size="sm" />
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              Licensed by the Central Bank of Nigeria (CBN). All deposits are insured by the Nigeria Deposit Insurance Corporation (NDIC) up to statutory limits.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              TLS 1.3 Transit Encryption · AES-256 Storage · NDPA / NDPR Compliant · PCI-DSS Certified Gateway
            </p>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-zinc-950 dark:text-zinc-200">Digital Channels</p>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenOnboarding('personal')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Tier 1 Instant Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenOnboarding('sme')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  SME Corporate Onboarding
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Kola Virtual Banker
                </button>
              </li>
              <li>
                <span className="font-mono text-xs text-zinc-500">USSD Offline: *9190#</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-zinc-950 dark:text-zinc-200">Corporate &amp; Support</p>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  About Redcrest Bank
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('investors')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Investor Relations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('media')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Media Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('about', 'support')}
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Fraud &amp; Support Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Redcrest Bank Nigeria Plc (RC 1904821). Victoria Island, Lagos.</p>
          <p>CBN Tiered KYC Framework · NDPR Data Protection Notice</p>
        </div>
      </div>
    </footer>
  );
};
