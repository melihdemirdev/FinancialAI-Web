'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { TransactionType, TransactionCategory, Currency } from '@/types';
import { Plus, Minus, Utensils, Car, Home, Film, ShoppingBag, Heart, GraduationCap, Briefcase, DollarSign, TrendingUp, Gift, Wallet } from 'lucide-react';

const expenseCategories = [
  { value: 'food', label: 'Yemek', icon: Utensils },
  { value: 'transport', label: 'Ulaşım', icon: Car },
  { value: 'rent', label: 'Kira/Ev', icon: Home },
  { value: 'entertainment', label: 'Eğlence', icon: Film },
  { value: 'shopping', label: 'Alışveriş', icon: ShoppingBag },
  { value: 'health', label: 'Sağlık', icon: Heart },
  { value: 'education', label: 'Eğitim', icon: GraduationCap },
  { value: 'other_expense', label: 'Diğer', icon: Wallet },
];

const incomeCategories = [
  { value: 'salary', label: 'Maaş', icon: Briefcase },
  { value: 'freelance', label: 'Ek Gelir', icon: TrendingUp },
  { value: 'investment', label: 'Yatırım', icon: DollarSign },
  { value: 'gift', label: 'Hediye', icon: Gift },
  { value: 'other_income', label: 'Diğer', icon: Wallet },
];

export function AddTransactionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const profileCurrency = useProfileStore((s) => s.profile.currency);

  const [type, setType] = useState<TransactionType>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: profileCurrency || 'TRY',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    addTransaction({
      type,
      category: formData.category as TransactionCategory,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      currency: formData.currency as Currency,
    });
    
    setFormData({
      amount: '',
      category: type === 'expense' ? 'food' : 'salary',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: profileCurrency || 'TRY',
    });
    onClose();
  };

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni İşlem Ekle" size="md">
      <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => { setType('expense'); setFormData({...formData, category: 'food'}); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${
            type === 'expense' ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Minus className="w-4 h-4" /> Gider
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setFormData({...formData, category: 'salary'}); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${
            type === 'income' ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Plus className="w-4 h-4" /> Gelir
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Miktar"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Select
            label="Para Birimi"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            options={[
              { value: 'TRY', label: 'TRY' },
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium text-center leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Açıklama"
          placeholder="Örn: Market alışverişi"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Input
          label="Tarih"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">İptal</Button>
          <Button type="submit" variant="primary" className="flex-1">Ekle</Button>
        </div>
      </form>
    </Modal>
  );
}