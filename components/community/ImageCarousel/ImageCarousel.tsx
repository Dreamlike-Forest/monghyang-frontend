'use client';

import { useState, useEffect, useRef } from 'react';
import { PostImage } from '../../../types/community';
import './ImageCarousel.css';

interface ImageCarouselProps {
  images: PostImage[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  showIndicators?: boolean;
  showNavigation?: boolean;
  showCounter?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  mode?: 'thumbnail' | 'detail'; 
  objectFit?: 'cover' | 'contain';
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  currentIndex = 0,
  onIndexChange,
  showIndicators = true,
  showNavigation = true,
  showCounter = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  className = '',
  mode = 'detail',
  objectFit = 'cover'
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // 터치 스와이프 최소 거리
  const minSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(activeIndex);
    }
  }, [activeIndex, onIndexChange]);

  // 자동 재생
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % images.length);
      }, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, images.length]);

  // 자동 재생 일시 정지
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % images.length);
      }, autoPlayInterval);
    }
  };

  const goToPrevious = () => {
    setActiveIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveIndex(prev => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
    if (index === 0) {
      setIsLoading(false);
    }
  };

  const handleImageError = (index: number) => {
    console.error(`이미지 로드 실패: ${images[index]?.image_key}`);
    if (index === 0) {
      setIsLoading(false);
    }
  };

  // 터치 이벤트 핸들러
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`image-carousel carousel-${mode} ${className}`}>
        <div className="carousel-placeholder">
          <div className="placeholder-icon">📷</div>
          <div className="placeholder-text">이미지가 없습니다</div>
        </div>
      </div>
    );
  }

  // window 객체 접근을 안전하게 처리
  const isMobile = mode === 'thumbnail' || (typeof window !== 'undefined' && window.innerWidth <= 768);

  return (
    <div
      className={`image-carousel carousel-${mode} ${isMobile ? 'carousel-mobile' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="이미지 갤러리"
    >
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`
          }}
        >
          {images.map((image, index) => (
            <div key={image.post_image_id || index} className="carousel-slide">
              <img
                src={image.image_key}
                alt={`이미지 ${index + 1}`}
                className={`carousel-image ${objectFit === 'contain' ? 'contain' : ''}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="carousel-loading">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        {showNavigation && images.length > 1 && !isMobile && (
          <>
            <button
              className="carousel-nav prev"
              onClick={goToPrevious}
              disabled={images.length <= 1}
              aria-label="이전 이미지"
            >
              ◀
            </button>
            <button
              className="carousel-nav next"
              onClick={goToNext}
              disabled={images.length <= 1}
              aria-label="다음 이미지"
            >
              ▶
            </button>
          </>
        )}

        {/* 이미지 카운터 */}
        {showCounter && images.length > 1 && (
          <div className="image-counter">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* 인디케이터 */}
        {showIndicators && images.length > 1 && images.length <= 10 && (
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;