'use client';

import { useState, useRef, useEffect } from 'react';
import './Header.css';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface User {
  id: string;
  nickname: string;
  email: string;
}

const languages: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const Header: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 확인 (실제로는 localStorage나 쿠키에서 확인)
  useEffect(() => {
    // 임시로 테스트용 로그인 상태 설정
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');
    
    if (isAuthenticated && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
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

  const handleProfile = () => {
    console.log('내 정보 페이지로 이동');
    // 실제로는 프로필 페이지로 이동
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    console.log('로그아웃 완료');
    
    // 홈으로 이동
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      window.location.href = url.toString();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-actions">
          {/* 언어 선택 드롭다운 */}
          <div className="language-selector" ref={languageDropdownRef}>
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

          {/* 로그인 상태에 따른 UI 분기 */}
          {isLoggedIn && user ? (
            <>
              {/* 사용자 닉네임 */}
              <div className="user-greeting">
                <span className="user-nickname">{user.nickname}님</span>
              </div>

              {/* 내 정보 드롭다운 */}
              <div className="profile-selector" ref={profileDropdownRef}>
                <button
                  className="profile-button"
                  onClick={handleProfile}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="menu"
                >
                  내 정보
                  <svg 
                    className={`profile-arrow ${isProfileDropdownOpen ? 'open' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <ul role="menu" className="profile-list">
                      <li role="menuitem">
                        <button className="profile-option">
                          👤 프로필 수정
                        </button>
                      </li>
                      <li role="menuitem">
                        <button className="profile-option">
                          📋 주문 내역
                        </button>
                      </li>
                      <li role="menuitem">
                        <button className="profile-option">
                          ❤️ 찜한 상품
                        </button>
                      </li>
                      <li role="menuitem">
                        <button className="profile-option">
                          🎫 체험 예약 내역
                        </button>
                      </li>
                      <li role="menuitem" className="logout-item">
                        <button className="profile-option logout-option" onClick={handleLogout}>
                          🚪 로그아웃
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 로그인 버튼 */
            <button 
              className="header-button login-button" 
              onClick={handleLogin}
              type="button"
            >
              로그인
            </button>
          )}

          {/* 장바구니 버튼 */}
          <button className="header-button cart-button" onClick={handleCart}>
            🛒 장바구니
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;