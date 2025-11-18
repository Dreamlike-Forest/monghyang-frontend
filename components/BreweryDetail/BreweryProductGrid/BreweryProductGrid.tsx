'use client';

import React, { useState, useCallback } from 'react';
import { ProductWithDetails } from '../../../types/mockData';
import { addToCart } from '../../Cart/CartStore';
import { checkAuthAndPrompt } from '../../../utils/authUtils'; 
import './BreweryProductGrid.css';

interface BreweryProductGridProps {
  products: ProductWithDetails[];
  forwardRef: React.RefObject<HTMLDivElement>;
  onAddToCart?: (productId: number) => void;
  onProductClick?: (productId: number) => void;
}

const BreweryProductGrid: React.FC<BreweryProductGridProps> = ({ 
  products, 
  forwardRef,
  onAddToCart,
  onProductClick
}) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

  // 토스트 메시지 표시 함수 - CSS 클래스 사용
  const showToastMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'brewery-toast-message';

    document.body.appendChild(toast);
    
    // 애니메이션 트리거
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 3초 후 제거
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // 장바구니 추가 핸들러 - 로그인 확인 추가
  const handleAddToCart = useCallback((e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('양조장 상품 장바구니 담기 버튼 클릭 - 로그인 상태 확인');
    
    // 상품 정보 찾기
    const product = products.find(p => p.product_id === productId);
    if (!product) {
      console.error('상품을 찾을 수 없습니다:', productId);
      alert('상품 정보를 찾을 수 없습니다.');
      return;
    }

    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => {
        console.log('장바구니 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('양조장 상품 장바구니 담기 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    try {
      // CartStore에서 직접 장바구니에 추가
      const success = addToCart(product);
      
      if (success) {
        // 성공 메시지 표시
        showToastMessage(`${product.name}이(가) 장바구니에 추가되었습니다.`);
        
        // 기존 콜백도 호출 (있다면)
        if (onAddToCart) {
          onAddToCart(productId);
        }
      } else {
        // 실패 시 알림 (최대 수량 초과 등)
        alert('더 이상 담을 수 없습니다. 장바구니를 확인해주세요.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  }, [products, onAddToCart]);

  // 상품 클릭 핸들러
  const handleProductClick = useCallback((productId: number) => {
    if (onProductClick) {
      onProductClick(productId);
    } else {
      console.log('상품 상세페이지로 이동:', productId);
      navigateToProductDetail(productId);
    }
  }, [onProductClick]);

  // 상품 상세페이지로 이동하는 함수
  const navigateToProductDetail = (productId: number) => {
    const currentURL = new URL(window.location.href);
    
    currentURL.searchParams.delete('brewery');
    currentURL.searchParams.delete('view');
    
    currentURL.searchParams.set('view', 'shop');
    currentURL.searchParams.set('product', productId.toString());
    
    window.history.pushState({}, '', currentURL.toString());
    window.location.reload();
  };

  // 이미지 로드 핸들러
  const handleImageLoad = useCallback((productId: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: 'loaded'
    }));
  }, []);

  const handleImageError = useCallback((productId: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: 'error'
    }));
  }, []);

  // 유효한 이미지인지 확인
  const hasValidImage = (imageKey: string | undefined) => {
    return imageKey && 
      !imageKey.includes('/api/placeholder') && 
      imageKey !== '' &&
      !imageKey.includes('placeholder') &&
      imageKey !== 'undefined';
  };

  // 가격 표시 문자열 생성
  const getPriceDisplay = (product: ProductWithDetails) => {
    if (product.minPrice === product.maxPrice) {
      return `${product.minPrice.toLocaleString()}원`;
    }
    return `${product.minPrice.toLocaleString()}원 ~ ${product.maxPrice.toLocaleString()}원`;
  };

  // 할인율 계산
  const getDiscountRate = (product: ProductWithDetails) => {
    if (product.originalPrice && product.minPrice && product.originalPrice > product.minPrice) {
      return Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100);
    }
    return product.discountRate || 0;
  };

  return (
    <div ref={forwardRef} className="brewery-section-container" id="products">
      <h2 className="brewery-section-title">판매 상품</h2>
      
      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => {
            const imageState = imageLoadStates[product.product_id] || 'loading';
            const discountRate = getDiscountRate(product);
            
            return (
              <article 
                key={product.product_id} 
                className="product-card"
                onClick={() => handleProductClick(product.product_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductClick(product.product_id);
                  }
                }}
                aria-label={`${product.name} 상품 상세보기`}
              >
                <div className="product-image-container">
                  {hasValidImage(product.image_key) ? (
                    <>
                      {imageState === 'loading' && (
                        <div className="product-image-placeholder">
                          <div className="placeholder-icon">📷</div>
                          <div className="placeholder-text">이미지 로딩 중...</div>
                        </div>
                      )}
                      <img 
                        src={product.image_key} 
                        alt={`${product.name} 상품 이미지`}
                        className={`product-image ${imageState === 'loading' ? 'image-loading' : ''}`}
                        style={{ display: imageState === 'error' ? 'none' : 'block' }}
                        onLoad={() => handleImageLoad(product.product_id)}
                        onError={() => handleImageError(product.product_id)}
                        loading="lazy"
                      />
                      {imageState === 'error' && (
                        <div className="product-image-placeholder">
                          <div className="placeholder-icon">🍶</div>
                          <div className="placeholder-text">이미지를 불러올 수<br />없습니다</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="product-image-placeholder">
                      <div className="placeholder-icon">🍶</div>
                      <div className="placeholder-text">상품 이미지<br />준비 중</div>
                    </div>
                  )}
                  
                  <div className="product-badges">
                    {product.isBest && <span className="product-badge best">베스트</span>}
                    {product.isNew && <span className="product-badge new">신상품</span>}
                    {discountRate > 0 && <span className="product-badge sale">{discountRate}% 할인</span>}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-rating">
                    <span className="rating-star" aria-hidden="true">⭐</span>
                    <span className="rating-score">{product.averageRating.toFixed(1)}</span>
                    <span className="rating-count">({product.reviewCount})</span>
                    <span className="product-specs">{product.alcohol}% | {product.volume}ml</span>
                  </div>
                  
                  <div className="product-price">
                    {product.originalPrice && product.originalPrice > product.minPrice && (
                      <span className="original-price">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className="current-price">
                      {getPriceDisplay(product)}
                    </span>
                  </div>
                  
                  {/* 장바구니 담기 버튼 - 로그인 확인 포함 */}
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(e, product.product_id)}
                    aria-label={`${product.name} 장바구니에 추가`}
                  >
                    장바구니 담기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>현재 판매 중인 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default BreweryProductGrid;