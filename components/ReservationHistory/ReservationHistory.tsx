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
import { 
  getBreweryById, 
  searchBreweries, 
  convertBreweryDetailToType 
} from '../../utils/brewery';
import CustomerInfoForm from '../ExperienceReservation/CustomerInfoForm/CustomerInfoForm';
import './ReservationHistory.css';

interface ExtendedJoyOrder extends JoyOrder {
  brewery_id?: number;
}

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
  const [reservations, setReservations] = useState<ExtendedJoyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetReservation, setTargetReservation] = useState<ExtendedJoyOrder | null>(null);
  
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCount, setNewCount] = useState(1);
  
  // API 데이터 상태
  const [unavailableDatesList, setUnavailableDatesList] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});
  
  // [핵심] 현재 변경 중인 체험의 최대 정원 (API joy_max_count 값)
  // 초기값은 0으로 설정하여 데이터 로드 전에는 예약을 막음
  const [currentJoyMaxCapacity, setCurrentJoyMaxCapacity] = useState<number>(0);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      if (reservations.length === 0) setIsLoading(true);
      const data = await getMyReservations(0);
      setReservations(data as ExtendedJoyOrder[]); 
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

  // [핵심 함수] 체험 예약 페이지와 동일한 방식으로 최대 인원을 가져오는 로직
  const fetchJoyMaxCapacity = async (reservation: ExtendedJoyOrder) => {
    let breweryId = reservation.brewery_id;

    // 1. brewery_id가 없으면 체험 이름(혹은 양조장 이름)으로 양조장을 검색해서 ID를 찾음
    // 예약 내역에 brewery_name이 있다면 그것을 사용, 없다면 joy_name으로 시도
    const searchKeyword = reservation.brewery_name || reservation.joy_name;

    if (!breweryId && searchKeyword) {
      try {
        const searchResult = await searchBreweries({
          keyword: searchKeyword, 
          startOffset: 0,
          size: 5 
        });
        
        // 검색 결과 중 첫 번째 양조장 선택 (가장 유사한 결과)
        if (searchResult.content.length > 0) {
          breweryId = searchResult.content[0].brewery_id;
        }
      } catch (e) {
        console.error('양조장 검색 실패:', e);
      }
    }

    // 2. ID를 구했으면 상세 정보 조회하여 joy_max_count 추출
    // (이 부분이 체험 예약 페이지에서 brewery.joy를 쓰는 것과 동일한 효과)
    if (breweryId) {
      try {
        const breweryDetail = await getBreweryById(breweryId);
        if (breweryDetail) {
          const convertedBrewery = convertBreweryDetailToType(breweryDetail);
          // 해당 양조장의 체험 목록 중 내가 예약한 체험(joy_id) 찾기
          const targetJoy = convertedBrewery.joy?.find((j: any) => j.joy_id === reservation.joy_id);
          
          if (targetJoy && targetJoy.joy_max_count) {
            // API에서 받아온 joy_max_count 적용
            setCurrentJoyMaxCapacity(targetJoy.joy_max_count);
            return;
          }
        }
      } catch (e) {
        console.error('양조장 상세 조회 실패:', e);
      }
    }

    // 3. 실패 시: 0으로 설정 (예약 불가 상태로 둠 -> 데이터 확인 필요)
    console.warn('체험 최대 인원 정보를 가져오지 못했습니다.');
    setCurrentJoyMaxCapacity(0);
  };

  const openChangeModal = async (reservation: ExtendedJoyOrder) => {
    setTargetReservation(reservation);
    
    const dateObj = new Date(reservation.joy_order_reservation);
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toTimeString().slice(0, 5);
    
    setNewDate(dateStr);
    setNewTime(timeStr);
    setNewCount(reservation.joy_order_count);
    
    // 초기화
    setCurrentJoyMaxCapacity(0); 
    setIsModalOpen(true);

    // 1. 최대 정원 정보 비동기 로드 (양조장 정보 조회 -> 체험 정보 찾기)
    fetchJoyMaxCapacity(reservation);

    // 2. 일정 및 잔여석 정보 로드
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
      
      const rawTimes = data.time_info || [];
      // 시간 포맷 파싱 (HH:mm:ss -> HH:mm)
      const formattedTimes = rawTimes.map((t: string) => {
        return t.length >= 5 ? t.substring(0, 5) : t;
      });
      setAvailableTimes(formattedTimes.sort()); 

      const counts: Record<string, number> = {};
      if (data.remaining_count_list && Array.isArray(data.remaining_count_list)) {
        data.remaining_count_list.forEach((slot: any) => {
          const rawTime = slot.joy_slot_reservation_time || "";
          // 시간 문자열 앞 5자리만 추출하여 키로 사용
          const timeKey = rawTime.length >= 5 ? rawTime.substring(0, 5) : rawTime;
          const count = slot.joy_slot_remaining_count;
          if (timeKey) {
            counts[timeKey] = count;
          }
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

  // [핵심 로직] 최대 인원 계산
  const calculateMaxCount = () => {
    if (!newTime || !targetReservation) return 1;

    const remaining = timeSlotCounts[newTime];
    
    // 1. 잔여석 정보가 있으면 그 값 사용
    // 2. 없으면(undefined, 예약자 0명), API에서 조회한 joy_max_count 사용
    const maxCapacity = remaining !== undefined ? remaining : currentJoyMaxCapacity;
    
    // 3. 내 기존 예약 시간과 동일한 경우 (내 자리는 이미 확보됨) -> 추가 허용
    const originalDate = new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0];
    const originalTime = new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5);

    if (newDate === originalDate && newTime === originalTime) {
      return maxCapacity + targetReservation.joy_order_count;
    }

    return maxCapacity;
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
    
    // 0명이면(마감 or 정보 로드 실패) 예약 불가
    if (currentMaxCount === 0) {
        alert('선택하신 시간대는 예약이 불가능하거나 정보를 불러오는 중입니다.');
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
                min={new Date().toISOString().split('T')[0]}
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
                  const remaining = timeSlotCounts[time];
                  // 잔여석 없으면(undefined) joy_max_count 사용
                  const maxCapacity = remaining !== undefined ? remaining : currentJoyMaxCapacity;
                  
                  const isOriginalSlot = (
                     newDate === new Date(targetReservation.joy_order_reservation).toISOString().split('T')[0] &&
                     time === new Date(targetReservation.joy_order_reservation).toTimeString().slice(0, 5)
                  );
                  const isSoldOut = !isOriginalSlot && maxCapacity <= 0;

                  return (
                    <option key={time} value={time} disabled={isSoldOut}>
                      {time} 
                      {isSoldOut ? ' (마감)' : (remaining !== undefined ? ` (${remaining}석)` : '')} 
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
                {currentMaxCount === 0 ? '예약 불가 (정보 확인 중...)' : `최대 ${currentMaxCount}명 가능`}
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