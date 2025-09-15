'use client';

import { Factory, Wine, Users, ChevronRight } from 'lucide-react';
import './FeaturesSection.css';

interface FeaturesSectionProps {
  windowWidth: number;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ windowWidth }) => {
  const navigateToPage = (page: string) => {
    if (typeof window === 'undefined') return;
    
    // URL 완전 초기화 - 기존 파라미터 완전 제거
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    if (page !== 'home') {
      newUrl.searchParams.set('view', page);
    }
    
    window.location.href = newUrl.toString();
  };

  const features = [
    {
      icon: Factory,
      title: '양조장 체험',
      description: '전국의 다양한 양조장에서 제공하는 체험 프로그램을 발견하고 예약할 수 있습니다.',
      buttonText: '체험하러 가기',
      onClick: () => navigateToPage('brewery')
    },
    {
      icon: Wine,
      title: '전통주 쇼핑',
      description: '엄선된 전통주를 온라인으로 편리하게 구매할 수 있습니다.',
      buttonText: '쇼핑하러 가기',
      onClick: () => navigateToPage('shop')
    },
    {
      icon: Users,
      title: '커뮤니티',
      description: '전통주 애호가들과 경험을 공유하고 새로운 정보를 얻을 수 있습니다.',
      buttonText: '참여하기',
      onClick: () => navigateToPage('community')
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            몽향과 함께하는 전통주 여행
          </h2>
          <p className="features-subtitle">
            전통주 문화를 현대적으로 재해석하여, 누구나 쉽게 접근할 수 있는 플랫폼을 제공합니다.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="features-card"
                onClick={feature.onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    feature.onClick();
                  }
                }}
              >
                <div className="features-icon-wrapper">
                  <IconComponent size={36} color="white" />
                </div>
                <h3 className="features-title-card">
                  {feature.title}
                </h3>
                <p className="features-description">
                  {feature.description}
                </p>
                <div className="features-button">
                  {feature.buttonText}
                  <ChevronRight size={20} className="features-button-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;