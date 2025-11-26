'use client';

import { useState, useEffect } from 'react';
import { 
  getCartItems, 
  subscribeToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart as clearCartStore, 
  getCartItemCount,
  initCart,
  CartItem 
} from './CartStore';
import './Cart.css';

interface OrderSummary {
  subtotal: number;
  shipping: number;
  total: number;
}

export const getCartItemsCount = getCartItemCount;

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  const isValidImage = (url: string | undefined) => {
    return url && !url.includes('placeholder') && !url.includes('no-image');
  };

  useEffect(() => {
    initCart();
    
    const unsubscribe = subscribeToCart(() => {
      const updatedItems = getCartItems();
      setCartItems(updatedItems);
      setIsLoading(false);
    });

    setCartItems(getCartItems());
    
    const timeout = setTimeout(() => setIsLoading(false), 500);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.minPrice || 0; 
      return sum + (price * item.quantity);
    }, 0);
    
    // [수정] 배송비 무조건 0원으로 고정
    const shipping = 0; 
    const total = subtotal + shipping;

    setOrderSummary({ subtotal, shipping, total });
  }, [cartItems]);

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.maxQuantity) {
      alert(`최대 주문 가능 수량은 ${item.maxQuantity}개입니다.`);
      return;
    }
    await updateCartItemQuantity(item.cart_id, item.quantity, newQuantity);
  };

  const handleRemoveItem = async (cartId: number) => {
    if (!window.confirm('장바구니에서 삭제하시겠습니까?')) return;
    await removeFromCart(cartId);
  };

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
    
    const checkoutData = cartItems.map(item => ({
      cart_id: item.cart_id,
      product_id: item.product.product_id,
      product_name: item.product.name,
      image_key: item.product.image_key,
      quantity: item.quantity,
      price: item.product.minPrice || 0,
      brewery_name: item.product.brewery
    }));

    sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutData));
    window.location.href = '/?view=purchase';
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
                  {/* [수정] 배송비 0원 고정 표시 */}
                  0원
                </span>
              </div>

              <div className="summary-row summary-total">
                <span className="summary-label">총 주문금액</span>
                <span className="summary-value">{orderSummary.total.toLocaleString()}원</span>
              </div>

              {/* [수정] 무료 배송 알림 문구 제거 */}

              <button className="checkout-btn" onClick={handleCheckout}>
                주문하기
              </button>

              <div className="cart-notice">
                {/* [수정] 안내 문구 변경 */}
                <div>• 전 상품 무료배송입니다.</div>
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