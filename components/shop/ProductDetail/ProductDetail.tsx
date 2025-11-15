'use client';

import { useState, useEffect } from 'react';
import { ProductWithDetails } from '../../../types/shop';
import { Brewery } from '../../../types/mockData';
import './ProductDetail.css';

interface ProductDetailProps {
  product: ProductWithDetails;
  brewery?: Brewery | null;
  onClose: () => void;
  isOpen: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  brewery,
  onClose,
  isOpen
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 옵션 선택 핸들러
  const handleOptionSelect = (optionId: number) => {
    setSelectedOption(optionId);
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 담기
  const handleAddToCart = () => {
    if (!selectedOption) {
      alert('옵션을 선택해주세요.');
      return;
    }
    console.log('장바구니에 추가:', { product: product.product_id, option: selectedOption, quantity });
    alert('장바구니에 추가되었습니다!');
  };

  // 바로 구매
  const handleBuyNow = () => {
    if (!selectedOption) {
      alert('옵션을 선택해주세요.');
      return;
    }
    console.log('바로 구매:', { product: product.product_id, option: selectedOption, quantity });
    alert('구매 페이지로 이동합니다.');
  };

  // 위시리스트 토글
  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log('위시리스트 토글:', product.product_id);
  };

  // 이미지 변경
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // 총 가격 계산
  const calculateTotalPrice = () => {
    if (!selectedOption) return 0;
    const option = product.options.find(opt => opt.product_option_id === selectedOption);
    return option ? option.price * quantity : 0;
  };

  // 할인율 계산
  const discountRate = product.originalPrice && product.minPrice
    ? Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  if (!isOpen) return null;

  return (
    <div className="product-detail-overlay" onClick={handleOverlayClick}>
      <div className="product-detail-container">
        {/* 헤더 */}
        <div className="product-detail-header">
          <div className="product-detail-breadcrumb">
            <span className="breadcrumb-link">상품</span> &gt; {product.name}
          </div>
          <button className="product-detail-close" onClick={onClose} title="닫기">
            ×
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="product-detail-content">
          {/* 이미지 섹션 */}
          <div className="product-detail-images">
            {product.images && product.images.length > 0 ? (
              <div className="product-image-carousel">
                <img
                  src={product.images[currentImageIndex]?.key || product.image_key}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {product.images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageChange(index)}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: 'none',
                          background: currentImageIndex === index ? '#8b5a3c' : '#ccc',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="product-images-empty">
                <div className="empty-icon">🍶</div>
                <div className="empty-text">이미지 준비 중입니다</div>
              </div>
            )}
          </div>

          {/* 상품 정보 섹션 */}
          <div className="product-detail-info">
            {/* 기본 정보 */}
            <div className="product-basic-info">
              <div className="product-badges">
                {product.isBest && <span className="product-badge badge-best">베스트</span>}
                {product.isNew && <span className="product-badge badge-new">신상품</span>}
              </div>
              
              <div className="product-detail-brewery">{product.brewery}</div>
              <h2 className="product-detail-name">{product.name}</h2>
              
              <div className="product-rating-section">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="rating-star">
                      {i < Math.floor(product.averageRating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="rating-score">{product.averageRating.toFixed(1)}</span>
                <span className="rating-count">({product.reviewCount}개 리뷰)</span>
              </div>

              <div className="product-specs">
                <span className="spec-item">
                  <span className="spec-icon">🍶</span> 도수: {product.alcohol}%
                </span>
                <span className="spec-item">
                  <span className="spec-icon">📦</span> 용량: {product.volume}ml
                </span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="product-pricing">
              <div className="price-container">
                {product.originalPrice && product.originalPrice > product.minPrice && (
                  <span className="original-price">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
                <span className={`current-price ${discountRate > 0 ? 'discount-price' : ''}`}>
                  {product.minPrice.toLocaleString()}원
                </span>
                {discountRate > 0 && (
                  <span className="discount-badge">{discountRate}%</span>
                )}
              </div>
              {product.minPrice !== product.maxPrice && (
                <div className="price-note">
                  * 옵션에 따라 가격이 달라질 수 있습니다
                </div>
              )}
            </div>

            {/* 옵션 선택 */}
            <div className="product-options">
              <div className="option-title">옵션 선택</div>
              <div className="option-list">
                {product.options.map(option => (
                  <div
                    key={option.product_option_id}
                    className={`option-item ${selectedOption === option.product_option_id ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option.product_option_id)}
                  >
                    <div className="option-info">
                      <span className="option-volume">{option.volume}ml</span>
                    </div>
                    <span className="option-price">{option.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 수량 선택 */}
            {selectedOption && (
              <div className="quantity-selector">
                <div className="quantity-title">수량</div>
                <div className="quantity-controls">
                  <div className="quantity-input-group">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="quantity-input"
                      value={quantity}
                      readOnly
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                  <div className="quantity-total">
                    총 <span className="total-price">{calculateTotalPrice().toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="product-actions">
              <button className="action-button cart-button" onClick={handleAddToCart}>
                🛒 장바구니
              </button>
              <button className="action-button buy-button" onClick={handleBuyNow}>
                💳 바로구매
              </button>
              <button
                className={`action-button wishlist-button ${isWishlisted ? 'active' : ''}`}
                onClick={handleToggleWishlist}
              >
                {isWishlisted ? '♥' : '♡'}
              </button>
            </div>

            {/* 상품 설명 */}
            {product.info?.description && (
              <div className="product-description">
                <div className="description-title">상품 설명</div>
                <div className="description-content">{product.info.description}</div>
              </div>
            )}

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <div className="tags-title">태그</div>
                <div className="tags-list">
                  {product.tags.map(tag => (
                    <span key={tag.product_tag_id} className="product-tag">
                      #{tag.tagType.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;