import { create } from 'zustand';
import { useEffect } from 'react';

interface LanguageStore {
  language: string;
  setLanguage: (language: string) => void;
  initializeFromUrl: () => void;
}

// Helper function to get language from URL query parameter
const getLanguageFromUrl = (): string => {
  if (typeof window === 'undefined') return 'English'; // Default for SSR
  
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  
  // Check if the language parameter exists and is valid
  if (langParam && ['English', 'Korean', 'Thai'].includes(langParam)) {
    return langParam;
  }
  
  return 'English'; // Default language
};

// Helper function to update URL with language parameter
const updateUrlWithLanguage = (language: string): void => {
  if (typeof window === 'undefined') return; // Skip for SSR
  
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  
  // Update URL without reloading the page
  window.history.pushState({}, '', url.toString());
};

const useLanguage = create<LanguageStore>((set) => ({
  language: typeof window !== 'undefined' ? getLanguageFromUrl() : 'English',
  
  setLanguage: (language: string) => {
    updateUrlWithLanguage(language);
    set({ language });
  },
  
  initializeFromUrl: () => {
    const language = getLanguageFromUrl();
    set({ language });
  }
}));

// Custom hook wrapper to initialize from URL on mount
export const useLanguageWithUrlSync = () => {
  const { language, setLanguage, initializeFromUrl } = useLanguage();
  
  useEffect(() => {
    // Initialize language from URL when component mounts
    initializeFromUrl();
    
    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      initializeFromUrl();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initializeFromUrl]);
  
  return { language, setLanguage };
};

export default useLanguage;
