'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import {
  updateHouseholdProfile,
  getHouseholdUploads,
  HouseholdUpload,
} from '@/lib/firebase/household';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { PreferencesSection } from '@/components/dashboard/PreferencesSection';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getMonthLabel } from '@/lib/utils/dates';
import { Trash2, LogOut, CalendarPlus } from 'lucide-react';

interface SavingsAccountForm {
  name: string;
  balance: number;
}

export default function CuentaPage() {
  const router = useRouter();
  const { user, householdProfile } = useAuth();
  const { addToast } = useToast();
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccountForm[]>([]);
  const [emergencyBalance, setEmergencyBalance] = useState(0);
  const [targetMonths, setTargetMonths] = useState(3);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [uploads, setUploads] = useState<HouseholdUpload[]>([]);

  useEffect(() => {
    if (householdProfile) {
      setSavingsAccounts(householdProfile.savingsAccounts || []);
      setEmergencyBalance(householdProfile.emergencyFund?.currentBalance || 0);
      setTargetMonths(householdProfile.emergencyFund?.targetMonths || 3);
    }
  }, [householdProfile]);

  useEffect(() => {
    getHouseholdUploads().then(setUploads).catch(console.error);
  }, []);

  if (!user || !householdProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateHouseholdProfile({
        savingsAccounts,
        emergencyFund: { currentBalance: emergencyBalance, targetMonths },
      });
      addToast('success', 'Perfil del hogar actualizado correctamente');
    } catch {
      addToast('error', 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim()) return;
    setSavingsAccounts([
      ...savingsAccounts,
      { name: newAccountName.trim(), balance: newAccountBalance },
    ]);
    setNewAccountName('');
    setNewAccountBalance(0);
  };

  const handleRemoveAccount = (index: number) => {
    setSavingsAccounts(savingsAccounts.filter((_, i) => i !== index));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2 tracking-tight">Cuenta</h1>
        <p className="text-[#9CA3AF]">Perfil del hogar, cuentas de ahorro y preferencias</p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar name={user.displayName} email={user.email} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">{user.displayName || 'Usuario'}</h2>
            <p className="text-[#9CA3AF]">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-[#1F2937] text-[#9CA3AF] px-2 py-0.5 rounded-full">
              Google
            </span>
          </div>
        </div>
      </div>

      <PreferencesSection />

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Cuentas de Ahorro del Hogar</h3>
        <div className="space-y-3 mb-4">
          {savingsAccounts.map((account, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={account.name}
                onChange={(e) => {
                  const updated = [...savingsAccounts];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setSavingsAccounts(updated);
                }}
                className="flex-1 px-4 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
              <div className="w-36">
                <CurrencyInput
                  value={account.balance}
                  onChange={(balance) => {
                    const updated = [...savingsAccounts];
                    updated[index] = { ...updated[index], balance };
                    setSavingsAccounts(updated);
                  }}
                />
              </div>
              <button
                onClick={() => handleRemoveAccount(index)}
                className="text-[#EF4444] hover:text-[#DC2626] p-2"
                aria-label="Eliminar cuenta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Nombre de cuenta"
            className="flex-1 px-4 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
          <div className="w-36">
            <CurrencyInput value={newAccountBalance} onChange={setNewAccountBalance} />
          </div>
          <button
            onClick={handleAddAccount}
            className="px-4 py-2 bg-[#1F2937] text-[#10B981] border border-[#374151] rounded-lg hover:bg-[#374151] transition-colors"
          >
            + Agregar
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Fondo de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
              Balance actual
            </label>
            <CurrencyInput value={emergencyBalance} onChange={setEmergencyBalance} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
              Meta (meses de gastos)
            </label>
            <select
              value={targetMonths}
              onChange={(e) => setTargetMonths(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {Array.from({ length: 10 }, (_, i) => i + 3).map((m) => (
                <option key={m} value={m}>
                  {m} meses
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full mb-6 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 font-medium"
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2 flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-[#10B981]" />
          Preparar Mes
        </h3>
        <p className="text-sm text-[#9CA3AF] mb-4">
          Carguen extractos CSV, capturas de pantalla o transacciones manuales y analicen un mes del hogar.
        </p>
        <button
          onClick={() => router.push('/dashboard/preparar')}
          className="w-full px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
        >
          Preparar Mes →
        </button>
      </div>

      {uploads.length > 0 && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Historial de Cargas</h3>
          <div className="space-y-2">
            {uploads.map((upload) => (
              <CollapsibleSection
                key={upload.id}
                title={upload.filename}
                badge={
                  <span className="text-xs text-[#9CA3AF]">
                    {getMonthLabel(upload.month)} · {upload.newTransactions} nuevas
                  </span>
                }
              >
                <div className="text-sm text-[#9CA3AF] space-y-1">
                  <p>Formato: {upload.format}</p>
                  <p>Filas: {upload.rowCount}</p>
                  <p>Duplicadas: {upload.duplicatesFound}</p>
                  <p>Transferencias internas: {upload.internalTransfersFound}</p>
                  <p>Estado: {upload.status}</p>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#111827] border border-[#EF4444]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F9FAFB] font-medium mb-1">Cerrar Sesión</p>
            <p className="text-sm text-[#9CA3AF]">Salir de tu cuenta de GonGar</p>
          </div>
          <Button variant="danger" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
        <p className="text-xs text-[#6B7280] mt-4">v2.0.0</p>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="¿Cerrar sesión?"
        description="Saldrás de tu cuenta de GonGar."
        confirmLabel="Cerrar Sesión"
        variant="danger"
        onConfirm={handleSignOut}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
