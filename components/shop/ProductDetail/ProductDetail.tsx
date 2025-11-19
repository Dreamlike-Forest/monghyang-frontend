'use client';

import { useState, useEffect, useRef } from 'react';
import ImageCarousel from '../../community/ImageCarousel/ImageCarousel';
import { ProductWithDetails, ProductOption } from '../../../types/shop';
import { PostImage } from '../../../types/community';
import './ProductDetail.css';

interface ProductDetailProps {
  product: ProductWithDetails;
  onClose: () => void;
  onAddToCart?: (productId: number, optionId: number, quantity: number) => void;
  onBuyNow?: (productId: number, optionId: number, quantity: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isOpen: boolean;
  isPageMode?: boolean; // 페이지 모드 여부
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isOpen,
  isPageMode = false
}) => {
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎭 ProductDetail 마운트됨, isOpen:', isOpen, 'product:', product.name);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 첫 번째 옵션을 기본 선택
      if (product.options.length > 0) {
        setSelectedOption(product.options[0]);
        console.log('✅ 기본 옵션 선택됨:', product.options[0]);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product.options, product.name]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (selectedOption && onAddToCart) {
      onAddToCart(product.product_id, selectedOption.product_option_id, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedOption && onBuyNow) {
      onBuyNow(product.product_id, selectedOption.product_option_id, quantity);
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOption(option);
    setQuantity(1); // 옵션 변경 시 수량 초기화
  };

  // ProductInfoImage를 PostImage로 변환
  const convertToPostImages = (images: typeof product.images): PostImage[] => {
    return images
      .sort((a, b) => a.image_seq - b.image_seq)
      .map((image) => ({
        image_id: image.product_info_image_id,
        image_url: image.image_key,
        image_order: image.image_seq,
        alt_text: `${product.name} 상품 이미지 ${image.image_seq}`
      }));
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const getTotalPrice = (): number => {
    return selectedOption ? selectedOption.price * quantity : 0;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className="rating-star"
        >
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const hasImages = product.images && product.images.length > 0;
  const productImages = hasImages ? convertToPostImages(product.images) : [];
  const discount = product.originalPrice && product.minPrice < product.originalPrice 
    ? Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  if (!isOpen) {
    console.log('❌ ProductDetail이 열리지 않음 (isOpen: false)');
    return null;
  }

  console.log('✅ ProductDetail 렌더링 중:', product.name, 'pageMode:', isPageMode);

  // 페이지 모드일 때는 오버레이 없이 렌더링
  if (isPageMode) {
    return (
      <div className="product-detail-container" style={{ 
        maxWidth: 'none', 
        maxHeight: 'none', 
        position: 'relative',
        margin: 0,
        borderRadius: 0,
        minHeight: '100vh'
      }}>
        {/* 헤더 */}
        <div className="product-detail-header">
          <div className="product-detail-breadcrumb">
            <button 
              onClick={onClose}
              className="breadcrumb-link"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#8b5a3c', 
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              ← 전통주 쇼핑
            </button> &gt; {product.brewery} &gt; {product.name}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            상품 상세페이지
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="product-detail-content">
          {/* 이미지 섹션 */}
          <div className="product-detail-images">
            {hasImages ? (
              <ImageCarousel
                images={productImages}
                mode="detail"
                showNavigation={productImages.length > 1}
                showIndicators={productImages.length > 1}
                showCounter={productImages.length > 1}
                className="product-image-carousel"
                objectFit="contain"
              />
            ) : (
              <div className="product-images-empty">
                <div className="empty-icon">🍶</div>
                <div className="empty-text">상품 이미지 준비 중</div>
              </div>
            )}
          </div>

          {/* 상품 정보 섹션 */}
          <div className="product-detail-info">
            {/* 기본 정보 */}
            <div className="product-basic-info">
              <div className="product-badges">
                {product.isBest && (
                  <span className="product-badge badge-best">베스트</span>
                )}
                {product.isNew && (
                  <span className="product-badge badge-new">신상품</span>
                )}
              </div>

              <div className="product-detail-brewery">{product.brewery}</div>
              <h1 className="product-detail-name">{product.name}</h1>

              <div className="product-rating-section">
                <div className="rating-stars">
                  {renderRating(product.averageRating)}
                </div>
                <span className="rating-score">{product.averageRating.toFixed(1)}</span>
                <span className="rating-count">({product.reviewCount}개 리뷰)</span>
              </div>

              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-icon">🌡</span>
                  <span>{product.alcohol}%</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">🍾</span>
                  <span>{product.volume}ml</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📅</span>
                  <span>{new Date(product.registered_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="product-pricing">
              <div className="price-container">
                {product.originalPrice && product.originalPrice > product.minPrice && (
                  <span className="original-price">
                    {formatPrice(product.originalPrice)}원
                  </span>
                )}
                <span className={`current-price ${discount > 0 ? 'discount-price' : ''}`}>
                  {formatPrice(selectedOption?.price || product.minPrice)}원
                </span>
                {discount > 0 && (
                  <span className="discount-badge">{discount}% 할인</span>
                )}
              </div>
              <div className="price-note">
                배송비 별도 • 무료배송 (5만원 이상 구매 시)
              </div>
            </div>

            {/* 옵션 선택 */}
            {product.options.length > 1 && (
              <div className="product-options">
                <div className="option-title">용량 선택</div>
                <div className="option-list">
                  {product.options.map(option => (
                    <div
                      key={option.product_option_id}
                      className={`option-item ${selectedOption?.product_option_id === option.product_option_id ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className="option-info">
                        <span className="option-volume">{option.volume}ml</span>
                      </div>
                      <span className="option-price">{formatPrice(option.price)}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 수량 선택 */}
            <div className="quantity-selector">
              <div className="quantity-title">수량</div>
              <div className="quantity-controls">
                <div className="quantity-input-group">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max="99"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
                <div className="quantity-total">
                  총 <span className="total-price">{formatPrice(getTotalPrice())}원</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="product-actions">
              <button 
                className="action-button cart-button"
                onClick={handleAddToCart}
                disabled={!selectedOption}
              >
                🛒 장바구니 담기
              </button>
              <button 
                className="action-button buy-button"
                onClick={handleBuyNow}
                disabled={!selectedOption}
              >
                💳 바로구매
              </button>
              <button 
                className={`action-button wishlist-button ${isWishlisted ? 'active' : ''}`}
                onClick={handleToggleWishlist}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* 상품 설명 */}
            {product.info?.description && (
              <div className="product-description">
                <h3 className="description-title">상품 소개</h3>
                <div className="description-content">
                  {product.info.description}
                </div>
              </div>
            )}

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h3 className="tags-title">태그</h3>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="product-tag">
                      #{tag.tagType.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 리뷰 섹션 */}
            <div className="product-reviews">
              <h3 className="reviews-title">리뷰 {product.reviewCount}개</h3>
              {product.reviews.length > 0 ? (
                product.reviews.slice(0, 3).map(review => (
                  <div key={review.product_review_id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">구매자 {review.product_review_id}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderRating(review.rating)}
                    </div>
                    <div className="review-content">
                      {review.content}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 모달 모드 (기존 방식)
  return (
    <div 
      className="product-detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="product-detail-container">
        {/* 헤더 */}
        <div className="product-detail-header">
          <div className="product-detail-breadcrumb">
            <a href="#" className="breadcrumb-link">전통주 쇼핑</a> &gt; {product.brewery} &gt; {product.name}
          </div>
          <button 
            className="product-detail-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="product-detail-content">
          {/* 이미지 섹션 */}
          <div className="product-detail-images">
            {hasImages ? (
              <ImageCarousel
                images={productImages}
                mode="detail"
                showNavigation={productImages.length > 1}
                showIndicators={productImages.length > 1}
                showCounter={productImages.length > 1}
                className="product-image-carousel"
                objectFit="contain"
              />
            ) : (
              <div className="product-images-empty">
                <div className="empty-icon">🍶</div>
                <div className="empty-text">상품 이미지 준비 중</div>
              </div>
            )}
          </div>

          {/* 상품 정보 섹션 */}
          <div className="product-detail-info">
            {/* 기본 정보 */}
            <div className="product-basic-info">
              <div className="product-badges">
                {product.isBest && (
                  <span className="product-badge badge-best">베스트</span>
                )}
                {product.isNew && (
                  <span className="product-badge badge-new">신상품</span>
                )}
              </div>

              <div className="product-detail-brewery">{product.brewery}</div>
              <h1 className="product-detail-name">{product.name}</h1>

              <div className="product-rating-section">
                <div className="rating-stars">
                  {renderRating(product.averageRating)}
                </div>
                <span className="rating-score">{product.averageRating.toFixed(1)}</span>
                <span className="rating-count">({product.reviewCount}개 리뷰)</span>
              </div>

              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-icon">🌡</span>
                  <span>{product.alcohol}%</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">🍾</span>
                  <span>{product.volume}ml</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📅</span>
                  <span>{new Date(product.registered_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="product-pricing">
              <div className="price-container">
                {product.originalPrice && product.originalPrice > product.minPrice && (
                  <span className="original-price">
                    {formatPrice(product.originalPrice)}원
                  </span>
                )}
                <span className={`current-price ${discount > 0 ? 'discount-price' : ''}`}>
                  {formatPrice(selectedOption?.price || product.minPrice)}원
                </span>
                {discount > 0 && (
                  <span className="discount-badge">{discount}% 할인</span>
                )}
              </div>
              <div className="price-note">
                배송비 별도 • 무료배송 (5만원 이상 구매 시)
              </div>
            </div>

            {/* 옵션 선택 */}
            {product.options.length > 1 && (
              <div className="product-options">
                <div className="option-title">용량 선택</div>
                <div className="option-list">
                  {product.options.map(option => (
                    <div
                      key={option.product_option_id}
                      className={`option-item ${selectedOption?.product_option_id === option.product_option_id ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className="option-info">
                        <span className="option-volume">{option.volume}ml</span>
                      </div>
                      <span className="option-price">{formatPrice(option.price)}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 수량 선택 */}
            <div className="quantity-selector">
              <div className="quantity-title">수량</div>
              <div className="quantity-controls">
                <div className="quantity-input-group">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max="99"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
                <div className="quantity-total">
                  총 <span className="total-price">{formatPrice(getTotalPrice())}원</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="product-actions">
              <button 
                className="action-button cart-button"
                onClick={handleAddToCart}
                disabled={!selectedOption}
              >
                🛒 장바구니 담기
              </button>
              <button 
                className="action-button buy-button"
                onClick={handleBuyNow}
                disabled={!selectedOption}
              >
                💳 바로구매
              </button>
              <button 
                className={`action-button wishlist-button ${isWishlisted ? 'active' : ''}`}
                onClick={handleToggleWishlist}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* 상품 설명 */}
            {product.info?.description && (
              <div className="product-description">
                <h3 className="description-title">상품 소개</h3>
                <div className="description-content">
                  {product.info.description}
                </div>
              </div>
            )}

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h3 className="tags-title">태그</h3>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="product-tag">
                      #{tag.tagType.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 리뷰 섹션 */}
            <div className="product-reviews">
              <h3 className="reviews-title">리뷰 {product.reviewCount}개</h3>
              {product.reviews.length > 0 ? (
                product.reviews.slice(0, 3).map(review => (
                  <div key={review.product_review_id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">구매자 {review.product_review_id}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderRating(review.rating)}
                    </div>
                    <div className="review-content">
                      {review.content}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;