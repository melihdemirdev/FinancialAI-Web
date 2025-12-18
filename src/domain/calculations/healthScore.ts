import { HealthScore, ScoreBreakdown } from '@/types';

interface HealthScoreParams {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  liquidAssets: number;
  monthlyInstallments: number;
  monthlyIncome: number;
  findeksScore?: number;
}

/**
 * Calculates comprehensive financial health score (0-100)
 */
export function calculateHealthScore(params: HealthScoreParams): number {
  let score = 0;

  // 1. Net Worth (20 points)
  if (params.netWorth > 0) {
    score += 20;
  } else if (params.netWorth < 0) {
    const penalty = Math.min(20, Math.abs(params.netWorth) / 1000);
    score -= penalty;
  }

  // 2. Debt-to-Asset Ratio (15 points)
  const debtToAssetRatio =
    params.totalAssets > 0 ? params.totalLiabilities / params.totalAssets : 1;
  if (debtToAssetRatio < 0.3) score += 15;
  else if (debtToAssetRatio < 0.5) score += 10;
  else if (debtToAssetRatio < 0.7) score += 5;
  else score -= 10;

  // 3. Debt-to-Income Ratio (15 points)
  const debtToIncomeRatio =
    params.monthlyIncome > 0 ? params.totalLiabilities / (params.monthlyIncome * 12) : 999;
  if (debtToIncomeRatio < 2) score += 15;
  else if (debtToIncomeRatio < 3) score += 10;
  else if (debtToIncomeRatio < 5) score += 5;
  else score -= 10;

  // 4. Installment Burden (10 points)
  const installmentBurden =
    params.monthlyIncome > 0 ? params.monthlyInstallments / params.monthlyIncome : 1;
  if (installmentBurden < 0.2) score += 10;
  else if (installmentBurden < 0.3) score += 7;
  else if (installmentBurden < 0.4) score += 4;
  else score -= 5;

  // 5. Liquidity Ratio (10 points)
  const liquidityRatio =
    params.totalLiabilities > 0
      ? params.liquidAssets / params.totalLiabilities
      : params.liquidAssets > 0
      ? 2
      : 0;
  if (liquidityRatio > 1) score += 10;
  else if (liquidityRatio > 0.5) score += 7;
  else if (liquidityRatio > 0.3) score += 4;
  else score -= 5;

  // 6. Findeks Score (15 points)
  if (params.findeksScore) {
    if (params.findeksScore >= 1700) score += 15;
    else if (params.findeksScore >= 1500) score += 10;
    else if (params.findeksScore >= 1300) score += 5;
    else if (params.findeksScore < 1100) score -= 10;
  } else {
    score += 5; // Neutral if not provided
  }

  // 7. Emergency Fund (15 points)
  const emergencyFundMonths =
    params.monthlyIncome > 0 ? params.liquidAssets / params.monthlyIncome : 0;
  if (emergencyFundMonths >= 6) score += 15;
  else if (emergencyFundMonths >= 3) score += 10;
  else if (emergencyFundMonths >= 1) score += 5;
  else score -= 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates category-specific scores
 */
export function calculateCategoryScores(params: HealthScoreParams): HealthScore {
  // Liquidity Score
  const liquidityScore =
    params.totalLiabilities > 0
      ? Math.min(100, (params.liquidAssets / params.totalLiabilities) * 100)
      : params.liquidAssets > 0
      ? 100
      : -1; // -1 = unknown/no data

  // Debt Management Score
  const debtScore =
    params.totalAssets > 0
      ? Math.max(0, 100 - (params.totalLiabilities / params.totalAssets) * 100)
      : params.totalLiabilities > 0
      ? 0
      : -1; // -1 = unknown/no data

  // Asset Quality Score (based on net worth)
  const assetScore =
    params.totalAssets === 0 && params.totalLiabilities === 0
      ? -1 // Unknown - no data
      : params.netWorth > 0
      ? Math.min(100, (params.netWorth / 10000) * 100)
      : 0; // Negative or zero net worth

  // Installment Management Score
  const installmentScore =
    params.monthlyIncome > 0
      ? Math.max(0, 100 - (params.monthlyInstallments / params.monthlyIncome) * 100)
      : params.monthlyInstallments > 0
      ? 0
      : -1; // -1 = unknown/no data

  const overall = calculateHealthScore(params);

  return {
    overall,
    liquidity: Math.round(liquidityScore),
    debtManagement: Math.round(debtScore),
    assetQuality: Math.round(assetScore),
    installmentManagement: Math.round(installmentScore),
  };
}

/**
 * Gets detailed score breakdown with explanations
 */
export function getScoreBreakdown(params: HealthScoreParams): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];

  // Net Worth
  const netWorthScore = params.netWorth > 0 ? 20 : params.netWorth < 0 ? -20 : 0;
  breakdown.push({
    category: 'Net Değer',
    score: netWorthScore,
    maxScore: 20,
    description:
      params.netWorth > 0
        ? `Pozitif net değeriniz var`
        : `Negatif net değer: varlıklarınız borçlarınızı karşılamıyor`,
    recommendation:
      params.netWorth < 0 ? 'Acil olarak borçlarınızı azaltmaya odaklanın' : undefined,
    color: params.netWorth > 0 ? '#22c55e' : '#ff4757',
  });

  // Debt-to-Asset Ratio
  const debtRatio = params.totalAssets > 0 ? params.totalLiabilities / params.totalAssets : 1;
  let debtRatioScore = 0;
  if (debtRatio < 0.3) debtRatioScore = 15;
  else if (debtRatio < 0.5) debtRatioScore = 10;
  else if (debtRatio < 0.7) debtRatioScore = 5;
  else debtRatioScore = -10;

  breakdown.push({
    category: 'Borç Oranı',
    score: debtRatioScore,
    maxScore: 15,
    description: `Borçlarınız varlıklarınızın %${(debtRatio * 100).toFixed(1)}'ini oluşturuyor`,
    recommendation: debtRatio > 0.5 ? 'Borç oranınız yüksek. Yeni borçlanmadan kaçının' : undefined,
    color: debtRatio < 0.5 ? '#22c55e' : '#F59E0B',
  });

  // Liquidity
  const liquidityRatio =
    params.totalLiabilities > 0 ? params.liquidAssets / params.totalLiabilities : 2;
  let liquidityScore = 0;
  if (liquidityRatio > 1) liquidityScore = 10;
  else if (liquidityRatio > 0.5) liquidityScore = 7;
  else if (liquidityRatio > 0.3) liquidityScore = 4;
  else liquidityScore = -5;

  breakdown.push({
    category: 'Likidite',
    score: liquidityScore,
    maxScore: 10,
    description: `Likit varlıklarınız borçlarınızın %${(liquidityRatio * 100).toFixed(0)}'i`,
    recommendation:
      liquidityRatio < 0.5 ? 'Acil durum fonu oluşturmaya öncelik verin' : undefined,
    color: liquidityRatio > 0.5 ? '#22c55e' : '#ff4757',
  });

  // Installment Burden
  const installmentBurden =
    params.monthlyIncome > 0 ? params.monthlyInstallments / params.monthlyIncome : 0;
  let installmentScore = 0;
  if (installmentBurden < 0.2) installmentScore = 10;
  else if (installmentBurden < 0.3) installmentScore = 7;
  else if (installmentBurden < 0.4) installmentScore = 4;
  else installmentScore = -5;

  breakdown.push({
    category: 'Taksit Yükü',
    score: installmentScore,
    maxScore: 10,
    description: `Aylık taksitleriniz gelirinizin %${(installmentBurden * 100).toFixed(0)}'i`,
    recommendation:
      installmentBurden > 0.3 ? 'Taksit yükünüz yüksek. Yeni taksitli alışverişten kaçının' : undefined,
    color: installmentBurden < 0.3 ? '#22c55e' : '#F59E0B',
  });

  return breakdown;
}

/**
 * Gets score category and label
 */
export function getScoreCategory(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Mükemmel',
      color: '#22c55e',
      description: 'Finansal sağlığınız çok iyi durumda',
    };
  }
  if (score >= 60) {
    return {
      label: 'İyi',
      color: '#06B6D4',
      description: 'Finansal sağlığınız iyi seviyede',
    };
  }
  if (score >= 40) {
    return {
      label: 'Orta',
      color: '#F59E0B',
      description: 'Finansal sağlığınızı iyileştirmeye çalışın',
    };
  }
  return {
    label: 'Dikkat',
    color: '#ff4757',
    description: 'Finansal sağlığınız risk altında',
  };
}
