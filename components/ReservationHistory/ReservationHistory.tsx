'use client';

import React, { useState, useEffect } from 'react';
import { JoyOrder, ReservationStatus } from '../../types/reservation';
import { 
  getMyReservations, 
  cancelReservation, 
  changeReservation, 
  deleteReservationHistory,
  getUnavailableDates,
  getTimeSlotInfo
} from '../../utils/reservationApi';
import CustomerInfoForm from '../ExperienceReservation/CustomerInfoForm/CustomerInfoForm';
import './ReservationHistory.css';

// 날짜 포맷팅 함수
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return { fullDate: '-', time: '-', weekDay: '' };
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  
  return {
    fullDate: `${year}. ${month}. ${day}`,
    time: `${hours}:${minutes}`,
    weekDay
  };
};

const ReservationHistory: React.FC = () => {
  const [reservations, setReservations] = useState<JoyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetReservation, setTargetReservation] = useState<JoyOrder | null>(null);
  
  // 변경 폼 데이터 상태
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCount, setNewCount] = useState(1);
  
  // 예약 가능 정보 상태
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  
  // 시간대별 잔여 인원수 저장 (Key: "HH:mm", Value: 남은 인원)
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const data = await getMyReservations(0); 
      console.log('📋 예약 내역 데이터:', data);
      setReservations(data); 
    } catch (error) {
      console.error('예약 내역 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('정말로 예약을 취소하시겠습니까?\n취소 후에는 되돌릴 수 없습니다.')) return;
    try {
      await cancelReservation(id);
      alert('예약이 취소되었습니다.');
      fetchReservations();
    } catch (error: any) {
      console.error('예약 취소 실패:', error);
      const msg = error.response?.data?.message || '실패';
      alert(`예약 취소에 실패했습니다: ${msg}`);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('이 내역을 목록에서 삭제하시겠습니까?')) return;
    try {
      await deleteReservationHistory(id);
      alert('내역이 삭제되었습니다.');
      fetchReservations();
    } catch (error) {
      console.error('내역 삭제 실패:', error);
      alert('내역 삭제에 실패했습니다.');
    }
  };

  // 변경 모달 열기
  const openChangeModal = async (reservation: JoyOrder) => {
    setTargetReservation(reservation);
    
    const dateObj = new Date(reservation.joy_order_reservation);
    const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = dateObj.toTimeString().slice(0, 5);  // HH:mm
    
    setNewDate(dateStr);
    setNewTime(timeStr);
    setNewCount(reservation.joy_order_count);
    
    // 초기화 후 데이터 로드
    setTimeSlotCounts({});
    setAvailableTimes([]);
    
    setIsModalOpen(true);

    try {
      const joyId = reservation.joy_id; 
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      
      // 예약 불가능 날짜 로드
      const dates = await getUnavailableDates(joyId, year, month);
      setUnavailableDates(dates);
      
      // 해당 날짜의 시간대 로드
      await loadTimeSlots(joyId, dateStr);
    } catch (e) {
      console.error('일정 정보 로드 실패:', e);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setNewDate(date);
    setNewTime(''); 
    setTimeSlotCounts({}); 
    
    // 날짜가 변경되면 인원수도 1로 초기화 (안전하게)
    setNewCount(1);
    
    if (targetReservation) {
      await loadTimeSlots(targetReservation.joy_id, date);
    }
  };

  // 시간대 및 잔여석 로드 함수
  const loadTimeSlots = async (joyId: number, date: string) => {
    try {
      const data = await getTimeSlotInfo(joyId, date);
      
      // 시간대 목록 (HH:mm)
      const times = (data.time_info || []).map((t: string) => t.substring(0, 5));
      setAvailableTimes(times);

      // 잔여석 정보 파싱
      const counts: Record<string, number> = {};
      if (data.remaining_count_list) {
        data.remaining_count_list.forEach((slot: any) => {
          const timeKey = slot.joy_slot_reservation_time.substring(0, 5);
          counts[timeKey] = slot.joy_slot_remaining_count;
        });
      }
      setTimeSlotCounts(counts);

    } catch (e) {
      console.error('시간대 로드 실패:', e);
      setAvailableTimes([]);
      setTimeSlotCounts({});
    }
  };

  const handleCustomerInfoChange = (field: string, value: string | number) => {
    if (field === 'headCount') {
      setNewCount(Number(value));
    }
  };

  const handleSubmitChange = async () => {
    if (!targetReservation || !newDate || !newTime || newCount < 1) {
      alert('변경할 날짜, 시간, 인원을 모두 정확히 선택해주세요.');
      return;
    }

    // 예약 불가능 날짜 체크
    if (unavailableDates.includes(newDate)) {
      alert('선택하신 날짜는 예약이 불가능합니다.');
      return;
    }

    const changeData = {
      id: targetReservation.joy_order_id,
      reservation_date: newDate,
      reservation_time: newTime,
      count: newCount
    };

    try {
      await changeReservation(changeData);
      alert('예약 정보가 변경되었습니다.');
      setIsModalOpen(false);
      fetchReservations();
    } catch (error: any) {
      console.error('변경 실패:', error);
      const msg = error.response?.data?.message || '실패';
      alert(`변경 실패: ${msg}`);
    }
  };

  const getStatusInfo = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED': 
      case 'PAID': return { text: '예약 확정', className: 'confirmed' };
      case 'PENDING': return { text: '예약 대기', className: 'pending' };
      case 'CANCELLED': return { text: '예약 취소', className: 'cancelled' };
      case 'COMPLETED': return { text: '체험 완료', className: 'confirmed' };
      default: return { text: status, className: 'pending' };
    }
  };

  // [핵심 로직] 최대 인원수 계산
  const calculateMaxCount = () => {
    // 1. 시간을 아직 선택하지 않았으면 0명 (변경 불가)
    if (!newTime || !targetReservation) return 0; 

    const slotRemaining = timeSlotCounts[newTime]; 
    
    // 잔여석 정보가 없으면 기본값 20
    if (slotRemaining === undefined) return 20;

    // 2. 기존 예약과 동일한 날짜/시간을 선택한 경우
    const originalDateObj = new Date(targetReservation.joy_order_reservation);
    const originalDate = originalDateObj.toISOString().split('T')[0];
    const originalTime = originalDateObj.toTimeString().slice(0, 5);

    if (newDate === originalDate && newTime === originalTime) {
      // 내 자리는 확보된 상태이므로 "잔여석 + 내 기존 인원"까지 가능
      return slotRemaining + targetReservation.joy_order_count;
    }

    // 3. 다른 시간대로 변경하는 경우 -> 순수 잔여석만큼만 가능
    return slotRemaining;
  };

  const currentMaxCount = calculateMaxCount();

  if (isLoading) {
    return (
      <div className="reservation-history-container">
        <div className="reservation-loading"><div className="loading-spinner"></div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="reservation-history-container">
      <div className="reservation-history-header">
        <h1 className="reservation-history-title">체험 예약 내역</h1>
      </div>

      {reservations.length === 0 ? (
        <div className="reservation-empty">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
          <h3>예약 내역이 없습니다</h3>
          <button className="reservation-action-btn primary" style={{ width: 'auto', marginTop: '20px' }}
            onClick={() => window.location.href = '/?view=brewery'}>
            양조장 둘러보기
          </button>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((item) => {
            const statusInfo = getStatusInfo(item.joy_payment_status);
            const { fullDate, time, weekDay } = formatDisplayDate(item.joy_order_reservation);
            const canCancel = ['PENDING', 'CONFIRMED', 'PAID'].includes(item.joy_payment_status);
            const canDelete = ['CANCELLED', 'COMPLETED'].includes(item.joy_payment_status);

            return (
              <div key={item.joy_order_id} className="reservation-card">
                <div className="reservation-card-header">
                  <span className="reservation-date-label">{fullDate} ({weekDay})</span>
                  <span className="reservation-id">주문번호: {item.joy_order_id}</span>
                </div>
                <div className="reservation-item">
                  <div className="reservation-item-info">
                    {item.brewery_name && <span className="reservation-brewery">{item.brewery_name}</span>}
                    <h3 className="reservation-name">{item.joy_name}</h3>
                    <div className="reservation-detail-row">
                      <span className="reservation-time-badge">⏰ {time}</span>
                      <span>👥 {item.joy_order_count}명</span>
                    </div>
                  </div>
                  <div className="reservation-item-actions">
                    <span className="reservation-price">{item.joy_total_price.toLocaleString()}원</span>
                    <span className={`reservation-status ${statusInfo.className}`}>{statusInfo.text}</span>
                    
                    {canCancel && <>
                      <button className="reservation-action-btn" onClick={() => openChangeModal(item)}>예약 변경</button>
                      <button className="reservation-action-btn danger" onClick={() => handleCancel(item.joy_order_id)}>예약 취소</button>
                    </>}
                    
                    {canDelete && <button className="reservation-action-btn" onClick={() => handleDeleteHistory(item.joy_order_id)}>내역 삭제</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 변경 모달 */}
      {isModalOpen && targetReservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">예약 정보 변경</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '20px'}}>
              * 예약 전날까지만 변경 가능합니다.
            </p>
            
            {/* 날짜 선택 */}
            <div className="modal-input-group">
              <label className="modal-label">날짜 변경</label>
              <input 
                type="date" 
                className="modal-input" 
                value={newDate} 
                onChange={handleDateChange} 
                min={new Date().toISOString().split('T')[0]} 
              />
              {unavailableDates.includes(newDate) && <p style={{color:'red', fontSize:'12px', marginTop:'4px'}}>⚠️ 예약 불가능한 날짜입니다.</p>}
            </div>

            {/* 시간 선택 */}
            <div className="modal-input-group">
              <label className="modal-label">시간 변경</label>
              <select 
                className="modal-input" 
                value={newTime} 
                onChange={(e) => {
                  setNewTime(e.target.value);
                  // 시간이 바뀌면 인원수를 1명으로 리셋 (새로운 기준 적용)
                  setNewCount(1);
                }}
              >
                <option value="">시간을 선택해주세요</option>
                {availableTimes.length > 0 ? (
                  availableTimes.map(time => {
                    const remaining = timeSlotCounts[time];
                    
                    // 잔여석이 0이라도, '내 기존 예약 시간'이면 선택 가능해야 함
                    const isMyTime = (
                      newDate === new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0] &&
                      time === new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5)
                    );

                    // 비활성화 조건: 잔여석 0명 AND 내 예약 시간이 아님
                    const isDisabled = (remaining === 0) && !isMyTime;
                    
                    const remainingText = remaining !== undefined ? ` (잔여 ${remaining}명)` : '';
                    const myTimeText = isMyTime ? ' (현재 예약중)' : '';
                    
                    return (
                      <option key={time} value={time} disabled={isDisabled}>
                        {time}{remainingText}{myTimeText}
                      </option>
                    );
                  })
                ) : (<option disabled>예약 가능한 시간이 없습니다</option>)}
              </select>
            </div>

            {/* 인원 변경 */}
            <div className="modal-input-group">
              <label className="modal-label">인원 변경</label>
              <CustomerInfoForm
                customerInfo={{
                  name: targetReservation.joy_order_payer_name,
                  phoneNumber: targetReservation.joy_order_payer_phone,
                  headCount: newCount
                }}
                onCustomerInfoChange={handleCustomerInfoChange}
                maxHeadCount={currentMaxCount} // 계산된 최대치 전달
                onlyHeadCount={true}
              />
              {newTime ? (
                <p style={{fontSize: '12px', color: '#888', marginTop: '8px'}}>
                  * 선택하신 시간의 예약 가능 인원은 최대 {currentMaxCount}명입니다.
                </p>
              ) : (
                <p style={{fontSize: '12px', color: '#dc2626', marginTop: '8px'}}>
                  * 시간을 먼저 선택해주세요.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button className="reservation-action-btn" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="reservation-action-btn primary" onClick={handleSubmitChange}>변경완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;