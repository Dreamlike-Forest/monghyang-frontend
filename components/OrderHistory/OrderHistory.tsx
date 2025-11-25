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

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let userId = 0;
      const info = await getUserInfo();
      if (info?.userId) userId = info.userId;
      else {
        const local = localStorage.getItem('userData');
        if (local) userId = JSON.parse(local).userId;
      }

      if (!userId) return;

      // 오직 서버 API 데이터만 사용
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
      .map(([date, orders]) => ({ date, orders }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    setOrdersByDate(sorted);
  };

  const formatDate = (s: string) => s.split('T')[0];
  const getImageUrl = (k: string | null | undefined) => getShopImageUrl(k);
  const getFulfillmentStatusText = (status: string) => status;
  const getFulfillmentStatusClass = (status: string) => 'pending';

  const handleCancelOrder = async (orderItemId: number) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    try {
      const userId = (await getUserInfo())?.userId; 
      if (!userId) return;
      await cancelOrderItemApi(userId, orderItemId);
      alert('주문이 취소되었습니다.');
      loadOrders();
    } catch (e) {
      alert('취소 실패');
    }
  };
  
  const handleAddToCart = (id: number) => window.location.href = `/?view=shop&product=${id}`;
  const handleTrackingInfo = (no: string | null) => alert(`송장: ${no || '없음'}`);

  if (isLoading) return <div className="order-history-loading">로딩중...</div>;

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1 className="order-history-title">주문 내역</h1>
      </div>
      {ordersByDate.length === 0 ? (
        <div className="empty-orders">
          <h2>주문 내역이 없습니다</h2>
          <button className="continue-shopping-btn" onClick={() => window.location.href = '/?view=shop'}>쇼핑하러 가기</button>
        </div>
      ) : (
        <div className="orders-list">
          {ordersByDate.map((group) => (
            <div key={group.date} className="order-date-group">
              <div className="order-date-header">{formatDate(group.date)}</div>
              {group.orders.map((order) => (
                <div key={order.order_id} className="order-block">
                  <div className="order-items-list">
                    {order.order_items && order.order_items.map((item) => (
                      <div key={item.order_item_id} className="order-item">
                        <div className="order-item-image">
                          <img src={getImageUrl(item.product_image_key)} alt={item.product_name} onError={(e)=>{e.currentTarget.style.display='none'}} />
                        </div>
                        <div className="order-item-info">
                          <h3>{item.product_name}</h3>
                          <p>{item.order_item_quantity}개 / {item.order_item_amount.toLocaleString()}원</p>
                        </div>
                        <div className="order-item-actions">
                          {item.order_item_fulfillment_status !== 'CANCELLED' && (
                            <button className="order-action-btn danger" onClick={() => handleCancelOrder(item.order_item_id)}>주문 취소</button>
                          )}
                        </div>
                      </div>
                    ))}
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