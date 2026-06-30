'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateHouseholdProfile } from '@/lib/firebase/household';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, householdProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    savingsAccounts: [] as Array<{ name: string; balance: number }>,
    newAccountName: '',
    newAccountBalance: '',
    emergencyFundBalance: '',
    emergencyFundMonths: '3',
  });
  
  // Load existing data if available
  useEffect(() => {
    if (householdProfile) {
      setFormData(prev => ({
        ...prev,
        savingsAccounts: householdProfile.savingsAccounts || [],
        emergencyFundBalance: householdProfile.emergencyFund?.currentBalance?.toString() || '',
        emergencyFundMonths: householdProfile.emergencyFund?.targetMonths?.toString() || '3',
      }));
      setStep(householdProfile.onboardingStep || 1);
    }
  }, [householdProfile]);
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  // Skip onboarding if already completed
  if (householdProfile?.onboardingCompleted) {
    router.push('/dashboard/resumen');
    return null;
  }
  
  const saveProgress = async (newStep: number, updates: any = {}) => {
    try {
      await updateHouseholdProfile({
        ...updates,
        onboardingStep: newStep,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  
  const handleNext = async () => {
    if (step < 3) {
      const nextStep = step + 1;
      
      // Save progress before moving to next step
      if (step === 1) {
        await saveProgress(nextStep, {
          savingsAccounts: formData.savingsAccounts,
        });
      } else if (step === 2) {
        await saveProgress(nextStep, {
          emergencyFund: {
            currentBalance: parseFloat(formData.emergencyFundBalance) || 0,
            targetMonths: parseInt(formData.emergencyFundMonths) || 3,
          },
        });
      }
      
      setStep(nextStep);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleAddAccount = async () => {
    if (formData.newAccountName.trim()) {
      const newAccount = {
        name: formData.newAccountName.trim(),
        balance: parseFloat(formData.newAccountBalance) || 0,
      };
      
      const updatedAccounts = [...formData.savingsAccounts, newAccount];
      
      setFormData({
        ...formData,
        savingsAccounts: updatedAccounts,
        newAccountName: '',
        newAccountBalance: '',
      });
      
      // Save immediately
      await saveProgress(step, {
        savingsAccounts: updatedAccounts,
      });
    }
  };
  
  const handleRemoveAccount = async (index: number) => {
    const updatedAccounts = formData.savingsAccounts.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      savingsAccounts: updatedAccounts,
    });
    
    // Save immediately
    await saveProgress(step, {
      savingsAccounts: updatedAccounts,
    });
  };
  
  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateHouseholdProfile({
        savingsAccounts: formData.savingsAccounts,
        emergencyFund: {
          currentBalance: parseFloat(formData.emergencyFundBalance) || 0,
          targetMonths: parseInt(formData.emergencyFundMonths) || 3,
        },
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      router.push('/dashboard/resumen');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9CA3AF]">Paso {step} de 3</span>
            <span className="text-sm text-[#9CA3AF]">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Content Card */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                ¡Bienvenidos a GonGar! 👋
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Configuremos las cuentas de ahorro del household.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    Nombre de la cuenta
                  </label>
                  <input
                    type="text"
                    value={formData.newAccountName}
                    onChange={(e) => setFormData({ ...formData, newAccountName: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                    placeholder="Ej: Marcus HYSA, Ally Savings..."
                    className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    Balance actual
                  </label>
                  <input
                    type="number"
                    value={formData.newAccountBalance}
                    onChange={(e) => setFormData({ ...formData, newAccountBalance: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                
                <button
                  onClick={handleAddAccount}
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#10B981] hover:bg-[#374151] transition-colors"
                >
                  + Agregar Cuenta
                </button>
              </div>
              
              {formData.savingsAccounts.length > 0 && (
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-[#9CA3AF] mb-2">
                    Cuentas agregadas:
                  </p>
                  {formData.savingsAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1F2937] rounded-lg"
                    >
                      <div>
                        <p className="text-[#F9FAFB] font-medium">{account.name}</p>
                        <p className="text-sm text-[#9CA3AF]">${account.balance.toLocaleString()}</p>
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
                  onClick={handleNext}
                  disabled={formData.savingsAccounts.length === 0}
                  className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                Fondo de Emergencia 🛡️
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Configura tu fondo de emergencia para tener un colchón financiero.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    Balance actual del fondo
                  </label>
                  <input
                    type="number"
                    value={formData.emergencyFundBalance}
                    onChange={(e) => setFormData({ ...formData, emergencyFundBalance: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    Meta (meses de gastos)
                  </label>
                  <select
                    value={formData.emergencyFundMonths}
                    onChange={(e) => setFormData({ ...formData, emergencyFundMonths: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="9">9 meses</option>
                    <option value="12">12 meses</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-[#1F2937] text-[#F9FAFB] rounded-lg hover:bg-[#374151] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                ¡Todo listo! 🎉
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Tu household está configurado. Ahora puedes empezar a subir tus CSVs bancarios.
              </p>
              
              <div className="bg-[#1F2937] rounded-lg p-6 mb-8 space-y-4">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Cuentas de ahorro</p>
                  <p className="text-lg font-semibold text-[#F9FAFB]">
                    {formData.savingsAccounts.length} cuenta(s)
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Fondo de emergencia</p>
                  <p className="text-lg font-semibold text-[#F9FAFB]">
                    ${parseFloat(formData.emergencyFundBalance || '0').toLocaleString()} / {formData.emergencyFundMonths} meses
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-[#1F2937] text-[#F9FAFB] rounded-lg hover:bg-[#374151] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Completar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
