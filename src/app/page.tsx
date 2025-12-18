'use client';

import { useEffect, useState } from 'react';
import Onboarding from '@/components/Onboarding';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check local storage immediately
    const hasCompleted = localStorage.getItem('financialai_intro_seen_v1');

    if (hasCompleted === 'true') {
      // ONLY redirect if we are SURE it's completed
      router.push('/dashboard');
    } else {
      // Otherwise, we definitely stay here and show onboarding
      setShowOnboarding(true);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <motion_div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-5xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 text-transparent bg-clip-text tracking-tighter"
          >
            FinancialAI
          </motion_div>
          <div className="flex items-center justify-center gap-3 text-purple-600 font-medium">
            <Loader2 className="w-6 h-6 animate-spin stroke-[3px]" />
            <span className="tracking-widest uppercase text-xs">Yükleniyor</span>
          </div>
        </div>
      </div>
    );
  }

  // If we decided to show onboarding, render it and STOP. Do not redirect.
  if (showOnboarding) {
    return <Onboarding />;
  }

  // Fallback for redirecting state
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
       <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );
}

// Helper to keep code clean since I used motion_div above as a placeholder for reasoning
import { motion } from 'framer-motion';
const motion_div = motion.div;