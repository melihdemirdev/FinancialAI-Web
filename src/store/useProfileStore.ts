import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set } from 'idb-keyval';
import { Profile, Currency } from '@/types';

interface ProfileStore {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  setProfileCurrency: (currency: Currency) => void;
  clearProfile: () => void;
}

const defaultProfile: Profile = {
  name: '',
  email: '',
  phone: '',
  currency: 'TRY',
};

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

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      setProfileCurrency: (currency) =>
        set((state) => ({
          profile: { ...state.profile, currency },
        })),

      clearProfile: () =>
        set({
          profile: defaultProfile,
        }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
