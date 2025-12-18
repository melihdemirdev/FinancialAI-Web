'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { validateLiability } from '@/domain/validations/financial';
import { LiabilityType, Currency } from '@/types';

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLiabilityModal({ isOpen, onClose }: AddLiabilityModalProps) {
  const addLiability = useFinanceStore((s) => s.addLiability);
  const defaultCurrency = useProfileStore((s) => s.profile.currency);

  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card' as LiabilityType,
    currentDebt: '',
    totalLimit: '',
    dueDate: '',
    currency: defaultCurrency,
    details: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateLiability({
      name: formData.name,
      type: formData.type,
      currentDebt: parseFloat(formData.currentDebt),
      totalLimit: formData.totalLimit ? parseFloat(formData.totalLimit) : undefined,
      dueDate: formData.dueDate || undefined,
      currency: formData.currency as Currency,
      details: formData.details,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    addLiability({
      name: formData.name,
      type: formData.type,
      currentDebt: parseFloat(formData.currentDebt),
      totalLimit: formData.totalLimit ? parseFloat(formData.totalLimit) : undefined,
      dueDate: formData.dueDate || undefined,
      currency: formData.currency as Currency,
      details: formData.details,
    });

    setFormData({
      name: '',
      type: 'credit_card',
      currentDebt: '',
      totalLimit: '',
      dueDate: '',
      currency: defaultCurrency,
      details: '',
    });
    setErrors([]);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'credit_card',
      currentDebt: '',
      totalLimit: '',
      dueDate: '',
      currency: defaultCurrency,
      details: '',
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yeni Borç Ekle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Input
          label="Borç Adı"
          placeholder="Örn: X Bankası Kredi Kartı"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          label="Borç Tipi"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as LiabilityType })}
          options={[
            { value: 'credit_card', label: 'Kredi Kartı' },
            { value: 'personal_debt', label: 'Şahıs Borcu' },
          ]}
        />

        <Input
          label="Güncel Borç"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.currentDebt}
          onChange={(e) => setFormData({ ...formData, currentDebt: e.target.value })}
          required
        />

        {formData.type === 'credit_card' && (
          <Input
            label="Toplam Limit (Opsiyonel)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.totalLimit}
            onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })}
          />
        )}

        <Input
          label="Son Ödeme Tarihi (Opsiyonel)"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />

        <Select
          label="Para Birimi"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
          options={[
            { value: 'TRY', label: '₺ Türk Lirası' },
            { value: 'USD', label: '$ Amerikan Doları' },
            { value: 'EUR', label: '€ Euro' },
            { value: 'GBP', label: '£ İngiliz Sterlini' },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notlar (Opsiyonel)
          </label>
          <textarea
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-light focus:border-transparent transition-all resize-none"
            rows={3}
            placeholder="Ek bilgiler..."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            İptal
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Ekle
          </Button>
        </div>
      </form>
    </Modal>
  );
}
