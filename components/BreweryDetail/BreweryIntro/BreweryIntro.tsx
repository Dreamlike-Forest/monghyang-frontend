'use client';

import React from 'react';
import type { Brewery } from '../../../types/shop';
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
          {/* introduction -> brewery_introduction */}
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
                {/* alcohol_types -> tags_name (API 데이터 우선, 없으면 alcohol_types 사용) */}
                {(brewery.tags_name || brewery.alcohol_types || []).join(', ')}
              </span>
            </div>
            
            <div className="brewery-detail-item">
              <span className="brewery-detail-label">연락처</span>
              {/* business_phone -> users_phone (여기가 오류 났던 부분) */}
              <span className="brewery-detail-value">{brewery.users_phone}</span>
            </div>
            
            {/* business_email -> users_email */}
            {brewery.users_email && (
              <div className="brewery-detail-item">
                <span className="brewery-detail-label">이메일</span>
                <span className="brewery-detail-value">{brewery.users_email}</span>
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