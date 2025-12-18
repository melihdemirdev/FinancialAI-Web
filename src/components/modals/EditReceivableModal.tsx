'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { validateReceivable } from '@/domain/validations/financial';
import { Receivable, Currency } from '@/types';

interface EditReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivable: Receivable;
}

export function EditReceivableModal({ isOpen, onClose, receivable }: EditReceivableModalProps) {
  const updateReceivable = useFinanceStore((s) => s.updateReceivable);
  const [formData, setFormData] = useState({ debtor: receivable.debtor, amount: receivable.amount.toString(), dueDate: receivable.dueDate, currency: receivable.currency, details: receivable.details || '' });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setFormData({ debtor: receivable.debtor, amount: receivable.amount.toString(), dueDate: receivable.dueDate, currency: receivable.currency, details: receivable.details || '' });
  }, [receivable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateReceivable({ debtor: formData.debtor, amount: parseFloat(formData.amount), dueDate: formData.dueDate, currency: formData.currency as Currency, details: formData.details });
    if (!validation.valid) { setErrors(validation.errors); return; }
    updateReceivable(receivable.id, { debtor: formData.debtor, amount: parseFloat(formData.amount), dueDate: formData.dueDate, currency: formData.currency as Currency, details: formData.details });
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alacağı Düzenle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"><ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">{errors.map((error, index) => (<li key={index}>{error}</li>))}</ul></div>}
        <Input label="Borçlu Adı" value={formData.debtor} onChange={(e) => setFormData({ ...formData, debtor: e.target.value })} required />
        <Input label="Alacak Tutarı" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
        <Input label="Vade Tarihi" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
        <Select label="Para Birimi" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} options={[{ value: 'TRY', label: '₺ Türk Lirası' }, { value: 'USD', label: '$ Amerikan Doları' }, { value: 'EUR', label: '€ Euro' }, { value: 'GBP', label: '£ İngiliz Sterlini' }]} />
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notlar</label><textarea className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-light transition-all resize-none" rows={3} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} /></div>
        <div className="flex gap-3 pt-4"><Button type="button" variant="secondary" onClick={onClose} className="flex-1">İptal</Button><Button type="submit" variant="primary" className="flex-1">Güncelle</Button></div>
      </form>
    </Modal>
  );
}
