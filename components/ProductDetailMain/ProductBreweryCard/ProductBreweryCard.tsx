'use client';

import React, { useState } from 'react';
import type { Brewery } from '../../../types/brewery';
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
  const [imageStatuses, setImageStatuses] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

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

  const handleImageLoad = () => {
    setImageStatuses(prev => ({
      ...prev,
      [brewery.brewery_id]: 'loaded'
    }));
  };

  const handleImageError = () => {
    setImageStatuses(prev => ({
      ...prev,
      [brewery.brewery_id]: 'error'
    }));
  };

  const isValidImage = (imageKey?: string): boolean => {
    if (!imageKey || imageKey.trim() === '') return false;
    
    const invalidPatterns = [
      '/api/placeholder',
      'placeholder',
      'default',
      'data:image/svg+xml',
      'blob:',
      'example.com',
      'via.placeholder.com'
    ];
    
    return !invalidPatterns.some(pattern => 
      imageKey.toLowerCase().includes(pattern)
    );
  };

  const PlaceholderImage = () => (
    <div className="productdetail-brewery-placeholder-simple">
      <div className="productdetail-brewery-placeholder-icon-simple">🏭</div>
      <div className="productdetail-brewery-placeholder-text-simple">
        이미지 준비 중입니다
      </div>
    </div>
  );

  const renderBreweryImage = () => {
    const imageStatus = imageStatuses[brewery.brewery_id] || 'loading';
    const hasValidImage = isValidImage(brewery.image_key);
    
    return (
      <>
        {hasValidImage && imageStatus !== 'error' ? (
          <img 
            src={brewery.image_key} 
            alt={`${brewery.brewery_name} 양조장`}
            className="productdetail-brewery-image-simple"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{
              opacity: imageStatus === 'loaded' ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        ) : (
          <PlaceholderImage />
        )}
        
        {imageStatus === 'loading' && hasValidImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            zIndex: 1
          }}>
            <PlaceholderImage />
          </div>
        )}
        
        <div className="productdetail-brewery-overlay-simple">
          <span className="productdetail-brewery-overlay-text-simple">상세보기</span>
        </div>
      </>
    );
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
            {renderBreweryImage()}
          </div>

          <div className="productdetail-brewery-info-simple">
            <h3 className="productdetail-brewery-name-simple">{brewery.brewery_name}</h3>
            <button 
              className="productdetail-brewery-button-simple"
              onClick={(e) => {
                e.stopPropagation();
                handleBreweryClick();
              }}
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