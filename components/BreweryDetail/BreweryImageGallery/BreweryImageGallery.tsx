'use client';

import React, { useState } from 'react';
import { Brewery } from '../../../types/mockData';
import './BreweryImageGallery.css';

interface BreweryImageGalleryProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const BreweryImageGallery: React.FC<BreweryImageGalleryProps> = ({ brewery, forwardRef }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // brewery_images 배열에서 실제 이미지들을 가져오는 함수
  const getBreweryImages = (): string[] => {
    const images: string[] = [];
    
    // 1. brewery.brewery_images 배열이 있으면 우선 사용
    if (brewery.brewery_images && brewery.brewery_images.length > 0) {
      images.push(...brewery.brewery_images);
    }
    
    // 2. 메인 이미지(image_url)가 있고 아직 추가되지 않았으면 첫 번째로 추가
    if (brewery.image_url && !images.includes(brewery.image_url)) {
      images.unshift(brewery.image_url); // 첫 번째 위치에 추가
    }
    
    // 3. 이미지가 여전히 없을 경우 기존 로직 사용 (기본 이미지들)
    if (images.length === 0) {
      const defaultImages = [
        brewery.image_url,
        '/images/brewery-main-2.jpg',
        '/images/brewery-interior.jpg', 
        '/images/brewery-equipment.jpg',
        '/images/brewery-exterior.jpg',
        '/images/brewery-gallery-1.jpg',
        '/images/brewery-gallery-2.jpg'
      ];
      images.push(...defaultImages);
    }
    
    return images;
  };

  // 유효한 이미지만 필터링하는 함수 (기존 로직 유지)
  const filterValidImages = (images: string[]): string[] => {
    return images.filter(img => 
      img && 
      img.trim() !== '' &&
      !img.includes('/api/placeholder') && 
      img !== '' &&
      img !== '/images/brewery-placeholder.jpg' &&
      img !== '/images/brewery-default.jpg' &&
      !img.includes('default') &&
      !img.includes('placeholder')
    );
  };

  const breweryImages = getBreweryImages();
  const validImages = filterValidImages(breweryImages);
  
  // 최대 5개까지만 표시 (기존 로직 유지)
  const displayImages = validImages.slice(0, 5);
  const hasImages = displayImages.length > 0;
  
  // 이미지 로드 실패 상태 관리
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  
  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  };
  
  // 현재 이미지가 로드 실패했는지 확인
  const currentImageFailed = imageLoadErrors.has(currentImageIndex);
  const allImagesFailed = hasImages && displayImages.every((_, index) => imageLoadErrors.has(index));

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  // 새로 추가: 특정 이미지로 직접 이동하는 함수
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div ref={forwardRef} className="section-container" id="images">
      <div className="brewery-main-image-container">
        {hasImages ? (
          <>
            {!currentImageFailed ? (
              <img 
                src={displayImages[currentImageIndex] || displayImages[0]} 
                alt={`${brewery.brewery_name} 사진 ${currentImageIndex + 1}`}
                className="brewery-main-image"
                onError={() => handleImageError(currentImageIndex)}
              />
            ) : (
              <div className="brewery-image-placeholder">
                <div className="brewery-gallery-placeholder-icon">📷</div>
                <div className="brewery-gallery-placeholder-text">
                  이미지를 준비중입니다.
                </div>
              </div>
            )}
            
            {/* 이전/다음 버튼 - 이미지가 있고 2개 이상일 때만 표시 */}
            {displayImages.length > 1 && (
              <>
                <button 
                  className="brewery-image-nav-btn brewery-prev-btn"
                  onClick={prevImage}
                  aria-label="이전 이미지"
                  type="button"
                >
                  ‹
                </button>
                <button 
                  className="brewery-image-nav-btn brewery-next-btn"
                  onClick={nextImage}
                  aria-label="다음 이미지"
                  type="button"
                >
                  ›
                </button>
              </>
            )}
            
            {/* 이미지 인디케이터 - 이미지가 있고 2개 이상일 때만 표시 */}
            {displayImages.length > 1 && (
              <div className="brewery-image-indicators">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    className={`brewery-indicator ${index === currentImageIndex ? 'active' : ''} ${imageLoadErrors.has(index) ? 'error' : ''}`}
                    onClick={() => goToImage(index)}
                    aria-label={`${index + 1}번째 이미지로 이동`}
                    type="button"
                    disabled={imageLoadErrors.has(index)}
                  />
                ))}
              </div>
            )}
            
            {/* 이미지 카운터 - 이미지가 있고 2개 이상일 때만 표시 */}
            {displayImages.length > 1 && (
              <div className="brewery-image-counter">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}
          </>
        ) : (
          /* 이미지가 없을 때는 버튼과 인디케이터 없이 placeholder만 표시 */
          <div className="brewery-image-placeholder">
            <div className="brewery-gallery-placeholder-icon">📷</div>
            <div className="brewery-gallery-placeholder-text">
              이미지 준비 중<br />
              <small>양조장 사진을 업로드해주세요</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreweryImageGallery;