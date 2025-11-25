import apiClient from './api';

// 주문 준비 요청 데이터
export interface PrepareOrderDto {
  cart_id: number[];
  payer_name: string;
  payer_phone: string;
  address: string;
  address_detail: string;
}

// 결제 승인 요청 데이터
export interface ApproveOrderDto {
  pg_order_id: string;
  pg_payment_key: string;
  total_amount: number;
}

// 1. 주문 준비
export const prepareOrderApi = async (userId: number, data: PrepareOrderDto) => {
  const response = await apiClient.post('/api/orders/prepare', data, {
    params: { userId }
  });
  return response.data.content; 
};

// 2. 결제 승인 요청
export const approveOrderApi = async (userId: number, data: ApproveOrderDto) => {
  const response = await apiClient.post('/api/orders/request', data, {
    params: { userId }
  });
  return response.data.content;
};

// 3. [수정됨] 내 주문 내역 조회 (404 에러 로그 숨김)
export const getMyOrderHistoryApi = async (userId: number, startOffset: number) => {
  try {
    const response = await apiClient.get(`/api/orders/my/${startOffset}`, {
      params: { userId }
    });
    
    if (response.data.content && Array.isArray(response.data.content.content)) {
      return response.data.content.content;
    }
    return [];
  } catch (error: any) {
    // 404는 주문 내역이 없다는 뜻이므로 에러가 아님 -> 빈 배열 반환
    if (error.response && error.response.status === 404) {
      return [];
    }
    // 다른 에러는 던짐
    throw error;
  }
};

// 4. 주문 취소
export const cancelOrderItemApi = async (userId: number, orderItemId: number) => {
  const response = await apiClient.post(`/api/order-item/cancel/${orderItemId}`, {}, {
    params: { userId }
  });
  return response.data;
};