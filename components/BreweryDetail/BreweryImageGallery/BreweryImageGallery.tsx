'use client';

import React, { useState, useEffect } from 'react';
import { Brewery } from '../../../types/mockData';
import { getBreweryImages } from '../../../utils/ImageUtils';
import './BreweryImageGallery.css';

interface BreweryImageGalleryProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const BreweryImageGallery: React.FC<BreweryImageGalleryProps> = ({
  brewery,
  forwardRef,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(
    new Set(),
  );

  // 양조장 이미지 수집 및 처리 (최대 5개)
  const breweryImages = getBreweryImages(brewery, 5);

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
    return -1;
  };

  // 이전 유효한 이미지 인덱스 찾기
  const findPrevValidImage = (startIndex: number): number => {
    for (let i = 0; i < breweryImages.length; i++) {
      const index =
        (startIndex - i - 1 + breweryImages.length) % breweryImages.length;
      if (!imageLoadErrors.has(index)) {
        return index;
      }
    }
    return -1;
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
    if (imageLoadErrors.has(index)) return;
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

  // 자동 슬라이드 기능 (선택)
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    if (!isAutoPlay || !hasMultipleImages) return;

    const interval = setInterval(() => {
      nextImage();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, hasMultipleImages, currentImageIndex]);

  const currentImageFailed = imageLoadErrors.has(currentImageIndex);
  const allImagesFailed = breweryImages.every((_, index) =>
    imageLoadErrors.has(index),
  );
  const validImageCount = breweryImages.length - imageLoadErrors.size;

  return (
    <div ref={forwardRef} className="brewery-section-container" id="images">
      <div className="brewery-main-image-container">
        {hasImages && !allImagesFailed ? (
          <>
            {!currentImageFailed ? (
              <img
                src={breweryImages[currentImageIndex]}
                alt={`${brewery.brewery_name} 사진 ${
                  currentImageIndex + 1
                }`}
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

            {hasMultipleImages && validImageCount > 1 && (
              <>
                <button
                  className="brewery-image-nav-btn brewery-prev-btn"
                  onClick={prevImage}
                  aria-label="이전 이미지"
                  type="button"
                  disabled={validImageCount <= 1}
                >
                  ‹
                </button>
                <button
                  className="brewery-image-nav-btn brewery-next-btn"
                  onClick={nextImage}
                  aria-label="다음 이미지"
                  type="button"
                  disabled={validImageCount <= 1}
                >
                  ›
                </button>
              </>
            )}

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
                    title={
                      imageLoadErrors.has(index)
                        ? '이미지 로드 실패'
                        : `이미지 ${index + 1}`
                    }
                  />
                ))}
              </div>
            )}

            {hasMultipleImages && (
              <div className="brewery-image-counter">
                {currentImageIndex + 1} / {breweryImages.length}
                {imageLoadErrors.size > 0 && (
                  <span className="error-count">
                    {' '}
                    ({imageLoadErrors.size} 오류)
                  </span>
                )}
              </div>
            )}

            {breweryImages.length >= 3 && validImageCount >= 3 && (
              <button
                className={`brewery-autoplay-btn ${
                  isAutoPlay ? 'active' : ''
                }`}
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
          <div className="brewery-image-placeholder">
            <div className="brewery-gallery-placeholder-icon">🏭</div>
            <div className="brewery-gallery-placeholder-text">
              {allImagesFailed ? (
                <>
                  이미지를 불러올 수 없습니다
                  <br />
                  <small>이미지 키를 확인해주세요</small>
                </>
              ) : (
                <>
                  이미지 준비 중
                  <br />
                  <small>양조장 사진을 업로드해주세요 (최대 5개)</small>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {hasImages && (
        <div className="brewery-image-info">
          <p>
            {validImageCount > 0
              ? `총 ${breweryImages.length}개 이미지${
                  imageLoadErrors.size > 0
                    ? ` (${imageLoadErrors.size}개 오류)`
                    : ''
                }${
                  hasMultipleImages ? ' • 좌우 화살표키로 이동 가능' : ''
                }`
              : '이미지를 불러올 수 없습니다'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BreweryImageGallery;
