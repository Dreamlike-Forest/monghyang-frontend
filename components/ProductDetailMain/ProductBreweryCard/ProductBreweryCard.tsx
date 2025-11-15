'use client';

import React from 'react';
import { Brewery } from '../../../types/mockData';
import OptimizedImage from '../../OptimizedImage/OptimizedImage';
import './ProductBreweryCard.css';

interface ProductBreweryCardProps {
  brewery?: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
  onBreweryClick?: (breweryId: number) => void;
}

const ProductBreweryCard: React.FC<ProductBreweryCardProps> = ({ 
  brewery, 
  forwardRef,
  onBreweryClick
}) => {
  // 실제 양조장 데이터만 사용 (단일 brewery만 처리)
  if (!brewery) {
    return (
      <div ref={forwardRef} className="productdetail-product-section-container" id="productdetail-brewery">
        <h2 className="productdetail-product-section-title">양조장</h2>
        <div className="productdetail-brewery-grid-container">
          <div className="productdetail-brewery-empty-simple">
            <div className="productdetail-brewery-empty-icon-simple">🏭</div>
            <p className="productdetail-brewery-empty-text-simple">양조장 정보를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBreweryClick = () => {
    if (onBreweryClick) {
      onBreweryClick(brewery.brewery_id);
    } else {
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  const navigateToBreweryDetail = (breweryId: number) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.delete('view');
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  return (
    <div ref={forwardRef} className="productdetail-brewery-section-container" id="productdetail-brewery">
      <h2 className="productdetail-product-section-title">양조장</h2>
      
      <div className="productdetail-brewery-grid-container">
        <div 
          className="productdetail-brewery-card-simple" 
          onClick={handleBreweryClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBreweryClick();
            }
          }}
          aria-label={`${brewery.brewery_name} 양조장 상세 정보 보기`}
        >
          <div className="productdetail-brewery-image-section-simple">
            {/* OptimizedImage 컴포넌트 사용 - 기존 복잡한 이미지 로직 모두 제거 */}
            <OptimizedImage
              src={brewery.image_key}
              alt={`${brewery.brewery_name} 양조장`}
              placeholderType="brewery"
              className="productdetail-brewery-image-simple"
            />
            
            {/* 호버 오버레이는 항상 렌더링 */}
            <div className="productdetail-brewery-overlay-simple">
              <span className="productdetail-brewery-overlay-text-simple">상세보기</span>
            </div>
          </div>

          <div className="productdetail-brewery-info-simple">
            <h3 className="productdetail-brewery-name-simple">{brewery.brewery_name}</h3>
            <button 
              className="productdetail-brewery-button-simple"
              onClick={(e) => {
                e.stopPropagation();
                handleBreweryClick();
              }}
              aria-label={`${brewery.brewery_name} 상세 정보 보기`}
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBreweryCard;