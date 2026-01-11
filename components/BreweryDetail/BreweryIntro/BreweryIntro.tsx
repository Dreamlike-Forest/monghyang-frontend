'use client';

import React from 'react';
import type { Brewery } from '../../../types/brewery';
import './BreweryIntro.css';

interface BreweryIntroProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const BreweryIntro: React.FC<BreweryIntroProps> = ({ brewery, forwardRef }) => {
  // Brewery 타입에 없는 필드들을 안전하게 접근하기 위해 확장
  const breweryData = brewery as Brewery & {
    users_phone?: string;
    users_email?: string;
    brewery_website?: string;
  };

  return (
    <div ref={forwardRef} className="section-container" id="intro">
      <h2 className="section-title">양조장 소개</h2>
      <div className="brewery-intro-content">
        <div className="brewery-intro-description">
          <p>{brewery.brewery_introduction || '양조장 소개글이 준비 중입니다.'}</p>
        </div>
        
        <div className="brewery-intro-details">
          <div className="brewery-detail-grid">
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">주소</span>
              <span className="brewery-detail-value">
                {brewery.brewery_address} {brewery.brewery_address_detail}
              </span>
            </div>
            
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">주종</span>
              <span className="brewery-detail-value">
                {(brewery.tags_name || brewery.alcohol_types || []).join(', ')}
              </span>
            </div>
            
            {breweryData.users_phone && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">연락처</span>
                <span className="brewery-detail-value">{breweryData.users_phone}</span>
              </div>
            )}
            
            {breweryData.users_email && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">이메일</span>
                <span className="brewery-detail-value">{breweryData.users_email}</span>
              </div>
            )}
            
            {breweryData.brewery_website && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">홈페이지</span>
                <a 
                  href={breweryData.brewery_website} 
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