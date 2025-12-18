'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { formatCurrency } from '@/domain/formatters/currency';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  DollarSign,
  CreditCard,
  CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { liabilities, receivables, installments } = useFinanceStore();
  const profile = useProfileStore((s) => s.profile);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Takvim oluşturma mantığı
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    
    // Boşluklar (önceki aydan kalan günler)
    const firstDay = (firstDayOfMonth(year, month) + 6) % 7; // Pazartesi başlangıçlı
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Ayın günleri
    const totalDays = daysInMonth(year, month);
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentDate]);

  // Belirli bir gün için işlemleri getir
  const getEventsForDate = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    const dayReceivables = receivables.filter(r => {
      const rDate = new Date(r.dueDate);
      return rDate.getDate() === d && rDate.getMonth() === m && rDate.getFullYear() === y;
    });

    const dayLiabilities = liabilities.filter(l => {
      if (!l.dueDate) return false;
      const lDate = new Date(l.dueDate);
      return lDate.getDate() === d && lDate.getMonth() === m && lDate.getFullYear() === y;
    });

    // Taksitler (Belirlenen ödeme gününe göre)
    const dayInstallments = installments.filter(inst => {
      const paymentDay = inst.paymentDay || 15; // Varsayılan 15
      const endD = new Date(inst.endDate);
      // Eğer bugün ayın o günüyse ve taksit süresi bitmediyse
      return paymentDay === d && date <= endD;
    });

    return {
      receivables: dayReceivables,
      liabilities: dayLiabilities,
      installments: dayInstallments,
      totalCount: dayReceivables.length + dayLiabilities.length + dayInstallments.length
    };
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const events = selectedDate ? getEventsForDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finansal Takvim</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Calendar Section */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                  <span key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} className="h-12 sm:h-16" />;
                  
                  const dayEvents = getEventsForDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(date)}
                      className={`relative h-12 sm:h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20' 
                          : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800'
                      } ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      <span className={`text-sm sm:text-base font-bold ${isSelected ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {date.getDate()}
                      </span>
                      
                      <div className="flex gap-1 mt-1">
                        {dayEvents.receivables.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                        )}
                        {(dayEvents.liabilities.length > 0 || dayEvents.installments.length > 0) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,44,44,0.5)]" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-light" />
                {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} Detayları
              </h3>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDate?.toISOString()}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {events && events.totalCount > 0 ? (
                    <>
                      {events.receivables.map(r => (
                        <div key={r.id} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl">
                          <div className="flex items-center gap-3 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-600 uppercase">Alacak</span>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">{r.debtor}</p>
                          <p className="text-sm text-green-600 font-bold">{formatCurrency(r.amount, r.currency)}</p>
                        </div>
                      ))}
                      
                      {events.liabilities.map(l => (
                        <div key={l.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl">
                          <div className="flex items-center gap-3 mb-1">
                            <CreditCard className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-bold text-red-600 uppercase">Borç</span>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">{l.name}</p>
                          <p className="text-sm text-red-600 font-bold">{formatCurrency(l.currentDebt, l.currency)}</p>
                        </div>
                      ))}

                      {events.installments.map(i => (
                        <div key={i.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-2xl">
                          <div className="flex items-center gap-3 mb-1">
                            <CalendarIcon className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-bold text-orange-600 uppercase">Taksit</span>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">{i.name}</p>
                          <p className="text-sm text-orange-600 font-bold">{formatCurrency(i.installmentAmount, i.currency)}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-gray-400 text-sm">Bu tarihte herhangi bir finansal işlem bulunmuyor.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
