'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateCFOReport, hasApiKey, saveApiKey } from '@/services/ai';
import type { CFOReportData, FinancialData } from '@/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useProfileStore } from '@/store/useProfileStore';
import { calculateCategoryScores } from '@/domain/calculations/healthScore';
import { pdf } from '@react-pdf/renderer';
import FinancialReportPDF from '@/components/pdf/FinancialReportPDF';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Shield,
  Target,
  Zap,
  Loader2,
  Key,
  FileText,
  Download,
} from 'lucide-react';

interface CFOReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CFOReportData;
}

interface ParsedReport {
  summary: string;
  risks: string[];
  actions: string[];
}

function parseAIReport(text: string): ParsedReport {
  const lines = text.split('\n').filter((line) => line.trim());

  let summary = '';
  const risks: string[] = [];
  const actions: string[] = [];
  let currentSection: 'summary' | 'risks' | 'actions' | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.includes('Özet:') || trimmed.includes('**Özet:**')) {
      currentSection = 'summary';
      const content = trimmed.replace(/\*\*Özet:\*\*|Özet:/i, '').trim();
      if (content) summary = content;
      continue;
    }

    if (trimmed.includes('Riskler:') || trimmed.includes('**Riskler:**')) {
      currentSection = 'risks';
      continue;
    }

    if (trimmed.includes('Aksiyonlar:') || trimmed.includes('**Aksiyonlar:**')) {
      currentSection = 'actions';
      continue;
    }

    if (currentSection === 'summary' && trimmed) {
      summary += (summary ? ' ' : '') + trimmed;
    } else if (currentSection === 'risks' && trimmed.startsWith('-')) {
      risks.push(trimmed.replace(/^-\s*/, ''));
    } else if (currentSection === 'actions' && trimmed.startsWith('-')) {
      actions.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return { summary, risks, actions };
}

export function CFOReportModal({ isOpen, onClose, data }: CFOReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!hasApiKey());
  const [apiKey, setApiKey] = useState('');

  // Store data for PDF
  const { profile } = useProfileStore();
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

  // Calculate category scores
  const liquidityScore =
    data.totalLiabilities > 0
      ? Math.min(100, (data.liquidAssets / data.totalLiabilities) * 100)
      : data.liquidAssets > 0
      ? 100
      : -1; // Unknown

  const debtScore =
    data.totalAssets > 0
      ? Math.max(0, 100 - (data.totalLiabilities / data.totalAssets) * 100)
      : data.totalLiabilities > 0
      ? 0
      : -1; // Unknown

  const assetScore =
    data.totalAssets === 0 && data.totalLiabilities === 0
      ? -1 // Unknown
      : data.netWorth > 0
      ? Math.min(100, (data.netWorth / 100000) * 100)
      : 0;

  const installmentScore =
    data.monthlyIncome > 0
      ? Math.max(0, 100 - (data.monthlyInstallments / data.monthlyIncome) * 100)
      : data.monthlyInstallments > 0
      ? 0
      : -1; // Unknown

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setError('Lütfen API anahtarınızı girin');
      return;
    }
    saveApiKey(apiKey.trim());
    setShowApiKeyInput(false);
    setApiKey('');
    handleGenerateReport();
  };

  const handleGenerateReport = async () => {
    if (!hasApiKey()) {
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reportText = await generateCFOReport(data);
      const parsed = parseAIReport(reportText);
      setReport(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setPdfLoading(true);
    try {
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

      const fullFinancialData: FinancialData = {
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

      const blob = await pdf(
        <FinancialReportPDF data={fullFinancialData} aiReport={report} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI-CFO-Raporu-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF oluşturulurken hata oluştu:', error);
      setError('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleClose = () => {
    setReport(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI CFO Finansal Raporu" size="lg">
      {showApiKeyInput ? (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-purple-light mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gemini API Anahtarı Gerekli
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  AI CFO raporu oluşturmak için Google Gemini API anahtarınızı girin. Anahtarınız
                  sadece tarayıcınızda saklanır.
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-light hover:text-purple-dark underline"
                >
                  API anahtarı nasıl alınır? →
                </a>
              </div>
            </div>
          </div>

          <Input
            label="Gemini API Anahtarı"
            type="password"
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              İptal
            </Button>
            <Button onClick={handleSaveApiKey} className="flex-1">
              <div className="flex items-center justify-center gap-2">
                <Key className="w-4 h-4" /> {/* Using Key icon as it's for API Key */}
                <span>Kaydet ve Rapor Oluştur</span>
              </div>
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-purple-light animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">AI analiz yapıyor...</p>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Kapat
            </Button>
            <Button onClick={handleGenerateReport} className="flex-1">
              Tekrar Dene
            </Button>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Health Score */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple via-purple-light to-purple-dark p-6 text-white">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-center">
              <div className="text-5xl font-bold mb-2">{data.healthScore}</div>
              <p className="text-white/80">Finansal Sağlık Skoru</p>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-cyan/10 dark:bg-cyan/20 rounded-xl p-4 border border-cyan dark:border-cyan/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan" />
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Analiz Özeti</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.summary}</p>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-cyan/10 rounded-lg">
                  <Activity className="w-4 h-4 text-cyan" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Likidite
                </span>
              </div>
              <div className="text-2xl font-bold text-cyan">
                {liquidityScore < 0 ? 'N/A' : Math.round(liquidityScore)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Nakit akışı ve ödeme gücü
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Borç Yönetimi
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  debtScore < 0 ? 'text-gray-500' : debtScore > 60 ? 'text-success' : 'text-error'
                }`}
              >
                {debtScore < 0 ? 'N/A' : Math.round(debtScore)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Borç yönetimi kalitesi
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Varlık Kalitesi
                </span>
              </div>
              <div className={`text-2xl font-bold ${assetScore < 0 ? 'text-gray-500' : 'text-success'}`}>
                {assetScore < 0 ? 'N/A' : Math.round(assetScore)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Net varlık değeri</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Target className="w-4 h-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taksit Yönetimi
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  installmentScore < 0
                    ? 'text-gray-500'
                    : installmentScore > 70
                    ? 'text-success'
                    : 'text-warning'
                }`}
              >
                {installmentScore < 0 ? 'N/A' : Math.round(installmentScore)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Aylık taksit oranı</div>
            </div>
          </div>

          {/* Risks */}
          {report.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-error" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Tespit Edilen Riskler
                </h3>
              </div>
              <div className="space-y-2">
                {report.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {report.actions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Önerilen Aksiyonlar</h3>
              </div>
              <div className="space-y-2">
                {report.actions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-success mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Kapat
            </Button>
            <Button onClick={handleDownloadPdf} className="flex-1" disabled={pdfLoading}>
              <div className="flex items-center justify-center gap-2">
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{pdfLoading ? 'İndiriliyor...' : 'PDF İndir'}</span>
              </div>
            </Button>
            <Button onClick={handleGenerateReport} className="flex-1">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Yeni Rapor</span>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              AI CFO'nuz finansal durumunuzu analiz edip öneriler sunacak. Rapor oluşturmak için
              butona tıklayın.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              İptal
            </Button>
            <Button onClick={handleGenerateReport} className="flex-1">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Rapor Oluştur</span>
              </div>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
