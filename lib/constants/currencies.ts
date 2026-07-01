export const DEFAULT_CURRENCY = "DOP";

export type CurrencyOption = {
  code: string;
  label: string;
  locale: string;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "DOP", label: "Peso dominicano (DOP)", locale: "es-DO" },
  { code: "USD", label: "Dólar estadounidense (USD)", locale: "en-US" },
  { code: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { code: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { code: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { code: "PEN", label: "Sol peruano (PEN)", locale: "es-PE" },
  { code: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
  { code: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { code: "GTQ", label: "Quetzal guatemalteco (GTQ)", locale: "es-GT" },
  { code: "HNL", label: "Lempira hondureño (HNL)", locale: "es-HN" },
  { code: "NIO", label: "Córdoba nicaragüense (NIO)", locale: "es-NI" },
  { code: "CRC", label: "Colón costarricense (CRC)", locale: "es-CR" },
  { code: "PAB", label: "Balboa panameño (PAB)", locale: "es-PA" },
];

const currencyByCode = new Map(
  CURRENCY_OPTIONS.map((option) => [option.code, option]),
);

export function isSupportedCurrency(code: string): boolean {
  return currencyByCode.has(code);
}

export function getCurrencyLocale(code: string): string {
  return currencyByCode.get(code)?.locale ?? "es-DO";
}
