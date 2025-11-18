'use client';

import { useState, useRef, useEffect } from 'react';
import { getCartItemCount, subscribeToCart } from '../Cart/CartStore';
import { checkAuthAndPrompt, isLoggedIn } from '../../utils/authUtils'; 
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

// 장바구니 아이콘 컴포넌트 - 로그인 확인 추가
const CartIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // 초기 장바구니 아이템 수 가져오기
    setCartItemCount(getCartItemCount());

    // 장바구니 변경사항 구독
    const unsubscribe = subscribeToCart(() => {
      const newCount = getCartItemCount();
      console.log('Header: 장바구니 아이템 수 업데이트:', newCount);
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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // 로그인 상태명 변경으로 충돌 방지
  const [user, setUser] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        try {
          const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
          const userData = localStorage.getItem('userData');
          
          if (isAuthenticated && userData) {
            const parsedUserData = JSON.parse(userData);
            setIsUserLoggedIn(true);
            setUser(parsedUserData);
          } else {
            setIsUserLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error('사용자 데이터 파싱 오류:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
          }
          setIsUserLoggedIn(false);
          setUser(null);
        }
      }
    };

    checkAuthStatus();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'userData') {
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

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageDropdownOpen(false);
    console.log('언어 변경:', language);
  };

  // 로그인 핸들러 - URL 완전 초기화
  const handleLogin = () => {
    if (typeof window === 'undefined') {
      console.warn('브라우저 환경이 아닙니다.');
      return;
    }
    
    try {
      // 현재 상품 페이지에 있다면 상품 ID 저장
      const currentHref = window.location.href;
      if (!currentHref) {
        throw new Error('현재 URL을 가져올 수 없습니다.');
      }

      const currentUrl = new URL(currentHref);
      const productId = currentUrl.searchParams.get('product');
      
      if (productId) {
        sessionStorage.setItem('returnToProduct', productId);
        console.log('상품 ID 저장됨:', productId);
      }
      
      // 로그인 페이지로 이동 - URL 완전 초기화
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const newUrl = new URL(baseUrl);
      
      // 로그인 view 설정
      newUrl.searchParams.set('view', 'login');
      
      const urlString = newUrl.toString();
      window.location.href = urlString;
      
    } catch (error) {
      console.error('로그인 페이지 이동 중 오류:', error);
      // 오류 발생 시 기본 로그인 페이지로 이동
      try {
        window.location.href = '/?view=login';
      } catch (fallbackError) {
        console.error('기본 페이지 이동도 실패:', fallbackError);
        window.location.reload();
      }
    }
  };

  // 장바구니 핸들러 - 로그인 확인 추가
  const handleCart = () => {
    console.log('장바구니 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => {
        console.log('로그인 페이지로 이동');
      },
      () => {
        console.log('장바구니 접근 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    if (typeof window === 'undefined') {
      console.warn('브라우저 환경이 아닙니다.');
      return;
    }
    
    try {
      // URL 완전 초기화
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const newUrl = new URL(baseUrl);
      
      // cart view 설정
      newUrl.searchParams.set('view', 'cart');
      
      const urlString = newUrl.toString();
      window.location.href = urlString;
      
    } catch (error) {
      console.error('장바구니 페이지 이동 중 오류:', error);
      try {
        window.location.href = '/?view=cart';
      } catch (fallbackError) {
        console.error('기본 장바구니 페이지 이동도 실패:', fallbackError);
        window.location.reload();
      }
    }
  };

  const handleProfile = () => {
    console.log('내 정보 페이지로 이동');
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // 로그아웃 핸들러 - URL 완전 초기화
  const handleLogout = () => {
    if (typeof window === 'undefined') {
      console.warn('브라우저 환경이 아닙니다.');
      return;
    }
    
    try {
      // 로컬 스토리지 정리
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('returnToProduct'); // 저장된 상품 정보도 삭제
      sessionStorage.removeItem('returnUrl'); // 저장된 리턴 URL도 삭제
      
      // 상태 초기화
      setIsUserLoggedIn(false);
      setUser(null);
      setIsProfileDropdownOpen(false);
      
      console.log('로그아웃 완료');
      
      // 홈으로 이동 - URL 완전 초기화
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const newUrl = new URL(baseUrl);
      
      const urlString = newUrl.toString();
      window.location.href = urlString;
      
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 오류 발생 시 강제로 홈으로 이동
      try {
        window.location.href = '/';
      } catch (fallbackError) {
        console.error('홈 페이지 이동도 실패:', fallbackError);
        window.location.reload();
      }
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
          {isUserLoggedIn && user ? (
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

          {/* 장바구니 버튼 - 로그인 확인 포함 */}
          <CartIcon onClick={handleCart} />
        </div>
      </div>
    </header>
  );
};

export default Header;