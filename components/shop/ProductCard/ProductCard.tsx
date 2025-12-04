'use client';

import { useState } from 'react';
import { ProductWithDetails } from '../../../types/mockData';
import { addToCart } from '../../Cart/CartStore';
import { checkAuthAndPrompt } from '../../../utils/authUtils'; 
import './ProductCard.css';

interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  onProductClick?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onProductClick
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // 토스트 메시지 표시 함수 - CSS 클래스 사용
  const showToastMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-message';

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

  // 장바구니 담기 핸들러 - 로그인 확인 추가
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('장바구니 담기 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => {
        console.log('로그인 페이지로 이동');
      },
      () => {
        console.log('장바구니 담기 취소됨');
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
        
        if (onAddToCart) {
          onAddToCart(product.product_id);
        }
      } else {
        // 실패 시 알림 (최대 수량 초과 등)
        alert('더 이상 담을 수 없습니다. 장바구니를 확인해주세요.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  };

  // 위시리스트 핸들러 - 로그인 확인 추가
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('위시리스트 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '위시리스트 기능',
      () => {
        console.log('위시리스트 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('위시리스트 추가 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    } else {
      console.log('위시리스트 토글:', product.name);
      showToastMessage(
        isWishlisted 
          ? `${product.name}을(를) 위시리스트에서 제거했습니다.`
          : `${product.name}을(를) 위시리스트에 추가했습니다.`
      );
    }
  };

  const handleProductClick = () => {
    if (onProductClick) {
      console.log('상품 카드 클릭:', product.name);
      onProductClick(product.product_id);
    } else {
      console.log('상품 상세 페이지로 이동:', product.name);
    }
  };

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  // 할인율 계산
  const discountRate = product.originalPrice && product.minPrice
    ? Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  // 이미지가 있는지 확인
  const hasValidImage = product.image_key && 
    !product.image_key.includes('/api/placeholder') && 
    product.image_key !== '' &&
    !product.image_key.includes('placeholder');

  // 가격 표시 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // 가격 범위 표시 여부 확인
  const hasPriceRange = product.minPrice !== product.maxPrice;

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-container">
        {hasValidImage ? (
          <>
            {imageStatus === 'loading' && (
              <div className="product-image-placeholder">
                <div className="placeholder-icon">📷</div>
                <div className="placeholder-text">이미지 로딩 중...</div>
              </div>
            )}
            <img
              src={product.image_key}
              alt={product.name}
              className={`product-image ${imageStatus === 'loading' ? 'image-loading' : ''} ${imageStatus === 'error' ? 'image-error' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageStatus === 'error' ? 'none' : 'block' }}
            />
            {imageStatus === 'error' && (
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
        
        {/* 상품 배지들 */}
        <div className="product-badges">
          {product.isBest && (
            <span className="product-badge badge-best">베스트</span>
          )}
          {product.isNew && (
            <span className="product-badge badge-new">신상품</span>
          )}
        </div>

        {/* 할인율 배지 */}
        {discountRate > 0 && (
          <span className="badge-discount">{discountRate}%</span>
        )}

        {/* 위시리스트 버튼 주석 처리 */}
        {/*
        <button
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title="위시리스트에 추가"
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        */}
      </div>

      {/* 상품 정보 */}
      <div className="product-info">
        <div className="product-brewery">{product.brewery}</div>
        
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-rating-info">
          <span className="rating-star">⭐</span>
          <span className="rating-score">{product.averageRating.toFixed(1)}</span>
          <span className="product-specs">
            ({product.reviewCount}) | {product.alcohol}% | {product.volume}ml
          </span>
        </div>
        
        {/* 가격 컨테이너 */}
        <div className="product-price-container">
          <div className="price-info-wrapper">
            {/* 할인율 배지 */}
            {discountRate > 0 && (
              <span className="discount-rate-badge">{discountRate}%</span>
            )}
            
            {/* 정가 (할인이 있을 때만 표시) */}
            {product.originalPrice && product.originalPrice > product.minPrice && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}원
              </span>
            )}
            
            {/* 현재 가격 */}
            <span className={`current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
              {hasPriceRange 
                ? `${formatPrice(product.minPrice)}원~`
                : `${formatPrice(product.minPrice)}원`
              }
            </span>
          </div>
        </div>
        
        {/* 장바구니 담기 버튼 - 로그인 확인 포함 */}
        <button 
          className="add-to-cart-button"
          onClick={handleAddToCart}
        >
          장바구니 담기
        </button>
      </div>
    </div>
  );
};

export default ProductCard;