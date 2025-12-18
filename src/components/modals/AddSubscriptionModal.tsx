'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Currency } from '@/types';
import { Bell, Music, Tv, Globe, Shield, CreditCard, ShoppingBag, Zap } from 'lucide-react';

const categories = [
  { value: 'streaming', label: 'Dizi/Film', icon: Tv },
  { value: 'music', label: 'Müzik', icon: Music },
  { value: 'software', label: 'Yazılım', icon: Zap },
  { value: 'gym', label: 'Spor', icon: Shield },
  { value: 'shopping', label: 'Alışveriş', icon: ShoppingBag },
  { value: 'other', label: 'Diğer', icon: Globe },
];

export function AddSubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addSubscription = useFinanceStore((s) => s.addSubscription);
  const profileCurrency = useProfileStore((s) => s.profile.currency);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: profileCurrency || 'TRY',
    renewalDay: '1',
    category: 'streaming',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubscription({
      name: formData.name,
      price: parseFloat(formData.price),
      currency: formData.currency as Currency,
      renewalDay: parseInt(formData.renewalDay),
      category: formData.category,
      active: true,
    });
    setFormData({
      name: '',
      price: '',
      currency: profileCurrency || 'TRY',
      renewalDay: '1',
      category: 'streaming',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Abonelik Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Abonelik Adı"
          placeholder="Örn: Netflix, Spotify"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Aylık Ücret"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Select
            label="Para Birimi"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            options={[{ value: 'TRY', label: 'TRY' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Yenilenme Günü (1-31)"
            type="number"
            min="1"
            max="31"
            value={formData.renewalDay}
            onChange={(e) => setFormData({ ...formData, renewalDay: e.target.value })}
            required
          />
          <Select
            label="Kategori"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categories.map(c => ({ value: c.value, label: c.label }))}
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
