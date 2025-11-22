'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brewery, Joy } from '../../types/mockData';
import ReservationCalendar from './ReservationCalendar/ReservationCalendar';
import ExperienceSelector from './ExperienceSelector/ExperienceSelector';
import CustomerInfoForm from './CustomerInfoForm/CustomerInfoForm';
import ReservationSummary from './ReservationSummary/ReservationSummary';
import ReservationSuccessModal from './ReservationSuccessModal/ReservationSuccessModal';
import { prepareReservation, requestPayment, getTimeSlotInfo } from '../../utils/reservationApi';
import { checkAuthAndPrompt } from '../../utils/authUtils';
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

interface ValidationErrors {
  date?: string;
  time?: string;
  experience?: string;
  customerInfo?: string;
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
  
  // [추가] 예약 가능한 시간대 목록 및 잔여석 정보
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(true);

  const dateRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const customerInfoRef = useRef<HTMLElement>(null);

  const selectedExperience = brewery.joy?.find(
    exp => exp.joy_id === selectedExperienceId
  ) || null;

  const totalAmount = selectedExperience ? selectedExperience.joy_final_price * customerInfo.headCount : 0;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => { setErrors({}); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // 모달 스크롤 방지
  useEffect(() => {
    if (showSuccessModal || showReservationModal) {
      const scrollY = window.scrollY;
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      body.classList.add('reservation-modal-open');
    } else {
      const body = document.body;
      const scrollY = body.style.top;
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      body.classList.remove('reservation-modal-open');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      body.classList.remove('reservation-modal-open');
    };
  }, [showSuccessModal, showReservationModal]);

  // [수정] 날짜 선택 시 시간대 및 잔여석 조회
  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // 날짜 바뀌면 시간 초기화
    setTimeSlotCounts({}); // 잔여석 정보 초기화
    
    // 날짜가 바뀌면 인원수도 1로 초기화 (안전하게)
    setCustomerInfo(prev => ({ ...prev, headCount: 1 }));

    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));

    if (!selectedExperienceId) {
      alert('먼저 체험 프로그램을 선택해주세요.');
      return;
    }

    try {
      console.log(`📅 시간대 조회 요청: joyId=${selectedExperienceId}, date=${date}`);
      const data = await getTimeSlotInfo(selectedExperienceId, date);
      
      // 1. 시간대 목록 설정 (HH:mm:ss -> HH:mm)
      const times = (data.time_info || []).map((t: string) => t.substring(0, 5));
      setAvailableTimeSlots(times);

      // 2. 잔여석 정보 파싱 및 저장
      const counts: Record<string, number> = {};
      if (data.remaining_count_list) {
        data.remaining_count_list.forEach((slot: any) => {
          const timeKey = slot.joy_slot_reservation_time.substring(0, 5);
          counts[timeKey] = slot.joy_slot_remaining_count;
        });
      }
      setTimeSlotCounts(counts);
      
      console.log('✅ 예약 가능 시간대:', times);
      console.log('✅ 잔여석 정보:', counts);

    } catch (error) {
      console.error('시간대 정보 조회 실패:', error);
      setAvailableTimeSlots([]); 
      setTimeSlotCounts({});
    }
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    // [수정] 시간이 바뀌면 인원수를 1로 리셋 (새로운 시간대의 잔여석에 맞추기 위해)
    if (time) {
      setCustomerInfo(prev => ({ ...prev, headCount: 1 }));
    }
    if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
  };

  const handleExperienceSelect = (id: number | null) => {
    setSelectedExperienceId(id);
    // 체험이 바뀌면 날짜/시간 관련 정보 모두 초기화
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableTimeSlots([]);
    setTimeSlotCounts({});
    setCustomerInfo(prev => ({ ...prev, headCount: 1 }));
    
    if (errors.experience) setErrors(prev => ({ ...prev, experience: undefined }));
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string | number) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors.customerInfo) setErrors(prev => ({ ...prev, customerInfo: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!selectedDate) newErrors.date = '날짜를 선택해주세요.';
    else if (!selectedTime) newErrors.time = '시간을 선택해주세요.';
    if (!selectedExperienceId) newErrors.experience = '체험 프로그램을 선택해주세요.';
    if (!customerInfo.name.trim()) newErrors.customerInfo = '예약자 이름을 입력해주세요.';
    else if (!customerInfo.phoneNumber.trim()) newErrors.customerInfo = '예약자 전화번호를 입력해주세요.';
    else if (customerInfo.phoneNumber.replace(/[^0-9]/g, '').length < 10) newErrors.customerInfo = '올바른 전화번호를 입력해주세요.';
    else if (customerInfo.headCount < 1) newErrors.customerInfo = '인원수를 선택해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToFirstError = (errs: ValidationErrors) => {
    if (errs.date || errs.time) dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (errs.experience) experienceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (errs.customerInfo) customerInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleReservationSubmit = async () => {
    if (!validateForm()) {
      setTimeout(() => scrollToFirstError(errors), 0);
      return;
    }

    const prepareData = {
      id: selectedExperienceId!,
      count: customerInfo.headCount,
      payer_name: customerInfo.name,
      payer_phone: customerInfo.phoneNumber,
      reservation_date: selectedDate!,
      reservation_time: selectedTime!
    };

    console.log('🚀 [1단계] 예약 준비 요청:', prepareData);

    try {
      const prepareResponse = await prepareReservation(prepareData);
      console.log('✅ [1단계] 응답 성공:', prepareResponse);

      const pgOrderId = prepareResponse.content;

      if (!pgOrderId) {
        throw new Error('예약 주문 번호(pg_order_id)를 받지 못했습니다.');
      }

      const uniquePaymentKey = `test_pay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const requestData = {
        pg_order_id: pgOrderId,
        pg_payment_key: uniquePaymentKey,
        total_amount: totalAmount
      };

      console.log('🚀 [2단계] 결제 승인 요청:', requestData);

      const requestResponse = await requestPayment(requestData);
      console.log('✅ [2단계] 결제 완료:', requestResponse);

      setShowReservationModal(false);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ 예약/결제 실패:', error);
      const errorMsg = error.response?.data?.message || error.message || '오류가 발생했습니다.';
      alert(`예약 실패: ${errorMsg}`);
    }
  };

  const handleSuccessModalClose = () => { setShowSuccessModal(false); onClose(); };
  const handleReservationModalClose = () => { setShowReservationModal(false); onClose(); };

  // [핵심] 현재 선택된 시간의 최대 예약 가능 인원 계산
  // 1. 시간 미선택 -> 1 (선택 유도)
  // 2. 시간 선택 & 잔여석 정보 있음 -> 잔여석
  // 3. 시간 선택 & 잔여석 정보 없음 -> 20 (기본값)
  const currentMaxCount = selectedTime 
    ? (timeSlotCounts[selectedTime] !== undefined ? timeSlotCounts[selectedTime] : 20) 
    : 1;

  if (!showReservationModal && !showSuccessModal) {
    return null;
  }

  return (
    <>
      {showReservationModal && (
        <div className="reservation-experience-reservation">
          <div className="reservation-header">
            <div className="reservation-header-content">
              <h1 className="reservation-title">양조장 체험 예약</h1>
              <p className="reservation-brewery-name">{brewery.brewery_name}</p>
            </div>
            <button className="reservation-close-btn" onClick={handleReservationModalClose} type="button">✕</button>
          </div>

          <div className="reservation-content">
            <div className="reservation-main">
              <section ref={experienceRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">1. 체험 선택</h2>
                <ExperienceSelector
                  experiences={brewery.joy || []}
                  selectedExperience={selectedExperienceId}
                  onExperienceSelect={handleExperienceSelect}
                  error={errors.experience}
                />
              </section>

              <section ref={dateRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">2. 날짜 및 시간 선택</h2>
                <ReservationCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  availableTimeSlots={availableTimeSlots}
                  error={errors.date || errors.time}
                />
              </section>

              <section ref={customerInfoRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">3. 예약자 정보</h2>
                
                {/* [수정] maxHeadCount 전달 */}
                <CustomerInfoForm
                  customerInfo={customerInfo}
                  onCustomerInfoChange={handleCustomerInfoChange}
                  error={errors.customerInfo}
                  maxHeadCount={currentMaxCount}
                />
                
                {/* [추가] 안내 문구 */}
                {selectedTime && (
                  <div style={{ padding: '0 24px 20px', color: '#666', fontSize: '14px', marginTop: '-10px' }}>
                    * 선택하신 시간의 예약 가능 인원은 <strong>최대 {currentMaxCount}명</strong>입니다.
                  </div>
                )}
                {!selectedTime && selectedDate && (
                  <div style={{ padding: '0 24px 20px', color: '#dc2626', fontSize: '14px', marginTop: '-10px' }}>
                    * 시간을 먼저 선택해주세요.
                  </div>
                )}
              </section>
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
          onClose={handleSuccessModalClose}
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