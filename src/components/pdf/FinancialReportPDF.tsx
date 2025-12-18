'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { FinancialData } from '@/types';

// Register fonts for Turkish character support
Font.register({
  family: 'Noto Sans',
  src: '/fonts/NotoSans-Regular.ttf',
  fontWeight: 'normal',
});

Font.register({
  family: 'Noto Sans Bold',
  src: '/fonts/NotoSans-Regular.ttf', // In a real scenario, use Bold ttf
  fontWeight: 'bold',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans',
    padding: 30,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#9333EA',
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  headerDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  
  // Profile Section (Purple Card)
  profileSection: {
    backgroundColor: '#9333EA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 5,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  profileLabel: {
    width: 100,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  profileValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Health Score Card
  healthCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#9333EA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  healthScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 5,
  },
  healthDesc: {
    fontSize: 10,
    color: '#6B7280',
  },

  // Score Grid
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  scoreCard: {
    width: '48%', // Approx 2 columns
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA',
  },
  scoreTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  scoreSub: {
    fontSize: 8,
    color: '#9CA3AF',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 5,
  },
  iconBox: {
    width: 20,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tables
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 9,
    color: '#1F2937',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  
  // Helpers
  textRight: { textAlign: 'right' },
  w40: { width: '40%' },
  w30: { width: '30%' },
  w20: { width: '20%' },
  w10: { width: '10%' },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  }
});

interface FinancialReportPDFProps {
  data: FinancialData;
  aiReport?: {
    summary: string;
    risks: string[];
    actions: string[];
  };
}

const assetTypeLabels: Record<string, string> = {
  liquid: 'Likit / Nakit',
  term: 'Vadeli Hesap',
  gold_currency: 'Altın / Döviz',
  funds: 'Yatırım Fonu',
};

const liabilityTypeLabels: Record<string, string> = {
  credit_card: 'Kredi Kartı',
  personal_debt: 'Şahsi Borç',
};

