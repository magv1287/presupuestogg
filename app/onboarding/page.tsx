'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateHouseholdProfile } from '@/lib/firebase/household';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, householdProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingsAccounts, setSavingsAccounts] = useState<Array<{ name: string; balance: number }>>(
    []
  );
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState(0);

  useEffect(() => {
    if (householdProfile) {
      setSavingsAccounts(householdProfile.savingsAccounts || []);
      setStep(householdProfile.onboardingStep || 1);
    }
  }, [householdProfile]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (householdProfile?.onboardingCompleted) {
      router.push('/dashboard/resumen');
    }
  }, [user, householdProfile, router]);

  if (!user || householdProfile?.onboardingCompleted) {
    return null;
  }

  const saveProgress = async (newStep: number, updates: Record<string, unknown> = {}) => {
    await updateHouseholdProfile({
      ...updates,
      onboardingStep: newStep,
    });
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;

    const updatedAccounts = [
      ...savingsAccounts,
      { name: newAccountName.trim(), balance: newAccountBalance },
    ];

    setSavingsAccounts(updatedAccounts);
    setNewAccountName('');
    setNewAccountBalance(0);

    await saveProgress(step, { savingsAccounts: updatedAccounts });
  };

  const handleRemoveAccount = async (index: number) => {
    const updatedAccounts = savingsAccounts.filter((_, i) => i !== index);
    setSavingsAccounts(updatedAccounts);
    await saveProgress(step, { savingsAccounts: updatedAccounts });
  };

  const handleWelcomeNext = async () => {
    await saveProgress(2);
    setStep(2);
  };

  const handleComplete = async () => {
    if (savingsAccounts.length === 0) return;
    setLoading(true);
    try {
      await updateHouseholdProfile({
        savingsAccounts,
        emergencyFund: { currentBalance: 0, targetMonths: 3 },
        onboardingCompleted: true,
        onboardingStep: 2,
      });
      router.push('/dashboard/resumen');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user.displayName?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9CA3AF]">Paso {step} de 2</span>
            <div className="flex gap-2">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[#10B981]' : 'bg-[#374151]'}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[#10B981]' : 'bg-[#374151]'}`} />
            </div>
          </div>
          <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8">
          {step === 1 && (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#10B981] mb-6">GonGar</h1>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                Bienvenido/a, {displayName} 👋
              </h2>
              <p className="text-[#9CA3AF] mb-8">
                Vamos a configurar tu perfil para empezar en 2 pasos
              </p>
              <button
                onClick={handleWelcomeNext}
                className="w-full px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                Comenzar →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">Cuentas de Ahorro</h2>
              <p className="text-[#9CA3AF] mb-6">
                Agrega las cuentas de ahorro del household con su saldo inicial.
              </p>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAccount()}
                  placeholder="Apple HYSA, Capital One HYSA..."
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <CurrencyInput value={newAccountBalance} onChange={setNewAccountBalance} />
                <button
                  onClick={handleAddAccount}
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#10B981] hover:bg-[#374151] transition-colors"
                >
                  + Agregar Cuenta
                </button>
              </div>

              {savingsAccounts.length > 0 && (
                <div className="space-y-2 mb-6">
                  {savingsAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1F2937] rounded-lg"
                    >
                      <div>
                        <p className="text-[#F9FAFB] font-medium">{account.name}</p>
                        <p className="text-sm text-[#9CA3AF] font-mono">
                          ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveAccount(index)}
                        className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep(1);
                    saveProgress(1);
                  }}
                  className="px-6 py-3 bg-[#1F2937] text-[#F9FAFB] rounded-lg hover:bg-[#374151] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  disabled={savingsAccounts.length === 0 || loading}
                  className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Guardando...' : 'Guardar y Continuar →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
