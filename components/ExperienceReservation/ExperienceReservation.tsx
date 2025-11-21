'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brewery, Joy } from '../../types/mockData';
import ReservationCalendar from './ReservationCalendar/ReservationCalendar';
import ExperienceSelector from './ExperienceSelector/ExperienceSelector';
import CustomerInfoForm from './CustomerInfoForm/CustomerInfoForm';
import ReservationSummary from './ReservationSummary/ReservationSummary';
import ReservationSuccessModal from './ReservationSuccessModal/ReservationSuccessModal';
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
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phoneNumber: '',
    headCount: 1
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(true);

  const dateRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const customerInfoRef = useRef<HTMLElement>(null);

  // mockData의 Joy 타입 사용 (joy_id, joy_final_price 등)
  const selectedExperience = brewery.joy?.find(
    exp => exp.joy_id === selectedExperienceId
  ) || null;

  // 총 금액 계산
  const totalAmount = selectedExperience ? selectedExperience.joy_final_price * customerInfo.headCount : 0;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
  };

  const handleExperienceSelect = (experienceId: number | null) => {
    setSelectedExperienceId(experienceId);
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

  const scrollToFirstError = (errors: ValidationErrors) => {
    if (errors.date || errors.time) dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (errors.experience) experienceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (errors.customerInfo) customerInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleReservationSubmit = async () => {
    const validationErrors = validateForm();
    
    if (!validationErrors) {
      scrollToFirstError(errors);
      return;
    }

    // [수정 중요] ERD의 joy_order 테이블 구조에 맞춰 데이터 준비
    // reservation 필드 (datetime) 생성: YYYY-MM-DD + HH:mm -> ISO String
    let reservationDateTime = '';
    if (selectedDate && selectedTime) {
      reservationDateTime = `${selectedDate}T${selectedTime}:00`;
    }

    // 백엔드로 전송할 데이터 객체 (ERD 기준)
    const orderData = {
      joy_id: selectedExperienceId,
      // user_id: 1, // 실제로는 로그인된 유저 ID를 가져와야 함
      count: customerInfo.headCount,          // joy_order.count
      total_price: totalAmount,               // joy_order.total_price
      payer_name: customerInfo.name,          // joy_order.payer_name
      payer_phone: customerInfo.phoneNumber,  // joy_order.payer_phone
      reservation: reservationDateTime,       // joy_order.reservation (datetime)
      created_at: new Date().toISOString(),   // joy_order.created_at
    };

    console.log('🚀 [API 요청] 체험 예약 데이터:', orderData);

    // TODO: 여기서 실제 API 호출 (axios.post 등)
    
    setShowReservationModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleReservationModalClose = () => {
    setShowReservationModal(false);
    onClose();
  };

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
              <section ref={dateRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">1. 날짜 및 시간 선택</h2>
                <ReservationCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  error={errors.date || errors.time}
                />
              </section>

              <section ref={experienceRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">2. 체험 선택</h2>
                <ExperienceSelector
                  experiences={brewery.joy || []}
                  selectedExperience={selectedExperienceId}
                  onExperienceSelect={handleExperienceSelect}
                  error={errors.experience}
                />
              </section>

              <section ref={customerInfoRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">3. 예약자 정보</h2>
                <CustomerInfoForm
                  customerInfo={customerInfo}
                  onCustomerInfoChange={handleCustomerInfoChange}
                  error={errors.customerInfo}
                />
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