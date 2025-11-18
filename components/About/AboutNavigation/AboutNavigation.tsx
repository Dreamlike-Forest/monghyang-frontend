'use client';

import React from 'react';
import './AboutNavigation.css';

interface AboutNavigationProps {
  activeSection: string;
  onSectionClick: (sectionId: string, ref: React.RefObject<HTMLDivElement>) => void;
  refs: {
    summaryRef: React.RefObject<HTMLDivElement>;
    badgeRef: React.RefObject<HTMLDivElement>;
    breweryRoleRef: React.RefObject<HTMLDivElement>;
    traditionRef: React.RefObject<HTMLDivElement>;
  };
}

const AboutNavigation: React.FC<AboutNavigationProps> = ({
  activeSection,
  onSectionClick,
  refs
}) => {
  const navigationItems = [
    {
      id: 'summary',
      icon: '📋',
      text: '서비스 소개',
      ref: refs.summaryRef
    },
    {
      id: 'badge',
      icon: '🎖️',
      text: '배지 소개',
      ref: refs.badgeRef
    },
    {
      id: 'brewery-role',
      icon: '🏭',
      text: '양조장의 역할',
      ref: refs.breweryRoleRef
    },
    {
      id: 'tradition',
      icon: '🍶',
      text: '전통주 정의',
      ref: refs.traditionRef
    }
  ];

  return (
    <div className="about-nav-section">
      <div className="about-navigation">
        <h3 className="about-nav-title">둘러보기</h3>
        <ul className="about-nav-menu">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button 
                className={`about-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionClick(item.id, item.ref)}
              >
                <span className="about-nav-icon">{item.icon}</span>
                <span className="about-nav-text">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutNavigation;