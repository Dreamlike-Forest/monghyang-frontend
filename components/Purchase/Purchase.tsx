'use client';

import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../../utils/userApi';
import { getImageUrl } from '../../utils/shopApi';
import './Purchase.css';

// 외부 설정 간섭을 피하기 위해 URL 직접 정의
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

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

  // [수정] 배송비 로직 제거
  const totalProductPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = 0; // 배송비 0원으로 고정
  const finalAmount = totalProductPrice + shippingFee; // 최종 결제금액 = 상품금액

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

  // [핵심] 외부 간섭 없는 순수 Fetch 함수
  const sendFormData = async (endpoint: string, formData: FormData) => {
    const sessionId = localStorage.getItem('sessionId');
    
    console.log(`[API 요청 시작] ${endpoint}`);
    
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`   👉 Key: ${key}, Value: ${value}`);
    });

    const response = await window.fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        // Content-Type 생략 (브라우저가 boundary 자동 생성)
        ...(sessionId && { 'X-Session-Id': sessionId }),
      },
      body: formData,
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API 에러] Status: ${response.status}`, errorText);
      
      let errorMessage = '요청 실패';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.content;
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
      const sanitizedPhone = buyerPhone.replace(/-/g, ''); 
      
      let pgOrderId = '';

      // 1단계: 주문 준비 (Prepare)
      try {
        const prepareFormData = new FormData();
        
        if (cartIds.length > 0) {
          cartIds.forEach((id) => {
            prepareFormData.append('cart_id', String(id));
          });
        }
        prepareFormData.append('payer_name', buyerName.trim());
        prepareFormData.append('payer_phone', sanitizedPhone.trim());
        prepareFormData.append('address', address.trim());
        prepareFormData.append('address_detail', (addressDetail || ' ').trim());

        // userId는 Query Param으로 전달
        pgOrderId = await sendFormData(
          `/api/orders/prepare?userId=${userId}`,
          prepareFormData
        );
        
        console.log('✅ [1단계 성공] Order ID:', pgOrderId);

      } catch (error: any) {
        alert(`주문 생성 실패: ${error.message}`);
        return; 
      }

      if (!pgOrderId) {
        alert('주문 번호를 발급받지 못했습니다. 다시 시도해주세요.');
        return;
      }

      // 2. 결제 확인
      const confirmed = window.confirm(`총 ${finalAmount.toLocaleString()}원을 결제하시겠습니까?`);
      if (!confirmed) return;

      // ============================================================
      // 2단계: 결제 승인 (Approve)
      // ============================================================
      try {
        const approveFormData = new FormData();
        
        approveFormData.append('pg_order_id', pgOrderId);
        approveFormData.append('pg_payment_key', `TEST_PAYMENT_${Date.now()}`);
        
        // [중요] 소수점 2자리 포맷팅 (서버 요구사항)
        // 배송비가 0원이므로 상품 총액만 전송됩니다.
        approveFormData.append('total_amount', finalAmount.toFixed(2));

        await sendFormData(
          `/api/orders/request?userId=${userId}`,
          approveFormData
        );
        
        console.log('✅ [2단계 성공] 결제 승인 완료');
        
        // 성공 후처리
        sessionStorage.removeItem('checkoutItems');
        
        alert('주문이 정상적으로 완료되었습니다!');
        
        // DB 반영 시간을 위해 0.5초 지연 후 이동
        setTimeout(() => {
          window.location.href = '/?view=order-history';
        }, 500);

      } catch (error: any) {
        alert(`결제 승인 실패:\n${error.message}`);
      }

    } catch (error: any) {
      console.error('시스템 오류:', error);
      alert(`알 수 없는 오류가 발생했습니다: ${error.message}`);
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
              <div className="method-desc">신용/체크카드 (테스트)</div>
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