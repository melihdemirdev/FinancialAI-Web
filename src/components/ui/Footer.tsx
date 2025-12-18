'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 text-transparent bg-clip-text inline-block pr-2">
                FinancialAI
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
              Yapay zeka destekli kişisel finans asistanınız. Varlıklarınızı yönetin, borçlarınızı takip edin ve finansal geleceğinizi planlayın.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Uygulama</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/assets" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Varlıklar</Link></li>
              <li><Link href="/liabilities" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Borçlar</Link></li>
              <li><Link href="/calendar" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Takvim</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">İletişim</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-purple-600 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-purple-600 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:info@financialai.com" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-purple-600 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} FinancialAI. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Financial Freedom
          </p>
        </div>
      </div>
    </footer>
  );
}
