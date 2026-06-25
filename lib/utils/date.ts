/** Santo Domingo (AST, UTC-4, sin horario de verano) */
const SD_OFFSET_MS = -4 * 60 * 60 * 1000;

function parseToSantoDomingo(iso: string) {
  const sd = new Date(new Date(iso).getTime() + SD_OFFSET_MS);
  return {
    day: sd.getUTCDate(),
    month: sd.getUTCMonth() + 1,
    year: sd.getUTCFullYear(),
    hours: sd.getUTCHours(),
    minutes: sd.getUTCMinutes(),
  };
}

function formatAmPm(hours24: number, minutes: number): string {
  const h12 = hours24 % 12 || 12;
  const mm = minutes.toString().padStart(2, "0");
  const suffix = hours24 >= 12 ? "p. m." : "a. m.";
  return `${h12}:${mm} ${suffix}`;
}

/** Formato estable SSR/cliente — sin Intl.toLocaleString */
export function formatDateTime(iso: string): string {
  const { day, month, year, hours, minutes } = parseToSantoDomingo(iso);
  return `${day}/${month}/${year}, ${formatAmPm(hours, minutes)}`;
}

export function formatTime(iso: string): string {
  const { hours, minutes } = parseToSantoDomingo(iso);
  return formatAmPm(hours, minutes);
}

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const WEEKDAYS_ES = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "vieres", "sábado",
];

export function formatDateGroup(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const weekdayIdx = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS_ES[weekdayIdx]} ${day} ${MONTHS_ES[month - 1]} ${year}`;
}

export function todayISO(): string {
  const { day, month, year } = parseToSantoDomingo(new Date().toISOString());
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}
