'use client';

import React from 'react';
import './ReservationSuccessModal.css';

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationInfo: {
    date: string;
    time: string;
    experienceName: string;
    customerName: string;
    headCount: number;
    totalAmount: number;
  };
}

const ReservationSuccessModal: React.FC<ReservationSuccessModalProps> = ({
  isOpen,
  onClose,
  reservationInfo
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const generateReservationNumber = (): string => {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `RE${timestamp}`;
  };

  const reservationNumber = generateReservationNumber();

  // 바깥쪽 클릭 완전 방지 - 모달이 닫히지 않음
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 바깥쪽 클릭해도 모달이 절대 닫히지 않음
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // ESC 키 방지 - 모달이 닫히지 않음
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        // ESC 키를 눌러도 모달이 닫히지 않음
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  return (
    <div 
      className="reservation-success-modal-overlay" 
      onClick={handleOverlayClick}
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="reservation-success-modal-content" 
        onClick={handleContentClick}
        style={{ 
          zIndex: 1000000,
          position: 'relative'
        }}
      >
        <div className="reservation-success-modal-header">
          <div className="reservation-success-icon">✓</div>
          <h2 className="reservation-success-title">예약이 완료되었습니다!</h2>
          <p className="reservation-success-subtitle">체험 예약이 성공적으로 접수되었습니다.</p>
        </div>

        <div className="reservation-success-details">
          <div className="reservation-success-detail-item">
            <span className="reservation-success-detail-label">예약번호</span>
            <span className="reservation-success-detail-value reservation-success-number">{reservationNumber}</span>
          </div>
          
          <div className="reservation-success-detail-item">
            <span className="reservation-success-detail-label">예약자</span>
            <span className="reservation-success-detail-value">{reservationInfo.customerName}</span>
          </div>
          
          <div className="reservation-success-detail-item">
            <span className="reservation-success-detail-label">체험일</span>
            <span className="reservation-success-detail-value">{formatDate(reservationInfo.date)}</span>
          </div>
          
          {reservationInfo.time && (
            <div className="reservation-success-detail-item">
              <span className="reservation-success-detail-label">체험 시간</span>
              <span className="reservation-success-detail-value">{reservationInfo.time}</span>
            </div>
          )}
          
          <div className="reservation-success-detail-item">
            <span className="reservation-success-detail-label">체험 프로그램</span>
            <span className="reservation-success-detail-value">{reservationInfo.experienceName}</span>
          </div>
          
          <div className="reservation-success-detail-item">
            <span className="reservation-success-detail-label">인원수</span>
            <span className="reservation-success-detail-value">{reservationInfo.headCount}명</span>
          </div>
          
          <div className="reservation-success-detail-item total">
            <span className="reservation-success-detail-label">총 금액</span>
            <span className="reservation-success-detail-value reservation-success-total-amount">{reservationInfo.totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="reservation-success-notice">
          <h4>안내사항</h4>
          <ul>
            <li>예약 확인 및 상세 안내는 등록하신 연락처로 연락드립니다.</li>
            <li>체험 당일 10분 전까지 체험장소에 도착해 주세요.</li>
            <li>예약 변경이나 취소는 체험일 3일 전까지 가능합니다.</li>
            <li>문의사항이 있으시면 양조장으로 직접 연락해 주세요.</li>
          </ul>
        </div>

        <div className="reservation-success-modal-actions">
          <button className="reservation-success-confirm-btn" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccessModal;