import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set } from 'idb-keyval';
import { 
  Asset, 
  Liability, 
  Receivable, 
  Installment, 
  Goal, 
  Transaction,
  Subscription,
  AssetType, 
  LiabilityType, 
  SafeToSpendMode 
} from '@/types';
import { calculateNetWorth } from '@/domain/calculations/netWorth';
import { calculateSafeToSpend } from '@/domain/calculations/safeToSpend';

interface FinanceStore {
  assets: Asset[];
  liabilities: Liability[];
  receivables: Receivable[];
  installments: Installment[];
  goals: Goal[];
  transactions: Transaction[];
  subscriptions: Subscription[];

  // Actions
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;

  addLiability: (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLiability: (id: string, updates: Partial<Liability>) => void;
  removeLiability: (id: string) => void;

  addReceivable: (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReceivable: (id: string, updates: Partial<Receivable>) => void;
  removeReceivable: (id: string) => void;

  addInstallment: (installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInstallment: (id: string, updates: Partial<Installment>) => void;
  removeInstallment: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTransaction: (id: string) => void;

  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;

  clearAllData: () => void;

  // Selectors
  getTotalAssets: () => number;
  getTotalLiabilities: () => number;
  getTotalReceivables: () => number;
  getTotalInstallments: () => number;
  getNetWorth: () => number;
  getSafeToSpend: (monthlyIncome: number, mode?: SafeToSpendMode) => number;
  getLiquidAssets: () => number;
  getAssetsByType: () => Record<AssetType, number>;
  getLiabilitiesByType: () => Record<LiabilityType, number>;
  getMonthlyIncome: () => number;
  getMonthlyExpense: () => number;
  getTotalSubscriptions: () => number;
}

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await set(name, null);
  },
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      assets: [],
      liabilities: [],
      receivables: [],
      installments: [],
      goals: [],
      transactions: [],
      subscriptions: [],

      // --- Asset Actions ---
      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, { ...asset, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateAsset: (id, updates) =>
        set((state) => ({
          assets: state.assets.map((a) => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a),
        })),
      removeAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),

      // --- Liability Actions ---
      addLiability: (liability) =>
        set((state) => ({
          liabilities: [...state.liabilities, { ...liability, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateLiability: (id, updates) =>
        set((state) => ({
          liabilities: state.liabilities.map((l) => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l),
        })),
      removeLiability: (id) => set((state) => ({ liabilities: state.liabilities.filter((l) => l.id !== id) })),

      // --- Receivable Actions ---
      addReceivable: (receivable) =>
        set((state) => ({
          receivables: [...state.receivables, { ...receivable, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateReceivable: (id, updates) =>
        set((state) => ({
          receivables: state.receivables.map((r) => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r),
        })),
      removeReceivable: (id) => set((state) => ({ receivables: state.receivables.filter((r) => r.id !== id) })),

      // --- Installment Actions ---
      addInstallment: (installment) =>
        set((state) => ({
          installments: [...state.installments, { ...installment, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateInstallment: (id, updates) =>
        set((state) => ({
          installments: state.installments.map((inst) => inst.id === id ? { ...inst, ...updates, updatedAt: new Date().toISOString() } : inst),
        })),
      removeInstallment: (id) => set((state) => ({ installments: state.installments.filter((i) => i.id !== id) })),

      // --- Goal Actions ---
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g),
        })),
      removeGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

      // --- Transaction Actions ---
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

      // --- Subscription Actions ---
      addSubscription: (sub) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...sub, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s),
        })),
      removeSubscription: (id) => set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) })),

      clearAllData: () => set({ assets: [], liabilities: [], receivables: [], installments: [], goals: [], transactions: [], subscriptions: [] }),

      // --- Selectors ---
      getTotalAssets: () => get().assets.reduce((total, asset) => total + asset.value, 0),
      getTotalLiabilities: () => get().liabilities.reduce((total, liability) => total + liability.currentDebt, 0),
      getTotalReceivables: () => get().receivables.reduce((total, r) => total + r.amount, 0),
      getTotalInstallments: () => get().installments.reduce((total, i) => total + i.installmentAmount, 0),
      getNetWorth: () => calculateNetWorth(get().getTotalAssets(), get().getTotalLiabilities(), get().getTotalReceivables()),
      
      getSafeToSpend: (monthlyIncome, mode) => {
        const { installments, liabilities, assets } = get();
        const totalInstallments = installments.reduce((acc, curr) => acc + curr.installmentAmount, 0);
        const totalLiabilities = liabilities.reduce((total, liability) => total + liability.currentDebt, 0);
        const liquidAssets = assets.filter((a) => a.type === 'liquid' || a.type === 'gold_currency').reduce((total, asset) => total + asset.value, 0);
        return calculateSafeToSpend({ liquidAssets, totalLiabilities, monthlyInstallments: totalInstallments, monthlyIncome }, mode || 'balanced');
      },

      getLiquidAssets: () => get().assets.filter((a) => a.type === 'liquid' || a.type === 'gold_currency').reduce((total, asset) => total + asset.value, 0),
      getAssetsByType: () => get().assets.reduce((acc, asset) => { acc[asset.type] = (acc[asset.type] || 0) + asset.value; return acc; }, {} as Record<AssetType, number>),
      getLiabilitiesByType: () => get().liabilities.reduce((acc, liability) => { acc[liability.type] = (acc[liability.type] || 0) + liability.currentDebt; return acc; }, {} as Record<LiabilityType, number>),

      getMonthlyIncome: () => {
        const now = new Date();
        return get().transactions
          .filter(t => t.type === 'income' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
          .reduce((total, t) => total + t.amount, 0);
      },

      getMonthlyExpense: () => {
        const now = new Date();
        const transExpense = get().transactions
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
          .reduce((total, t) => total + t.amount, 0);
        
        const subExpense = get().subscriptions
          .filter(s => s.active)
          .reduce((total, s) => total + s.price, 0);
          
        return transExpense + subExpense;
      },

      getTotalSubscriptions: () => get().subscriptions.filter(s => s.active).reduce((total, s) => total + s.price, 0),
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);