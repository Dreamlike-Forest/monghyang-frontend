'use client';

import React from 'react';
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
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onCustomerInfoChange,
  error
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomerInfoChange('name', e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    // 전화번호 포맷팅 (010-1234-5678)
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    
    onCustomerInfoChange('phoneNumber', value);
  };

  const handleHeadCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 20) {
      onCustomerInfoChange('headCount', value);
    }
  };

  const incrementHeadCount = () => {
    if (customerInfo.headCount < 20) {
      onCustomerInfoChange('headCount', customerInfo.headCount + 1);
    }
  };

  const decrementHeadCount = () => {
    if (customerInfo.headCount > 1) {
      onCustomerInfoChange('headCount', customerInfo.headCount - 1);
    }
  };

  return (
    <div className="reservation-customer-info-form">
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
            max="20"
            className="reservation-head-count-number"
          />
          <button
            type="button"
            className="reservation-head-count-btn increase"
            onClick={incrementHeadCount}
            disabled={customerInfo.headCount >= 20}
          >
            +
          </button>
        </div>
        <p className="reservation-head-count-note">최소 1명, 최대 20명까지 예약 가능합니다.</p>
      </div>

      {error && <div className="reservation-form-error">{error}</div>}
    </div>
  );
};

export default CustomerInfoForm;