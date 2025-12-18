'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/domain/formatters/currency';
import { 
  ArrowLeft, Plus, Trash2, Tv, Music, Zap, Shield, ShoppingBag, Globe, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddSubscriptionModal } from '@/components/modals/AddSubscriptionModal';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  streaming: { icon: Tv, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  music: { icon: Music, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  software: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  gym: { icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  shopping: { icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  other: { icon: Globe, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' },
};

export default function SubscriptionsPage() {
  const { subscriptions, removeSubscription, getTotalSubscriptions } = useFinanceStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('Aboneliği iptal etmek/silmek istediğinizden emin misiniz?')) {
      removeSubscription(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aboneliklerim</h1>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} size="md">
              <Plus className="w-4 h-4" /> <span>Abonelik Ekle</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <RefreshCw className="w-32 h-32 text-purple-600 animate-spin-slow" />
            </div>
            <div className="relative z-10 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Aylık Toplam Sabit Gider</p>
              <p className="text-5xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(getTotalSubscriptions(), 'TRY')}</p>
              <p className="text-xs text-gray-400 mt-2">{subscriptions.length} aktif abonelik</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {subscriptions.map((sub) => {
              const config = categoryConfig[sub.category || 'other'] || categoryConfig.other;
              const Icon = config.icon;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{sub.name}</p>
                      <p className="text-xs text-gray-500">Ayın {sub.renewalDay}. günü yenilenir</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-lg text-gray-900 dark:text-white">{formatCurrency(sub.price, sub.currency)}</p>
                    <button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Henüz bir abonelik eklenmemiş.</p>
          </div>
        )}
      </main>

      <AddSubscriptionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
