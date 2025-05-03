import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('languages.en') },
    { code: 'hi', name: t('languages.hi') },
    { code: 'pa', name: t('languages.pa') }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe size={16} />
        <span className="hidden md:inline-block text-sm">
          {languages.find(lang => lang.code === i18n.language)?.name || t('languages.selectLanguage')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  i18n.language === language.code
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => changeLanguage(language.code)}
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;