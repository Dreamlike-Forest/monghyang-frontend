'use client';

import { Star, Calendar, ChevronRight } from 'lucide-react';
import './PopularProgramsSection.css';

interface Program {
  id: number;
  title: string;
  description: string;
  price: string;
  rating: number;
  location: string;
}

interface PopularProgramsSectionProps {
  windowWidth: number;
}

const PopularProgramsSection: React.FC<PopularProgramsSectionProps> = ({ windowWidth }) => {
  const popularPrograms: Program[] = [
    {
      id: 1,
      title: '전통주 소믈리에 클래스',
      description: '다양한 전통주 테이스팅 노하우를 배워보세요',
      price: '50,000원/인',
      rating: 4.7,
      location: '예약하기'
    },
    {
      id: 2,
      title: '전통 발효 식초 만들기',
      description: '전통주로 시작하는 건강한 발효 식초 만들기',
      price: '40,000원/인',
      rating: 4.5,
      location: '예약하기'
    },
    {
      id: 3,
      title: '양조장 투어 & 시음회',
      description: '양조장을 둘러보고 5종류의 전통주를 시음해보요',
      price: '25,000원/인',
      rating: 4.4,
      location: '예약하기'
    }
  ];

  const navigateToPage = (page: string, params?: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    
    // URL 완전 초기화 - 기존 파라미터 완전 제거
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    if (page !== 'home') {
      newUrl.searchParams.set('view', page);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
    }
    
    window.location.href = newUrl.toString();
  };

  const handleProgramClick = (programId: number) => {
    const breweryIdMap: { [key: number]: number } = {
      1: 1,
      2: 2,
      3: 3
    };
    const breweryId = breweryIdMap[programId] || 1;
    navigateToPage('brewery', { brewery: breweryId.toString() });
  };

  const handleViewAllPrograms = () => {
    navigateToPage('brewery');
  };

  return (
    <section className="popular-programs-section">
      <div className="popular-programs-container">
        <div className="popular-programs-header">
          <div className="popular-programs-header-content">
            <h2>인기 체험 프로그램</h2>
            <p>다른 사람들이 많이 선택한 체험 프로그램을 만나보세요</p>
          </div>
          <button
            className="popular-programs-view-all-button"
            onClick={handleViewAllPrograms}
          >
            전체 보기
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="popular-programs-grid">
          {popularPrograms.map(program => (
            <div
              key={program.id}
              className="popular-programs-card"
              onClick={() => handleProgramClick(program.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProgramClick(program.id);
                }
              }}
            >
              <div className="popular-programs-rating">
                <div className="popular-programs-rating-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(program.rating) ? 'popular-programs-star-filled' : 'popular-programs-star-empty'}
                    />
                  ))}
                </div>
                <span className="popular-programs-rating-score">
                  {program.rating}
                </span>
              </div>

              <h3 className="popular-programs-title">
                {program.title}
              </h3>

              <p className="popular-programs-description">
                {program.description}
              </p>

              <div className="popular-programs-footer">
                <span className="popular-programs-price">
                  {program.price}
                </span>
                <div className="popular-programs-location">
                  <Calendar size={14} className="popular-programs-location-icon" />
                  {program.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProgramsSection;