'use client';

import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../../utils/userApi';
import { prepareOrderApi, approveOrderApi } from '../../utils/orderApi';
import { getImageUrl } from '../../utils/shopApi';
import { clearCart } from '../Cart/CartStore'; 
import './Purchase.css';

interface CheckoutItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  image_key: string;
  quantity: number;
  price: number;
  brewery_name: string;
}

const Purchase: React.FC = () => {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [deliveryMemo, setDeliveryMemo] = useState('문 앞');

  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      alert('잘못된 접근입니다. 상품을 다시 선택해주세요.');
      window.location.href = '/';
    }

    const fetchUserInfo = async () => {
      try {
        const info = await getUserInfo();
        if (info) {
          setUserInfo(info);
          setBuyerName(info.users_name || info.name || '');
          setBuyerPhone(info.users_phone || info.phone || '');
          setAddress(info.users_address || info.address || '');
          setAddressDetail(info.users_address_detail || info.address_detail || '');
        }
      } catch (e) {
        console.error('유저 정보 로드 실패', e);
      }
    };
    fetchUserInfo();
  }, []);

  const totalProductPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = totalProductPrice >= 50000 ? 0 : 3000;
  const finalAmount = totalProductPrice + shippingFee;

  const getUserId = () => {
    if (userInfo && (userInfo.userId || userInfo.users_id || userInfo.id)) {
      return userInfo.userId || userInfo.users_id || userInfo.id;
    }
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        return parsed.userId || parsed.user_id || parsed.id || parsed.users_id;
      }
    } catch (e) {
      console.error('ID 파싱 실패', e);
    }
    return null;
  };

  const handlePayment = async () => {
    if (!buyerName || !buyerPhone || !address) {
      alert('배송지 정보를 모두 입력해주세요.');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('로그인 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const cartIds = items.map(item => Number(item.cart_id));
      const sanitizedPhone = buyerPhone.replace(/-/g, ''); // 하이픈 제거
      
      let orderId = '';

      // 1. 주문 준비 (Prepare)
      try {
        console.log('🚀 [API] 주문 준비 요청 (FormData):', {
          userId,
          cart_id: cartIds,
          payer_name: buyerName,
          payer_phone: sanitizedPhone
        });

        orderId = await prepareOrderApi(userId, {
          cart_id: cartIds,
          payer_name: buyerName,
          payer_phone: sanitizedPhone,
          address: address,
          address_detail: addressDetail || ' '
        });
        console.log('✅ [API] 주문 ID 발급:', orderId);

      } catch (prepareError: any) {
        console.error('❌ [API] 주문 준비 실패:', prepareError);
        
        const serverMsg = prepareError.response?.data?.message || '알 수 없는 오류';
        alert(`주문 생성에 실패했습니다.\n사유: ${serverMsg}`);
        return; // 실패 시 여기서 중단
      }

      if (!orderId) {
        alert('주문 번호를 발급받지 못했습니다.');
        return;
      }

      // 2. 결제 준비중 알림
      alert('결제 시스템이 준비중입니다.\n(확인을 누르면 주문이 완료 처리됩니다)');

      // 3. 결제 승인 (Approve)
      try {
        await approveOrderApi(userId, {
          pg_order_id: orderId,
          pg_payment_key: `TEST_PAYMENT_${Date.now()}`, 
          total_amount: finalAmount
        });
        console.log('✅ [API] 결제 승인 성공');
      } catch (approveError: any) {
        console.error('❌ [API] 결제 승인 실패:', approveError);
        const msg = approveError.response?.data?.message || '승인 처리 중 오류';
        alert(`결제 승인 실패: ${msg}`);
        return; // 승인 실패 시 중단
      }

      // 4. 성공 시 마무리 (장바구니 비우기 & 이동)
      await clearCart();
      sessionStorage.removeItem('checkoutItems');
      
      alert('주문이 정상적으로 완료되었습니다!');
      window.location.href = '/?view=order-history'; 

    } catch (error) {
      console.error('주문 프로세스 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  const getProductImage = (key: string) => {
    return getImageUrl(key);
  };

  return (
    <div className="purchase-container">
      <h1 className="purchase-title">주문/결제</h1>

      <div className="purchase-layout">
        <div className="purchase-left">
          <section className="purchase-section">
            <h2 className="section-header">배송 정보</h2>
            <div className="info-table">
              <div className="info-row">
                <span className="info-label">받는 분</span>
                <input className="info-input" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="이름" />
              </div>
              <div className="info-row">
                <span className="info-label">연락처</span>
                <input className="info-input" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="010-0000-0000" />
              </div>
              <div className="info-row">
                <span className="info-label">주소</span>
                <div className="address-group">
                  <input className="info-input full" value={address} readOnly placeholder="기본 주소" />
                  <input className="info-input full" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} placeholder="상세 주소 입력" />
                </div>
              </div>
              <div className="info-row">
                 <span className="info-label">배송메모</span>
                 <select className="info-select" value={deliveryMemo} onChange={(e) => setDeliveryMemo(e.target.value)}>
                    <option>문 앞</option><option>경비실</option><option>택배함</option>
                 </select>
              </div>
            </div>
          </section>

          <section className="purchase-section">
            <h2 className="section-header">주문 상품 ({items.length}개)</h2>
            <div className="order-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="purchase-item">
                  <div className="purchase-item-img">
                    {item.image_key ? (
                      <img src={getProductImage(item.image_key)} alt={item.product_name} />
                    ) : (
                      <div style={{width:'100%', height:'100%', background:'#eee'}}></div>
                    )}
                  </div>
                  <div className="purchase-item-info">
                    <div className="item-brewery">{item.brewery_name}</div>
                    <div className="item-name">{item.product_name}</div>
                    <div className="item-meta">{item.quantity}개 / {(item.price * item.quantity).toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="purchase-right">
          <div className="payment-summary-box">
            <h2 className="summary-header">결제 정보</h2>
            <div className="summary-row">
              <span>총 상품금액</span>
              <span>{totalProductPrice.toLocaleString()} 원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{shippingFee.toLocaleString()} 원</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>최종 결제금액</span>
              <span className="total-price">{finalAmount.toLocaleString()} 원</span>
            </div>
            
            <div className="payment-method-box">
              <div className="method-title">결제 수단</div>
              <div className="method-desc">신용/체크카드</div>
            </div>

            <button className="payment-btn" onClick={handlePayment}>
              {finalAmount.toLocaleString()}원 결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;