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
  // 예약 모달의 표시 상태를 관리하는 state 추가
  const [showReservationModal, setShowReservationModal] = useState(true);

  // 스크롤을 위한 ref들
  const dateRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const customerInfoRef = useRef<HTMLElement>(null);

  // 선택된 체험 프로그램 정보
  const selectedExperience = brewery.experience_programs?.find(
    exp => exp.joy_id === selectedExperienceId
  ) || null;

  // 총 금액 계산
  const totalAmount = selectedExperience ? selectedExperience.price * customerInfo.headCount : 0;

  // 에러 메시지 자동 제거
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // 모달 열릴 때 body 스크롤 방지 (가벼운 버전)
  useEffect(() => {
    if (showSuccessModal || showReservationModal) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      const body = document.body;
      
      // 가벼운 스크롤 방지
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      
      body.classList.add('reservation-modal-open');
      
    } else {
      // 모달 닫을 때 원래 스크롤 위치로 복원
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

    // 컴포넌트 언마운트 시 정리
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
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }));
    }
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: undefined }));
    }
  };

  const handleExperienceSelect = (experienceId: number | null) => {
    setSelectedExperienceId(experienceId);
    if (errors.experience) {
      setErrors(prev => ({ ...prev, experience: undefined }));
    }
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string | number) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors.customerInfo) {
      setErrors(prev => ({ ...prev, customerInfo: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!selectedDate) {
      newErrors.date = '날짜를 선택해주세요.';
    } else if (!selectedTime) {
      newErrors.time = '시간을 선택해주세요.';
    }

    if (!selectedExperienceId) {
      newErrors.experience = '체험 프로그램을 선택해주세요.';
    }

    if (!customerInfo.name.trim()) {
      newErrors.customerInfo = '예약자 이름을 입력해주세요.';
    } else if (!customerInfo.phoneNumber.trim()) {
      newErrors.customerInfo = '예약자 전화번호를 입력해주세요.';
    } else if (customerInfo.phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      newErrors.customerInfo = '올바른 전화번호를 입력해주세요.';
    } else if (customerInfo.headCount < 1) {
      newErrors.customerInfo = '인원수를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToFirstError = (errors: ValidationErrors) => {
    // 첫 번째 에러가 있는 섹션으로 스크롤
    if (errors.date || errors.time) {
      dateRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    } else if (errors.experience && experienceRef.current) {
      experienceRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    } else if (errors.customerInfo && customerInfoRef.current) {
      customerInfoRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const handleReservationSubmit = async () => {
    const validationErrors = validateForm();
    
    if (!validationErrors) {
      // 유효성 검사 실패 시 첫 번째 에러 섹션으로 스크롤
      scrollToFirstError(errors);
      return;
    }

    // 예약하기 버튼을 누르는 즉시 현재 예약 모달 숨기고 성공 모달 표시
    setShowReservationModal(false);
    setShowSuccessModal(true);
    
    console.log('체험 예약 완료:', {
      brewery: brewery.brewery_name,
      date: selectedDate,
      experience: selectedExperience?.name,
      customer: customerInfo,
      totalAmount
    });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // 성공 모달이 닫히면 전체 예약 프로세스 종료
    onClose();
  };

  const handleReservationModalClose = () => {
    setShowReservationModal(false);
    onClose();
  };

  // 예약 모달이 숨겨져 있으면 아무것도 렌더링하지 않음
  if (!showReservationModal && !showSuccessModal) {
    return null;
  }

  return (
    <>
      {/* 예약 모달 - showReservationModal이 true일 때만 표시 */}
      {showReservationModal && (
        <div className="reservation-experience-reservation">
          <div className="reservation-header">
            <div className="reservation-header-content">
              <h1 className="reservation-title">양조장 체험 예약</h1>
              <p className="reservation-brewery-name">{brewery.brewery_name}</p>
            </div>
            <button className="reservation-close-btn" onClick={handleReservationModalClose} type="button">
              ✕
            </button>
          </div>

          <div className="reservation-content">
            <div className="reservation-main">
              {/* 1. 날짜 및 시간 선택 */}
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

              {/* 2. 체험 선택 */}
              <section ref={experienceRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">2. 체험 선택</h2>
                <ExperienceSelector
                  experiences={brewery.experience_programs || []}
                  selectedExperience={selectedExperienceId}
                  onExperienceSelect={handleExperienceSelect}
                  error={errors.experience}
                />
              </section>

              {/* 3. 예약자 정보 */}
              <section ref={customerInfoRef} className="reservation-section reservation-scroll-target">
                <h2 className="reservation-section-title">3. 예약자 정보</h2>
                <CustomerInfoForm
                  customerInfo={customerInfo}
                  onCustomerInfoChange={handleCustomerInfoChange}
                  error={errors.customerInfo}
                />
              </section>
            </div>

            {/* 4. 총 금액 및 예약하기 */}
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

      {/* 예약 완료 모달 - showSuccessModal이 true일 때만 표시 */}
      {showSuccessModal && (
        <ReservationSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          reservationInfo={{
            date: selectedDate || '',
            time: selectedTime || '',
            experienceName: selectedExperience?.name || '',
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