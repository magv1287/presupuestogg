'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { updateHouseholdProfile } from '@/lib/firebase/household';
import { DefaultPage } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';

const PAGE_OPTIONS: { value: DefaultPage; label: string }[] = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'relacion', label: 'Relación Mensual' },
  { value: 'cuenta', label: 'Cuenta' },
];

export function PreferencesSection() {
  const { user, householdProfile } = useAuth();
  const { addToast } = useToast();
  const [defaultPage, setDefaultPage] = useState<DefaultPage>('resumen');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email && householdProfile?.userPreferences?.[user.email]) {
      setDefaultPage(householdProfile.userPreferences[user.email].defaultPage);
    }
  }, [user, householdProfile]);

  const handleSave = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await updateHouseholdProfile({
        userPreferences: {
          ...householdProfile?.userPreferences,
          [user.email]: { defaultPage },
        },
      });
      addToast('success', 'Preferencias guardadas');
    } catch {
      addToast('error', 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Preferencias</h3>
      <div>
        <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
          Página de inicio al loguearse
        </label>
        <select
          value={defaultPage}
          onChange={(e) => setDefaultPage(e.target.value as DefaultPage)}
          className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981] mb-4"
        >
          {PAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}
