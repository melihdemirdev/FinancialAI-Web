'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Installment } from '@/types';
import { formatCurrency } from '@/domain/formatters/currency';
import { Calendar, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddInstallmentModal } from '@/components/modals/AddInstallmentModal';
import { EditInstallmentModal } from '@/components/modals/EditInstallmentModal';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function InstallmentsPage() {
  const { installments, removeInstallment, getTotalInstallments } = useFinanceStore();
  const profile = useProfileStore((s) => s.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);

  const totalInstallments = getTotalInstallments();

  const handleDelete = (id: string) => {
    if (confirm('Bu taksiti silmek istediğinizden emin misiniz?')) {
      removeInstallment(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Geri"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Taksitlerim</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Aylık taksit ödemelerinizi yönetin</p>
              </div>
            </motion.div>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Button onClick={() => setIsAddModalOpen(true)} size="md">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Taksit Ekle</span>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.div 
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warning via-orange-500 to-orange-600 p-8 text-white shadow-2xl"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold opacity-90">Toplam Aylık Taksit</span>
              </div>
              <div className="text-5xl font-bold mb-2">{formatCurrency(totalInstallments, profile.currency)}</div>
              <p className="text-white/80">{installments.length} adet taksit</p>
            </div>
          </motion.div>
        </motion.div>

        {installments.length === 0 ? (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4">
              <Calendar className="w-10 h-10 text-warning" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Henüz taksit eklenmemiş</h3>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Taksit Ekle</span>
              </div>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {installments.map((installment) => (
              <motion.div 
                key={installment.id}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-warning/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{installment.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aylık Ödeme</div>
                  <div className="text-3xl font-bold text-warning">{formatCurrency(installment.installmentAmount, installment.currency)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {installment.remainingMonths} ay kaldı
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bitiş: {new Date(installment.endDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                {installment.details && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{installment.details}</p>
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditingInstallment(installment)} className="flex-1">
                    <Edit2 className="w-4 h-4" />
                    <span>Düzenle</span>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(installment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.main>

      <AddInstallmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingInstallment && (
        <EditInstallmentModal isOpen={!!editingInstallment} onClose={() => setEditingInstallment(null)} installment={editingInstallment} />
      )}
    </div>
  );
}