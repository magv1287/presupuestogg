export const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SPANISH_MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function getMonthLabel(month: string): string {
  // month format: "2026-06"
  const [year, monthNum] = month.split('-');
  const monthIndex = parseInt(monthNum) - 1;
  return `${SPANISH_MONTHS[monthIndex]} ${year}`;
}

export function getMonthShort(monthIndex: number): string {
  return SPANISH_MONTHS_SHORT[monthIndex];
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (monthNum === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${(monthNum - 1).toString().padStart(2, '0')}`;
}

export function getMonthsInYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}
