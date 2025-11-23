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
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
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
      alert('예약 취소 실패');
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('이 내역을 삭제하시겠습니까?')) return;
    try {
      await deleteReservationHistory(id);
      alert('내역이 삭제되었습니다.');
      fetchReservations();
    } catch (error) {
      alert('내역 삭제 실패');
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
      const joyId = reservation.joy_id; 
      const dates = await getUnavailableDates(joyId, dateObj.getFullYear(), dateObj.getMonth() + 1);
      setUnavailableDates(dates);
      
      await loadTimeSlots(joyId, dateStr);
    } catch (e) {
      console.error('일정 정보 로드 실패:', e);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setNewDate(date);
    setNewTime(''); 
    setTimeSlotCounts({}); 
    setNewCount(1);
    
    if (targetReservation) {
      await loadTimeSlots(targetReservation.joy_id, date);
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

  const handleSubmitChange = async () => {
    if (!targetReservation || !newDate || !newTime || newCount < 1) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    if (unavailableDates.includes(newDate)) {
      alert('선택하신 날짜는 예약이 불가능합니다.');
      return;
    }

    try {
      await changeReservation({
        id: targetReservation.joy_order_id,
        reservation_date: newDate,
        reservation_time: newTime,
        count: newCount
      });
      alert('예약 정보가 변경되었습니다.');
      setIsModalOpen(false);
      fetchReservations();
    } catch (error: any) {
      alert('변경 실패');
    }
  };

  const calculateMaxCount = () => {
    if (!newTime || !targetReservation) return 0; 

    const slotRemaining = timeSlotCounts[newTime]; 
    const availableInSlot = slotRemaining !== undefined ? slotRemaining : 20;

    const originalDateObj = new Date(targetReservation.joy_order_reservation);
    const originalDate = originalDateObj.toISOString().split('T')[0];
    const originalTime = originalDateObj.toTimeString().slice(0, 5);

    if (newDate === originalDate && newTime === originalTime) {
      return availableInSlot + targetReservation.joy_order_count;
    }

    return availableInSlot;
  };

  const currentMaxCount = calculateMaxCount();

  if (isLoading) return <div className="reservation-loading">로딩 중...</div>;

  return (
    <div className="reservation-history-container">
      <div className="reservation-history-header">
        <h1 className="reservation-history-title">체험 예약 내역</h1>
      </div>

      {reservations.length === 0 ? (
        <div className="reservation-empty">예약 내역이 없습니다.</div>
      ) : (
        <div className="reservation-list">
          {reservations.map((item) => {
            const { fullDate, time, weekDay } = formatDisplayDate(item.joy_order_reservation);
            return (
              <div key={item.joy_order_id} className="reservation-card">
                <div className="reservation-card-header">
                  <span>{fullDate} ({weekDay})</span>
                  <span>{item.joy_payment_status}</span>
                </div>
                <div className="reservation-item">
                  <div className="reservation-item-info">
                    <h3>{item.joy_name}</h3>
                    <div>⏰ {time} | 👥 {item.joy_order_count}명</div>
                  </div>
                  <div className="reservation-item-actions">
                    <button className="reservation-action-btn" onClick={() => openChangeModal(item)}>예약 변경</button>
                    <button className="reservation-action-btn danger" onClick={() => handleCancel(item.joy_order_id)}>취소</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && targetReservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">예약 변경</h3>
            <div className="modal-input-group">
              <label>날짜</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={handleDateChange} 
                className="modal-input" 
                min={new Date().toISOString().split('T')[0]} // 오늘 이전 날짜 선택 방지
              />
            </div>
            <div className="modal-input-group">
              <label>시간</label>
              <select value={newTime} onChange={(e) => { setNewTime(e.target.value); setNewCount(1); }} className="modal-input">
                <option value="">시간 선택</option>
                {availableTimes.map(t => {
                    const isMyTime = (
                      newDate === new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0] &&
                      t === new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5)
                    );
                    const remaining = timeSlotCounts[t];
                    const isSoldOut = remaining === 0 && !isMyTime;
                    
                    return (
                        <option key={t} value={t} disabled={isSoldOut}>
                            {t} {remaining !== undefined ? `(${remaining}석)` : ''} {isMyTime ? '(현재)' : ''}
                        </option>
                    );
                })}
              </select>
            </div>
            <div className="modal-input-group">
              <label>인원 (최대 {currentMaxCount}명)</label>
              <CustomerInfoForm
                customerInfo={{ name: '', phoneNumber: '', headCount: newCount }}
                onCustomerInfoChange={(f, v) => f === 'headCount' && setNewCount(Number(v))}
                maxHeadCount={currentMaxCount}
                onlyHeadCount={true}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)} className="reservation-action-btn">취소</button>
              <button onClick={handleSubmitChange} className="reservation-action-btn primary">변경완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;