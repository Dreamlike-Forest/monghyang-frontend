'use client';

import { useState, useEffect } from 'react';
import './Nav.css';

const Nav: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // URL 파라미터를 감지하여 현재 페이지 상태 업데이트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const view = url.searchParams.get('view');
      const brewery = url.searchParams.get('brewery');
      
      if (brewery) {
        setCurrentPage('brewery');
      } else if (view) {
        setCurrentPage(view);
      } else {
        setCurrentPage('home');
      }
    }
  }, []);

  const handleNavigation = (page: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      
      if (page !== 'home') {
        url.searchParams.set('view', page);
      }
      
      window.location.href = url.toString();
    }
  };

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