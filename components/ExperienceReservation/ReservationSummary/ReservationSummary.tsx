'use client';

import React from 'react';
import { Joy } from '../../../types/mockData';
import './ReservationSummary.css';

interface ReservationSummaryProps {
  selectedDate: string | null;
  selectedTime: string | null;
  selectedExperience: Joy | null;
  headCount: number;
  totalAmount: number;
  onReservationSubmit: () => void;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  selectedDate,
  selectedTime,
  selectedExperience,
  headCount,
  totalAmount,
  onReservationSubmit
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const hasAllRequiredInfo = selectedDate && selectedExperience && headCount > 0;
  const showSummary = selectedExperience && headCount > 0; 

  return (
    <div className="reservation-summary">
      <h3 className="reservation-summary-title">총 금액</h3>
      
      <div className="reservation-summary-content">
        {showSummary ? (
          <>
            <div className="reservation-summary-details">
              {selectedDate && (
                <div className="reservation-summary-item">
                  <span className="reservation-summary-label">예약 날짜</span>
                  <span className="reservation-summary-value">{formatDate(selectedDate)}</span>
                </div>
              )}
              
              <div className="reservation-summary-item">
                <span className="reservation-summary-label">체험 프로그램</span>
                <span className="reservation-summary-value">{selectedExperience!.name}</span>
              </div>
              
              <div className="reservation-summary-item">
                <span className="reservation-summary-label">인원수</span>
                <span className="reservation-summary-value">{headCount}명</span>
              </div>
              
              <div className="reservation-summary-item price">
                <span className="reservation-summary-label">체험비 (1인)</span>
                <span className="reservation-summary-value">{selectedExperience!.price.toLocaleString()}원</span>
              </div>
            </div>
            
            <div className="reservation-summary-total">
              <div className="reservation-total-calculation">
                <span className="reservation-total-label">총 금액</span>
                <span className="reservation-total-amount">{totalAmount.toLocaleString()}원</span>
              </div>
              <p className="reservation-total-note">
                {selectedExperience!.price.toLocaleString()}원 × {headCount}명 = {totalAmount.toLocaleString()}원
              </p>
            </div>
          </>
        ) : (
          <div className="reservation-summary-placeholder">
            <p>체험 프로그램을 선택하시면 총 금액이 표시됩니다.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className={`reservation-submit-btn ${!hasAllRequiredInfo ? 'disabled' : ''}`}
        onClick={onReservationSubmit}
        disabled={!hasAllRequiredInfo}
      >
        예약하기
      </button>
    </div>
  );
};

export default ReservationSummary;