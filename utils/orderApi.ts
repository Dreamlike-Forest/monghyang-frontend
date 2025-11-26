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

// 1. [수정됨] 주문 준비 (FormData 사용 + 배열 처리 + 헤더 자동 설정)
export const prepareOrderApi = async (userId: number, data: PrepareOrderDto) => {
  const formData = new FormData();
  
  // [핵심] 배열 데이터는 같은 키('cart_id')로 반복해서 append 해야 함
  if (data.cart_id && data.cart_id.length > 0) {
    data.cart_id.forEach((id) => {
      formData.append('cart_id', String(id));
    });
  }

  // 문자열 데이터 (공백 제거 및 null 방지)
  formData.append('payer_name', (data.payer_name || '').trim());
  formData.append('payer_phone', (data.payer_phone || '').trim());
  formData.append('address', (data.address || '').trim());
  formData.append('address_detail', (data.address_detail || '').trim());

  // [중요] headers 설정을 제거합니다. 
  // Axios가 FormData 인스턴스를 감지하면 자동으로 Content-Type을 multipart/form-data로 설정하고 boundary를 붙입니다.
  const response = await apiClient.post('/api/orders/prepare', formData, {
    params: { userId }
  });
  return response.data.content; 
};

// 2. [수정됨] 결제 승인 요청 (FormData 사용)
export const approveOrderApi = async (userId: number, data: ApproveOrderDto) => {
  const formData = new FormData();
  formData.append('pg_order_id', data.pg_order_id);
  formData.append('pg_payment_key', data.pg_payment_key);
  formData.append('total_amount', String(data.total_amount));

  // [중요] headers 설정 제거
  const response = await apiClient.post('/api/orders/request', formData, {
    params: { userId }
  });
  return response.data.content;
};

// 3. 내 주문 내역 조회
export const getMyOrderHistoryApi = async (userId: number, startOffset: number) => {
  try {
    const response = await apiClient.get(`/api/orders/my/${startOffset}`, {
      params: { userId }
    });
    
    if (response.data?.content?.content && Array.isArray(response.data.content.content)) {
      return response.data.content.content;
    }
    return [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
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