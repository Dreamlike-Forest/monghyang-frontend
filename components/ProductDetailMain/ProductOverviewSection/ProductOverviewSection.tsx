'use client';

import React, { useState, useEffect } from 'react';
import { ProductWithDetails } from '../../../types/shop';
import { addToCart } from '../../Cart/CartStore';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
import './ProductOverviewSection.css';

interface ProductOverviewSectionProps {
  product: ProductWithDetails;
  forwardRef: React.RefObject<HTMLDivElement>;
}

const ProductOverviewSection: React.FC<ProductOverviewSectionProps> = ({ 
  product, 
  forwardRef 
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const formatPrice = (price: number): string => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString();
  };

  // 최종 가격 계산
  const getFinalPrice = (): number => {
    const basePrice = product.originalPrice ?? product.minPrice ?? 0;
    const discount = product.discountRate ?? 0;
    return Math.floor(basePrice * (1 - discount / 100));
  };

  const showToastMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background-color: #8b5a3c;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

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

  const getProductImages = (): string[] => {
    const allImages: string[] = [];
    
    if (product.image_key && isValidImageUrl(product.image_key)) {
      allImages.push(product.image_key);
    }
    
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
    
    return allImages.slice(0, 5);
  };

  useEffect(() => {
    setImages(getProductImages());
    setImageLoadErrors(new Set());
  }, [product]);

  const handleImageError = (url: string) => {
    setImageLoadErrors(prev => new Set(prev).add(url));
  };

  const handleThumbnailClick = (clickedGlobalIndex: number) => {
    setImages(prev => {
      const next = [...prev];
      const temp = next[0];
      next[0] = next[clickedGlobalIndex];
      next[clickedGlobalIndex] = temp;
      return next;
    });
  };

  const handleAddToCart = () => {
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => console.log('로그인 페이지로 이동'),
      () => console.log('취소됨')
    );

    if (!canProceed) return;

    try {
      const success = addToCart(product);
      if (success) {
        showToastMessage(`${product.name}이(가) 장바구니에 추가되었습니다.`);
      } else {
        alert('더 이상 담을 수 없습니다. 장바구니를 확인해주세요.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  };

  const discountRate = product.discountRate ?? 0;
  const originalPrice = product.originalPrice ?? product.minPrice ?? 0;
  const finalPrice = getFinalPrice();
  const alcohol = product.alcohol ?? 0;
  const volume = product.volume ?? 0;

  const hasImages = images.length > 0;
  const mainImage = images[0];
  const thumbnails = images.slice(1);

  return (
    <div ref={forwardRef} className="productdetail-product-section-container" id="productdetail-overview">
      <div className="productdetail-product-overview-layout">
        
        <div className="productdetail-product-image-section">
          <div className="productdetail-product-main-image-container">
            {hasImages && !imageLoadErrors.has(mainImage) ? (
              <img 
                src={mainImage} 
                alt={`${product.name} 대표 이미지`}
                className="productdetail-product-main-image-absolute"
                onError={() => handleImageError(mainImage)}
                loading="eager"
              />
            ) : (
              <div className="productdetail-product-image-placeholder">
                <div className="productdetail-product-placeholder-icon">📷</div>
                <div className="productdetail-product-placeholder-text">
                  {hasImages ? '이미지를 불러올 수 없습니다' : '이미지 준비 중'}
                </div>
              </div>
            )}
          </div>
          
          {thumbnails.length > 0 && (
            <div className="productdetail-product-thumbnails-grid">
              {thumbnails.map((imgUrl, index) => {
                const globalIndex = index + 1; 
                const hasError = imageLoadErrors.has(imgUrl);

                return (
                  <div 
                    key={`thumb-${globalIndex}`}
                    className={`productdetail-product-thumbnail-item ${hasError ? 'error' : ''}`}
                    onClick={() => !hasError && handleThumbnailClick(globalIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${globalIndex + 1}번째 이미지와 교체`}
                  >
                    {!hasError ? (
                      <img 
                        src={imgUrl} 
                        alt={`상품 이미지 ${globalIndex + 1}`}
                        onError={() => handleImageError(imgUrl)}
                      />
                    ) : (
                      <div className="productdetail-thumbnail-error">!</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="productdetail-product-info-section">
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

          <div className="productdetail-product-details-grid">
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">도수</span>
              <span className="productdetail-detail-value">{alcohol}%</span>
            </div>
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">용량</span>
              <span className="productdetail-detail-value">{volume}ml</span>
            </div>
            <div className="productdetail-detail-item">
              <span className="productdetail-detail-label">등록일</span>
              <span className="productdetail-detail-value">
                {product.registered_at 
                  ? new Date(product.registered_at).toLocaleDateString('ko-KR')
                  : '-'
                }
              </span>
            </div>
          </div>

          <div className="productdetail-product-description">
            <h3 className="productdetail-description-title">상품 설명</h3>
            <p className="productdetail-description-text">
              {product.info?.description || `${product.name}은 ${product.brewery}에서 정성스럽게 빚은 전통주입니다. 깊은 맛과 향이 특징이며, 한국의 전통 양조 기법을 바탕으로 제조되었습니다.`}
            </p>
          </div>

          {product.tags && product.tags.length > 0 && Array.isArray(product.tags) && typeof product.tags[0] === 'object' && (
            <div className="productdetail-product-tags">
              <h4 className="productdetail-tags-title">태그</h4>
              <div className="productdetail-tags-list">
                {product.tags.map((tag: any, index) => (
                  <span key={index} className="productdetail-product-tag">
                    #{tag.tagType?.name || tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          <div className="productdetail-product-price-section">
            {discountRate > 0 && originalPrice > finalPrice && (
              <div className="productdetail-original-price-container">
                <span className="productdetail-original-price-label">정가</span>
                <span className="productdetail-original-price">
                  {formatPrice(originalPrice)}원
                </span>
              </div>
            )}

            <div className="productdetail-current-price-container">
              <div className="productdetail-price-info">
                <span className={`productdetail-current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
                  {formatPrice(finalPrice)}원
                </span>
                {discountRate > 0 && (
                  <span className="productdetail-discount-badge">{discountRate}% 할인</span>
                )}
              </div>
            </div>

            {product.options && product.options.length > 1 && (
              <div className="productdetail-price-options-info">
                <span className="productdetail-price-note">용량별 가격이 다를 수 있습니다</span>
                <div className="productdetail-price-options-list">
                  {product.options.map((option) => (
                    <div key={option.product_option_id} className="productdetail-price-option-item">
                      <span className="productdetail-option-volume">{option.volume ?? 0}ml</span>
                      <span className="productdetail-option-price">{formatPrice(option.price)}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="productdetail-add-to-cart-section">
            <div className="productdetail-product-action-buttons">
              <button 
                className="productdetail-add-to-cart-button" 
                onClick={handleAddToCart}
                style={{ width: '100%' }}
              >
                <span className="productdetail-cart-icon">🛒</span>
                <span>장바구니 담기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOverviewSection;