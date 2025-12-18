'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { hasApiKey, getApiKey, saveApiKey, clearApiKey } from '@/services/ai';
import { calculateCategoryScores } from '@/domain/calculations/healthScore';
import { pdf } from '@react-pdf/renderer';
import FinancialReportPDF from '@/components/pdf/FinancialReportPDF';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Key,
  Download,
  Upload,
  Trash2,
  Save,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ArrowLeft,
  FileText,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import type { Currency, FinancialData } from '@/types';

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

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const clearAllData = useFinanceStore((s) => s.clearAllData);

  // --- Start of Zustand State Selection for PDF data ---
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
  // --- End of Zustand State Selection ---

  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    salary: profile.salary?.toString() || '',
    additionalIncome: profile.additionalIncome?.toString() || '',
    findeksScore: profile.findeksScore?.toString() || '',
    currency: profile.currency,
  });

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        salary: profile.salary?.toString() || '',
        additionalIncome: profile.additionalIncome?.toString() || '',
        findeksScore: profile.findeksScore?.toString() || '',
        currency: profile.currency,
      }));
    }
  }, [profile]);

  const financialData: FinancialData | null = useMemo(() => {
    if (!isClient) return null;
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
    isClient,
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

  const handleSaveProfile = () => {
    updateProfile({
      name: formData.name || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
      additionalIncome: formData.additionalIncome ? parseFloat(formData.additionalIncome) : undefined,
      findeksScore: formData.findeksScore ? parseInt(formData.findeksScore) : undefined,
      currency: formData.currency as Currency,
    });
    setSavedMessage('Profil bilgileri kaydedildi!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setSavedMessage('API anahtarı kaydedildi!');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const handleClearApiKey = () => {
    if (confirm('API anahtarını silmek istediğinizden emin misiniz?')) {
      clearApiKey();
      setSavedMessage('API anahtarı silindi!');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      version: 1,
      exportDate: new Date().toISOString(),
      profile: profile,
      assets: assets,
      liabilities: liabilities,
      receivables: receivables,
      installments: installments,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financialai-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSavedMessage('JSON yedeği dışa aktarıldı!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (confirm('Mevcut tüm veriler silinip yeni veriler yüklenecek. Devam etmek istiyor musunuz?')) {
          if (data.profile) updateProfile(data.profile);
          // Re-instantiate the store to apply imported data
          const useFinanceStoreInstance = useFinanceStore.getState();
          useFinanceStoreInstance.clearAllData();
          if (data.assets) data.assets.forEach((asset: any) => useFinanceStoreInstance.addAsset(asset));
          if (data.liabilities) data.liabilities.forEach((liability: any) => useFinanceStoreInstance.addLiability(liability));
          if (data.receivables) data.receivables.forEach((receivable: any) => useFinanceStoreInstance.addReceivable(receivable));
          if (data.installments) data.installments.forEach((installment: any) => useFinanceStoreInstance.addInstallment(installment));

          setSavedMessage('Veriler başarıyla içe aktarıldı!');
        }
      } catch (error) {
        alert('Geçersiz dosya formatı!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleDownloadPdf = async () => {
    if (!financialData) return;
    setPdfLoading(true);
    try {
      const blob = await pdf(<FinancialReportPDF data={financialData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSavedMessage('PDF Raporu başarıyla oluşturuldu ve indirildi!');
    } catch (error) {
      console.error('PDF oluşturulurken hata oluştu:', error);
      setSavedMessage('PDF raporu oluşturulurken bir hata oluştu.');
    } finally {
      setPdfLoading(false);
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const handleClearAllData = () => {
    if (confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      if (confirm('Emin misiniz? Bu işlem geri alınamaz!')) {
        clearAllData();
        updateProfile({
          name: '',
          email: '',
          phone: '',
          salary: undefined,
          additionalIncome: undefined,
          findeksScore: undefined,
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          salary: '',
          additionalIncome: '',
          findeksScore: '',
          currency: 'TRY',
        });
        setSavedMessage('Tüm veriler silindi!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Uygulama ayarlarınızı yönetin
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <motion.main 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {savedMessage && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
          >
            <p className="text-green-600 dark:text-green-400 text-center font-medium">
              {savedMessage}
            </p>
          </motion.div>
        )}

        {/* Profile Settings */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 transition-shadow hover:shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <User className="w-6 h-6 text-purple-light" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profil Bilgileri</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kişisel bilgilerinizi güncelleyin
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Ad Soyad"
              placeholder="Adınız ve soyadınız"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Telefon"
                type="tel"
                placeholder="+90 555 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Aylık Net Maaş"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />

              <Input
                label="Aylık Ek Gelir"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.additionalIncome}
                onChange={(e) => setFormData({ ...formData, additionalIncome: e.target.value })}
              />
            </div>

            <Input
              label="Findeks Kredi Notu (Opsiyonel)"
              type="number"
              placeholder="1500"
              value={formData.findeksScore}
              onChange={(e) => setFormData({ ...formData, findeksScore: e.target.value })}
            />

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="w-4 h-4" />
              <span>Profil Bilgilerini Kaydet</span>
            </Button>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 transition-shadow hover:shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan/10 rounded-xl">
              <Palette className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Görünüm</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tema ve görünüm ayarları</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-5 h-5 text-purple-light" />
                    <span className="text-gray-900 dark:text-white font-medium">Karanlık Tema</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-900 dark:text-white font-medium">Aydınlık Tema</span>
                  </>
                )}
              </motion.button>
            </div>

            <Select
              label="Para Birimi"
              value={formData.currency}
              onChange={(e) => {
                const newCurrency = e.target.value as Currency;
                setFormData({ ...formData, currency: newCurrency });
                updateProfile({ currency: newCurrency });
              }}
              options={[
                { value: 'TRY', label: '₺ Türk Lirası' },
                { value: 'USD', label: '$ Amerikan Doları' },
                { value: 'EUR', label: '€ Euro' },
                { value: 'GBP', label: '£ İngiliz Sterlini' },
              ]}
            />
          </div>
        </motion.div>

        {/* API Key Management */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 transition-shadow hover:shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Key className="w-6 h-6 text-purple-light" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Anahtarı</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gemini AI API anahtarınızı yönetin
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isClient && hasApiKey() ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      API anahtarı kayıtlı
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <Button variant="danger" size="sm" onClick={handleClearApiKey}>
                      <Trash2 className="w-4 h-4" />
                      <span>Sil</span>
                    </Button>
                  </div>
                </div>
                {showApiKey && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300 break-all border border-gray-100 dark:border-gray-700"
                  >
                    {getApiKey()}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI CFO raporu kullanmak için Gemini API anahtarınızı ekleyin.
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-light hover:text-purple-dark underline ml-1"
                    >
                      Anahtar almak için tıklayın →
                    </a>
                  </p>
                </div>

                <Input
                  label="Gemini API Anahtarı"
                  type="password"
                  placeholder="AIza..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />

                <Button onClick={handleSaveApiKey} className="w-full" disabled={!apiKeyInput.trim()}>
                  <Save className="w-4 h-4" />
                  <span>API Anahtarını Kaydet</span>
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 transition-shadow hover:shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Veri Yönetimi</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verilerinizi yedekleyin veya geri yükleyin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} variant="secondary">
              <Download className="w-4 h-4" />
              <span>JSON Yedekle</span>
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
                <Upload className="w-4 h-4" />
                <span>Verileri İçe Aktar</span>
              </div>
            </label>
            
            <div className="md:col-span-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDownloadPdf}
                disabled={!isClient || !financialData || pdfLoading}
              >
                {pdfLoading ? (
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-r-2 border-white rounded-full"></span>
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{pdfLoading ? 'Rapor Oluşturuluyor...' : 'PDF Raporu İndir'}</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Tehlikeli Bölge</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </p>
          </div>

          <Button onClick={handleClearAllData} variant="danger" className="w-full">
            <Trash2 className="w-4 h-4" />
            <span>Tüm Verileri Sil</span>
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}