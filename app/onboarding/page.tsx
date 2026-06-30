'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile } from '@/lib/firebase/firestore';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    savingsAccounts: [] as string[],
    newAccount: '',
  });
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  // Skip onboarding if already completed
  if (userProfile?.onboardingCompleted) {
    router.push('/dashboard/resumen');
    return null;
  }
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleAddAccount = () => {
    if (formData.newAccount.trim()) {
      setFormData({
        ...formData,
        savingsAccounts: [...formData.savingsAccounts, formData.newAccount.trim()],
        newAccount: '',
      });
    }
  };
  
  const handleRemoveAccount = (index: number) => {
    setFormData({
      ...formData,
      savingsAccounts: formData.savingsAccounts.filter((_, i) => i !== index),
    });
  };
  
  const handleComplete = async () => {
    try {
      await updateUserProfile(user.uid, {
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        savingsAccounts: formData.savingsAccounts,
        onboardingCompleted: true,
      });
      router.push('/dashboard/resumen');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error al guardar configuración');
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
                Vamos a configurar tu presupuesto en 3 pasos simples.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B98120] text-[#10B981] flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB]">Ingreso Mensual</h3>
                    <p className="text-sm text-[#9CA3AF]">Define tu ingreso mensual combinado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B98120] text-[#10B981] flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB]">Cuentas de Ahorro</h3>
                    <p className="text-sm text-[#9CA3AF]">Registra tus cuentas de ahorro para excluirlas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B98120] text-[#10B981] flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB]">¡Listo!</h3>
                    <p className="text-sm text-[#9CA3AF]">Comienza a subir tus transacciones</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="w-full bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors"
              >
                Comenzar
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                Ingreso Mensual
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                ¿Cuál es el ingreso mensual combinado de la familia?
              </p>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Ingreso Mensual (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    placeholder="5000"
                    className="w-full bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-3 pl-8 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-[#6B7280] mt-2">
                  Este valor se usa para calcular tu tasa de ahorro mensual
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-[#1F2937] text-[#F9FAFB] px-6 py-3 rounded-lg font-medium hover:bg-[#374151] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.monthlyIncome}
                  className="flex-1 bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                Cuentas de Ahorro
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Registra tus cuentas de ahorro para excluir transferencias del análisis
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Nombre de la Cuenta
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newAccount}
                    onChange={(e) => setFormData({ ...formData, newAccount: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                    placeholder="ej: Goldman Sachs HYSA"
                    className="flex-1 bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-2.5 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  />
                  <button
                    onClick={handleAddAccount}
                    className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
              
              {formData.savingsAccounts.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm font-medium text-[#F9FAFB] mb-3">
                    Cuentas Registradas ({formData.savingsAccounts.length})
                  </p>
                  <div className="space-y-2">
                    {formData.savingsAccounts.map((account, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#1F2937] rounded-lg px-4 py-3"
                      >
                        <span className="text-[#F9FAFB]">{account}</span>
                        <button
                          onClick={() => handleRemoveAccount(index)}
                          className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-[#1F2937] text-[#F9FAFB] px-6 py-3 rounded-lg font-medium hover:bg-[#374151] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors"
                >
                  Completar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
