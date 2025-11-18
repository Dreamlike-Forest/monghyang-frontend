'use client';

import React from 'react';
import './BreweryNavigation.css';

interface BreweryNavigationProps {
  activeSection: string;
  onSectionClick: (sectionId: string, ref: React.RefObject<HTMLDivElement>) => void;
  refs: {
    imagesRef: React.RefObject<HTMLDivElement>;
    introRef: React.RefObject<HTMLDivElement>;
    experienceRef: React.RefObject<HTMLDivElement>;
    productsRef: React.RefObject<HTMLDivElement>;
    reviewsRef: React.RefObject<HTMLDivElement>;
  };
}

const BreweryNavigation: React.FC<BreweryNavigationProps> = ({
  activeSection,
  onSectionClick,
  refs
}) => {
  const navigationItems = [
    {
      id: 'images',
      icon: '📸',
      text: '양조장 사진',
      ref: refs.imagesRef
    },
    {
      id: 'intro',
      icon: 'ℹ️',
      text: '양조장 소개',
      ref: refs.introRef
    },
    {
      id: 'experience',
      icon: '🎯',
      text: '체험 프로그램',
      ref: refs.experienceRef
    },
    {
      id: 'products',
      icon: '🍶',
      text: '판매 상품',
      ref: refs.productsRef
    },
    {
      id: 'reviews',
      icon: '⭐',
      text: '체험 리뷰',
      ref: refs.reviewsRef
    }
  ];

  return (
    <div className="brewery-nav-section">
      <div className="brewery-navigation">
        <h3 className="brewery-nav-title">둘러보기</h3>
        <ul className="brewery-nav-menu">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button 
                className={`brewery-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionClick(item.id, item.ref)}
              >
                <span className="brewery-nav-icon">{item.icon}</span>
                <span className="brewery-nav-text">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BreweryNavigation;