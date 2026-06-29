import { Period, PeriodType } from '@/types/period';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

/**
 * Genera el ID de un periodo en formato "YYYY-MM-Q1" o "YYYY-MM-Q2"
 */
export const generatePeriodId = (year: number, month: number, type: PeriodType): string => {
  const monthStr = month.toString().padStart(2, '0');
  return `${year}-${monthStr}-${type}`;
};

/**
 * Parsea un periodId y retorna sus componentes
 */
export const parsePeriodId = (periodId: string): { year: number; month: number; type: PeriodType } => {
  const [yearStr, monthStr, type] = periodId.split('-');
  return {
    year: parseInt(yearStr),
    month: parseInt(monthStr),
    type: type as PeriodType,
  };
};

/**
 * Obtiene las fechas de inicio y fin de una quincena
 */
export const getPeriodDates = (year: number, month: number, type: PeriodType): { startDate: Date; endDate: Date } => {
  if (type === 'Q1') {
    return {
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month - 1, 15, 23, 59, 59),
    };
  } else {
    const start = new Date(year, month - 1, 16);
    const end = endOfMonth(new Date(year, month - 1, 16));
    end.setHours(23, 59, 59);
    return {
      startDate: start,
      endDate: end,
    };
  }
};

/**
 * Crea un objeto Period completo
 */
export const createPeriod = (year: number, month: number, type: PeriodType): Period => {
  const id = generatePeriodId(year, month, type);
  const { startDate, endDate } = getPeriodDates(year, month, type);
  
  return {
    id,
    year,
    month,
    type,
    startDate,
    endDate,
  };
};

/**
 * Obtiene el periodo anterior a uno dado
 */
export const getPreviousPeriod = (period: Period): Period => {
  if (period.type === 'Q2') {
    // Si es Q2, el anterior es Q1 del mismo mes
    return createPeriod(period.year, period.month, 'Q1');
  } else {
    // Si es Q1, el anterior es Q2 del mes anterior
    const prevMonth = period.month === 1 ? 12 : period.month - 1;
    const prevYear = period.month === 1 ? period.year - 1 : period.year;
    return createPeriod(prevYear, prevMonth, 'Q2');
  }
};

/**
 * Obtiene el periodo siguiente a uno dado
 */
export const getNextPeriod = (period: Period): Period => {
  if (period.type === 'Q1') {
    // Si es Q1, el siguiente es Q2 del mismo mes
    return createPeriod(period.year, period.month, 'Q2');
  } else {
    // Si es Q2, el siguiente es Q1 del mes siguiente
    const nextMonth = period.month === 12 ? 1 : period.month + 1;
    const nextYear = period.month === 12 ? period.year + 1 : period.year;
    return createPeriod(nextYear, nextMonth, 'Q1');
  }
};

/**
 * Obtiene el periodo actual basado en la fecha de hoy
 */
export const getCurrentPeriod = (): Period => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  const type: PeriodType = day <= 15 ? 'Q1' : 'Q2';
  
  return createPeriod(year, month, type);
};

/**
 * Genera una lista de periodos (últimos N meses = N*2 quincenas)
 */
export const generatePeriodList = (monthsBack: number = 6): Period[] => {
  const periods: Period[] = [];
  const current = getCurrentPeriod();
  
  let period = current;
  
  // Generar periodos hacia atrás
  for (let i = 0; i < monthsBack * 2; i++) {
    periods.unshift(period);
    period = getPreviousPeriod(period);
  }
  
  return periods;
};

/**
 * Formatea un periodo para mostrar en UI
 */
export const formatPeriodLabel = (period: Period): string => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthName = monthNames[period.month - 1];
  const quinceLabel = period.type === 'Q1' ? '1ra Quincena' : '2da Quincena';
  
  return `${monthName} ${period.year} - ${quinceLabel}`;
};

/**
 * Formatea un periodo de forma corta
 */
export const formatPeriodShort = (period: Period): string => {
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const monthName = monthNames[period.month - 1];
  const quinceLabel = period.type === 'Q1' ? 'Q1' : 'Q2';
  
  return `${monthName} ${quinceLabel}`;
};

/**
 * Compara dos periodos para ordenamiento
 */
export const comparePeriods = (a: Period, b: Period): number => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.type === 'Q1' ? -1 : 1;
};

/**
 * Verifica si un periodo es anterior a otro
 */
export const isPeriodBefore = (period: Period, reference: Period): boolean => {
  return comparePeriods(period, reference) < 0;
};

/**
 * Verifica si un periodo es el actual
 */
export const isCurrentPeriod = (period: Period): boolean => {
  const current = getCurrentPeriod();
  return period.id === current.id;
};
