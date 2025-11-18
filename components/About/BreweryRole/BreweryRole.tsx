'use client';

import React from 'react';
import './BreweryRole.css';

const BreweryRole = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className="about-section" id="brewery-role">
      <div className="about-section-header">
        <h2 className="about-section-title">양조장의 역할</h2>
        <div className="about-section-divider"></div>
      </div>
      
      <div className="about-brewery-role-content">
        <div className="about-role-intro">
          <p>
            양조장은 단순히 술을 만드는 곳을 넘어서, 우리나라 전통문화의 
            보고이자 지역 공동체의<br/> 중심지 역할을 하고 있습니다.
          </p>
        </div>
        
        <div className="about-role-grid">
          <div className="about-role-item">
            <div className="about-role-icon">🏺</div>
            <h4>전통 계승</h4>
            <p>조상들로부터 전해진 양조 기법과 전통을 보존하고 계승합니다.</p>
          </div>
          
          <div className="about-role-item">
            <div className="about-role-icon">🌱</div>
            <h4>지역 발전</h4>
            <p>지역 농산물을 활용하여 지역 경제 활성화에 기여합니다.</p>
          </div>
          
          <div className="about-role-item">
            <div className="about-role-icon">👨‍🏫</div>
            <h4>문화 교육</h4>
            <p>체험 프로그램을 통해 전통주 문화를 널리 알립니다.</p>
          </div>
          
          <div className="about-role-item">
            <div className="about-role-icon">🔬</div>
            <h4>기술 혁신</h4>
            <p>전통과 현대 기술을 융합하여 새로운 가치를 창출합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
});

BreweryRole.displayName = 'BreweryRole';

export default BreweryRole;