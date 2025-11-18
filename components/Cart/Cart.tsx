'use client';

import { useState, useEffect } from 'react';
import { ProductWithDetails } from '../../types/mockData';
import { 
  addToCart as addToCartStore, 
  getCartItems, 
  subscribeToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart as clearCartStore,
  getCartItemCount,
  debugCartState
} from './CartStore';
import './Cart.css';

// 장바구니 아이템 타입 (CartStore.ts와 동일)
interface CartItem {
  product: ProductWithDetails;
  selectedOptionId: number;
  quantity: number;
  maxQuantity: number;
  addedAt: string;
}

// 주문 요약 타입
interface OrderSummary {
  subtotal: number;
  shipping: number;
  total: number;
}

// 외부에서 사용할 수 있는 함수들 - CartStore 함수들을 그대로 export
export const addToCart = addToCartStore;
export const getCartItemsCount = getCartItemCount;

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  // 컴포넌트 마운트 시 초기화 - localStorage에서 데이터 로드
  useEffect(() => {
    console.log('Cart 컴포넌트 마운트 - localStorage에서 데이터 로드');
    
    // 약간의 지연을 두어 localStorage 로드 완료 보장
    const loadTimer = setTimeout(() => {
      try {
        // 초기 데이터 로드 (localStorage에서 자동 로드됨)
        const initialItems = getCartItems();
        console.log('초기 장바구니 아이템:', initialItems.length, '개');
        setCartItems(initialItems);
        
        // 디버그 정보 출력
        if (process.env.NODE_ENV === 'development') {
          debugCartState();
        }
      } catch (error) {
        console.error('장바구니 초기 로드 오류:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 100);

    // 상태 변경 리스너 등록
    const unsubscribe = subscribeToCart(() => {
      console.log('Cart 컴포넌트: 장바구니 변경 감지');
      try {
        const updatedItems = getCartItems();
        console.log('업데이트된 아이템:', updatedItems.length, '개');
        setCartItems(updatedItems);
      } catch (error) {
        console.error('장바구니 업데이트 오류:', error);
      }
    });

    return () => {
      clearTimeout(loadTimer);
      unsubscribe();
    };
  }, []);

  // 주문 요약 계산
  useEffect(() => {
    try {
      const subtotal = cartItems.reduce((sum, item) => {
        const selectedOption = item.product.options.find(
          option => option.product_option_id === item.selectedOptionId
        );
        const price = selectedOption?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      
      const shipping = subtotal >= 50000 ? 0 : 3000;
      const total = subtotal + shipping;

      setOrderSummary({ subtotal, shipping, total });
    } catch (error) {
      console.error('주문 요약 계산 오류:', error);
      setOrderSummary({ subtotal: 0, shipping: 0, total: 0 });
    }
  }, [cartItems]);

  // 선택된 옵션의 가격 가져오기
  const getSelectedOptionPrice = (item: CartItem): number => {
    try {
      const selectedOption = item.product.options.find(
        option => option.product_option_id === item.selectedOptionId
      );
      return selectedOption?.price || 0;
    } catch (error) {
      console.error('옵션 가격 조회 오류:', error);
      return 0;
    }
  };

  // 선택된 옵션의 용량 가져오기
  const getSelectedOptionVolume = (item: CartItem): number => {
    try {
      const selectedOption = item.product.options.find(
        option => option.product_option_id === item.selectedOptionId
      );
      return selectedOption?.volume || item.product.volume;
    } catch (error) {
      console.error('옵션 용량 조회 오류:', error);
      return item.product.volume;
    }
  };

  // 수량 변경
  const updateQuantity = (productId: number, optionId: number, newQuantity: number) => {
    console.log('수량 변경 요청:', productId, optionId, newQuantity);
    try {
      updateCartItemQuantity(productId, optionId, newQuantity);
    } catch (error) {
      console.error('수량 변경 오류:', error);
      alert('수량 변경 중 오류가 발생했습니다.');
    }
  };

  // 아이템 제거
  const removeItem = (productId: number, optionId: number) => {
    console.log('아이템 제거 요청:', productId, optionId);
    try {
      removeFromCart(productId, optionId);
    } catch (error) {
      console.error('아이템 제거 오류:', error);
      alert('상품 제거 중 오류가 발생했습니다.');
    }
  };

  // 장바구니 전체 비우기
  const clearCartHandler = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      try {
        clearCartStore();
      } catch (error) {
        console.error('장바구니 비우기 오류:', error);
        alert('장바구니 비우기 중 오류가 발생했습니다.');
      }
    }
  };

  // 주문하기
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('장바구니에 상품이 없습니다.');
      return;
    }
    
    try {
      console.log('주문 진행:', {
        items: cartItems.length,
        total: orderSummary.total
      });
      alert('주문 기능이 구현될 예정입니다!');
    } catch (error) {
      console.error('주문 처리 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  // 쇼핑 계속하기
  const continueShopping = () => {
    try {
      window.location.href = '/?view=shop';
    } catch (error) {
      console.error('페이지 이동 오류:', error);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          장바구니를 불러오는 중...
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
          <button className="continue-shopping-btn" onClick={continueShopping}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h2>주문상품 ({cartItems.length}개)</h2>
              <button className="clear-cart-btn" onClick={clearCartHandler}>
                전체 삭제
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                try {
                  const itemPrice = getSelectedOptionPrice(item);
                  const itemVolume = getSelectedOptionVolume(item);
                  
                  return (
                    <div key={`${item.product.product_id}-${item.selectedOptionId}`} className="cart-item">
                      <div className="cart-item-image">
                        <div className="cart-item-image-placeholder">
                          <div>🍶</div>
                        </div>
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-brewery">{item.product.brewery}</div>
                        <h3 className="cart-item-name">{item.product.name}</h3>
                        <div className="cart-item-specs">
                          {itemVolume}ml | {item.product.alcohol}%
                        </div>
                      </div>

                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product.product_id, item.selectedOptionId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            updateQuantity(item.product.product_id, item.selectedOptionId, newQuantity);
                          }}
                          min="1"
                          max={item.maxQuantity}
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product.product_id, item.selectedOptionId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-item-price">
                          {(itemPrice * item.quantity).toLocaleString()}원
                        </div>
                        <button
                          className="remove-item-btn"
                          onClick={() => removeItem(item.product.product_id, item.selectedOptionId)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                } catch (itemError) {
                  console.error('장바구니 아이템 렌더링 오류:', itemError, item);
                  return (
                    <div key={`error-${item.product.product_id}-${item.selectedOptionId}`} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">상품 정보를 불러올 수 없습니다</div>
                        <button
                          className="remove-item-btn"
                          onClick={() => removeItem(item.product.product_id, item.selectedOptionId)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>

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

              {orderSummary.subtotal < 50000 && (
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
                <div>• 배송일정: 주문 후 2-3일 (주말/공휴일 제외)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;