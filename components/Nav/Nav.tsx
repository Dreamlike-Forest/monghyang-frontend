'use client';

import { useState, useEffect } from 'react';
import './Nav.css';

const Nav: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // URL 파라미터를 감지하여 현재 페이지 상태 업데이트
  useEffect(() => {
    const updateCurrentPage = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const view = url.searchParams.get('view');
        const brewery = url.searchParams.get('brewery');
        const product = url.searchParams.get('product');
        
        // 상품 상세페이지일 때는 shop으로 표시
        if (product) {
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

    // 초기 로드 시 페이지 설정
    updateCurrentPage();

    // URL 변경 감지를 위한 이벤트 리스너
    const handlePopState = () => {
      updateCurrentPage();
    };

    // pushState/replaceState 감지를 위한 커스텀 이벤트
    const handleLocationChange = () => {
      updateCurrentPage();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('locationchange', handleLocationChange);

    // pushState와 replaceState를 래핑하여 커스텀 이벤트 발생
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
      // 원래 함수들 복원
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const handleNavigation = (page: string) => {
    if (typeof window !== 'undefined') {
      // URL 완전 초기화 - 기존 파라미터 완전 제거
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const newUrl = new URL(baseUrl);
      
      // home이 아닌 경우에만 view 파라미터 설정
      if (page !== 'home') {
        newUrl.searchParams.set('view', page);
      }
      
      // 페이지 새로고침으로 이동 (기존 방식 유지)
      window.location.href = newUrl.toString();
    }
  };

  // navItems 배열에 cart는 포함하지 않음 (Header에서만 접근)
  const navItems = [
    {
      id: 'about',
      label: '우리 소개',
      description: '우리 서비스 소개'
    },
    {
      id: 'brewery',
      label: '양조장',
      description: '전국 양조장 찾기 및 체험프로그램 예약'
    },
    {
      id: 'shop',
      label: '전통주 쇼핑',
      description: '전통 주류 찾기 및 구매'
    },
    {
      id: 'community',
      label: '커뮤니티',
      description: '리뷰 게시판, 질문 게시판, 자유 게시판, 공지사항'
    }
  ];

  return (
    <nav className="nav">
      <div className="nav-container">
        {/* 로고 */}
        <div className="nav-logo">
          <button
            className="logo-button"
            onClick={() => handleNavigation('home')}
            aria-label="몽향 홈페이지로 이동"
          >
            <div className="logo-icon">
              <img 
                src="/logo/monghyang-logo.png" 
                alt="몽향 로고" 
                className="logo-image"
              />
            </div>
          </button>
        </div>

        {/* 메뉴 */}
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