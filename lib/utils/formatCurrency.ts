import { DEFAULT_CURRENCY, getCurrencyLocale } from "@/lib/constants/currencies";
import { getBusiness } from "@/lib/mock/db";

function resolveCurrency(override?: string): string {
  if (override) return override;

  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  return getBusiness().currency ?? DEFAULT_CURRENCY;
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  const code = resolveCurrency(currencyCode);
  const locale = getCurrencyLocale(code);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
