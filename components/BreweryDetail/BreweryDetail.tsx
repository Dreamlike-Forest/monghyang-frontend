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
  
  const imagesRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const refs = { imagesRef, introRef, experienceRef, productsRef, reviewsRef };

  useEffect(() => {
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
          const sectionCenter = sectionTop + (sectionHeight / 2);
          
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

    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [activeSection]);

  const scrollToSection = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    setActiveSection(sectionId);
    
    const element = ref.current;
    if (element) {
      const headerHeight = 60;
      const navHeight = 60;
      const totalOffset = headerHeight + navHeight;
      const elementTop = element.offsetTop;
      const targetPosition = elementTop - totalOffset;
      window.scrollTo(0, Math.max(0, targetPosition));
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

  return (
    <div className="brewery-detail-container">
      <div className="brewery-detail-content">
        <BreweryNavigation activeSection={activeSection} onSectionClick={scrollToSection} refs={refs} />
        <div className="brewery-main-section">
          <BreweryHeader brewery={brewery} />
          <BreweryImageGallery brewery={brewery} forwardRef={imagesRef} />
          <BreweryIntro brewery={brewery} forwardRef={introRef} />
          <BreweryExperiencePrograms 
            brewery={brewery} 
            forwardRef={experienceRef}
            onExperienceReservation={handleExperienceReservation}
          />
          <BreweryProductGrid 
            products={products} 
            forwardRef={productsRef}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick} 
          />
          <div ref={reviewsRef} className="brewery-section-container" id="reviews">
            <h2 className="brewery-section-title">체험 리뷰</h2>
            <BreweryReviewsSection breweryName={brewery.brewery_name} breweryId={brewery.id} hideTitle={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreweryDetail;