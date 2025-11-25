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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetReservation, setTargetReservation] = useState<JoyOrder | null>(null);
  
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCount, setNewCount] = useState(1);
  
  const [unavailableDatesList, setUnavailableDatesList] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      if (reservations.length === 0) setIsLoading(true);
      const data = await getMyReservations(0); 
      setReservations(data); 
    } catch (error) {
      console.error('예약 내역 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('정말로 예약을 취소하시겠습니까?')) return;
    try {
      await cancelReservation(id);
      alert('예약이 취소되었습니다.');
      fetchReservations();
    } catch (error: any) {
      alert('취소 실패');
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('내역을 삭제하시겠습니까?')) return;
    try {
      await deleteReservationHistory(id);
      alert('내역 삭제 완료');
      fetchReservations();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const openChangeModal = async (reservation: JoyOrder) => {
    setTargetReservation(reservation);
    
    const dateObj = new Date(reservation.joy_order_reservation);
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toTimeString().slice(0, 5);
    
    setNewDate(dateStr);
    setNewTime(timeStr);
    setNewCount(reservation.joy_order_count);
    setIsModalOpen(true);

    try {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      
      const dates = await getUnavailableDates(reservation.joy_id, year, month);
      setUnavailableDatesList(dates);
      
      await loadTimeSlots(reservation.joy_id, dateStr);
    } catch (e) {
      console.error('일정 로드 실패:', e);
    }
  };

  const loadTimeSlots = async (joyId: number, date: string) => {
    try {
      const data = await getTimeSlotInfo(joyId, date);
      
      const times = (data.time_info || []).map((t: string) => t.substring(0, 5));
      setAvailableTimes(times);

      const counts: Record<string, number> = {};
      if (data.remaining_count_list) {
        data.remaining_count_list.forEach((slot: any) => {
          const timeKey = slot.joy_slot_reservation_time.substring(0, 5);
          counts[timeKey] = slot.joy_slot_remaining_count;
        });
      }
      setTimeSlotCounts(counts);
    } catch (e) {
      setAvailableTimes([]);
      setTimeSlotCounts({});
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setNewDate(date);
    setNewTime('');
    setNewCount(1);
    
    if (targetReservation) {
      await loadTimeSlots(targetReservation.joy_id, date);
    }
  };

  // [핵심 수정] 최대 인원 계산 (임의의 20명 제한 제거)
  const calculateMaxCount = () => {
    if (!newTime || !targetReservation) return 1;

    const remainingFromApi = timeSlotCounts[newTime];
    // API 정보가 없으면 제한을 100으로 풀어줌 (임의의 20 제거)
    const remaining = remainingFromApi !== undefined ? remainingFromApi : 100;
    
    // 내가 원래 예약했던 시간과 동일한 경우 (내 자리는 확보됨)
    const originalDate = new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0];
    const originalTime = new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5);

    if (newDate === originalDate && newTime === originalTime) {
      return remaining + targetReservation.joy_order_count;
    }

    return remaining;
  };

  const currentMaxCount = calculateMaxCount();

  const handleSubmitChange = async () => {
    if (!targetReservation || !newDate || !newTime || newCount < 1) {
      alert('정보를 올바르게 입력해주세요.');
      return;
    }
    if (unavailableDatesList.includes(newDate)) {
      alert('선택하신 날짜는 예약이 불가능합니다.');
      return;
    }
    
    // 0명이면 예약 불가
    if (currentMaxCount === 0) {
        alert('선택하신 시간대는 예약이 불가능합니다.');
        return;
    }
    if (newCount > currentMaxCount) {
      alert(`선택하신 시간은 최대 ${currentMaxCount}명까지만 가능합니다.`);
      return;
    }

    try {
      await changeReservation({
        id: targetReservation.joy_order_id,
        reservation_date: newDate,
        reservation_time: newTime,
        count: newCount
      });
      
      alert('예약이 변경되었습니다.');
      setIsModalOpen(false);
      
      setReservations(prev => prev.map(item => {
        if (item.joy_order_id === targetReservation.joy_order_id) {
          const unitPrice = item.joy_order_count > 0 ? item.joy_total_price / item.joy_order_count : 0;
          return {
            ...item,
            joy_order_reservation: `${newDate}T${newTime}:00`,
            joy_order_count: newCount,
            joy_total_price: unitPrice * newCount,
            joy_payment_status: 'PENDING'
          };
        }
        return item;
      }));
    } catch (error: any) {
      alert('변경 실패');
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

  if (isLoading) return <div className="reservation-loading">로딩 중...</div>;

  return (
    <div className="reservation-history-container">
      <div className="reservation-history-header">
        <h1 className="reservation-history-title">체험 예약 내역</h1>
      </div>

      {reservations.length === 0 ? (
        <div className="reservation-empty">
          <h3>예약 내역이 없습니다</h3>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((item) => {
            const { fullDate, time, weekDay } = formatDisplayDate(item.joy_order_reservation);
            const statusInfo = getStatusInfo(item.joy_payment_status);
            const canCancel = ['PENDING', 'CONFIRMED', 'PAID'].includes(item.joy_payment_status);
            const canDelete = ['CANCELLED', 'COMPLETED'].includes(item.joy_payment_status);

            return (
              <div key={item.joy_order_id} className="reservation-card">
                <div className="reservation-card-header">
                  <span className="reservation-date-label">{fullDate} ({weekDay})</span>
                  <span className="reservation-id">No. {item.joy_order_id}</span>
                </div>
                <div className="reservation-item">
                  <div className="reservation-item-info">
                    <span className="reservation-brewery">{item.brewery_name}</span>
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
                      <button className="reservation-action-btn" onClick={() => openChangeModal(item)}>변경</button>
                      <button className="reservation-action-btn danger" onClick={() => handleCancel(item.joy_order_id)}>취소</button>
                    </>}
                    {canDelete && <button className="reservation-action-btn" onClick={() => handleDeleteHistory(item.joy_order_id)}>삭제</button>}
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
            <h3 className="modal-title">예약 변경</h3>
            
            <div className="modal-input-group">
              <label className="modal-label">날짜</label>
              <input 
                type="date" 
                className="modal-input"
                value={newDate}
                min={new Date().toISOString().split('T')[0]} // 오늘 이전 날짜 선택 불가
                onChange={handleDateChange}
              />
              {unavailableDatesList.includes(newDate) && <p className="error-text">예약 불가능한 날짜입니다.</p>}
            </div>

            <div className="modal-input-group">
              <label className="modal-label">시간</label>
              <select 
                className="modal-input" 
                value={newTime} 
                onChange={(e) => { setNewTime(e.target.value); setNewCount(1); }}
              >
                <option value="">시간 선택</option>
                {availableTimes.map(time => {
                  const remainingFromApi = timeSlotCounts[time];
                  // 정보가 없으면 100명 (제한 없음)
                  const remaining = remainingFromApi !== undefined ? remainingFromApi : 100;
                  
                  const isOriginalSlot = (
                     newDate === new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0] &&
                     time === new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5)
                  );
                  const isSoldOut = !isOriginalSlot && remaining <= 0;

                  return (
                    <option key={time} value={time} disabled={isSoldOut}>
                      {time} 
                      {isSoldOut ? ' (마감)' : (remainingFromApi !== undefined ? ` (${remaining}석)` : '')} 
                      {isOriginalSlot ? '- 현재 예약' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="modal-input-group">
              <label className="modal-label">인원</label>
              <CustomerInfoForm
                customerInfo={{ 
                  name: targetReservation.joy_order_payer_name, 
                  phoneNumber: targetReservation.joy_order_payer_phone, 
                  headCount: newCount 
                }}
                onCustomerInfoChange={(_, val) => setNewCount(Number(val))}
                maxHeadCount={currentMaxCount}
                onlyHeadCount={true}
              />
              <p className="info-text" style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>
                {currentMaxCount === 0 ? '예약 불가' : `최대 ${currentMaxCount}명 가능`}
              </p>
            </div>

            <div className="modal-actions">
              <button className="reservation-action-btn" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="reservation-action-btn primary" onClick={handleSubmitChange}>변경 완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;