import { create } from 'zustand';

interface LanguageStore {
  language: string;
  setLanguage: (language: string) => void;
}

const useLanguage = create<LanguageStore>((set) => ({
  language: 'English',
  setLanguage: (language: string) => set({ language }),
}));

export default useLanguage;
