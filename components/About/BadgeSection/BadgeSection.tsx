'use client';

import React from 'react';
import './BadgeSection.css';

const BadgeSection = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className="about-section" id="badge">
      <div className="about-section-header">
        <h2 className="about-section-title">배지 시스템</h2>
        <div className="about-section-divider"></div>
      </div>
      
      <div className="about-badge-section">
        <div className="about-coming-soon">
          <div className="about-coming-soon-icon">🎖️</div>
          <h3>배지 시스템 준비 중</h3>
          <p>곧 다양한 배지와 업적 시스템이 추가될 예정입니다.</p>
        </div>
        
        <div className="about-badge-grid">
          <div className="about-badge-placeholder">
            <div className="about-badge-image-placeholder"></div>
            <div className="about-badge-info">
              <h4>배지 제목</h4>
              <p>배지 설명이 들어갈 자리입니다.</p>
            </div>
          </div>
          
          <div className="about-badge-placeholder">
            <div className="about-badge-image-placeholder"></div>
            <div className="about-badge-info">
              <h4>배지 제목</h4>
              <p>배지 설명이 들어갈 자리입니다.</p>
            </div>
          </div>
          
         
        </div>
      </div>
    </section>
  );
});

BadgeSection.displayName = 'BadgeSection';

export default BadgeSection;