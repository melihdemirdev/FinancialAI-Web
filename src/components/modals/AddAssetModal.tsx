'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { validateAsset } from '@/domain/validations/financial';
import { AssetType, Currency } from '@/types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const addAsset = useFinanceStore((s) => s.addAsset);
  const defaultCurrency = useProfileStore((s) => s.profile.currency);

  const [formData, setFormData] = useState({
    name: '',
    type: 'liquid' as AssetType,
    value: '',
    currency: defaultCurrency,
    details: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAsset({
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      currency: formData.currency as Currency,
      details: formData.details,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    addAsset({
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      currency: formData.currency as Currency,
      details: formData.details,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'liquid',
      value: '',
      currency: defaultCurrency,
      details: '',
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yeni Varlık Ekle" size="md">
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
          label="Varlık Adı"
          placeholder="Örn: Banka Hesabı"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Varlık Tipi"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
            options={[
              { value: 'liquid', label: 'Likit (Nakit)' },
              { value: 'term', label: 'Vadeli' },
              { value: 'gold_currency', label: 'Altın/Döviz' },
              { value: 'funds', label: 'Fonlar' },
            ]}
          />
          <Input
            label="Değer"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
        </div>

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
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-light transition-all resize-none"
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
