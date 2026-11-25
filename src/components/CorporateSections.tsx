import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building,
  Download,
  FileText,
  Newspaper,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  ABOUT_PILLARS,
  INVESTOR_DOCUMENTS,
  INVESTOR_QUARTERS,
  PRESS_UPDATES,
} from '../data/mockBankingData';

interface CorporateSectionsProps {
  onOpenOnboarding: (mode: 'personal' | 'sme') => void;
}

export const CorporateSections: React.FC<CorporateSectionsProps> = ({
  onOpenOnboarding,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(INVESTOR_QUARTERS[0].period);
  const [downloadedDocId, setDownloadedDocId] = useState<string>('');
  const [mediaCategory, setMediaCategory] = useState<string>('ALL');
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);

  const activeQuarter =
    INVESTOR_QUARTERS.find((q) => q.period === selectedPeriod) ?? INVESTOR_QUARTERS[0];

  const filteredReleases = useMemo(() => {
    if (mediaCategory === 'ALL') return PRESS_UPDATES;
    return PRESS_UPDATES.filter((item) => item.category === mediaCategory);
  }, [mediaCategory]);

  const activeRelease = PRESS_UPDATES.find((r) => r.id === activeReleaseId) ?? null;

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

  return (
    <div className="space-y-20">
      {/* ABOUT US */}
      <section id="about" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] sm:p-8 lg:col-span-7">
            <div>
              <p className="text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
                About Redcrest Bank
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Built in Lagos for Africa’s connected economy.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Redcrest Bank Nigeria Plc combines full-service commercial banking governance with instant digital onboarding. From Tier 1 retail savings to multi-signatory CAC corporate treasuries, we connect individuals and enterprises to reliable payment rails across Africa and the diaspora.
              </p>

              <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:grid-cols-3">
                {ABOUT_PILLARS.map((pillar) => (
                  <div key={pillar.title}>
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {pillar.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <p className="font-mono text-lg font-bold tabular-nums text-zinc-950 dark:text-white">
                    99.4%
                  </p>
                  <p className="text-zinc-500">Q3 NIP Uptime</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold tabular-nums text-zinc-950 dark:text-white">
                    &lt; 5 min
                  </p>
                  <p className="text-zinc-500">NUBAN Onboarding</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold tabular-nums text-zinc-950 dark:text-white">
                    5 Hubs
                  </p>
                  <p className="text-zinc-500">Nigeria Regional Desks</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenOnboarding('personal')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8]"
              >
                <span>Open an Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800 lg:col-span-5">
            <img
              src="/src/assets/images/hero_nigerian_banking_photo_1795605556555.jpg"
              alt="Redcrest Bank Victoria Island Lagos banking team"
              referrerPolicy="no-referrer"
              className="h-full min-h-[300px] w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Building className="h-3.5 w-3.5 text-[#FCD34D]" />
                <span>Head Office · Victoria Island, Lagos</span>
              </div>
              <p className="mt-1 font-display text-lg font-bold">
                57 Adeola Odeku Street, Lagos · RC 1904821
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTOR RELATIONS */}
      <section id="investors" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A] sm:p-8">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
                <TrendingUp className="h-4 w-4" />
                <span>Investor Relations · NGX Disclosures</span>
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
                Financial Performance &amp; Capital Adequacy
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Reporting periods"
              className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
            >
              {INVESTOR_QUARTERS.map((q) => (
                <button
                  key={q.period}
                  role="tab"
                  aria-selected={selectedPeriod === q.period}
                  type="button"
                  onClick={() => setSelectedPeriod(q.period)}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedPeriod === q.period
                      ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  {q.period}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Financial KPI Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Gross Earnings</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {activeQuarter.grossEarnings}
              </p>
              <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                {activeQuarter.yoyGrowth}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Profit Before Tax</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {activeQuarter.profitBeforeTax}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">Audited / Unaudited NGX</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Capital Adequacy</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {activeQuarter.capitalAdequacy}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">CBN Floor: 15.0%</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">NPL Ratio</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {activeQuarter.nplRatio}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">CBN Limit: 5.0%</p>
            </div>

            <div className="col-span-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:col-span-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Digital Revenue Share</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0B2545] dark:text-[#60A5FA]">
                {activeQuarter.digitalShare}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">Web, App &amp; *9190#</p>
            </div>
          </div>

          {/* Investor Filings List */}
          <div className="mt-8 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {INVESTOR_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <FileText className="h-3.5 w-3.5 text-[#0B2545] dark:text-[#60A5FA]" />
                    <span>{doc.meta}</span>
                  </div>
                  <p className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                    {doc.title}
                  </p>
                  <p className="max-w-2xl text-xs text-zinc-600 dark:text-zinc-400">
                    {doc.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadBrief(doc.id, doc.title, doc.summary)}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadedDocId === doc.id ? 'Downloaded Brief' : 'Download Brief'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEDIA CENTER */}
      <section id="media" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-[#60A5FA]">
              <Newspaper className="h-4 w-4" />
              <span>Media Center &amp; Newsroom</span>
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
              Press Releases &amp; Corporate Briefings
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
              {['ALL', 'Infrastructure', 'Press Releases', 'Sustainability'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMediaCategory(cat)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    mediaCategory === cat
                      ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  {cat === 'ALL' ? 'All News' : cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownloadBrief(
                  'redcrest-media-fact-sheet-2026',
                  'Redcrest Bank 2026 Media Fact Sheet',
                  'Press Office: media@redcrestbank.ng · Head Office: 57 Adeola Odeku Street, Victoria Island, Lagos.'
                )
              }
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Media Kit</span>
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {filteredReleases.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#14161A]"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {item.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="mt-2.5 font-display text-lg font-bold text-zinc-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.excerpt}
                </p>
              </div>

              <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
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

      {/* Press Release Reader Modal */}
      {activeRelease && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#14161A] sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500">
                  {activeRelease.category} · {activeRelease.date}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-zinc-950 dark:text-white">
                  {activeRelease.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReleaseId(null)}
                aria-label="Close press release"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {activeRelease.body}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
              <span>Press Contact: media@redcrestbank.ng</span>
              <button
                type="button"
                onClick={() => setActiveReleaseId(null)}
                className="min-h-[38px] rounded-lg bg-[#0B2545] px-4 py-1.5 font-semibold text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
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
