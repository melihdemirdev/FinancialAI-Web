/**
 * Calculates net worth: (Assets + Receivables) - Liabilities
 */
export function calculateNetWorth(
  totalAssets: number,
  totalLiabilities: number,
  totalReceivables: number = 0
): number {
  return totalAssets + totalReceivables - totalLiabilities;
}

/**
 * Calculates liquid assets net worth (only liquid assets)
 */
export function calculateLiquidNetWorth(
  liquidAssets: number,
  totalLiabilities: number
): number {
  return liquidAssets - totalLiabilities;
}

/**
 * Calculates debt-to-asset ratio
 */
export function calculateDebtToAssetRatio(
  totalAssets: number,
  totalLiabilities: number
): number {
  if (totalAssets === 0) return totalLiabilities > 0 ? Infinity : 0;
  return totalLiabilities / totalAssets;
}

/**
 * Calculates debt-to-income ratio (annual)
 */
export function calculateDebtToIncomeRatio(
  totalLiabilities: number,
  monthlyIncome: number
): number {
  const annualIncome = monthlyIncome * 12;
  if (annualIncome === 0) return totalLiabilities > 0 ? Infinity : 0;
  return totalLiabilities / annualIncome;
}

/**
 * Determines financial status based on net worth
 */
export function getFinancialStatus(netWorth: number): {
  status: 'positive' | 'neutral' | 'negative';
  label: string;
  color: string;
  description: string;
} {
  if (netWorth > 10000) {
    return {
      status: 'positive',
      label: 'Güçlü',
      color: '#22c55e',
      description: 'Net değeriniz güçlü pozisyonda',
    };
  }

  if (netWorth > 0) {
    return {
      status: 'positive',
      label: 'Pozitif',
      color: '#06B6D4',
      description: 'Net değeriniz pozitif',
    };
  }

  if (netWorth === 0) {
    return {
      status: 'neutral',
      label: 'Dengede',
      color: '#F59E0B',
      description: 'Varlıklarınız ve borçlarınız dengede',
    };
  }

  if (netWorth > -10000) {
    return {
      status: 'negative',
      label: 'Dikkat',
      color: '#F59E0B',
      description: 'Net değeriniz negatif, borç azaltmaya öncelik verin',
    };
  }

  return {
    status: 'negative',
    label: 'Risk',
    color: '#ff4757',
    description: 'Net değeriniz ciddi şekilde negatif, acil önlem gerekli',
  };
}
