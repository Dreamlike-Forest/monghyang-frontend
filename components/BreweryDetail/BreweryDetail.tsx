'use client';

import { useState, useRef, useEffect } from 'react';
import BreweryNavigation from './BreweryNavigation/BreweryNavigation';
import BreweryHeader from './BreweryHeader/BreweryHeader';
import BreweryImageGallery from './BreweryImageGallery/BreweryImageGallery';
import BreweryIntro from './BreweryIntro/BreweryIntro';
import BreweryExperiencePrograms from './BreweryExperiencePrograms/BreweryExperiencePrograms';
import BreweryProductGrid from './BreweryProductGrid/BreweryProductGrid';
import BreweryReviewsSection from './BreweryReviewsSection/BreweryReviewsSection';
import type { Brewery, ProductWithDetails } from '../../types/mockData';
import { getBreweryDetail, getBreweryTags } from '../../utils/breweryUtils';
import './BreweryDetail.css';

interface BreweryDetailProps {
  breweryId: number; // brewery 객체 대신 breweryId를 받음
  initialBrewery?: Brewery; // 초기 데이터 (옵션)
  products?: ProductWithDetails[]; // 상품 데이터는 별도로 받음
}

const BreweryDetail: React.FC<BreweryDetailProps> = ({ 
  breweryId,
  initialBrewery,
  products = []
}) => {
  const [brewery, setBrewery] = useState<Brewery | null>(initialBrewery || null);
  const [isLoading, setIsLoading] = useState(!initialBrewery);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('images');
  
  // 스크롤 참조
  const imagesRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // 모든 ref들을 객체로 묶어서 전달
  const refs = {
    imagesRef,
    introRef,
    experienceRef,
    productsRef,
    reviewsRef
  };

  // 양조장 데이터 로드
  useEffect(() => {
    // 초기 데이터가 있으면 스킵
    if (initialBrewery) {
      console.log('✅ 초기 양조장 데이터 사용:', initialBrewery);
      return;
    }

    const loadBreweryData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 양조장 데이터 로딩 시작:', breweryId);
        
        // 1. 양조장 상세 정보 조회
        const breweryData = await getBreweryDetail(breweryId);
        console.log('✅ 양조장 상세 정보:', breweryData);
        
        // 2. 양조장 태그(주종) 조회
        const tags = await getBreweryTags(breweryId);
        console.log('✅ 양조장 태그:', tags);
        
        // 3. 태그 데이터를 alcohol_types로 변환하여 병합
        const breweryWithTags: Brewery = {
          ...breweryData,
          alcohol_types: tags.map(tag => tag.tags_name)
        };
        
        setBrewery(breweryWithTags);
        console.log('✅ 최종 양조장 데이터:', breweryWithTags);
        
      } catch (err) {
        console.error('❌ 양조장 데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '양조장 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBreweryData();
  }, [breweryId, initialBrewery]);

  // 컴포넌트 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const scrollTimer = window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => window.clearTimeout(scrollTimer);
  }, [breweryId]);

  // 스크롤 위치에 따른 활성 섹션 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const sections = [
        { id: 'images', ref: imagesRef },
        { id: 'intro', ref: introRef },
        { id: 'experience', ref: experienceRef },
        { id: 'products', ref: productsRef },
        { id: 'reviews', ref: reviewsRef }
      ];

      const scrollPosition = window.scrollY + 150;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setActiveSection('reviews');
        return;
      }

      let newActiveSection = 'images';

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.ref.current) {
          const sectionTop = section.ref.current.offsetTop;
          const sectionHeight = section.ref.current.offsetHeight;
          const sectionBottom = sectionTop + sectionHeight;
          const sectionCenter = sectionTop + sectionHeight / 2;
          
          if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionBottom - 50) {
            newActiveSection = section.id;
            break;
          }
          
          if (Math.abs(scrollPosition - sectionCenter) < sectionHeight / 3) {
            newActiveSection = section.id;
          }
        }
      }

      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
      }
    };

    // 브라우저 setTimeout 은 number 반환
    let timeoutId: number;

    const debouncedHandleScroll = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      window.clearTimeout(timeoutId);
    };
  }, [activeSection]);

  // 네비게이션 클릭 시 스크롤 이동
  const scrollToSection = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    setActiveSection(sectionId);
    
    const element = ref.current;
    if (element) {
      const headerHeight = 60;
      const navHeight = 60;
      const totalOffset = headerHeight + navHeight;
      
      const elementTop = element.offsetTop;
      const targetPosition = elementTop - totalOffset;
      
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  };

  const handleExperienceReservation = (experienceId: number) => {
    console.log('체험 예약:', experienceId);
  };

  const handleAddToCart = (productId: number) => {
    console.log('장바구니 추가:', productId);
  };

  const handleProductClick = (productId: number) => {
    console.log('상품 클릭:', productId, '- 상품 상세페이지로 이동');
    
    const url = new URL(window.location.href);
    url.searchParams.delete('brewery');
    url.searchParams.delete('view');
    url.searchParams.set('view', 'shop');
    url.searchParams.set('product', productId.toString());
    
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="brewery-detail-container">
        <div
          className="brewery-loading-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: '16px',
          }}
        >
          <div
            className="brewery-loading-spinner"
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #8b5a3c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <p style={{ color: '#666', fontSize: '16px' }}>양조장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !brewery) {
    return (
      <div className="brewery-detail-container">
        <div
          className="brewery-error-state"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="brewery-error-icon" style={{ fontSize: '64px', marginBottom: '16px' }}>
            ⚠️
          </div>
          <h2
            className="brewery-error-title"
            style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '8px' }}
          >
            {error || '양조장 정보를 찾을 수 없습니다'}
          </h2>
          <p className="brewery-error-message" style={{ color: '#666', marginBottom: '24px' }}>
            잠시 후 다시 시도해주세요.
          </p>
          <button
            className="brewery-error-button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8b5a3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 필수 필드 검증
  if (!brewery.brewery_id || !brewery.brewery_name) {
    return (
      <div className="brewery-detail-container">
        <div
          className="brewery-error-state"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="brewery-error-icon" style={{ fontSize: '64px', marginBottom: '16px' }}>
            ⚠️
          </div>
          <h2
            className="brewery-error-title"
            style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '8px' }}
          >
            양조장 정보가 올바르지 않습니다
          </h2>
          <p className="brewery-error-message" style={{ color: '#666', marginBottom: '24px' }}>
            필수 정보가 누락되었습니다. 잠시 후 다시 시도해주세요.
          </p>
          <button
            className="brewery-error-button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8b5a3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brewery-detail-container">
      <div className="brewery-detail-content">
        {/* 좌측 네비게이션 */}
        <BreweryNavigation
          activeSection={activeSection}
          onSectionClick={scrollToSection}
          refs={refs}
        />

        {/* 우측 메인 콘텐츠 */}
        <div className="brewery-main-section">
          {/* 양조장 헤더 */}
          <BreweryHeader brewery={brewery} />

          {/* 이미지 갤러리 */}
          <BreweryImageGallery brewery={brewery} forwardRef={imagesRef} />

          {/* 양조장 소개 */}
          <BreweryIntro brewery={brewery} forwardRef={introRef} />

          {/* 체험 프로그램 */}
          <BreweryExperiencePrograms
            brewery={brewery}
            forwardRef={experienceRef}
            onExperienceReservation={handleExperienceReservation}
          />

          {/* 판매 상품 */}
          <BreweryProductGrid
            products={products}
            forwardRef={productsRef}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
          />

          {/* 체험 리뷰 섹션 */}
          <div ref={reviewsRef} className="brewery-section-container" id="reviews">
            <h2 className="brewery-section-title">체험 리뷰</h2>
            <BreweryReviewsSection
              breweryName={brewery.brewery_name}
              breweryId={brewery.brewery_id}
              hideTitle={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreweryDetail;
