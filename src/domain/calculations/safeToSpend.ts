import { SafeToSpendMode } from '@/types';

interface SafeToSpendParams {
  liquidAssets: number;
  totalLiabilities: number;
  monthlyInstallments: number;
  monthlyIncome: number;
}

/**
 * Calculates safe to spend amount - Conservative mode
 * Reserves: all liabilities + 3 month emergency fund + 3 months installments
 */
export function getSafeToSpendConservative(params: SafeToSpendParams): number {
  const emergencyFund = params.monthlyIncome * 3;
  const futureInstallments = params.monthlyInstallments * 3;
  const reserved = params.totalLiabilities + emergencyFund + futureInstallments;

  return Math.max(0, params.liquidAssets - reserved);
}

/**
 * Calculates safe to spend amount - Balanced mode
 * Reserves: 1.5 month emergency fund + 1 month installments
 */
export function getSafeToSpendBalanced(params: SafeToSpendParams): number {
  const emergencyFund = params.monthlyIncome * 1.5;
  const nearTermDebt = params.monthlyInstallments * 1;
  const reserved = emergencyFund + nearTermDebt;

  return Math.max(0, params.liquidAssets - reserved);
}

/**
 * Calculates safe to spend amount - Aggressive mode
 * Reserves: only current month installments
 */
export function getSafeToSpendAggressive(params: SafeToSpendParams): number {
  const reserved = params.monthlyInstallments;

  return Math.max(0, params.liquidAssets - reserved);
}

/**
 * Main safe to spend calculator with mode selection
 */
export function calculateSafeToSpend(
  params: SafeToSpendParams,
  mode: SafeToSpendMode = 'balanced'
): number {
  switch (mode) {
    case 'conservative':
      return getSafeToSpendConservative(params);
    case 'balanced':
      return getSafeToSpendBalanced(params);
    case 'aggressive':
      return getSafeToSpendAggressive(params);
    default:
      return getSafeToSpendBalanced(params);
  }
}

/**
 * Gets explanation for safe to spend calculation
 */
export function getSafeToSpendExplanation(
  params: SafeToSpendParams,
  mode: SafeToSpendMode
): {
  mode: string;
  reserves: Array<{ label: string; amount: number }>;
  safeToSpend: number;
  description: string;
} {
  const reserves: Array<{ label: string; amount: number }> = [];

  switch (mode) {
    case 'conservative':
      reserves.push(
        { label: 'Tüm Borçlar', amount: params.totalLiabilities },
        { label: '3 Aylık Acil Fon', amount: params.monthlyIncome * 3 },
        { label: '3 Aylık Taksitler', amount: params.monthlyInstallments * 3 }
      );
      return {
        mode: 'Muhafazakâr',
        reserves,
        safeToSpend: getSafeToSpendConservative(params),
        description:
          'En güvenli seçenek. Tüm borçlar, 3 aylık acil fon ve gelecek 3 ay taksitleri rezerve edilir.',
      };

    case 'balanced':
      reserves.push(
        { label: '1.5 Aylık Acil Fon', amount: params.monthlyIncome * 1.5 },
        { label: 'Bu Ayki Taksitler', amount: params.monthlyInstallments }
      );
      return {
        mode: 'Dengeli',
        reserves,
        safeToSpend: getSafeToSpendBalanced(params),
        description: 'Dengeli yaklaşım. 1.5 aylık acil fon ve bu ayki taksitler rezerve edilir.',
      };

    case 'aggressive':
      reserves.push({ label: 'Bu Ayki Taksitler', amount: params.monthlyInstallments });
      return {
        mode: 'Agresif',
        reserves,
        safeToSpend: getSafeToSpendAggressive(params),
        description: 'Risk alıcı yaklaşım. Sadece bu ayki zorunlu ödemeler rezerve edilir.',
      };

    default:
      return getSafeToSpendExplanation(params, 'balanced');
  }
}

/**
 * Calculates how many months the liquid assets can cover monthly expenses
 */
export function calculateMonthsCovered(
  liquidAssets: number,
  monthlyExpenses: number
): number {
  if (monthlyExpenses <= 0) return 0;
  return liquidAssets / monthlyExpenses;
}

/**
 * Recommends safe to spend mode based on financial situation
 */
export function recommendSafeToSpendMode(params: SafeToSpendParams): SafeToSpendMode {
  const debtRatio = params.liquidAssets > 0 ? params.totalLiabilities / params.liquidAssets : 999;
  const installmentBurden =
    params.monthlyIncome > 0 ? params.monthlyInstallments / params.monthlyIncome : 1;
  const emergencyFundMonths =
    params.monthlyIncome > 0 ? params.liquidAssets / params.monthlyIncome : 0;

  // High debt or high installment burden → conservative
  if (debtRatio > 2 || installmentBurden > 0.4) {
    return 'conservative';
  }

  // Low emergency fund → conservative
  if (emergencyFundMonths < 2) {
    return 'conservative';
  }

  // Good financial health → aggressive possible
  if (debtRatio < 0.5 && installmentBurden < 0.2 && emergencyFundMonths > 6) {
    return 'aggressive';
  }

  // Default: balanced
  return 'balanced';
}
