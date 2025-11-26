'use client';

import React, { useState, useEffect } from 'react';
import { Brewery, Joy } from '../../types/mockData';
import ReservationCalendar from './ReservationCalendar/ReservationCalendar';
import ExperienceSelector from './ExperienceSelector/ExperienceSelector';
import CustomerInfoForm from './CustomerInfoForm/CustomerInfoForm';
import ReservationSummary from './ReservationSummary/ReservationSummary';
import ReservationSuccessModal from './ReservationSuccessModal/ReservationSuccessModal';
import { prepareReservation, requestPayment, getTimeSlotInfo } from '../../utils/reservationApi';
import './ExperienceReservation.css';

interface ExperienceReservationProps {
  brewery: Brewery;
  experienceId?: number;
  onClose: () => void;
}

interface CustomerInfo {
  name: string;
  phoneNumber: string;
  headCount: number;
}

// Joy 인터페이스 확장 (API에 joy_max_count가 있다고 가정)
interface ExtendedJoy extends Joy {
  joy_max_count?: number;
}

const ExperienceReservation: React.FC<ExperienceReservationProps> = ({
  brewery,
  experienceId,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(experienceId || null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phoneNumber: '',
    headCount: 1
  });
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(true);

  useEffect(() => {
    if (showSuccessModal || showReservationModal) {
      document.body.classList.add('reservation-modal-open');
    } else {
      document.body.classList.remove('reservation-modal-open');
    }
    return () => document.body.classList.remove('reservation-modal-open');
  }, [showSuccessModal, showReservationModal]);

  const selectedExperience = (brewery.joy?.find(exp => exp.joy_id === selectedExperienceId) as ExtendedJoy) || null;
  const totalAmount = selectedExperience ? selectedExperience.joy_final_price * customerInfo.headCount : 0;

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
    setTimeSlotCounts({});
    setCustomerInfo(prev => ({ ...prev, headCount: 1 }));

    if (!selectedExperienceId) return;

    try {
      const data = await getTimeSlotInfo(selectedExperienceId, date);
      
      const rawTimes = data.time_info || [];
      const formattedTimes = rawTimes.map((t: string) => {
        return t.length >= 5 ? t.substring(0, 5) : t;
      });
      setAvailableTimeSlots(formattedTimes.sort()); 

      const counts: Record<string, number> = {};
      if (data.remaining_count_list && Array.isArray(data.remaining_count_list)) {
        data.remaining_count_list.forEach((slot: any) => {
          const rawTime = slot.joy_slot_reservation_time || "";
          const timeKey = rawTime.length >= 5 ? rawTime.substring(0, 5) : rawTime;
          const count = slot.joy_slot_remaining_count;
          if (timeKey) {
            counts[timeKey] = count;
          }
        });
      }
      setTimeSlotCounts(counts);

    } catch (error) {
      console.error('시간대 정보 조회 실패:', error);
      setAvailableTimeSlots([]);
      setTimeSlotCounts({});
    }
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    setCustomerInfo(prev => ({ ...prev, headCount: 1 })); 
  };

  // [핵심 수정] 최대 인원 계산 로직 (임의값 제거)
  const getCurrentMaxHeadCount = () => {
    if (!selectedTime) return 1;
    
    const remaining = timeSlotCounts[selectedTime];
    
    // 1. API 잔여석 정보가 있으면 그 값을 사용 (0 포함)
    if (remaining !== undefined) {
      return remaining;
    }
    
    // 2. 잔여석 정보가 없으면(아무도 예약 안 함) -> 체험의 최대 정원(joy_max_count) 사용
    if (selectedExperience && selectedExperience.joy_max_count) {
      return selectedExperience.joy_max_count;
    }

    // 3. 정원 정보도 없으면 0명 (임의의 값 20, 50 등 제거)
    // 이렇게 하면 API에서 데이터를 제대로 안 주면 예약이 불가능해지므로 데이터 정합성 확보 가능
    return 0; 
  };

  const currentMaxCount = getCurrentMaxHeadCount();

  const handleReservationSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedExperienceId) {
       alert('필수 정보를 모두 선택해주세요.');
       return;
    }
    if (customerInfo.headCount < 1) {
      alert('인원은 최소 1명 이상이어야 합니다.');
      return;
    }

    if (currentMaxCount === 0) {
      alert('선택하신 시간대는 예약이 마감되었거나 정보를 불러올 수 없습니다.');
      return;
    }
    if (customerInfo.headCount > currentMaxCount) {
      alert(`선택하신 시간대는 최대 ${currentMaxCount}명까지만 예약 가능합니다.`);
      return;
    }

    try {
      const prepareData = {
        id: selectedExperienceId,
        count: customerInfo.headCount,
        payer_name: customerInfo.name,
        payer_phone: customerInfo.phoneNumber,
        reservation_date: selectedDate,
        reservation_time: selectedTime
      };

      const prepareResponse = await prepareReservation(prepareData);
      const pgOrderId = prepareResponse.content;

      const requestData = {
        pg_order_id: pgOrderId,
        pg_payment_key: `test_${Date.now()}`, 
        total_amount: totalAmount
      };

      await requestPayment(requestData);
      setShowReservationModal(false);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('예약 실패:', error);
      alert('예약 처리에 실패했습니다.');
    }
  };

  if (!showReservationModal && !showSuccessModal) return null;

  return (
    <>
      {showReservationModal && (
        <div className="reservation-experience-reservation">
          <div className="reservation-header">
            <div className="reservation-header-content">
              <h1 className="reservation-title">양조장 체험 예약</h1>
              <p className="reservation-brewery-name">{brewery.brewery_name}</p>
            </div>
            <button className="reservation-close-btn" onClick={onClose} type="button">✕</button>
          </div>

          <div className="reservation-content">
            <div className="reservation-main">
              <ExperienceSelector 
                 experiences={brewery.joy || []}
                 selectedExperience={selectedExperienceId}
                 onExperienceSelect={(id) => {
                   setSelectedExperienceId(id);
                   setSelectedDate(null); 
                   setAvailableTimeSlots([]);
                 }}
              />

              <ReservationCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                availableTimeSlots={availableTimeSlots}
                timeSlotCounts={timeSlotCounts}
                joyId={selectedExperienceId || undefined}
              />

              <CustomerInfoForm
                customerInfo={customerInfo}
                onCustomerInfoChange={(field, value) => setCustomerInfo(prev => ({ ...prev, [field]: value }))}
                maxHeadCount={currentMaxCount} // 0이면 예약 불가
              />
              {selectedTime && (
                <p className="max-count-info" style={{padding:'0 24px', color:'#666', fontSize:'14px', marginTop:'-10px'}}>
                  {currentMaxCount === 0 
                    ? '* 해당 시간대는 예약이 마감되었습니다.'
                    : `* 해당 시간대는 현재 최대 ${currentMaxCount}명까지 예약 가능합니다.`}
                </p>
              )}
            </div>

            <aside className="reservation-sidebar">
              <div className="reservation-sidebar-sticky">
                <ReservationSummary 
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedExperience={selectedExperience}
                  headCount={customerInfo.headCount}
                  totalAmount={totalAmount}
                  onReservationSubmit={handleReservationSubmit}
                />
              </div>
            </aside>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <ReservationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => { setShowSuccessModal(false); onClose(); }}
          reservationInfo={{
            date: selectedDate || '',
            time: selectedTime || '',
            experienceName: selectedExperience?.joy_name || '',
            customerName: customerInfo.name,
            headCount: customerInfo.headCount,
            totalAmount: totalAmount
          }}
        />
      )}
    </>
  );
};

export default ExperienceReservation;