'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { generateCFOConversation } from '@/services/ai';
import { calculateCategoryScores } from '@/domain/calculations/healthScore';
import type { FinancialData } from '@/types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Start of Zustand State Selection ---
  const {
    assets,
    liabilities,
    receivables,
    installments,
    getNetWorth,
    getTotalAssets,
    getTotalLiabilities,
    getLiquidAssets,
    getTotalInstallments,
    getSafeToSpend,
  } = useFinanceStore();

  const profile = useProfileStore((s) => s.profile);
  // --- End of Zustand State Selection ---

  const financialData: FinancialData = useMemo(() => {
    const monthlyIncome = (profile.salary || 0) + (profile.additionalIncome || 0);
    const healthScores = calculateCategoryScores({
      netWorth: getNetWorth(),
      totalAssets: getTotalAssets(),
      totalLiabilities: getTotalLiabilities(),
      liquidAssets: getLiquidAssets(),
      monthlyInstallments: getTotalInstallments(),
      monthlyIncome: monthlyIncome,
      findeksScore: profile.findeksScore,
    });

    return {
      profile: profile,
      netWorth: getNetWorth(),
      totalAssets: getTotalAssets(),
      totalLiabilities: getTotalLiabilities(),
      safeToSpend: getSafeToSpend(monthlyIncome),
      assets: assets,
      liabilities: liabilities,
      receivables: receivables,
      installments: installments,
      healthScore: healthScores,
      findeksScore: profile.findeksScore,
    };
  }, [
    assets,
    liabilities,
    receivables,
    installments,
    profile,
    getNetWorth,
    getTotalAssets,
    getTotalLiabilities,
    getLiquidAssets,
    getTotalInstallments,
    getSafeToSpend,
  ]);

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: 'Merhaba! Ben FinancialAI CFO\'nuz. Mevcut finansal durumunuzla ilgili her türlü soruyu sorabilirsiniz. Örneğin: "Varlıklarımın ne kadarı likit?" veya "Borçlarımı azaltmak için ne yapabilirim?"',
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const history = newMessages.slice(0, -1).map((msg) => ({
      role: msg.sender === 'ai' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.text }],
    }));

    try {
      const aiResponseText = await generateCFOConversation(input, financialData, history);
      const aiResponse: Message = { sender: 'ai', text: aiResponseText };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'ai',
        text:
          error instanceof Error && error.message.includes('API anahtarı')
            ? 'Görünüşe göre bir API anahtarınız yok veya anahtarınız geçersiz. Lütfen Ayarlar sayfasından API anahtarınızı kontrol edin.'
            : 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI CFO Chatbot</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Finansal verilerinizle ilgili sorular sorun
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="space-y-6 pb-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-purple-light flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Bot className="w-6 h-6" />
                  </div>
                )}
                <div
                  className={`max-w-lg p-4 rounded-2xl shadow-md ${ 
                    msg.sender === 'user'
                      ? 'bg-purple-light text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                  <ReactMarkdown className="text-sm leading-relaxed prose dark:prose-invert max-w-none">{msg.text}</ReactMarkdown>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-white flex-shrink-0 shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-purple-light flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div className="max-w-lg p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="max-w-4xl w-full mx-auto p-4 sm:px-6 lg:px-8 sticky bottom-0 bg-transparent">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-full border border-gray-200 dark:border-gray-700 shadow-lg"></div>
          <div className="relative flex items-center gap-3 p-2">
            <Input
              type="text"
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-transparent border-none focus:ring-0 pl-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}