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
import './BreweryDetail.css';

interface BreweryDetailProps {
  brewery: Brewery;
  products?: ProductWithDetails[];
}

const BreweryDetail: React.FC<BreweryDetailProps> = ({ 
  brewery, 
  products = []
}) => {
  const [activeSection, setActiveSection] = useState<string>('images');
  
  // 🔥 데이터 검증 추가
  useEffect(() => {
    console.log('🍺 BreweryDetail - 받은 데이터:', brewery);
    
    if (!brewery) {
      console.error('❌ brewery 데이터가 없습니다!');
    } else {
      console.log('✅ brewery 데이터 확인:', {
        id: brewery.brewery_id,
        name: brewery.brewery_name,
        address: brewery.brewery_address,
        hasImages: brewery.brewery_images?.length || 0,
        hasExperiences: brewery.experience_programs?.length || 0,
        productCount: products.length
      });
    }
  }, [brewery, products]);
  
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

  // 🔥 brewery가 없으면 로딩 또는 에러 표시
  if (!brewery) {
    return (
      <div className="brewery-detail-container">
        <div className="brewery-loading-state">
          <div className="brewery-loading-spinner"></div>
          <p>양조장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 🔥 필수 필드 검증
  if (!brewery.brewery_id || !brewery.brewery_name) {
    return (
      <div className="brewery-detail-container">
        <div className="brewery-error-state">
          <div className="brewery-error-icon">⚠️</div>
          <h2 className="brewery-error-title">양조장 정보가 올바르지 않습니다</h2>
          <p className="brewery-error-message">
            필수 정보가 누락되었습니다. 잠시 후 다시 시도해주세요.
          </p>
          <button 
            className="brewery-error-button"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // *** 컴포넌트 마운트 시 스크롤을 최상단으로 이동 ***
  useEffect(() => {
    // 여러 방법으로 스크롤 초기화 (브라우저 호환성 보장)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // 약간의 지연을 두고 한 번 더 실행 (안전장치)
    const scrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(scrollTimer);
  }, [brewery.brewery_id]); // brewery_id가 변경될 때마다 실행

  // 스크롤 위치에 따른 활성 섹션 감지 - 개선된 로직
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'images', ref: imagesRef },
        { id: 'intro', ref: introRef },
        { id: 'experience', ref: experienceRef },
        { id: 'products', ref: productsRef },
        { id: 'reviews', ref: reviewsRef }
      ];

      // 현재 스크롤 위치 (네비게이션 높이 고려)
      const scrollPosition = window.scrollY + 150; // 네비게이션 높이만큼 오프셋 추가
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 페이지 하단 근처에 있을 때는 마지막 섹션을 활성화
      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setActiveSection('reviews');
        return;
      }

      // 각 섹션의 위치를 확인하여 가장 적절한 섹션 찾기
      let newActiveSection = 'images'; // 기본값

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.ref.current) {
          const sectionTop = section.ref.current.offsetTop;
          const sectionHeight = section.ref.current.offsetHeight;
          const sectionBottom = sectionTop + sectionHeight;

          // 현재 섹션이 화면에 50% 이상 보이는지 확인
          const sectionCenter = sectionTop + (sectionHeight / 2);
          
          if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionBottom - 50) {
            newActiveSection = section.id;
            break;
          }
          
          // 섹션의 중앙점이 화면 상단에서 일정 범위 내에 있는 경우
          if (Math.abs(scrollPosition - sectionCenter) < sectionHeight / 3) {
            newActiveSection = section.id;
          }
        }
      }

      // 활성 섹션이 변경된 경우에만 상태 업데이트
      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
      }
    };

    // 스크롤 이벤트 리스너 등록 (디바운스 적용)
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10); // 10ms 디바운스
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    // 초기 로드 시에도 실행
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [activeSection]); // activeSection을 dependency에 추가

  // 네비게이션 클릭 시 스크롤 이동 - 강제 즉시 이동
  const scrollToSection = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    // 즉시 활성 섹션 업데이트
    setActiveSection(sectionId);
    
    const element = ref.current;
    if (element) {
      const headerHeight = 60;
      const navHeight = 60;
      const totalOffset = headerHeight + navHeight;
      
      const elementTop = element.offsetTop;
      const targetPosition = elementTop - totalOffset;
      
      // 강제로 즉시 이동 (모든 옵션 제거)
      window.scrollTo(0, Math.max(0, targetPosition));
    }
  };

  const handleExperienceReservation = (experienceId: number) => {
    console.log('체험 예약:', experienceId);
    // TODO: 체험 예약 로직 구현
  };

  const handleAddToCart = (productId: number) => {
    console.log('장바구니 추가:', productId);
    // TODO: 장바구니 추가 로직 구현
  };

  // *** 수정된 상품 클릭 핸들러 - 상품 상세페이지로 직접 이동 ***
  const handleProductClick = (productId: number) => {
    console.log('상품 클릭:', productId, '- 상품 상세페이지로 이동');
    
    // 상품 상세페이지로 직접 이동하는 URL 생성
    const url = new URL(window.location.href);
    
    // 기존 파라미터 정리
    url.searchParams.delete('brewery');
    url.searchParams.delete('view');
    
    // 상품 상세페이지 파라미터 설정
    url.searchParams.set('view', 'shop');
    url.searchParams.set('product', productId.toString());
    
    // URL 업데이트 및 페이지 이동
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

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
          <BreweryImageGallery 
            brewery={brewery} 
            forwardRef={imagesRef} 
          />

          {/* 양조장 소개 */}
          <BreweryIntro 
            brewery={brewery} 
            forwardRef={introRef} 
          />

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

          {/* 체험 리뷰 섹션 - 제목 중복 제거 */}
          <div ref={reviewsRef} className="brewery-section-container" id="reviews">
            <h2 className="brewery-section-title">체험 리뷰</h2>
            <BreweryReviewsSection 
              breweryName={brewery.brewery_name} 
              breweryId={brewery.brewery_id}
              hideTitle={true}  // 제목 숨김으로 중복 방지
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreweryDetail;