'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { formatCurrency } from '@/domain/formatters/currency';
import { 
  ArrowLeft, Plus, Trash2, Utensils, Car, Home, Film, ShoppingBag, Heart, 
  GraduationCap, Briefcase, DollarSign, TrendingUp, Gift, Wallet, ArrowLeftRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  food: { label: 'Yemek', icon: Utensils, color: 'text-orange-500' },
  transport: { label: 'Ulaşım', icon: Car, color: 'text-blue-500' },
  rent: { label: 'Kira/Ev', icon: Home, color: 'text-purple-500' },
  entertainment: { label: 'Eğlence', icon: Film, color: 'text-pink-500' },
  shopping: { label: 'Alışveriş', icon: ShoppingBag, color: 'text-emerald-500' },
  health: { label: 'Sağlık', icon: Heart, color: 'text-red-500' },
  education: { label: 'Eğitim', icon: GraduationCap, color: 'text-indigo-500' },
  other_expense: { label: 'Diğer', icon: Wallet, color: 'text-gray-500' },
  salary: { label: 'Maaş', icon: Briefcase, color: 'text-green-600' },
  freelance: { label: 'Ek Gelir', icon: TrendingUp, color: 'text-cyan-600' },
  investment: { label: 'Yatırım', icon: DollarSign, color: 'text-blue-600' },
  gift: { label: 'Hediye', icon: Gift, color: 'text-pink-600' },
  other_income: { label: 'Diğer', icon: Wallet, color: 'text-gray-600' },
};

export default function TransactionsPage() {
  const { transactions, removeTransaction, getMonthlyIncome, getMonthlyExpense } = useFinanceStore();
  const profile = useProfileStore((s) => s.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.type === filter);

  const handleDelete = (id: string) => {
    if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      removeTransaction(id);
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İşlem Geçmişi</h1>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} size="md">
              <Plus className="w-4 h-4" />
              <span>İşlem Ekle</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-green-100 dark:border-green-900/30">
            <p className="text-sm font-medium text-gray-500 mb-1">Bu Ay Gelir</p>
            <p className="text-2xl font-black text-green-600">+{formatCurrency(getMonthlyIncome(), profile.currency)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-red-100 dark:border-red-900/30">
            <p className="text-sm font-medium text-gray-500 mb-1">Bu Ay Gider</p>
            <p className="text-2xl font-black text-red-600">-{formatCurrency(getMonthlyExpense(), profile.currency)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Hepsi' : f === 'income' ? 'Gelirler' : 'Giderler'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((t) => {
              const config = categoryConfig[t.category] || categoryConfig.other_expense;
              const Icon = config.icon;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 ${config.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{t.description || config.label}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-black text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                    </p>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
              <p className="text-gray-400">Henüz bir işlem bulunmuyor.</p>
            </div>
          )}
        </div>
      </main>

      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}