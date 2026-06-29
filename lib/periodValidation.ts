import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase/config';
import { Period, PeriodValidationResult, PeriodAnalysis } from '@/types/period';
import { getPreviousPeriod, formatPeriodLabel, comparePeriods } from './periodUtils';

/**
 * Obtiene el análisis de un periodo específico desde Firestore
 */
export const getPeriodAnalysis = async (
  periodId: string,
  userId: string
): Promise<PeriodAnalysis | null> => {
  try {
    const docRef = doc(db, 'periods', userId, 'analyses', periodId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        periodId: data.periodId,
        userId: data.userId,
        incomes: {
          ...data.incomes,
          createdAt: data.incomes.createdAt?.toDate(),
          updatedAt: data.incomes.updatedAt?.toDate(),
        },
        expenses: data.expenses,
        geminiAnalysis: data.geminiAnalysis,
        isCompleted: data.isCompleted,
        completedAt: data.completedAt?.toDate() || null,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting period analysis:', error);
    return null;
  }
};

/**
 * Obtiene todos los análisis completados de un usuario, ordenados cronológicamente
 */
export const getCompletedAnalyses = async (userId: string): Promise<PeriodAnalysis[]> => {
  try {
    const q = query(
      collection(db, 'periods', userId, 'analyses'),
      where('isCompleted', '==', true),
      orderBy('periodId', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        periodId: data.periodId,
        userId: data.userId,
        incomes: {
          ...data.incomes,
          createdAt: data.incomes.createdAt?.toDate(),
          updatedAt: data.incomes.updatedAt?.toDate(),
        },
        expenses: data.expenses,
        geminiAnalysis: data.geminiAnalysis,
        isCompleted: data.isCompleted,
        completedAt: data.completedAt?.toDate() || null,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting completed analyses:', error);
    return [];
  }
};

/**
 * Valida si un periodo puede ser analizado según la regla de secuencia
 * REGLA: Solo se puede analizar un periodo si el periodo anterior ya está completado
 */
export const canAnalyzePeriod = async (
  period: Period,
  userId: string
): Promise<PeriodValidationResult> => {
  try {
    // Obtener el periodo anterior
    const previousPeriod = getPreviousPeriod(period);
    
    // Verificar si el periodo anterior existe y está completado
    const previousAnalysis = await getPeriodAnalysis(previousPeriod.id, userId);
    
    // Si no existe análisis previo, verificar si es el primer periodo
    if (!previousAnalysis) {
      // Obtener todos los análisis completados
      const completedAnalyses = await getCompletedAnalyses(userId);
      
      // Si no hay análisis completados, permitir cualquier periodo (es el primero)
      if (completedAnalyses.length === 0) {
        return { allowed: true };
      }
      
      // Si hay análisis, solo permitir si el periodo anterior no existe porque es muy antiguo
      // o si es el siguiente periodo lógico después del último completado
      const lastCompleted = completedAnalyses[completedAnalyses.length - 1];
      
      // Verificar si el periodo solicitado es el siguiente al último completado
      const lastCompletedPeriod = {
        id: lastCompleted.periodId,
        year: parseInt(lastCompleted.periodId.split('-')[0]),
        month: parseInt(lastCompleted.periodId.split('-')[1]),
        type: lastCompleted.periodId.split('-')[2] as 'Q1' | 'Q2',
      } as Period;
      
      // Si el periodo solicitado es anterior al último completado, permitir (análisis histórico)
      if (comparePeriods(period, lastCompletedPeriod) < 0) {
        return { allowed: true };
      }
      
      // Si el periodo solicitado es posterior, verificar que el anterior esté completado
      return {
        allowed: false,
        reason: `Debes completar el periodo anterior primero: ${formatPeriodLabel(previousPeriod)}`,
        missingPeriod: previousPeriod.id,
        missingPeriodLabel: formatPeriodLabel(previousPeriod),
      };
    }
    
    // Si existe el análisis previo, verificar que esté completado
    if (!previousAnalysis.isCompleted) {
      return {
        allowed: false,
        reason: `El periodo anterior está en progreso. Complétalo primero: ${formatPeriodLabel(previousPeriod)}`,
        missingPeriod: previousPeriod.id,
        missingPeriodLabel: formatPeriodLabel(previousPeriod),
      };
    }
    
    // Si el periodo anterior está completado, permitir
    return { allowed: true };
    
  } catch (error) {
    console.error('Error validating period:', error);
    return {
      allowed: false,
      reason: 'Error al validar el periodo. Intenta de nuevo.',
    };
  }
};

/**
 * Verifica si un periodo ya tiene análisis (completado o en progreso)
 */
export const hasPeriodAnalysis = async (
  periodId: string,
  userId: string
): Promise<boolean> => {
  const analysis = await getPeriodAnalysis(periodId, userId);
  return analysis !== null;
};

/**
 * Verifica si un periodo está completado
 */
export const isPeriodCompleted = async (
  periodId: string,
  userId: string
): Promise<boolean> => {
  const analysis = await getPeriodAnalysis(periodId, userId);
  return analysis !== null && analysis.isCompleted;
};
