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
      { label: '몽항 소개', href: '/about' },
      { label: '이용 안내', href: '/guide' },
      { label: '공지사항', href: '/notices' }
    ]
  },
  {
    title: '고객 지원',
    items: [
      { label: '자주 묻는 질문', href: '/faq' },
      { label: '1:1 문의', href: '/inquiry' },
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' }
    ]
  }
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    href: '',
    iconSrc: '/icons/instagram_icon.svg',
    className: 'instagram'
  },
  {
    name: 'Facebook',
    href: '',
    iconSrc: '/icons/facebook_icon.svg',
    className: 'facebook'
  },
  {
    name: 'YouTube',
    href: '',
    iconSrc: '/icons/youtube_icon.svg',
    className: 'youtube'
  },
  {
    name: 'Twitter',
    href: '', 
    iconSrc: '/icons/twitter_icon.svg',
    className: 'twitter'
  }
];

const COMPANY_INFO: CompanyInfo = {
  name: '(주)몽항',
  ceo: '최재현',
  businessNumber: '123-45-67890',
  address: '부산광역시 수제로 47, 동서대학교',
  email: '1234@5678.com',
  phone: '02-123-4567',
  copyright: '2025 Monghyang Inc. All rights reserved.'
};

// 서브 컴포넌트들
const MenuSection: React.FC<{ section: MenuSection }> = ({ section }) => (
  <div className="footer-section">
    <h3 className="footer-section-title">{section.title}</h3>
    <ul className="footer-menu-list">
      {section.items.map((item) => (
        <li key={item.href}>
          <a href={item.href} className="footer-menu-link">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const SocialMediaSection: React.FC = () => (
  <div className="footer-section">
    <h3 className="footer-section-title">소셜 미디어</h3>
    <div className="footer-social-links">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`footer-social-link ${social.className}`}
          aria-label={social.name}
        >
          <img 
            src={social.iconSrc} 
            alt={`${social.name} 아이콘`}
            className="footer-social-icon"
          />
        </a>
      ))}
    </div>
  </div>
);

const CompanyInfoSection: React.FC = () => (
  <div className="footer-company-info">
    <div className="footer-company-details">
      <span>{COMPANY_INFO.name}</span>
      <span>대표: {COMPANY_INFO.ceo}</span>
      <span>사업자등록번호: {COMPANY_INFO.businessNumber}</span>
    </div>
    <div className="footer-address">
      {COMPANY_INFO.address}
    </div>
    <div className="footer-contact">
      <span>이메일: {COMPANY_INFO.email}</span>
      <span>전화: {COMPANY_INFO.phone}</span>
    </div>
  </div>
);

// 메인 Footer 컴포넌트
const Footer: React.FC = () => {
  const handleAdminClick = () => {
    console.log('현재 관리자 페이지를 준비중입니다.');
    alert('현재 관리자 페이지를 준비중입니다.');
  };
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 상단 콘텐츠 영역 */}
        <div className="footer-content">
          {/* 로고 영역 */}
          <div className="footer-logo-section">
            <div className="footer-logo">
              <img 
                src="/logo/monghyang-logo.png" 
                alt="몽항 로고" 
                className="footer-logo-image"
              />
            </div>
          </div>

          {/* 메뉴 섹션들 */}
          <div className="footer-sections">
            {MENU_SECTIONS.map((section) => (
              <MenuSection key={section.title} section={section} />
            ))}
            <SocialMediaSection />
          </div>
        </div>

        {/* 하단 회사 정보 영역 */}
        <div className="footer-bottom">
          <CompanyInfoSection />
          <div className="footer-copyright">
            © {COMPANY_INFO.copyright}
          </div>
        </div>

        {/* 숨겨진 관리자 영역 */}
        <div 
          className="footer-admin-area"
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