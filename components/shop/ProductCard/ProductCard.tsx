'use client';

import { useState } from 'react';
import { ProductWithDetails } from '../../../types/mockData';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.product_id);
    } else {
      console.log('장바구니에 추가:', product.name);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    } else {
      console.log('위시리스트 토글:', product.name);
    }
  };

  const handleProductClick = () => {
    if (onProductClick) {
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

  // 할인률 계산
  const discountRate = product.originalPrice && product.minPrice
    ? Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  // 이미지가 있는지 확인 (placeholder 이미지 제외)
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
        
        {/* 상품 뱃지들 */}
        <div className="product-badges">
          {product.isBest && (
            <span className="product-badge badge-best">베스트</span>
          )}
          {product.isNew && (
            <span className="product-badge badge-new">신상품</span>
          )}
        </div>

        {/* 할인율 뱃지 */}
        {discountRate > 0 && (
          <span className="badge-discount">{discountRate}%</span>
        )}

        {/* 위시리스트 버튼 */}
        <button
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title="위시리스트에 추가"
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
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
        
        <div className="product-price-container">
          {product.originalPrice && product.originalPrice > product.minPrice && (
            <span className="original-price">
              {product.originalPrice.toLocaleString()}원
            </span>
          )}
          <span className={`current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
            {product.minPrice === product.maxPrice 
              ? `${product.minPrice.toLocaleString()}원`
              : `${product.minPrice.toLocaleString()}원 ~ ${product.maxPrice.toLocaleString()}원`
            }
          </span>
        </div>
        
        <button 
          className="add-to-cart-button"
          onClick={handleAddToCart}
        >
          장바구니
        </button>
      </div>
    </div>
  );
};

export default ProductCard;