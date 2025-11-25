'use client';

import { useState, useEffect } from 'react';
import { Order, OrdersByDate } from '../../types/orderTypes';
import { getMyOrderHistoryApi, cancelOrderItemApi } from '../../utils/orderApi';
import { getUserInfo } from '../../utils/userApi';
import { getImageUrl as getShopImageUrl } from '../../utils/shopApi';
import './OrderHistory.css';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let userId = 0;
      const userInfo = await getUserInfo();
      
      if (userInfo) {
        userId = userInfo.userId || userInfo.users_id || userInfo.id;
      } else {
        const localData = localStorage.getItem('userData');
        if (localData) userId = JSON.parse(localData).userId;
      }

      if (!userId) return;

      // [수정됨] 오직 서버 API 데이터만 사용
      const apiData = await getMyOrderHistoryApi(userId, 0);
      console.log('주문 내역 데이터(서버):', apiData);

      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        setOrders(apiData);
        groupOrdersByDate(apiData);
      } else {
        setOrders([]);
        setOrdersByDate([]);
      }
    } catch (error) {
      console.error('주문 내역 로드 실패:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 나머지 렌더링 관련 함수들은 그대로 유지 (groupOrdersByDate, handleCancelOrder 등)
  // 코드가 길어 핵심만 보여드리며, 아래 코드는 기존과 동일하게 사용하시면 됩니다.

  const groupOrdersByDate = (orderList: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    orderList.forEach(order => {
      const dateStr = order.order_created_at || new Date().toISOString();
      const date = dateStr.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(order);
    });
    const groupedArray: OrdersByDate[] = Object.entries(grouped)
      .map(([date, orders]) => ({ date, orders }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setOrdersByDate(groupedArray);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()} 주문`;
    } catch (e) { return dateString; }
  };

  const getFulfillmentStatusText = (status: string) => status;
  const getFulfillmentStatusClass = (status: string) => 'pending';

  const handleCancelOrder = async (orderItemId: number) => {
    if (!window.confirm('정말로 주문을 취소하시겠습니까?')) return;
    try {
      const userInfo = await getUserInfo();
      const userId = userInfo?.userId || JSON.parse(localStorage.getItem('userData') || '{}').userId;
      await cancelOrderItemApi(userId, orderItemId);
      alert('주문이 취소되었습니다.');
      loadOrders(); 
    } catch (error) {
      alert('주문 취소에 실패했습니다.');
    }
  };

  const handleTrackingInfo = (no: string) => alert(no);
  const handleAddToCart = (id: number) => { window.location.href = `/?view=shop&product=${id}`; };
  const getImageUrl = (key: string) => getShopImageUrl(key);

  if (isLoading) return <div className="order-history-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1 className="order-history-title">주문 내역</h1>
      </div>
      {ordersByDate.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2>주문 내역이 없습니다</h2>
          <button className="continue-shopping-btn" onClick={() => window.location.href = '/?view=shop'}>쇼핑하러 가기</button>
        </div>
      ) : (
        <div className="orders-list">
          {ordersByDate.map((group) => (
            <div key={group.date} className="order-date-group">
              <div className="order-date-header"><span className="order-date">{formatDate(group.date)}</span></div>
              {group.orders.map((order) => (
                <div key={order.order_id} className="order-block">
                  <div className="order-items-list">
                    {order.order_items && order.order_items.map((item) => (
                      <div key={item.order_item_id} className="order-item">
                        <div className="order-item-image">
                          <img src={getImageUrl(item.product_image_key)} alt={item.product_name} onError={(e)=>{e.currentTarget.style.display='none'}} />
                        </div>
                        <div className="order-item-info">
                          <div className="order-item-brewery">{item.provider_nickname}</div>
                          <h3 className="order-item-name">{item.product_name}</h3>
                          <div className="order-item-quantity">수량: {item.order_item_quantity}개</div>
                        </div>
                        <div className="order-item-price-section">
                          <div className="order-item-price">{(item.order_item_amount).toLocaleString()}원</div>
                          <span className="order-item-fulfillment-status">{item.order_item_fulfillment_status}</span>
                        </div>
                        <div className="order-item-actions">
                           <button className="order-action-btn danger" onClick={() => handleCancelOrder(item.order_item_id)}>주문 취소</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary-section">
                    <div className="order-total">총 결제금액: {(order.order_total_amount).toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;