const FinancialReportPDF: React.FC<FinancialReportPDFProps> = ({ data, aiReport }) => {
  const { profile, netWorth, totalAssets, totalLiabilities, assets, liabilities, installments, healthScore } = data;
  const today = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Dikkat';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>AI CFO</Text>
            <Text style={{ fontSize: 12, color: '#9333EA' }}>Finansal Sağlık Raporu</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerDate}>{today}</Text>
            <Text style={styles.headerDate}>Para Birimi: {profile.currency}</Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.profileTitle}>PROFİL BİLGİLERİ</Text>
          {profile.name && (
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Ad Soyad:</Text>
              <Text style={styles.profileValue}>{profile.name}</Text>
            </View>
          )}
          {profile.email && (
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>E-posta:</Text>
              <Text style={styles.profileValue}>{profile.email}</Text>
            </View>
          )}
          {profile.phone && (
             <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Telefon:</Text>
              <Text style={styles.profileValue}>{profile.phone}</Text>
            </View>
          )}
          {profile.findeksScore && (
             <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Findeks Notu:</Text>
              <Text style={styles.profileValue}>{profile.findeksScore}</Text>
            </View>
          )}
        </View>

        {/* Health Score Main Card */}
        <View style={styles.healthCard}>
          <Text style={styles.healthLabel}>{getScoreStatus(healthScore.overall)} Durum</Text>
          <Text style={styles.healthScore}>{Math.round(healthScore.overall)}</Text>
          <Text style={styles.healthDesc}>Genel Finansal Sağlık Skoru</Text>
        </View>

        {/* AI Report Section */}
        {aiReport && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yapay Zeka CFO Analizi</Text>
            </View>
            
            <View style={{ backgroundColor: '#F0F9FF', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#06B6D4' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0E7490', marginBottom: 4 }}>Analiz Özeti</Text>
              <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{aiReport.summary}</Text>
            </View>

            {aiReport.risks.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>Tespit Edilen Riskler</Text>
                {aiReport.risks.map((risk, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ fontSize: 10, color: '#EF4444', marginRight: 4 }}>•</Text>
                    <Text style={{ fontSize: 10, color: '#374151' }}>{risk}</Text>
                  </View>
                ))}
              </View>
            )}

            {aiReport.actions.length > 0 && (
              <View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>Önerilen Aksiyonlar</Text>
                {aiReport.actions.map((action, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ fontSize: 10, color: '#10B981', marginRight: 4 }}>•</Text>
                    <Text style={{ fontSize: 10, color: '#374151' }}>{action}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Score Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori Skorları</Text>
        </View>
        <View style={styles.scoreGrid}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Likidite</Text>
            <Text style={styles.scoreValue}>{Math.round(healthScore.liquidity)}/100</Text>
            <Text style={styles.scoreSub}>Nakit akışı ve ödeme gücü</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Borç Yönetimi</Text>
            <Text style={styles.scoreValue}>{Math.round(healthScore.debtManagement)}/100</Text>
            <Text style={styles.scoreSub}>Borç yönetimi kalitesi</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Varlık Kalitesi</Text>
            <Text style={styles.scoreValue}>{Math.round(healthScore.assetQuality)}/100</Text>
            <Text style={styles.scoreSub}>Net varlık değeri</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Taksit Yönetimi</Text>
            <Text style={styles.scoreValue}>{Math.round(healthScore.installmentManagement)}/100</Text>
            <Text style={styles.scoreSub}>Aylık taksit oranı</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Finansal Özet</Text>
        </View>
        <View style={[styles.table, { marginBottom: 10 }]}>
           <View style={styles.tableRow}>
             <View style={styles.w40}><Text style={styles.tableCell}>Net Değer</Text></View>
             <View style={[styles.w60, {alignItems: 'flex-end'}]}><Text style={[styles.tableCellBold, {color: netWorth >= 0 ? '#10B981' : '#EF4444'}]}>{netWorth.toLocaleString('tr-TR')} {profile.currency}</Text></View>
           </View>
           <View style={styles.tableRow}>
             <View style={styles.w40}><Text style={styles.tableCell}>Toplam Varlıklar</Text></View>
             <View style={[styles.w60, {alignItems: 'flex-end'}]}><Text style={styles.tableCellBold}>{totalAssets.toLocaleString('tr-TR')} {profile.currency}</Text></View>
           </View>
           <View style={styles.tableRow}>
             <View style={styles.w40}><Text style={styles.tableCell}>Toplam Borçlar</Text></View>
             <View style={[styles.w60, {alignItems: 'flex-end'}]}><Text style={[styles.tableCellBold, {color: '#EF4444'}]}>{totalLiabilities.toLocaleString('tr-TR')} {profile.currency}</Text></View>
           </View>
        </View>

        {/* Assets Table */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Varlıklarınız ({assets.length})</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.w40]}>Varlık Adı</Text>
            <Text style={[styles.tableHeaderCell, styles.w30]}>Türü</Text>
            <Text style={[styles.tableHeaderCell, styles.w30, styles.textRight]}>Değer</Text>
          </View>
          {assets.map((asset, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.w40]}>{asset.name}</Text>
              <Text style={[styles.tableCell, styles.w30, {color: '#6B7280'}]}>
                {assetTypeLabels[asset.type] || asset.type}
              </Text>
              <Text style={[styles.tableCellBold, styles.w30, styles.textRight]}>{asset.value.toLocaleString('tr-TR')} {asset.currency}</Text>
            </View>
          ))}
          {assets.length === 0 && (
             <View style={styles.tableRow}>
               <Text style={[styles.tableCell, {color: '#9CA3AF', fontStyle: 'italic'}]}>Henüz varlık eklenmemiş.</Text>
             </View>
          )}
        </View>

        {/* Liabilities Table */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Borçlarınız ({liabilities.length})</Text>
        </View>
         <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.w40]}>Borç Adı</Text>
            <Text style={[styles.tableHeaderCell, styles.w30]}>Türü</Text>
            <Text style={[styles.tableHeaderCell, styles.w30, styles.textRight]}>Tutar</Text>
          </View>
          {liabilities.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.w40]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.w30, {color: '#6B7280'}]}>
                {liabilityTypeLabels[item.type] || item.type}
              </Text>
              <Text style={[styles.tableCellBold, styles.w30, styles.textRight, {color: '#EF4444'}]}>{item.currentDebt.toLocaleString('tr-TR')} {item.currency}</Text>
            </View>
          ))}
           {liabilities.length === 0 && (
             <View style={styles.tableRow}>
               <Text style={[styles.tableCell, {color: '#9CA3AF', fontStyle: 'italic'}]}>Borcunuz bulunmuyor. Harika!</Text>
             </View>
          )}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
         {/* Installments Table */}
         <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Taksitleriniz ({installments.length})</Text>
        </View>
         <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.w40]}>Taksit Adı</Text>
            <Text style={[styles.tableHeaderCell, styles.w30]}>Kalan Ay</Text>
            <Text style={[styles.tableHeaderCell, styles.w30, styles.textRight]}>Aylık Tutar</Text>
          </View>
          {installments.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.w40]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.w30, {color: '#6B7280'}]}>{item.remainingMonths} ay</Text>
              <Text style={[styles.tableCellBold, styles.w30, styles.textRight]}>{item.installmentAmount.toLocaleString('tr-TR')} {item.currency}</Text>
            </View>
          ))}
           {installments.length === 0 && (
             <View style={styles.tableRow}>
               <Text style={[styles.tableCell, {color: '#9CA3AF', fontStyle: 'italic'}]}>Aktif taksitiniz bulunmuyor.</Text>
             </View>
          )}
        </View>

        <Text style={styles.footer}>
          Bu rapor FinancialAI tarafından {today} tarihinde otomatik olarak oluşturulmuştur.
        </Text>

      </Page>
    </Document>
  );
};

export default FinancialReportPDF;
