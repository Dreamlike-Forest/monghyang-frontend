// 주문 상태 (Enum)
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// 배송 상태 (Enum)
export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// [수정됨] 주문 아이템 (API 필드명 일치)
export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  
  // 판매자 정보
  provider_id: number;
  provider_nickname: string;
  provider_role?: string;
  
  // 상품 이미지
  product_image_key?: string;
  
  // [중요] API 명세서 필드명 반영
  order_item_quantity: number;
  order_item_amount: number;
  
  order_item_fulfillment_status: string;
  order_item_refund_status?: string;
  order_item_carrier_code?: string | null;
  order_item_tracking_no?: string | null;
  
  order_item_shipped_at?: string | null;
  order_item_delivered_at?: string | null;
  order_item_created_at?: string;
  order_item_updated_at?: string;
  
  // UI용 (API에 없으면 계산해서 넣거나 옵셔널)
  product_volume?: number;
  product_alcohol?: number;
}

// [수정됨] 주문 정보 (API 필드명 일치)
export interface Order {
  order_id: number;
  order_total_amount: number;
  order_currency?: string;
  order_payer_name?: string;
  order_payer_phone?: string;
  order_payment_status?: string;
  order_address?: string;
  order_address_detail?: string;
  
  order_created_at: string;
  order_updated_at?: string;
  
  // 주문에 포함된 아이템 목록
  order_items: OrderItem[]; 
  // 만약 API가 order_items가 아니라 다른 이름(예: items)이라면 여기서 수정해야 함.
  // 현재 코드는 order_items로 가정하고 작성됨.
}

// 날짜별 그룹화 (UI용)
export interface OrdersByDate {
  date: string;
  orders: Order[];
}