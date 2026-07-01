'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useMonthDraft } from '@/hooks/useMonthDraft';
import { MonthSelector } from '@/components/upload/MonthSelector';
import { ManualTransactionForm } from '@/components/upload/ManualTransactionForm';
import { DraftTransactionList } from '@/components/upload/DraftTransactionList';
import { EditMonthDialog } from '@/components/upload/EditMonthDialog';
import { useToast } from '@/components/ui/Toast';
import { getMonthLabel } from '@/lib/utils/dates';
import { getMonthsAffectedByEdit } from '@/lib/utils/stale-detection';
import {
  getTransactionsByMonthKey,
  deleteHouseholdTransactionsByMonth,
  addHouseholdTransactions,
  saveHouseholdUpload,
  markAnalysesStale,
  appendEditHistory,
  updateAnalysisSummaryAfterEdit,
  getMonthlyAnalysisList,
  HouseholdTransaction,
} from '@/lib/firebase/household';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';

type ProcessStep = 'idle' | 'categorizing' | 'transfers' | 'duplicates' | 'saving';

const STEP_LABELS: Record<ProcessStep, string> = {
  idle: '',
  categorizing: 'Categorizando transacciones...',
  transfers: 'Detectando transferencias internas...',
  duplicates: 'Verificando duplicados...',
  saving: 'Guardando en Firestore...',
};

