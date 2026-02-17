// 예약 상태
export type ReservationStatus = 
  | 'PENDING'    // 결제 대기
  | 'PAID'       // 결제 완료
  | 'CONFIRMED'  // 예약 확정
  | 'CANCELLED'  // 취소됨
  | 'COMPLETED'  // 체험 완료
  | 'USED';      // 사용 완료

// 체험 예약 (GET /api/joy-order/my 응답)
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

// 예약 준비 요청 (POST /api/joy-order/prepare)
export interface PrepareReservationDto {
  id: number;
  count: number;
  payer_name: string;
  payer_phone: string;
  reservation_date: string;
  reservation_time: string;
}

// 결제 승인 요청 (POST /api/joy-order/request)
export interface RequestPaymentDto {
  pg_order_id: string;
  pg_payment_key: string;
  total_amount: number;
}

// 예약 변경 요청 (POST /api/joy-order/change)
export interface ChangeReservationDto {
  id: number;
  reservation_date: string;
  reservation_time: string;
  count: number;
}

// 시간대 정보 응답 (GET /api/joy-order/calendar/time-info)
export interface TimeSlotInfo {
  time_info: string[];
  remaining_count_list: number[];
}

// 예약 불가 날짜 응답 (GET /api/joy-order/calendar)
export interface UnavailableDatesResponse {
  joy_unavailable_reservation_date: string[];
}