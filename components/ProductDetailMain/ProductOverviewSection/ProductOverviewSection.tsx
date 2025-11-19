'use client';

import React, { useState, useEffect } from 'react';
import { ProductWithDetails } from '../../../types/mockData';
import { addToCart } from '../../Cart/CartStore'; // CartStore에서 직접 import
import { checkAuthAndPrompt } from '../../../utils/authUtils'; // 인증 유틸리티 import
import './ProductOverviewSection.css';

interface ProductOverviewSectionProps {
  product: ProductWithDetails;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const ProductOverviewSection: React.FC<ProductOverviewSectionProps> = ({ 
  product, 
  forwardRef 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  // 토스트 메시지 표시 함수
  const showToastMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '100px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#8b5a3c';
    toast.style.color = 'white';
    toast.style.padding = '16px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.3s ease';

    document.body.appendChild(toast);
    
    // 애니메이션 트리거
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // 3초 후 제거
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // 이미지 URL 유효성 검사 함수
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    
    const invalidPatterns = [
      '/api/placeholder',
      'placeholder',
      'default',
      '/images/product-placeholder.jpg',
      '/images/product-default.jpg'
    ];
    
    return !invalidPatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()));
  };

  // 상품 이미지 수집 및 처리
  const getProductImages = (): string[] => {
    const allImages: string[] = [];
    
    // 1. 메인 이미지 추가
    if (product.image_key && isValidImageUrl(product.image_key)) {
      allImages.push(product.image_key);
    }
    
    // 2. 추가 이미지들 처리
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => {
        const getSeq = (image: any): number => {
          if ('image_seq' in image) return image.image_seq;
          if ('seq' in image) return image.seq;
          return 0;
        };
        
        return getSeq(a) - getSeq(b);
      });

      sortedImages.forEach(image => {
        const getImageUrl = (image: any): string => {
          if ('image_key' in image) return image.image_key;
          if ('key' in image) return image.key;
          return '';
        };
        
        const imageUrl = getImageUrl(image);
        if (isValidImageUrl(imageUrl) && !allImages.includes(imageUrl)) {
          allImages.push(imageUrl);
        }
      });
    }
    
    // 3. 이미지가 없을 경우 샘플 이미지 추가
    if (allImages.length === 0) {
      const sampleImages = [
        'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=800&h=800&fit=crop'
      ];
      allImages.push(...sampleImages);
    }
    
    return allImages.slice(0, 5);
  };

  const productImages = getProductImages();
  const hasImages = productImages.length > 0;
  const hasMultipleImages = productImages.length > 1;

  // 이미지 로드 에러 처리
  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
    
    if (index === currentImageIndex) {
      const nextValidIndex = findNextValidImage(index);
      if (nextValidIndex !== -1) {
        setCurrentImageIndex(nextValidIndex);
      }
    }
  };

  // 다음/이전 유효한 이미지 찾기
  const findNextValidImage = (startIndex: number): number => {
    for (let i = 0; i < productImages.length; i++) {
      const index = (startIndex + i + 1) % productImages.length;
      if (!imageLoadErrors.has(index)) {
        return index;
      }
    }
    return -1;
  };

  const findPrevValidImage = (startIndex: number): number => {
    for (let i = 0; i < productImages.length; i++) {
      const index = (startIndex - i - 1 + productImages.length) % productImages.length;
      if (!imageLoadErrors.has(index)) {
        return index;
      }
    }
    return -1;
  };

  // 네비게이션 함수들
  const nextImage = () => {
    if (!hasMultipleImages) return;
    const nextIndex = findNextValidImage(currentImageIndex);
    if (nextIndex !== -1) {
      setCurrentImageIndex(nextIndex);
    }
  };

  const prevImage = () => {
    if (!hasMultipleImages) return;
    const prevIndex = findPrevValidImage(currentImageIndex);
    if (prevIndex !== -1) {
      setCurrentImageIndex(prevIndex);
    }
  };

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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, currentImageIndex, productImages.length]);

  // 가격 포맷팅
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // 할인율 계산
  const getDiscountRate = (): number => {
    if (product.originalPrice && product.minPrice < product.originalPrice) {
      return Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100);
    }
    return product.discountRate || 0;
  };

  // 장바구니 추가 함수 - 로그인 확인 추가
  const handleAddToCart = () => {
    console.log('상품 상세페이지 장바구니 담기 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => {
        console.log('장바구니 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('상품 상세페이지 장바구니 담기 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    try {
      const success = addToCart(product);
      
      if (success) {
        showToastMessage(`${product.name}이(가) 장바구니에 추가되었습니다.`);
        console.log('상품 상세페이지에서 장바구니에 추가 완료:', product.name);
      } else {
        alert('더 이상 담을 수 없습니다. 장바구니를 확인해주세요.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  };

  // 구매하기 함수 - 로그인 확인 추가
  const handleBuyNow = () => {
    console.log('상품 상세페이지 구매하기 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '구매 기능',
      () => {
        console.log('구매 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('상품 상세페이지 구매하기 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    try {
      console.log('즉시 구매:', product.name);
      // 여기에 즉시 구매 로직 구현
      alert(`${product.name} 구매 페이지는 준비중입니다.`);
    } catch (error) {
      console.error('구매 처리 중 오류:', error);
      alert('구매 처리 중 오류가 발생했습니다.');
    }
  };

  const discountRate = getDiscountRate();
  const currentImageFailed = imageLoadErrors.has(currentImageIndex);
  const allImagesFailed = productImages.every((_, index) => imageLoadErrors.has(index));
  const validImageCount = productImages.length - imageLoadErrors.size;

  return (
    <div ref={forwardRef} className="productdetail-product-section-container" id="productdetail-overview">
      {/* 섹션 제목 제거 */}
      
      <div className="productdetail-product-overview-layout">
        {/* 왼쪽: 상품 이미지 */}
        <div className="productdetail-product-image-section">
          <div className="productdetail-product-main-image-container">
            {hasImages && !allImagesFailed ? (
              <>
                {/* 메인 이미지 */}
                {!currentImageFailed ? (
                  <img 
                    src={productImages[currentImageIndex]} 
                    alt={`${product.name} 상품 이미지 ${currentImageIndex + 1}`}
                    className="productdetail-product-main-image-absolute"
                    onError={() => handleImageError(currentImageIndex)}
                    loading="lazy"
                  />
                ) : (
                  <div className="productdetail-product-image-placeholder">
                    <div className="productdetail-product-placeholder-icon">📷</div>
                    <div className="productdetail-product-placeholder-text">
                      이미지를 불러올 수 없습니다.
                    </div>
                  </div>
                )}
                
                {/* 네비게이션 버튼 */}
                {hasMultipleImages && validImageCount > 1 && (
                  <>
                    <button 
                      className="productdetail-product-image-nav-btn productdetail-product-prev-btn"
                      onClick={prevImage}
                      aria-label="이전 이미지"
                      disabled={validImageCount <= 1}
                    >
                      ‹
                    </button>
                    <button 
                      className="productdetail-product-image-nav-btn productdetail-product-next-btn"
                      onClick={nextImage}
                      aria-label="다음 이미지"
                      disabled={validImageCount <= 1}
                    >
                      ›
                    </button>
                  </>
                )}
                
                {/* 이미지 카운터 */}
                {hasMultipleImages && (
                  <div className="productdetail-product-image-counter">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                )}
              </>
            ) : (
              <div className="productdetail-product-image-placeholder">
                <div className="productdetail-product-placeholder-icon">🍶</div>
                <div className="productdetail-product-placeholder-text">
                  {allImagesFailed ? '이미지를 불러올 수 없습니다' : '이미지 준비 중'}
                </div>
              </div>
            )}
          </div>
          
          {/* 인네일 이미지들 */}
          {hasMultipleImages && validImageCount > 1 && (
            <div className="productdetail-product-thumbnails">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`productdetail-product-thumbnail ${
                    index === currentImageIndex ? 'active' : ''
                  } ${imageLoadErrors.has(index) ? 'error' : ''}`}
                  onClick={() => goToImage(index)}
                  disabled={imageLoadErrors.has(index)}
                  aria-label={`${index + 1}번째 이미지로 이동`}
                >
                  {!imageLoadErrors.has(index) ? (
                    <img 
                      src={image} 
                      alt={`${product.name} 인네일 ${index + 1}`}
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <div className="productdetail-thumbnail-error">⌘</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div className="productdetail-product-info-section">
          {/* 상품명과 양조장 - 브레드크럼 제거됨 */}
          <div className="productdetail-product-title-section">
            <h1 className="productdetail-product-name">{product.name}</h1>
            <p className="productdetail-product-brewery">{product.brewery}</p>
            <div className="productdetail-product-badges">
              {product.isBest && (
                <span className="productdetail-product-badge best">베스트</span>
              )}
              {product.isNew && (
                <span className="productdetail-product-badge new">신상품</span>
              )}
            </div>
          </div>

          {/* 상품 상세 정보 */}
          <div className="productdetail-product-details-grid">
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">도수</span>
              <span className="productdetail-detail-value">{product.alcohol}%</span>
            </div>
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">용량</span>
              <span className="productdetail-detail-value">{product.volume}ml</span>
            </div>
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">등록일</span>
              <span className="productdetail-detail-value">
                {new Date(product.registered_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 상품 설명 */}
          <div className="productdetail-product-description">
            <h3 className="productdetail-description-title">상품 설명</h3>
            <p className="productdetail-description-text">
              {product.info?.description || `${product.name}은 ${product.brewery}에서 정성스럽게 빚은 전통주입니다. 깊은 맛과 향이 특징이며, 한국의 전통 양조 기법을 바탕으로 제조되었습니다.`}
            </p>
          </div>

          {/* 태그 정보 */}
          {product.tags && product.tags.length > 0 && (
            <div className="productdetail-product-tags">
              <h4 className="productdetail-tags-title">태그</h4>
              <div className="productdetail-tags-list">
                {product.tags.map((tag, index) => (
                  <span key={index} className="productdetail-product-tag">
                    #{tag.tagType.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 배송 정보 */}
          <div className="productdetail-shipping-info">
            <h4 className="productdetail-shipping-title">배송 정보</h4>
            <div className="productdetail-shipping-details">
              <div className="productdetail-shipping-item">
                <span className="productdetail-shipping-label">배송비</span>
                <span className="productdetail-shipping-value">3,000원 (5만원 이상 무료)</span>
              </div>
              <div className="productdetail-shipping-item">
                <span className="productdetail-shipping-label">배송 기간</span>
                <span className="productdetail-shipping-value">주문 후 2-3일</span>
              </div>
              <div className="productdetail-shipping-item">
                <span className="productdetail-shipping-label">배송 지역</span>
                <span className="productdetail-shipping-value">전국 (일부 도서산간 지역 제외)</span>
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="productdetail-product-price-section">
            {/* 할인 전 가격 */}
            {product.originalPrice && product.originalPrice > product.minPrice && (
              <div className="productdetail-original-price-container">
                <span className="productdetail-original-price-label">정가</span>
                <span className="productdetail-original-price">
                  {formatPrice(product.originalPrice)}원
                </span>
              </div>
            )}

            {/* 현재 가격 */}
            <div className="productdetail-current-price-container">
              <div className="productdetail-price-info">
                <span className={`productdetail-current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
                  {product.minPrice === product.maxPrice 
                    ? `${formatPrice(product.minPrice)}원`
                    : `${formatPrice(product.minPrice)}원 ~ ${formatPrice(product.maxPrice)}원`
                  }
                </span>
                {discountRate > 0 && (
                  <span className="productdetail-discount-badge">{discountRate}% 할인</span>
                )}
              </div>
            </div>

            {/* 옵션별 가격 안내 */}
            {product.options.length > 1 && (
              <div className="productdetail-price-options-info">
                <span className="productdetail-price-note">용량별 가격이 다를 수 있습니다</span>
                <div className="productdetail-price-options-list">
                  {product.options.map((option) => (
                    <div key={option.product_option_id} className="productdetail-price-option-item">
                      <span className="productdetail-option-volume">{option.volume}ml</span>
                      <span className="productdetail-option-price">{formatPrice(option.price)}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 장바구니 & 구매하기 버튼 - 로그인 확인 포함 */}
          <div className="productdetail-add-to-cart-section">
            <div className="productdetail-product-action-buttons">
              <button className="productdetail-add-to-cart-button" onClick={handleAddToCart}>
                <span className="productdetail-cart-icon">🛒</span>
                <span>장바구니</span>
              </button>
              <button className="productdetail-buy-now-button" onClick={handleBuyNow}>
                <span className="productdetail-buy-icon">💳</span>
                <span>구매하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOverviewSection;