'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CuentaPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: userProfile?.monthlyIncome || 0,
    savingsAccounts: userProfile?.savingsAccounts || [],
    newAccount: '',
  });
  
  const handleSave = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.uid, {
        monthlyIncome: formData.monthlyIncome,
        savingsAccounts: formData.savingsAccounts,
      });
      setEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil');
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
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">
          Mi Cuenta
        </h1>
        <p className="text-[#9CA3AF]">
          Gestiona tu perfil y configuración
        </p>
      </div>
      
      {/* Profile Card */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-2xl font-bold">
            {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">
              {user.displayName || 'Usuario'}
            </h2>
            <p className="text-[#9CA3AF]">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t border-[#1F2937] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#F9FAFB]">
              Configuración Financiera
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#1F2937] text-[#F9FAFB] rounded-lg hover:bg-[#374151] transition-colors font-medium"
              >
                Editar
              </button>
            )}
          </div>
          
          {/* Monthly Income */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
              Ingreso Mensual
            </label>
            {editing ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) })}
                  className="w-full bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-3 pl-8 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-[#10B981] font-mono">
                ${formData.monthlyIncome.toLocaleString()}
              </p>
            )}
          </div>
          
          {/* Savings Accounts */}
          <div>
            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
              Cuentas de Ahorro
            </label>
            <p className="text-xs text-[#6B7280] mb-3">
              Transferencias a estas cuentas serán excluidas del análisis de gastos
            </p>
            
            {editing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={formData.newAccount}
                  onChange={(e) => setFormData({ ...formData, newAccount: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                  placeholder="Nombre de la cuenta"
                  className="flex-1 bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-2.5 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
                <button
                  onClick={handleAddAccount}
                  className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors"
                >
                  Agregar
                </button>
              </div>
            )}
            
            {formData.savingsAccounts.length > 0 ? (
              <div className="space-y-2">
                {formData.savingsAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#1F2937] rounded-lg px-4 py-3"
                  >
                    <span className="text-[#F9FAFB]">{account}</span>
                    {editing && (
                      <button
                        onClick={() => handleRemoveAccount(index)}
                        className="text-[#EF4444] hover:text-[#DC2626] transition-colors text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B7280] text-sm italic">
                No hay cuentas de ahorro registradas
              </p>
            )}
          </div>
          
          {editing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    monthlyIncome: userProfile?.monthlyIncome || 0,
                    savingsAccounts: userProfile?.savingsAccounts || [],
                    newAccount: '',
                  });
                }}
                className="flex-1 bg-[#1F2937] text-[#F9FAFB] px-6 py-3 rounded-lg font-medium hover:bg-[#374151] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-[#111827] border border-[#EF4444]/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#EF4444] mb-4">
          Zona de Peligro
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F9FAFB] font-medium mb-1">
              Cerrar Sesión
            </p>
            <p className="text-sm text-[#9CA3AF]">
              Salir de tu cuenta de GonGar
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2.5 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626] transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