export function PrepareMonthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { householdProfile } = useAuth();
  const { addToast } = useToast();

  const {
    targetMonth,
    setTargetMonth,
    draftItems,
    editMode,
    setEditMode,
    addFromParsed,
    addManual,
    removeItem,
    clear,
  } = useMonthDraft();

  const [existingTransactions, setExistingTransactions] = useState<HouseholdTransaction[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingMonth, setPendingMonth] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<ProcessStep>('idle');
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const accounts = householdProfile?.savingsAccounts?.map((a) => a.name) || [];

  const checkExistingMonth = useCallback(async (monthKey: string) => {
    const existing = await getTransactionsByMonthKey(monthKey, true);
    setExistingTransactions(existing);
    return existing;
  }, []);

  useEffect(() => {
    const monthParam = searchParams.get('month');
    const modeParam = searchParams.get('mode');
    if (monthParam) {
      setTargetMonth(monthParam);
      checkExistingMonth(monthParam).then((existing) => {
        if (existing.length > 0) {
          if (modeParam === 'merge') {
            setEditMode('merge');
          } else if (modeParam === 'replace') {
            setEditMode('replace');
          } else {
            setPendingMonth(monthParam);
            setShowEditDialog(true);
          }
        } else {
          setEditMode('new');
        }
      });
    }
  }, [searchParams, setTargetMonth, setEditMode, checkExistingMonth]);

  const handleMonthChange = async (monthKey: string) => {
    if (!monthKey) {
      setTargetMonth('');
      setExistingTransactions([]);
      clear();
      return;
    }

    const existing = await checkExistingMonth(monthKey);
    if (existing.length > 0) {
      setPendingMonth(monthKey);
      setShowEditDialog(true);
    } else {
      setTargetMonth(monthKey);
      setEditMode('new');
      clear();
    }
  };

  const handleReplace = async () => {
    if (!pendingMonth) return;
    setShowEditDialog(false);
    setTargetMonth(pendingMonth);
    setEditMode('replace');
    clear();
    setPendingMonth(null);
  };

  const handleMerge = () => {
    if (!pendingMonth) return;
    setShowEditDialog(false);
    setTargetMonth(pendingMonth);
    setEditMode('merge');
    setPendingMonth(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleParseFiles = async () => {
    if (!files.length || !targetMonth) return;
    setParsing(true);
    setParseErrors([]);

    try {
      const csvFiles = files.filter((f) => f.name.toLowerCase().endsWith('.csv'));
      const imageFiles = files.filter((f) => /\.(png|jpe?g)$/i.test(f.name));

      type ParseResponse = {
        transactions: Array<Record<string, unknown>>;
        fileResults: Array<{
          filename: string;
          errors?: string[];
          needsOwnerBankConfirmation?: boolean;
        }>;
        error?: string;
      };

      const responses: ParseResponse[] = [];

      if (csvFiles.length > 0) {
        const formData = new FormData();
        csvFiles.forEach((file) => formData.append('files', file));
        formData.append('month', targetMonth);
        const response = await fetch('/api/parse-files', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        responses.push(data);
      }

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('files', file));
        formData.append('month', targetMonth);
        const response = await fetch('/api/extract-screenshot', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        responses.push(data);
      }

      const allTransactions = responses.flatMap((r) => r.transactions);
      const allFileResults = responses.flatMap((r) => r.fileResults);

      const errors: string[] = [];
      for (const result of allFileResults) {
        if (result.errors?.length) {
          errors.push(...result.errors.map((e: string) => `${result.filename}: ${e}`));
        }
        if (result.needsOwnerBankConfirmation) {
          errors.push(
            `${result.filename}: nombre no coincide con el patrón esperado (Miguel-Junio-bofa.csv). Revisa los datos.`
          );
        }
      }

      const byFile = new Map<string, typeof allTransactions>();
      for (const tx of allTransactions) {
        const key = (tx.sourceFilename as string) || 'unknown';
        if (!byFile.has(key)) byFile.set(key, []);
        byFile.get(key)!.push(tx);
      }

      for (const [filename, txs] of byFile) {
        addFromParsed(txs as Parameters<typeof addFromParsed>[0], filename);
      }

      setParseErrors(errors);
      setFiles([]);
      addToast('success', `${allTransactions.length} transacciones agregadas al borrador`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Error al procesar archivos');
    } finally {
      setParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!targetMonth || draftItems.length === 0) return;
    setProcessing(true);

    try {
      let removedCount = 0;

      if (editMode === 'replace' && existingTransactions.length > 0) {
        setProcessStep('saving');
        removedCount = await deleteHouseholdTransactionsByMonth(targetMonth);
      }

      setProcessStep('categorizing');

      const existingForApi =
        editMode === 'merge'
          ? existingTransactions.map((tx) => ({
              date: tx.date.toISOString().split('T')[0],
              amount: tx.amount,
              merchant: tx.merchant,
              description: tx.description,
              type: tx.type,
              category: tx.category,
              source: tx.source,
              account: tx.account,
              owner: tx.owner,
              excluded: tx.excluded,
              flagged: tx.flagged,
            }))
          : [];

      setProcessStep('transfers');

      const response = await fetch('/api/process-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMonth,
          editMode,
          draftItems,
          existingTransactions: existingForApi,
        }),
      });

      setProcessStep('duplicates');
      const data = await response.json();
      if (!response.ok) {
        if (data.categorizationFailed) {
          addToast(
            'error',
            'No se pudo categorizar automáticamente. Intenta de nuevo o revisa la conexión con Gemini.'
          );
        }
        throw new Error(data.error);
      }

      setProcessStep('saving');

      const uploadId = `process-${Date.now()}`;
      const toSave = data.transactions.map(
        (tx: {
          date: string;
          description: string;
          merchant: string;
          amount: number;
          type: 'income' | 'expense';
          category: string;
          owner: 'Miguel' | 'Grecia';
          source: string;
          account: string;
          month: string;
          year: number;
          excluded: boolean;
          flagged: boolean;
          exclusionReason?: string;
          confidence?: number;
          needsReview?: boolean;
        }) => ({
          ...tx,
          date: new Date(tx.date),
          uploadId,
        })
      );

      const { saved, duplicates } = await addHouseholdTransactions(toSave);

      const uniqueFilenames = [
        ...new Set(draftItems.filter((d) => d.sourceFilename).map((d) => d.sourceFilename!)),
      ];
      for (const filename of uniqueFilenames) {
        const fileDraftCount = draftItems.filter((d) => d.sourceFilename === filename).length;
        await saveHouseholdUpload({
          filename,
          account: 'mixed',
          month: targetMonth,
          format: /\.(png|jpe?g)$/i.test(filename) ? 'unknown' : 'bank-of-america',
          rowCount: fileDraftCount,
          newTransactions: saved,
          duplicatesFound: duplicates,
          internalTransfersFound: data.internalTransferCount,
          status: 'completed',
        });
      }

      const allAnalysisKeys = await getMonthlyAnalysisList();
      const affectedLater = getMonthsAffectedByEdit(targetMonth, allAnalysisKeys);
      const staleKeys = [targetMonth, ...affectedLater].filter((k) =>
        allAnalysisKeys.includes(k)
      );
      if (staleKeys.length > 0) {
        await markAnalysesStale(staleKeys);
      }

      await appendEditHistory(targetMonth, {
        editType: editMode === 'new' ? 'merge' : editMode,
        transactionsAdded: saved,
        transactionsRemoved: removedCount,
      });

      await updateAnalysisSummaryAfterEdit(targetMonth, {
        income: data.metrics.income,
        expenses: data.metrics.expenses,
        netSavings: data.metrics.netSavings,
        savingsRate: data.metrics.savingsRate,
        categoryBreakdown: data.metrics.categoryBreakdown,
      }, data.transactionCount);

      let toastMsg = `${saved} transacciones guardadas para ${getMonthLabel(targetMonth)}`;
      if (data.internalTransferCount > 0) {
        toastMsg += `. ${data.internalTransferCount} transferencias internas detectadas`;
      }
      if (data.duplicateCount > 0) {
        toastMsg += `. ${data.duplicateCount} duplicadas omitidas`;
      }
      if (affectedLater.length > 0) {
        toastMsg += `. Análisis desactualizado en: ${affectedLater.map(getMonthLabel).join(', ')}`;
      }
      addToast('success', toastMsg);

      router.push(`/dashboard/relacion?month=${targetMonth}`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Error al analizar mes');
    } finally {
      setProcessing(false);
      setProcessStep('idle');
    }
  };

  const defaultDateForManual =
    targetMonth ? `${targetMonth}-01` : undefined;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/dashboard/cuenta')}
        className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Cuenta
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2 tracking-tight">Preparar Mes</h1>
        <p className="text-[#9CA3AF]">
          Armen el borrador del hogar con extractos CSV, capturas de pantalla y transacciones manuales, luego analicen el mes.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Paso 1 — Seleccionar mes</h3>
          <MonthSelector targetMonth={targetMonth} onChange={handleMonthChange} />
          {editMode !== 'new' && targetMonth && (
            <div className="mt-3 p-3 bg-[#F59E0B20] border border-[#F59E0B40] rounded-lg text-sm text-[#F9FAFB]">
              Modo: {editMode === 'replace' ? 'Empezar de cero' : 'Agregar / Mergear'} —{' '}
              {existingTransactions.length} transacciones existentes
            </div>
          )}
        </div>

        {targetMonth && (
          <>
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#10B981]" />
                Paso 2 — Cargar extractos
              </h3>
              <p className="text-sm text-[#9CA3AF] mb-4">
                CSV: Miguel-Junio-bofa.csv · Capturas: .png, .jpg de la app del banco
              </p>

              <label className="block border-2 border-dashed border-[#374151] rounded-xl p-8 text-center cursor-pointer hover:border-[#10B981] transition-colors mb-4">
                <Upload className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
                <p className="text-[#F9FAFB] font-medium">Arrastren CSV o capturas de pantalla aquí</p>
                <p className="text-sm text-[#9CA3AF]">o hagan clic para seleccionar</p>
                <input
                  type="file"
                  accept=".csv,.png,.jpg,.jpeg"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {files.length > 0 && (
                <div className="space-y-2 mb-4">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-3 bg-[#1F2937] rounded-lg"
                    >
                      <span className="text-[#F9FAFB] text-sm">{file.name}</span>
                      <button
                        onClick={() => setFiles(files.filter((f) => f.name !== file.name))}
                        className="text-[#EF4444] text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleParseFiles}
                    disabled={parsing}
                    className="w-full px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {parsing ? 'Procesando archivos...' : `Agregar ${files.length} archivo(s) al borrador`}
                  </button>
                </div>
              )}

              {parseErrors.length > 0 && (
                <div className="mb-4 p-4 bg-[#F59E0B20] border border-[#F59E0B40] rounded-lg text-sm text-[#F9FAFB] space-y-1">
                  {parseErrors.map((err, i) => (
                    <p key={i}>⚠️ {err}</p>
                  ))}
                </div>
              )}

              <ManualTransactionForm
                accounts={accounts.length > 0 ? accounts : ['Cuenta principal']}
                defaultDate={defaultDateForManual}
                onAdd={addManual}
              />
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                Paso 3 — Revisar borrador
              </h3>
              <DraftTransactionList
                items={draftItems}
                targetMonth={targetMonth}
                onRemove={removeItem}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={draftItems.length === 0 || processing}
              className="w-full px-6 py-4 bg-[#10B981] text-white rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {STEP_LABELS[processStep]}
                </>
              ) : (
                `Analizar Mes — ${getMonthLabel(targetMonth)} (${draftItems.length} transacciones)`
              )}
            </button>
          </>
        )}
      </div>

      <EditMonthDialog
        isOpen={showEditDialog}
        monthLabel={pendingMonth ? getMonthLabel(pendingMonth) : ''}
        existingCount={existingTransactions.length}
        onReplace={handleReplace}
        onMerge={handleMerge}
        onClose={() => {
          setShowEditDialog(false);
          setPendingMonth(null);
        }}
      />
    </div>
  );
}
