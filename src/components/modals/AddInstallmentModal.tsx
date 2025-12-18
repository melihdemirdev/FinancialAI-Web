'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { validateInstallment } from '@/domain/validations/financial';
import { Currency } from '@/types';

export function AddInstallmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addInstallment = useFinanceStore((s) => s.addInstallment);
  const defaultCurrency = useProfileStore((s) => s.profile.currency);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    installmentAmount: '', 
    remainingMonths: '', 
    paymentDay: '15', // Varsayılan 15
    endDate: '', 
    currency: defaultCurrency, 
    details: '' 
  });
  
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateInstallment({ 
      name: formData.name, 
      installmentAmount: parseFloat(formData.installmentAmount), 
      remainingMonths: parseInt(formData.remainingMonths), 
      endDate: formData.endDate, 
      currency: formData.currency as Currency, 
      details: formData.details 
    });
    
    if (!validation.valid) { 
      setErrors(validation.errors); 
      return; 
    }

    addInstallment({ 
      name: formData.name, 
      installmentAmount: parseFloat(formData.installmentAmount), 
      remainingMonths: parseInt(formData.remainingMonths), 
      paymentDay: parseInt(formData.paymentDay),
      endDate: formData.endDate, 
      currency: formData.currency as Currency, 
      details: formData.details 
    });

    setFormData({ 
      name: '', 
      installmentAmount: '', 
      remainingMonths: '', 
      paymentDay: '15',
      endDate: '', 
      currency: defaultCurrency, 
      details: '' 
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Taksit Ekle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
              {errors.map((error, index) => (<li key={index}>{error}</li>))}
            </ul>
          </div>
        )}
        
        <Input 
          label="Taksit Adı" 
          placeholder="Örn: Araba Kredisi" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Aylık Tutar" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            value={formData.installmentAmount} 
            onChange={(e) => setFormData({ ...formData, installmentAmount: e.target.value })} 
            required 
          />
          <Input 
            label="Ödeme Günü (Ayın Kaçında?)" 
            type="number" 
            min="1" 
            max="31" 
            placeholder="15" 
            value={formData.paymentDay} 
            onChange={(e) => setFormData({ ...formData, paymentDay: e.target.value })} 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Kalan Ay Sayısı" 
            type="number" 
            placeholder="12" 
            value={formData.remainingMonths} 
            onChange={(e) => setFormData({ ...formData, remainingMonths: e.target.value })} 
            required 
          />
          <Input 
            label="Bitiş Tarihi" 
            type="date" 
            value={formData.endDate} 
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
            required 
          />
        </div>

        <Select 
          label="Para Birimi" 
          value={formData.currency} 
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })} 
          options={[
            { value: 'TRY', label: '₺ Türk Lirası' }, 
            { value: 'USD', label: '$ Amerikan Doları' }, 
            { value: 'EUR', label: '€ Euro' }, 
            { value: 'GBP', label: '£ İngiliz Sterlini' }
          ]} 
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notlar (Opsiyonel)</label>
          <textarea 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-light transition-all resize-none" 
            rows={3} 
            placeholder="Ek bilgiler..." 
            value={formData.details} 
            onChange={(e) => setFormData({ ...formData, details: e.target.value })} 
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">İptal</Button>
          <Button type="submit" variant="primary" className="flex-1">Ekle</Button>
        </div>
      </form>
    </Modal>
  );
}