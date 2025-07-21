'use client';

import { useState, useRef, useEffect } from 'react';
import './Header.css';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const Header: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageDropdownOpen(false);
    console.log('언어 변경:', language);
  };

  const handleLogin = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      url.searchParams.set('view', 'login');
      window.location.href = url.toString();
    }
  };

  const handleCart = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      url.searchParams.set('view', 'shop');
      window.location.href = url.toString();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-actions">
          {/* 언어 선택 드롭다운 */}
          <div className="language-selector" ref={dropdownRef}>
            <button
              className="language-button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="language-flag">{currentLanguage.flag}</span>
              <span className="language-name">{currentLanguage.name}</span>
              <svg 
                className={`language-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            
            {isLanguageDropdownOpen && (
              <div className="language-dropdown">
                <ul role="listbox" className="language-list">
                  {languages.map((language) => (
                    <li key={language.code} role="option">
                      <button
                        className={`language-option ${
                          currentLanguage.code === language.code ? 'selected' : ''
                        }`}
                        onClick={() => handleLanguageSelect(language)}
                      >
                        <span className="language-flag">{language.flag}</span>
                        <span className="language-name">{language.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button 
            className="header-button login-button" 
            onClick={handleLogin}
            type="button"
          >
            로그인
          </button>

          {/* 장바구니 */}
          <button className="header-button cart-button" onClick={handleCart}>
            장바구니
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;