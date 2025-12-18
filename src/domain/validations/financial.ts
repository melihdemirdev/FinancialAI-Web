import { Asset, Liability, Receivable, Installment, Currency, ValidationResult } from '@/types';

const VALID_CURRENCIES: Currency[] = ['TRY', 'USD', 'EUR', 'GBP'];

/**
 * Validates an asset
 */
export function validateAsset(asset: Partial<Asset>): ValidationResult {
  const errors: string[] = [];

  if (!asset.name || asset.name.trim() === '') {
    errors.push('Varlık adı gereklidir');
  }

  if (asset.name && asset.name.length > 100) {
    errors.push('Varlık adı çok uzun (maksimum 100 karakter)');
  }

  if (asset.value !== undefined) {
    if (asset.value < 0) {
      errors.push('Varlık değeri negatif olamaz');
    }
    if (asset.value > Number.MAX_SAFE_INTEGER) {
      errors.push('Varlık değeri çok büyük');
    }
  } else {
    errors.push('Varlık değeri gereklidir');
  }

  if (!asset.currency || !VALID_CURRENCIES.includes(asset.currency)) {
    errors.push('Geçersiz para birimi');
  }

  if (!asset.type || !['liquid', 'term', 'gold_currency', 'funds'].includes(asset.type)) {
    errors.push('Geçersiz varlık tipi');
  }

  if (asset.details && asset.details.length > 500) {
    errors.push('Detay metni çok uzun (maksimum 500 karakter)');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a liability
 */
export function validateLiability(liability: Partial<Liability>): ValidationResult {
  const errors: string[] = [];

  if (!liability.name || liability.name.trim() === '') {
    errors.push('Borç adı gereklidir');
  }

  if (liability.name && liability.name.length > 100) {
    errors.push('Borç adı çok uzun (maksimum 100 karakter)');
  }

  if (liability.currentDebt !== undefined) {
    if (liability.currentDebt < 0) {
      errors.push('Borç tutarı negatif olamaz');
    }
    if (liability.currentDebt > Number.MAX_SAFE_INTEGER) {
      errors.push('Borç tutarı çok büyük');
    }
  } else {
    errors.push('Borç tutarı gereklidir');
  }

  if (liability.totalLimit !== undefined && liability.totalLimit < 0) {
    errors.push('Toplam limit negatif olamaz');
  }

  if (
    liability.totalLimit !== undefined &&
    liability.currentDebt !== undefined &&
    liability.currentDebt > liability.totalLimit
  ) {
    errors.push('Güncel borç toplam limitten büyük olamaz');
  }

  if (!liability.currency || !VALID_CURRENCIES.includes(liability.currency)) {
    errors.push('Geçersiz para birimi');
  }

  if (!liability.type || !['credit_card', 'personal_debt'].includes(liability.type)) {
    errors.push('Geçersiz borç tipi');
  }

  if (liability.apr !== undefined && (liability.apr < 0 || liability.apr > 100)) {
    errors.push('Faiz oranı 0-100 arasında olmalıdır');
  }

  if (liability.dueDate && !isValidDateString(liability.dueDate)) {
    errors.push('Geçersiz tarih formatı (YYYY-MM-DD kullanın)');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a receivable
 */
export function validateReceivable(receivable: Partial<Receivable>): ValidationResult {
  const errors: string[] = [];

  if (!receivable.debtor || receivable.debtor.trim() === '') {
    errors.push('Borçlu adı gereklidir');
  }

  if (receivable.debtor && receivable.debtor.length > 100) {
    errors.push('Borçlu adı çok uzun (maksimum 100 karakter)');
  }

  if (receivable.amount !== undefined) {
    if (receivable.amount < 0) {
      errors.push('Alacak tutarı negatif olamaz');
    }
    if (receivable.amount > Number.MAX_SAFE_INTEGER) {
      errors.push('Alacak tutarı çok büyük');
    }
  } else {
    errors.push('Alacak tutarı gereklidir');
  }

  if (!receivable.currency || !VALID_CURRENCIES.includes(receivable.currency)) {
    errors.push('Geçersiz para birimi');
  }

  if (!receivable.dueDate || !isValidDateString(receivable.dueDate)) {
    errors.push('Geçerli bir vade tarihi gereklidir (YYYY-MM-DD)');
  }

  if (receivable.status && !['pending', 'partial', 'collected'].includes(receivable.status)) {
    errors.push('Geçersiz durum');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an installment
 */
export function validateInstallment(installment: Partial<Installment>): ValidationResult {
  const errors: string[] = [];

  if (!installment.name || installment.name.trim() === '') {
    errors.push('Taksit adı gereklidir');
  }

  if (installment.name && installment.name.length > 100) {
    errors.push('Taksit adı çok uzun (maksimum 100 karakter)');
  }

  if (installment.installmentAmount !== undefined) {
    if (installment.installmentAmount < 0) {
      errors.push('Taksit tutarı negatif olamaz');
    }
    if (installment.installmentAmount > Number.MAX_SAFE_INTEGER) {
      errors.push('Taksit tutarı çok büyük');
    }
  } else {
    errors.push('Taksit tutarı gereklidir');
  }

  if (installment.remainingMonths !== undefined) {
    if (installment.remainingMonths < 0) {
      errors.push('Kalan ay sayısı negatif olamaz');
    }
    if (!Number.isInteger(installment.remainingMonths)) {
      errors.push('Kalan ay sayısı tam sayı olmalıdır');
    }
    if (installment.remainingMonths > 600) {
      errors.push('Kalan ay sayısı çok büyük (maksimum 600)');
    }
  } else {
    errors.push('Kalan ay sayısı gereklidir');
  }

  if (!installment.endDate || !isValidDateString(installment.endDate)) {
    errors.push('Geçerli bir bitiş tarihi gereklidir (YYYY-MM-DD)');
  }

  if (!installment.currency || !VALID_CURRENCIES.includes(installment.currency)) {
    errors.push('Geçersiz para birimi');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a date string in YYYY-MM-DD format
 */
function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates Findeks score (300-1900)
 */
export function validateFindeksScore(score: number): ValidationResult {
  const errors: string[] = [];

  if (score < 300 || score > 1900) {
    errors.push('Findeks notu 300-1900 arasında olmalıdır');
  }

  if (!Number.isInteger(score)) {
    errors.push('Findeks notu tam sayı olmalıdır');
  }

  return { valid: errors.length === 0, errors };
}
