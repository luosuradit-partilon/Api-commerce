"use client";

import { useState } from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import useLanguage from '@/app/hooks/useLanguage';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'US', name: 'English (US)', Flag: Flags.US, value: 'English' },
    { code: 'KR', name: '한국어', Flag: Flags.KR, value: 'Korean' },
    { code: 'TH', name: 'ไทย', Flag: Flags.TH, value: 'Thai' },
  ];

  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.value === language) || languages[0]
  );

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
                  setLanguage(language.value);
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
