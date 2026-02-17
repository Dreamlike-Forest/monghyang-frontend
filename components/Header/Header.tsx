'use client';

import { useState, useRef, useEffect } from 'react';
import { getCartItemCount, subscribeToCart, clearCart } from '../Cart/CartStore';
import { checkAuthAndPrompt } from '../../utils/authUtils'; 
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

// 장바구니 아이콘 컴포넌트
const CartIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    setCartItemCount(getCartItemCount());

    const unsubscribe = subscribeToCart(() => {
      const newCount = getCartItemCount();
      setCartItemCount(newCount);
    });

    return unsubscribe;
  }, []);

  return (
    <button className="header-button cart-button" onClick={onClick}>
      <div className="header-cart-icon-container">
        🛒 장바구니
        {cartItemCount > 0 && (
          <span className="cart-badge">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </div>
    </button>
  );
};

const Header: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 확인 (수정됨: loginInfo 우선 사용 + userData 필드명 매핑)
  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        try {
          const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
          
          if (!isAuthenticated) {
            setIsUserLoggedIn(false);
            setUser(null);
            return;
          }

          // 1. loginInfo에서 먼저 확인 (빠르고 간단)
          const loginInfo = localStorage.getItem('loginInfo');
          if (loginInfo) {
            const parsed = JSON.parse(loginInfo);
            if (parsed.nickname) {
              setIsUserLoggedIn(true);
              setUser({
                id: '',
                nickname: parsed.nickname,
                email: ''
              });
              return;
            }
          }

          // 2. userData에서 확인 (백엔드 필드명 매핑 필요)
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsed = JSON.parse(userData);
            setIsUserLoggedIn(true);
            setUser({
              id: parsed.users_id?.toString() || '',
              nickname: parsed.users_nickname || '',  
              email: parsed.users_email || ''
            });
          } else {
            setIsUserLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error('사용자 데이터 파싱 오류:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginInfo');
          }
          setIsUserLoggedIn(false);
          setUser(null);
        }
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'userData' || e.key === 'loginInfo') {
        checkAuthStatus();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
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

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, []);

  // 안전한 페이지 이동을 위한 헬퍼 함수
  const handleNavigation = (viewName: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      // 상세 페이지 유발 파라미터 제거
      url.searchParams.delete('product');
      url.searchParams.delete('brewery');
      
      // 검색 관련 파라미터 제거
      url.searchParams.delete('search');
      url.searchParams.delete('searchType');

      // 목표 뷰 설정
      url.searchParams.set('view', viewName);
      
      window.location.href = url.toString();
      setIsProfileDropdownOpen(false);
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageDropdownOpen(false);
  };

  // 로그인 핸들러
  const handleLogin = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const currentHref = window.location.href;
      const currentUrl = new URL(currentHref);
      const productId = currentUrl.searchParams.get('product');
      
      if (productId) {
        sessionStorage.setItem('returnToProduct', productId);
      }
      
      handleNavigation('login');
    } catch (error) {
      console.error('로그인 페이지 이동 중 오류:', error);
      window.location.href = '/?view=login';
    }
  };

  // 장바구니 이동
  const handleCart = () => {
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => console.log('로그인 페이지로 이동'),
      () => console.log('취소됨')
    );

    if (!canProceed) return;

    handleNavigation('cart');
  };

  const handleProfile = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // 로그아웃 (수정됨: loginInfo도 삭제)
  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    
    try {
      try {
        clearCart();
      } catch (cartError) {
        console.error('장바구니 초기화 오류:', cartError);
      }

      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('loginInfo');  
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('returnToProduct');
      sessionStorage.removeItem('returnUrl');
      
      setIsUserLoggedIn(false);
      setUser(null);
      setIsProfileDropdownOpen(false);
      
      // 로그아웃 시 홈으로 이동하며 파라미터 초기화
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.location.href = baseUrl;
    } catch (error) {
      window.location.href = '/';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-actions">
          {/* 언어 선택 */}
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
                width="12" height="12" viewBox="0 0 12 12"
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

          {/* 로그인/프로필 영역 */}
          {isUserLoggedIn && user ? (
            <>
              <div className="user-greeting">
                <span className="user-nickname">{user.nickname}님</span>
              </div>

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
                    width="12" height="12" viewBox="0 0 12 12"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <ul role="menu" className="profile-list">
                      <li role="menuitem">
                        <button 
                          className="profile-option"
                          onClick={() => handleNavigation('profile')}
                        >
                          👤 프로필 수정
                        </button>
                      </li>
                      <li role="menuitem">
                        <button 
                          className="profile-option"
                          onClick={() => handleNavigation('order-history')}
                        >
                          📋 주문 내역
                        </button>
                      </li>
                      <li role="menuitem">
                        <button 
                          className="profile-option"
                          onClick={() => handleNavigation('reservation-history')}
                        >
                          🎫 체험 예약 내역
                        </button>
                      </li>
                      <li role="menuitem">
                        <button 
                          className="profile-option"
                          onClick={() => handleNavigation('follow')}
                        >
                          👥 팔로우 관리
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
            <button 
              className="header-button login-button" 
              onClick={handleLogin}
              type="button"
            >
              로그인
            </button>
          )}

          <CartIcon onClick={handleCart} />
        </div>
      </div>
    </header>
  );
};

export default Header;