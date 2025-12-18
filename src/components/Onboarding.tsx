'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import {
  Wallet,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  PieChart,
  Calendar,
  MessageSquare,
  Activity,
  Lock,
  Zap
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'FinancialAI\'ya Hoş Geldiniz',
    description: 'Kişisel finans yönetiminizi yapay zeka gücüyle bir üst seviyeye taşıyın. Varlıklarınızı, borçlarınızı ve tüm nakit akışınızı tek bir akıllı platformda birleştirin.',
    icon: <Wallet size={80} color="#9333ea" />,
    color: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600'
  },
  {
    id: 2,
    title: 'Finansal Sağlık Skoru',
    description: 'Sadece rakamları değil, finansal durumunuzun kalitesini de görün. Likidite, borç yükü ve varlık dağılımınıza göre size özel sağlık puanı oluşturuyoruz.',
    icon: <Activity size={80} color="#ef4444" />,
    color: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-500'
  },
  {
    id: 3,
    title: 'Güvenli Harcama Limiti',
    description: 'Ay sonunu düşünmenize gerek yok. Gelir, taksit ve zorunlu giderlerinizi hesaplayarak bugün ne kadar harcayabileceğinizi size her gün söylüyoruz.',
    icon: <Zap size={80} color="#eab308" />,
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-500'
  },
  {
    id: 4,
    title: 'Yapay Zeka CFO Analizi',
    description: 'Gemini AI destekli CFO\'nuz tüm verilerinizi derinlemesine analiz eder. Gizli riskleri tespit eder ve birikimlerinizi artırmak için size profesyonel stratejiler sunar.',
    icon: <Sparkles size={80} color="#06b6d4" fill="#06b6d433" />,
    color: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-500'
  },
  {
    id: 5,
    title: 'AI CFO Chatbot',
    description: '7/24 yanınızda olan bir finans danışmanı hayal edin. "Bu ay bütçem ne durumda?" veya "Araba almak için ne kadar biriktirmeliyim?" gibi sorularınıza anında yanıt alın.',
    icon: <MessageSquare size={80} color="#3b82f6" />,
    color: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500'
  },
  {
    id: 6,
    title: '%100 Güvenli ve Yerel',
    description: 'Verileriniz bizim sunucularımızda değil, sadece sizin cihazınızda (IndexedDB) saklanır. Gizliliğiniz ve güvenliğiniz en önceliğimizdir.',
    icon: <Lock size={80} color="#10b981" />,
    color: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-500'
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('financialai_intro_seen_v1', 'true');
    window.location.href = '/dashboard'; 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700">
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [-10, 10, -10],
            y: [-10, 10, -10]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [10, -10, 10],
            y: [10, -10, 10]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-200 dark:bg-cyan-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-60" 
        />

        <div className="relative z-10 p-10 flex flex-col min-h-[620px]">
          {/* Progress Indicators */}
          <div className="flex gap-2 mb-12">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  flex: index === currentStep ? 2.5 : 1,
                  backgroundColor: index <= currentStep ? '#9333EA' : '#E5E7EB'
                }}
                className="h-2 rounded-full transition-all duration-500"
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center text-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex flex-col items-center w-full"
              >
                <motion.div 
                  initial={{ rotate: -10, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className={`p-8 rounded-[2.5rem] mb-10 ${steps[currentStep].color} shadow-inner relative group`}
                >
                  {steps[currentStep].icon}
                  {/* Floating particles effect for AI/Sparkles */}
                  {currentStep === 3 && (
                    <motion.div 
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-cyan-400/10 rounded-[2.5rem] blur-xl"
                    />
                  )}
                </motion.div>
                
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed px-2">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-50 dark:border-gray-700/50">
            <button
              onClick={completeOnboarding}
              className="text-base font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
            >
              Atla
            </button>

            <Button onClick={handleNext} className="rounded-2xl px-8 py-6 text-lg shadow-xl shadow-purple-500/20 active:scale-95">
              {currentStep === steps.length - 1 ? (
                <div className="flex items-center gap-3">
                  <span className="font-black tracking-wide">BAŞLAYALIM</span>
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-bold">İLERLE</span>
                  <ArrowRight className="w-6 h-6 stroke-[3px]" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
