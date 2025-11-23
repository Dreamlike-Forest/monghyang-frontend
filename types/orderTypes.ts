// 주문 상태 enum
export enum OrderStatus {
  PENDING = 'PENDING',           // 결제 대기
  PAID = 'PAID',                 // 결제 완료
  PREPARING = 'PREPARING',       // 배송 준비 중
  SHIPPED = 'SHIPPED',           // 배송 중
  DELIVERED = 'DELIVERED',       // 배송 완료
  CANCELLED = 'CANCELLED',       // 주문 취소
  REFUNDED = 'REFUNDED'          // 환불 완료
}

// 주문 아이템 배송 상태
export enum FulfillmentStatus {
  PENDING = 'PENDING',           // 배송 대기
  PROCESSING = 'PROCESSING',     // 배송 준비 중
  SHIPPED = 'SHIPPED',           // 배송 중
  DELIVERED = 'DELIVERED',       // 배송 완료
  CANCELLED = 'CANCELLED'        // 배송 취소
}

// 환불 상태
export enum RefundStatus {
  NONE = 'NONE',                 // 환불 없음
  REQUESTED = 'REQUESTED',       // 환불 요청
  APPROVED = 'APPROVED',         // 환불 승인
  REJECTED = 'REJECTED',         // 환불 거부
  COMPLETED = 'COMPLETED'        // 환불 완료
}

// 주문 아이템 (개별 상품)
export interface OrderItem {
  order_item_id: number;
  order_id: number;
  provider_id: number;           // 판매자 ID (user_id)
  product_id: number;
  quantity: number;
  amount: number;                // 해당 아이템의 총 금액
  fulfillment_status: FulfillmentStatus;
  refund_status: RefundStatus;
  carrier_code: string | null;   // 택배사 코드
  tracking_no: string | null;    // 송장 번호
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string | null;
  version: number | null;
  is_deleted: boolean;
  
  // 조인된 상품 정보 (프론트엔드에서 사용)
  product_name?: string;
  product_image_key?: string;
  brewery_name?: string;
  product_volume?: number;
  product_alcohol?: number;
}

// 주문 정보
export interface Order {
  order_id: number;
  user_id: number;
  total_amount: number;          // 총 주문 금액
  currency: string;              // 통화 (KRW)
  pg_payment_key: string | null; // PG사 결제 키
  pg_order_id: string | null;    // PG사 주문 ID
  payer_name: string | null;     // 주문자 이름
  payer_phone: string | null;    // 주문자 연락처
  payment_status: string;        // 결제 상태 enum
  address: string | null;        // 배송 주소
  address_detail: string | null; // 상세 주소
  created_at: string;            // 주문 일시
  updated_at: string | null;
  version: number | null;
  is_deleted: boolean;
  
  // 주문 아이템 목록 (조인)
  items: OrderItem[];
}

// 주문 상태 히스토리
export interface OrderStatusHistory {
  status_history_id: number;
  order_id: number;
  to_status: string;             // enum
  reason_code: string | null;
  created_at: string;
}

// 배송 정보 (주문자 정보)
export interface ShippingInfo {
  recipient_name: string;        // 받는 사람 이름
  recipient_phone: string;       // 받는 사람 연락처
  address: string;               // 주소
  address_detail: string;        // 상세 주소
  delivery_request?: string;     // 배송 요청사항
}

// API 응답 타입
export interface OrderHistoryResponse {
  orders: Order[];
  total_count: number;
  page: number;
  page_size: number;
}

// 주문 내역 요청 파라미터
export interface OrderHistoryParams {
  user_id?: number;
  page?: number;
  page_size?: number;
  status_filter?: OrderStatus[];
  start_date?: string;
  end_date?: string;
}

// 날짜별 주문 그룹
export interface OrdersByDate {
  date: string;                  // YYYY-MM-DD
  orders: Order[];
}