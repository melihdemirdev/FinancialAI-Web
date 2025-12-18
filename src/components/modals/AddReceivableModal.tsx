'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { validateReceivable } from '@/domain/validations/financial';
import { Currency } from '@/types';

interface AddReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddReceivableModal({ isOpen, onClose }: AddReceivableModalProps) {
  const addReceivable = useFinanceStore((s) => s.addReceivable);
  const defaultCurrency = useProfileStore((s) => s.profile.currency);

  const [formData, setFormData] = useState({
    debtor: '',
    amount: '',
    dueDate: '',
    currency: defaultCurrency,
    details: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateReceivable({
      debtor: formData.debtor,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      currency: formData.currency as Currency,
      details: formData.details,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    addReceivable({
      debtor: formData.debtor,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      currency: formData.currency as Currency,
      details: formData.details,
    });

    setFormData({ debtor: '', amount: '', dueDate: '', currency: defaultCurrency, details: '' });
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Alacak Ekle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
              {errors.map((error, index) => (<li key={index}>{error}</li>))}
            </ul>
          </div>
        )}

        <Input label="Borçlu Adı" placeholder="Örn: Ahmet Yılmaz" value={formData.debtor} onChange={(e) => setFormData({ ...formData, debtor: e.target.value })} required />
        <Input label="Alacak Tutarı" type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
        <Input label="Vade Tarihi" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
        <Select label="Para Birimi" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} options={[{ value: 'TRY', label: '₺ Türk Lirası' }, { value: 'USD', label: '$ Amerikan Doları' }, { value: 'EUR', label: '€ Euro' }, { value: 'GBP', label: '£ İngiliz Sterlini' }]} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notlar (Opsiyonel)</label>
          <textarea className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-light focus:border-transparent transition-all resize-none" rows={3} placeholder="Ek bilgiler..." value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">İptal</Button>
          <Button type="submit" variant="primary" className="flex-1">Ekle</Button>
        </div>
      </form>
    </Modal>
  );
}
