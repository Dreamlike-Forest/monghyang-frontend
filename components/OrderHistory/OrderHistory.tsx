'use client';

import { useState, useEffect } from 'react';
import { Order, OrdersByDate } from '../../types/orderTypes';
import { getMyOrderHistoryApi, cancelOrderItemApi } from '../../utils/orderApi';
import { getUserInfo } from '../../utils/userApi';
import { getImageUrl as getShopImageUrl } from '../../utils/shopApi';
import './OrderHistory.css';

const OrderHistory: React.FC = () => {
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '결제대기';
      case 'PAID': return '결제완료';
      case 'CREATED': return '주문접수';
      case 'ALLOCATED': return '상품준비중';
      case 'SHIPPED': return '배송중';
      case 'DELIVERED': return '배송완료';
      case 'CANCELED': return '취소 완료'; 
      case 'CANCELLED': return '취소 완료'; 
      case 'FAILED': return '결제실패';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PAID': 
      case 'CREATED': return 'status-paid';
      case 'SHIPPED': 
      case 'DELIVERED': return 'status-shipped';
      case 'CANCELED': 
      case 'CANCELLED':
      case 'FAILED': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const extractUserId = (data: any): number | null => {
    if (!data) return null;
    return data.userId || data.user_id || data.users_id || data.id || data.no || null;
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let userId: number | null = null;

      try {
        const localData = localStorage.getItem('userData');
        if (localData) {
          const parsed = JSON.parse(localData);
          userId = extractUserId(parsed);
        }
      } catch (e) {
        console.error('LocalStorage parsing error', e);
      }

      if (!userId) {
        const userInfo = await getUserInfo();
        userId = extractUserId(userInfo);
      }

      if (!userId) {
        alert('로그인 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
        window.location.href = '/?view=login';
        setIsLoading(false);
        return;
      }

      const apiData = await getMyOrderHistoryApi(userId, 0);
      
      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        groupOrdersByDate(apiData);
      } else {
        setOrdersByDate([]);
      }
    } catch (error) {
      console.error('주문 내역 로드 실패:', error);
      setOrdersByDate([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupOrdersByDate = (orderList: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    
    orderList.forEach(order => {
      const dateStr = order.order_created_at || new Date().toISOString();
      const date = dateStr.split('T')[0];
      
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(order);
    });
    
    const sorted = Object.entries(grouped)
      .map(([date, orders]) => ({ 
        date, 
        orders: orders.sort((a, b) => b.order_id - a.order_id) 
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    setOrdersByDate(sorted);
  };

  const formatDate = (s: string) => s.split('T')[0];
  const getImageUrl = (k: string | null | undefined) => getShopImageUrl(k);

  // [핵심] 주소와 배송메모를 분리하는 파싱 함수
  const parseAddressInfo = (fullDetail: string) => {
    if (!fullDetail) return { detail: '', memo: '' };
    
    // "(배송메모: ...)" 패턴 찾기
    const match = fullDetail.match(/^(.*?)\s*\(배송메모:\s*(.*)\)$/);
    if (match) {
      return { detail: match[1], memo: match[2] };
    }
    return { detail: fullDetail, memo: '' };
  };

  const handleCancelOrder = async (orderItemId: number) => {
    if (!window.confirm('정말로 이 상품의 주문을 취소하시겠습니까?')) return;
    
    try {
      const localData = localStorage.getItem('userData');
      let userId = localData ? extractUserId(JSON.parse(localData)) : null;
      
      if (!userId) {
         const info = await getUserInfo();
         userId = extractUserId(info);
      }

      if (!userId) {
        alert('사용자 정보를 찾을 수 없어 취소할 수 없습니다.');
        return;
      }

      const response = await cancelOrderItemApi(userId, orderItemId);
      
      if (response && response.message) {
          alert(response.message);
      } else {
          alert('주문이 정상적으로 취소되었습니다.');
      }
      
      loadOrders(); 

    } catch (error: any) {
      console.error('주문 취소 에러:', error);
      if (error.message && error.message.includes('404')) {
        alert('이미 취소되었거나 존재하지 않는 주문입니다. 목록을 갱신합니다.');
        loadOrders();
      } else {
        const errorMsg = error.response?.data?.message || '취소 요청 처리 중 오류가 발생했습니다.';
        alert(`취소 실패: ${errorMsg}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="order-history-container">
        <div className="order-history-loading">
          <div className="loading-spinner"></div>
          <p>주문 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1 className="order-history-title">주문 내역</h1>
      </div>
      
      {ordersByDate.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2 className="empty-orders-title">주문 내역이 없습니다</h2>
          <p className="empty-orders-description">
            아직 주문하신 상품이 없습니다.<br />
            맛있는 전통주를 찾아보세요!
          </p>
          <button className="continue-shopping-btn" onClick={() => window.location.href = '/?view=shop'}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {ordersByDate.map((group) => (
            <div key={group.date} className="order-date-group">
              <div className="order-date-header">{formatDate(group.date)}</div>
              
              {group.orders.map((order) => {
                // 주소와 메모 분리
                const { detail, memo } = parseAddressInfo(order.order_address_detail || '');

                return (
                  <div key={order.order_id} className="order-block">
                    <div className="order-items-list">
                      {order.order_items.map((item) => (
                        <div key={item.order_item_id} className="order-item">
                          <div className="order-item-image">
                            <img 
                              src={getImageUrl(item.product_image_key)} 
                              alt={item.product_name} 
                              onError={(e)=>{e.currentTarget.style.display='none'}} 
                            />
                          </div>

                          <div className="order-item-info">
                            <h3 className="order-item-name">{item.product_name}</h3>
                            <p className="order-item-specs">
                              {item.order_item_quantity}개 / {item.order_item_amount.toLocaleString()}원
                            </p>
                            <div className="order-item-meta">
                              {item.provider_nickname && (
                                <span className="order-item-brewery">{item.provider_nickname}</span>
                              )}
                            </div>
                          </div>

                          <div className="order-item-actions">
                            <span className={`status-text ${getStatusClass(item.order_item_fulfillment_status)}`}>
                              {getStatusText(item.order_item_fulfillment_status)}
                            </span>
                            
                            {item.order_item_fulfillment_status !== 'CANCELED' && 
                             item.order_item_fulfillment_status !== 'CANCELLED' && 
                             item.order_item_fulfillment_status !== 'FAILED' && (
                              <button 
                                className="order-action-btn danger" 
                                onClick={() => handleCancelOrder(item.order_item_id)}
                              >
                                주문 취소
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 배송 정보 섹션 */}
                    <div className="order-shipping-info">
                      <h4 className="shipping-info-title">배송 정보</h4>
                      <div className="shipping-info-grid">
                        <div className="shipping-info-item">
                          <span className="shipping-label">받는 분</span>
                          <span className="shipping-value">{order.order_payer_name || '-'}</span>
                        </div>
                        <div className="shipping-info-item">
                          <span className="shipping-label">연락처</span>
                          <span className="shipping-value">{order.order_payer_phone || '-'}</span>
                        </div>
                        <div className="shipping-info-item full-width">
                          <span className="shipping-label">배송지</span>
                          <span className="shipping-value">
                            {order.order_address} {detail}
                          </span>
                        </div>
                        
                        {/* [추가] 배송 메모가 있을 경우 별도 표시 */}
                        {memo && (
                          <div className="shipping-info-item full-width">
                            <span className="shipping-label">배송 메모</span>
                            <span className="shipping-value">{memo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;