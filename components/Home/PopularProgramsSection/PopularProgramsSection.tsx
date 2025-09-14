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
    
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('search');
    url.searchParams.delete('searchType');
    
    if (page !== 'home') {
      url.searchParams.set('view', page);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    window.location.href = url.toString();
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
      <div className="programs-container">
        <div className="programs-header">
          <div className="programs-header-content">
            <h2>인기 체험 프로그램</h2>
            <p>다른 사람들이 많이 선택한 체험 프로그램을 만나보세요</p>
          </div>
          <button
            className="view-all-button"
            onClick={handleViewAllPrograms}
          >
            전체 보기
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="programs-grid">
          {popularPrograms.map(program => (
            <div
              key={program.id}
              className="program-card"
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
              <div className="program-rating">
                <div className="rating-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(program.rating) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="rating-score">
                  {program.rating}
                </span>
              </div>

              <h3 className="program-title">
                {program.title}
              </h3>

              <p className="program-description">
                {program.description}
              </p>

              <div className="program-footer">
                <span className="program-price">
                  {program.price}
                </span>
                <div className="program-location">
                  <Calendar size={14} className="location-icon" />
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