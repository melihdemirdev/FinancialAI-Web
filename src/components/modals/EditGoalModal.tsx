'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Goal, Currency } from '@/types';
import { Home, Car, Plane, Shield, Gift } from 'lucide-react';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
}

const icons = [
  { value: 'home', label: 'Ev', icon: Home },
  { value: 'car', label: 'Araba', icon: Car },
  { value: 'vacation', label: 'Tatil', icon: Plane },
  { value: 'emergency', label: 'Acil Durum', icon: Shield },
  { value: 'other', label: 'Diğer', icon: Gift },
];

export function EditGoalModal({ isOpen, onClose, goal }: EditGoalModalProps) {
  const updateGoal = useFinanceStore((s) => s.updateGoal);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    currency: 'TRY',
    icon: 'other',
    deadline: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        currency: goal.currency,
        icon: goal.icon || 'other',
        deadline: goal.deadline || '',
      });
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoal(goal.id, {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      currency: formData.currency as Currency,
      icon: formData.icon,
      deadline: formData.deadline || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hedefi Düzenle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İkon Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hedef Türü
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {icons.map((item) => {
              const Icon = item.icon;
              const isSelected = formData.icon === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: item.value })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all min-w-[80px] ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Hedef Adı"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hedef Tutar"
            type="number"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
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
              { value: 'GBP', label: 'GBP' },
            ]}
          />
        </div>

        <Input
          label="Mevcut Birikim"
          type="number"
          value={formData.currentAmount}
          onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
        />

        <Input
          label="Hedef Tarihi"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button type="submit" className="flex-1">
            Güncelle
          </Button>
        </div>
      </form>
    </Modal>
  );
}
