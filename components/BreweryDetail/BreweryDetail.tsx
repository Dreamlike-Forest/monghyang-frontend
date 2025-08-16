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

  // 스크롤 위치에 따른 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'images', ref: imagesRef },
        { id: 'intro', ref: introRef },
        { id: 'experience', ref: experienceRef },
        { id: 'products', ref: productsRef },
        { id: 'reviews', ref: reviewsRef }
      ];

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const sectionTop = section.ref.current.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    setActiveSection(sectionId);
    const element = ref.current;
    if (element) {
      const offsetTop = element.offsetTop - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
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

  // 상품 클릭 시 Shop 페이지로 이동 - props 의존성 제거
  const handleProductClick = (productId: number) => {
    console.log('상품 클릭:', productId, '- Shop 페이지로 이동');
    
    // 직접 URL 변경으로 Shop 페이지 이동
    updateURLToShop(productId);
  };

  // URL을 통한 Shop 페이지 이동
  const updateURLToShop = (productId?: number) => {
    const currentURL = new URL(window.location.href);
    
    // 기존 파라미터 정리
    currentURL.searchParams.delete('brewery');
    currentURL.searchParams.delete('view');
    
    // Shop 페이지로 이동
    currentURL.searchParams.set('view', 'shop');
    
    // 특정 상품이 있으면 검색 키워드로 설정 (선택사항)
    if (productId) {
      const product = products.find(p => p.product_id === productId);
      if (product) {
        currentURL.searchParams.set('search', product.name);
      }
    }
    
    // URL 업데이트 및 페이지 이동
    window.history.pushState({}, '', currentURL.toString());
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