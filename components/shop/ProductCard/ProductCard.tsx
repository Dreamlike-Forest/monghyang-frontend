'use client';

import { useState } from 'react';
import type { ProductWithDetails } from '../../../types/shop';
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

  const formatPrice = (price: number): string => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString();
  };

  const showToastMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-message';

    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const canProceed = checkAuthAndPrompt(
      '장바구니 기능',
      () => console.log('로그인 페이지로 이동'),
      () => console.log('장바구니 담기 취소됨')
    );

    if (!canProceed) return;

    try {
      const success = addToCart(product);
      
      if (success) {
        showToastMessage(`${product.product_name}이(가) 장바구니에 추가되었습니다.`);
        onAddToCart?.(product.product_id);
      } else {
        alert('더 이상 담을 수 없습니다. 장바구니를 확인해주세요.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const canProceed = checkAuthAndPrompt(
      '위시리스트 기능',
      () => console.log('로그인 페이지로 이동'),
      () => console.log('위시리스트 추가 취소됨')
    );

    if (!canProceed) return;

    setIsWishlisted(!isWishlisted);
    
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    } else {
      showToastMessage(
        isWishlisted 
          ? `${product.product_name}을(를) 위시리스트에서 제거했습니다.`
          : `${product.product_name}을(를) 위시리스트에 추가했습니다.`
      );
    }
  };

  const handleProductClick = () => {
    onProductClick?.(product.product_id);
  };

  const handleImageLoad = () => setImageStatus('loaded');
  const handleImageError = () => setImageStatus('error');

  const discountRate = product.product_discount_rate ?? 0;
  const originPrice = product.product_origin_price ?? 0;
  const finalPrice = product.product_final_price ?? 0;
  const averageRating = product.product_review_star ?? 0;
  const reviewCount = product.product_review_count ?? 0;
  const alcohol = product.product_alcohol ?? 0;
  const volume = product.product_volume ?? 0;

  const isBest = (product.product_review_star || 0) >= 4.5;
  const isNew = (() => {
    if (!product.product_registered_at) return false;
    const registeredDate = new Date(product.product_registered_at);
    const now = new Date();
    const daysDiff = (now.getTime() - registeredDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  })();

  const hasValidImage = product.image_key && 
    !product.image_key.includes('/api/placeholder') && 
    product.image_key !== '' &&
    !product.image_key.includes('placeholder');

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
              alt={product.product_name}
              className={`product-image ${imageStatus === 'loading' ? 'image-loading' : ''} ${imageStatus === 'error' ? 'image-error' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageStatus === 'error' ? 'none' : 'block' }}
            />
            {imageStatus === 'error' && (
              <div className="product-image-placeholder">
                <div className="placeholder-icon">❌</div>
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
          {isBest && (
            <span className="product-badge badge-best">베스트</span>
          )}
          {isNew && (
            <span className="product-badge badge-new">신상품</span>
          )}
        </div>

        {discountRate > 0 && (
          <span className="badge-discount">{discountRate}%</span>
        )}
      </div>

      <div className="product-info">
        <div className="product-brewery">{product.user_nickname}</div>
        
        <h3 className="product-name">{product.product_name}</h3>
        
        <div className="product-rating-info">
          <span className="rating-star">⭐</span>
          <span className="rating-score">{averageRating.toFixed(1)}</span>
          <span className="product-specs">
            ({reviewCount}) | {alcohol}% | {volume}ml
          </span>
        </div>
        
        <div className="product-price-container">
          <div className="price-info-wrapper">
            {discountRate > 0 && (
              <span className="discount-rate-badge">{discountRate}%</span>
            )}
            
            {discountRate > 0 && originPrice > finalPrice && (
              <span className="original-price">
                {formatPrice(originPrice)}원
              </span>
            )}
            
            <span className={`current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
              {formatPrice(finalPrice)}원
            </span>
          </div>
        </div>
        
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