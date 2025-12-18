import { FinancialData } from '@/types';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info' | 'action';
  icon: 'shield' | 'trending-up' | 'alert-triangle' | 'target' | 'zap' | 'book-open' | 'piggy-bank' | 'credit-card' | 'smile' | 'coffee' | 'briefcase' | 'home';
}

export function getRecommendations(data: {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  liquidAssets: number;
  monthlyIncome: number;
  monthlyInstallments: number;
  healthScore: number;
}): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { totalAssets, totalLiabilities, liquidAssets, monthlyIncome, monthlyInstallments, healthScore } = data;

  // --- KİŞİSELLEŞTİRİLMİŞ TAVSİYELER (ÖNCELİKLİ) ---

  // 1. Acil Durum Fonu
  const monthlyExpenses = monthlyIncome * 0.5; 
  const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;

  if (emergencyFundMonths < 3) {
    recommendations.push({
      id: 'emergency-fund',
      title: 'Acil Durum Fonu Oluşturun',
      description: `Likit varlıklarınız hedeflediğimiz 3 aylık gider tutarının altında. Beklenmedik durumlar için kenara nakit ayırmayı düşünün.`,
      type: 'warning',
      icon: 'shield',
    });
  }

  // 2. Borç/Varlık Oranı
  if (totalAssets > 0) {
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio > 0.5) {
      recommendations.push({
        id: 'high-debt',
        title: 'Borç Yükünüzü Hafifletin',
        description: `Varlıklarınızın %${(debtRatio * 100).toFixed(0)}'i kadar borcunuz var. Bu oranı %30'un altına çekmek finansal özgürlüğünüzü artırır.`,
        type: 'action',
        icon: 'alert-triangle',
      });
    }
  }

  // 3. Taksit Yükü (DSR)
  if (monthlyIncome > 0) {
    const dsr = monthlyInstallments / monthlyIncome;
    if (dsr > 0.4) {
      recommendations.push({
        id: 'high-installments',
        title: 'Aylık Taksitleriniz Yüksek',
        description: `Gelirinizin %${(dsr * 100).toFixed(0)}'i taksitlere gidiyor. Yeni bir borçlanma yapmadan önce mevcutları azaltmaya odaklanın.`,
        type: 'warning',
        icon: 'target',
      });
    }
  }

  // 4. İyi Durum / Yatırım
  if (healthScore > 80 && liquidAssets > monthlyIncome * 3) {
    recommendations.push({
      id: 'invest',
      title: 'Yatırım Fırsatlarını Değerlendirin',
      description: 'Finansal sağlığınız harika! Fazla nakitinizi enflasyona karşı korumak için yatırım fonu, hisse senedi veya altına yönlendirebilirsiniz.',
      type: 'success',
      icon: 'trending-up',
    });
  }

  // --- GENEL FİNANSAL İPUÇLARI (HAVUZ) ---
  
  const generalTips: Recommendation[] = [
    {
      id: 'budget-rule',
      title: '50/30/20 Kuralını Deneyin',
      description: `Gelirinizin %50'sini ihtiyaçlara, %30'unu isteklere ve %20'sini birikime ayırarak dengeli bir bütçe oluşturabilirsiniz.`,
      type: 'info',
      icon: 'book-open',
    },
    {
      id: 'compound-interest',
      title: 'Erken Başlamanın Gücü',
      description: 'Küçük miktarlarda bile olsa düzenli yatırım yapmak, bileşik getiri sayesinde uzun vadede büyük servetler oluşturur.',
      type: 'success',
      icon: 'piggy-bank',
    },
    {
      id: 'track-habit',
      title: 'Harcamalarınızı Takip Edin',
      description: 'Küçük harcamalar (kahve, abonelikler) ay sonunda büyük yekün tutabilir. Giderlerinizi düzenli olarak gözden geçirin.',
      type: 'info',
      icon: 'zap',
    },
    {
      id: 'credit-score',
      title: 'Kredi Notunuzu Koruyun',
      description: 'Faturalarınızı ve kredi kartı borçlarınızı zamanında ödemek, kredi notunuzu yükseltmenin en kolay yoludur.',
      type: 'action',
      icon: 'credit-card',
    },
    {
      id: 'impulse-buying',
      title: 'Dürtüsel Alışverişten Kaçının',
      description: 'Büyük bir şey almadan önce 24 saat bekleyin. Hala istiyorsanız ve bütçeniz uygunsa alın.',
      type: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'diversification',
      title: 'Yatırımlarınızı Çeşitlendirin',
      description: 'Tüm yumurtaları aynı sepete koymayın. Farklı yatırım araçları (altın, döviz, borsa) riskinizi azaltır.',
      type: 'info',
      icon: 'trending-up',
    },
    {
      id: 'subscription-audit',
      title: 'Aboneliklerinizi Kontrol Edin',
      description: 'Kullanmadığınız dijital abonelikleriniz var mı? İptal ederek her ay tasarruf edebilirsiniz.',
      type: 'action',
      icon: 'zap',
    },
    {
      id: 'financial-goals',
      title: 'Finansal Hedef Belirleyin',
      description: 'Tatil, araba veya ev... Hedef koymak birikim yapma motivasyonunuzu artırır.',
      type: 'success',
      icon: 'target',
    },
    {
      id: 'inflation-protection',
      title: 'Enflasyona Karşı Korunun',
      description: 'Paranızı nakitte tutmak yerine, değerini koruyacak araçlarda değerlendirin.',
      type: 'warning',
      icon: 'shield',
    },
    {
      id: 'mental-health',
      title: 'Para ve Huzur',
      description: 'Finansal planlama sadece cüzdanınız için değil, zihinsel huzurunuz için de önemlidir.',
      type: 'info',
      icon: 'smile',
    },
    {
      id: 'side-hustle',
      title: 'Ek Gelir Kaynakları Yaratın',
      description: 'Yeteneklerinizi gelire dönüştürün. Freelance işler veya pasif gelir kaynakları bütçenizi rahatlatabilir.',
      type: 'action',
      icon: 'briefcase',
    },
    {
      id: 'cooking',
      title: 'Evde Yemek Pişirin',
      description: 'Dışarıda yemek yerine evde pişirmek hem sağlığınız hem de cüzdanınız için daha iyidir. Aylık tasarrufu şaşırtıcı olabilir.',
      type: 'info',
      icon: 'coffee',
    },
    {
      id: 'insurance',
      title: 'Riskleri Sigortalayın',
      description: 'Sağlık, ev veya araç sigortası, beklenmedik büyük masraflara karşı en ucuz korumadır.',
      type: 'warning',
      icon: 'shield',
    },
    {
      id: 'negotiate',
      title: 'Pazarlık Yapmaktan Çekinmeyin',
      description: 'Büyük alımlarda veya hizmet sözleşmelerinde pazarlık yapmak, sandığınızdan daha fazla tasarruf sağlayabilir.',
      type: 'action',
      icon: 'zap',
    },
    {
      id: 'home-equity',
      title: 'Eviniz Bir Yatırımdır',
      description: 'Ev sahibiyseniz, konut değer artışı uzun vadeli servetinizin önemli bir parçasıdır. Bakımını ihmal etmeyin.',
      type: 'success',
      icon: 'home',
    }
  ];

  recommendations.push(...generalTips);

  return recommendations;
}
