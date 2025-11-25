// 주문 상태
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// 배송 상태
export enum FulfillmentStatus {
  CREATED = 'CREATED',
  ALLOCATED = 'ALLOCATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  NONE = 'NONE'
}

// [중요] 주문 아이템 (API 필드명 일치)
export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  
  provider_id: number;
  provider_nickname: string; 
  provider_role?: string;
  
  product_image_key?: string | null;
  
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
}

// [중요] 주문 정보 (API 필드명 일치)
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
  
  // 주문 상세 품목 리스트
  order_items: OrderItem[]; 
}

export interface OrdersByDate {
  date: string;
  orders: Order[];
}