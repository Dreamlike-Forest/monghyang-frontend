// components/Cart/Cart.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getCartItems, 
  subscribeToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart as clearCartStore,
  getCartItemCount,
  initCart,
  CartItem // CartStore에서 정의한 타입 import
} from './CartStore';
import './Cart.css';

// 주문 요약 타입
interface OrderSummary {
  subtotal: number;
  shipping: number;
  total: number;
}

// 외부 export 유지
export const getCartItemsCount = getCartItemCount;

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  // [헬퍼 함수] 유효한 이미지인지 확인
  const isValidImage = (url: string | undefined) => {
    return url && !url.includes('placeholder') && !url.includes('no-image');
  };

  // 초기 데이터 로드 및 구독 설정
  useEffect(() => {
    // 1. 초기 데이터 로드 요청
    initCart();
    
    // 2. 스토어 상태 구독
    const unsubscribe = subscribeToCart(() => {
      const updatedItems = getCartItems();
      setCartItems(updatedItems);
      setIsLoading(false); // 데이터가 들어오면 로딩 해제
    });

    // 3. 최초 마운트 시 로컬 상태 동기화
    setCartItems(getCartItems());
    
    // 0.5초 뒤 로딩 강제 해제 (데이터가 없어도 화면을 보여주기 위함)
    const timeout = setTimeout(() => setIsLoading(false), 500);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // 주문 요약 계산
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      // 가격 정보는 product 객체 안에 있음
      const price = item.product.minPrice || 0; 
      return sum + (price * item.quantity);
    }, 0);
    
    const shipping = subtotal >= 50000 ? 0 : 3000;
    const finalShipping = subtotal === 0 ? 0 : shipping;
    const total = subtotal + finalShipping;

    setOrderSummary({ subtotal, shipping: finalShipping, total });
  }, [cartItems]);

  // 수량 변경 핸들러
  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.maxQuantity) {
      alert(`최대 주문 가능 수량은 ${item.maxQuantity}개입니다.`);
      return;
    }

    // Optimistic UI (선반영) 대신 로딩 인디케이터를 보여주는 게 좋지만, 
    // 여기서는 Store가 API 호출 후 상태를 업데이트할 때까지 기다림
    await updateCartItemQuantity(item.cart_id, item.quantity, newQuantity);
  };

  // 아이템 삭제 핸들러
  const handleRemoveItem = async (cartId: number) => {
    if (!window.confirm('장바구니에서 삭제하시겠습니까?')) return;
    await removeFromCart(cartId);
  };

  // 전체 삭제 핸들러
  const handleClearCart = async () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      await clearCartStore();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('장바구니에 상품이 없습니다.');
      return;
    }
    alert('주문 결제 페이지로 이동합니다. (구현 예정)');
    // router.push('/order'); 
  };

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          장바구니 정보를 불러오고 있습니다...
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">장바구니</h1>
        <p className="cart-count">
          {cartItems.length > 0 ? `${cartItems.length}개 상품` : '비어있음'}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="empty-cart-title">장바구니가 비어있습니다</h2>
          <p className="empty-cart-description">
            마음에 드는 전통주를 장바구니에 담아보세요!
          </p>
          <button className="continue-shopping-btn" onClick={() => window.location.href = '/?view=shop'}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* 상품 리스트 섹션 */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h2>주문상품 ({cartItems.length}개)</h2>
              <button className="clear-cart-btn" onClick={handleClearCart}>
                전체 삭제
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemPrice = item.product.minPrice || 0;
                const itemVolume = item.product.volume;

                return (
                  <div key={item.cart_id} className="cart-item">
                    {/* 이미지 영역 */}
                    <div className="cart-item-image">
                      {isValidImage(item.product.image_key) ? (
                        <img 
                          src={item.product.image_key} 
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.removeAttribute('style');
                          }}
                        />
                      ) : null}
                      <div 
                        className="cart-item-image-placeholder"
                        style={{ display: isValidImage(item.product.image_key) ? 'none' : 'flex' }}
                      >
                        <div>🍶</div>
                      </div>
                    </div>

                    {/* 정보 영역 */}
                    <div className="cart-item-info">
                      <div className="cart-item-brewery">{item.product.brewery}</div>
                      <h3 className="cart-item-name">{item.product.name}</h3>
                      <div className="cart-item-specs">
                        {itemVolume}ml | {item.product.alcohol}%
                      </div>
                    </div>

                    {/* 수량 조절 영역 */}
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        +
                      </button>
                    </div>

                    {/* 가격 및 삭제 버튼 */}
                    <div className="cart-item-actions">
                      <div className="cart-item-price">
                        {(itemPrice * item.quantity).toLocaleString()}원
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(item.cart_id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 결제 요약 섹션 */}
          <div className="cart-summary-section">
            <div className="cart-summary">
              <h3 className="cart-summary-title">주문요약</h3>

              <div className="summary-row">
                <span className="summary-label">상품금액</span>
                <span className="summary-value">{orderSummary.subtotal.toLocaleString()}원</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">배송비</span>
                <span className="summary-value">
                  {orderSummary.shipping === 0 ? '무료배송' : `${orderSummary.shipping.toLocaleString()}원`}
                </span>
              </div>

              <div className="summary-row summary-total">
                <span className="summary-label">총 주문금액</span>
                <span className="summary-value">{orderSummary.total.toLocaleString()}원</span>
              </div>

              {orderSummary.subtotal < 50000 && orderSummary.subtotal > 0 && (
                <div className="free-shipping-notice">
                  {(50000 - orderSummary.subtotal).toLocaleString()}원 더 주문하시면 무료배송입니다!
                </div>
              )}

              <button className="checkout-btn" onClick={handleCheckout}>
                주문하기
              </button>

              <div className="cart-notice">
                <div>• 50,000원이상 주문시 무료배송입니다.</div>
                <div>• 전통주는 19세 이상만 구매 가능합니다</div>
                <div>• 파손 위험이 있어 안전포장 후 배송됩니다</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;