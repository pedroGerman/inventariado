export const PHONE_AREA_CODES = ["809", "829", "849"] as const;

export type PhoneAreaCode = (typeof PHONE_AREA_CODES)[number];

export const DEFAULT_PHONE_AREA_CODE: PhoneAreaCode = "809";

export function isPhoneAreaCode(value: string): value is PhoneAreaCode {
  return PHONE_AREA_CODES.includes(value as PhoneAreaCode);
}

export function parsePhone(phone: string | null | undefined): {
  areaCode: PhoneAreaCode;
  number: string;
} {
  const digits = (phone ?? "").replace(/\D/g, "");

  if (!digits) {
    return { areaCode: DEFAULT_PHONE_AREA_CODE, number: "" };
  }

  if (digits.length === 3 && isPhoneAreaCode(digits)) {
    return { areaCode: digits, number: "" };
  }

  for (const code of PHONE_AREA_CODES) {
    if (digits.startsWith(code)) {
      return { areaCode: code, number: digits.slice(code.length) };
    }
  }

  return { areaCode: DEFAULT_PHONE_AREA_CODE, number: digits };
}

export function composePhone(areaCode: string, number: string): string {
  const digits = number.replace(/\D/g, "");
  const code = isPhoneAreaCode(areaCode) ? areaCode : DEFAULT_PHONE_AREA_CODE;

  if (!digits) return code;

  return `${code}${digits}`;
}

/** Returns null when only a prefix is selected or the field is empty. */
export function normalizePhoneForSave(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  const { areaCode, number } = parsePhone(phone);
  if (!number) return null;

  return composePhone(areaCode, number);
}

export function formatPhoneDisplay(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  const { areaCode, number } = parsePhone(phone);
  if (!number) return `+1 ${areaCode}`;

  return `+1 ${areaCode} ${number}`;
}

export function getWhatsAppUrl(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return `https://wa.me/1${digits}`;
}
