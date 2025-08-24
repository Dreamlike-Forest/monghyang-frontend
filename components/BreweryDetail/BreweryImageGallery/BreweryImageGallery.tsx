'use client';

import React, { useState, useEffect } from 'react';
import { Brewery } from '../../../types/mockData';
import './BreweryImageGallery.css';

interface BreweryImageGalleryProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const BreweryImageGallery: React.FC<BreweryImageGalleryProps> = ({ brewery, forwardRef }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  // image_key를 실제 이미지 URL로 변환하는 함수
  const getImageUrl = (imageKey: string | undefined): string => {
    if (!imageKey) return '';
    
    // 이미지 키가 이미 전체 URL인 경우
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://') || imageKey.startsWith('/')) {
      return imageKey;
    }
    
    // 이미지 키를 기반으로 실제 URL 생성 (실제 구현 시 서버 설정에 따라 수정)
    return `/images/breweries/${imageKey}`;
  };

  // 이미지 URL 유효성 검사 함수
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    
    // 플레이스홀더나 기본 이미지 제외
    const invalidPatterns = [
      '/api/placeholder',
      'placeholder',
      'default',
      '/images/brewery-placeholder.jpg',
      '/images/brewery-default.jpg'
    ];
    
    return !invalidPatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()));
  };

  // 양조장 이미지 수집 및 처리 (최대 5개)
  const getBreweryImages = (): string[] => {
    const allImages: string[] = [];
    
    // 1. 메인 이미지 (image_key) 추가
    if (brewery.image_key) {
      const mainImageUrl = getImageUrl(brewery.image_key);
      if (isValidImageUrl(mainImageUrl)) {
        allImages.push(mainImageUrl);
      }
    }
    
    // 2. 추가 이미지들 (brewery_images) 추가
    if (brewery.brewery_images && brewery.brewery_images.length > 0) {
      brewery.brewery_images.forEach(imageKey => {
        const imageUrl = getImageUrl(imageKey);
        if (isValidImageUrl(imageUrl) && !allImages.includes(imageUrl)) {
          allImages.push(imageUrl);
        }
      });
    }
    
    // 3. 이미지가 없을 경우 샘플 이미지 추가 (개발용)
    if (allImages.length === 0) {
      const sampleImages = [
        'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=800&h=400&fit=crop'
      ];
      allImages.push(...sampleImages);
    }
    
    // 4. 최대 5개까지만 반환
    return allImages.slice(0, 5);
  };

  const breweryImages = getBreweryImages();
  const hasImages = breweryImages.length > 0;
  const hasMultipleImages = breweryImages.length > 1;

  // 이미지 로드 에러 처리
  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
    
    // 현재 이미지가 로드 실패하면 다음 유효한 이미지로 이동
    if (index === currentImageIndex) {
      const nextValidIndex = findNextValidImage(index);
      if (nextValidIndex !== -1) {
        setCurrentImageIndex(nextValidIndex);
      }
    }
  };

  // 다음 유효한 이미지 인덱스 찾기
  const findNextValidImage = (startIndex: number): number => {
    for (let i = 0; i < breweryImages.length; i++) {
      const index = (startIndex + i + 1) % breweryImages.length;
      if (!imageLoadErrors.has(index)) {
        return index;
      }
    }
    return -1; // 모든 이미지가 실패한 경우
  };

  // 이전 유효한 이미지 인덱스 찾기
  const findPrevValidImage = (startIndex: number): number => {
    for (let i = 0; i < breweryImages.length; i++) {
      const index = (startIndex - i - 1 + breweryImages.length) % breweryImages.length;
      if (!imageLoadErrors.has(index)) {
        return index;
      }
    }
    return -1; // 모든 이미지가 실패한 경우
  };

  // 다음 이미지로 이동
  const nextImage = () => {
    if (!hasMultipleImages) return;
    
    const nextIndex = findNextValidImage(currentImageIndex);
    if (nextIndex !== -1) {
      setCurrentImageIndex(nextIndex);
    }
  };

  // 이전 이미지로 이동
  const prevImage = () => {
    if (!hasMultipleImages) return;
    
    const prevIndex = findPrevValidImage(currentImageIndex);
    if (prevIndex !== -1) {
      setCurrentImageIndex(prevIndex);
    }
  };

  // 특정 이미지로 직접 이동
  const goToImage = (index: number) => {
    if (imageLoadErrors.has(index)) return; // 로드 실패한 이미지는 선택 불가
    setCurrentImageIndex(index);
  };

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleImages) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentImageIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentImageIndex(breweryImages.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, currentImageIndex, breweryImages.length]);

  // 자동 슬라이드 기능 (선택사항)
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    if (!isAutoPlay || !hasMultipleImages) return;

    const interval = setInterval(() => {
      nextImage();
    }, 4000); // 4초마다 자동 전환

    return () => clearInterval(interval);
  }, [isAutoPlay, hasMultipleImages, currentImageIndex]);

  // 현재 이미지가 유효한지 확인
  const currentImageFailed = imageLoadErrors.has(currentImageIndex);
  const allImagesFailed = breweryImages.every((_, index) => imageLoadErrors.has(index));

  // 유효한 이미지 개수 계산
  const validImageCount = breweryImages.length - imageLoadErrors.size;

  return (
    <div ref={forwardRef} className="brewery-section-container" id="images">
      <div className="brewery-main-image-container">
        {hasImages && !allImagesFailed ? (
          <>
            {/* 메인 이미지 표시 */}
            {!currentImageFailed ? (
              <img 
                src={breweryImages[currentImageIndex]} 
                alt={`${brewery.brewery_name} 사진 ${currentImageIndex + 1}`}
                className="brewery-main-image"
                onError={() => handleImageError(currentImageIndex)}
                loading="lazy"
              />
            ) : (
              <div className="brewery-image-placeholder">
                <div className="brewery-gallery-placeholder-icon">📷</div>
                <div className="brewery-gallery-placeholder-text">
                  이미지를 불러올 수 없습니다.
                </div>
              </div>
            )}
            
            {/* 네비게이션 버튼 - 2개 이상일 때만 표시 */}
            {hasMultipleImages && validImageCount > 1 && (
              <>
                <button 
                  className="brewery-image-nav-btn brewery-prev-btn"
                  onClick={prevImage}
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(false)}
                  aria-label="이전 이미지"
                  type="button"
                  disabled={validImageCount <= 1}
                >
                  ‹
                </button>
                <button 
                  className="brewery-image-nav-btn brewery-next-btn"
                  onClick={nextImage}
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(false)}
                  aria-label="다음 이미지"
                  type="button"
                  disabled={validImageCount <= 1}
                >
                  ›
                </button>
              </>
            )}
            
            {/* 이미지 인디케이터 - 2개 이상일 때만 표시 */}
            {hasMultipleImages && validImageCount > 1 && (
              <div className="brewery-image-indicators">
                {breweryImages.map((_, index) => (
                  <button
                    key={index}
                    className={`brewery-indicator ${
                      index === currentImageIndex ? 'active' : ''
                    } ${imageLoadErrors.has(index) ? 'error' : ''}`}
                    onClick={() => goToImage(index)}
                    aria-label={`${index + 1}번째 이미지로 이동`}
                    type="button"
                    disabled={imageLoadErrors.has(index)}
                    title={imageLoadErrors.has(index) ? '이미지 로드 실패' : `이미지 ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* 이미지 카운터 - 2개 이상일 때만 표시 */}
            {hasMultipleImages && (
              <div className="brewery-image-counter">
                {currentImageIndex + 1} / {breweryImages.length}
                {imageLoadErrors.size > 0 && (
                  <span className="error-count"> ({imageLoadErrors.size} 오류)</span>
                )}
              </div>
            )}

            {/* 자동재생 토글 버튼 - 3개 이상일 때만 표시 */}
            {breweryImages.length >= 3 && validImageCount >= 3 && (
              <button
                className={`brewery-autoplay-btn ${isAutoPlay ? 'active' : ''}`}
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                aria-label={isAutoPlay ? '자동재생 중지' : '자동재생 시작'}
                type="button"
                title={isAutoPlay ? '자동재생 중지' : '자동재생 시작'}
              >
                {isAutoPlay ? '⏸️' : '▶️'}
              </button>
            )}
          </>
        ) : (
          /* 이미지가 없거나 모두 실패했을 때 */
          <div className="brewery-image-placeholder">
            <div className="brewery-gallery-placeholder-icon">🏭</div>
            <div className="brewery-gallery-placeholder-text">
              {allImagesFailed ? (
                <>
                  이미지를 불러올 수 없습니다<br />
                  <small>이미지 키를 확인해주세요</small>
                </>
              ) : (
                <>
                  이미지 준비 중<br />
                  <small>양조장 사진을 업로드해주세요 (최대 5개)</small>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 이미지 정보 표시 */}
      {hasImages && (
        <div className="brewery-image-info">
          <p>
            {validImageCount > 0 ? (
              <>
                총 {breweryImages.length}개 이미지 
                {imageLoadErrors.size > 0 && ` (${imageLoadErrors.size}개 오류)`}
                {hasMultipleImages && ' • 좌우 화살표키로 이동 가능'}
              </>
            ) : (
              '이미지를 불러올 수 없습니다'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default BreweryImageGallery;