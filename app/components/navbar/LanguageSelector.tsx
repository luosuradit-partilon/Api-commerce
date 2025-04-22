"use client";

import { useState, useEffect } from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import useLanguage, { useLanguageWithUrlSync } from '@/app/hooks/useLanguage';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'US', name: 'English (US)', Flag: Flags.US, value: 'English' },
    { code: 'KR', name: '한국어', Flag: Flags.KR, value: 'Korean' },
    { code: 'TH', name: 'ไทย', Flag: Flags.TH, value: 'Thai' },
  ];

  // Use the enhanced hook that syncs with URL
  const { language, setLanguage } = useLanguageWithUrlSync();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.value === language) || languages[0]
  );
  
  // Update selected language when language changes (e.g., from URL)
  useEffect(() => {
    const langObj = languages.find(lang => lang.value === language) || languages[0];
    setSelectedLanguage(langObj);
  }, [language]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-100 transition"
      >
        <selectedLanguage.Flag 
          className="w-5 h-auto rounded-sm"
          title={selectedLanguage.name}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setSelectedLanguage(language);
                  setLanguage(language.value); // This will update the URL
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100 w-full"
                role="menuitem"
              >
                <language.Flag
                  className="w-5 h-auto rounded-sm"
                  title={language.name}
                />
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
