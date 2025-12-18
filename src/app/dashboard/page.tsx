'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore } from '@/store/useThemeStore';
import { calculateCategoryScores, getScoreCategory } from '@/domain/calculations/healthScore';
import { formatCurrency, formatCurrencySmart } from '@/domain/formatters/currency';
import { getRecommendations } from '@/domain/recommendations';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialCharts from '@/components/charts/FinancialCharts';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  PieChart,
  Sun,
  Moon,
  Sparkles,
  DollarSign,
  CreditCard,
  Calendar,
  ArrowRight,
  Settings,
  MessageSquare,
  Shield,
  AlertTriangle,
  Target,
  Zap,
  BookOpen,
  PiggyBank,
  Smile,
  Briefcase,
  Coffee,
  Home,
  Percent,
  BarChart3,
  Activity,
  Loader2,
  Trophy,
  CalendarDays,
  ArrowLeftRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { CFOReportModal } from '@/components/modals/CFOReportModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { AddSubscriptionModal } from '@/components/modals/AddSubscriptionModal';
import { Button } from '@/components/ui/Button';
import type { CFOReportData } from '@/types';

// Animation Variants
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

function AnimatedCounter({ value, className, isDecimal = false }: { value: number; className?: string; isDecimal?: boolean }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {isDecimal ? value.toFixed(2) : Math.round(value)}
    </motion.span>
  );
}

