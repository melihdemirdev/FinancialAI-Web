'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Goal } from '@/types';
import { formatCurrency } from '@/domain/formatters/currency';
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Home, 
  Car, 
  Plane, 
  Shield, 
  Zap, 
  Gift 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddGoalModal } from '@/components/modals/AddGoalModal';
import { EditGoalModal } from '@/components/modals/EditGoalModal';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

// Icons map for dynamic rendering
const iconMap: Record<string, any> = {
  home: Home,
  car: Car,
  vacation: Plane,
  emergency: Shield,
  other: Gift,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
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

export default function GoalsPage() {
  const { goals, removeGoal } = useFinanceStore();
  const profile = useProfileStore((s) => s.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      removeGoal(id);
    }
  };

  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hedeflerim</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Hayallerinize ulaşmak için plan yapın
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Button onClick={() => setIsAddModalOpen(true)} size="md">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Hedef Ekle</span>
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
        {goals.length === 0 ? (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <Target className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz bir hedefiniz yok
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Araba, tatil veya acil durum fonu... Kendinize bir hedef belirleyin ve birikim yapmaya başlayın.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>İlk Hedefini Ekle</span>
              </div>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const Icon = iconMap[goal.icon || 'other'] || Gift;
              const progress = getProgress(goal.currentAmount, goal.targetAmount);
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-shadow relative overflow-hidden"
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                      TAMAMLANDI!
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                      <Icon className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-purple-600'}`} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hedef</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(goal.targetAmount, goal.currency)}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{goal.name}</h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">%{progress.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-purple-600'}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                      <span>Kalan: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), goal.currency)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingGoal(goal)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Düzenle</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.main>

      {/* Modals */}
      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingGoal && (
        <EditGoalModal
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          goal={editingGoal}
        />
      )}
    </div>
  );
}
