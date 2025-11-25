'use client';

import { useState, useEffect } from 'react';
import {
  Order,
  OrderItem,
  OrdersByDate,
  ShippingInfo,
  FulfillmentStatus,
  RefundStatus
} from '../../types/orderTypes';
import './OrderHistory.css';

// Mock 주문 데이터
const MOCK_ORDERS: Order[] = [
  {
    order_id: 1,
    user_id: 1,
    total_amount: 50000,
    currency: 'KRW',
    pg_payment_key: null,
    pg_order_id: null,
    payer_name: '홍길동',
    payer_phone: '010-1234-5678',
    payment_status: 'PAID',
    address: '서울시 강남구 테헤란로 123',
    address_detail: '4층',
    created_at: '2024-11-20T10:30:00',
    updated_at: null,
    version: null,
    is_deleted: false,
    items: [
      {
        order_item_id: 1,
        order_id: 1,
        provider_id: 1,
        product_id: 1,
        product_name: '전통 막걸리',
        product_image_key: null,
        brewery_name: '전통양조장',
        product_volume: 750,
        product_alcohol: 6,
        quantity: 2,
        amount: 30000,
        fulfillment_status: FulfillmentStatus.DELIVERED,
        refund_status: RefundStatus.NONE,
        carrier_code: 'CJ',
        tracking_no: '123456789',
        shipped_at: '2024-11-20T12:00:00',
        delivered_at: '2024-11-21T14:20:00',
        created_at: '2024-11-20T10:30:00',
        updated_at: null,
        version: null,
        is_deleted: false
      },
      {
        order_item_id: 2,
        order_id: 1,
        provider_id: 2,
        product_id: 2,
        product_name: '청주 프리미엄',
        product_image_key: null,
        brewery_name: '몽향양조장',
        product_volume: 500,
        product_alcohol: 12,
        quantity: 1,
        amount: 20000,
        fulfillment_status: FulfillmentStatus.DELIVERED,
        refund_status: RefundStatus.NONE,
        carrier_code: 'CJ',
        tracking_no: '123456789',
        shipped_at: '2024-11-20T12:00:00',
        delivered_at: '2024-11-21T14:20:00',
        created_at: '2024-11-20T10:30:00',
        updated_at: null,
        version: null,
        is_deleted: false
      }
    ]
  },
  {
    order_id: 2,
    user_id: 1,
    total_amount: 48000,
    currency: 'KRW',
    pg_payment_key: null,
    pg_order_id: null,
    payer_name: '홍길동',
    payer_phone: '010-1234-5678',
    payment_status: 'PAID',
    address: '서울시 강남구 테헤란로 123',
    address_detail: '4층',
    created_at: '2024-11-15T14:20:00',
    updated_at: null,
    version: null,
    is_deleted: false,
    items: [
      {
        order_item_id: 3,
        order_id: 2,
        provider_id: 3,
        product_id: 3,
        product_name: '약주 프리미엄',
        product_image_key: null,
        brewery_name: '경주 양조장',
        product_volume: 375,
        product_alcohol: 15,
        quantity: 1,
        amount: 45000,
        fulfillment_status: FulfillmentStatus.SHIPPED,
        refund_status: RefundStatus.NONE,
        carrier_code: 'HANJIN',
        tracking_no: '987654321',
        shipped_at: '2024-11-16T09:00:00',
        delivered_at: null,
        created_at: '2024-11-15T14:20:00',
        updated_at: null,
        version: null,
        is_deleted: false
      }
    ]
  },
  {
    order_id: 3,
    user_id: 1,
    total_amount: 35000,
    currency: 'KRW',
    pg_payment_key: null,
    pg_order_id: null,
    payer_name: '홍길동',
    payer_phone: '010-1234-5678',
    payment_status: 'PAID',
    address: '서울시 강남구 테헤란로 123',
    address_detail: '4층',
    created_at: '2024-11-10T16:45:00',
    updated_at: null,
    version: null,
    is_deleted: false,
    items: [
      {
        order_item_id: 4,
        order_id: 3,
        provider_id: 1,
        product_id: 4,
        product_name: '탁주 세트',
        product_image_key: null,
        brewery_name: '전통양조장',
        product_volume: 300,
        product_alcohol: 7,
        quantity: 3,
        amount: 35000,
        fulfillment_status: FulfillmentStatus.PROCESSING,
        refund_status: RefundStatus.NONE,
        carrier_code: null,
        tracking_no: null,
        shipped_at: null,
        delivered_at: null,
        created_at: '2024-11-10T16:45:00',
        updated_at: null,
        version: null,
        is_deleted: false
      }
    ]
  }
];

