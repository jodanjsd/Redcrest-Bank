import React, { useState } from 'react';
import {
  Building2,
  Camera,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { BankAccount } from '../types/banking';

interface AccountOpeningModalProps {
  isOpen: boolean;
  initialMode: 'personal' | 'sme';
  onClose: () => void;
  onCompleteAccount: (newAccount: BankAccount) => void;
}

export const AccountOpeningModal: React.FC<AccountOpeningModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onCompleteAccount,
}) => {
  const [mode, setMode] = useState<'personal' | 'sme'>(initialMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Personal fields
  const [idType, setIdType] = useState<'BVN' | 'NIN'>('BVN');
  const [idNumber, setIdNumber] = useState('22349018274');
  const [fullName, setFullName] = useState('Chisom Nwosu');
  const [phone, setPhone] = useState('+234 809 321 7740');
  const [email, setEmail] = useState('chisom.nwosu@example.ng');
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // SME fields
  const [businessName, setBusinessName] = useState('Eko Craft & Logistics Ltd');
  const [cacNumber, setCacNumber] = useState('RC-1849203');
  const [directorBvn, setDirectorBvn] = useState('22198374612');
  const [tinNumber, setTinNumber] = useState('10482910-0001');

  // Compliance & OTP
  const [ndprConsent, setNdprConsent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [formError, setFormError] = useState('');
  const [generatedAccount, setGeneratedAccount] = useState<BankAccount | null>(null);

  React.useEffect(() => {
    setMode(initialMode);
    setStep(1);
    setFormError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const demoOtp = '482910';

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (mode === 'personal') {
      if (!/^\d{11}$/.test(idNumber.trim())) {
        setFormError(`Enter a valid 11-digit ${idType} number.`);
        return;
      }
      if (!fullName.trim() || !phone.trim() || !email.includes('@')) {
        setFormError('Complete your full name, Nigerian mobile number, and email.');
        return;
      }
      if (!selfieCaptured) {
        setFormError('Complete the live selfie liveness check before proceeding.');
        return;
      }
    } else {
      if (!cacNumber.trim() || !businessName.trim()) {
        setFormError('Enter your CAC registration number and legal business name.');
        return;
      }
      if (!/^\d{11}$/.test(directorBvn.trim())) {
        setFormError('Enter a valid 11-digit Director BVN.');
        return;
      }
      if (!email.includes('@') || !phone.trim()) {
        setFormError('Enter a valid business contact phone and email.');
        return;
      }
    }

    if (!ndprConsent) {
      setFormError('You must accept the NDPA / NDPR identity verification consent.');
      return;
    }

    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (otpInput.trim() !== demoOtp) {
      setFormError(`Invalid verification code. Enter the SMS OTP (${demoOtp}).`);
      return;
    }

    const randomSeven = Math.floor(1000000 + Math.random() * 9000000).toString();
    const nuban = `20${randomSeven}4`.slice(0, 10);

    const created: BankAccount =
      mode === 'personal'
        ? {
            id: `acct-${Date.now()}`,
            holderName: fullName.trim(),
            nuban,
            accountType: 'Personal Savings',
            tier: 'Tier 1',
            balanceNgn: 15000,
            dailySpentNgn: 0,
            cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
            cardFrozen: false,
            bvnMasked: `${idNumber.slice(0, 3)}••••${idNumber.slice(-4)}`,
            phone: phone.trim(),
            email: email.trim(),
          }
        : {
            id: `acct-${Date.now()}`,
            holderName: businessName.trim(),
            nuban,
            accountType: 'Business Current',
            tier: 'SME Corporate',
            balanceNgn: 250000,
            dailySpentNgn: 0,
            cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
            cardFrozen: false,
            bvnMasked: `${directorBvn.slice(0, 3)}••••${directorBvn.slice(-4)}`,
            phone: phone.trim(),
            email: email.trim(),
          };

    setGeneratedAccount(created);
    setStep(3);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#14161A] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Digital KYC Gateway · Step {step} of 3
            </p>
            <h2
              id="onboarding-modal-title"
              className="mt-1 font-display text-xl font-bold text-zinc-950 dark:text-white"
            >
              Open a Nigerian Bank Account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account opening modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleStepOneSubmit} className="mt-6 space-y-5">
            {/* Account Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setMode('personal');
                  setFormError('');
                }}
                className={`flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'personal'
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                Personal Tier 1
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('sme');
                  setFormError('');
                }}
                className={`flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'sme'
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Business / SME (CAC)
              </button>
            </div>

            {mode === 'personal' ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Identity Document
                    </label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {(['BVN', 'NIN'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setIdType(option)}
                          className={`min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            idType === option
                              ? 'border-[#0B2545] bg-[#0B2545]/10 text-[#0B2545] dark:border-[#60A5FA] dark:text-[#60A5FA]'
                              : 'border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="kyc-id-number"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      11-Digit {idType} Number
                    </label>
                    <input
                      id="kyc-id-number"
                      type="text"
                      maxLength={11}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      placeholder="22349018274"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="kyc-fullname"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Legal Full Name (matches {idType})
                    </label>
                    <input
                      id="kyc-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="kyc-phone"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Mobile Number (for SMS OTP)
                    </label>
                    <input
                      id="kyc-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="kyc-email"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="kyc-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                {/* Liveness Selfie Box */}
                <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Liveness &amp; Selfie Match
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {selfieCaptured
                        ? 'Biometric facial match confirmed against NIMC / NIBSS record.'
                        : 'Simulate instant webcam liveness check for Tier 1 compliance.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelfieCaptured(true)}
                    className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selfieCaptured
                        ? 'border border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                    }`}
                  >
                    {selfieCaptured ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Selfie Verified
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Capture Selfie
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sme-cac"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      CAC RC / BN Number
                    </label>
                    <input
                      id="sme-cac"
                      type="text"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value.toUpperCase())}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      placeholder="RC-1849203"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sme-bizname"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Registered Business Name
                    </label>
                    <input
                      id="sme-bizname"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sme-bvn"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Director 11-Digit BVN
                    </label>
                    <input
                      id="sme-bvn"
                      type="text"
                      maxLength={11}
                      value={directorBvn}
                      onChange={(e) => setDirectorBvn(e.target.value.replace(/\D/g, ''))}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sme-tin"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      FIRS Tax ID (TIN)
                    </label>
                    <input
                      id="sme-tin"
                      type="text"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sme-phone"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Director Mobile (+234)
                    </label>
                    <input
                      id="sme-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sme-email"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Corporate Email
                    </label>
                    <input
                      id="sme-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                  <FileCheck2 className="h-5 w-5 shrink-0 text-[#0B2545] dark:text-[#60A5FA]" />
                  <span>
                    CAC status &amp; director BVN are verified instantaneously via the Corporate Registry gateway.
                  </span>
                </div>
              </>
            )}

            {/* Explicit NDPA / NDPR Consent */}
            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ndprConsent}
                onChange={(e) => setNdprConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[#0B2545]"
              />
              <span>
                I consent to Redcrest Bank verifying my {mode === 'personal' ? idType : 'CAC & BVN'} records with NIBSS/NIMC in compliance with the Nigeria Data Protection Act (NDPA / NDPR).
              </span>
            </label>

            {formError && (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-[#0B2545] px-5 py-2 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
              >
                Verify Identity &amp; Send OTP
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                SMS &amp; Email OTP Sent
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                We dispatched a 6-digit verification code to <span className="font-mono">{phone}</span> and {email}.
              </p>
              <p className="mt-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                Demo SMS Code: <span className="font-semibold text-[#0B2545] dark:text-[#60A5FA]">{demoOtp}</span>
              </p>
            </div>

            <div>
              <label
                htmlFor="otp-code"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Enter 6-Digit OTP
              </label>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="482910"
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-lg tracking-widest tabular-nums text-zinc-950 focus:border-[#0B2545] dark:focus:border-[#60A5FA] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            {formError && (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormError('');
                }}
                className="min-h-[42px] rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOtpInput(demoOtp)}
                  className="min-h-[42px] rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Auto-fill OTP
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] rounded-lg bg-[#0B2545] px-5 py-2 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
                >
                  Generate NUBAN
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && generatedAccount && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-50/70 p-5 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  KYC Approved · Instant NUBAN Provisioned
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Account Name</p>
                  <p className="mt-0.5 font-display text-base font-bold text-zinc-950 dark:text-white">
                    {generatedAccount.holderName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">10-Digit NUBAN</p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tracking-wider tabular-nums text-[#0B2545] dark:text-[#60A5FA]">
                    {generatedAccount.nuban}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-emerald-600/20 pt-3 text-xs text-zinc-700 dark:text-zinc-300">
                <span>{generatedAccount.accountType}</span>
                <span aria-hidden="true">·</span>
                <span>{generatedAccount.tier}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {generatedAccount.tier === 'Tier 1'
                    ? 'Daily Transfer Limit: ₦300,000'
                    : 'Daily Transfer Limit: ₦50,000,000'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Stay on Portal
              </button>
              <button
                type="button"
                onClick={() => onCompleteAccount(generatedAccount)}
                className="min-h-[42px] rounded-lg bg-[#0B2545] px-5 py-2 text-sm font-medium text-white hover:bg-[#133C73] dark:bg-[#1D4ED8] dark:hover:bg-[#2563EB]"
              >
                Open Internet Banking Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
