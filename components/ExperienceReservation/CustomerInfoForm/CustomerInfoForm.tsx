'use client';

import React, { useEffect } from 'react';
import './CustomerInfoForm.css';

interface CustomerInfo {
  name: string;
  phoneNumber: string;
  headCount: number;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (field: keyof CustomerInfo, value: string | number) => void;
  error?: string;
  maxHeadCount?: number;
  onlyHeadCount?: boolean;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onCustomerInfoChange,
  error,
  maxHeadCount = 20, // 기본값
  onlyHeadCount = false
}) => {
  // [핵심 기능] 시간대 변경 등으로 최대 인원이 줄어들면, 현재 입력값도 자동으로 줄여줌
  useEffect(() => {
    if (customerInfo.headCount > maxHeadCount) {
      // 0명(마감)인 경우 1로 두거나 0으로 둬야 하나, 상위에서 예약을 막으므로 여기선 maxHeadCount로 맞춤
      onCustomerInfoChange('headCount', maxHeadCount > 0 ? maxHeadCount : 1);
    }
  }, [maxHeadCount, customerInfo.headCount, onCustomerInfoChange]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomerInfoChange('name', e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) value = value;
    else if (value.length <= 7) value = `${value.slice(0, 3)}-${value.slice(3)}`;
    else value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    onCustomerInfoChange('phoneNumber', value);
  };

  const handleHeadCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= maxHeadCount) {
      onCustomerInfoChange('headCount', value);
    } else if (value > maxHeadCount) {
      onCustomerInfoChange('headCount', maxHeadCount);
    }
  };

  const incrementHeadCount = () => {
    if (customerInfo.headCount < maxHeadCount) {
      onCustomerInfoChange('headCount', customerInfo.headCount + 1);
    }
  };

  const decrementHeadCount = () => {
    if (customerInfo.headCount > 1) {
      onCustomerInfoChange('headCount', customerInfo.headCount - 1);
    }
  };

  return (
    <div className="reservation-customer-info-form" style={onlyHeadCount ? {border:'none', padding:0, boxShadow:'none'} : {}}>
      {!onlyHeadCount && (
        <>
          <div className="reservation-form-group">
            <label htmlFor="customerName" className="reservation-form-label">
              예약자 이름 <span className="reservation-form-required">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={customerInfo.name}
              onChange={handleNameChange}
              placeholder="예약자 이름을 입력하세요"
              className="reservation-form-input"
              maxLength={20}
            />
          </div>

          <div className="reservation-form-group">
            <label htmlFor="customerPhone" className="reservation-form-label">
              예약자 전화번호 <span className="reservation-form-required">*</span>
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={customerInfo.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              className="reservation-form-input"
              maxLength={13}
            />
          </div>
        </>
      )}

      <div className="reservation-form-group">
        <label htmlFor="headCount" className="reservation-form-label">
          인원수 <span className="reservation-form-required">*</span>
        </label>
        <div className="reservation-head-count-input">
          <button
            type="button"
            className="reservation-head-count-btn decrease"
            onClick={decrementHeadCount}
            disabled={customerInfo.headCount <= 1}
          >
            -
          </button>
          <input
            id="headCount"
            type="number"
            value={customerInfo.headCount}
            onChange={handleHeadCountChange}
            min="1"
            max={maxHeadCount}
            className="reservation-head-count-number"
          />
          <button
            type="button"
            className="reservation-head-count-btn increase"
            onClick={incrementHeadCount}
            // 최대 인원에 도달하거나 마감(0)이면 버튼 비활성화
            disabled={customerInfo.headCount >= maxHeadCount || maxHeadCount === 0}
          >
            +
          </button>
        </div>
        {!onlyHeadCount && (
          <p className="reservation-head-count-note">
            {maxHeadCount === 0 
              ? '선택하신 시간대는 예약이 마감되었습니다.'
              : `최소 1명, 최대 ${maxHeadCount}명까지 예약 가능합니다.`}
          </p>
        )}
      </div>

      {error && <div className="reservation-form-error">{error}</div>}
    </div>
  );
};

export default CustomerInfoForm;