// Mock 배송지 정보
const MOCK_SHIPPING_INFO: ShippingInfo = {
  recipient_name: '홍길동',
  recipient_phone: '010-1234-5678',
  address: '서울시 강남구 테헤란로 123',
  address_detail: '4층',
  delivery_request: '문 앞에 놓아주세요'
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadShippingInfo();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders(MOCK_ORDERS);
      groupOrdersByDate(MOCK_ORDERS);
    } catch (error) {
      console.error('주문 내역 로드 실패:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShippingInfo = async () => {
    try {
      setShippingInfo(MOCK_SHIPPING_INFO);
    } catch (error) {
      console.error('배송지 정보 로드 실패:', error);
    }
  };

  const groupOrdersByDate = (orderList: Order[]) => {
    const grouped: Record<string, Order[]> = {};

    orderList.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });

    const groupedArray: OrdersByDate[] = Object.entries(grouped)
      .map(([date, orders]) => ({ date, orders }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setOrdersByDate(groupedArray);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}. ${month}. ${day} 주문 (${dayOfWeek})`;
  };

  const getFulfillmentStatusText = (status: FulfillmentStatus): string => {
    const statusMap: Record<FulfillmentStatus, string> = {
      [FulfillmentStatus.PENDING]: '배송 대기',
      [FulfillmentStatus.PROCESSING]: '배송 준비 중',
      [FulfillmentStatus.SHIPPED]: '배송 중',
      [FulfillmentStatus.DELIVERED]: '배송 완료',
      [FulfillmentStatus.CANCELLED]: '배송 취소'
    };
    return statusMap[status] || status;
  };

  const getFulfillmentStatusClass = (status: FulfillmentStatus): string => {
    const classMap: Record<FulfillmentStatus, string> = {
      [FulfillmentStatus.PENDING]: 'pending',
      [FulfillmentStatus.PROCESSING]: 'processing',
      [FulfillmentStatus.SHIPPED]: 'shipped',
      [FulfillmentStatus.DELIVERED]: 'delivered',
      [FulfillmentStatus.CANCELLED]: 'cancelled'
    };
    return classMap[status] || 'pending';
  };

  const getOrderMainStatus = (order: Order): FulfillmentStatus => {
    if (!order.items || order.items.length === 0) {
      return FulfillmentStatus.PENDING;
    }

    if (order.items.every(item => item.fulfillment_status === FulfillmentStatus.DELIVERED)) {
      return FulfillmentStatus.DELIVERED;
    }

    if (order.items.some(item => item.fulfillment_status === FulfillmentStatus.SHIPPED)) {
      return FulfillmentStatus.SHIPPED;
    }

    if (order.items.some(item => item.fulfillment_status === FulfillmentStatus.PROCESSING)) {
      return FulfillmentStatus.PROCESSING;
    }

    return FulfillmentStatus.PENDING;
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) {
      return;
    }
    alert('주문 취소 기능은 API 연동 후 사용 가능합니다.');
  };

  // [수정] 교환, 반품 신청 핸들러 - 준비중 알림
  const handleRequestRefund = async (orderItemId: number) => {
    alert('아직 준비중입니다.');
  };

  // [수정] 배송 조회 핸들러 - 준비중 알림
  const handleTrackingInfo = async (orderItemId: number) => {
    alert('아직 준비중입니다.');
  };

  const handleAddToCart = (item: OrderItem) => {
    alert(`"${item.product_name}"을(를) 장바구니에 담는 기능은 추후 구현 예정입니다.`);
  };

  const continueShopping = () => {
    window.location.href = '/?view=shop';
  };

  const getImageUrl = (imageKey: string | null | undefined): string => {
    if (!imageKey) return '';
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${API_URL}/api/image/${imageKey}`;
  };

  if (isLoading) {
    return (
      <div className="order-history-container">
        <div className="order-history-loading">
          <div className="loading-spinner"></div>
          주문 내역을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1 className="order-history-title">주문 내역</h1>
        <p className="order-count">
          {orders.length > 0 ? `총 ${orders.length}건의 주문` : '주문 내역이 없습니다'}
        </p>
      </div>

      {ordersByDate.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2 className="empty-orders-title">주문 내역이 없습니다</h2>
          <p className="empty-orders-description">
            마음에 드는 전통주를 주문해보세요!
          </p>
          <button className="continue-shopping-btn" onClick={continueShopping}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {ordersByDate.map((dateGroup) => (
              <div key={dateGroup.date} className="order-date-group">
                {dateGroup.orders.map((order) => (
                  <div key={order.order_id}>
                    <div className="order-date-header">
                      <span className="order-date">{formatDate(order.created_at)}</span>
                      <span className={`order-status-badge ${getFulfillmentStatusClass(getOrderMainStatus(order))}`}>
                        {getFulfillmentStatusText(getOrderMainStatus(order))}
                      </span>
                    </div>

                    <div className="order-items-list">
                      {order.items.map((item) => (
                        <div key={item.order_item_id} className="order-item">
                          <div className="order-item-image">
                            {item.product_image_key ? (
                              <img 
                                src={getImageUrl(item.product_image_key)} 
                                alt={item.product_name || '상품 이미지'}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="order-item-image-placeholder">
                                      <div>🍶</div>
                                      <div>이미지 없음</div>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="order-item-image-placeholder">
                                <div>🍶</div>
                                <div>이미지 없음</div>
                              </div>
                            )}
                          </div>

                          <div className="order-item-info">
                            <div className="order-item-brewery">
                              {item.brewery_name || '양조장 정보 없음'}
                            </div>
                            <h3 className="order-item-name">
                              {item.product_name || '상품명 없음'}
                            </h3>
                            <div className="order-item-specs">
                              {item.product_volume && `${item.product_volume}ml`}
                              {item.product_alcohol && ` | ${item.product_alcohol}%`}
                            </div>
                            <div className="order-item-quantity">
                              수량: {item.quantity}개
                            </div>
                          </div>

                          <div className="order-item-price-section">
                            <div className="order-item-price">
                              {item.amount.toLocaleString()}원
                            </div>
                            <span className={`order-item-fulfillment-status ${getFulfillmentStatusClass(item.fulfillment_status)}`}>
                              {getFulfillmentStatusText(item.fulfillment_status)}
                            </span>
                          </div>

                          <div className="order-item-actions">
                            {item.fulfillment_status === FulfillmentStatus.DELIVERED && (
                              <>
                                <button 
                                  className="order-action-btn"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  장바구니 담기
                                </button>
                                <button 
                                  className="order-action-btn danger"
                                  onClick={() => handleRequestRefund(item.order_item_id)}
                                >
                                  교환, 반품 신청
                                </button>
                              </>
                            )}
                            {(item.fulfillment_status === FulfillmentStatus.SHIPPED || 
                              item.fulfillment_status === FulfillmentStatus.PROCESSING) && (
                              <button 
                                className="order-action-btn primary"
                                onClick={() => handleTrackingInfo(item.order_item_id)}
                              >
                                배송조회
                              </button>
                            )}
                            {item.fulfillment_status === FulfillmentStatus.PENDING && (
                              <button 
                                className="order-action-btn danger"
                                onClick={() => handleCancelOrder(order.order_id)}
                              >
                                주문 취소
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary-section">
                      <div className="order-summary-row">
                        <div className="order-summary-item">
                          <span className="order-summary-label">상품금액</span>
                          <span className="order-summary-value">
                            {order.total_amount.toLocaleString()}원
                          </span>
                        </div>
                        <div className="order-summary-item">
                          <span className="order-summary-label">배송비</span>
                          <span className="order-summary-value">
                            {order.total_amount >= 50000 ? '무료배송' : '3,000원'}
                          </span>
                        </div>
                      </div>
                      <div className="order-total">
                        총 {order.total_amount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {shippingInfo && (
            <div className="shipping-info-section">
              <h2 className="shipping-info-title">받는 사람 정보</h2>
              <div className="shipping-info-grid">
                <div className="shipping-info-item">
                  <div className="shipping-info-label">이름</div>
                  <div className="shipping-info-value">
                    {shippingInfo.recipient_name || '정보 없음'}
                  </div>
                </div>
                <div className="shipping-info-item">
                  <div className="shipping-info-label">연락처</div>
                  <div className="shipping-info-value">
                    {shippingInfo.recipient_phone || '정보 없음'}
                  </div>
                </div>
                <div className="shipping-info-item shipping-info-address">
                  <div className="shipping-info-label">주소</div>
                  <div className="shipping-info-value">
                    {shippingInfo.address && shippingInfo.address_detail
                      ? `${shippingInfo.address} ${shippingInfo.address_detail}`
                      : shippingInfo.address || '주소 정보 없음'}
                  </div>
                </div>
                {shippingInfo.delivery_request && (
                  <div className="shipping-info-item shipping-info-request">
                    <div className="shipping-info-label">배송 요청사항</div>
                    <div className="shipping-info-value">
                      {shippingInfo.delivery_request}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;