import apiClient from './api';
import { JoyOrder, ChangeTimeRequest } from '../types/reservation';

// 사용자 ID 추출 헬퍼
const getUserId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.userId || parsed.user_id || parsed.id || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 1. 예약 내역 조회 (GET /api/joy-order/my/{startOffset})
export const getMyReservations = async (startOffset: number = 0) => {
  const userId = getUserId();
  const params = userId ? { userId } : {};
  const response = await apiClient.get(`/api/joy-order/my/${startOffset}`, { params });
  return response.data.content?.content || []; 
};

// 2. 예약 준비 (POST /api/joy-order/prepare)
export const prepareReservation = async (data: {
  id: number;
  count: number;
  payer_name: string;
  payer_phone: string;
  reservation_date: string;
  reservation_time: string;
}) => {
  const formData = new FormData();
  formData.append('id', String(data.id));
  formData.append('count', String(data.count));
  formData.append('payer_name', data.payer_name);
  formData.append('payer_phone', data.payer_phone);
  formData.append('reservation_date', data.reservation_date);
  formData.append('reservation_time', data.reservation_time);

  const response = await apiClient.post('/api/joy-order/prepare', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 3. 결제 승인 요청 (POST /api/joy-order/request)
export const requestPayment = async (data: {
  pg_order_id: string;
  pg_payment_key: string;
  total_amount: number;
}) => {
  const formData = new FormData();
  formData.append('pg_order_id', data.pg_order_id);
  formData.append('pg_payment_key', data.pg_payment_key);
  formData.append('total_amount', data.total_amount.toFixed(2));

  const response = await apiClient.post('/api/joy-order/request', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 4. 예약 변경 (POST /api/joy-order/change)
export const changeReservation = async (data: {
  id: number;
  reservation_date: string;
  reservation_time: string;
  count: number;
}) => {
  const formData = new FormData();
  formData.append('id', String(data.id));
  formData.append('reservation_date', data.reservation_date);
  formData.append('reservation_time', data.reservation_time);
  formData.append('count', String(data.count));

  const response = await apiClient.post('/api/joy-order/change', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 5. 예약 취소 (DELETE /api/joy-order/cancel/{joyOrderId})
export const cancelReservation = async (joyOrderId: number) => {
  const response = await apiClient.delete(`/api/joy-order/cancel/${joyOrderId}`);
  return response.data;
};

// 6. 내역 삭제 (DELETE /api/joy-order/history/{joyOrderId})
export const deleteReservationHistory = async (joyOrderId: number) => {
  const response = await apiClient.delete(`/api/joy-order/history/${joyOrderId}`);
  return response.data;
};

// 7. 예약 불가능 날짜 조회 (GET /api/joy-order/calendar)
export const getUnavailableDates = async (joyId: number, year: number, month: number) => {
  const response = await apiClient.get(`/api/joy-order/calendar`, {
    params: { joyId, year, month }
  });
  return response.data.content?.joy_unavailable_reservation_date || [];
};

// 8. 시간대별 예약 가능 여부 조회 (GET /api/joy-order/calendar/time-info)
export const getTimeSlotInfo = async (joyId: number, date: string) => {
  // 명세서에 따라 /time-info 경로 사용
  const response = await apiClient.get(`/api/joy-order/calendar/time-info`, {
    params: { joyId, date }
  });
  return response.data.content;
};