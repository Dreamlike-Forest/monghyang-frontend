'use client';

import React, { useState, useEffect, useRef } from 'react';
import ImageCarousel from '../../community/ImageCarousel/ImageCarousel';
import { ProductWithDetails, ProductOption } from '../../../types/mockData';
import { PostImage } from '../../../types/community';
import { addToCart } from '../../Cart/CartStore';
import { getMyCart } from '../../../utils/cartApi';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
import './ProductDetail.css';

interface ProductDetailProps {
  product: ProductWithDetails;
  onClose: () => void;
  onAddToCart?: (productId: number, optionId: number, quantity: number) => void;
  onBuyNow?: (productId: number, optionId: number, quantity: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isOpen: boolean;
  isPageMode?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onAddToCart: propOnAddToCart,
  onBuyNow: propOnBuyNow,
  onToggleWishlist,
  isOpen,
  isPageMode = false
}) => {
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (product.options && product.options.length > 0) {
        setSelectedOption(product.options[0]);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, product.options]);

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

  // [수정됨] handleOverlayClick 함수를 여기서 명확하게 정의합니다.
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleAddToCart = async () => {
    const canProceed = checkAuthAndPrompt('장바구니 담기');
    if (!canProceed) return;

    if (selectedOption) {
      const success = await addToCart(product, selectedOption.product_option_id, quantity);
      if (success) {
        alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
        if (propOnAddToCart) propOnAddToCart(product.product_id, selectedOption.product_option_id, quantity);
      }
    }
  };

  const handleBuyNow = async () => {
    const canProceed = checkAuthAndPrompt('구매 기능');
    if (!canProceed) return;

    if (!selectedOption) return;

    try {
      // 1. 장바구니에 담기
      const success = await addToCart(product, selectedOption.product_option_id, quantity);
      if (!success) return;

      // 2. 최신 장바구니 목록 조회
      const cartList = await getMyCart();
      const targetItem = cartList.find(item => 
        String(item.product_id) === String(product.product_id)
      );

      if (targetItem) {
        // 3. 데이터 구성
        const checkoutItem = [{
          cart_id: targetItem.cart_id,
          product_id: product.product_id,
          product_name: product.name,
          image_key: product.image_key,
          quantity: quantity,
          price: selectedOption.price,
          brewery_name: product.brewery
        }];
        
        // 4. 저장 및 이동
        sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutItem));
        window.location.href = '/?view=purchase';
      } else {
        alert('구매 페이지 이동 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('바로구매 처리 실패:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) onToggleWishlist(product.product_id);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) setQuantity(newQuantity);
  };

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOption(option);
    setQuantity(1);
  };

  const convertToPostImages = (images: typeof product.images): PostImage[] => {
    if (!images) return [];
    return [...images]
      .sort((a, b) => a.seq - b.seq)
      .map((image) => ({
        image_id: image.product_image_id,
        image_url: image.key,
        image_order: image.seq,
        alt_text: `${product.name} 상품 이미지 ${image.seq}`
      }));
  };

  const formatPrice = (price: number): string => price.toLocaleString();
  const getTotalPrice = (): number => selectedOption ? selectedOption.price * quantity : 0;

  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="rating-star">{i < rating ? '★' : '☆'}</span>
    ));
  };

  if (!isOpen) return null;

  const hasImages = product.images && product.images.length > 0;
  const productImages = hasImages ? convertToPostImages(product.images) : [];
  const discount = product.originalPrice && product.minPrice < product.originalPrice 
    ? Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  // 공통 렌더링 콘텐츠
  const content = (
    <>
      <div className="product-detail-header">
        <div className="product-detail-breadcrumb">
          <button onClick={onClose} className="breadcrumb-link" style={{ background:'none', border:'none', color:'#8b5a3c', cursor:'pointer', textDecoration:'underline', fontSize:'14px' }}>
            ← 전통주 쇼핑
          </button> &gt; {product.brewery} &gt; {product.name}
        </div>
        {!isPageMode && (
          <button className="product-detail-close" onClick={onClose}>×</button>
        )}
      </div>

      <div className="product-detail-content">
        <div className="product-detail-images">
          {hasImages ? (
            <ImageCarousel images={productImages} mode="detail" showNavigation={productImages.length > 1} showIndicators={productImages.length > 1} className="product-image-carousel" objectFit="contain" />
          ) : (
            <div className="product-images-empty"><div className="empty-icon">🍶</div><div className="empty-text">이미지 준비 중</div></div>
          )}
        </div>

        <div className="product-detail-info">
          <div className="product-basic-info">
            <div className="product-badges">
              {product.isBest && <span className="product-badge badge-best">베스트</span>}
              {product.isNew && <span className="product-badge badge-new">신상품</span>}
            </div>
            <div className="product-detail-brewery">{product.brewery}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-rating-section">
              <div className="rating-stars">{renderRating(product.averageRating)}</div>
              <span className="rating-score">{product.averageRating.toFixed(1)}</span>
              <span className="rating-count">({product.reviewCount}개 리뷰)</span>
            </div>
            <div className="product-specs">
              <div className="spec-item"><span>🌡 {product.alcohol}%</span></div>
              <div className="spec-item"><span>🍾 {product.volume}ml</span></div>
            </div>
          </div>

          <div className="product-pricing">
            <div className="price-container">
              {product.originalPrice && product.originalPrice > product.minPrice && (
                <span className="original-price">{formatPrice(product.originalPrice)}원</span>
              )}
              <span className={`current-price ${discount > 0 ? 'discount-price' : ''}`}>
                {formatPrice(selectedOption?.price || product.minPrice)}원
              </span>
              {discount > 0 && <span className="discount-badge">{discount}% 할인</span>}
            </div>
            <div className="price-note">배송비 별도 • 5만원 이상 무료배송</div>
          </div>

          {product.options && product.options.length > 1 && (
            <div className="product-options">
              <div className="option-title">용량 선택</div>
              <div className="option-list">
                {product.options.map(option => (
                  <div key={option.product_option_id} className={`option-item ${selectedOption?.product_option_id === option.product_option_id ? 'selected' : ''}`} onClick={() => handleOptionSelect(option)}>
                    <span className="option-volume">{option.volume}ml</span>
                    <span className="option-price">{formatPrice(option.price)}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="quantity-selector">
            <div className="quantity-title">수량</div>
            <div className="quantity-controls">
              <div className="quantity-input-group">
                <button className="quantity-btn" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>-</button>
                <input type="number" className="quantity-input" value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} />
                <button className="quantity-btn" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= 99}>+</button>
              </div>
              <div className="quantity-total">총 <span className="total-price">{formatPrice(getTotalPrice())}원</span></div>
            </div>
          </div>

          <div className="product-actions">
            <button className="action-button cart-button" onClick={handleAddToCart} disabled={!selectedOption}>🛒 장바구니 담기</button>
            <button className="action-button buy-button" onClick={handleBuyNow} disabled={!selectedOption}>💳 바로구매</button>
            <button className={`action-button wishlist-button ${isWishlisted ? 'active' : ''}`} onClick={handleToggleWishlist}>{isWishlisted ? '❤️' : '🤍'}</button>
          </div>

          {product.info?.description && (
            <div className="product-description">
              <h3 className="description-title">상품 소개</h3>
              <div className="description-content">{product.info.description}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isPageMode) {
    return (
      <div className="product-detail-container" style={{ maxWidth: 'none', margin: 0, borderRadius: 0, minHeight: '100vh' }}>
        {content}
      </div>
    );
  }

  return (
    <div 
      className="product-detail-overlay" 
      ref={overlayRef} 
      onClick={handleOverlayClick} // 이제 정상적으로 인식됩니다.
    >
      <div className="product-detail-container">
        {content}
      </div>
    </div>
  );
};

export default ProductDetail;