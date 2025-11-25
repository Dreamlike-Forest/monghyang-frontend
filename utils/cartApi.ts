import apiClient from './api';

// API 응답 타입 정의
export interface CartItemResponse {
  cart_id: number;
  product_id: number;
  cart_quantity: number;
  cart_created_at: string;
}

export interface CartListResponse {
  status: number;
  content: CartItemResponse[];
}

// 1. 장바구니 조회 (GET /api/cart/my)
export const getMyCart = async (): Promise<CartItemResponse[]> => {
  try {
    // 404가 발생하면 브라우저 콘솔에 빨간줄이 뜨는 것은 정상입니다 (서버 스펙 때문)
    const response = await apiClient.get('/api/cart/my');
    return response.data.content || [];
  } catch (error: any) {
    // 여기서 에러를 잡아서 빈 배열로 바꿔줍니다.
    // 따라서 CartStore나 UI에서는 에러가 나지 않고 "빈 장바구니"로 인식합니다.
    if (error.response && error.response.status === 404) {
      return [];
    }
    // 404 이외의 진짜 에러(500 서버 터짐 등)는 밖으로 던집니다.
    throw error;
  }
};

// ... 나머지 함수들은 그대로 유지 ...
export const addToCartApi = async (productId: number, quantity: number) => {
  const response = await apiClient.post('/api/cart', {
    product_id: productId,
    quantity: quantity
  });
  return response.data;
};

export const increaseCartQuantity = async (cartId: number) => {
  const response = await apiClient.post(`/api/cart/plus/${cartId}`);
  return response.data;
};

export const decreaseCartQuantity = async (cartId: number) => {
  const response = await apiClient.post(`/api/cart/minus/${cartId}`);
  return response.data;
};

export const updateCartQuantityApi = async (cartId: number, quantity: number) => {
  const response = await apiClient.post(`/api/cart/specified/${cartId}/${quantity}`);
  return response.data;
};

export const removeCartItemApi = async (cartId: number) => {
  const response = await apiClient.delete(`/api/cart/${cartId}`);
  return response.data;
};