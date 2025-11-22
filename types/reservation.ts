export type ReservationStatus = 
  | 'PENDING'
  |  'PAID'    // 예약 대기
  | 'CONFIRMED' // 예약 확정
  | 'CANCELLED' // 취소됨
  | 'COMPLETED' // 체험 완료 (시간 지남)
  | 'USED';     // 사용 완료

export interface JoyOrder {
  joy_order_id: number;
  user_id: number;
  joy_id: number;
  joy_name: string;
  joy_order_count: number;
  joy_total_price: number;
  joy_order_payer_name: string;
  joy_order_payer_phone: string;
  joy_order_created_at: string;
  joy_order_reservation: string; 
  joy_payment_status: ReservationStatus;
  joy_image_key?: string;
  brewery_name?: string;  
}

export interface ChangeTimeRequest {
  id: number; 
  reservation: string; 
}