'use client';

import { useState, useEffect } from 'react';
import './Nav.css';

const Nav: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const updateCurrentPage = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const view = url.searchParams.get('view');
        const brewery = url.searchParams.get('brewery');
        const product = url.searchParams.get('product');
        
        // [수정] order-history, cart, reservation-history는 메인 네비게이션에서 비활성화
        if (view === 'order-history' || view === 'cart' || view === 'reservation-history') {
          setCurrentPage('');
        } else if (product) {
          setCurrentPage('shop');
        } else if (brewery) {
          setCurrentPage('brewery');
        } else if (view) {
          setCurrentPage(view);
        } else {
          setCurrentPage('home');
        }
      }
    };

    updateCurrentPage();

    const handlePopState = () => updateCurrentPage();
    const handleLocationChange = () => updateCurrentPage();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('locationchange', handleLocationChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      window.dispatchEvent(new Event('locationchange'));
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const handleNavigation = (page: string) => {
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const newUrl = new URL(baseUrl);
      
      if (page !== 'home') {
        newUrl.searchParams.set('view', page);
      }
      
      window.location.href = newUrl.toString();
    }
  };

  const navItems = [
    { id: 'about', label: '우리 소개', description: '우리 서비스 소개' },
    { id: 'brewery', label: '양조장', description: '전국 양조장 찾기 및 체험프로그램 예약' },
    { id: 'shop', label: '전통주 쇼핑', description: '전통 주류 찾기 및 구매' },
    { id: 'community', label: '커뮤니티', description: '리뷰 게시판, 질문 게시판, 자유 게시판, 공지사항' }
  ];

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-logo">
          <button
            className="logo-button"
            onClick={() => handleNavigation('home')}
            aria-label="몽향 홈페이지로 이동"
          >
            <div className="logo-icon">
              <img src="/logo/monghyang-logo.png" alt="몽향 로고" className="logo-image" />
            </div>
          </button>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
                title={item.description}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;