'use client';

import React from 'react';
import type { Brewery } from '../../../types/mockData';
import './BreweryIntro.css';

interface BreweryIntroProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const BreweryIntro: React.FC<BreweryIntroProps> = ({ brewery, forwardRef }) => {
  return (
    <div ref={forwardRef} className="section-container" id="intro">
      <h2 className="section-title">양조장 소개</h2>
      <div className="brewery-intro-content">
        <div className="brewery-intro-description">
          <p>{brewery.introduction || '양조장 소개글이 준비 중입니다.'}</p>
        </div>
        
        <div className="brewery-intro-details">
          <div className="brewery-detail-grid">
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">주소</span>
              <span className="brewery-detail-value">{brewery.brewery_address}</span>
            </div>
            
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">주종</span>
              <span className="brewery-detail-value">{brewery.alcohol_types.join(', ')}</span>
            </div>
            
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">연락처</span>
              <span className="brewery-detail-value">{brewery.business_phone}</span>
            </div>
            
            {brewery.business_email && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">이메일</span>
                <span className="brewery-detail-value">{brewery.business_email}</span>
              </div>
            )}
            
            {brewery.brewery_website && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">홈페이지</span>
                <a 
                  href={brewery.brewery_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="brewery-detail-link"
                >
                  바로가기 →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreweryIntro;