'use client';

import React, { useState, useEffect, useRef } from 'react';
import ImageCarousel from '../../community/ImageCarousel/ImageCarousel';
import type { ProductWithDetails } from '../../../types/shop';
import { PostImage } from '../../../types/community';
import { addToCart } from '../../Cart/CartStore';
import { getMyCart } from '../../../utils/cartApi';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
import './ProductDetail.css';

interface ProductDetailProps {
  product: ProductWithDetails;
  onClose: () => void;
  onAddToCart?: (productId: number) => void;
  onBuyNow?: (productId: number) => void;
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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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

  const handleAddToCart = async () => {
    const canProceed = checkAuthAndPrompt('장바구니 담기');
    if (!canProceed) return;

    const success = await addToCart(product);
    if (success) {
      alert(`${product.product_name}이(가) 장바구니에 담겼습니다.`);
      if (propOnAddToCart) propOnAddToCart(product.product_id);
    }
  };

  const handleBuyNow = async () => {
    const canProceed = checkAuthAndPrompt('구매 기능');
    if (!canProceed) return;

    try {
      const success = await addToCart(product);
      if (!success) return;

      const cartList = await getMyCart();
      const targetItem = cartList.find(item => 
        String(item.product_id) === String(product.product_id)
      );

      if (targetItem) {
        const checkoutItem = [{
          cart_id: targetItem.cart_id,
          product_id: product.product_id,
          product_name: product.product_name,
          image_key: product.image_key,
          quantity: quantity,
          price: product.product_final_price,
          brewery_name: product.user_nickname
        }];
        
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

  const convertToPostImages = (): PostImage[] => {
    if (!product.product_image_image_key || product.product_image_image_key.length === 0) return [];
    
    return [...product.product_image_image_key]
      .sort((a, b) => (a.product_image_seq || 0) - (b.product_image_seq || 0))
      .map((image, index) => ({
        image_id: index,
        image_url: image.product_image_image_key,
        image_order: image.product_image_seq || index,
        alt_text: `${product.product_name} 상품 이미지 ${index + 1}`
      }));
  };

  const formatPrice = (price: number): string => price.toLocaleString();
  const getTotalPrice = (): number => product.product_final_price * quantity;

  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="rating-star">{i < rating ? '★' : '☆'}</span>
    ));
  };

  if (!isOpen) return null;

  const productImages = convertToPostImages();
  const hasImages = productImages.length > 0;
  const discount = product.product_discount_rate || 0;
  const averageRating = product.product_review_star || 0;
  const reviewCount = product.product_review_count || 0;

  const isBest = (product.product_review_star || 0) >= 4.5;
  const isNew = (() => {
    if (!product.product_registered_at) return false;
    const registeredDate = new Date(product.product_registered_at);
    const now = new Date();
    const daysDiff = (now.getTime() - registeredDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  })();

  const content = (
    <>
      <div className="product-detail-header">
        <div className="product-detail-breadcrumb">
          <button onClick={onClose} className="breadcrumb-link" style={{ background:'none', border:'none', color:'#8b5a3c', cursor:'pointer', textDecoration:'underline', fontSize:'14px' }}>
            ← 전통주 쇼핑
          </button> &gt; {product.user_nickname} &gt; {product.product_name}
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
              {isBest && <span className="product-badge badge-best">베스트</span>}
              {isNew && <span className="product-badge badge-new">신상품</span>}
            </div>
            <div className="product-detail-brewery">{product.user_nickname}</div>
            <h1 className="product-detail-name">{product.product_name}</h1>
            <div className="product-rating-section">
              <div className="rating-stars">{renderRating(averageRating)}</div>
              <span className="rating-score">{averageRating.toFixed(1)}</span>
              <span className="rating-count">({reviewCount}개 리뷰)</span>
            </div>
            <div className="product-specs">
              <div className="spec-item"><span>🌡 {product.product_alcohol}%</span></div>
              <div className="spec-item"><span>🍾 {product.product_volume}ml</span></div>
            </div>
          </div>

          <div className="product-pricing">
            <div className="price-container">
              {discount > 0 && product.product_origin_price > product.product_final_price && (
                <span className="original-price">{formatPrice(product.product_origin_price)}원</span>
              )}
              <span className={`current-price ${discount > 0 ? 'discount-price' : ''}`}>
                {formatPrice(product.product_final_price)}원
              </span>
              {discount > 0 && <span className="discount-badge">{discount}% 할인</span>}
            </div>
            <div className="price-note">배송비 별도 • 5만원 이상 무료배송</div>
          </div>

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
            <button className="action-button cart-button" onClick={handleAddToCart}>🛒 장바구니 담기</button>
            <button className="action-button buy-button" onClick={handleBuyNow}>💳 바로구매</button>
            <button className={`action-button wishlist-button ${isWishlisted ? 'active' : ''}`} onClick={handleToggleWishlist}>{isWishlisted ? '❤️' : '🤍'}</button>
          </div>

          {product.product_description && (
            <div className="product-description">
              <h3 className="description-title">상품 소개</h3>
              <div className="description-content">{product.product_description}</div>
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
      onClick={handleOverlayClick}
    >
      <div className="product-detail-container">
        {content}
      </div>
    </div>
  );
};

export default ProductDetail;