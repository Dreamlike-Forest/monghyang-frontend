'use client';

import React from 'react';
import './Footer.css';

// 타입 정의
interface MenuItem {
  label: string;
  href: string; 
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SocialLink {
  name: string;
  href: string;
  iconSrc: string;
  className: string; 
}

interface CompanyInfo {
  name: string;
  ceo: string;
  businessNumber: string;
  address: string;
  email: string;
  phone: string;
  copyright: string;
}

// 상수 데이터
const MENU_SECTIONS: MenuSection[] = [
  {
    title: '서비스 소개',
    items: [
      { label: '몽향 소개', href: 'about' },
      { label: '이용 안내', href: 'guide' },
      { label: '공지사항', href: 'notice' }
    ]
  },
  {
    title: '고객 지원',
    items: [
      { label: '자주 묻는 질문', href: 'faq' },
      { label: '1:1 문의', href: 'inquiry' },
      { label: '개인정보처리방침', href: 'privacy' }
    ]
  }
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    href: '',
    iconSrc: '/icons/instagram_icon.svg',
    className: 'footer-icon-instagram'
  },
  {
    name: 'YouTube',
    href: '',
    iconSrc: '/icons/youtube_icon.svg',
    className: 'footer-icon-youtube'
  },
  {
    name: 'KakaoTalk',
    href: '',
    iconSrc: '/icons/kakao_icon.svg',
    className: 'footer-icon-kakao'
  }
];

const COMPANY_INFO: CompanyInfo = {
  name: '주식회사 몽향',
  ceo: '홍길동',
  businessNumber: '123-45-67890',
  address: '서울특별시 강남구 테헤란로 123 몽향빌딩 4층',
  email: 'contact@monghyang.com',
  phone: '02-1234-5678',
  copyright: '2024 Monghyang. All rights reserved.'
};

const Footer: React.FC = () => {
  const handleNavigation = (view: string, subView?: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      url.searchParams.delete('product');
      url.searchParams.delete('tab'); 
      url.searchParams.delete('category'); 

      url.searchParams.set('view', view);
      
      if (view === 'community' && subView === 'notice') {
        url.searchParams.set('category', 'notice');
      }

      window.location.href = url.toString();
    }
  };

  const handleAdminClick = () => {
    const isAdmin = confirm('관리자 페이지로 이동하시겠습니까?');
    if (isAdmin) {
      window.location.href = '/admin';
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    switch (item.label) {
      case '몽향 소개':
        handleNavigation('about');
        break;
      case '이용 안내':
        handleNavigation('guide');
        break;
      case '공지사항':
        handleNavigation('community', 'notice');
        break;
      case '자주 묻는 질문':
        handleNavigation('faq');
        break;
      case '1:1 문의':
        handleNavigation('qna');
        break;
      // [수정됨] 개인정보처리방침 연결
      case '개인정보처리방침':
        handleNavigation('privacy');
        break;
      default:
        alert('준비 중인 페이지입니다.');
        break;
    }
  };

  return (
    <footer className="footer-root">
      <div className="footer-inner-container">
        <div className="footer-top-content">
          <div className="footer-logo-wrapper">
            <div className="footer-logo-box">
              <img 
                src="/logo/monghyang-logo.png" 
                alt="몽향 로고" 
                className="footer-logo-img"
              />
            </div>
          </div>

          <div className="footer-menu-groups">
            {MENU_SECTIONS.map((section) => (
              <div key={section.title} className="footer-menu-group">
                <h3 className="footer-menu-title">{section.title}</h3>
                <ul className="footer-menu-list">
                  {section.items.map((item) => (
                    <li key={item.label} className="footer-menu-item">
                      <button 
                        className="footer-menu-link"
                        onClick={() => handleMenuClick(item)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="footer-menu-group">
              <h3 className="footer-menu-title">소셜 미디어</h3>
              <div className="footer-social-wrapper">
                {SOCIAL_LINKS.map((social) => (
                  <a 
                    key={social.name}
                    href={social.href}
                    className={`footer-social-link ${social.className}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} 바로가기`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <img src={social.iconSrc} alt="" className="footer-social-icon" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-info">
          <div className="footer-info-details">
            <div className="footer-biz-info">
              <span>{COMPANY_INFO.name}</span>
              <span>대표이사: {COMPANY_INFO.ceo}</span>
              <span>사업자등록번호: {COMPANY_INFO.businessNumber}</span>
            </div>
            <div className="footer-address-text">
              주소: {COMPANY_INFO.address}
            </div>
            <div className="footer-contact-info">
              <span>이메일: {COMPANY_INFO.email}</span>
              <span>전화: {COMPANY_INFO.phone}</span>
            </div>
          </div>
          <div className="footer-copyright-text">
            © {COMPANY_INFO.copyright}
          </div>
        </div>

        <div 
          className="footer-admin-trigger"
          onClick={handleAdminClick}
          title="관리자 영역"
        >
          관리자
        </div>
      </div>
    </footer>
  );
};

export default Footer;