'use client';

import React from 'react';
import './ServiceSummary.css';


interface ServiceSummaryProps {
  ref: React.RefObject<HTMLDivElement>;
}

const ServiceSummary = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className="about-section" id="summary">
      <div className="about-section-header">
        <h2 className="about-section-title">서비스 소개</h2>
        <div className="about-section-divider"></div>
      </div>
      
      <div className="about-service-summary">
        <div className="about-summary-intro">
          <h3>몽향과 함께하는 전통주 여행</h3>
          <p>
            몽향은 전통주 문화를 현대적으로 재해석하여, 누구나 쉽게 접근할 수 있는 
            전통주 통합 플랫폼입니다. 양조장 체험부터 전통주 구매, 커뮤니티 활동까지 
            모든 것을 한 곳에서 경험할 수 있습니다.
          </p>
        </div>
        
        <div className="about-service-features">
          <div className="about-feature-card">
            <div className="about-feature-icon">🏭</div>
            <h4>양조장 체험</h4>
            <p>전국의 다양한 양조장에서 제공하는 체험 프로그램을 발견하고 예약할 수 있습니다.</p>
          </div>
          
          <div className="about-feature-card">
            <div className="about-feature-icon">🛒</div>
            <h4>전통주 쇼핑</h4>
            <p>엄선된 전통주를 온라인으로 편리하게<br/> 구매할 수 있습니다.</p>
          </div>
          
          <div className="about-feature-card">
            <div className="about-feature-icon">👥</div>
            <h4>커뮤니티</h4>
            <p>전통주 애호가들과 경험을 공유하고 새로운 정보를<br/> 얻을 수 있습니다.</p>
          </div>
          
          <div className="about-feature-card">
            <div className="about-feature-icon">✅</div>
            <h4>품질 인증</h4>
            <p>엄격한 품질 검증을 통과한 신뢰할 수 있는 전통주만을 제공합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
});

ServiceSummary.displayName = 'ServiceSummary';

export default ServiceSummary;