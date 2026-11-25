import { COUNTRY_REGIONS } from '../data/mockBankingData';
import { CurrencyCode } from '../types/banking';

export function formatMoney(amountNgn: number, currency: CurrencyCode = 'NGN'): string {
  const region = COUNTRY_REGIONS.find((r) => r.code === currency) ?? COUNTRY_REGIONS[0];
  const converted = amountNgn * region.rateFromNgn;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(converted));
  const prefix = amountNgn < 0 ? '-' : '';
  return `${prefix}${region.symbol}${formatted}`;
}

export function formatNgn(amount: number): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}₦${formatted}`;
}
