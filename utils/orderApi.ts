// [중요] axios 제거하고 fetch 사용
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// 공통 헤더 생성 함수
const getHeaders = (isFormData: boolean = false) => {
  const headers: Record<string, string> = {};
  
  // 세션 ID 주입
  if (typeof window !== 'undefined') {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
  }

  // [핵심] FormData일 때는 Content-Type을 생략해야 브라우저가 boundary를 자동 생성함
  // JSON일 때만 application/json 명시
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // 캐시 방지 헤더
  headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  headers['Pragma'] = 'no-cache';
  headers['Expires'] = '0';

  return headers;
};

// 에러 처리 헬퍼
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      // JSON 파싱 실패 시 텍스트 그대로 사용
      errorMessage = errorText.substring(0, 100); 
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// ==================== DTO ====================
export interface PrepareOrderDto {
  cart_id: number[];
  payer_name: string;
  payer_phone: string;
  address: string;
  address_detail: string;
}

export interface ApproveOrderDto {
  pg_order_id: string;
  pg_payment_key: string;
  total_amount: number;
}

// ==================== API Functions ====================

// 1. 주문 준비
export const prepareOrderApi = async (userId: number, data: PrepareOrderDto) => {
  const formData = new FormData();
  if (data.cart_id && data.cart_id.length > 0) {
    data.cart_id.forEach((id) => formData.append('cart_id', String(id)));
  }
  formData.append('payer_name', (data.payer_name || '').trim());
  formData.append('payer_phone', (data.payer_phone || '').trim());
  formData.append('address', (data.address || '').trim());
  formData.append('address_detail', (data.address_detail || '').trim());

  const response = await fetch(`${BASE_URL}/api/orders/prepare?userId=${userId}`, {
    method: 'POST',
    headers: getHeaders(true), // FormData
    body: formData
  });

  const result = await handleResponse(response);
  return result.content;
};

// 2. 결제 승인
export const approveOrderApi = async (userId: number, data: ApproveOrderDto) => {
  const formData = new FormData();
  formData.append('pg_order_id', data.pg_order_id);
  formData.append('pg_payment_key', data.pg_payment_key);
  formData.append('total_amount', String(data.total_amount));

  const response = await fetch(`${BASE_URL}/api/orders/request?userId=${userId}`, {
    method: 'POST',
    headers: getHeaders(true), // FormData
    body: formData
  });

  const result = await handleResponse(response);
  return result.content;
};

// 3. 주문 내역 조회
export const getMyOrderHistoryApi = async (userId: number, startOffset: number) => {
  try {
    // _t 파라미터로 캐시 무효화
    const response = await fetch(`${BASE_URL}/api/orders/my/${startOffset}?userId=${userId}&_t=${Date.now()}`, {
      method: 'GET',
      headers: getHeaders(false) // JSON
    });

    if (response.status === 404) return [];
    
    const result = await handleResponse(response);
    
    if (result?.content?.content && Array.isArray(result.content.content)) {
      return result.content.content;
    }
    return [];
  } catch (error) {
    console.error("Order history fetch error:", error);
    return [];
  }
};

// 4. 주문 취소 (문제 해결된 버전)
export const cancelOrderItemApi = async (userId: number, orderItemId: number) => {
  console.log(`[API] Canceling Order Item: ${orderItemId}, User: ${userId}`);
  
  const response = await fetch(`${BASE_URL}/api/order-item/cancel/${orderItemId}?userId=${userId}`, {
    method: 'POST',
    headers: getHeaders(false), // JSON 헤더 (Content-Type: application/json)
    body: JSON.stringify({}) // 빈 JSON 객체 전송
  });

  return handleResponse(response);
};