export default function DashboardPage() {
  const [isCFOReportOpen, setIsCFOReportOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const profile = useProfileStore((s) => s.profile);
  
  const {
    assets,
    liabilities,
    receivables,
    installments,
    goals,
    subscriptions,
    getTotalAssets,
    getTotalLiabilities,
    getNetWorth,
    getSafeToSpend,
    getTotalReceivables,
    getTotalInstallments,
    getLiquidAssets,
    getAssetsByType,
    getLiabilitiesByType,
    getMonthlyIncome,
    getMonthlyExpense,
  } = useFinanceStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  const netWorth = getNetWorth();
  const monthlyIncome = (profile.salary || 0) + (profile.additionalIncome || 0);
  const safeToSpend = getSafeToSpend(monthlyIncome);
  const totalReceivables = getTotalReceivables();
  const totalInstallments = getTotalInstallments();
  const liquidAssets = getLiquidAssets();

  // Oran Hesaplamaları
  const assetDebtRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : totalAssets > 0 ? 10 : 0;
  const borrowingRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : totalLiabilities > 0 ? 100 : 0;
  const liquidityRatio = totalLiabilities > 0 ? (liquidAssets / totalLiabilities) * 100 : liquidAssets > 0 ? 100 : 0;

  const hasFinancialData = useMemo(() => {
    return totalAssets > 0 || totalLiabilities > 0 || monthlyIncome > 0 || totalReceivables > 0 || totalInstallments > 0;
  }, [totalAssets, totalLiabilities, monthlyIncome, totalReceivables, totalInstallments]);

  const hasChartData = totalAssets > 0 || totalLiabilities > 0;

  const healthScores = useMemo(() => {
    return calculateCategoryScores({
      netWorth,
      totalAssets,
      totalLiabilities,
      liquidAssets,
      monthlyInstallments: totalInstallments,
      monthlyIncome,
      findeksScore: profile.findeksScore,
    });
  }, [netWorth, totalAssets, totalLiabilities, liquidAssets, totalInstallments, monthlyIncome, profile.findeksScore]);

  const scoreCategory = getScoreCategory(healthScores.overall);

  const recommendations = useMemo(() => {
    return getRecommendations({
      netWorth,
      totalAssets,
      totalLiabilities,
      liquidAssets,
      monthlyIncome,
      monthlyInstallments: totalInstallments,
      healthScore: healthScores.overall,
    });
  }, [netWorth, totalAssets, totalLiabilities, liquidAssets, monthlyIncome, totalInstallments, healthScores.overall]);

  useEffect(() => {
    if (recommendations.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRecIndex((prev) => (prev + 1) % recommendations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [recommendations.length]);

  const currentRec = recommendations[currentRecIndex];

  const getRecIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield': return <Shield className="w-6 h-6 text-white" />;
      case 'trending-up': return <TrendingUp className="w-6 h-6 text-white" />;
      case 'alert-triangle': return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'target': return <Target className="w-6 h-6 text-white" />;
      case 'book-open': return <BookOpen className="w-6 h-6 text-white" />;
      case 'piggy-bank': return <PiggyBank className="w-6 h-6 text-white" />;
      case 'credit-card': return <CreditCard className="w-6 h-6 text-white" />;
      case 'smile': return <Smile className="w-6 h-6 text-white" />;
      case 'briefcase': return <Briefcase className="w-6 h-6 text-white" />;
      case 'coffee': return <Coffee className="w-6 h-6 text-white" />;
      case 'home': return <Home className="w-6 h-6 text-white" />;
      default: return <Zap className="w-6 h-6 text-white" />;
    }
  };

  const getRecGradient = (type: string) => {
    switch (type) {
      case 'warning': return 'from-orange-400 to-red-500';
      case 'success': return 'from-emerald-600 to-green-700';
      case 'action': return 'from-blue-400 to-indigo-600';
      default: return 'from-purple-400 to-pink-600';
    }
  };

  const cfoReportData: CFOReportData = useMemo(() => ({
    netWorth,
    totalAssets,
    totalLiabilities,
    liquidAssets,
    monthlyIncome,
    monthlyInstallments: totalInstallments,
    healthScore: Math.round(healthScores.overall),
    findeksScore: profile.findeksScore,
    currency: profile.currency,
    assetsByType: getAssetsByType(),
    liabilitiesByType: getLiabilitiesByType(),
  }), [
    netWorth,
    totalAssets,
    totalLiabilities,
    liquidAssets,
    monthlyIncome,
    totalInstallments,
    healthScores.overall,
    profile.findeksScore,
    profile.currency,
    getAssetsByType,
    getLiabilitiesByType
  ]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-purple-light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-light to-cyan text-transparent bg-clip-text inline-block pr-2">FinancialAI</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Akıllı Finansal Yönetim</p>
            </motion.div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddTransactionOpen(true)} size="sm" variant="primary" className="hidden sm:flex rounded-full px-6">
                <Plus className="w-4 h-4" /> <span>İşlem Ekle</span>
              </Button>
              <Link href="/settings" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-light" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <motion.main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={containerVariants} initial="hidden" animate="visible">
        
        {/* 1. Hero */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-light via-purple-primary to-purple-dark p-8 text-white shadow-2xl" whileHover={{ scale: 1.02 }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Wallet className="w-6 h-6" /></div>
                  <span className="text-lg font-semibold opacity-90">Harcayabileceğiniz</span>
                </div>
                <Button onClick={() => setIsCFOReportOpen(true)} variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full">
                  <Sparkles className="w-4 h-4 mr-2" /> AI CFO Raporu
                </Button>
              </div>
              <div className="text-5xl font-bold mb-2">{formatCurrencySmart(safeToSpend, profile.currency)}</div>
              <p className="text-white/80">Güvenli harcama limitiniz</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Monthly Flow Summary */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" variants={itemVariants}>
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-green-500 transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Bu Ay Gelir</p>
                <p className="text-3xl font-black text-green-600">+{formatCurrency(getMonthlyIncome(), profile.currency)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600"><TrendingUp className="w-8 h-8" /></div>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-red-500 transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Bu Ay Gider</p>
                <p className="text-3xl font-black text-red-600">-{formatCurrency(getMonthlyExpense(), profile.currency)}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600"><TrendingDown className="w-8 h-8" /></div>
            </div>
          </motion.div>
        </motion.div>

        {/* 2. Recommendations */}
        <motion.div className="mb-8" variants={itemVariants}>
          <AnimatePresence mode="wait">
            <motion.div key={currentRecIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r ${getRecGradient(currentRec.type)} text-white shadow-lg cursor-pointer`} onClick={() => setCurrentRecIndex((prev) => (prev + 1) % recommendations.length)} whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">{getRecIcon(currentRec.icon)}</div>
                <div><h3 className="font-bold text-lg mb-1">{currentRec.title}</h3><p className="text-white/90 text-sm">{currentRec.description}</p></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 3. Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Varlıklar', val: totalAssets, icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Borçlar', val: totalLiabilities, icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
            { label: 'Net Değer', val: netWorth, icon: PieChart, color: netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center gap-3 mb-4"><div className={`p-3 ${item.bg} rounded-xl ${item.color}`}><item.icon className="w-5 h-5" /></div><span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span></div>
              <div className={`text-2xl font-bold ${item.color}`}>{formatCurrencySmart(item.val, profile.currency)}</div>
            </motion.div>
          ))}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-4"><div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><Activity className="w-5 h-5" /></div><span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sağlık Skoru</span></div>
            <div className="text-4xl font-bold" style={{ color: hasFinancialData ? scoreCategory.color : '#9CA3AF' }}>{hasFinancialData ? <AnimatedCounter value={Math.round(healthScores.overall)} /> : '?'}</div>
            <div className="mt-2"><span className="inline-block px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: hasFinancialData ? `${scoreCategory.color}20` : 'rgba(156, 163, 175, 0.2)', color: hasFinancialData ? scoreCategory.color : '#9CA3AF' }}>{hasFinancialData ? scoreCategory.label : 'Veri Yok'}</span></div>
          </motion.div>
        </div>

        {/* 4. Detailed Analysis (Progress Bars) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Detaylı Analiz</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['liquidity', 'debtManagement', 'assetQuality', 'installmentManagement'] as const).map((key, i) => {
              const labels = { liquidity: 'Likidite', debtManagement: 'Borç Yönetimi', assetQuality: 'Varlık Kalitesi', installmentManagement: 'Taksit Yönetimi' };
              const colors = { liquidity: 'from-cyan to-cyan/80', debtManagement: 'from-success to-success/80', assetQuality: 'from-purple-light to-purple-primary', installmentManagement: 'from-warning to-warning/80' };
              const score = healthScores[key];
              return (
                <motion.div key={key} whileHover={{ y: -5 }} className="p-4 rounded-xl border border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{labels[key]}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{score < 0 ? '' : `${score}/100`}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                    {score >= 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full bg-gradient-to-r ${colors[key]} rounded-full`} />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 5. FINANSAL ANALIZ (MISSING SECTION RESTORED) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><BarChart3 className="w-5 h-5" /></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Varlık / Borç Oranı</span>
              </div>
              <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs font-bold text-purple-light dark:text-purple-400">{totalLiabilities > 0 ? "Oran" : "İdeal"}</div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-4xl font-black text-purple-light dark:text-purple-400"><AnimatedCounter value={assetDebtRatio} isDecimal={true} /></div>
              <span className="text-gray-400 text-sm font-bold">kat</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(assetDebtRatio * 20, 100)}%` }} transition={{ duration: 1.5 }} className="h-full bg-purple-light dark:bg-purple-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan/10 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400"><Percent className="w-5 h-5" /></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Borçlanma Oranı</span>
              </div>
              <div className="px-3 py-1 bg-cyan/5 dark:bg-cyan-900/20 rounded-full text-xs font-bold text-cyan">Yüzde</div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-4xl font-black text-cyan dark:text-cyan-400">%<AnimatedCounter value={borrowingRatio} /></div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(borrowingRatio, 100)}%` }} transition={{ duration: 1.5 }} className="h-full bg-cyan" />
            </div>
          </motion.div>
        </div>

        {/* 6. Chart */}
        {hasChartData && (
          <motion.div variants={itemVariants}>
            <FinancialCharts />
          </motion.div>
        )}

        {/* 7. Financial Metrikler (Liquidity Bar Restored) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-colors">
          <div className="flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-purple-light dark:text-purple-400" /><h3 className="text-lg font-bold text-gray-900 dark:text-white">Finansal Metrikler</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400"><DollarSign className="w-5 h-5" /></div>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Alacaklar</span>
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalReceivables, profile.currency)}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400"><Calendar className="w-5 h-5" /></div>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Taksitler</span>
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalInstallments, profile.currency)}</div>
            </motion.div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-cyan dark:text-cyan-400" /><span className="text-sm font-medium text-gray-600 dark:text-gray-400">Likidite Oranı</span></div>
                {liquidityRatio > 0 && <span className={`text-sm font-bold ${liquidityRatio < 20 ? 'text-red-500' : 'text-cyan'}`}>%{Math.round(liquidityRatio)}</span>}
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                {liquidityRatio > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(liquidityRatio, 100)}%` }} transition={{ duration: 1.5, delay: 0.2 }} className={`h-full ${liquidityRatio < 20 ? 'bg-red-500' : 'bg-cyan'}`} />}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 8. Hedeflerim */}
        {goals.length > 0 && (
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Hedeflerim</h3><Link href="/goals" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">Tümünü Gör <ArrowRight className="w-4 h-4" /></Link></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.slice(0, 3).map((goal) => {
                const p = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <motion.div key={goal.id} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div><h4 className="font-bold text-gray-900 dark:text-white">{goal.name}</h4><p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(goal.targetAmount, goal.currency)} hedef</p></div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${p >= 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>%{p.toFixed(0)}</div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full ${p >= 100 ? 'bg-green-500' : 'bg-purple-600'}`} /></div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 9. Hızlı İşlemler */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {[
              { h: '/assets', icon: TrendingUp, label: 'Varlıklar', c: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
              { h: '/liabilities', icon: CreditCard, label: 'Borçlar', c: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
              { h: '/receivables', icon: DollarSign, label: 'Alacaklar', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { h: '/installments', icon: Calendar, label: 'Taksitler', c: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
              { h: '/transactions', icon: ArrowLeftRight, label: 'İşlemler', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { h: '/calendar', icon: CalendarDays, label: 'Takvim', c: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
              { h: '/goals', icon: Trophy, label: 'Hedefler', c: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
              { h: '/subscriptions', icon: RefreshCw, label: 'Abonelik', c: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
            ].map((item) => (
              <Link href={item.h} key={item.h}>
                <motion.div whileHover={{ y: -5, scale: 1.05 }} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 cursor-pointer transition-all hover:shadow-lg h-full">
                  <div className={`p-2 ${item.bg} rounded-lg ${item.c}`}><item.icon className="w-5 h-5" /></div>
                  <span className="font-bold text-xs text-gray-900 dark:text-white text-center">{item.label}</span>
                </motion.div>
              </Link>
            ))}
            <Link href="/chat" className="col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-8">
              <motion.div whileHover={{ y: -5, scale: 1.01 }} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400"><MessageSquare className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-gray-900 dark:text-white">AI CFO Chatbot</h4><p className="text-xs text-gray-500 dark:text-gray-400">Finansal durumun hakkında sorular sor</p></div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </motion.main>

      <CFOReportModal isOpen={isCFOReportOpen} onClose={() => setIsCFOReportOpen(false)} data={cfoReportData} />
      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />
      <AddSubscriptionModal isOpen={isAddSubscriptionOpen} onClose={() => setIsAddSubscriptionOpen(false)} />
    </div>
  );
}