'use client';

import React from 'react';
import './TraditionDefinition.css';

const TraditionDefinition = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className="about-section" id="tradition">
      <div className="about-section-header">
        <h2 className="about-section-title">전통주란?</h2>
        <div className="about-section-divider"></div>
      </div>
      
      <div className="about-tradition-content">
        <div className="about-tradition-definition">
          <h3>전통주의 의미</h3>
          <p>
            전통주는 우리나라 고유의 양조 기법으로 만든 술로, 
            쌀, 보리, 밀 등의 곡물을 주원료로 하여 누룩과 함께 발효시켜 만든 
            우리나라 고유의 발효주입니다.
          </p>
        </div>
        
        <div className="about-tradition-types">
          <h4>전통주의 종류</h4>
          <div className="about-types-grid">
            <div className="about-type-card">
              <h5>탁주 (막걸리)</h5>
              <p>곡물을 발효시켜 거르지 않은 상태의 술로, 우유빛 색깔이 특징입니다.</p>
            </div>
            
            <div className="about-type-card">
              <h5>청주</h5>
              <p>탁주를 맑게 거른 술로, 투명하고 깔끔한 맛이 특징입니다.</p>
            </div>
            
            <div className="about-type-card">
              <h5>증류식 소주</h5>
              <p>발효주를 증류하여 만든 술로, 높은 알코올 도수를 가집니다.</p>
            </div>
            
            <div className="about-type-card">
              <h5>과실주</h5>
              <p>과일을 주원료로 하여 발효시킨 술로, 달콤한 맛이 특징입니다.</p>
            </div>
          </div>
        </div>
        
        <div className="about-tradition-value">
          <h4>전통주의 가치</h4>
          <div className="about-value-list">
            <div className="about-value-item">
              <span className="about-value-icon">🏛️</span>
              <div>
                <strong>문화적 가치</strong>
                <p>우리 조상들의 지혜와 문화가 담긴 소중한 문화유산</p>
              </div>
            </div>
            
            <div className="about-value-item">
              <span className="about-value-icon">🌾</span>
              <div>
                <strong>경제적 가치</strong>
                <p>지역 농업과 관광산업 발전에 기여하는 경제적 자원</p>
              </div>
            </div>
            
            <div className="about-value-item">
              <span className="about-value-icon">💚</span>
              <div>
                <strong>건강적 가치</strong>
                <p>자연 발효 과정을 통한 유익한 성분과 풍부한 영양소</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

TraditionDefinition.displayName = 'TraditionDefinition';

export default TraditionDefinition;