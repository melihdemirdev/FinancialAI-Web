// Core Financial Entities

export type AssetType = 'liquid' | 'term' | 'gold_currency' | 'funds';
export type LiabilityType = 'credit_card' | 'personal_debt';
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';
export type SafeToSpendMode = 'conservative' | 'balanced' | 'aggressive';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  value: number;
  currency: Currency;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Liability {
  id: string;
  type: LiabilityType;
  name: string;
  currentDebt: number;
  totalLimit?: number;
  dueDate?: string;
  debtorName?: string;
  apr?: number; // Annual Percentage Rate
  minPayment?: number;
  currency: Currency;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Receivable {
  id: string;
  debtor: string;
  amount: number;
  dueDate: string;
  status?: 'pending' | 'partial' | 'collected';
  currency: Currency;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Installment {
  id: string;
  name: string;
  installmentAmount: number;
  remainingMonths: number;
  paymentDay: number; // Day of month (1-31)
  endDate: string;
  totalAmount?: number;
  category?: string;
  currency: Currency;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'food' | 'transport' | 'rent' | 'entertainment' | 'shopping' | 'health' | 'education' | 'other_expense'
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other_income';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  renewalDay: number; // 1-31
  category?: string;
  details?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  currency: Currency;
  icon?: string; // 'car', 'home', 'vacation', 'emergency', 'other'
  color?: string; // Tailwind color class or hex
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  findeksScore?: number;
  salary?: number;
  additionalIncome?: number;
  currency: Currency;
  monthlyExpenses?: number;
  dependents?: number;
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
}

// Financial Metrics

export interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalReceivables: number;
  totalInstallments: number;
  liquidAssets: number;
  netWorth: number;
  safeToSpend: number;
  monthlyIncome: number;
}

export interface HealthScore {
  overall: number;
  liquidity: number;
  debtManagement: number;
  assetQuality: number;
  installmentManagement: number;
}

export interface FinancialData {
  profile: Profile;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  safeToSpend: number;
  assets: Asset[];
  liabilities: Liability[];
  receivables: Receivable[];
  installments: Installment[];
  goals?: Goal[]; // Add goals to financial data
  healthScore: HealthScore;
  findeksScore?: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  description: string;
  recommendation?: string;
  color: string;
}

// AI CFO Report

export interface CFOReportData {
  // Input Metrics
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  liquidAssets: number;
  monthlyIncome: number;
  monthlyInstallments: number;
  healthScore: number;
  currency: Currency;
  findeksScore?: number;
  assetsByType: Record<string, number>;
  liabilitiesByType: Record<string, number>;

  // Result fields (optional because they are populated after AI generation)
  summary?: string;
  risks?: string[];
  actions?: string[];
  rawText?: string;
  generatedAt?: string;
  
  // Goals info for AI context
  goalsProgress?: {
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
  };
}

// Export/Import Data Schema

export interface ExportDataV1 {
  version: 1;
  exportDate: string;
  currency: Currency;
  appVersion: string;
  data: {
    assets: Asset[];
    liabilities: Liability[];
    receivables: Receivable[];
    installments: Installment[];
    goals?: Goal[];
    profile?: Profile;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalReceivables: number;
    totalInstallments: number;
    netWorth: number;
  };
}

export type ExportData = ExportDataV1;

// Validation Results

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Theme

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

// API

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}
