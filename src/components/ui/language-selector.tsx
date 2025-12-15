import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { i18n } from '@/lib/translations';

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState(i18n.getCurrentLanguage());
  
  const languages = [
    { code: 'hi', name: 'हिंदी' },
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'ગુજરાતી' }
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.setLanguage(lang as any);
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLang === lang.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange(lang.code)}
          className="text-xs"
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
}